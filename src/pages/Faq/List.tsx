import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockFaq } from '../../data/mockFaq';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Faq } from '../../types';

const PAGE_SIZE = 10;
type FaqStatus = Faq['status'];

const STATUS_COLORS: Record<FaqStatus, string> = {
  published: 'success', draft: 'secondary',
};
const STATUS_LABELS: Record<FaqStatus, string> = {
  published: '게시중', draft: '임시저장',
};

const CATEGORIES = ['전체', '거래', '검수', '정산', '배송', '계정', '기타'];

export default function FaqListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'faq') : false;

  const [status, setStatus] = useState<FaqStatus | 'all'>('all');
  const [category, setCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockFaq.filter(f => {
    if (status !== 'all' && f.status !== status) return false;
    if (category !== '전체' && f.category !== category) return false;
    if (search && !f.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, category, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">FAQ 관리</h5>
        {canEdit && (
          <Link to="/faq/new" className="btn btn-sm btn-primary">+ FAQ 등록</Link>
        )}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as FaqStatus | 'all'); setPage(1); }}>
                <option value="all">전체 상태</option>
                <option value="published">게시중</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={category}
                onChange={e => { setCategory(e.target.value); setPage(1); }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="질문 검색"
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
                <th>카테고리</th>
                <th>질문</th>
                <th>상태</th>
                <th>조회수</th>
                <th>최종 수정</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">FAQ가 없습니다.</td></tr>
              )}
              {paged.map(f => (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/faq/${f.id}`)}>
                  <td className="ps-3 text-muted small">{f.order}</td>
                  <td><span className="badge bg-light text-dark">{f.category}</span></td>
                  <td className="small fw-medium">{f.question}</td>
                  <td><span className={`badge bg-${STATUS_COLORS[f.status]}`}>{STATUS_LABELS[f.status]}</span></td>
                  <td className="small text-muted">{f.viewCount.toLocaleString()}</td>
                  <td className="small text-muted">{f.updatedAt.slice(0, 10)}</td>
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
