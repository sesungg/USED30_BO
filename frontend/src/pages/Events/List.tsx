import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockEvents } from '../../data/mockEvents';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { MarketingEvent } from '../../types';

const PAGE_SIZE = 10;
type EventStatus = MarketingEvent['status'];

const STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'secondary', ongoing: 'success', upcoming: 'info', ended: 'secondary',
};
const STATUS_LABELS: Record<EventStatus, string> = {
  draft: '임시저장', ongoing: '진행중', upcoming: '예정', ended: '종료',
};

export default function EventListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'events') : false;

  const [status, setStatus] = useState<EventStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockEvents.filter(e => {
    if (status !== 'all' && e.status !== status) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">이벤트 관리</h5>
        {canEdit && (
          <Link to="/events/new" className="btn btn-sm btn-primary">+ 이벤트 등록</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as EventStatus | 'all'); setPage(1); }}>
                <option value="all">전체</option>
                <option value="ongoing">진행중</option>
                <option value="upcoming">예정</option>
                <option value="ended">종료</option>
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="이벤트명 검색"
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
                <th className="ps-3">이벤트명</th>
                <th>상태</th>
                <th>기간</th>
                <th>참여자 수</th>
                <th>연결 쿠폰</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">이벤트가 없습니다.</td></tr>
              )}
              {paged.map(e => (
                <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${e.id}`)}>
                  <td className="ps-3 fw-medium small">{e.title}</td>
                  <td><span className={`badge bg-${STATUS_COLORS[e.status]}`}>{STATUS_LABELS[e.status]}</span></td>
                  <td className="small text-muted">
                    {e.startAt.slice(0, 10)} ~ {e.endAt.slice(0, 10)}
                  </td>
                  <td className="small">{e.participantCount.toLocaleString()}명</td>
                  <td className="small text-muted">{e.couponId ?? '—'}</td>
                  <td className="small text-muted">{e.createdAt.slice(0, 10)}</td>
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
