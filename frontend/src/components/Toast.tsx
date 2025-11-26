interface Props {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ show, message, type }: Props) {
  if (!show) return null;

  return (
    <div className="toast-container">
      <div className={`toast show ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white`}>
        <div className="toast-body d-flex align-items-center justify-content-between">
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
