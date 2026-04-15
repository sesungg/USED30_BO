import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockCoupons } from '../../data/mockCoupons';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { CouponStatus } from '../../types';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<CouponStatus, string> = {
  active: 'success', inactive: 'secondary', expired: 'danger',
};
const STATUS_LABELS: Record<CouponStatus, string> = {
  active: '활성', inactive: '비활성', expired: '만료',
};

export default function CouponListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'coupons') : false;

  const [status, setStatus] = useState<CouponStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockCoupons.filter(c => {
    if (status !== 'all' && c.status !== status) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">쿠폰 관리</h5>
        {canEdit && (
          <Link to="/coupons/new" className="btn btn-sm btn-primary">+ 쿠폰 등록</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as CouponStatus | 'all'); setPage(1); }}>
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="expired">만료</option>
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="쿠폰명 / 코드 검색"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">코드</th>
                <th>쿠폰명</th>
                <th>종류</th>
                <th>할인</th>
                <th>발급/사용</th>
                <th>상태</th>
                <th>만료일</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted py-4">쿠폰이 없습니다.</td></tr>
              )}
              {paged.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/coupons/${c.id}`)}>
                  <td className="ps-3 fw-medium small text-primary">{c.code}</td>
                  <td className="small">{c.name}</td>
                  <td className="small text-muted">{c.type === 'percentage' ? '정률' : '정액'}</td>
                  <td className="small fw-medium">
                    {c.type === 'percentage' ? `${c.value}%` : `₩${c.value.toLocaleString()}`}
                    {c.maxDiscount && <span className="text-muted ms-1">(최대 ₩{c.maxDiscount.toLocaleString()})</span>}
                  </td>
                  <td className="small">
                    <span>{c.issuedCount.toLocaleString()}</span>
                    <span className="text-muted"> / {c.usedCount.toLocaleString()}</span>
                    {c.totalLimit && <span className="text-muted"> (한도 {c.totalLimit})</span>}
                  </td>
                  <td><span className={`badge bg-${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span></td>
                  <td className="small text-muted">{c.expiresAt ? c.expiresAt.slice(0, 10) : '무기한'}</td>
                  <td className="small text-muted">{c.createdAt.slice(0, 10)}</td>
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
