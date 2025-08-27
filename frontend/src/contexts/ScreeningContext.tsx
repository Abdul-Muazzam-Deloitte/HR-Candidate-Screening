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
  const [sessions, setSessions] = useState<ScreeningSession[]>([
    // Dummy session for candidate with questions ready
    {
      id: 'dummy-session-1',
      candidate: {
        id: 'candidate-1',
        name: 'John Doe',
        email: 'candidate@email.com',
        uploadedAt: new Date('2024-01-15'),
        status: 'questions_ready'
      },
      jobDescription: {
        id: 'job-1',
        title: 'Senior React Developer',
        department: 'Engineering',
        description: 'We are looking for a Senior React Developer to join our frontend team.',
        experience: 'Senior Level (5-8 years)',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of React development experience',
          'Strong understanding of JavaScript and TypeScript'
        ],
        skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      result: {
        isMatch: true,
        score: 85,
        matchedSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js'],
        missingSkills: ['AWS', 'Docker'],
        summary: 'Strong candidate with 85% skill match. Demonstrates relevant experience and technical capabilities.',
        questions: [
          {
            id: 'q1',
            question: 'Can you describe your experience with React and how you\'ve used it in previous projects?',
            type: 'technical',
            difficulty: 'medium',
            timeLimit: 10,
            expectedAnswer: 'Look for specific examples, project details, and problem-solving approach.'
          },
          {
            id: 'q2',
            question: 'Tell me about a challenging project you worked on and how you overcame the obstacles.',
            type: 'behavioral',
            difficulty: 'medium',
            timeLimit: 8,
            expectedAnswer: 'Assess problem-solving skills, resilience, and learning ability.'
          },
          {
            id: 'q3',
            question: 'How would you approach building a scalable React application?',
            type: 'situational',
            difficulty: 'hard',
            timeLimit: 15,
            expectedAnswer: 'Evaluate architectural thinking, scalability concepts, and best practices.'
          }
        ]
      },
      status: 'questions_generated',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    // Dummy session for HR with completed interview
    {
      id: 'dummy-session-2',
      candidate: {
        id: 'candidate-2',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        cvFile: new File([''], 'jane-smith-cv.pdf'),
        uploadedAt: new Date('2024-01-10'),
        status: 'interview_completed'
      },
      jobDescription: {
        id: 'job-2',
        title: 'Full Stack Developer',
        department: 'Engineering',
        description: 'Join our team as a Full Stack Developer working on cutting-edge web applications.',
        experience: 'Mid Level (2-5 years)',
        requirements: [
          'Bachelor\'s degree in Computer Science',
          '3+ years of full stack development experience',
          'Experience with both frontend and backend technologies'
        ],
        skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      result: {
        isMatch: true,
        score: 78,
        matchedSkills: ['React', 'Node.js', 'Python'],
        missingSkills: ['AWS', 'Docker'],
        summary: 'Good candidate with 78% skill match. Shows potential for growth in missing areas.'
      },
      status: 'completed',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    },
    // Dummy session in progress
    {
      id: 'dummy-session-3',
      candidate: {
        id: 'candidate-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        cvFile: new File([''], 'mike-johnson-cv.pdf'),
        uploadedAt: new Date('2024-01-18'),
        status: 'processing'
      },
      jobDescription: {
        id: 'job-1',
        title: 'Senior React Developer',
        department: 'Engineering',
        description: 'We are looking for a Senior React Developer to join our frontend team.',
        experience: 'Senior Level (5-8 years)',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of React development experience',
          'Strong understanding of JavaScript and TypeScript'
        ],
        skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      result: {
        isMatch: false,
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        summary: ''
      },
      status: 'cv_processing',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    }
  ]);
  
  const [processNodes, setProcessNodes] = useState<ProcessNode[]>([
    // {
    //   id: 'document_extraction',
    //   name: 'Document Extraction',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'cv_scoring',
    //   name: 'CV Scoring',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'social_media_scoring',
    //   name: 'Social Media Scoring',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'final_candidate_assessment',
    //   name: 'Final Candidate Assessment',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'send_candidate_report',
    //   name: 'Send Candidate Report',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'generate_interview_questions',
    //   name: 'Generate Interview Questions',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'evaluate_interview_answers',
    //   name: 'Evaluate Interview Answers',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // },
    // {
    //   id: 'send_final_scoring',
    //   name: 'Send Final Scoring',
    //   status: 'pending',
    //   steps: [],
    //   isExpanded: false,
    //   streamingContent: '',
    //   isStreaming: false
    // }
  ]);
  const [currentSession, setCurrentSessionState] = useState<ScreeningSession | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle CV extraction process
  // useEffect(() => {
  //   const handleCVExtraction = (session: ScreeningSession, cvFile: File) => {
  //     // Add initial steps
  //     addProcessStep({
  //       id: `step-upload-${Date.now()}`,
  //       name: 'CV Upload',
  //       status: 'completed',
  //       message: 'CV file uploaded successfully',
  //       timestamp: new Date(),
  //       progress: 100,
  //     });

  //     // Start streaming CV extraction
  //     const startStreaming = async () => {
  //       try {
  //         const { apiService } = await import('../services/apiService');
          
  //         await apiService.extractCVContents(cvFile, {
  //           onProgress: (data) => {
  //             // Handle streaming updates from CopilotKit workflow nodes
  //             handleStreamingUpdate(data);
  //           },
  //           onComplete: (data) => {
  //             // Handle final completion
  //             updateSessionWithExtractedData(session.id, data);
  //             updateSessionStatus(session.id, 'questions_generated');
  //           },
  //           onError: (error) => {
  //             console.error('CV extraction failed:', error);
  //             // Mark current step as failed
  //             setProcessSteps(prev => prev.map(step => {
  //               if (step.status === 'in_progress') {
  //                 return { ...step, status: 'failed' as const, message: `Failed: ${error}` };
  //               }
  //               return step;
  //             }));
              
  //             // Continue with basic processing
  //             setTimeout(() => {
  //               updateSessionStatus(session.id, 'questions_generated');
  //             }, 1000);
  //           }
  //         });
  //       } catch (error) {
  //         console.error('Failed to start CopilotKit streaming:', error);
  //       }
  //     };

  //     startStreaming();
  //   };

  //   const handleStreamingUpdate = (data: any) => {
  //     // Handle node status updates
  //     if (data.node_name && data.status) {
  //       const nodeToStepMapping: Record<string, string> = {
  //         'document_extraction': 'Document Extraction',
  //         'landingai_extraction': 'CV Data Extraction',
  //         'cv_scoring': 'CV Analysis',
  //         'social_media_screening': 'Social Media Screening',
  //         'candidate_assessment_score': 'Final Assessment',
  //         'send_candidate_report': 'Report Generation',
  //         'interview_questions': 'Question Generation',
  //         'workflow': 'Workflow Processing',
  //       };

  //       const stepName = nodeToStepMapping[data.node_name] || data.node_name;
  //       const stepId = `step-${data.node_name}-${Date.now()}`;
        
  //       setProcessSteps(prev => {
  //         const existingStepIndex = prev.findIndex(step => step.name === stepName);
          
  //         if (existingStepIndex >= 0) {
  //           // Update existing step
  //           return prev.map((step, index) => {
  //             if (index === existingStepIndex) {
  //               return {
  //                 ...step,
  //                 status: data.status === 'started' ? 'in_progress' as const :
  //                         data.status === 'in_progress' ? 'in_progress' as const :
  //                         data.status === 'completed' ? 'completed' as const :
  //                         data.status === 'failed' ? 'failed' as const : step.status,
  //                 message: data.message || step.message,
  //                 progress: data.progress,
  //                 timestamp: new Date(data.timestamp || Date.now()),
  //                 runId: data.runId,
  //                 threadId: data.threadId
  //               };
  //             }
  //             return step;
  //           });
  //         } else {
  //           // Add new step
  //           return [...prev, {
  //             id: stepId,
  //             name: stepName,
  //             status: data.status === 'started' ? 'in_progress' as const :
  //                     data.status === 'in_progress' ? 'in_progress' as const :
  //                     data.status === 'completed' ? 'completed' as const :
  //                     data.status === 'failed' ? 'failed' as const : 'pending' as const,
  //             message: data.message || `Processing ${stepName}...`,
  //             timestamp: new Date(data.timestamp || Date.now()),
  //             progress: data.progress,
  //             runId: data.runId,
  //             threadId: data.threadId
  //           }];
  //         }
  //       });
  //       return;
  //     }

  //     // Map LangGraph node updates to process steps
  //     const nodeToStepMapping: Record<string, { name: string; message: string }> = {
  //       'text_extraction': { name: 'Text Extraction', message: 'Extracting text from CV...' },
  //       'skills_analysis': { name: 'Skills Analysis', message: 'Analyzing candidate skills...' },
  //       'job_matching': { name: 'Job Matching', message: 'Matching against job requirements...' },
  //       'question_generation': { name: 'Question Generation', message: 'Generating interview questions...' },
  //     };

  //     // Extract node information from the streaming data
  //     const nodeName = data.node_name || Object.keys(data)[0];
  //     const stepInfo = nodeToStepMapping[nodeName];
      
  //     if (stepInfo) {
  //       const stepId = `step-${nodeName}-${Date.now()}`;
        
  //       // Check if step already exists
  //       setProcessSteps(prev => {
  //         const existingStepIndex = prev.findIndex(step => step.name === stepInfo.name);
          
  //         if (existingStepIndex >= 0) {
  //           // Update existing step
  //           return prev.map((step, index) => {
  //             if (index === existingStepIndex) {
  //               return {
  //                 ...step,
  //                 status: data.status === 'completed' ? 'completed' as const : 'in_progress' as const,
  //                 message: data.message || stepInfo.message,
  //                 progress: data.progress || (data.status === 'completed' ? 100 : undefined),
  //                 timestamp: new Date()
  //               };
  //             }
  //             return step;
  //           });
  //         } else {
  //           // Add new step
  //           return [...prev, {
  //             id: stepId,
  //             name: stepInfo.name,
  //             status: data.status === 'completed' ? 'completed' as const : 'in_progress' as const,
  //             message: data.message || stepInfo.message,
  //             timestamp: new Date(),
  //             progress: data.progress || (data.status === 'completed' ? 100 : undefined),
  //           }];
  //         }
  //       });
  //     }
  //   };

  //   if (currentSession && currentSession.status === 'cv_processing' && currentSession.cvFile) {
  //     handleCVExtraction(currentSession, currentSession.cvFile);
  //   }
  // }, [currentSession?.status, currentSession?.cvFile]);

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
      // resultData: typeof event.result === "object" ? event.result : undefined,
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

  const updateSessionWithExtractedData = (sessionId: string, extractedData: any) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const updatedCandidate = {
          ...session.candidate,
          name: extractedData.name || session.candidate.name,
          email: extractedData.email || session.candidate.email,
        };
        
        // Create result based on extracted data
        const mockResult = {
          isMatch: true,
          score: Math.max(extractedData.score * 20, 75), // Convert 1-5 scale to percentage
          matchedSkills: extractedData.skills?.slice(0, 6) || ['C#', '.NET', 'Angular', 'Azure', 'PL/SQL', 'Leadership'],
          missingSkills: ['React', 'Node.js', 'Python'],
          summary: extractedData.recommendation || 'Candidate assessment completed successfully.',
          questions: generateQuestionsFromData(extractedData.questions)
        };
        
        return {
          ...session,
          candidate: updatedCandidate,
          result: mockResult,
          updatedAt: new Date()
        };
      }
      return session;
    }));
    
    if (currentSession?.id === sessionId) {
      setCurrentSessionState(prev => {
        if (!prev) return null;
        const updatedCandidate = {
          ...prev.candidate,
          name: extractedData.name || prev.candidate.name,
          email: extractedData.email || prev.candidate.email,
        };
        return { ...prev, candidate: updatedCandidate, updatedAt: new Date() };
      });
    }
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
      setCurrentSessionState(prev => prev ? { ...prev, status, updatedAt: new Date() } : null);
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

  const setCurrentSession = (sessionId: string | null) => {
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      setCurrentSessionState(session || null);
    } else {
      setCurrentSessionState(null);
    }
  };

  // const value: ScreeningContextType = {
  //   sessions,
  //   currentSession,
  //   processNodes,
  //   reports,
  //   isLoading,
  //   createSession,
  //   updateSessionStatus,
  //   addProcessStep,
  //   setCurrentSession,
  //   startCVExtraction
  // };

    const value: ScreeningContextType = {
      sessions,
      createSession,
      processNodes,
      handleWorkflowEvent,
      extractCVContents,
      currentSession,
      reports,
      setCurrentSession,
    };

  return (
    <ScreeningContext.Provider value={value}>
      {children}
    </ScreeningContext.Provider>
  );
};