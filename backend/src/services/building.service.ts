import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';
import { Building, ProjectSummary, ProjectWithBuildings, PaginatedResponse, ProjectInfo } from '../models/building.model';

const COLLECTION_NAME = 'buildingexternals';

class BuildingService {
  private get collection() {
    return getDatabase().collection(COLLECTION_NAME);
  }

  /**
   * Get paginated project summary (without buildings array)
   * Optimized for initial page load
   */
  async getProjectsSummary(page = 1, limit = 20): Promise<PaginatedResponse<ProjectSummary>> {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$projectName' },
          buildingCount: { $sum: 1 },
          totalArea: { $sum: { $ifNull: ['$areaClient', 0] } },
          totalQualifyingArea: { $sum: { $ifNull: ['$qualifyingArea', 0] } }
        }
      },
      { $sort: { _id: -1 as const } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    const projects: ProjectSummary[] = result[0].data.map((p: any) => ({
      projectId: p._id,
      projectName: p.projectName || '',
      buildingCount: p.buildingCount,
      totalArea: p.totalArea || 0,
      totalQualifyingArea: p.totalQualifyingArea || 0
    }));
    const total = result[0].total[0]?.count || 0;

    return {
      result: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get buildings for a specific project (lazy loading)
   */
  async getBuildingsByProjectId(projectId: string): Promise<Building[]> {
    const buildings = await this.collection
      .find({ projectId })
      .sort({ buildingName: 1 })
      .toArray();

    return buildings as unknown as Building[];
  }

  /**
   * Search projects by projectId or projectName (server-side search)
   */
  async searchProjects(query: string, page = 1, limit = 20): Promise<PaginatedResponse<ProjectSummary>> {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          $or: [
            { projectId: { $regex: query, $options: 'i' } },
            { projectName: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$projectName' },
          buildingCount: { $sum: 1 },
          totalArea: { $sum: { $ifNull: ['$areaClient', 0] } },
          totalQualifyingArea: { $sum: { $ifNull: ['$qualifyingArea', 0] } }
        }
      },
      { $sort: { _id: -1 as const } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    const projects: ProjectSummary[] = result[0].data.map((p: any) => ({
      projectId: p._id,
      projectName: p.projectName || '',
      buildingCount: p.buildingCount,
      totalArea: p.totalArea || 0,
      totalQualifyingArea: p.totalQualifyingArea || 0
    }));
    const total = result[0].total[0]?.count || 0;

    return {
      result: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all projects with buildings (legacy endpoint - use with caution)
   */
  async getAllProjectsWithBuildings(): Promise<ProjectWithBuildings[]> {
    const pipeline = [
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$projectName' },
          buildings: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectName: 1,
          buildingCount: { $size: '$buildings' },
          buildings: 1
        }
      },
      { $sort: { projectId: -1 as const } }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    return result as unknown as ProjectWithBuildings[];
  }

  /**
   * Get a single building by ID
   */
  async getBuildingById(id: string): Promise<Building | null> {
    try {
      const building = await this.collection.findOne({ _id: new ObjectId(id) });
      return building as unknown as Building | null;
    } catch (error) {
      console.error('Error getting building by ID:', error);
      return null;
    }
  }

  /**
   * Update a building
   */
  async updateBuilding(id: string, data: Partial<Building>): Promise<boolean> {
    try {
      const { _id, ...updateData } = data as any;

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating building:', error);
      return false;
    }
  }

  /**
   * Delete a building
   */
  async deleteBuilding(id: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting building:', error);
      return false;
    }
  }

  /**
   * Delete all buildings in a project
   */
  async deleteAllBuildingsInProject(projectId: string): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const result = await this.collection.deleteMany({ projectId });
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error deleting buildings in project:', error);
      return { success: false, deletedCount: 0 };
    }
  }

  /**
   * Create a new building
   */
  async createBuilding(building: Omit<Building, '_id'>): Promise<string> {
    const doc = {
      ...building,
      createdAt: new Date()
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId.toString();
  }

  /**
   * Upload multiple buildings at once
   */
  async uploadBuildings(buildings: Omit<Building, '_id'>[]): Promise<number> {
    if (!buildings || buildings.length === 0) return 0;

    const docs = buildings.map(b => ({
      ...b,
      createdAt: new Date()
    }));
    const result = await this.collection.insertMany(docs);
    return result.insertedCount;
  }

  /**
   * Get project info (aggregated data for a single project)
   */
  async getProjectInfo(projectId: string): Promise<ProjectInfo | null> {
    const pipeline = [
      { $match: { projectId } },
      {
        $group: {
          _id: '$projectId',
          totalBuildings: { $sum: 1 },
          totalArea: { $sum: { $ifNull: ['$areaClient', 0] } },
          totalQualifyingArea: { $sum: { $ifNull: ['$qualifyingArea', 0] } }
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    if (result.length === 0) return null;

    return {
      totalBuildings: result[0].totalBuildings,
      totalArea: result[0].totalArea,
      totalQualifyingArea: result[0].totalQualifyingArea
    };
  }
}

export const buildingService = new BuildingService();
