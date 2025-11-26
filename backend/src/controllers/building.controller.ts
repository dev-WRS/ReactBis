import { Request, Response } from 'express';
import { buildingService } from '../services/building.service';

class BuildingController {
  /**
   * GET /api/projects/summary
   */
  async getProjectsSummary(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await buildingService.getProjectsSummary(page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Error in getProjectsSummary:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/projects/search
   */
  async searchProjects(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!query.trim()) {
        const result = await buildingService.getProjectsSummary(page, limit);
        res.json(result);
        return;
      }

      const result = await buildingService.searchProjects(query, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Error in searchProjects:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/projects/:projectId/buildings
   */
  async getBuildingsByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({ error: 'projectId is required' });
        return;
      }

      const buildings = await buildingService.getBuildingsByProjectId(projectId);
      res.json({ result: buildings });
    } catch (error: any) {
      console.error('Error in getBuildingsByProject:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/projects/:projectId/info
   */
  async getProjectInfo(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({ error: 'projectId is required' });
        return;
      }

      const info = await buildingService.getProjectInfo(projectId);
      if (!info) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json(info);
    } catch (error: any) {
      console.error('Error in getProjectInfo:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/projects/all
   */
  async getAllProjects(_req: Request, res: Response): Promise<void> {
    try {
      const result = await buildingService.getAllProjectsWithBuildings();
      res.json({ result });
    } catch (error: any) {
      console.error('Error in getAllProjects:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/buildings/:id
   */
  async getBuildingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Building ID is required' });
        return;
      }

      const building = await buildingService.getBuildingById(id);
      if (!building) {
        res.status(404).json({ error: 'Building not found' });
        return;
      }

      res.json(building);
    } catch (error: any) {
      console.error('Error in getBuildingById:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/buildings/:id/edit
   */
  async updateBuilding(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        res.status(400).json({ error: 'Building ID is required' });
        return;
      }

      const success = await buildingService.updateBuilding(id, data);
      if (!success) {
        res.status(404).json({ error: 'Building not found or no changes made' });
        return;
      }

      res.json({ success: true, message: 'Building updated successfully' });
    } catch (error: any) {
      console.error('Error in updateBuilding:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * DELETE /api/buildings/:id
   */
  async deleteBuilding(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Building ID is required' });
        return;
      }

      const success = await buildingService.deleteBuilding(id);
      if (!success) {
        res.status(404).json({ error: 'Building not found' });
        return;
      }

      res.json({ success: true, message: 'Building deleted successfully' });
    } catch (error: any) {
      console.error('Error in deleteBuilding:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/buildings
   */
  async deleteAllBuildingsInProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({ error: 'projectId is required' });
        return;
      }

      const result = await buildingService.deleteAllBuildingsInProject(projectId);
      res.json({
        success: result.success,
        projectId,
        deletedCount: result.deletedCount
      });
    } catch (error: any) {
      console.error('Error in deleteAllBuildingsInProject:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/buildings
   */
  async createBuilding(req: Request, res: Response): Promise<void> {
    try {
      const building = req.body;

      if (!building.projectId || !building.buildingName) {
        res.status(400).json({ error: 'projectId and buildingName are required' });
        return;
      }

      const id = await buildingService.createBuilding(building);
      res.status(201).json({ success: true, id, message: 'Building created successfully' });
    } catch (error: any) {
      console.error('Error in createBuilding:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/buildings/upload
   */
  async uploadBuildings(req: Request, res: Response): Promise<void> {
    try {
      const { buildings } = req.body;

      if (!Array.isArray(buildings) || buildings.length === 0) {
        res.status(400).json({ error: 'buildings array is required and must not be empty' });
        return;
      }

      for (const b of buildings) {
        if (!b.projectId || !b.buildingName) {
          res.status(400).json({ error: 'Each building must have projectId and buildingName' });
          return;
        }
      }

      const insertedCount = await buildingService.uploadBuildings(buildings);
      res.json({ success: true, insertedCount });
    } catch (error: any) {
      console.error('Error in uploadBuildings:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export const buildingController = new BuildingController();
