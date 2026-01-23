import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useResumeData, ResumeData, ContactInfo, WorkExperience, Education, Skill, Project } from '@/hooks/useResumeData';

interface ResumeBuilderProps {
  initialResume?: ResumeData;
  onBack?: () => void;
  resumeName?: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialResume, onBack, resumeName }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const {
    resumeData,
    updateContactInfo,
    setWorkExperience,
    setEducation,
    setSkills,
    setProjects,
    setProfessionalSummary,
    setName,
    saveResume
  } = useResumeData(initialResume);

  const { contactInfo, workExperience, education, skills, projects, professionalSummary } = resumeData;

  const sections = [
    'Contact Information',
    'Professional Summary',
    'Work Experience',
    'Education',
    'Skills',
    'Projects',
    'Preview'
  ];

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setWorkExperience([...workExperience, newExp]);
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    const updated = workExperience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setWorkExperience(updated);
  };

  const removeWorkExperience = (id: string) => {
    const updated = workExperience.filter(exp => exp.id !== id);
    setWorkExperience(updated);
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      city: '',
      state: '',
      graduationDate: ''
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
  };

  const removeEducation = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
    setEducation(updated);
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Beginner'
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    const updated = skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    setSkills(updated);
  };

  const removeSkill = (id: string) => {
    const updated = skills.filter(skill => skill.id !== id);
    setSkills(updated);
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      technologies: '',
      startDate: '',
      endDate: ''
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    const updated = projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    );
    setProjects(updated);
  };

  const removeProject = (id: string) => {
    const updated = projects.filter(project => project.id !== id);
    setProjects(updated);
  };

  const handleSaveResume = async () => {
    if (!resumeData.name || resumeData.name === 'Untitled Resume') {
      setSaveMessage({ type: 'error', text: 'Please give your resume a name' });
      return;
    }

    setIsSaving(true);
    try {
      await saveResume();
      setSaveMessage({ type: 'success', text: 'Resume saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save resume' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContactSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
          <input
            type="text"
            value={contactInfo.firstName}
            onChange={(e) => updateContactInfo({firstName: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="John"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
          <input
            type="text"
            value={contactInfo.lastName}
            onChange={(e) => updateContactInfo({lastName: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => updateContactInfo({email: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="john.doe@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => updateContactInfo({phone: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Address</label>
        <input
          type="text"
          value={contactInfo.address}
          onChange={(e) => updateContactInfo({address: e.target.value})}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">City</label>
          <input
            type="text"
            value={contactInfo.city}
            onChange={(e) => updateContactInfo({city: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="New York"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">State</label>
          <input
            type="text"
            value={contactInfo.state}
            onChange={(e) => updateContactInfo({state: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="NY"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
          <input
            type="text"
            value={contactInfo.zipCode}
            onChange={(e) => updateContactInfo({zipCode: e.target.value})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="10001"
          />
        </div>
      </div>
    </div>
  );

  const renderSummarySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Professional Summary</h2>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Write a brief summary of your professional background and career objectives
        </label>
        <textarea
          value={professionalSummary}
          onChange={(e) => setProfessionalSummary(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          placeholder="Experienced software developer with 5+ years in full-stack development..."
        />
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tips for a great summary:</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Highlight your most relevant experience and skills</li>
          <li>• Mention your career goals and what you bring to the table</li>
          <li>• Keep it concise (3-5 sentences)</li>
          <li>• Use keywords from the job description</li>
        </ul>
      </div>
    </div>
  );

  const renderWorkExperienceSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Work Experience</h2>
        <button
          onClick={addWorkExperience}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </button>
      </div>

      {workExperience.map((exp, index) => (
        <div key={exp.id} className="border border-border rounded-lg p-6 space-y-4 bg-card">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Experience {index + 1}</h3>
            <button
              onClick={() => removeWorkExperience(exp.id)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Title *</label>
              <input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <input
                type="text"
                value={exp.city}
                onChange={(e) => updateWorkExperience(exp.id, 'city', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="San Francisco"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <input
                type="text"
                value={exp.state}
                onChange={(e) => updateWorkExperience(exp.id, 'state', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`current-${exp.id}`}
              checked={exp.current}
              onChange={(e) => updateWorkExperience(exp.id, 'current', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor={`current-${exp.id}`} className="text-sm text-foreground">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Job Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Education</h2>
        <button
          onClick={addEducation}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </button>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="border border-border rounded-lg p-6 space-y-4 bg-card">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Education {index + 1}</h3>
            <button
              onClick={() => removeEducation(edu.id)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">School/University *</label>
            <input
              type="text"
              value={edu.school}
              onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="University of California"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Degree</label>
              <select
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">Select Degree</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Field of Study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <input
                type="text"
                value={edu.city}
                onChange={(e) => updateEducation(edu.id, 'city', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="Berkeley"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <input
                type="text"
                value={edu.state}
                onChange={(e) => updateEducation(edu.id, 'state', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="CA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Graduation Date</label>
              <input
                type="month"
                value={edu.graduationDate}
                onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Skills</h2>
        <button
          onClick={addSkill}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </button>
      </div>

      {skills.map((skill, index) => (
        <div key={skill.id} className="border border-border rounded-lg p-6 space-y-4 bg-card">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Skill {index + 1}</h3>
            <button
              onClick={() => removeSkill(skill.id)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Skill Name *</label>
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                placeholder="JavaScript"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Proficiency Level</label>
              <select
                value={skill.level}
                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Projects</h2>
        <button
          onClick={addProject}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {projects.map((project, index) => (
        <div key={project.id} className="border border-border rounded-lg p-6 space-y-4 bg-card">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Project {index + 1}</h3>
            <button
              onClick={() => removeProject(project.id)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Project Title *</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(project.id, 'title', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="Describe your project, what it does, and your role..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Project URL</label>
            <input
              type="url"
              value={project.url}
              onChange={(e) => updateProject(project.id, 'url', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="https://github.com/yourname/project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Technologies Used</label>
            <input
              type="text"
              value={project.technologies}
              onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              placeholder="React, TypeScript, Node.js, MongoDB"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <input
                type="month"
                value={project.startDate}
                onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="month"
                value={project.endDate}
                onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreviewSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Resume Preview</h2>
      
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">
            {contactInfo.firstName} {contactInfo.lastName}
          </h1>
          <div className="text-muted-foreground mt-2">
            {contactInfo.address && <p>{contactInfo.address}</p>}
            {(contactInfo.city || contactInfo.state || contactInfo.zipCode) && (
              <p>{contactInfo.city}{contactInfo.city && contactInfo.state && ', '} {contactInfo.state} {contactInfo.zipCode}</p>
            )}
            <p>
              {contactInfo.email && <span>{contactInfo.email}</span>}
              {contactInfo.email && contactInfo.phone && ' | '}
              {contactInfo.phone && <span>{contactInfo.phone}</span>}
            </p>
          </div>
        </div>

        {/* Professional Summary */}
        {professionalSummary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Professional Summary</h2>
            <p className="text-foreground">{professionalSummary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Work Experience</h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{exp.jobTitle}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    <p>{exp.city}{exp.city && exp.state && ', '} {exp.state}</p>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-foreground mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{edu.school}</h3>
                    <p className="text-muted-foreground">
                      {edu.degree}{edu.degree && edu.field && ' in '} {edu.field}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{edu.graduationDate}</p>
                    <p>{edu.city}{edu.city && edu.state && ', '} {edu.state}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Skills</h2>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex justify-between">
                  <span className="text-foreground">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">- {skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Projects</h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                    {project.url && (
                      <p className="text-primary hover:underline">
                        <a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a>
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{project.startDate} - {project.endDate}</p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-foreground mt-2">{project.description}</p>
                )}
                {project.technologies && (
                  <p className="text-muted-foreground text-sm mt-2">
                    <span className="font-semibold">Technologies:</span> {project.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderContactSection();
      case 1: return renderSummarySection();
      case 2: return renderWorkExperienceSection();
      case 3: return renderEducationSection();
      case 4: return renderSkillsSection();
      case 5: return renderProjectsSection();
      case 6: return renderPreviewSection();
      default: return renderContactSection();
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with back button and resume name */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <div className="flex-1 ml-8">
            <input
              type="text"
              value={resumeData.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Resume Name"
              className="text-2xl font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground w-full"
            />
          </div>
        </div>

        {/* Status message */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`flex items-center cursor-pointer ${
                  index === currentSection ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
                onClick={() => setCurrentSection(index)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    index === currentSection
                      ? 'bg-primary text-primary-foreground'
                      : index < currentSection
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentSection ? '✓' : index + 1}
                </div>
                <span className="text-sm hidden sm:inline">{section}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          {renderCurrentSection()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                currentSection === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="text-sm text-muted-foreground">
              Step {currentSection + 1} of {sections.length}
            </div>

            <div className="flex items-center gap-3">
              {currentSection === sections.length - 1 && (
                <button
                  onClick={handleSaveResume}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Resume'}
                </button>
              )}
              <button
                onClick={nextSection}
                disabled={currentSection === sections.length - 1}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                  currentSection === sections.length - 1
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
