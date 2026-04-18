import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchUsers, type UserSummary } from '../../lib/api';
import { formatDate } from '../../lib/format';

const PAGE_SIZE = 10;

export default function UserListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchUsers({ page, size: PAGE_SIZE, search })
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
          setError(err instanceof Error ? err.message : '사용자 목록을 불러오지 못했습니다.');
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
  }, [page, search]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">사용자 관리</h5>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="닉네임 / 이메일 검색"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            {search && (
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearch(''); setPage(1); }}>
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
                <th>닉네임</th>
                <th>이메일</th>
                <th>권한</th>
                <th>매너 점수</th>
                <th>판매수</th>
                <th>구매수</th>
                <th>계정 상태</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="text-center text-muted py-4">불러오는 중입니다.</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted py-4">사용자가 없습니다.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${item.id}`)}>
                  <td className="ps-3 small text-muted">#{item.id}</td>
                  <td className="fw-medium small">{item.nickname}</td>
                  <td className="small text-muted">{item.email}</td>
                  <td className="small">{item.adminRole ?? item.role}</td>
                  <td className="small">{item.mannerScore.toFixed(2)}</td>
                  <td className="small">{item.salesCount}</td>
                  <td className="small">{item.purchaseCount}</td>
                  <td><StatusBadge status={item.active ? 'active' : 'suspended'} /></td>
                  <td className="small text-muted">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex align-items-center justify-content-between">
          <small className="text-muted">총 {totalElements}명</small>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
