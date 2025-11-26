import React from 'react';
import type { ProjectSummary, Building } from '../types';

interface Props {
  projects: ProjectSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  currentPage: number;
  searchQuery: string;
  expandedProjects: Set<string>;
  buildingsCache: Record<string, Building[]>;
  loadingBuildings: Set<string>;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  onToggleBuildings: (projectId: string) => void;
  onRefresh: () => void;
  onEdit: (buildingId: string) => void;
  onDelete: (buildingId: string, projectId: string) => void;
  onAdd: (projectName?: string) => void;
  onDeleteAll: (projectId: string, count: number) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US');
  } catch {
    return '';
  }
}

function renderField(label: string, value: any, unit = '') {
  if (value === null || value === undefined || value === '' || value === 0) return null;
  return (
    <div className="col-md-4 mb-2">
      <strong>{label}:</strong> {value}{unit}
    </div>
  );
}

export default function ProjectsTable({
  projects,
  pagination,
  currentPage,
  searchQuery,
  expandedProjects,
  buildingsCache,
  loadingBuildings,
  onPageChange,
  onSearchChange,
  onToggleBuildings,
  onRefresh,
  onEdit,
  onDelete,
  onAdd,
  onDeleteAll,
}: Props) {
  const rowOffset = (currentPage - 1) * pagination.limit;

  return (
    <div className="table-wrapper">
      {/* Action buttons and search */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => onAdd()}>
            + New Building
          </button>
          <button className="btn btn-outline-secondary" onClick={onRefresh}>
            Refresh
          </button>
        </div>
        <div className="input-group search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search project..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="btn btn-outline-secondary" onClick={() => onSearchChange('')}>
              X
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Buildings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <React.Fragment key={project.projectId}>
              <tr>
                <td>{rowOffset + index + 1}</td>
                <td>{project.projectId}</td>
                <td>{project.projectName}</td>
                <td>{project.buildingCount}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => onToggleBuildings(project.projectId)}
                    disabled={loadingBuildings.has(project.projectId)}
                  >
                    {loadingBuildings.has(project.projectId) ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : expandedProjects.has(project.projectId) ? (
                      'Hide'
                    ) : (
                      'View'
                    )}
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-1"
                    onClick={() => onAdd(project.projectName)}
                  >
                    Add
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteAll(project.projectId, project.buildingCount)}
                  >
                    x
                  </button>
                </td>
              </tr>
              {/* Building rows */}
              {expandedProjects.has(project.projectId) && buildingsCache[project.projectId]?.map((building) => (
                <tr key={building._id} className="building-row">
                  <td colSpan={5}>
                    <div className="building-details">
                      <div className="row">
                        {renderField('Sub Project ID', building.projectSubId?.split('-')[1])}
                        {renderField('Name', building.buildingName)}
                        {renderField('Address', building.address)}
                        {renderField('Area', building.areaClient, ' sqft')}
                        {renderField('Type', building.bldgType)}
                        {renderField('Qualifying Area', building.qualifyingArea, ' sqft')}
                        {renderField('Inspection Date', building.inspectionDate)}
                        {renderField('Guaranteed Category', building.guaranteedCat)}
                        {renderField('Possible Category', building.possibleCat)}
                        {renderField('Year PIS', building.yearPIS)}
                        {renderField('Wattage Allowed', building.allowedWattage, ' W')}
                        {renderField('Wattage Proposed', building.proposedWattage, ' W')}
                        {renderField('Baseline LPD', building.baselineLPD)}
                        {renderField('Proposed LPD', building.proposedLPD)}
                        {renderField('Reduction %', building.reductionPercent)}
                        {renderField('Confirmed By', building.confirmedBy)}
                        {renderField('Improvement', building.improvements)}
                        {renderField('Whole Bldg', building.attemptWholeBldg)}
                        {renderField('Missing Info', building.missingInfo)}
                        {renderField('Legal Entity', building.legalEntity)}
                        {renderField('Created Date', formatDate(building.createdAt))}
                        {renderField('Notes', building.notes)}
                        <div className="col-12 mt-2">
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => onEdit(building._id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(building._id, building.projectId || '')}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* No results message */}
      {projects.length === 0 && (
        <div className="text-center text-muted">No matching projects found.</div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong>
            {' '}({pagination.total} total projects)
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
            >
              First
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={currentPage >= pagination.totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
