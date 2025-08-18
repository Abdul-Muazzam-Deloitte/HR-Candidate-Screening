import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/react-core";

const API_BASE_URL = "http://asus-hunger-gore-grande.trycloudflare.com";
const WS_BASE_URL = "wss://asus-hunger-gore-grande.trycloudflare.com";

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
}

export const apiService = {
  // Extract CV contents using CopilotKit streaming
  extractCVContents: async (file: File, callbacks: StreamingCallback): Promise<void> => {
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
          const data = JSON.parse(event.data);
          console.log("CopilotKit event:", data);

          // Handle different event types
          if (data.type === "STEP_STARTED") {
            callbacks.onProgress({
              node_name: data.step || 'workflow',
              status: 'started',
              message: `${data.step || 'Step'} started`,
              timestamp: new Date().toISOString()
            });
          } 
          else if (data.type === "TEXT_MESSAGE_CONTENT") {
            // Parse streaming content for node status updates
            try {
              const nodeData = JSON.parse(data.content || data.delta || '{}');
              
              if (nodeData.type === 'node_status' && nodeData.node && nodeData.status) {
                callbacks.onProgress({
                  node_name: nodeData.node,
                  status: nodeData.status,
                  message: nodeData.message || `${nodeData.node} ${nodeData.status}`,
                  progress: nodeData.progress,
                  timestamp: nodeData.timestamp || new Date().toISOString()
                });
              } else {
                // Handle node completion updates
                const nodeNames = Object.keys(nodeData).filter(key => 
                  !['type', 'status', 'error', 'message', 'timestamp', 'progress', 'node'].includes(key)
                );
                
                for (const nodeName of nodeNames) {
                  if (nodeName && nodeData[nodeName]) {
                    callbacks.onProgress({
                      node_name: nodeName,
                      status: 'completed',
                      message: `${nodeName.replace(/_/g, ' ')} completed successfully`,
                      progress: 100,
                      timestamp: new Date().toISOString(),
                      ...nodeData[nodeName]
                    });
                  }
                }
              }
            } catch (parseError) {
              // If not JSON, treat as regular progress message
              callbacks.onProgress({
                node_name: 'workflow',
                status: 'in_progress',
                message: data.content || data.delta || 'Processing...',
                timestamp: new Date().toISOString()
              });
            }
          }
          else if (data.type === "STEP_FINISHED") {
            callbacks.onProgress({
              node_name: data.step || 'workflow',
              status: 'completed',
              message: `${data.step || 'Step'} completed`,
              progress: 100,
              timestamp: new Date().toISOString()
            });
          }
          else if (data.type === "RUN_FINISHED") {
            // Parse final result
            try {
              const finalData = data.data || {};
              const processedData = {
                name: finalData.cv_data?.name || 'Unknown Candidate',
                email: finalData.cv_data?.email || 'No email provided',
                skills: finalData.cv_data?.skills || [],
                experience: finalData.cv_data?.experience || [],
                score: finalData.candidate_final_score?.cv_assessment?.technical_skills?.score ? 
                  finalData.candidate_final_score.cv_assessment.technical_skills.score * 20 : 0,
                recommendation: finalData.candidate_final_score?.final_recommendation || 'No recommendation',
                questions: finalData.interview_questions || {}
              };
              callbacks.onComplete(processedData);
            } catch (error) {
              callbacks.onComplete({
                name: 'Unknown Candidate',
                email: 'No email provided',
                skills: [],
                experience: [],
                score: 0,
                recommendation: 'Workflow completed',
                questions: {}
              });
            }
          }
          else if (data.type === "RUN_ERROR") {
            callbacks.onError(data.error || "Unknown error occurred");
          }
          // Handle direct node status messages
          else if (data.type === "node_status") {
            callbacks.onProgress({
              node_name: data.node,
              status: data.status,
              message: data.message || `${data.node} ${data.status}`,
              progress: data.progress,
              timestamp: data.timestamp || new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          callbacks.onError("Failed to parse server response");
        }
      };

      ws.onerror = (error) => {
        console.error("CopilotKit WebSocket error:", error);
        callbacks.onError("WebSocket connection failed");
      };

      ws.onclose = (event) => {
        console.log("CopilotKit WebSocket closed:", event.code, event.reason);
        if (event.code !== 1000) {
          callbacks.onError("Connection closed unexpectedly");
        }
      };

    } catch (error) {
      callbacks.onError(error instanceof Error ? error.message : 'Failed to initialize CopilotKit client');
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