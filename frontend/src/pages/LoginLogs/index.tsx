import { useState, useMemo } from 'react';
import { mockLoginLogs } from '../../data/mockLoginLogs';
import { Pagination } from '../../components/common/Pagination';
import type { LoginLog } from '../../types';

const PAGE_SIZE = 15;

type LoginResult = LoginLog['result'];
const RESULT_COLORS: Record<LoginResult, string> = {
  success: 'success', fail_password: 'warning', fail_suspended: 'danger', fail_not_found: 'secondary',
};
const RESULT_LABELS: Record<LoginResult, string> = {
  success: '성공', fail_password: '비밀번호 오류', fail_suspended: '계정 정지', fail_not_found: '계정 없음',
};

export default function LoginLogsPage() {
  const [result, setResult] = useState<LoginResult | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => mockLoginLogs.filter(l => {
    if (result !== 'all' && l.result !== result) return false;
    if (search && !l.email.toLowerCase().includes(search.toLowerCase()) &&
        !(l.userNickname ?? '').toLowerCase().includes(search.toLowerCase()) &&
        !l.ipAddress.includes(search)) return false;
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [result, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const successCount = filtered.filter(l => l.result === 'success').length;
  const failCount = filtered.filter(l => l.result !== 'success').length;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">로그인 기록</h5>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: '전체', value: filtered.length, color: 'primary' },
          { label: '성공', value: successCount, color: 'success' },
          { label: '실패', value: failCount, color: 'danger' },
        ].map(s => (
          <div className="col-md-3" key={s.label}>
            <div className="card border-0 shadow-sm text-center py-2">
              <div className={`fw-bold text-${s.color}`} style={{ fontSize: '1.4rem' }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={result}
                onChange={e => { setResult(e.target.value as LoginResult | 'all'); setPage(1); }}>
                <option value="all">전체 결과</option>
                {Object.entries(RESULT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="이메일 / 닉네임 / IP 검색"
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
                <th>이메일</th>
                <th>닉네임</th>
                <th>결과</th>
                <th>IP 주소</th>
                <th>기기 / 브라우저</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">로그인 기록이 없습니다.</td></tr>
              )}
              {paged.map(l => (
                <tr key={l.id}>
                  <td className="ps-3 small text-muted text-nowrap">{l.createdAt.slice(0, 16).replace('T', ' ')}</td>
                  <td className="small">{l.email}</td>
                  <td className="small text-muted">{l.userNickname ?? <span className="text-danger">—</span>}</td>
                  <td><span className={`badge bg-${RESULT_COLORS[l.result]}`}>{RESULT_LABELS[l.result]}</span></td>
                  <td className="small font-monospace text-muted">{l.ipAddress}</td>
                  <td className="small text-muted">{l.device}</td>
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
