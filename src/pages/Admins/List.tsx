import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockAdminAccounts } from '../../data/mockAdminAccounts';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite, ROLE_LABELS } from '../../constants/permissions';
import type { AdminAccount, AdminRole } from '../../types';

const PAGE_SIZE = 10;

export default function AdminListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'admins') : false;

  const [role, setRole] = useState<AdminRole | 'all'>('all');
  const [status, setStatus] = useState<AdminAccount['status'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockAdminAccounts.filter(a => {
    if (role !== 'all' && a.role !== role) return false;
    if (status !== 'all' && a.status !== status) return false;
    if (search && !a.nickname.toLowerCase().includes(search.toLowerCase()) &&
        !a.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [role, status, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">관리자 관리</h5>
        {canEdit && (
          <Link to="/admins/new" className="btn btn-sm btn-primary">+ 관리자 추가</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={role}
                onChange={e => { setRole(e.target.value as AdminRole | 'all'); setPage(1); }}>
                <option value="all">전체 역할</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as AdminAccount['status'] | 'all'); setPage(1); }}>
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="닉네임 / 이메일 검색"
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
                <th className="ps-3">닉네임</th>
                <th>이메일</th>
                <th>역할</th>
                <th>상태</th>
                <th>마지막 로그인</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">관리자가 없습니다.</td></tr>
              )}
              {paged.map(a => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admins/${a.id}`)}>
                  <td className="ps-3 fw-medium small">{a.nickname}</td>
                  <td className="small text-muted">{a.email}</td>
                  <td><span className="badge bg-primary bg-opacity-10 text-primary">{ROLE_LABELS[a.role]}</span></td>
                  <td>
                    <span className={`badge bg-${a.status === 'active' ? 'success' : 'secondary'}`}>
                      {a.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="small text-muted">{a.lastLoginAt ? a.lastLoginAt.slice(0, 16).replace('T', ' ') : '—'}</td>
                  <td className="small text-muted">{a.createdAt.slice(0, 10)}</td>
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
