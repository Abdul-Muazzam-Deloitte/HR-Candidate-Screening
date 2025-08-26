import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { LangGraphNode, ProcessState, SSEMessage } from '../types/langgraph';
import { useWebSocket } from '../hooks/useWebSocket';

interface ProcessTrackerProps {
  candidateId?: string;
  initialNodes?: LangGraphNode[];
  websocketUrl?: string;
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({ 
  candidateId, 
  initialNodes = [],
  websocketUrl = 'ws://localhost:8000/ws/langgraph'
}) => {
  const [processState, setProcessState] = useState<ProcessState>({
    nodes: initialNodes.length > 0 ? initialNodes : [
      {
        id: 'resume_analysis',
        name: 'Resume Analysis',
        description: 'Analyzing candidate resume and extracting key information',
        status: 'pending'
      },
      {
        id: 'skill_assessment',
        name: 'Skill Assessment',
        description: 'Evaluating technical skills and competencies',
        status: 'pending'
      },
      {
        id: 'experience_matching',
        name: 'Experience Matching',
        description: 'Matching candidate experience with job requirements',
        status: 'pending'
      },
      {
        id: 'cultural_fit',
        name: 'Cultural Fit Analysis',
        description: 'Assessing cultural alignment and soft skills',
        status: 'pending'
      },
      {
        id: 'final_scoring',
        name: 'Final Scoring',
        description: 'Generating comprehensive candidate score and recommendations',
        status: 'pending'
      }
    ],
    isRunning: false
  });

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const handleWebSocketMessage = (message: SSEMessage) => {
    setProcessState(prev => {
      const newNodes = [...prev.nodes];
      
      switch (message.type) {
        case 'RUN_STARTED':
          // Handle RUN_STARTED for individual nodes
          if (message.thread_id) {
            const nodeIndex = newNodes.findIndex(n => n.id === message.thread_id);
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                status: 'running',
                startTime: new Date().toISOString()
              };
            }
            return {
              ...prev,
              nodes: newNodes,
              isRunning: true,
              currentNodeId: message.thread_id,
              startTime: prev.startTime || new Date().toISOString()
            };
          } else {
            // Global process start if no thread_id
            return {
              ...prev,
              isRunning: true,
              startTime: new Date().toISOString(),
              currentNodeId: undefined
            };
          }
          
        case 'STEP_STARTED':
          if (message.thread_id) {
            const nodeIndex = newNodes.findIndex(n => n.id === message.thread_id);
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                status: 'running',
                startTime: new Date().toISOString()
              };
            }
          }
          return {
            ...prev,
            nodes: newNodes,
            currentNodeId: message.thread_id
          };
          
        case 'RUN_FINISHED':
        case 'STEP_FINISHED':
          if (message.thread_id) {
            const nodeIndex = newNodes.findIndex(n => n.id === message.thread_id);
            if (nodeIndex !== -1) {
              const node = newNodes[nodeIndex];
              const duration = node.startTime 
                ? new Date().getTime() - new Date(node.startTime).getTime()
                : 0;
                
              newNodes[nodeIndex] = {
                ...node,
                status: 'completed',
                endTime: new Date().toISOString(),
                duration,
                output: message.result
              };
            }
            
            // Check if all nodes are completed
            const allCompleted = newNodes.every(n => n.status === 'completed' || n.status === 'error');
            
            return {
              ...prev,
              nodes: newNodes,
              isRunning: !allCompleted,
              endTime: allCompleted ? new Date().toISOString() : prev.endTime,
              currentNodeId: undefined
            };
          } else if (message.type === 'RUN_FINISHED') {
            // Global process finish
            return {
              ...prev,
              isRunning: false,
              endTime: new Date().toISOString(),
              currentNodeId: undefined
            };
          }
          return {
            ...prev,
            nodes: newNodes,
            currentNodeId: undefined
          };
          
        case 'RUN_ERROR':
          if (message.thread_id) {
            const nodeIndex = newNodes.findIndex(n => n.id === message.thread_id);
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                status: 'error',
                endTime: new Date().toISOString(),
                error: message.error
              };
            }
          }
          return {
            ...prev,
            nodes: newNodes,
            isRunning: false
          };
          
        case 'TEXT_MESSAGE_START':
        case 'TEXT_MESSAGE_CONTENT':
        case 'TEXT_MESSAGE_END':
          // Handle text message events if needed for UI updates
          // For now, we'll just log them
          console.log(`Text message event: ${message.type}`, message);
          return prev;
          
        default:
          console.log('Unknown message type:', message.type);
          return prev;
      }
    });
  };

  const { isConnected, error: wsError } = 
    ({
    url: websocketUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => console.log('Connected to LangGraph WebSocket'),
    onClose: () => console.log('Disconnected from LangGraph WebSocket'),
    onError: (error) => console.error('WebSocket error:', error)
  });

  const toggleCardExpansion = (nodeId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: LangGraphNode['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'running':
        return <Zap className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: LangGraphNode['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200 bg-gray-50';
      case 'running':
        return 'border-blue-200 bg-blue-50 shadow-lg transform scale-[1.02]';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const seconds = Math.floor(duration / 1000);
    return `${seconds}s`;
  };

  const completedNodes = processState.nodes.filter(n => n.status === 'completed').length;
  const totalNodes = processState.nodes.length;
  const progressPercentage = (completedNodes / totalNodes) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Process Tracker</h2>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {processState.isRunning && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Play className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedNodes}/{totalNodes} nodes completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {wsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">WebSocket Error: {wsError}</p>
          </div>
        )}
      </div>

      {/* Process Nodes */}
      <div className="space-y-4">
        {processState.nodes.map((node, index) => (
          <div
            key={node.id}
            className={`bg-white rounded-lg border-2 transition-all duration-300 ${getStatusColor(node.status)}`}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleCardExpansion(node.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    {getStatusIcon(node.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                    <p className="text-gray-600 text-sm">{node.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {node.duration && (
                    <span className="text-sm text-gray-500 font-medium">
                      {formatDuration(node.duration)}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    node.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                    node.status === 'running' ? 'bg-blue-100 text-blue-600' :
                    node.status === 'completed' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                  </span>
                  {expandedCards.has(node.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedCards.has(node.id) && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Execution Details</h4>
                    <div className="space-y-2 text-sm">
                      {node.startTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Time:</span>
                          <span className="text-gray-900">
                            {new Date(node.startTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {node.endTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Time:</span>
                          <span className="text-gray-900">
                            {new Date(node.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {node.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="text-gray-900">{formatDuration(node.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(node.output || node.error) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {node.error ? 'Error Details' : 'Output'}
                      </h4>
                      <div className={`p-3 rounded-lg text-sm font-mono ${
                        node.error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <pre className="whitespace-pre-wrap">
                          {node.error || JSON.stringify(node.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};