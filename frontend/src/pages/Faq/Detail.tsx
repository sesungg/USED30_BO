import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockFaq } from '../../data/mockFaq';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Faq, FaqCategory } from '../../types';

const CATEGORIES = ['거래', '검수', '정산', '배송', '계정', '기타'];

export default function FaqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'faq') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockFaq.find(f => f.id === id);
  const [form, setForm] = useState<Partial<Faq>>(existing ?? {
    category: '거래', question: '', answer: '', status: 'draft', order: 1,
  });
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">FAQ를 찾을 수 없습니다.</div>;
  }

  function handleSave(newStatus?: Faq['status']) {
    if (!form.question?.trim()) { showToast('질문을 입력해주세요.', 'warning'); return; }
    if (!form.answer?.trim()) { showToast('답변을 입력해주세요.', 'warning'); return; }
    const status = newStatus ?? form.status ?? 'draft';
    setForm(p => ({ ...p, status }));
    setIsEditing(false);
    showToast(isNew ? 'FAQ가 등록되었습니다.' : status === 'published' ? '게시되었습니다.' : '저장되었습니다.', 'success');
    if (isNew) navigate('/faq');
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/faq" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? 'FAQ 등록' : 'FAQ 상세'}</h5>
        {!isNew && (
          <span className={`badge bg-${form.status === 'published' ? 'success' : 'secondary'}`}>
            {form.status === 'published' ? '게시중' : '임시저장'}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">카테고리</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.category ?? '거래'}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as FaqCategory }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : <div><span className="badge bg-light text-dark">{form.category}</span></div>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">노출 순서</label>
              {isEditing ? (
                <input type="number" className="form-control form-control-sm" value={form.order ?? 1}
                  onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
              ) : <div className="small">{form.order}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">질문</label>
            {isEditing ? (
              <input className="form-control" value={form.question ?? ''}
                onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                placeholder="자주 묻는 질문을 입력하세요" />
            ) : <div className="fw-medium">{form.question}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">답변</label>
            {isEditing ? (
              <textarea className="form-control" rows={8} value={form.answer ?? ''}
                onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                placeholder="답변을 입력하세요..." />
            ) : (
              <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{form.answer}</div>
            )}
          </div>

          {!isNew && (
            <div className="row g-2 small text-muted mt-3 pt-3 border-top">
              <div className="col-3">조회수:</div><div className="col-9">{existing?.viewCount.toLocaleString()}</div>
              <div className="col-3">등록일:</div><div className="col-9">{existing?.createdAt.slice(0, 10)}</div>
              <div className="col-3">최종 수정:</div><div className="col-9">{existing?.updatedAt.slice(0, 16).replace('T', ' ')}</div>
            </div>
          )}

          {isEditing && canEdit && (
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={() => handleSave('published')}>게시</button>
              <button className="btn btn-outline-secondary" onClick={() => handleSave('draft')}>임시저장</button>
              <button className="btn btn-outline-secondary ms-auto"
                onClick={() => { setIsEditing(false); if (isNew) navigate('/faq'); }}>취소</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
