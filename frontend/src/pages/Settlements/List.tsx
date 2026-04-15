import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSettlements } from '../../data/mockSettlements';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import type { SettlementStatus } from '../../types';

const PAGE_SIZE = 10;

const TRIGGER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'confirm', label: '구매확정' },
  { value: 'auto', label: '자동' },
  { value: 'manual', label: '수동' },
] as const;

type TriggerFilter = 'all' | 'confirm' | 'auto' | 'manual';

export default function SettlementListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SettlementStatus | 'all'>('all');
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockSettlements.filter(s => {
    if (status !== 'all' && s.status !== status) return false;
    if (triggerFilter !== 'all' && s.trigger !== triggerFilter) return false;
    if (search && !s.sellerNickname.toLowerCase().includes(search.toLowerCase()) &&
        !s.artistName.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && s.createdAt < dateFrom) return false;
    if (dateTo && s.createdAt > dateTo + 'T23:59:59Z') return false;
    return true;
  }), [status, triggerFilter, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || dateFrom || dateTo || status !== 'all' || triggerFilter !== 'all';

  function exportCsv() {
    const header = '정산ID,주문ID,판매자,아티스트,앨범,판매가,수수료,실수령액,정산방식,상태,정산일';
    const rows = filtered.map(s =>
      [s.id, s.orderId, s.sellerNickname, s.artistName, s.albumName,
       s.salePrice, s.feeAmount, s.netAmount, s.trigger, s.status, s.settledAt ?? ''].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `settlements_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">정산 관리</h5>
        <button className="btn btn-sm btn-outline-success" onClick={exportCsv}>
          📥 CSV 내보내기
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as SettlementStatus | 'all'); setPage(1); }}>
                <option value="all">전체</option>
                <option value="pending">미정산</option>
                <option value="completed">정산완료</option>
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control form-control-sm" placeholder="판매자 / 아티스트 검색"
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
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setStatus('all'); setTriggerFilter('all'); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
          {/* Trigger Type Radio */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="text-muted small fw-semibold">정산 방식:</span>
            {TRIGGER_OPTIONS.map(t => (
              <div key={t.value} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="radio"
                  name="triggerFilter"
                  id={`trigger-${t.value}`}
                  checked={triggerFilter === t.value}
                  onChange={() => { setTriggerFilter(t.value); setPage(1); }}
                />
                <label className="form-check-label small" htmlFor={`trigger-${t.value}`}>{t.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">정산 ID</th>
                <th>판매자</th>
                <th>아티스트 / 앨범</th>
                <th>판매가</th>
                <th>수수료(10%)</th>
                <th>실수령액</th>
                <th>정산 방식</th>
                <th>상태</th>
                <th>정산일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted py-4">정산 건이 없습니다.</td></tr>
              )}
              {paged.map(s => (
                <tr key={s.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/settlements/${s.id}`)}>
                  <td className="ps-3 small text-muted">#{s.id}</td>
                  <td className="small">{s.sellerNickname}</td>
                  <td>
                    <div className="small fw-medium">{s.artistName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{s.albumName}</div>
                  </td>
                  <td className="small">₩{s.salePrice.toLocaleString()}</td>
                  <td className="small text-danger">-₩{s.feeAmount.toLocaleString()}</td>
                  <td className="small fw-bold text-success">₩{s.netAmount.toLocaleString()}</td>
                  <td className="small text-muted">
                    {s.trigger === 'confirm' ? '구매확정' : s.trigger === 'auto' ? '자동' : '수동'}
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td className="small text-muted">{s.settledAt ? s.settledAt.slice(0, 10) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {filtered.length}건 · 미정산 합계: ₩{
            filtered.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.netAmount, 0).toLocaleString()
          }</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
