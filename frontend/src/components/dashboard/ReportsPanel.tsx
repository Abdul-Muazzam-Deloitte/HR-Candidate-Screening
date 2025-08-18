import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Report } from '../../types';

interface ReportsPanelProps {
  reports: Report[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ reports }) => {
  const getReportTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'cv_analysis':
        return 'bg-blue-100 text-blue-800';
      case 'interview_evaluation':
        return 'bg-green-100 text-green-800';
      case 'final_report':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatReportType = (type: Report['type']) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownload = (report: Report) => {
    // Mock download functionality
    console.log('Downloading report:', report.id);
    // In a real app, this would trigger a file download
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        <FileText className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reports generated yet</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                      {formatReportType(report.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(report)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Download Report"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Reports
          </button>
        </div>
      )}
    </div>
  );
};