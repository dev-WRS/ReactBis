export interface Building {
  _id: string;
  projectId?: string;
  projectSubId?: string;
  projectName: string;
  buildingName: string;
  address?: string;
  areaClient?: number;
  qualifyingArea?: number;
  yearPIS?: number;
  bldgType?: string;
  inspectionDate?: string;
  improvements?: string;
  attemptWholeBldg?: string;
  legalEntity?: string;
  costEEBCP?: number;
  allowedWattage?: number;
  proposedWattage?: number;
  baselineLPD?: number;
  proposedLPD?: number;
  reductionPercent?: number;
  confirmedBy?: string;
  guaranteedCat?: string;
  possibleCat?: string;
  missingInfo?: string;
  notes?: string;
  additionalNotes?: string;
  sharefileLink?: string;
  startDate?: string;
  dueDate?: string;
  submitFA?: string;
  createdAt?: string;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  buildingCount: number;
  totalArea: number;
  totalQualifyingArea: number;
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

export interface BuildingsResponse {
  result: Building[];
}

export interface ProjectInfo {
  totalBuildings: number;
  totalArea: number;
  totalQualifyingArea: number;
}
