import { Router } from 'express';
import { buildingController } from '../controllers/building.controller';

const router = Router();

// Project routes (optimized)
router.get('/projects/summary', buildingController.getProjectsSummary);
router.get('/projects/search', buildingController.searchProjects);
router.get('/projects/all', buildingController.getAllProjects);
router.get('/projects/:projectId/buildings', buildingController.getBuildingsByProject);
router.get('/projects/:projectId/info', buildingController.getProjectInfo);
router.delete('/projects/:projectId/buildings', buildingController.deleteAllBuildingsInProject);

// Building routes
router.get('/buildings/:id', buildingController.getBuildingById);
router.post('/buildings/:id/edit', buildingController.updateBuilding);
router.delete('/buildings/:id', buildingController.deleteBuilding);
router.post('/buildings', buildingController.createBuilding);
router.post('/buildings/upload', buildingController.uploadBuildings);

export default router;
