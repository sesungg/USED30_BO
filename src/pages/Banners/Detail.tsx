import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockBanners } from '../../data/mockBanners';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Banner } from '../../types';

type BannerStatus = Banner['status'];
type BannerPosition = Banner['position'];

const STATUS_COLORS: Record<BannerStatus, string> = {
  active: 'success', inactive: 'secondary', scheduled: 'info',
};
const STATUS_LABELS: Record<BannerStatus, string> = {
  active: '활성', inactive: '비활성', scheduled: '예약',
};
const POSITION_LABELS: Record<BannerPosition, string> = {
  main_top: '메인 상단', main_middle: '메인 중단', popup: '팝업', sidebar: '사이드바',
};

export default function BannerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'banners') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockBanners.find(b => b.id === id);
  const [form, setForm] = useState<Partial<Banner>>(existing ?? {
    title: '', imageUrl: '', linkUrl: '', position: 'main_top', status: 'inactive', order: 1,
  });
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">배너를 찾을 수 없습니다.</div>;
  }

  function handleSave() {
    if (!form.title?.trim()) { showToast('배너 제목을 입력해주세요.', 'warning'); return; }
    if (!form.imageUrl?.trim()) { showToast('이미지 URL을 입력해주세요.', 'warning'); return; }
    setIsEditing(false);
    showToast(isNew ? '배너가 등록되었습니다.' : '배너가 수정되었습니다.', 'success');
    if (isNew) navigate('/banners');
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/banners" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? '배너 등록' : `배너 상세 — ${existing?.title}`}</h5>
        {!isNew && form.status && (
          <span className={`badge bg-${STATUS_COLORS[form.status as BannerStatus]}`}>
            {STATUS_LABELS[form.status as BannerStatus]}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-header bg-white fw-semibold">배너 정보</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">제목</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.title ?? ''}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              ) : <div className="fw-medium">{form.title}</div>}
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">이미지 URL</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.imageUrl ?? ''}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://..." />
              ) : (
                <div>
                  <div className="small text-muted mb-2">{form.imageUrl}</div>
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="banner preview"
                      className="img-fluid rounded border" style={{ maxHeight: 160, objectFit: 'cover' }} />
                  )}
                </div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">링크 URL</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.linkUrl ?? ''}
                  onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value || undefined }))}
                  placeholder="없음" />
              ) : <div className="small text-muted">{form.linkUrl ?? '—'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">노출 위치</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.position ?? 'main_top'}
                  onChange={e => setForm(p => ({ ...p, position: e.target.value as BannerPosition }))}>
                  <option value="main_top">메인 상단</option>
                  <option value="main_middle">메인 중단</option>
                  <option value="popup">팝업</option>
                </select>
              ) : <div className="small">{form.position ? POSITION_LABELS[form.position as BannerPosition] : '—'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">상태</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.status ?? 'inactive'}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as BannerStatus }))}>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="scheduled">예약</option>
                </select>
              ) : <div className="small">{form.status ? STATUS_LABELS[form.status as BannerStatus] : '—'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">노출 순서</label>
              {isEditing ? (
                <input type="number" className="form-control form-control-sm" value={form.order ?? 1}
                  onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
              ) : <div className="small">{form.order}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">노출 시작일</label>
              {isEditing ? (
                <input type="date" className="form-control form-control-sm"
                  value={form.startAt ? form.startAt.slice(0, 10) : ''}
                  onChange={e => setForm(p => ({ ...p, startAt: e.target.value ? e.target.value + 'T00:00:00Z' : undefined }))} />
              ) : <div className="small">{form.startAt ? form.startAt.slice(0, 10) : '—'}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">노출 종료일</label>
              {isEditing ? (
                <input type="date" className="form-control form-control-sm"
                  value={form.endAt ? form.endAt.slice(0, 10) : ''}
                  onChange={e => setForm(p => ({ ...p, endAt: e.target.value ? e.target.value + 'T23:59:59Z' : undefined }))} />
              ) : <div className="small">{form.endAt ? form.endAt.slice(0, 10) : '무기한'}</div>}
            </div>
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
                onClick={() => { setIsEditing(false); if (isNew) navigate('/banners'); }}>취소</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
