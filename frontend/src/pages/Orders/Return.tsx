import { useParams, Link } from 'react-router-dom';
import { mockOrders } from '../../data/mockOrders';
import { StatusBadge } from '../../components/common/StatusBadge';

export default function OrderReturnPage() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrders.find(o => o.id === id);

  if (!order) return <div className="text-center py-5 text-muted">주문을 찾을 수 없습니다.</div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to={`/orders/${id}`} className="btn btn-sm btn-outline-secondary">← 주문 상세</Link>
        <h5 className="fw-bold mb-0">반품 정보 #{order.id}</h5>
      </div>

      {order.returnRequest ? (
        <div className="card border-0 shadow-sm" style={{ maxWidth: 600 }}>
          <div className="card-header bg-white fw-semibold">반품 신청 내역</div>
          <div className="card-body">
            <div className="row g-2 small">
              <div className="col-4 text-muted">반품 ID</div><div className="col-8">#{order.returnRequest.id}</div>
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
              <div className="col-4 text-muted">처리 상태</div>
              <div className="col-8"><StatusBadge status={order.returnRequest.status} /></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted">반품 신청 내역이 없습니다.</div>
      )}
    </div>
  );
}
