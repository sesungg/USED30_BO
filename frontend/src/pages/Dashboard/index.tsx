import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchDashboard, type DashboardStats } from '../../lib/api';
import { formatDate } from '../../lib/format';

function KpiCard({ title, value, sub, color }: { title: string; value: number | string; sub: string; color: string }) {
  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body">
          <p className="text-muted small mb-1">{title}</p>
          <h3 className={`fw-bold mb-0 text-${color}`}>{value}</h3>
          <p className="text-muted small mt-1 mb-0">{sub}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void fetchDashboard()
      .then(response => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '대시보드를 불러오지 못했습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-5 text-muted">대시보드를 불러오는 중입니다.</div>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-4">대시보드</h5>

      <div className="row row-cols-2 row-cols-lg-4 g-3 mb-4">
        <KpiCard title="검수 대기" value={data.todayInspectionPending} sub="처리 필요" color="warning" />
        <KpiCard title="진행 중 주문" value={data.activeOrders} sub="주문 상태 기준" color="primary" />
        <KpiCard title="미정산" value={data.pendingSettlements} sub="처리 필요" color="success" />
        <KpiCard title="활성 매물" value={data.activeProducts} sub="판매/검수 진행중" color="info" />
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold">검수 현황</span>
              <Link to="/inspections" className="btn btn-sm btn-outline-primary">전체 보기</Link>
            </div>
            <div className="card-body p-0">
              {data.urgentInspections.length === 0 ? (
                <div className="p-4 text-center text-muted small">표시할 검수 건이 없습니다.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.urgentInspections.map(inspection => (
                    <li key={inspection.id} className="list-group-item px-3 py-2">
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <div>
                          <div className="fw-medium small">{inspection.artistName ?? '—'}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{inspection.albumName ?? '—'}</div>
                        </div>
                        <StatusBadge status={inspection.result} />
                      </div>
                      <div className="small text-muted mt-1">{formatDate(inspection.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold">최근 주문</span>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">전체 보기</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">주문 ID</th>
                    <th>상품</th>
                    <th>구매자</th>
                    <th>상태</th>
                    <th>생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="ps-3 small">
                        <Link to={`/orders/${order.id}`} className="text-decoration-none">#{order.id}</Link>
                      </td>
                      <td className="small">
                        <div>{order.artistName ?? '—'}</div>
                        <div className="text-muted">{order.albumName ?? '—'}</div>
                      </td>
                      <td className="small text-muted">{order.buyerNickname ?? '—'}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="small text-muted">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
