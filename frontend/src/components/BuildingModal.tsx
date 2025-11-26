import { useState, useEffect } from 'react';
import type { Building } from '../types';

interface Props {
  show: boolean;
  building: Building | null;
  projectNameDefault: string;
  onClose: () => void;
  onSave: (building: Partial<Building>) => void;
  isLoading: boolean;
}

const emptyBuilding: Partial<Building> = {
  projectName: '',
  buildingName: '',
  address: '',
  areaClient: 0,
  qualifyingArea: 0,
  yearPIS: 0,
  bldgType: '',
  inspectionDate: '',
  improvements: '',
  attemptWholeBldg: '',
  legalEntity: '',
  allowedWattage: 0,
  proposedWattage: 0,
  baselineLPD: 0,
  proposedLPD: 0,
  reductionPercent: 0,
  confirmedBy: '',
  guaranteedCat: '',
  possibleCat: '',
  missingInfo: '',
  notes: '',
  additionalNotes: '',
  sharefileLink: '',
  startDate: '',
  dueDate: '',
  submitFA: '',
};

export default function BuildingModal({
  show,
  building,
  projectNameDefault,
  onClose,
  onSave,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<Partial<Building>>(emptyBuilding);

  useEffect(() => {
    if (building) {
      setFormData(building);
    } else {
      setFormData({ ...emptyBuilding, projectName: projectNameDefault });
    }
  }, [building, projectNameDefault, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  const isEdit = !!building?._id;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Edit Building' : 'Add New Building'}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isLoading}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Basic Information */}
              <h6 className="border-bottom pb-2 mb-3">Basic Information</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectName"
                    value={formData.projectName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Building Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="buildingName"
                    value={formData.buildingName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Building Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="bldgType"
                    value={formData.bldgType || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Legal Entity</label>
                  <input
                    type="text"
                    className="form-control"
                    name="legalEntity"
                    value={formData.legalEntity || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Year PIS</label>
                  <input
                    type="number"
                    className="form-control"
                    name="yearPIS"
                    value={formData.yearPIS || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Area Information */}
              <h6 className="border-bottom pb-2 mb-3 mt-4">Area Information</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Area Client (sqft)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="areaClient"
                    value={formData.areaClient || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Qualifying Area (sqft)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="qualifyingArea"
                    value={formData.qualifyingArea || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Wattage Information */}
              <h6 className="border-bottom pb-2 mb-3 mt-4">Wattage & LPD</h6>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Allowed Wattage (W)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="allowedWattage"
                    value={formData.allowedWattage || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Proposed Wattage (W)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="proposedWattage"
                    value={formData.proposedWattage || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Baseline LPD</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="baselineLPD"
                    value={formData.baselineLPD || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Proposed LPD</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="proposedLPD"
                    value={formData.proposedLPD || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Reduction %</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="reductionPercent"
                    value={formData.reductionPercent || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Category Information */}
              <h6 className="border-bottom pb-2 mb-3 mt-4">Categories</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Guaranteed Category</label>
                  <input
                    type="text"
                    className="form-control"
                    name="guaranteedCat"
                    value={formData.guaranteedCat || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Possible Category</label>
                  <input
                    type="text"
                    className="form-control"
                    name="possibleCat"
                    value={formData.possibleCat || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Dates */}
              <h6 className="border-bottom pb-2 mb-3 mt-4">Dates</h6>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Inspection Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="inspectionDate"
                    value={formData.inspectionDate || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={formData.dueDate || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <h6 className="border-bottom pb-2 mb-3 mt-4">Additional Information</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirmed By</label>
                  <input
                    type="text"
                    className="form-control"
                    name="confirmedBy"
                    value={formData.confirmedBy || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Attempt Whole Building</label>
                  <input
                    type="text"
                    className="form-control"
                    name="attemptWholeBldg"
                    value={formData.attemptWholeBldg || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Improvements</label>
                  <input
                    type="text"
                    className="form-control"
                    name="improvements"
                    value={formData.improvements || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Submit FA</label>
                  <input
                    type="text"
                    className="form-control"
                    name="submitFA"
                    value={formData.submitFA || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Sharefile Link</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sharefileLink"
                    value={formData.sharefileLink || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Missing Info</label>
                  <textarea
                    className="form-control"
                    name="missingInfo"
                    rows={2}
                    value={formData.missingInfo || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    name="additionalNotes"
                    rows={3}
                    value={formData.additionalNotes || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
