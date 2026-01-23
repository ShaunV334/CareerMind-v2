'use client';

import { useState, useCallback } from 'react';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  city: string;
  state: string;
  graduationDate: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  technologies: string;
  startDate: string;
  endDate: string;
}

export interface ResumeData {
  id: string;
  name: string;
  contactInfo: ContactInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  professionalSummary: string;
}

const defaultContactInfo: ContactInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
};

export const useResumeData = (initialData?: ResumeData) => {
  const [resumeData, setResumeData] = useState<ResumeData>(
    initialData ? {
      ...initialData,
      contactInfo: initialData.contactInfo || defaultContactInfo,
      workExperience: initialData.workExperience || [],
      education: initialData.education || [],
      skills: initialData.skills || [],
      projects: initialData.projects || [],
      professionalSummary: initialData.professionalSummary || '',
    } : {
      id: '',
      name: 'Untitled Resume',
      contactInfo: defaultContactInfo,
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      professionalSummary: '',
    }
  );

  const updateContactInfo = useCallback((info: Partial<ContactInfo>) => {
    setResumeData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, ...info }
    }));
  }, []);

  const setWorkExperience = useCallback((exp: WorkExperience[]) => {
    setResumeData(prev => ({ ...prev, workExperience: exp }));
  }, []);

  const setEducation = useCallback((edu: Education[]) => {
    setResumeData(prev => ({ ...prev, education: edu }));
  }, []);

  const setSkills = useCallback((skills: Skill[]) => {
    setResumeData(prev => ({ ...prev, skills }));
  }, []);

  const setProjects = useCallback((projects: Project[]) => {
    setResumeData(prev => ({ ...prev, projects }));
  }, []);

  const setProfessionalSummary = useCallback((summary: string) => {
    setResumeData(prev => ({ ...prev, professionalSummary: summary }));
  }, []);

  const setName = useCallback((name: string) => {
    setResumeData(prev => ({ ...prev, name: name || 'Untitled Resume' }));
  }, []);

  const saveResume = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // If no ID, create new resume (POST)
      if (!resumeData.id) {
        const response = await fetch(
          'http://localhost:3000/api/resumes',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: resumeData.name,
              data: {
                contactInfo: resumeData.contactInfo,
                professionalSummary: resumeData.professionalSummary,
                workExperience: resumeData.workExperience,
                education: resumeData.education,
                skills: resumeData.skills,
                projects: resumeData.projects,
              }
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create resume');
        }
        
        const created = await response.json();
        
        // Update local state with the new ID
        setResumeData(prev => ({
          ...prev,
          id: created.id || created._id?.toString() || ''
        }));
        
        return created;
      } else {
        // Update existing resume (PUT)
        const response = await fetch(
          `http://localhost:3000/api/resumes/${resumeData.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: resumeData.name,
              data: {
                contactInfo: resumeData.contactInfo,
                professionalSummary: resumeData.professionalSummary,
                workExperience: resumeData.workExperience,
                education: resumeData.education,
                skills: resumeData.skills,
                projects: resumeData.projects,
              }
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save resume');
        }
        
        return await response.json();
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      throw err;
    }
  }, [resumeData]);

  return {
    resumeData,
    setResumeData,
    updateContactInfo,
    setWorkExperience,
    setEducation,
    setSkills,
    setProjects,
    setProfessionalSummary,
    setName,
    saveResume,
  };
};
