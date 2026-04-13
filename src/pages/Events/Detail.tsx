import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockEvents } from '../../data/mockEvents';
import { mockCoupons } from '../../data/mockCoupons';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { MarketingEvent } from '../../types';

type EventStatus = MarketingEvent['status'];

const STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'secondary', ongoing: 'success', upcoming: 'info', ended: 'secondary',
};
const STATUS_LABELS: Record<EventStatus, string> = {
  draft: '임시저장', ongoing: '진행중', upcoming: '예정', ended: '종료',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'events') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockEvents.find(e => e.id === id);
  const [form, setForm] = useState<Partial<MarketingEvent>>(existing ?? {
    title: '', description: '', status: 'upcoming',
    startAt: '', endAt: '', participantCount: 0,
  });
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">이벤트를 찾을 수 없습니다.</div>;
  }

  function handleSave() {
    if (!form.title?.trim()) { showToast('이벤트명을 입력해주세요.', 'warning'); return; }
    if (!form.startAt || !form.endAt) { showToast('이벤트 기간을 입력해주세요.', 'warning'); return; }
    setIsEditing(false);
    showToast(isNew ? '이벤트가 등록되었습니다.' : '이벤트가 수정되었습니다.', 'success');
    if (isNew) navigate('/events');
  }

  const linkedCoupon = form.couponId ? mockCoupons.find(c => c.id === form.couponId) : null;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/events" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? '이벤트 등록' : `이벤트 상세 — ${existing?.title}`}</h5>
        {!isNew && form.status && (
          <span className={`badge bg-${STATUS_COLORS[form.status as EventStatus]}`}>
            {STATUS_LABELS[form.status as EventStatus]}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-header bg-white fw-semibold">이벤트 정보</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">이벤트명</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.title ?? ''}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              ) : <div className="fw-medium">{form.title}</div>}
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">설명</label>
              {isEditing ? (
                <textarea className="form-control form-control-sm" rows={4} value={form.description ?? ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              ) : <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{form.description}</div>}
            </div>
            {(form.imageUrl || isEditing) && (
              <div className="col-12">
                <label className="form-label small fw-semibold">이미지 URL</label>
                {isEditing ? (
                  <input className="form-control form-control-sm" value={form.imageUrl ?? ''}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value || undefined }))}
                    placeholder="없음" />
                ) : (
                  <div>
                    {form.imageUrl && (
                      <img src={form.imageUrl} alt="event" className="img-fluid rounded border" style={{ maxHeight: 160 }} />
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label small fw-semibold">상태</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.status ?? 'upcoming'}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as EventStatus }))}>
                  <option value="ongoing">진행중</option>
                  <option value="upcoming">예정</option>
                  <option value="ended">종료</option>
                </select>
              ) : <div className="small">{form.status ? STATUS_LABELS[form.status as EventStatus] : '—'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">시작일</label>
              {isEditing ? (
                <input type="date" className="form-control form-control-sm"
                  value={form.startAt ? form.startAt.slice(0, 10) : ''}
                  onChange={e => setForm(p => ({ ...p, startAt: e.target.value + 'T00:00:00Z' }))} />
              ) : <div className="small">{form.startAt?.slice(0, 10)}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">종료일</label>
              {isEditing ? (
                <input type="date" className="form-control form-control-sm"
                  value={form.endAt ? form.endAt.slice(0, 10) : ''}
                  onChange={e => setForm(p => ({ ...p, endAt: e.target.value + 'T23:59:59Z' }))} />
              ) : <div className="small">{form.endAt?.slice(0, 10)}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">연결 쿠폰</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.couponId ?? ''}
                  onChange={e => setForm(p => ({ ...p, couponId: e.target.value || undefined }))}>
                  <option value="">없음</option>
                  {mockCoupons.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="small">
                  {linkedCoupon ? (
                    <Link to={`/coupons/${linkedCoupon.id}`} className="text-primary">
                      {linkedCoupon.code} — {linkedCoupon.name}
                    </Link>
                  ) : '—'}
                </div>
              )}
            </div>
            {!isNew && (
              <div className="col-md-6">
                <div className="text-muted small">참여자 수</div>
                <div className="fw-medium">{form.participantCount?.toLocaleString()}명</div>
              </div>
            )}
            {!isNew && (
              <>
                <div className="col-12"><hr className="my-0" /></div>
                <div className="col-6"><div className="text-muted small">등록자</div><div className="small">{form.createdBy}</div></div>
                <div className="col-6"><div className="text-muted small">등록일</div><div className="small">{form.createdAt?.slice(0, 10)}</div></div>
              </>
            )}
          </div>

          {isEditing && canEdit && (
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
              <button className="btn btn-outline-secondary"
                onClick={() => { setIsEditing(false); if (isNew) navigate('/events'); }}>취소</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
