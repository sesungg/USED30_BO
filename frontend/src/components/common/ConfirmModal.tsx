import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  confirmVariant?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  show, title, body, confirmLabel = '확인', confirmVariant = 'primary',
  onConfirm, onCancel,
}: ConfirmModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (show) {
      ref.current.classList.add('show');
      ref.current.style.display = 'block';
      document.body.classList.add('modal-open');
    } else {
      ref.current.classList.remove('show');
      ref.current.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="modal fade show" ref={ref} style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body">{body}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>취소</button>
              <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onCancel} />
    </>
  );
}
