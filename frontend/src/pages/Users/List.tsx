import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../../data/mockUsers';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';

const PAGE_SIZE = 10;

const MANNER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'high', label: '4.5 이상' },
  { value: 'mid', label: '3.0 ~ 4.4' },
  { value: 'low', label: '3.0 미만' },
] as const;

type MannerFilter = 'all' | 'high' | 'mid' | 'low';

export default function UserListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [mannerFilter, setMannerFilter] = useState<MannerFilter>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockUsers.filter(u => {
    if (statusFilter !== 'all' && u.accountStatus !== statusFilter) return false;
    if (mannerFilter === 'high' && u.mannerScore < 4.5) return false;
    if (mannerFilter === 'mid' && (u.mannerScore < 3.0 || u.mannerScore >= 4.5)) return false;
    if (mannerFilter === 'low' && u.mannerScore >= 3.0) return false;
    if (search && !u.nickname.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, statusFilter, mannerFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || statusFilter !== 'all' || mannerFilter !== 'all';

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">사용자 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="닉네임 / 이메일 검색"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {hasFilters && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setSearch(''); setStatusFilter('all'); setMannerFilter('all'); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
          <div className="row g-3">
            {/* Status Radio */}
            <div className="col-auto">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="text-muted small fw-semibold">계정 상태:</span>
                {([['all', '전체'], ['active', '활성'], ['suspended', '정지']] as const).map(([v, label]) => (
                  <div key={v} className="form-check form-check-inline mb-0">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="statusFilter"
                      id={`status-${v}`}
                      checked={statusFilter === v}
                      onChange={() => { setStatusFilter(v); setPage(1); }}
                    />
                    <label className="form-check-label small" htmlFor={`status-${v}`}>{label}</label>
                  </div>
                ))}
              </div>
            </div>
            {/* Manner Score Select */}
            <div className="col-auto">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="text-muted small fw-semibold">매너 점수:</span>
                {MANNER_OPTIONS.map(m => (
                  <div key={m.value} className="form-check form-check-inline mb-0">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="mannerFilter"
                      id={`manner-${m.value}`}
                      checked={mannerFilter === m.value}
                      onChange={() => { setMannerFilter(m.value); setPage(1); }}
                    />
                    <label className="form-check-label small" htmlFor={`manner-${m.value}`}>{m.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">ID</th>
                <th>닉네임</th>
                <th>이메일</th>
                <th>매너 점수</th>
                <th>신뢰 점수</th>
                <th>판매수</th>
                <th>구매수</th>
                <th>계정 상태</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted py-4">사용자가 없습니다.</td></tr>
              )}
              {paged.map(u => (
                <tr key={u.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${u.id}`)}>
                  <td className="ps-3 small text-muted">#{u.id}</td>
                  <td className="fw-medium small">{u.nickname}</td>
                  <td className="small text-muted">{u.email}</td>
                  <td>
                    <span className={`fw-medium small ${u.mannerScore >= 4.5 ? 'text-success' : u.mannerScore < 3 ? 'text-danger' : 'text-warning'}`}>
                      ★ {u.mannerScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="small">{u.trustScore}</td>
                  <td className="small">{u.salesCount}</td>
                  <td className="small">{u.purchaseCount}</td>
                  <td><StatusBadge status={u.accountStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {filtered.length}명</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
