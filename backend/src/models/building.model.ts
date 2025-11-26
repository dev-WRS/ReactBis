/**
 * Building interface - matches inspection-server IBuildingExternal
 * Plus additional fields found in actual MongoDB data
 */
export interface Building {
  _id: string;

  // Fields from inspection-server model
  sharefileLink?: string;
  startDate?: string;
  yearPIS?: number;
  projectName: string;
  buildingName: string;
  address?: string;
  areaClient?: number;
  improvements?: string;
  costEEBCP?: number;
  attemptWholeBldg?: string;
  additionalNotes?: string;
  dueDate?: string;
  allowedWattage?: number;
  proposedWattage?: number;
  baselineLPD?: number;
  proposedLPD?: number;
  reductionPercent?: number;
  bldgType?: string;
  qualifyingArea?: number;
  confirmedBy?: string;
  guaranteedCat?: string;
  missingInfo?: string;
  submitFA?: string;
  notes?: string;
  createdAt?: Date;

  // Additional fields found in actual MongoDB data
  projectId?: string;
  projectSubId?: string;
  inspectionDate?: string;
  possibleCat?: string;
  legalEntity?: string;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  buildingCount: number;
  totalArea: number;
  totalQualifyingArea: number;
}

export interface ProjectWithBuildings {
  projectId: string;
  projectName: string;
  buildingCount: number;
  buildings: Building[];
}

export interface PaginatedResponse<T> {
  result: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectInfo {
  totalBuildings: number;
  totalArea: number;
  totalQualifyingArea: number;
}
