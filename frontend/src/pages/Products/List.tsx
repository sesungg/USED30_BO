import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchProducts, type ProductSummary } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import type { ProductStatus } from '../../types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'inspection_pending', label: '검수대기' },
  { value: 'on_sale', label: '판매중' },
  { value: 'sold', label: '판매완료' },
  { value: 'returning', label: '반송중' },
  { value: 'cancelled', label: '취소' },
  { value: 'disposed', label: '폐기' },
  { value: 'draft', label: '임시저장' },
];

export default function ProductListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchProducts({ page, size: PAGE_SIZE, status, search })
      .then(response => {
        if (cancelled) {
          return;
        }
        setItems(response.content);
        setTotalPages(Math.max(response.totalPages, 1));
        setTotalElements(response.totalElements);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '상품 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">상품 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={status} onChange={event => { setStatus(event.target.value as ProductStatus | 'all'); setPage(1); }}>
                {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="아티스트 / 앨범 검색"
                value={search}
                onChange={event => { setSearch(event.target.value); setPage(1); }}
              />
            </div>
            {(search || status !== 'all') && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setStatus('all'); setSearch(''); setPage(1); }}>
                  초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">ID</th>
                <th>아티스트 / 앨범</th>
                <th>판매 희망가</th>
                <th>최종가</th>
                <th>판매자 ID</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center text-muted py-4">불러오는 중입니다.</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">상품이 없습니다.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${item.id}`)}>
                  <td className="ps-3 small text-muted">#{item.id}</td>
                  <td className="small">
                    <div className="fw-medium">{item.artistName}</div>
                    <div className="text-muted">{item.albumName}</div>
                  </td>
                  <td className="small fw-medium">{formatPrice(item.askingPrice)}</td>
                  <td className="small text-muted">{formatPrice(item.finalPrice)}</td>
                  <td className="small text-muted">{item.sellerId ?? '—'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="small text-muted">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {totalElements}건</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
