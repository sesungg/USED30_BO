import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockSettlements } from '../../data/mockSettlements';
import { mockOrders } from '../../data/mockOrders';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Settlement } from '../../types';

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'settlements') : false;

  const [settlement, setSettlement] = useState<Settlement | null>(
    () => mockSettlements.find(s => s.id === id) ?? null
  );
  const [confirmSettle, setConfirmSettle] = useState(false);

  if (!settlement) return <div className="text-center py-5 text-muted">정산 건을 찾을 수 없습니다.</div>;

  const relatedOrder = mockOrders.find(o => o.id === settlement.orderId);

  function handleManualSettle() {
    setSettlement(prev => prev ? {
      ...prev,
      status: 'completed',
      settledAt: new Date().toISOString(),
      trigger: 'manual',
    } : null);
    showToast('수동 정산이 완료되었습니다.', 'success');
    setConfirmSettle(false);
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/settlements" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">정산 상세 #{settlement.id}</h5>
        <StatusBadge status={settlement.status} />
      </div>

      <div className="row g-3">
        {/* Left: Settlement + Product */}
        <div className="col-lg-7">
          {/* Settlement Info */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">정산 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-5 text-muted">주문 ID</div>
                <div className="col-7">
                  <Link to={`/orders/${settlement.orderId}`} className="text-decoration-none">#{settlement.orderId}</Link>
                </div>
                <div className="col-5 text-muted">판매자</div>
                <div className="col-7">
                  <Link to={`/users/${settlement.sellerId}`} className="text-decoration-none fw-medium">{settlement.sellerNickname}</Link>
                </div>
                <div className="col-5 text-muted">아티스트</div><div className="col-7 fw-medium">{settlement.artistName}</div>
                <div className="col-5 text-muted">앨범</div><div className="col-7">{settlement.albumName}</div>

                <div className="col-12"><hr className="my-1" /></div>

                <div className="col-5 text-muted">판매가</div>
                <div className="col-7 fw-medium">₩{settlement.salePrice.toLocaleString()}</div>
                <div className="col-5 text-muted">수수료 ({settlement.feeRate * 100}%)</div>
                <div className="col-7 text-danger">-₩{settlement.feeAmount.toLocaleString()}</div>
                <div className="col-5 fw-semibold">실수령액</div>
                <div className="col-7 fw-bold text-success fs-6">₩{settlement.netAmount.toLocaleString()}</div>

                <div className="col-12"><hr className="my-1" /></div>

                <div className="col-5 text-muted">정산 방식</div>
                <div className="col-7">{settlement.trigger === 'manual' ? '수동' : settlement.trigger === 'auto' ? '자동' : '구매확정'}</div>
                <div className="col-5 text-muted">생성일</div><div className="col-7">{settlement.createdAt.slice(0, 10)}</div>
                {settlement.settledAt && <>
                  <div className="col-5 text-muted">정산 완료일시</div>
                  <div className="col-7">{settlement.settledAt.slice(0, 16).replace('T', ' ')}</div>
                </>}
              </div>

              {canEdit && settlement.status === 'pending' && (
                <div className="mt-4">
                  <button className="btn btn-primary" onClick={() => setConfirmSettle(true)}>
                    수동 정산 처리
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
              <span>상품 정보</span>
              <Link to={`/products/${settlement.productId}`} className="btn btn-sm btn-outline-secondary">상품 상세</Link>
            </div>
            <div className="card-body">
              {relatedOrder ? (
                <div className="row g-2 small">
                  <div className="col-4 text-muted">아티스트</div>
                  <div className="col-8 fw-medium">{relatedOrder.product.artistName}</div>
                  <div className="col-4 text-muted">앨범</div>
                  <div className="col-8">{relatedOrder.product.albumName}</div>
                  <div className="col-4 text-muted">포맷</div>
                  <div className="col-8">{relatedOrder.product.format} / {relatedOrder.product.rpm}RPM</div>
                  <div className="col-4 text-muted">미디어 등급</div>
                  <div className="col-8"><GradeTag grade={relatedOrder.product.mediaGrade} showLabel={false} /></div>
                  <div className="col-4 text-muted">슬리브 등급</div>
                  <div className="col-8"><GradeTag grade={relatedOrder.product.sleeveGrade} showLabel={false} /></div>
                  <div className="col-4 text-muted">상품 상태</div>
                  <div className="col-8"><StatusBadge status={relatedOrder.product.status} /></div>
                </div>
              ) : (
                <p className="text-muted small mb-0">상품 정보 ID: #{settlement.productId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Buyer + Order Summary */}
        <div className="col-lg-5">
          {relatedOrder && (
            <>
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white fw-semibold">구매자 정보</div>
                <div className="card-body">
                  <div className="row g-2 small">
                    <div className="col-4 text-muted">닉네임</div>
                    <div className="col-8">
                      <Link to={`/users/${relatedOrder.buyerId}`} className="text-decoration-none fw-medium">
                        {relatedOrder.buyerNickname}
                      </Link>
                    </div>
                    <div className="col-4 text-muted">ID</div>
                    <div className="col-8 text-muted">#{relatedOrder.buyerId}</div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                  <span>주문 요약</span>
                  <Link to={`/orders/${relatedOrder.id}`} className="btn btn-sm btn-outline-secondary">주문 상세</Link>
                </div>
                <div className="card-body">
                  <div className="row g-2 small">
                    <div className="col-5 text-muted">주문 상태</div>
                    <div className="col-7"><StatusBadge status={relatedOrder.status} /></div>
                    <div className="col-5 text-muted">결제 금액</div>
                    <div className="col-7 fw-medium">₩{relatedOrder.payment.amount.toLocaleString()}</div>
                    <div className="col-5 text-muted">결제 수단</div>
                    <div className="col-7">
                      {relatedOrder.payment.method === 'card' ? '카드' :
                       relatedOrder.payment.method === 'transfer' ? '계좌이체' : '잔액'}
                    </div>
                    <div className="col-5 text-muted">주문일</div>
                    <div className="col-7">{relatedOrder.createdAt.slice(0, 10)}</div>
                    {relatedOrder.deliveredAt && <>
                      <div className="col-5 text-muted">수령일</div>
                      <div className="col-7">{relatedOrder.deliveredAt.slice(0, 10)}</div>
                    </>}
                    {relatedOrder.inspection && <>
                      <div className="col-5 text-muted">검수 결과</div>
                      <div className="col-7">
                        <StatusBadge status={relatedOrder.inspection.result} />
                        {' '}
                        <Link to={`/inspections/${relatedOrder.inspection.id}`} className="btn btn-sm btn-outline-secondary py-0 px-1" style={{ fontSize: 10 }}>
                          검수 상세
                        </Link>
                      </div>
                    </>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        show={confirmSettle}
        title="수동 정산 처리"
        body={`₩${settlement.netAmount.toLocaleString()}을 판매자 "${settlement.sellerNickname}"에게 정산 처리하시겠습니까?`}
        confirmLabel="정산 완료"
        confirmVariant="primary"
        onConfirm={handleManualSettle}
        onCancel={() => setConfirmSettle(false)}
      />
    </div>
  );
}
