import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockBanners } from '../../data/mockBanners';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Banner } from '../../types';

const PAGE_SIZE = 10;

type BannerStatus = Banner['status'];
type BannerPosition = Banner['position'];

const STATUS_COLORS: Record<BannerStatus, string> = {
  active: 'success', inactive: 'secondary', scheduled: 'info',
};
const STATUS_LABELS: Record<BannerStatus, string> = {
  active: '활성', inactive: '비활성', scheduled: '예약',
};
const POSITION_LABELS: Record<BannerPosition, string> = {
  main_top: '메인 상단', main_middle: '메인 중단', popup: '팝업', sidebar: '사이드바',
};

export default function BannerListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'banners') : false;

  const [status, setStatus] = useState<BannerStatus | 'all'>('all');
  const [position, setPosition] = useState<BannerPosition | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockBanners.filter(b => {
    if (status !== 'all' && b.status !== status) return false;
    if (position !== 'all' && b.position !== position) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, position, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">배너 관리</h5>
        {canEdit && (
          <Link to="/banners/new" className="btn btn-sm btn-primary">+ 배너 등록</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as BannerStatus | 'all'); setPage(1); }}>
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="scheduled">예약</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={position}
                onChange={e => { setPosition(e.target.value as BannerPosition | 'all'); setPage(1); }}>
                <option value="all">전체 위치</option>
                <option value="main_top">메인 상단</option>
                <option value="main_middle">메인 중단</option>
                <option value="popup">팝업</option>
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="배너 제목 검색"
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
                <th className="ps-3">순서</th>
                <th>제목</th>
                <th>위치</th>
                <th>상태</th>
                <th>노출 기간</th>
                <th>링크</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">배너가 없습니다.</td></tr>
              )}
              {paged.map(b => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/banners/${b.id}`)}>
                  <td className="ps-3 text-muted small">{b.order}</td>
                  <td className="fw-medium small">{b.title}</td>
                  <td><span className="badge bg-light text-dark">{POSITION_LABELS[b.position]}</span></td>
                  <td><span className={`badge bg-${STATUS_COLORS[b.status]}`}>{STATUS_LABELS[b.status]}</span></td>
                  <td className="small text-muted">
                    {b.startAt ? b.startAt.slice(0, 10) : '—'} ~ {b.endAt ? b.endAt.slice(0, 10) : '무기한'}
                  </td>
                  <td className="small text-muted">{b.linkUrl ?? '—'}</td>
                  <td className="small text-muted">{b.createdAt.slice(0, 10)}</td>
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
