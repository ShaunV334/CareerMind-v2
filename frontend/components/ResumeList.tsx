'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Edit } from 'lucide-react';
import { ResumeData } from '@/hooks/useResumeData';

interface SavedResume {
  id: string;
  name: string;
  createdAt: string;
  data: ResumeData;
}

interface ResumeListProps {
  onCreateNew: () => void;
  onEdit: (resume: SavedResume) => void;
  onDelete: (id: string) => void;
}

const ResumeList: React.FC<ResumeListProps> = ({ onCreateNew, onEdit, onDelete }) => {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    onCreateNew();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/api/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setResumes(resumes.filter(r => r.id !== id));
        onDelete(id);
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  const handleDownload = async (resume: SavedResume) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/api/resumes/${resume.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading resume:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Resumes</h1>
          <p className="text-muted-foreground">Create and manage your professional resumes</p>
        </div>

        {/* Create New Resume Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* New Resume Card */}
          <button
            onClick={handleCreateNew}
            className="bg-card border-2 border-dashed border-border rounded-lg p-6 flex items-center justify-center h-64 hover:border-primary hover:bg-accent/50 transition-colors group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-foreground font-semibold">Create New</p>
            </div>
          </button>

          {/* Resume Cards */}
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-card border border-border rounded-lg p-6 h-64 flex flex-col justify-between hover:border-primary transition-colors group"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                  {resume.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => onEdit(resume)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>

                <button
                  onClick={() => handleDownload(resume)}
                  className="flex items-center justify-center px-3 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(resume.id)}
                  className="flex items-center justify-center px-3 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                  title="Delete resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {resumes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No resumes yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeList;
