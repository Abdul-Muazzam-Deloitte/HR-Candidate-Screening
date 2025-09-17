import { useScreening } from "../contexts/ScreeningContext";

const API_BASE_URL = "http://127.0.0.1:8000";
const WS_BASE_URL = "wss://127.0.0.1:8000";

export interface CVExtractionResult {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  summary?: string;
  node_name?: string;
  status?: string;
  message?: string;
  progress?: number;
  [key: string]: any;
}

export interface StreamingCallback {
  onProgress: (data: CVExtractionResult) => void;
  onComplete: (data: CVExtractionResult) => void;
  onError: (error: string) => void;
  onNodeEvent?: (event: any) => void;
  onStepEvent?: (event: any) => void;
  onTokenStream?: (event: any) => void;
  onCandidateDataUpdate?: (candidateData: any) => void;
}

export const apiService = {
  extractCVContents: async (file: File, handleWorkflowEvent: (event: any) => void ): Promise<void> => {
    try {
      // Convert file to base64 for payload
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Content = result.split(',')[1];
          resolve(base64Content);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Create WebSocket connection for streaming
      const wsUrl = `${WS_BASE_URL}/ws/run-screening`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ CopilotKit WebSocket connected");
        
        // Send screening request
        const payload = {
          run_id: "cv-screening-" + Date.now(),
          payload: {
            fileName: file.name,
            fileContent: fileContent
          }
        };
        
        ws.send(JSON.stringify(payload));
      };

      ws.onmessage = (event) => {
        try {

          let raw = event.data;
          if (raw.startsWith("data: ")) {
            raw = raw.slice(6); // strip "data: "
          }
          const data = JSON.parse(raw);

          handleWorkflowEvent(data);

        } catch (error) {
          console.error("Error parsing WebSocket message:", error);handleWorkflowEvent({
            type: 'RUN_ERROR',
            message: 'Failed to parse server response',
          });
        }
      };

      ws.onerror = (error) => {
        console.error("CopilotKit WebSocket error:", error);
        handleWorkflowEvent({
          type: 'RUN_ERROR',
          message: 'WebSocket connection failed',
        });
      };

      ws.onclose = (event) => {
        console.log("CopilotKit WebSocket closed:", event.code, event.reason);
        if (event.code !== 1000) {
           handleWorkflowEvent({
            type: 'RUN_ERROR',
            message: 'Connection closed unexpectedly',
          });
        }
      };

    } catch (error) {
      handleWorkflowEvent({
        type: 'RUN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initialize streaming',
      });
    }
  },

  // Create candidate with extracted CV data
  createCandidate: async (candidateData: {
    name: string;
    email: string;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Upload CV file to storage
  uploadCV: async (file: File, candidateId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);

    const response = await fetch(`${API_BASE_URL}/api/upload-cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Create screening session
  createScreeningSession: async (sessionData: {
    candidate_id: string;
    job_description_id: string;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/screening-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};