import axios from 'axios';
import type { Building, ProjectSummary, PaginatedResponse, BuildingsResponse, ProjectInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects
export const getProjectsSummary = async (page = 1, limit = 20): Promise<PaginatedResponse<ProjectSummary>> => {
  const { data } = await api.get(`/projects/summary?page=${page}&limit=${limit}`);
  return data;
};

export const searchProjects = async (query: string, page = 1, limit = 20): Promise<PaginatedResponse<ProjectSummary>> => {
  const { data } = await api.get(`/projects/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return data;
};

export const getBuildingsByProject = async (projectId: string): Promise<BuildingsResponse> => {
  const { data } = await api.get(`/projects/${projectId}/buildings`);
  return data;
};

export const getProjectInfo = async (projectId: string): Promise<ProjectInfo> => {
  const { data } = await api.get(`/projects/${projectId}/info`);
  return data;
};

export const deleteAllBuildingsInProject = async (projectId: string): Promise<{ success: boolean; projectId: string; deletedCount: number }> => {
  const { data } = await api.delete(`/projects/${projectId}/buildings`);
  return data;
};

// Buildings
export const getBuildingById = async (id: string): Promise<Building> => {
  const { data } = await api.get(`/buildings/${id}`);
  return data;
};

export const createBuilding = async (building: Omit<Building, '_id'>): Promise<{ success: boolean; id: string }> => {
  const { data } = await api.post('/buildings', building);
  return data;
};

export const updateBuilding = async (id: string, building: Partial<Building>): Promise<{ success: boolean }> => {
  const { data } = await api.post(`/buildings/${id}/edit`, building);
  return data;
};

export const deleteBuilding = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/buildings/${id}`);
  return data;
};

export const uploadBuildings = async (buildings: Omit<Building, '_id'>[]): Promise<{ success: boolean; insertedCount: number }> => {
  const { data } = await api.post('/buildings/upload', { buildings });
  return data;
};

export default api;
