import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchOrder, type OrderDetail } from '../../lib/api';
import { formatDate } from '../../lib/format';

export default function OrderReturnPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    void fetchOrder(id)
      .then(response => {
        if (!cancelled) {
          setOrder(response);
        }
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

  if (loading) {
    return <div className="text-center py-5 text-muted">반품 정보를 불러오는 중입니다.</div>;
  }

  if (error || !order) {
    return <div className="alert alert-danger">{error || '주문을 찾을 수 없습니다.'}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-secondary">← 주문 상세</Link>
        <h5 className="fw-bold mb-0">반품 정보 #{order.id}</h5>
      </div>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-header bg-white fw-semibold">반품/환불 상태</div>
        <div className="card-body">
          <div className="row g-2 small">
            <div className="col-4 text-muted">주문 상태</div><div className="col-8"><StatusBadge status={order.status} /></div>
            <div className="col-4 text-muted">구매자</div><div className="col-8">{order.buyerNickname ?? '—'}</div>
            <div className="col-4 text-muted">상품</div><div className="col-8">{order.artistName ?? '—'} / {order.albumName ?? '—'}</div>
            <div className="col-4 text-muted">주문일</div><div className="col-8">{formatDate(order.createdAt, true)}</div>
            <div className="col-4 text-muted">안내</div>
            <div className="col-8 text-muted">
              현재 백엔드에서는 반품 상세 사유/이미지 DTO를 아직 내려주지 않아, 이 화면은 주문 상태 중심으로만 표시됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
