import React, { useState } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';
import { JobDescription } from '../types';
import { useJobDescriptions } from '../contexts/JobDescriptionContext';

interface JobDescriptionFormProps {
  initialData?: JobDescription | null;
  onSubmit: () => void;
  onCancel?: () => void;
  className?: string;
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const { createJobDescription, updateJobDescription } = useJobDescriptions();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    department: initialData?.department || '',
    description: initialData?.description || '',
    experience: initialData?.experience || '',
    requirements: initialData?.requirements || [''],
    skills: initialData?.skills || ['']
  });

  const addField = (field: 'requirements' | 'skills') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeField = (field: 'requirements' | 'skills', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field: 'requirements' | 'skills', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobDescriptionData = {
      title: formData.title,
      department: formData.department,
      description: formData.description,
      experience: formData.experience,
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      skills: formData.skills.filter(skill => skill.trim() !== '')
    };
    
    if (initialData) {
      updateJobDescription(initialData.id, jobDescriptionData);
    } else {
      createJobDescription(jobDescriptionData);
    }
    
    onSubmit();
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Job Posting</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior React Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Engineering"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level *
          </label>
          <select
            required
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select experience level</option>
            <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
            <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
            <option value="Senior Level (5-8 years)">Senior Level (5-8 years)</option>
            <option value="Lead Level (8+ years)">Lead Level (8+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements *
          </label>
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                required
                value={requirement}
                onChange={(e) => updateField('requirements', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Bachelor's degree in Computer Science"
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('requirements', index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('requirements')}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Requirement</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills *
          </label>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateField('skills', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, TypeScript, Node.js"
              />
              {formData.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('skills', index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('skills')}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {initialData ? 'Update Job Posting' : 'Save Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};