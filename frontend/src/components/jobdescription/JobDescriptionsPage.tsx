import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, Briefcase } from 'lucide-react';
import { useJobDescriptions } from '../../contexts/JobDescriptionContext';
import { JobDescriptionForm } from '../JobDescriptionForm';
import { JobDescription } from '../../types';

export const JobDescriptionsPage: React.FC = () => {
  const { jobDescriptions, deleteJobDescription } = useJobDescriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);

  const handleEdit = (job: JobDescription) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      deleteJobDescription(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Job Postings
            </h1>
          </div>
          <p className="text-gray-600">
            Manage job postings for candidate screening
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Posting</span>
        </button>
      </div>

      {/* Job Descriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobDescriptions.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{job.department}</p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.experience}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(job)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {job.description}
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {job.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{job.requirements.length} requirements</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {jobDescriptions.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No job descriptions yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first job posting to start screening candidates
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Create Job Posting</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Description Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <JobDescriptionForm
                initialData={editingJob}
                onSubmit={handleFormClose}
                onCancel={handleFormClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};