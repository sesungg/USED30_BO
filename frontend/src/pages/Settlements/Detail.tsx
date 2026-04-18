import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { canWrite } from '../../constants/permissions';
import { fetchSettlement, processSettlement, type SettlementDetail } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';

function triggerLabel(trigger: string) {
  if (trigger === 'manual_confirm') {
    return '수동 확정';
  }
  if (trigger === 'auto_3day') {
    return '3일 자동';
  }
  return trigger;
}

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user ? canWrite(user.role, 'settlements') : false;

  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    void fetchSettlement(id)
      .then(response => {
        if (!cancelled) {
          setSettlement(response);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '정산 정보를 불러오지 못했습니다.');
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

  async function handleProcess() {
    if (!id) {
      return;
    }

    setSaving(true);
    try {
      const updated = await processSettlement(id);
      setSettlement(updated);
      setConfirm(false);
      showToast('정산 처리를 완료했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '정산 처리에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-muted">정산 정보를 불러오는 중입니다.</div>;
  }

  if (error || !settlement) {
    return <div className="alert alert-danger">{error || '정산 건을 찾을 수 없습니다.'}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/settlements" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">정산 상세 #{settlement.id}</h5>
        <StatusBadge status={settlement.status} />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">정산 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">주문</div>
                <div className="col-8">
                  {settlement.orderId ? <Link to={`/orders/${settlement.orderId}`} className="text-decoration-none">#{settlement.orderId}</Link> : '—'}
                </div>
                <div className="col-4 text-muted">판매자</div>
                <div className="col-8">
                  {settlement.sellerId
                    ? <Link to={`/users/${settlement.sellerId}`} className="text-decoration-none fw-medium">{settlement.sellerNickname ?? settlement.sellerId}</Link>
                    : (settlement.sellerNickname ?? '—')}
                </div>
                <div className="col-4 text-muted">판매자 이메일</div><div className="col-8">{settlement.sellerEmail ?? '—'}</div>
                <div className="col-4 text-muted">판매가</div><div className="col-8">{formatPrice(settlement.salePrice)}</div>
                <div className="col-4 text-muted">수수료율</div><div className="col-8">{settlement.feeRate}%</div>
                <div className="col-4 text-muted">수수료</div><div className="col-8 text-danger">{formatPrice(settlement.feeAmount)}</div>
                <div className="col-4 text-muted">실수령액</div><div className="col-8 fw-medium text-success">{formatPrice(settlement.netAmount)}</div>
                <div className="col-4 text-muted">트리거</div><div className="col-8">{triggerLabel(settlement.trigger)}</div>
                <div className="col-4 text-muted">생성일</div><div className="col-8">{formatDate(settlement.createdAt, true)}</div>
                <div className="col-4 text-muted">정산 완료일</div><div className="col-8">{formatDate(settlement.settledAt, true)}</div>
                <div className="col-4 text-muted">이체 ID</div><div className="col-8">{settlement.pgTransferId ?? '—'}</div>
                <div className="col-4 text-muted">실패 사유</div><div className="col-8">{settlement.failedReason ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">관리 작업</div>
            <div className="card-body">
              {!canEdit || settlement.status !== 'pending' ? (
                <p className="small text-muted mb-0">현재 수동 처리 가능한 상태가 아닙니다.</p>
              ) : (
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => setConfirm(true)}>
                  정산 처리
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirm}
        title="정산 처리"
        body="이 정산 건을 처리 상태로 변경하시겠습니까?"
        confirmLabel="처리"
        confirmVariant="primary"
        onConfirm={handleProcess}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
