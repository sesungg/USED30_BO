import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockNotices } from '../../data/mockNotices';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { NoticeStatus, NoticeCategory } from '../../types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: NoticeStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'published', label: '게시중' },
  { value: 'draft', label: '임시저장' },
  { value: 'archived', label: '보관됨' },
];

const CATEGORIES: { value: NoticeCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체 카테고리' },
  { value: '공지', label: '공지' },
  { value: '업데이트', label: '업데이트' },
  { value: '이벤트', label: '이벤트' },
  { value: '점검', label: '점검' },
  { value: '기타', label: '기타' },
];

const STATUS_LABELS: Record<NoticeStatus, string> = {
  published: '게시중', draft: '임시저장', archived: '보관됨',
};
const STATUS_COLORS: Record<NoticeStatus, string> = {
  published: 'success', draft: 'secondary', archived: 'warning',
};

export default function NoticeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'notices') : false;

  const [status, setStatus] = useState<NoticeStatus | 'all'>('all');
  const [category, setCategory] = useState<NoticeCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockNotices.filter(n => {
    if (status !== 'all' && n.status !== status) return false;
    if (category !== 'all' && n.category !== category) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, category, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">공지사항 관리</h5>
        {canEdit && (
          <Link to="/notices/new" className="btn btn-sm btn-primary">+ 공지 등록</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as NoticeStatus | 'all'); setPage(1); }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={category}
                onChange={e => { setCategory(e.target.value as NoticeCategory | 'all'); setPage(1); }}>
                {CATEGORIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="제목 검색"
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
                <th className="ps-3" style={{ width: 40 }}>고정</th>
                <th>제목</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>작성자</th>
                <th>조회수</th>
                <th>게시일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">공지사항이 없습니다.</td></tr>
              )}
              {paged.map(n => (
                <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/notices/${n.id}`)}>
                  <td className="ps-3 text-center">{n.isPinned ? '📌' : ''}</td>
                  <td className="fw-medium small">{n.title}</td>
                  <td><span className="badge bg-light text-dark">{n.category}</span></td>
                  <td><span className={`badge bg-${STATUS_COLORS[n.status]}`}>{STATUS_LABELS[n.status]}</span></td>
                  <td className="small text-muted">{n.authorNickname}</td>
                  <td className="small text-muted">{n.viewCount.toLocaleString()}</td>
                  <td className="small text-muted">{n.publishedAt ? n.publishedAt.slice(0, 10) : '—'}</td>
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
