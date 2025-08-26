export interface LangGraphNode {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: any;
  error?: string;
}

export interface ProcessState {
  nodes: LangGraphNode[];
  currentNodeId?: string;
  isRunning: boolean;
  startTime?: string;
  endTime?: string;
}

export interface SSEMessage {
  type: 'RUN_STARTED' | 'RUN_FINISHED' | 'RUN_ERROR' | 'STEP_STARTED' | 'STEP_FINISHED' | 'TEXT_MESSAGE_START' | 'TEXT_MESSAGE_CONTENT' | 'TEXT_MESSAGE_END';
  thread_id?: string;
  run_id?: string;
  result?: any;
  error?: string;
}