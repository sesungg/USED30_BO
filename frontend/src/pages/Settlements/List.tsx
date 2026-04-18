import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchSettlements, type SettlementSummary } from '../../lib/api';
import { formatDate, formatPrice, toDateTimeEndParam, toDateTimeParam } from '../../lib/format';
import type { SettlementStatus } from '../../types';

const PAGE_SIZE = 10;

function triggerLabel(trigger: string) {
  if (trigger === 'manual_confirm') {
    return '수동 확정';
  }
  if (trigger === 'auto_3day') {
    return '3일 자동';
  }
  return trigger;
}

export default function SettlementListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SettlementStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SettlementSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchSettlements({
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
          setError(err instanceof Error ? err.message : '정산 목록을 불러오지 못했습니다.');
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
        <h5 className="fw-bold mb-0">정산 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={status} onChange={event => { setStatus(event.target.value as SettlementStatus | 'all'); setPage(1); }}>
                <option value="all">전체</option>
                <option value="pending">미정산</option>
                <option value="processing">처리중</option>
                <option value="completed">완료</option>
                <option value="failed">실패</option>
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control form-control-sm" placeholder="판매자 검색" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={event => { setDateFrom(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto text-muted small">~</div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={event => { setDateTo(event.target.value); setPage(1); }} />
            </div>
            {(status !== 'all' || search || dateFrom || dateTo) && (
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
                <th className="ps-3">정산 ID</th>
                <th>판매자</th>
                <th>판매가</th>
                <th>수수료</th>
                <th>실수령액</th>
                <th>트리거</th>
                <th>상태</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center text-muted py-4">불러오는 중입니다.</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted py-4">정산 건이 없습니다.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/settlements/${item.id}`)}>
                  <td className="ps-3 small text-muted">#{item.id}</td>
                  <td className="small">
                    <div className="fw-medium">{item.sellerNickname ?? '—'}</div>
                    <div className="text-muted">{item.sellerEmail ?? '—'}</div>
                  </td>
                  <td className="small">{formatPrice(item.salePrice)}</td>
                  <td className="small text-danger">{formatPrice(item.feeAmount)}</td>
                  <td className="small fw-medium text-success">{formatPrice(item.netAmount)}</td>
                  <td className="small text-muted">{triggerLabel(item.trigger)}</td>
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
