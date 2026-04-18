import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchOrders, type OrderSummary } from '../../lib/api';
import { formatDate, toDateTimeEndParam, toDateTimeParam } from '../../lib/format';
import type { OrderStatus } from '../../types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'payment_complete', label: '결제완료' },
  { value: 'inspection_pending', label: '검수대기' },
  { value: 'inspection_pass', label: '검수합격' },
  { value: 'inspection_grade_mismatch', label: '등급차이' },
  { value: 'inspection_rejected', label: '검수반려' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '수령완료' },
  { value: 'confirmed', label: '구매확정' },
  { value: 'return_requested', label: '반품신청' },
  { value: 'refunded', label: '환불완료' },
  { value: 'cancelled', label: '취소' },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<OrderSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchOrders({
      page,
      size: PAGE_SIZE,
      status,
      search,
      startDate: toDateTimeParam(dateFrom),
      endDate: toDateTimeEndParam(dateTo),
    })
      .then(response => {
        if (cancelled) {
          return;
        }
        setItems(response.content);
        setTotalPages(Math.max(response.totalPages, 1));
        setTotalElements(response.totalElements);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '주문 목록을 불러오지 못했습니다.');
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
  }, [page, status, search, dateFrom, dateTo]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">주문 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={status} onChange={event => { setStatus(event.target.value as OrderStatus | 'all'); setPage(1); }}>
                {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control form-control-sm" placeholder="구매자 / 아티스트 검색" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={event => { setDateFrom(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto text-muted small">~</div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={event => { setDateTo(event.target.value); setPage(1); }} />
            </div>
            {(search || status !== 'all' || dateFrom || dateTo) && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setStatus('all'); setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">주문 ID</th>
                <th>아티스트 / 앨범</th>
                <th>구매자</th>
                <th>상품 ID</th>
                <th>상태</th>
                <th>주문일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center text-muted py-4">불러오는 중입니다.</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">주문이 없습니다.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${item.id}`)}>
                  <td className="ps-3 small text-muted">#{item.id}</td>
                  <td className="small">
                    <div className="fw-medium">{item.artistName ?? '—'}</div>
                    <div className="text-muted">{item.albumName ?? '—'}</div>
                  </td>
                  <td className="small">{item.buyerNickname ?? '—'}</td>
                  <td className="small text-muted">{item.productId ?? '—'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="small text-muted">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {totalElements}건</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
