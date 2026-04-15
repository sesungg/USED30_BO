import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../../data/mockProducts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { Pagination } from '../../components/common/Pagination';
import type { ProductStatus, MediaGrade, Genre } from '../../types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'inspection_pending', label: '검수대기' },
  { value: 'on_sale', label: '판매중' },
  { value: 'sold', label: '판매완료' },
  { value: 'returning', label: '반송중' },
  { value: 'cancelled', label: '취소' },
  { value: 'disposed', label: '폐기' },
];

const GRADE_OPTIONS: { value: MediaGrade | 'all'; label: string }[] = [
  { value: 'all', label: '전체 등급' },
  { value: 'M', label: 'M' },
  { value: 'NM', label: 'NM' },
  { value: 'VG+', label: 'VG+' },
  { value: 'VG', label: 'VG' },
  { value: 'G+', label: 'G+' },
  { value: 'G', label: 'G' },
  { value: 'F', label: 'F' },
  { value: 'P', label: 'P' },
];

const ALL_GENRES: Genre[] = ['JAZZ', 'R&B', 'SOUL', 'ROCK', 'CLASSICAL', 'HIP-HOP', 'FUNK', 'BLUES', 'POP', 'DISCO'];

export default function ProductListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');
  const [gradeFilter, setGradeFilter] = useState<MediaGrade | 'all'>('all');
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  function toggleGenre(genre: Genre) {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setPage(1);
  }

  const filtered = useMemo(() => mockProducts.filter(p => {
    if (status !== 'all' && p.status !== status) return false;
    if (gradeFilter !== 'all' && p.mediaGrade !== gradeFilter) return false;
    if (selectedGenres.length > 0 && !p.genre.some(g => selectedGenres.includes(g as Genre))) return false;
    if (search && !p.artistName.toLowerCase().includes(search.toLowerCase()) &&
        !p.albumName.toLowerCase().includes(search.toLowerCase()) &&
        !p.sellerNickname.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [status, gradeFilter, selectedGenres, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || status !== 'all' || gradeFilter !== 'all' || selectedGenres.length > 0;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">상품 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={status}
                onChange={e => { setStatus(e.target.value as ProductStatus | 'all'); setPage(1); }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={gradeFilter}
                onChange={e => { setGradeFilter(e.target.value as MediaGrade | 'all'); setPage(1); }}>
                {GRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="아티스트 / 앨범 / 판매자 검색"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {hasFilters && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setSearch(''); setStatus('all'); setGradeFilter('all'); setSelectedGenres([]); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
          {/* Genre Checkboxes */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted small fw-semibold">장르:</span>
            {ALL_GENRES.map(genre => (
              <div key={genre} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                />
                <label className="form-check-label small" htmlFor={`genre-${genre}`}>{genre}</label>
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
                <th className="ps-3">ID</th>
                <th>아티스트 / 앨범</th>
                <th>포맷</th>
                <th>미디어 등급</th>
                <th>가격</th>
                <th>판매자</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted py-4">상품이 없습니다.</td></tr>
              )}
              {paged.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${p.id}`)}>
                  <td className="ps-3 small text-muted">#{p.id}</td>
                  <td>
                    <div className="fw-medium small">{p.artistName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{p.albumName}</div>
                  </td>
                  <td className="small">{p.format}</td>
                  <td><GradeTag grade={p.mediaGrade} showLabel={false} /></td>
                  <td className="small fw-medium">₩{p.price.toLocaleString()}</td>
                  <td className="small text-muted">{p.sellerNickname}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="small text-muted">{p.createdAt.slice(0, 10)}</td>
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
