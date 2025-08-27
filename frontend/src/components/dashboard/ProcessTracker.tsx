import React from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { ScreeningSession, ProcessNode } from '../../types';
import { useScreening } from '../../contexts/ScreeningContext';

interface ProcessTrackerProps {
  session: ScreeningSession;
  nodes?: ProcessNode[];
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({ session, nodes = [] }) => {
  const { toggleNodeExpansion } = useScreening();

  // Early return only if nodes is undefined
  if (!nodes) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Tracker</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Initializing process tracking...</p>
        </div>
      </div>
    );
  }

  const getNodeIcon = (status: ProcessNode['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNodeColor = (status: ProcessNode['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        LangGraph Workflow Progress
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Candidate: {session.candidate.name}</span>
          <span className="text-gray-500">
            {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {nodes.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Initializing LangGraph workflow...</p>
          </div>
        ) : (
          nodes.map((node) => (
            <div
              key={node.id}
              className={`rounded-lg border transition-all duration-200 ${getNodeColor(node.status)}`}
            >
              {/* Node Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getNodeIcon(node.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {node.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(node.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{node.message}</p>

                      {/* Error Display */}
                      {node.status === "error" && node.error && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                          <strong>Error:</strong> {node.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-time Token Streaming */}
                {node.streamingTokens !== undefined && (
                  <div className="mt-3 p-3 bg-white bg-opacity-70 rounded border">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        AI Processing
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                      {node.streamingTokens}
                      <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Steps — always shown when present */}
              {node.steps.length > 0 && (
                <div className="border-t border-gray-200 bg-white bg-opacity-50">
                  <div className="p-4 space-y-3">
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Execution Steps
                    </h5>
                    {node.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center space-x-3 p-2 rounded bg-white bg-opacity-70"
                      >
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              {step.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(step.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{step.message}</p>

                          {step.progress !== undefined && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${step.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Workflow Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>
            {nodes.filter(n => n.status === 'completed').length} / {nodes.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(nodes.filter(n => n.status === 'completed').length / nodes.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};