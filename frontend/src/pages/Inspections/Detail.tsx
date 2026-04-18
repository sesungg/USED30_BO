import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { GradeTag } from '../../components/common/GradeTag';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { canWrite } from '../../constants/permissions';
import {
  approveInspection,
  fetchInspection,
  gradeMismatchInspection,
  rejectInspection,
  type InspectionDetail,
} from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import type { MediaGrade } from '../../types';

const GRADES: MediaGrade[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user ? canWrite(user.role, 'inspections') : false;

  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspectorMediaGrade, setInspectorMediaGrade] = useState<MediaGrade>('NM');
  const [inspectorSleeveGrade, setInspectorSleeveGrade] = useState<MediaGrade>('NM');
  const [adjustedPrice, setAdjustedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirm, setConfirm] = useState<'approve' | 'grade_mismatch' | 'reject' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchInspection(id)
      .then(response => {
        if (cancelled) {
          return;
        }
        setInspection(response);
        setInspectorMediaGrade(response.inspectorMediaGrade ?? response.sellerMediaGrade);
        setInspectorSleeveGrade(response.inspectorSleeveGrade ?? response.sellerSleeveGrade);
        setAdjustedPrice(response.adjustedPrice ? String(response.adjustedPrice) : '');
        setNotes(response.notes ?? '');
        setRejectionReason(response.rejectionReason ?? '');
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '검수 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleConfirmAction() {
    if (!id || !confirm) {
      return;
    }

    setSaving(true);
    try {
      const updated = confirm === 'approve'
        ? await approveInspection(id, inspectorMediaGrade, inspectorSleeveGrade, notes || undefined)
        : confirm === 'grade_mismatch'
          ? await gradeMismatchInspection(
              id,
              inspectorMediaGrade,
              inspectorSleeveGrade,
              Number(adjustedPrice),
              notes || undefined,
            )
          : await rejectInspection(id, rejectionReason, notes || undefined);
      setInspection(updated);
      setConfirm(null);
      showToast('검수 처리 결과를 저장했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '검수 처리에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-muted">검수 정보를 불러오는 중입니다.</div>;
  }

  if (error || !inspection) {
    return <div className="alert alert-danger">{error || '검수 건을 찾을 수 없습니다.'}</div>;
  }

  const isPending = inspection.result === 'pending';

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/inspections" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">검수 상세 #{inspection.id}</h5>
        <StatusBadge status={inspection.result} />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">검수 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">상품</div>
                <div className="col-8">
                  {inspection.productId
                    ? <Link to={`/products/${inspection.productId}`} className="text-decoration-none">{inspection.artistName ?? '—'} / {inspection.albumName ?? '—'}</Link>
                    : `${inspection.artistName ?? '—'} / ${inspection.albumName ?? '—'}`}
                </div>
                <div className="col-4 text-muted">희망가</div><div className="col-8">{formatPrice(inspection.originalPrice)}</div>
                <div className="col-4 text-muted">조정가</div><div className="col-8">{formatPrice(inspection.adjustedPrice)}</div>
                <div className="col-4 text-muted">접수일</div><div className="col-8">{formatDate(inspection.createdAt, true)}</div>
                <div className="col-4 text-muted">수령일</div><div className="col-8">{formatDate(inspection.receivedAt, true)}</div>
                <div className="col-4 text-muted">검수 완료일</div><div className="col-8">{formatDate(inspection.inspectedAt, true)}</div>
                <div className="col-4 text-muted">판매자 응답</div><div className="col-8">{inspection.sellerResponse ?? '—'}</div>
                <div className="col-4 text-muted">응답 기한</div><div className="col-8">{formatDate(inspection.responseDeadline, true)}</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">등급 비교</div>
            <div className="card-body">
              <table className="table table-sm mb-3">
                <thead className="table-light">
                  <tr>
                    <th>구분</th>
                    <th>판매자 선언</th>
                    <th>검수자 판정</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="small text-muted">미디어</td>
                    <td><GradeTag grade={inspection.sellerMediaGrade} showLabel={false} /></td>
                    <td>
                      {canEdit && isPending ? (
                        <select className="form-select form-select-sm" value={inspectorMediaGrade} onChange={event => setInspectorMediaGrade(event.target.value as MediaGrade)}>
                          {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                        </select>
                      ) : inspection.inspectorMediaGrade ? (
                        <GradeTag grade={inspection.inspectorMediaGrade} showLabel={false} />
                      ) : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="small text-muted">슬리브</td>
                    <td><GradeTag grade={inspection.sellerSleeveGrade} showLabel={false} /></td>
                    <td>
                      {canEdit && isPending ? (
                        <select className="form-select form-select-sm" value={inspectorSleeveGrade} onChange={event => setInspectorSleeveGrade(event.target.value as MediaGrade)}>
                          {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                        </select>
                      ) : inspection.inspectorSleeveGrade ? (
                        <GradeTag grade={inspection.inspectorSleeveGrade} showLabel={false} />
                      ) : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {inspection.rejectionReason && (
                <div className="alert alert-danger small">{inspection.rejectionReason}</div>
              )}

              {inspection.notes && !isPending && (
                <div className="alert alert-light small mb-0">{inspection.notes}</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">처리 작업</div>
            <div className="card-body">
              {!canEdit || !isPending ? (
                <p className="small text-muted mb-0">추가 처리 가능한 상태가 아닙니다.</p>
              ) : (
                <>
                  <label className="form-label small fw-semibold">검수 메모</label>
                  <textarea className="form-control form-control-sm mb-3" rows={3} value={notes} onChange={event => setNotes(event.target.value)} />

                  <label className="form-label small fw-semibold">조정 가격</label>
                  <input type="number" className="form-control form-control-sm mb-3" value={adjustedPrice} onChange={event => setAdjustedPrice(event.target.value)} />

                  <label className="form-label small fw-semibold">반려 사유</label>
                  <textarea className="form-control form-control-sm mb-3" rows={3} value={rejectionReason} onChange={event => setRejectionReason(event.target.value)} />

                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-success" disabled={saving} onClick={() => setConfirm('approve')}>합격 처리</button>
                    <button className="btn btn-sm btn-warning" disabled={saving || !adjustedPrice} onClick={() => setConfirm('grade_mismatch')}>등급차이 처리</button>
                    <button className="btn btn-sm btn-danger" disabled={saving || !rejectionReason.trim()} onClick={() => setConfirm('reject')}>반려 처리</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirm !== null}
        title={confirm === 'approve' ? '합격 처리' : confirm === 'grade_mismatch' ? '등급차이 처리' : '반려 처리'}
        body={confirm === 'approve'
          ? '이 검수 건을 합격 처리하시겠습니까?'
          : confirm === 'grade_mismatch'
            ? '이 검수 건을 등급차이로 처리하시겠습니까?'
            : '이 검수 건을 반려 처리하시겠습니까?'}
        confirmLabel="확인"
        confirmVariant={confirm === 'reject' ? 'danger' : confirm === 'grade_mismatch' ? 'warning' : 'success'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
