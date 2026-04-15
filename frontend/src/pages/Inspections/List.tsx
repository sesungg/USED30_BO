import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInspections } from '../../data/mockInspections';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { Pagination } from '../../components/common/Pagination';
import type { InspectionResult, MediaGrade } from '../../types';

const PAGE_SIZE = 10;
const ALL_GRADES: MediaGrade[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];

export default function InspectionListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<InspectionResult | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<MediaGrade[]>([]);
  const [page, setPage] = useState(1);

  function toggleGrade(grade: MediaGrade) {
    setSelectedGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
    setPage(1);
  }

  const filtered = useMemo(() => {
    return mockInspections.filter(i => {
      if (statusFilter !== 'all' && i.result !== statusFilter) return false;
      if (selectedGrades.length > 0 && !selectedGrades.includes(i.sellerMediaGrade)) return false;
      if (search && !i.artistName.toLowerCase().includes(search.toLowerCase()) &&
          !i.albumName.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && i.createdAt < dateFrom) return false;
      if (dateTo && i.createdAt > dateTo + 'T23:59:59Z') return false;
      return true;
    });
  }, [statusFilter, selectedGrades, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    all: mockInspections.length,
    pending: mockInspections.filter(i => i.result === 'pending').length,
    grade_mismatch: mockInspections.filter(i => i.result === 'grade_mismatch').length,
    rejected: mockInspections.filter(i => i.result === 'rejected').length,
    approved: mockInspections.filter(i => i.result === 'approved').length,
  }), []);

  function getRemainingHours(deadline?: string) {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 3600000));
  }

  const hasFilters = search || dateFrom || dateTo || selectedGrades.length > 0;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">검수 관리</h5>
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {([['all', '전체'], ['pending', '검수대기'], ['grade_mismatch', '등급차이'], ['rejected', '반려'], ['approved', '합격']] as const).map(([v, label]) => (
          <button
            key={v}
            className={`btn btn-sm ${statusFilter === v ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setStatusFilter(v); setPage(1); }}
          >
            {label} <span className="badge bg-white text-dark ms-1">{counts[v]}</span>
          </button>
        ))}
      </div>

      {/* Search & Advanced Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="아티스트명 / 앨범명 검색"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
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
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setSelectedGrades([]); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
          {/* Grade Checkboxes */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted small fw-semibold">판매자 등급:</span>
            {ALL_GRADES.map(grade => (
              <div key={grade} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onChange={() => toggleGrade(grade)}
                />
                <label className="form-check-label small" htmlFor={`grade-${grade}`}>{grade}</label>
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
                <th className="ps-3">검수 ID</th>
                <th>아티스트</th>
                <th>앨범</th>
                <th>판매자</th>
                <th>선언 등급</th>
                <th>결과</th>
                <th>SLA</th>
                <th>접수일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted py-4">검수 건이 없습니다.</td></tr>
              )}
              {paged.map(ins => {
                const hours = getRemainingHours(ins.deadline);
                return (
                  <tr key={ins.id} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/inspections/${ins.id}`)}>
                    <td className="ps-3 small text-muted">#{ins.id}</td>
                    <td className="fw-medium small">{ins.artistName}</td>
                    <td className="small">{ins.albumName}</td>
                    <td className="small text-muted">{ins.sellerNickname}</td>
                    <td>
                      <GradeTag grade={ins.sellerMediaGrade} showLabel={false} />
                    </td>
                    <td><StatusBadge status={ins.result} /></td>
                    <td>
                      {hours !== null ? (
                        <span className={`badge ${hours < 24 ? 'bg-danger' : hours < 48 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {hours}h
                        </span>
                      ) : <span className="text-muted small">—</span>}
                    </td>
                    <td className="small text-muted">{ins.createdAt.slice(0, 10)}</td>
                  </tr>
                );
              })}
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
