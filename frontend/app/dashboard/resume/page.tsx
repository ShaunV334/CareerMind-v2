"use client"

import { useState } from 'react'
import ResumeList from '@/components/ResumeList'
import ResumeBuilder from '@/components/ResumeBuilder'
import { ResumeData } from '@/hooks/useResumeData'

interface SavedResume {
  id: string;
  name: string;
  createdAt: string;
  data: ResumeData;
}

export default function ResumePage() {
  const [currentMode, setCurrentMode] = useState<'list' | 'edit'>('list')
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null)

  const handleCreateNew = () => {
    setCurrentMode('edit')
  }

  const handleEdit = (resume: SavedResume) => {
    setSelectedResume({
      id: resume.id,
      name: resume.name,
      ...resume.data,
    })
    setCurrentMode('edit')
  }

  const handleDelete = () => {
    setSelectedResume(null)
  }

  const handleBackToList = () => {
    setCurrentMode('list')
    setSelectedResume(null)
  }

  if (currentMode === 'list') {
    return (
      <ResumeList
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <ResumeBuilder
      initialResume={selectedResume}
      onBack={handleBackToList}
      resumeName={selectedResume?.name}
    />
  )
}