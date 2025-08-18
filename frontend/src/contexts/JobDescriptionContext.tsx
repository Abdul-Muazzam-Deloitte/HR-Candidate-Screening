import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobDescription } from '../types';

interface JobDescriptionContextType {
  jobDescriptions: JobDescription[];
  createJobDescription: (jobDescription: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJobDescription: (id: string, jobDescription: Partial<JobDescription>) => void;
  deleteJobDescription: (id: string) => void;
  getJobDescription: (id: string) => JobDescription | undefined;
}

const JobDescriptionContext = createContext<JobDescriptionContextType | undefined>(undefined);

export const useJobDescriptions = () => {
  const context = useContext(JobDescriptionContext);
  if (context === undefined) {
    throw new Error('useJobDescriptions must be used within a JobDescriptionProvider');
  }
  return context;
};

interface JobDescriptionProviderProps {
  children: ReactNode;
}

export const JobDescriptionProvider: React.FC<JobDescriptionProviderProps> = ({ children }) => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([
    // Sample job descriptions
    {
      id: '1',
      title: 'Senior React Developer',
      department: 'Engineering',
      description: 'We are looking for a Senior React Developer to join our frontend team.',
      experience: 'Senior Level (5-8 years)',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of React development experience',
        'Strong understanding of JavaScript and TypeScript'
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      department: 'Engineering',
      description: 'Join our team as a Full Stack Developer working on cutting-edge web applications.',
      experience: 'Mid Level (2-5 years)',
      requirements: [
        'Bachelor\'s degree in Computer Science',
        '3+ years of full stack development experience',
        'Experience with both frontend and backend technologies'
      ],
      skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    }
  ]);

  const createJobDescription = (jobDescriptionData: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJobDescription: JobDescription = {
      ...jobDescriptionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setJobDescriptions(prev => [...prev, newJobDescription]);
  };

  const updateJobDescription = (id: string, updates: Partial<JobDescription>) => {
    setJobDescriptions(prev => prev.map(jd => 
      jd.id === id 
        ? { ...jd, ...updates, updatedAt: new Date() }
        : jd
    ));
  };

  const deleteJobDescription = (id: string) => {
    setJobDescriptions(prev => prev.filter(jd => jd.id !== id));
  };

  const getJobDescription = (id: string) => {
    return jobDescriptions.find(jd => jd.id === id);
  };

  const value: JobDescriptionContextType = {
    jobDescriptions,
    createJobDescription,
    updateJobDescription,
    deleteJobDescription,
    getJobDescription
  };

  return (
    <JobDescriptionContext.Provider value={value}>
      {children}
    </JobDescriptionContext.Provider>
  );
};