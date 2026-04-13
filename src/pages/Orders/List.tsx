import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockOrders } from '../../data/mockOrders';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
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

const PAYMENT_METHODS = [
  { value: 'all', label: '전체' },
  { value: 'card', label: '카드' },
  { value: 'balance', label: '잔액' },
  { value: 'transfer', label: '계좌이체' },
] as const;

type PaymentMethod = 'all' | 'card' | 'balance' | 'transfer';

export default function OrderListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return mockOrders.filter(o => {
      if (status !== 'all' && o.status !== status) return false;
      if (paymentMethod !== 'all' && o.payment.method !== paymentMethod) return false;
      if (search && !o.buyerNickname.toLowerCase().includes(search.toLowerCase()) &&
          !o.product.artistName.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && o.createdAt < dateFrom) return false;
      if (dateTo && o.createdAt > dateTo + 'T23:59:59Z') return false;
      return true;
    });
  }, [status, paymentMethod, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || dateFrom || dateTo || status !== 'all' || paymentMethod !== 'all';

  const PAYMENT_LABEL: Record<string, string> = { card: '카드', balance: '잔액', transfer: '계좌이체' };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">주문 관리</h5>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as OrderStatus | 'all'); setPage(1); }}>
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control form-control-sm" placeholder="구매자 / 아티스트 검색"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="col-auto text-muted small">~</div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            {hasFilters && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setStatus('all'); setPaymentMethod('all'); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
          {/* Payment Method Radio */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="text-muted small fw-semibold">결제 수단:</span>
            {PAYMENT_METHODS.map(m => (
              <div key={m.value} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id={`pm-${m.value}`}
                  checked={paymentMethod === m.value}
                  onChange={() => { setPaymentMethod(m.value); setPage(1); }}
                />
                <label className="form-check-label small" htmlFor={`pm-${m.value}`}>{m.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">주문 ID</th>
                <th>아티스트 / 앨범</th>
                <th>구매자</th>
                <th>결제 금액</th>
                <th>결제 수단</th>
                <th>상태</th>
                <th>주문일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">주문이 없습니다.</td></tr>
              )}
              {paged.map(o => (
                <tr key={o.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="ps-3 small text-muted">#{o.id}</td>
                  <td>
                    <div className="fw-medium small">{o.product.artistName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{o.product.albumName}</div>
                  </td>
                  <td className="small">{o.buyerNickname}</td>
                  <td className="small fw-medium">₩{o.payment.amount.toLocaleString()}</td>
                  <td className="small text-muted">{PAYMENT_LABEL[o.payment.method] ?? o.payment.method}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="small text-muted">{o.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {filtered.length}건</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
