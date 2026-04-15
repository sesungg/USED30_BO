import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockNotices } from '../../data/mockNotices';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Notice, NoticeStatus, NoticeCategory } from '../../types';

const CATEGORIES: NoticeCategory[] = ['공지', '업데이트', '이벤트', '점검', '기타'];

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'notices') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockNotices.find(n => n.id === id);
  const [notice, setNotice] = useState<Partial<Notice>>(existing ?? {
    title: '', content: '', category: '공지', status: 'draft', isPinned: false,
  });
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">공지사항을 찾을 수 없습니다.</div>;
  }

  function handleSave(newStatus?: NoticeStatus) {
    if (!notice.title?.trim()) { showToast('제목을 입력해주세요.', 'warning'); return; }
    if (!notice.content?.trim()) { showToast('내용을 입력해주세요.', 'warning'); return; }
    const status = newStatus ?? notice.status ?? 'draft';
    setNotice(prev => ({ ...prev, status }));
    setIsEditing(false);
    showToast(
      isNew ? '공지사항이 등록되었습니다.' :
      status === 'published' ? '게시되었습니다.' : '저장되었습니다.',
      'success'
    );
    if (isNew) navigate('/notices');
  }

  const STATUS_LABELS: Record<NoticeStatus, string> = {
    published: '게시중', draft: '임시저장', archived: '보관됨',
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/notices" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? '공지사항 등록' : '공지사항 상세'}</h5>
        {!isNew && notice.status && (
          <span className={`badge bg-${notice.status === 'published' ? 'success' : notice.status === 'draft' ? 'secondary' : 'warning'}`}>
            {STATUS_LABELS[notice.status as NoticeStatus]}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-semibold small">카테고리</label>
            {isEditing ? (
              <select className="form-select form-select-sm" style={{ width: 160 }}
                value={notice.category}
                onChange={e => setNotice(p => ({ ...p, category: e.target.value as NoticeCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <div><span className="badge bg-light text-dark">{notice.category}</span></div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">제목</label>
            {isEditing ? (
              <input className="form-control" value={notice.title ?? ''}
                onChange={e => setNotice(p => ({ ...p, title: e.target.value }))}
                placeholder="공지사항 제목" />
            ) : (
              <div className="fw-medium">{notice.title}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">내용</label>
            {isEditing ? (
              <textarea className="form-control" rows={10} value={notice.content ?? ''}
                onChange={e => setNotice(p => ({ ...p, content: e.target.value }))}
                placeholder="공지사항 내용을 입력하세요..." />
            ) : (
              <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{notice.content}</div>
            )}
          </div>

          {isEditing && (
            <div className="mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="isPinned"
                  checked={notice.isPinned ?? false}
                  onChange={e => setNotice(p => ({ ...p, isPinned: e.target.checked }))} />
                <label className="form-check-label small" htmlFor="isPinned">상단 고정</label>
              </div>
            </div>
          )}

          {!isEditing && !isNew && (
            <div className="row g-2 small text-muted mt-3 pt-3 border-top">
              <div className="col-3">작성자:</div><div className="col-9">{existing?.authorNickname}</div>
              <div className="col-3">고정:</div><div className="col-9">{notice.isPinned ? '고정됨' : '—'}</div>
              <div className="col-3">등록일:</div><div className="col-9">{existing?.createdAt.slice(0, 16).replace('T', ' ')}</div>
              <div className="col-3">최종 수정:</div><div className="col-9">{existing?.updatedAt.slice(0, 16).replace('T', ' ')}</div>
              <div className="col-3">조회수:</div><div className="col-9">{existing?.viewCount.toLocaleString()}</div>
            </div>
          )}

          {isEditing && canEdit && (
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={() => handleSave('published')}>게시</button>
              <button className="btn btn-outline-secondary" onClick={() => handleSave('draft')}>임시저장</button>
              {!isNew && (
                <button className="btn btn-outline-danger ms-auto"
                  onClick={() => { setIsEditing(false); if (isNew) navigate('/notices'); }}>
                  취소
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
