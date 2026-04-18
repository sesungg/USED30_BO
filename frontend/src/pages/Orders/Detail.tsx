import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { canWrite } from '../../constants/permissions';
import {
  approveOrderReturn,
  fetchOrder,
  registerOrderShipping,
  rejectOrderReturn,
  type OrderDetail,
} from '../../lib/api';
import { formatDate } from '../../lib/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user ? canWrite(user.role, 'orders') : false;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchOrder(id)
      .then(response => {
        if (cancelled) {
          return;
        }
        setOrder(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '주문 정보를 불러오지 못했습니다.');
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

  async function handleShippingSave() {
    if (!id || !carrier.trim() || !trackingNo.trim()) {
      showToast('택배사와 운송장 번호를 입력해주세요.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updated = await registerOrderShipping(id, carrier, trackingNo);
      setOrder(updated);
      showToast('배송 정보를 저장했습니다.');
      setCarrier('');
      setTrackingNo('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '배송 정보 저장에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleReturnAction(action: 'approve' | 'reject') {
    if (!id) {
      return;
    }

    setSaving(true);
    try {
      const updated = action === 'approve'
        ? await approveOrderReturn(id)
        : await rejectOrderReturn(id);
      setOrder(updated);
      setConfirm(null);
      showToast(action === 'approve' ? '반품을 승인했습니다.' : '반품을 거절했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '반품 처리에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-muted">주문 정보를 불러오는 중입니다.</div>;
  }

  if (error || !order) {
    return <div className="alert alert-danger">{error || '주문을 찾을 수 없습니다.'}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/orders" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">주문 상세 #{order.id}</h5>
        <StatusBadge status={order.status} />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">주문 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">구매자</div>
                <div className="col-8">
                  {order.buyerId
                    ? <Link to={`/users/${order.buyerId}`} className="text-decoration-none fw-medium">{order.buyerNickname ?? order.buyerId}</Link>
                    : (order.buyerNickname ?? '—')}
                </div>
                <div className="col-4 text-muted">구매자 이메일</div><div className="col-8">{order.buyerEmail ?? '—'}</div>
                <div className="col-4 text-muted">상품</div>
                <div className="col-8">
                  {order.productId
                    ? <Link to={`/products/${order.productId}`} className="text-decoration-none">{order.artistName ?? '—'} / {order.albumName ?? '—'}</Link>
                    : `${order.artistName ?? '—'} / ${order.albumName ?? '—'}`}
                </div>
                <div className="col-4 text-muted">검수</div>
                <div className="col-8">
                  {order.inspectionId ? <Link to={`/inspections/${order.inspectionId}`} className="text-decoration-none">#{order.inspectionId}</Link> : '—'}
                </div>
                <div className="col-4 text-muted">주문일</div><div className="col-8">{formatDate(order.createdAt, true)}</div>
                <div className="col-4 text-muted">수령일</div><div className="col-8">{formatDate(order.deliveredAt, true)}</div>
                <div className="col-4 text-muted">확정일</div><div className="col-8">{formatDate(order.confirmedAt, true)}</div>
                <div className="col-4 text-muted">자동 확정 예정</div><div className="col-8">{formatDate(order.autoConfirmAt, true)}</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">배송지 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">수령인</div><div className="col-8">{order.shippingName}</div>
                <div className="col-4 text-muted">연락처</div><div className="col-8">{order.shippingPhone}</div>
                <div className="col-4 text-muted">우편번호</div><div className="col-8">{order.shippingZipcode}</div>
                <div className="col-4 text-muted">주소</div><div className="col-8">{order.shippingAddress}</div>
                <div className="col-4 text-muted">상세주소</div><div className="col-8">{order.shippingAddress2 ?? '—'}</div>
              </div>

              {canEdit && ['inspection_pass', 'shipping'].includes(order.status) && (
                <div className="mt-4 pt-3 border-top">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <input className="form-control form-control-sm" placeholder="택배사" value={carrier} onChange={event => setCarrier(event.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control form-control-sm" placeholder="운송장 번호" value={trackingNo} onChange={event => setTrackingNo(event.target.value)} />
                    </div>
                    <div className="col-auto">
                      <button className="btn btn-sm btn-primary" disabled={saving} onClick={handleShippingSave}>
                        배송 정보 저장
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">관리 작업</div>
            <div className="card-body">
              <p className="small text-muted">현재 주문 상태: <StatusBadge status={order.status} /></p>
              {canEdit && order.status === 'return_requested' ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-success" disabled={saving} onClick={() => setConfirm('approve')}>
                    반품 승인
                  </button>
                  <button className="btn btn-sm btn-outline-danger" disabled={saving} onClick={() => setConfirm('reject')}>
                    반품 거절
                  </button>
                </div>
              ) : (
                <p className="small text-muted mb-0">이 주문에 가능한 추가 작업이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirm !== null}
        title={confirm === 'approve' ? '반품 승인' : '반품 거절'}
        body={confirm === 'approve' ? '이 주문의 반품을 승인하시겠습니까?' : '이 주문의 반품을 거절하시겠습니까?'}
        confirmLabel={confirm === 'approve' ? '승인' : '거절'}
        confirmVariant={confirm === 'approve' ? 'success' : 'danger'}
        onConfirm={() => confirm && handleReturnAction(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
