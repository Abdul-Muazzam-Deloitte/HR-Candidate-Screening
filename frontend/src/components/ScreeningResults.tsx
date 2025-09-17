import React from 'react';
import { CheckCircle, XCircle, Award, AlertTriangle, MessageSquare } from 'lucide-react';
import { ScreeningResult } from '../types';

interface ScreeningResultsProps {
  result: ScreeningResult;
  candidateName: string;
  onStartInterview?: () => void;
  className?: string;
}

export const ScreeningResults: React.FC<ScreeningResultsProps> = ({
  result,
  candidateName,
  onStartInterview,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Screening Results for {candidateName}
        </h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getScoreBgColor(result.score)}`}>
          {result.isMatch ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-semibold ${getScoreColor(result.score)}`}>
            {result.score}% Match
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overall Assessment */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Overall Assessment</h3>
          <p className="text-gray-700">{result.summary}</p>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Matched Skills</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {result.matchedSkills.length}
              </span>
            </div>
            <div className="space-y-2">
              {result.matchedSkills.length > 0 ? (
                result.matchedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No matching skills found</p>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Missing Skills</h3>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {result.missingSkills.length}
              </span>
            </div>
            <div className="space-y-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">All required skills are present</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {result.isMatch && result.questions && onStartInterview && (
            <button
              onClick={onStartInterview}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Interview ({result.questions.length} questions)</span>
            </button>
          )}
          
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};