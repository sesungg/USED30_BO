import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockCoupons } from '../../data/mockCoupons';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Coupon, CouponStatus } from '../../types';

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'coupons') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockCoupons.find(c => c.id === id);
  const [form, setForm] = useState<Partial<Coupon>>(existing ?? {
    code: '', name: '', type: 'percentage', value: 10,
    issuedCount: 0, usedCount: 0, status: 'active', createdBy: '',
  });
  const [isEditing, setIsEditing] = useState(isNew);

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">쿠폰을 찾을 수 없습니다.</div>;
  }

  function handleSave() {
    if (!form.code?.trim()) { showToast('쿠폰 코드를 입력해주세요.', 'warning'); return; }
    if (!form.name?.trim()) { showToast('쿠폰명을 입력해주세요.', 'warning'); return; }
    setIsEditing(false);
    showToast(isNew ? '쿠폰이 등록되었습니다.' : '쿠폰이 수정되었습니다.', 'success');
    if (isNew) navigate('/coupons');
  }

  const STATUS_COLORS: Record<CouponStatus, string> = {
    active: 'success', inactive: 'secondary', expired: 'danger',
  };
  const STATUS_LABELS: Record<CouponStatus, string> = {
    active: '활성', inactive: '비활성', expired: '만료',
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/coupons" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? '쿠폰 등록' : `쿠폰 상세 — ${existing?.code}`}</h5>
        {!isNew && form.status && (
          <span className={`badge bg-${STATUS_COLORS[form.status as CouponStatus]}`}>
            {STATUS_LABELS[form.status as CouponStatus]}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-header bg-white fw-semibold">쿠폰 정보</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">쿠폰 코드</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.code ?? ''}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="예: SPRING2026" />
              ) : <div className="fw-bold text-primary">{form.code}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">쿠폰명</label>
              {isEditing ? (
                <input className="form-control form-control-sm" value={form.name ?? ''}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              ) : <div className="small">{form.name}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">종류</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.type ?? 'percentage'}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}>
                  <option value="percentage">정률 (%)</option>
                  <option value="fixed">정액 (₩)</option>
                </select>
              ) : <div className="small">{form.type === 'percentage' ? '정률' : '정액'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">
                할인 {form.type === 'percentage' ? '(%)' : '(₩)'}
              </label>
              {isEditing ? (
                <input type="number" className="form-control form-control-sm" value={form.value ?? 0}
                  onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} />
              ) : <div className="small fw-medium">
                {form.type === 'percentage' ? `${form.value}%` : `₩${(form.value ?? 0).toLocaleString()}`}
              </div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">상태</label>
              {isEditing ? (
                <select className="form-select form-select-sm" value={form.status ?? 'active'}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as CouponStatus }))}>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="expired">만료</option>
                </select>
              ) : <div className="small">{STATUS_LABELS[form.status as CouponStatus] ?? form.status}</div>}
            </div>

            <div className="col-12"><hr className="my-0" /></div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">최소 주문금액 (₩)</label>
              {isEditing ? (
                <input type="number" className="form-control form-control-sm" value={form.minOrderAmount ?? ''}
                  onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="없음" />
              ) : <div className="small">{form.minOrderAmount ? `₩${form.minOrderAmount.toLocaleString()}` : '—'}</div>}
            </div>
            {form.type === 'percentage' && (
              <div className="col-md-4">
                <label className="form-label small fw-semibold">최대 할인 (₩)</label>
                {isEditing ? (
                  <input type="number" className="form-control form-control-sm" value={form.maxDiscount ?? ''}
                    onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="없음" />
                ) : <div className="small">{form.maxDiscount ? `₩${form.maxDiscount.toLocaleString()}` : '—'}</div>}
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label small fw-semibold">발급 한도</label>
              {isEditing ? (
                <input type="number" className="form-control form-control-sm" value={form.totalLimit ?? ''}
                  onChange={e => setForm(p => ({ ...p, totalLimit: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="무제한" />
              ) : <div className="small">{form.totalLimit ? `${form.totalLimit}개` : '무제한'}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">만료일</label>
              {isEditing ? (
                <input type="date" className="form-control form-control-sm"
                  value={form.expiresAt ? form.expiresAt.slice(0, 10) : ''}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value ? e.target.value + 'T23:59:59Z' : undefined }))} />
              ) : <div className="small">{form.expiresAt ? form.expiresAt.slice(0, 10) : '무기한'}</div>}
            </div>

            {!isNew && (
              <>
                <div className="col-12"><hr className="my-0" /></div>
                <div className="col-4"><div className="text-muted small">발급 수</div><div className="fw-medium">{form.issuedCount?.toLocaleString()}</div></div>
                <div className="col-4"><div className="text-muted small">사용 수</div><div className="fw-medium">{form.usedCount?.toLocaleString()}</div></div>
                <div className="col-4"><div className="text-muted small">등록일</div><div className="small">{form.createdAt?.slice(0, 10)}</div></div>
              </>
            )}
          </div>

          {isEditing && canEdit && (
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
              <button className="btn btn-outline-secondary"
                onClick={() => { setIsEditing(false); if (isNew) navigate('/coupons'); }}>취소</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
