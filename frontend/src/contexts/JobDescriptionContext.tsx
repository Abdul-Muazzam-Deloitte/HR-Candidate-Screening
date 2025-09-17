import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { JobDescription } from '../types';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../reducers/store";
import {
  createJobDescription as reduxCreateJobDescription,
  updateJobDescription as reduxUpdateJobDescription,
  getAllJobDescriptions as reduxGetAllJobDescriptions
} from "../reducers/jobSlice";

interface JobDescriptionContextType {
  jobDescriptionList: JobDescription[];
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

  const dispatch: AppDispatch = useDispatch();
  const jobDescriptionList = useSelector((state: RootState) => state.jobs.items);

  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);

useEffect(() => {
  const loadJobDescriptions = async () => {
    try {
      const response = await dispatch(reduxGetAllJobDescriptions()).unwrap();
      setJobDescriptions(response);
    } catch (error) {
      console.error(error);
    }
  };

  loadJobDescriptions();
}, []);

  const createJobDescription = async (jobDescriptionData: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    // const newJobDescription: JobDescription = {
    //   ...jobDescriptionData,
    //   id: Date.now().toString(),
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // };

    const response = (await dispatch(reduxCreateJobDescription(jobDescriptionData)).unwrap());
    setJobDescriptions(prev => [...prev, response]);


  };

  const updateJobDescription = async (id: string, updatedJobDescription: Partial<JobDescription>) => {
    
    const response = (await dispatch(reduxUpdateJobDescription({id,updatedJobDescription})).unwrap());

    setJobDescriptions(prev => prev.map(jd => 
      jd.id === id 
        ? { ...jd, ...response}
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
    jobDescriptionList,
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