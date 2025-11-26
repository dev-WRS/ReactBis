import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import type { Building } from './types';
import * as api from './services/api';

import ProjectsTable from './components/ProjectsTable';
import BuildingModal from './components/BuildingModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';

const queryClient = new QueryClient();

function AppContent() {
  const qc = useQueryClient();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [buildingsCache, setBuildingsCache] = useState<Record<string, Building[]>>({});
  const [loadingBuildings, setLoadingBuildings] = useState<Set<string>>(new Set());

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedProjectForAdd, setSelectedProjectForAdd] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; projectId: string } | null>(null);
  const [deleteAllTarget, setDeleteAllTarget] = useState<{ projectId: string; count: number } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const pageLimit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query for projects
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects', currentPage, debouncedSearch],
    queryFn: () => debouncedSearch
      ? api.searchProjects(debouncedSearch, currentPage, pageLimit)
      : api.getProjectsSummary(currentPage, pageLimit),
  });

  const projects = data?.result || [];
  const pagination = data?.pagination || { page: 1, limit: pageLimit, total: 0, totalPages: 1 };

  // Load buildings for a project
  const loadBuildings = useCallback(async (projectId: string) => {
    if (buildingsCache[projectId]) {
      setExpandedProjects(prev => {
        const next = new Set(prev);
        if (next.has(projectId)) {
          next.delete(projectId);
        } else {
          next.add(projectId);
        }
        return next;
      });
      return;
    }

    setLoadingBuildings(prev => new Set(prev).add(projectId));
    try {
      const response = await api.getBuildingsByProject(projectId);
      setBuildingsCache(prev => ({ ...prev, [projectId]: response.result }));
      setExpandedProjects(prev => new Set(prev).add(projectId));
    } catch (error) {
      showToast('Error loading buildings', 'error');
    } finally {
      setLoadingBuildings(prev => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  }, [buildingsCache]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.createBuilding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setBuildingsCache({});
      setExpandedProjects(new Set());
      setShowAddModal(false);
      showToast('Building created successfully!', 'success');
    },
    onError: () => showToast('Error creating building', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Building> }) => api.updateBuilding(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setBuildingsCache({});
      setExpandedProjects(new Set());
      setShowEditModal(false);
      showToast('Building updated successfully!', 'success');
    },
    onError: () => showToast('Error updating building', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteBuilding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setBuildingsCache({});
      setExpandedProjects(new Set());
      setShowDeleteModal(false);
      showToast('Building deleted successfully!', 'success');
    },
    onError: () => showToast('Error deleting building', 'error'),
  });

  const deleteAllMutation = useMutation({
    mutationFn: api.deleteAllBuildingsInProject,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setBuildingsCache({});
      setExpandedProjects(new Set());
      setShowDeleteAllModal(false);
      showToast(`Deleted ${data.deletedCount} buildings from project ${data.projectId}`, 'success');
    },
    onError: () => showToast('Error deleting buildings', 'error'),
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedProjects(new Set());
  };

  const handleEdit = async (buildingId: string) => {
    try {
      const building = await api.getBuildingById(buildingId);
      setSelectedBuilding(building);
      setShowEditModal(true);
    } catch {
      showToast('Error loading building', 'error');
    }
  };

  const handleAdd = (projectName?: string) => {
    setSelectedProjectForAdd(projectName || '');
    setSelectedBuilding(null);
    setShowAddModal(true);
  };

  const handleDelete = (buildingId: string, projectId: string) => {
    setDeleteTarget({ id: buildingId, projectId });
    setShowDeleteModal(true);
  };

  const handleDeleteAll = (projectId: string, count: number) => {
    setDeleteAllTarget({ projectId, count });
    setShowDeleteAllModal(true);
  };

  const handleSave = (building: Partial<Building>) => {
    if (selectedBuilding?._id) {
      updateMutation.mutate({ id: selectedBuilding._id, data: building });
    } else {
      createMutation.mutate(building as Omit<Building, '_id'>);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const confirmDeleteAll = () => {
    if (deleteAllTarget) {
      deleteAllMutation.mutate(deleteAllTarget.projectId);
    }
  };

  const isLoadingAny = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || deleteAllMutation.isPending;

  return (
    <div>
      {isLoadingAny && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <ProjectsTable
        projects={projects}
        pagination={pagination}
        currentPage={currentPage}
        searchQuery={searchQuery}
        expandedProjects={expandedProjects}
        buildingsCache={buildingsCache}
        loadingBuildings={loadingBuildings}
        onPageChange={handlePageChange}
        onSearchChange={setSearchQuery}
        onToggleBuildings={loadBuildings}
        onRefresh={() => {
          setBuildingsCache({});
          setExpandedProjects(new Set());
          refetch();
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onDeleteAll={handleDeleteAll}
      />

      <BuildingModal
        show={showEditModal || showAddModal}
        building={selectedBuilding}
        projectNameDefault={selectedProjectForAdd}
        onClose={() => {
          setShowEditModal(false);
          setShowAddModal(false);
          setSelectedBuilding(null);
          setSelectedProjectForAdd('');
        }}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteModal
        show={showDeleteModal}
        title="Delete Building"
        message="Are you sure you want to delete this building?"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <DeleteModal
        show={showDeleteAllModal}
        title="Delete All Buildings"
        message={`Are you sure you want to delete ALL ${deleteAllTarget?.count || 0} buildings in project ${deleteAllTarget?.projectId}? This action cannot be undone.`}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        isDanger
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
