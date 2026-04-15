import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockInspections } from '../../data/mockInspections';
import { mockOrders } from '../../data/mockOrders';
import { mockProducts } from '../../data/mockProducts';
import { mockSettlements } from '../../data/mockSettlements';
import { StatusBadge } from '../../components/common/StatusBadge';

function KpiCard({ title, value, sub, color }: { title: string; value: number | string; sub: string; color: string }) {
  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <p className="text-muted small mb-1">{title}</p>
              <h3 className={`fw-bold mb-0 text-${color}`}>{value}</h3>
              <p className="text-muted small mt-1 mb-0">{sub}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const now = new Date();

  const pendingInspections = useMemo(
    () => mockInspections.filter(i => i.result === 'pending'),
    []
  );

  const urgentInspections = useMemo(
    () => pendingInspections
      .filter(i => i.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 5),
    [pendingInspections]
  );

  const activeOrders = useMemo(
    () => mockOrders.filter(o =>
      ['payment_complete', 'inspection_pending', 'inspection_pass', 'shipping'].includes(o.status)
    ),
    []
  );

  const pendingSettlements = useMemo(
    () => mockSettlements.filter(s => s.status === 'pending'),
    []
  );

  const activeProducts = useMemo(
    () => mockProducts.filter(p => p.status === 'on_sale' || p.status === 'inspection_pending'),
    []
  );

  const recentOrders = useMemo(
    () => [...mockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    []
  );

  function getRemainingHours(deadline: string) {
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 3600000));
  }

  return (
    <div>
      <h5 className="fw-bold mb-4">대시보드</h5>

      {/* KPI Cards */}
      <div className="row row-cols-2 row-cols-lg-4 g-3 mb-4">
        <KpiCard
          title="검수 대기"
          value={pendingInspections.length}
          sub="처리 필요"
          color="warning"
        />
        <KpiCard
          title="진행 중 주문"
          value={activeOrders.length}
          sub="처리 중"
          color="primary"
        />
        <KpiCard
          title="미정산"
          value={pendingSettlements.length}
          sub={`₩${pendingSettlements.reduce((s, x) => s + x.netAmount, 0).toLocaleString()}`}
          color="success"
        />
        <KpiCard
          title="활성 매물"
          value={activeProducts.length}
          sub="판매중 + 검수대기"
          color="info"
        />
      </div>

      <div className="row g-3">
        {/* Urgent Inspections */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold">⚠️ 긴급 검수 (72h 임박)</span>
              <Link to="/inspections" className="btn btn-sm btn-outline-primary">전체 보기</Link>
            </div>
            <div className="card-body p-0">
              {urgentInspections.length === 0 ? (
                <div className="p-4 text-center text-muted small">긴급 검수 건 없음</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {urgentInspections.map(ins => {
                    const hours = getRemainingHours(ins.deadline!);
                    return (
                      <li key={ins.id} className="list-group-item d-flex align-items-center justify-content-between px-3 py-2">
                        <div>
                          <div className="fw-medium small">{ins.artistName}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{ins.albumName}</div>
                        </div>
                        <span className={`badge ${hours < 24 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {hours}h 남음
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-semibold">📦 최근 주문</span>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">전체 보기</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">주문 ID</th>
                    <th>상품</th>
                    <th>구매자</th>
                    <th>금액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td className="ps-3">
                        <Link to={`/orders/${o.id}`} className="text-decoration-none small">
                          #{o.id}
                        </Link>
                      </td>
                      <td className="small">{o.product.artistName}</td>
                      <td className="small text-muted">{o.buyerNickname}</td>
                      <td className="small">₩{o.payment.amount.toLocaleString()}</td>
                      <td><StatusBadge status={o.status} /></td>
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
