import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockOrders } from '../../data/mockOrders';
import { mockSettlements } from '../../data/mockSettlements';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Order } from '../../types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'orders') : false;

  const [order, setOrder] = useState<Order | null>(() => mockOrders.find(o => o.id === id) ?? null);
  const [carrier, setCarrier] = useState(order?.shipping?.carrier ?? '');
  const [trackingNo, setTrackingNo] = useState(order?.shipping?.trackingNo ?? '');
  const [confirm, setConfirm] = useState<null | { action: 'approve_return' | 'reject_return'; label: string; variant: string }>(null);

  if (!order) return <div className="text-center py-5 text-muted">주문을 찾을 수 없습니다.</div>;

  const settlement = mockSettlements.find(s => s.orderId === id);

  const PAYMENT_LABEL: Record<string, string> = { card: '카드', balance: '잔액', transfer: '계좌이체' };

  function saveShipping() {
    if (!carrier || !trackingNo) { showToast('택배사와 운송장 번호를 입력해주세요.', 'warning'); return; }
    setOrder(prev => prev ? {
      ...prev,
      status: 'shipping',
      shipping: { carrier, trackingNo, currentStatus: '배송 준비 중' },
    } : null);
    showToast('배송 정보가 저장되었습니다.', 'success');
  }

  function executeReturn(action: 'approve_return' | 'reject_return') {
    setOrder(prev => prev ? {
      ...prev,
      status: action === 'approve_return' ? 'refunded' : 'confirmed',
      returnRequest: prev.returnRequest ? {
        ...prev.returnRequest,
        status: action === 'approve_return' ? 'approved' : 'rejected',
      } : undefined,
    } : null);
    showToast(action === 'approve_return' ? '반품이 승인되었습니다.' : '반품이 거절되었습니다.', 'success');
    setConfirm(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/orders" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">주문 상세 #{order.id}</h5>
        <StatusBadge status={order.status} />
      </div>

      <div className="row g-3">
        {/* Left column */}
        <div className="col-lg-8">
          {/* Order Info */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">주문 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">결제 금액</div>
                <div className="col-8 fw-bold text-primary">₩{order.payment.amount.toLocaleString()}</div>
                <div className="col-4 text-muted">결제 수단</div>
                <div className="col-8">{PAYMENT_LABEL[order.payment.method] ?? order.payment.method}</div>
                <div className="col-4 text-muted">결제 일시</div>
                <div className="col-8">{order.payment.paidAt.slice(0, 16).replace('T', ' ')}</div>
                <div className="col-4 text-muted">주문일</div>
                <div className="col-8">{order.createdAt.slice(0, 10)}</div>
                {order.deliveredAt && <>
                  <div className="col-4 text-muted">수령일</div>
                  <div className="col-8">{order.deliveredAt.slice(0, 10)}</div>
                </>}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
              <span>상품 정보</span>
              <Link to={`/products/${order.productId}`} className="btn btn-sm btn-outline-secondary">상품 상세</Link>
            </div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">아티스트</div>
                <div className="col-8 fw-medium">{order.product.artistName}</div>
                <div className="col-4 text-muted">앨범</div>
                <div className="col-8">{order.product.albumName}</div>
                <div className="col-4 text-muted">포맷</div>
                <div className="col-8">{order.product.format} / {order.product.rpm}RPM</div>
                <div className="col-4 text-muted">미디어 등급</div>
                <div className="col-8"><GradeTag grade={order.product.mediaGrade} showLabel={false} /></div>
                <div className="col-4 text-muted">슬리브 등급</div>
                <div className="col-8"><GradeTag grade={order.product.sleeveGrade} showLabel={false} /></div>
                <div className="col-4 text-muted">판매자</div>
                <div className="col-8">
                  <Link to={`/users/${order.product.sellerId}`} className="text-decoration-none">
                    {order.product.sellerNickname}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Info */}
          {order.inspection && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                검수 정보
                <Link to={`/inspections/${order.inspection.id}`} className="btn btn-sm btn-outline-secondary">검수 상세</Link>
              </div>
              <div className="card-body">
                <div className="row g-2 small">
                  <div className="col-4 text-muted">검수 결과</div>
                  <div className="col-8"><StatusBadge status={order.inspection.result} /></div>
                  <div className="col-4 text-muted">판매자 선언</div>
                  <div className="col-8">
                    미디어 <GradeTag grade={order.inspection.sellerMediaGrade} showLabel={false} />
                    {' '}/ 슬리브 <GradeTag grade={order.inspection.sellerSleeveGrade} showLabel={false} />
                  </div>
                  {order.inspection.inspectorMediaGrade && <>
                    <div className="col-4 text-muted">검수원 판정</div>
                    <div className="col-8">
                      미디어 <GradeTag grade={order.inspection.inspectorMediaGrade} showLabel={false} />
                      {order.inspection.inspectorSleeveGrade && (
                        <> / 슬리브 <GradeTag grade={order.inspection.inspectorSleeveGrade} showLabel={false} /></>
                      )}
                    </div>
                  </>}
                  {order.inspection.adjustedPrice && <>
                    <div className="col-4 text-muted">조정 가격</div>
                    <div className="col-8 text-warning fw-medium">₩{order.inspection.adjustedPrice.toLocaleString()}</div>
                  </>}
                  {order.inspection.notes && <>
                    <div className="col-4 text-muted">메모</div>
                    <div className="col-8">{order.inspection.notes}</div>
                  </>}
                </div>
              </div>
            </div>
          )}

          {/* Shipping */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">배송 정보</div>
            <div className="card-body">
              {order.shipping ? (
                <div className="row g-2 small">
                  <div className="col-4 text-muted">택배사</div><div className="col-8">{order.shipping.carrier}</div>
                  <div className="col-4 text-muted">운송장 번호</div><div className="col-8 fw-medium">{order.shipping.trackingNo}</div>
                  <div className="col-4 text-muted">배송 상태</div><div className="col-8">{order.shipping.currentStatus}</div>
                  {order.shipping.estimatedAt && <>
                    <div className="col-4 text-muted">예상 도착일</div>
                    <div className="col-8">{order.shipping.estimatedAt.slice(0, 10)}</div>
                  </>}
                </div>
              ) : canEdit ? (
                <div className="row g-2">
                  <div className="col-md-4">
                    <input className="form-control form-control-sm" placeholder="택배사 (예: CJ대한통운)"
                      value={carrier} onChange={e => setCarrier(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <input className="form-control form-control-sm" placeholder="운송장 번호"
                      value={trackingNo} onChange={e => setTrackingNo(e.target.value)} />
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-sm btn-primary" onClick={saveShipping}>저장</button>
                  </div>
                </div>
              ) : (
                <p className="text-muted small mb-0">배송 정보 없음</p>
              )}
            </div>
          </div>

          {/* Return Request */}
          {order.returnRequest && (
            <div className="card border-0 shadow-sm border-danger-subtle mb-3">
              <div className="card-header bg-white fw-semibold text-danger">반품 신청</div>
              <div className="card-body">
                <div className="row g-2 small mb-3">
                  <div className="col-4 text-muted">사유</div>
                  <div className="col-8">{
                    order.returnRequest.reason === 'grade_mismatch' ? '등급 불일치' :
                    order.returnRequest.reason === 'delivery_damage' ? '배송 파손' : '오발송'
                  }</div>
                  {order.returnRequest.description && <>
                    <div className="col-4 text-muted">상세</div>
                    <div className="col-8">{order.returnRequest.description}</div>
                  </>}
                  <div className="col-4 text-muted">신청일</div>
                  <div className="col-8">{order.returnRequest.createdAt.slice(0, 10)}</div>
                  <div className="col-4 text-muted">상태</div>
                  <div className="col-8"><StatusBadge status={order.returnRequest.status} /></div>
                </div>
                {order.returnRequest.photos.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {order.returnRequest.photos.map((url, i) => (
                      <img key={i} src={url} alt="반품사진" className="rounded border"
                        style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
                {canEdit && order.returnRequest.status === 'requested' && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-success"
                      onClick={() => setConfirm({ action: 'approve_return', label: '반품 승인', variant: 'success' })}>
                      반품 승인
                    </button>
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => setConfirm({ action: 'reject_return', label: '반품 거절', variant: 'danger' })}>
                      반품 거절
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-lg-4">
          {/* Buyer Info */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">구매자</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">닉네임</div>
                <div className="col-8">
                  <Link to={`/users/${order.buyerId}`} className="text-decoration-none fw-medium">
                    {order.buyerNickname}
                  </Link>
                </div>
                <div className="col-4 text-muted">ID</div>
                <div className="col-8 text-muted">#{order.buyerId}</div>
              </div>
            </div>
          </div>

          {/* Settlement Info */}
          {settlement && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                <span>정산 정보</span>
                <Link to={`/settlements/${settlement.id}`} className="btn btn-sm btn-outline-secondary">정산 상세</Link>
              </div>
              <div className="card-body">
                <div className="row g-2 small">
                  <div className="col-5 text-muted">판매가</div>
                  <div className="col-7">₩{settlement.salePrice.toLocaleString()}</div>
                  <div className="col-5 text-muted">수수료</div>
                  <div className="col-7 text-danger">-₩{settlement.feeAmount.toLocaleString()}</div>
                  <div className="col-5 text-muted">실수령액</div>
                  <div className="col-7 fw-bold text-success">₩{settlement.netAmount.toLocaleString()}</div>
                  <div className="col-5 text-muted">정산 상태</div>
                  <div className="col-7"><StatusBadge status={settlement.status} /></div>
                  {settlement.settledAt && <>
                    <div className="col-5 text-muted">정산일</div>
                    <div className="col-7">{settlement.settledAt.slice(0, 10)}</div>
                  </>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          show={true}
          title={confirm.label}
          body={`${confirm.label} 처리하시겠습니까?`}
          confirmLabel={confirm.label}
          confirmVariant={confirm.variant}
          onConfirm={() => executeReturn(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
