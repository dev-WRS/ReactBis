interface Props {
  show: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  isDanger?: boolean;
}

export default function DeleteModal({ show, title, message, onClose, onConfirm, isDanger = false }: Props) {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={isDanger ? 'btn btn-danger' : 'btn btn-warning'}
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
