import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ScreeningSession, ProcessStep, Report, ProcessNode } from '../types';
import { apiService } from '../services/apiService';

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
  sessions: any[];
  currentSession: any;
  processNodes: ProcessNode[];
  reports: any[];
  createSession: (candidate: any, job: any, file: File) => Promise<string>;
  extractCVContents: (sessionId: string, cvFile: File) => Promise<void>;
  setCurrentSession: (session: any) => void;
  handleWorkflowEvent: (event: any) => void;
  resetCurrentSession: () => void;
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
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([]);
  const [currentSession, setCurrentSessionState] = useState<ScreeningSession>();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  function createNodeFromRunStarted(event: any): ProcessNode {
    return {
      id: event.runId,
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
    try {
      await apiService.extractCVContents(cvFile, handleWorkflowEvent);
    } finally {
      setIsProcessing(false);
    }
  };


  // --- Helper: reset workflow steps (new candidate etc.)
  const handleWorkflowEvent = (event: any) => {

    setProcessNodes(prevNodes => {
      switch (event.type) {
        case "RUN_STARTED": {
          const newNode = createNodeFromRunStarted(event);
          return [...prevNodes, newNode];
        }

        case "RUN_FINISHED": {
          if (event.runId === 'document_extraction' && event.result) {
            updateCandidateFromExtraction(event.result);
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

  const updateCandidateFromExtraction = (extractedData: any) => {

    if (!currentSession) return;
   
    // Update the current session's candidate with extracted data
    const updatedCandidate = {
      ...currentSession.candidate,
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

    console.log('Updated candidate:', updatedCandidate);
    
    // Update sessions array
    setSessions(prev => prev.map(session => 
      session.id === currentSession.id 
        ? { ...session, candidate: updatedCandidate, updatedAt: new Date() }
        : session
    ));
    
    // Update current session
    setCurrentSessionState(prev => prev ? { 
      ...prev, 
      candidate: updatedCandidate, 
      updatedAt: new Date() 
    } : undefined);
  };

  const createSession = async (candidateData: any, jobDescription: any, cvFile?: File): Promise<string> => {
    setIsLoading(true);
    
    const newSession: ScreeningSession = {
      id: Date.now().toString(),
      candidate: { ...candidateData, cvFile },
      jobDescription,
      cvFile,
      result: {
        isMatch: false,
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        summary: '',
      },
      status: 'cv_processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionState(newSession);
    setProcessNodes([]);
    setIsLoading(false);

    return newSession.id;
  };

  const generateQuestionsFromData = (questionsData: any) => {
    if (!questionsData || !questionsData.interview_questions) {
      return [];
    }

    const questions = [];
    const { technical_questions, behavioral_questions, experience_questions } = questionsData.interview_questions;

    // Add technical questions
    if (technical_questions) {
      technical_questions.slice(0, 3).forEach((q: string, index: number) => {
        questions.push({
          id: `tech-${index + 1}`,
          question: q,
          type: 'technical' as const,
          difficulty: 'medium' as const,
          timeLimit: 10,
          expectedAnswer: 'Look for specific technical knowledge and problem-solving approach.'
        });
      });
    }

    // Add behavioral questions
    if (behavioral_questions) {
      behavioral_questions.slice(0, 2).forEach((q: string, index: number) => {
        questions.push({
          id: `behavioral-${index + 1}`,
          question: q,
          type: 'behavioral' as const,
          difficulty: 'medium' as const,
          timeLimit: 8,
          expectedAnswer: 'Assess soft skills, leadership, and team collaboration.'
        });
      });
    }

    // Add experience questions
    if (experience_questions) {
      experience_questions.slice(0, 2).forEach((q: string, index: number) => {
        questions.push({
          id: `experience-${index + 1}`,
          question: q,
          type: 'situational' as const,
          difficulty: 'medium' as const,
          timeLimit: 12,
          expectedAnswer: 'Evaluate relevant experience and practical application.'
        });
      });
    }

    return questions;
  };

  const updateSessionStatus = (sessionId: string, status: ScreeningSession['status']) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status, updatedAt: new Date() }
        : session
    ));
    
    if (currentSession?.id === sessionId) {
      setCurrentSessionState(prev => prev ? { ...prev, status, updatedAt: new Date() } : undefined);
    }
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

  const setCurrentSession = (sessionId: string) => {
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      setCurrentSessionState(session);
    }
  };

  const resetCurrentSession = () => {
      setCurrentSessionState(undefined);
  };

  const value: ScreeningContextType = {
    sessions,
    createSession,
    processNodes,
    handleWorkflowEvent,
    extractCVContents,
    currentSession,
    reports,
    setCurrentSession,
    resetCurrentSession
  };

  return (
    <ScreeningContext.Provider value={value}>
      {children}
    </ScreeningContext.Provider>
  );
};