export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hr' | 'candidate';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  cvFile: File;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'questions_ready' | 'interview_completed' | 'evaluated';
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  requirements: string[];
  description: string;
  experience: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScreeningResult {
  isMatch: boolean;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  expectedAnswer?: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  timeSpent: number; // in seconds
  submittedAt: Date;
}

export interface ScreeningSession {
  id: string;
  candidate: Candidate;
  jobDescription: JobDescription;
  cvFile?: File;
  result: ScreeningResult;
  status: 'pending' | 'cv_processing' | 'questions_generated' | 'interview_in_progress' | 'completed' | 'evaluated';
  createdAt: Date;
  updatedAt: Date;
  answers?: Answer[];
  finalScore?: number;
  recommendation?: string;
}

export type Status = "pending" | "in_progress" | "completed" | "failed" | "error";

export interface ProcessStep {
  id: string;
  name: string;
  status: Status;
  message: string;
  timestamp: Date;
  progress?: number;
}

export interface ProcessNode {
  id: string; // node identifier (same as runId)
  name: string; // human-readable name
  status: Status;
  message: string;
  timestamp: Date;
  runId: string;
  threadId?: string;
  steps: ProcessStep[];
  streamingTokens?: string;
  isExpanded?: boolean;
  error?: string;
  result?: any;
}

export interface Report {
  id: string;
  sessionId: string;
  type: 'cv_analysis' | 'interview_evaluation' | 'final_report';
  content: string;
  generatedAt: Date;
  downloadUrl?: string;
}

interface ScreeningContextType {
  sessions: ScreeningSession[];
  currentSession: ScreeningSession | null;
  processNodes: ProcessNode[];
  processSteps: ProcessStep[];
  reports: Report[];
  isLoading: boolean;
  createSession: (candidateData: any, jobDescription: any, cvFile?: File) => Promise<string>;
  updateSessionStatus: (sessionId: string, status: ScreeningSession['status']) => void;
  updateSessionWithExtractedData: (sessionId: string, extractedData: any) => void;
  addProcessStep: (step: ProcessStep) => void;
  updateProcessNode: (nodeId: string, updates: Partial<ProcessNode>) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  updateCandidateData: (sessionId: string, candidateData: any) => void;
  generateReport: (sessionId: string, type: Report['type']) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
}