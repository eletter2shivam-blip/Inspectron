import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from './ToastContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    localStorage.getItem('ai_qa_selected_project') || 'proj-inspectron-01'
  );
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      const list = res.projects || [];
      setProjects(list);

      // If selected project does not exist in list, fallback to first
      if (list.length > 0 && !list.find(p => p.id === selectedProjectId)) {
        setSelectedProjectId(list[0].id);
        localStorage.setItem('ai_qa_selected_project', list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const selectProject = (id) => {
    setSelectedProjectId(id);
    localStorage.setItem('ai_qa_selected_project', id);
  };

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || {
    id: 'proj-inspectron-01',
    name: 'Inspectron',
    modules: ['Dashboard', 'Login', 'Campaign', 'Google Ads', 'Meta Ads', 'Reports']
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        selectedProjectId,
        selectProject,
        refreshProjects: fetchProjects,
        loading,
        modules: activeProject.modules || []
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
