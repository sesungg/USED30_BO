import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchInspections, type InspectionSummary } from '../../lib/api';
import { formatDate, formatPrice, toDateTimeEndParam, toDateTimeParam } from '../../lib/format';
import type { InspectionResult } from '../../types';

const PAGE_SIZE = 10;

export default function InspectionListPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<InspectionResult | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InspectionSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchInspections({
      page,
      size: PAGE_SIZE,
      result,
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
          setError(err instanceof Error ? err.message : '검수 목록을 불러오지 못했습니다.');
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
  }, [page, result, search, dateFrom, dateTo]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">검수 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={result} onChange={event => { setResult(event.target.value as InspectionResult | 'all'); setPage(1); }}>
                <option value="all">전체</option>
                <option value="pending">검수대기</option>
                <option value="approved">합격</option>
                <option value="grade_mismatch">등급차이</option>
                <option value="rejected">반려</option>
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control form-control-sm" placeholder="아티스트 / 앨범 검색" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={event => { setDateFrom(event.target.value); setPage(1); }} />
            </div>
            <div className="col-auto text-muted small">~</div>
            <div className="col-auto">
              <input type="date" className="form-control form-control-sm" value={dateTo} onChange={event => { setDateTo(event.target.value); setPage(1); }} />
            </div>
            {(result !== 'all' || search || dateFrom || dateTo) && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setResult('all'); setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
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
                <th className="ps-3">검수 ID</th>
                <th>아티스트 / 앨범</th>
                <th>희망가</th>
                <th>조정가</th>
                <th>결과</th>
                <th>접수일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center text-muted py-4">불러오는 중입니다.</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">검수 건이 없습니다.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/inspections/${item.id}`)}>
                  <td className="ps-3 small text-muted">#{item.id}</td>
                  <td className="small">
                    <div className="fw-medium">{item.artistName ?? '—'}</div>
                    <div className="text-muted">{item.albumName ?? '—'}</div>
                  </td>
                  <td className="small">{formatPrice(item.originalPrice)}</td>
                  <td className="small text-warning">{formatPrice(item.adjustedPrice)}</td>
                  <td><StatusBadge status={item.result} /></td>
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
