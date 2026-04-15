import { useState, useMemo } from 'react';
import { mockAuditLogs } from '../../data/mockAuditLogs';
import { Pagination } from '../../components/common/Pagination';
import type { AuditLog, AdminRole } from '../../types';
import { ROLE_LABELS } from '../../constants/permissions';

const PAGE_SIZE = 15;

type AuditAction = AuditLog['action'];
const ACTION_COLORS: Record<AuditAction, string> = {
  read: 'secondary', create: 'success', update: 'primary', delete: 'danger', export: 'warning', login: 'info', logout: 'light',
};
const ACTION_LABELS: Record<AuditAction, string> = {
  read: '조회', create: '등록', update: '수정', delete: '삭제', export: '내보내기', login: '로그인', logout: '로그아웃',
};
const TARGET_LABELS: Record<string, string> = {
  user: '사용자', inspection: '검수', order: '주문', product: '상품',
  settlement: '정산', notice: '공지사항', coupon: '쿠폰', banner: '배너',
  event: '이벤트', faq: 'FAQ', admin: '관리자', permission: '권한', settings: '시스템 설정',
};

export default function AuditLogsPage() {
  const [action, setAction] = useState<AuditAction | 'all'>('all');
  const [adminRole, setAdminRole] = useState<AdminRole | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockAuditLogs.filter(l => {
    if (action !== 'all' && l.action !== action) return false;
    if (adminRole !== 'all' && l.adminRole !== adminRole) return false;
    if (search && !l.description.toLowerCase().includes(search.toLowerCase()) &&
        !l.adminNickname.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [action, adminRole, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">관리자 활동 로그</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={action}
                onChange={e => { setAction(e.target.value as AuditAction | 'all'); setPage(1); }}>
                <option value="all">전체 액션</option>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={adminRole}
                onChange={e => { setAdminRole(e.target.value as AdminRole | 'all'); setPage(1); }}>
                <option value="all">전체 역할</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="관리자명 / 내용 검색"
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
                <th className="ps-3">일시</th>
                <th>관리자</th>
                <th>역할</th>
                <th>액션</th>
                <th>대상</th>
                <th>내용</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">로그가 없습니다.</td></tr>
              )}
              {paged.map(l => (
                <tr key={l.id}>
                  <td className="ps-3 small text-muted text-nowrap">{l.createdAt.slice(0, 16).replace('T', ' ')}</td>
                  <td className="small fw-medium">{l.adminNickname}</td>
                  <td><span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>{ROLE_LABELS[l.adminRole]}</span></td>
                  <td><span className={`badge bg-${ACTION_COLORS[l.action]}`}>{ACTION_LABELS[l.action]}</span></td>
                  <td className="small text-muted">{TARGET_LABELS[l.targetType] ?? l.targetType}</td>
                  <td className="small">{l.description}</td>
                  <td className="small text-muted font-monospace">{l.ipAddress}</td>
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
