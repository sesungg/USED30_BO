import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockInspections } from '../../data/mockInspections';
import { mockOrders } from '../../data/mockOrders';
import { GradeTag } from '../../components/common/GradeTag';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Inspection, MediaGrade, InspectionPhoto } from '../../types';

const GRADES: MediaGrade[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'F', 'P'];
const PHOTO_TYPES = ['record_side', 'label', 'sleeve_front', 'sleeve_back'] as const;
const PHOTO_LABELS = { record_side: '음반 면', label: '레이블', sleeve_front: '슬리브 앞', sleeve_back: '슬리브 뒤' };

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'inspections') : false;

  const [data, setData] = useState<Inspection | null>(() =>
    mockInspections.find(i => i.id === id) ?? null
  );
  const [mediaGrade, setMediaGrade] = useState<MediaGrade>(data?.inspectorMediaGrade ?? 'NM');
  const [sleeveGrade, setSleeveGrade] = useState<MediaGrade>(data?.inspectorSleeveGrade ?? 'VG+');
  const [notes, setNotes] = useState(data?.notes ?? '');
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<null | { action: 'approve' | 'grade_mismatch' | 'reject'; label: string; variant: string }>(null);
  const [rejectReason, setRejectReason] = useState('');

  // SLA countdown
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!data?.deadline) return;
    const tick = () => {
      const diff = new Date(data.deadline!).getTime() - Date.now();
      if (diff <= 0) { setRemaining('기한 초과'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}시간 ${m}분 ${s}초`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [data?.deadline]);

  if (!data) return (
    <div className="text-center py-5 text-muted">검수 건을 찾을 수 없습니다.</div>
  );

  // Related data
  const relatedOrder = mockOrders.find(o => o.inspection?.id === id);

  const hasMismatch = mediaGrade !== data.sellerMediaGrade || sleeveGrade !== data.sellerSleeveGrade;
  const isPending = data.result === 'pending';

  function handlePhotoChange(type: string, file: File) {
    const reader = new FileReader();
    reader.onload = e => setPhotos(prev => ({ ...prev, [type]: e.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function executeAction(action: 'approve' | 'grade_mismatch' | 'reject') {
    const updated: Inspection = {
      ...data as Inspection,
      result: action === 'approve' ? 'approved' : action === 'grade_mismatch' ? 'grade_mismatch' : 'rejected',
      inspectorMediaGrade: mediaGrade,
      inspectorSleeveGrade: sleeveGrade,
      notes: action === 'reject' ? rejectReason : notes,
    };
    setData(updated);
    const labels = { approve: '합격', grade_mismatch: '등급차이', reject: '반려' };
    showToast(`검수 ${labels[action]} 처리 완료`, 'success');
    setConfirm(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/inspections" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">검수 상세 #{data.id}</h5>
        <StatusBadge status={data.result} />
      </div>

      <div className="row g-3">
        {/* Left: Info + Grades */}
        <div className="col-lg-7">
          {/* Product + Order Links */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">상품 및 주문 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">아티스트</div><div className="col-8 fw-medium">{data.artistName}</div>
                <div className="col-4 text-muted">앨범</div><div className="col-8">{data.albumName}</div>
                <div className="col-4 text-muted">판매자</div>
                <div className="col-8">
                  {relatedOrder ? (
                    <Link to={`/users/${relatedOrder.product.sellerId}`} className="text-decoration-none">
                      {data.sellerNickname}
                    </Link>
                  ) : data.sellerNickname}
                </div>
                <div className="col-4 text-muted">희망가</div>
                <div className="col-8">₩{data.originalPrice.toLocaleString()}</div>
                {data.adjustedPrice && <>
                  <div className="col-4 text-muted">조정 가격</div>
                  <div className="col-8 text-warning fw-medium">₩{data.adjustedPrice.toLocaleString()}</div>
                </>}
                <div className="col-12"><hr className="my-1" /></div>
                <div className="col-4 text-muted">상품</div>
                <div className="col-8">
                  <Link to={`/products/${data.productId}`} className="btn btn-sm btn-outline-secondary py-0">상품 보기</Link>
                </div>
                {relatedOrder && <>
                  <div className="col-4 text-muted">주문</div>
                  <div className="col-8 d-flex align-items-center gap-2">
                    <Link to={`/orders/${relatedOrder.id}`} className="btn btn-sm btn-outline-secondary py-0">주문 보기</Link>
                    <span className="small text-muted">#{relatedOrder.id}</span>
                  </div>
                  <div className="col-4 text-muted">구매자</div>
                  <div className="col-8">
                    <Link to={`/users/${relatedOrder.buyerId}`} className="text-decoration-none">
                      {relatedOrder.buyerNickname}
                    </Link>
                  </div>
                </>}
                <div className="col-4 text-muted">접수일</div>
                <div className="col-8">{data.createdAt.slice(0, 10)}</div>
              </div>
            </div>
          </div>

          {/* Grade Comparison */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">등급 비교</div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr><th>구분</th><th>판매자 선언</th><th>검수원 판정</th><th>일치</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-muted small">미디어 등급</td>
                    <td><GradeTag grade={data.sellerMediaGrade} showLabel={false} /></td>
                    <td>
                      {canEdit && isPending ? (
                        <select className="form-select form-select-sm" style={{ width: 90 }}
                          value={mediaGrade} onChange={e => setMediaGrade(e.target.value as MediaGrade)}>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      ) : (
                        data.inspectorMediaGrade
                          ? <GradeTag grade={data.inspectorMediaGrade} showLabel={false} />
                          : <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{mediaGrade === data.sellerMediaGrade
                      ? <span className="text-success">✓</span>
                      : <span className="text-danger">✗</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted small">슬리브 등급</td>
                    <td><GradeTag grade={data.sellerSleeveGrade} showLabel={false} /></td>
                    <td>
                      {canEdit && isPending ? (
                        <select className="form-select form-select-sm" style={{ width: 90 }}
                          value={sleeveGrade} onChange={e => setSleeveGrade(e.target.value as MediaGrade)}>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      ) : (
                        data.inspectorSleeveGrade
                          ? <GradeTag grade={data.inspectorSleeveGrade} showLabel={false} />
                          : <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{sleeveGrade === data.sellerSleeveGrade
                      ? <span className="text-success">✓</span>
                      : <span className="text-danger">✗</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {canEdit && isPending && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold">검수 메모</div>
              <div className="card-body">
                <textarea className="form-control" rows={3} placeholder="검수 메모를 입력하세요..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          )}
          {!isPending && data.notes && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold">검수 메모</div>
              <div className="card-body"><p className="mb-0 small">{data.notes}</p></div>
            </div>
          )}

          {/* SLA */}
          {data.deadline && (
            <div className={`alert ${remaining === '기한 초과' ? 'alert-danger' : 'alert-warning'} d-flex align-items-center gap-2`}>
              <span>⏱</span>
              <div>
                <div className="fw-semibold small">판매자 응답 기한</div>
                <div className="fw-bold">{remaining}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canEdit && isPending && (
            <div className="d-flex gap-2">
              <button className="btn btn-success"
                onClick={() => setConfirm({ action: 'approve', label: '합격 처리', variant: 'success' })}>
                ✓ 합격
              </button>
              <button className="btn btn-warning" disabled={!hasMismatch}
                onClick={() => setConfirm({ action: 'grade_mismatch', label: '등급차이 통보', variant: 'warning' })}>
                ⚠ 등급차이
              </button>
              <button className="btn btn-danger"
                onClick={() => setConfirm({ action: 'reject', label: '반려 처리', variant: 'danger' })}>
                ✗ 반려
              </button>
            </div>
          )}
        </div>

        {/* Right: Photos */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">검수 사진</div>
            <div className="card-body">
              <div className="row g-2">
                {PHOTO_TYPES.map(type => {
                  const existing = data.photos.find((p: InspectionPhoto) => p.type === type);
                  const preview = photos[type] ?? existing?.url;
                  return (
                    <div key={type} className="col-6">
                      <div className="border rounded overflow-hidden" style={{ aspectRatio: '1', background: '#f8f9fa' }}>
                        {preview ? (
                          <img src={preview} alt={type} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                            사진 없음
                          </div>
                        )}
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: 11 }}>{PHOTO_LABELS[type]}</div>
                      {canEdit && isPending && (
                        <label className="btn btn-outline-secondary btn-sm w-100 mt-1" style={{ fontSize: 11 }}>
                          업로드
                          <input type="file" accept="image/*" className="d-none"
                            onChange={e => e.target.files?.[0] && handlePhotoChange(type, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      {confirm && confirm.action !== 'reject' && (
        <ConfirmModal
          show={true}
          title={confirm.label}
          body={`이 검수 건을 "${confirm.label}" 처리하시겠습니까?`}
          confirmLabel={confirm.label}
          confirmVariant={confirm.variant}
          onConfirm={() => executeAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.action === 'reject' && (
        <ConfirmModal
          show={true}
          title="반려 처리"
          body={<div>
            <p className="mb-2">반려 사유를 입력해주세요.</p>
            <textarea className="form-control" rows={3} value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} placeholder="반려 사유..." />
          </div> as unknown as string}
          confirmLabel="반려 처리"
          confirmVariant="danger"
          onConfirm={() => executeAction('reject')}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
