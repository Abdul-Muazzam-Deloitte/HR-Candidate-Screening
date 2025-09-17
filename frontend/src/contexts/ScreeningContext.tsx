import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ScreeningSession, ProcessStep, Report, ProcessNode, JobDescription, Question } from '../types';
import { apiService } from '../services/apiService';
import { useParams } from 'react-router-dom';

// interface ScreeningContextType {
//   sessions: ScreeningSession[];
//   currentSession: ScreeningSession | null;
//   processNodes: ProcessNode[];
//   reports: Report[];
//   createSession: (candidateData: any, jobDescription: any, cvFile?: File) => Promise<string>;
//   updateSessionStatus: (sessionId: string, status: ScreeningSession['status']) => void;
//   addProcessStep: (step: ProcessStep) => void;
//   generateReport: (sessionId: string, type: Report['type']) => Promise<void>;
//   setCurrentSession: (sessionId: string | null) => void;
//   startCVExtraction: (sessionId: string, cvFile: File) => Promise<void>;
// }

interface ScreeningContextType {
  sessions: ScreeningSession[];
  // currentSession?: ScreeningSession;
  processNodes: ProcessNode[];
  reports: any[];
  createSession: (candidate: any, file: File) => Promise<ScreeningSession>;
  updateSession: (sessionId: string, updatedFields: Partial<ScreeningSession>) => void;
  updateSessionStatus: (sessionId: string, status: ScreeningSession['status']) => void;
  extractCVContents: (sessionId: string, cvFile: File) => Promise<void>;
  // setCurrentSession: (session: any) => void;
  handleWorkflowEvent: (sessionId: string, event: any) => void;
  // resetCurrentSession: () => void;
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export const useScreening = () => {
  const context = useContext(ScreeningContext);
  if (context === undefined) {
    throw new Error('useScreening must be used within a ScreeningProvider');
  }
  return context;
};


interface ScreeningProviderProps {
  children: ReactNode;
}

export const ScreeningProvider: React.FC<ScreeningProviderProps> = ({ children }) => {


  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([]);
  // const [currentSession, setCurrentSessionState] = useState<ScreeningSession>();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

   const updateSession = (sessionId: string, updatedFields: Partial<ScreeningSession>) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...updatedFields, updatedAt: new Date() } : s))
    );
    // if (currentSession?.id === sessionId) {
    //   setCurrentSessionState(prev => (prev ? { ...prev, ...updatedFields, updatedAt: new Date() } : undefined));
    // }
  };
  

  function createNodeFromRunStarted(sessionId: string, event: any): ProcessNode {
    return {
      id: event.runId,
      sessionId: sessionId,
      name: `${event.threadId}`,
      status: "in_progress",
      message: `Executing ${event.threadId}...`,
      timestamp: new Date(event.timestamp || Date.now()),
      runId: event.runId,
      threadId: event.threadId,
      steps: [],
      isExpanded: true,
    };
  }

  function updateNodeFromRunFinished(node: ProcessNode, event: any): ProcessNode {
    return {
      ...node,
      status: "completed" ,
      message: `${event.threadId} executed successfully`,
      timestamp: new Date(event.timestamp || Date.now()),
      result: typeof event.result === "object" ? event.result : undefined,
      error: event.status === "failed" ? event.error : undefined,
    };
  }

  function createStepFromStepStarted(event: any): ProcessStep {
    const nodeName = (event.stepName || "").split(" - ");
    (event.stepName || "").split(" - ")
    return {
      id: `step ${nodeName[0]} - ${nodeName[1]}`,
      name: event.stepName,
      status: "in_progress",
      message: `Running ${event.stepName}...`,
      timestamp: new Date(event.timestamp || Date.now()),
    };
  }

  function updateStepFromStepFinished(step: ProcessStep, event: any): ProcessStep {
    return {
      ...step,
      status:  "completed" ,
      message: event.stepName,
      timestamp: new Date(event.timestamp || Date.now()),
    };
  }

  function startTextMessage(node: ProcessNode): ProcessNode {
    return { ...node, streamingTokens: "", status: "in_progress", };
  }

  function appendTextMessage(node: ProcessNode, event: any): ProcessNode {
    
    return { ...node, streamingTokens: (node.streamingTokens || "") + event.delta };
  }

  function endTextMessage(node: ProcessNode): ProcessNode {
    return {            
      ...node,
      result: node.streamingTokens, // move final content to result
      status: "completed", };
  }

  function updateNodeOnError(node: ProcessNode, message: any): ProcessNode {
  return {
    ...node,
    status: "error", // mark node as error
    message: "An error occurred during the node run",
    timestamp: new Date(Date.now()),
    error: message || "Unknown error",
  };
}

    // Extract CV contents using API
  const extractCVContents = async (sessionId: string, cvFile: File) => {
    setIsProcessing(true);
    setSessionId(sessionId)
    try {
      await apiService.extractCVContents(cvFile, (event: any) => handleWorkflowEvent(sessionId, event));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    console.log("Process nodes updated:", processNodes);
    console.log(sessionId)
         setSessions(prev => prev.map(session =>
    session.id === sessionId
      ? {
          ...session,
          processNodes: processNodes,
          updatedAt: new Date(),
        }
      : session
  ));

  }, [processNodes]);


  // --- Helper: reset workflow steps (new candidate etc.)
  const handleWorkflowEvent = (sessionId: string, event: any) => {

    setProcessNodes(prevNodes => {
      switch (event.type) {
        case "RUN_STARTED": {
          const newNode = createNodeFromRunStarted(sessionId,event);

          updateSessionStatus(sessionId,event.runId);
          return [...prevNodes, newNode];
        }

        case "RUN_FINISHED": {
          if (event.runId === 'document_extraction' && event.result) {
            updateCandidateFromExtraction(sessionId, event.result);
          }

          if (event.runId === 'job_posting_determination' && event.result) {
            updateJobDescription(sessionId, event.result);
          }

          if (event.runId === 'question_generation' && event.result) {
            mapInterviewResponseToQuestions(sessionId, event.result);
          }
          
          return prevNodes.map(node =>
            node.runId === event.runId ? updateNodeFromRunFinished(node, event) : node
          );
        }

        case "STEP_STARTED": {
          const nodeName = (event.stepName || "").split(" - ");
          return prevNodes.map(node => {
            if (node.runId === nodeName[1]) {
              const newStep = createStepFromStepStarted(event);
              return { ...node, steps: [...node.steps, newStep] };
            }
            return node;
          });
        }

        case "STEP_FINISHED": {
          const nodeName = (event.stepName || "").split(" - ");
          return prevNodes.map(node => {
            if (node.runId === nodeName[1]) {
              return {
                ...node,
                steps: node.steps.map(step => 
                  step.id === `step ${nodeName[0]} - ${nodeName[1]}` ? updateStepFromStepFinished(step, event) : step
                ),
              };
            }
            return node;
          });
        }

      case "TEXT_MESSAGE_START":
        return prevNodes.map(node => 
          node.runId === event.messageId ? startTextMessage(node) : node);

      case "TEXT_MESSAGE_CONTENT":
        return prevNodes.map(node => 
          node.runId === event.messageId ? appendTextMessage(node, event): node);

      case "TEXT_MESSAGE_END":
        return prevNodes.map(node =>
          node.runId === event.messageId ? endTextMessage(node): node);

        case "RUN_ERROR": {
          const [nodeName, ...messageParts] = (event.message || "").split(" - ");
          const errorMessage = messageParts.join(" - ") || event.message;
          return prevNodes.map(node =>
            node.runId === nodeName ? updateNodeOnError(node, errorMessage) : node
          );
        }

        default:
          console.warn("Unknown workflow event:", event);
          return prevNodes;
      }
    });
  };

  const resetNodes = () => setProcessNodes([]);

  const updateCandidateFromExtraction = (sessionId: string , extractedData: any) => {  

    // Update the current session's candidate with extracted data
    const updatedCandidate = {
      name: extractedData.name,
      email: extractedData.email,
      phone: extractedData.phone,
      address: extractedData.address,
      summary: extractedData.summary,
      linkedinUrl: extractedData.linkedin_url,
      skills: extractedData.skills,
      experience: extractedData.experience,
      education: extractedData.education,
    };
    
    // Update sessions array
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            candidate: { 
              ...session.candidate, 
              ...updatedCandidate 
            }, 
            updatedAt: new Date() 
          }
        : session
    ));
    
  };

    const updateJobDescription = (sessionId: string , extractedData: any) => {  

    // Update the current session's candidate with extracted data
    const updatedJobDescription = {
      id: extractedData.id,
      title: extractedData.title,
      department: extractedData.department,
      description: extractedData.description,
      requirements: extractedData.requirements,
      experience: extractedData.experience,
      skills: extractedData.skills,
      createdAt: extractedData.createdAt,
      updatedAt: extractedData.updatedAt,
    };

    // Update sessions array
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            jobDescription: { 
              ...session.jobDescription, 
              ...updatedJobDescription 
            }, 
            updatedAt: new Date() 
          }
        : session
    ));
  };

  const createSession = async (candidateData: any, cvFile?: File): Promise<ScreeningSession> => {
    setIsLoading(true);
    
    const newSession: ScreeningSession = {
      id: Date.now().toString(),
      candidate: { ...candidateData, cvFile },
      cvFile,
      status: 'document_extraction',
      createdAt: new Date(),
      updatedAt: new Date(),
      processNodes: []
    };

    setSessions(prev => [...prev, newSession]);
    // setCurrentSessionState(newSession);
    setProcessNodes([]);
    setIsLoading(false);

    return newSession;
  };

const mapInterviewResponseToQuestions = (sessionId: string, backendResponse: any) => {
  if (!backendResponse) return [];

  const {
    technical_questions = [],
    behavioral_questions = [],
    experience_questions = [],
    situational_questions = [],
    cultural_fit_questions = [],
    red_flag_questions = [],
    areas_to_probe = [],
    interview_duration = "" 
  } = backendResponse;

  const questions: Question[] = [];

  const addQuestions = (arr: string[], type: Question['type'], prefix: string) => {
    arr.forEach((q, idx) => {
      questions.push({
        id: `${prefix}-${idx + 1}`,
        question: q,
        type,
        difficulty: 'medium'
      });
    });
  };

  addQuestions(technical_questions, 'technical', 'tech');
  addQuestions(behavioral_questions, 'behavioral', 'behavioral');
  addQuestions(experience_questions, 'experience', 'experience');
  addQuestions(situational_questions, 'situational', 'situational');
  addQuestions(cultural_fit_questions, 'cultural_fit', 'cultural');
  addQuestions(red_flag_questions, 'red_flag', 'redflag');
  addQuestions(areas_to_probe, 'probe', 'probe');

  // if (!currentSession) return questions;

  setSessions(prev => prev.map(session =>
    session.id === sessionId
      ? {
          ...session,
          questions: {
            ...session.questions,
            questions: questions,
            interview_duration: interview_duration,
          },
          updatedAt: new Date(),
        }
      : session
  ));

};

  const updateSessionStatus = (sessionId: string, status: ScreeningSession['status']) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status, updatedAt: new Date() }
        : session
    ));
    
  };

  const generateReport = async (sessionId: string, type: Report['type']) => {
    const newReport: Report = {
      id: Date.now().toString(),
      sessionId,
      type,
      content: `Mock ${type} report content for session ${sessionId}`,
      generatedAt: new Date(),
      downloadUrl: `/reports/${sessionId}-${type}.pdf`,
    };

    setReports(prev => [...prev, newReport]);
  };

  // const setCurrentSession = (sessionId: string) => {
  //   if (sessionId) {
  //     const session = sessions.find(s => s.id === sessionId);
  //     setCurrentSessionState(session);
  //   }
  // };

  // const resetCurrentSession = () => {
  //     setCurrentSessionState(undefined);
  // };

  const value: ScreeningContextType = {
    sessions,
    createSession,
    processNodes,
    handleWorkflowEvent,
    extractCVContents,
    updateSessionStatus,
    // currentSession,
    updateSession,
    reports,
    // setCurrentSession,
    // resetCurrentSession
  };

  return (
    <ScreeningContext.Provider value={value}>
      {children}
    </ScreeningContext.Provider>
  );
};