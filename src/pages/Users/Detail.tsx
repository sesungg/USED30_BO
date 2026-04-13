import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockUsers } from '../../data/mockUsers';
import { mockOrders } from '../../data/mockOrders';
import { mockProducts } from '../../data/mockProducts';
import { mockSettlements } from '../../data/mockSettlements';
import { mockPenalties } from '../../data/mockPenalties';
import { mockLoginLogs } from '../../data/mockLoginLogs';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { BoUser, UserPenalty } from '../../types';

type Tab = 'profile' | 'purchases' | 'sales' | 'settlements' | 'account' | 'notifications' | 'cs' | 'changes' | 'penalties' | 'loginlogs';

// ── Inline mock data for extended user history ──────────────────────────────

const MOCK_CS: Record<string, { id: string; type: string; title: string; status: string; createdAt: string; resolvedAt?: string }[]> = {
  u1: [
    { id: 'cs1', type: '거래문의', title: '판매자 연락 안됨', status: 'resolved', createdAt: '2026-03-10T10:00:00Z', resolvedAt: '2026-03-11T14:00:00Z' },
    { id: 'cs2', type: '등급불일치', title: '수령 음반 상태 불량', status: 'pending', createdAt: '2026-04-05T09:00:00Z' },
  ],
  u3: [
    { id: 'cs3', type: '환불요청', title: '배송 파손으로 환불 요청', status: 'resolved', createdAt: '2026-02-20T11:00:00Z', resolvedAt: '2026-02-22T15:00:00Z' },
  ],
  u5: [
    { id: 'cs4', type: '계정이슈', title: '계정 정지 이의신청', status: 'rejected', createdAt: '2026-01-15T09:00:00Z', resolvedAt: '2026-01-16T10:00:00Z' },
  ],
  u8: [
    { id: 'cs5', type: '거래문의', title: '반품 관련 문의', status: 'in_progress', createdAt: '2026-04-09T12:00:00Z' },
  ],
};

const MOCK_NOTIFICATIONS: Record<string, { id: string; type: string; message: string; sentAt: string; channel: string }[]> = {
  u1: [
    { id: 'n1', type: '거래', message: '구매자가 구매확정했습니다.', sentAt: '2026-04-07T14:00:00Z', channel: 'push' },
    { id: 'n2', type: '검수', message: '등급차이 통보가 접수되었습니다.', sentAt: '2026-04-06T10:00:00Z', channel: 'email' },
    { id: 'n3', type: '정산', message: '정산이 완료되었습니다. ₩99,000', sentAt: '2026-04-08T10:00:00Z', channel: 'push' },
  ],
  u3: [
    { id: 'n4', type: '거래', message: '판매자가 상품을 발송했습니다.', sentAt: '2026-04-11T09:00:00Z', channel: 'push' },
    { id: 'n5', type: '시스템', message: '매너 점수가 변경되었습니다.', sentAt: '2026-04-01T10:00:00Z', channel: 'email' },
  ],
  u4: [
    { id: 'n6', type: '정산', message: '정산이 완료되었습니다. ₩162,000', sentAt: '2026-04-10T09:00:00Z', channel: 'push' },
    { id: 'n7', type: '검수', message: '검수 접수가 완료되었습니다.', sentAt: '2026-04-03T10:00:00Z', channel: 'email' },
  ],
  u8: [
    { id: 'n8', type: '거래', message: '반품 신청이 접수되었습니다.', sentAt: '2026-04-09T10:00:00Z', channel: 'push' },
  ],
};

const MOCK_PROFILE_CHANGES: Record<string, { id: string; field: string; before: string; after: string; changedAt: string; changedBy: string }[]> = {
  u1: [
    { id: 'pc1', field: '닉네임', before: '재즈팬', after: '재즈러버', changedAt: '2024-06-01T10:00:00Z', changedBy: '본인' },
    { id: 'pc2', field: '이메일', before: 'jazzfan@example.com', after: 'jazz@example.com', changedAt: '2024-09-15T14:00:00Z', changedBy: '본인' },
  ],
  u4: [
    { id: 'pc3', field: '닉네임', before: '음반수집가', after: '레코드맨', changedAt: '2024-01-10T09:00:00Z', changedBy: '본인' },
    { id: 'pc4', field: '매너점수', before: '4.7', after: '4.9', changedAt: '2026-03-01T09:00:00Z', changedBy: '관리자' },
  ],
  u5: [
    { id: 'pc5', field: '계정상태', before: 'active', after: 'suspended', changedAt: '2026-01-15T09:00:00Z', changedBy: '관리자' },
  ],
};

const MOCK_ACCOUNT_HISTORY: Record<string, { id: string; bankName: string; accountNumber: string; accountHolder: string; registeredAt: string; status: 'active' | 'removed' }[]> = {
  u1: [
    { id: 'ah1', bankName: '신한은행', accountNumber: '110-000-111111', accountHolder: '김재즈', registeredAt: '2024-03-15T10:00:00Z', status: 'removed' },
    { id: 'ah2', bankName: '카카오뱅크', accountNumber: '3333-12-3456789', accountHolder: '김재즈', registeredAt: '2024-08-20T10:00:00Z', status: 'active' },
  ],
  u2: [
    { id: 'ah3', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '이소울', registeredAt: '2024-05-20T10:00:00Z', status: 'active' },
  ],
  u4: [
    { id: 'ah4', bankName: '국민은행', accountNumber: '123456-12-123456', accountHolder: '박레코드', registeredAt: '2023-12-20T10:00:00Z', status: 'active' },
  ],
  u6: [
    { id: 'ah5', bankName: '우리은행', accountNumber: '1002-123-456789', accountHolder: '최펑크', registeredAt: '2024-03-05T10:00:00Z', status: 'active' },
  ],
  u8: [
    { id: 'ah6', bankName: '하나은행', accountNumber: '123-456789-01234', accountHolder: '정블루스', registeredAt: '2024-05-01T10:00:00Z', status: 'active' },
  ],
};

const CS_STATUS_LABELS: Record<string, string> = {
  pending: '대기', in_progress: '처리중', resolved: '해결', rejected: '거절',
};

const PENALTY_TYPE_LABELS: Record<UserPenalty['type'], string> = {
  warning: '경고', restricted: '제한', suspended: '이용정지', banned: '영구정지',
};
const PENALTY_STATUS_LABELS: Record<UserPenalty['status'], string> = {
  active: '적용중', expired: '만료', revoked: '취소됨',
};
const PENALTY_STATUS_COLORS: Record<UserPenalty['status'], string> = {
  active: 'danger', expired: 'secondary', revoked: 'warning',
};

const LOGIN_RESULT_LABELS: Record<string, string> = {
  success: '성공', fail_password: '비밀번호 오류', fail_suspended: '계정 정지', fail_not_found: '계정 없음',
};
const LOGIN_RESULT_COLORS: Record<string, string> = {
  success: 'success', fail_password: 'warning', fail_suspended: 'danger', fail_not_found: 'secondary',
};

const TAB_LIST: { key: Tab; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'purchases', label: '구매내역' },
  { key: 'sales', label: '판매내역' },
  { key: 'settlements', label: '정산내역' },
  { key: 'account', label: '계좌 현황' },
  { key: 'notifications', label: '알림 내역' },
  { key: 'cs', label: 'CS 내역' },
  { key: 'changes', label: '변경 내역' },
  { key: 'penalties', label: '패널티' },
  { key: 'loginlogs', label: '로그인 기록' },
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { user: adminUser } = useAuth();
  const canEdit = adminUser ? canWrite(adminUser.role, 'users') : false;

  const [user, setUser] = useState<BoUser | null>(() => mockUsers.find(u => u.id === id) ?? null);
  const [mannerScore, setMannerScore] = useState(user?.mannerScore.toString() ?? '');
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate' | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: user?.nickname ?? '', email: user?.email ?? '', phone: (user as BoUser & { phone?: string })?.phone ?? '' });
  const [penalties, setPenalties] = useState<UserPenalty[]>(() => mockPenalties.filter(p => p.userId === id));
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState<{ type: UserPenalty['type']; reason: string; duration: string }>({ type: 'warning', reason: '', duration: '' });

  if (!user) return <div className="text-center py-5 text-muted">사용자를 찾을 수 없습니다.</div>;

  const userPurchases = mockOrders.filter(o => o.buyerId === id);
  const userSales = mockProducts.filter(p => p.sellerId === id);
  const userSettlements = mockSettlements.filter(s => s.sellerId === id);
  const csRecords = MOCK_CS[id ?? ''] ?? [];
  const notifications = MOCK_NOTIFICATIONS[id ?? ''] ?? [];
  const profileChanges = MOCK_PROFILE_CHANGES[id ?? ''] ?? [];
  const accountHistory = MOCK_ACCOUNT_HISTORY[id ?? ''] ?? [];
  const userLoginLogs = mockLoginLogs.filter(l => l.userId === id || l.email === user.email);

  function saveProfile() {
    if (!editForm.nickname.trim()) { showToast('닉네임을 입력해주세요.', 'warning'); return; }
    if (!editForm.email.trim()) { showToast('이메일을 입력해주세요.', 'warning'); return; }
    setUser(prev => prev ? { ...prev, nickname: editForm.nickname, email: editForm.email } : null);
    setIsEditingProfile(false);
    showToast('사용자 정보가 수정되었습니다.', 'success');
  }

  function addPenalty() {
    if (!penaltyForm.reason.trim()) { showToast('사유를 입력해주세요.', 'warning'); return; }
    const newPenalty: UserPenalty = {
      id: `p${Date.now()}`,
      userId: id ?? '',
      type: penaltyForm.type,
      reason: penaltyForm.reason,
      duration: penaltyForm.duration ? Number(penaltyForm.duration) : undefined,
      status: 'active',
      adminId: adminUser?.id ?? 'a1',
      adminNickname: adminUser?.nickname ?? '관리자',
      createdAt: new Date().toISOString(),
      expiresAt: penaltyForm.duration
        ? new Date(Date.now() + Number(penaltyForm.duration) * 86400000).toISOString()
        : undefined,
    };
    setPenalties(prev => [newPenalty, ...prev]);
    setPenaltyForm({ type: 'warning', reason: '', duration: '' });
    setShowPenaltyForm(false);
    showToast('패널티가 부여되었습니다.', 'success');
  }

  function revokePenalty(penaltyId: string) {
    setPenalties(prev => prev.map(p => p.id === penaltyId ? { ...p, status: 'revoked' as const, revokedAt: new Date().toISOString() } : p));
    showToast('패널티가 취소되었습니다.', 'success');
  }

  function saveMannerScore() {
    const score = parseFloat(mannerScore);
    if (isNaN(score) || score < 0 || score > 5) {
      showToast('매너 점수는 0~5 사이의 숫자여야 합니다.', 'warning');
      return;
    }
    setUser(prev => prev ? { ...prev, mannerScore: score } : null);
    showToast('매너 점수가 수정되었습니다.', 'success');
  }

  function executeAccountAction(action: 'suspend' | 'activate') {
    setUser(prev => prev ? { ...prev, accountStatus: action === 'suspend' ? 'suspended' : 'active' } : null);
    showToast(action === 'suspend' ? '계정이 정지되었습니다.' : '계정이 활성화되었습니다.', 'success');
    setConfirmAction(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <Link to="/users" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{user.nickname}</h5>
        <StatusBadge status={user.accountStatus} />
        <span className="text-muted small ms-auto">가입일: {user.createdAt.slice(0, 10)}</span>
      </div>

      {/* Quick Stats */}
      <div className="row g-2 mb-3">
        {[
          { label: '매너 점수', value: `★ ${user.mannerScore.toFixed(1)}`, color: user.mannerScore >= 4.5 ? 'success' : user.mannerScore < 3 ? 'danger' : 'warning' },
          { label: '신뢰 점수', value: user.trustScore, color: 'primary' },
          { label: '판매 수', value: `${user.salesCount}건`, color: 'secondary' },
          { label: '구매 수', value: `${user.purchaseCount}건`, color: 'secondary' },
        ].map(stat => (
          <div key={stat.label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-2">
              <div className={`fs-5 fw-bold text-${stat.color}`}>{stat.value}</div>
              <div className="text-muted small">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TAB_LIST.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.key === 'purchases' && userPurchases.length > 0 && (
                <span className="badge bg-secondary ms-1" style={{ fontSize: 10 }}>{userPurchases.length}</span>
              )}
              {t.key === 'sales' && userSales.length > 0 && (
                <span className="badge bg-secondary ms-1" style={{ fontSize: 10 }}>{userSales.length}</span>
              )}
              {t.key === 'cs' && csRecords.length > 0 && (
                <span className="badge bg-danger ms-1" style={{ fontSize: 10 }}>{csRecords.length}</span>
              )}
              {t.key === 'penalties' && penalties.filter(p => p.status === 'active').length > 0 && (
                <span className="badge bg-danger ms-1" style={{ fontSize: 10 }}>{penalties.filter(p => p.status === 'active').length}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* ── 프로필 Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                기본 정보
                {canEdit && !isEditingProfile && (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => {
                    setEditForm({ nickname: user.nickname, email: user.email, phone: (user as BoUser & { phone?: string })?.phone ?? '' });
                    setIsEditingProfile(true);
                  }}>수정</button>
                )}
              </div>
              <div className="card-body">
                {isEditingProfile ? (
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">닉네임</label>
                      <input className="form-control form-control-sm" value={editForm.nickname}
                        onChange={e => setEditForm(p => ({ ...p, nickname: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">이메일</label>
                      <input type="email" className="form-control form-control-sm" value={editForm.email}
                        onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">전화번호</label>
                      <input className="form-control form-control-sm" value={editForm.phone}
                        onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="010-0000-0000" />
                    </div>
                    <div className="col-12 d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-primary" onClick={saveProfile}>저장</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditingProfile(false)}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-2 small">
                    <div className="col-4 text-muted">ID</div><div className="col-8 fw-medium">#{user.id}</div>
                    <div className="col-4 text-muted">닉네임</div><div className="col-8 fw-medium">{user.nickname}</div>
                    <div className="col-4 text-muted">이메일</div><div className="col-8">{user.email}</div>
                    <div className="col-4 text-muted">가입일</div><div className="col-8">{user.createdAt.slice(0, 10)}</div>
                    <div className="col-4 text-muted">판매 수</div><div className="col-8">{user.salesCount}건</div>
                    <div className="col-4 text-muted">구매 수</div><div className="col-8">{user.purchaseCount}건</div>
                    <div className="col-4 text-muted">신뢰 점수</div><div className="col-8">{user.trustScore}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold">매너 점수</div>
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-4 fw-bold text-warning">★ {user.mannerScore.toFixed(1)}</div>
                  {canEdit && (
                    <div className="d-flex gap-2 align-items-center">
                      <input
                        type="number" className="form-control form-control-sm" style={{ width: 80 }}
                        min={0} max={5} step={0.1}
                        value={mannerScore}
                        onChange={e => setMannerScore(e.target.value)}
                      />
                      <button className="btn btn-sm btn-primary" onClick={saveMannerScore}>저장</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            {canEdit && (
              <div className="card border-0 shadow-sm mb-3 border-secondary-subtle">
                <div className="card-header bg-white fw-semibold">계정 관리</div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    계정을 정지하면 해당 사용자는 서비스를 이용할 수 없습니다.
                  </p>
                  {user.accountStatus === 'active' ? (
                    <button className="btn btn-danger" onClick={() => setConfirmAction('suspend')}>
                      계정 정지
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={() => setConfirmAction('activate')}>
                      계정 활성화
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 구매내역 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'purchases' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">구매 내역 ({userPurchases.length}건)</div>
          <div className="card-body p-0">
            {userPurchases.length === 0 ? (
              <div className="text-center text-muted py-4">구매 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">주문 ID</th>
                    <th>아티스트 / 앨범</th>
                    <th>결제 금액</th>
                    <th>결제 수단</th>
                    <th>상태</th>
                    <th>주문일</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userPurchases.map(o => (
                    <tr key={o.id}>
                      <td className="ps-3 small text-muted">#{o.id}</td>
                      <td>
                        <div className="small fw-medium">{o.product.artistName}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{o.product.albumName}</div>
                      </td>
                      <td className="small fw-medium">₩{o.payment.amount.toLocaleString()}</td>
                      <td className="small text-muted">{o.payment.method === 'card' ? '카드' : o.payment.method === 'transfer' ? '계좌이체' : '잔액'}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="small text-muted">{o.createdAt.slice(0, 10)}</td>
                      <td><Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-primary">상세</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── 판매내역 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'sales' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">판매 상품 ({userSales.length}건)</div>
          <div className="card-body p-0">
            {userSales.length === 0 ? (
              <div className="text-center text-muted py-4">판매 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">상품 ID</th>
                    <th>아티스트 / 앨범</th>
                    <th>미디어 등급</th>
                    <th>가격</th>
                    <th>상태</th>
                    <th>등록일</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userSales.map(p => (
                    <tr key={p.id}>
                      <td className="ps-3 small text-muted">#{p.id}</td>
                      <td>
                        <div className="small fw-medium">{p.artistName}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{p.albumName}</div>
                      </td>
                      <td><GradeTag grade={p.mediaGrade} showLabel={false} /></td>
                      <td className="small fw-medium">₩{p.price.toLocaleString()}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="small text-muted">{p.createdAt.slice(0, 10)}</td>
                      <td><Link to={`/products/${p.id}`} className="btn btn-sm btn-outline-primary">상세</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── 정산내역 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'settlements' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
            <span>정산 내역 ({userSettlements.length}건)</span>
            {userSettlements.length > 0 && (
              <span className="small text-muted">
                총 수령: ₩{userSettlements.filter(s => s.status === 'completed').reduce((a, s) => a + s.netAmount, 0).toLocaleString()}
              </span>
            )}
          </div>
          <div className="card-body p-0">
            {userSettlements.length === 0 ? (
              <div className="text-center text-muted py-4">정산 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">정산 ID</th>
                    <th>아티스트 / 앨범</th>
                    <th>판매가</th>
                    <th>수수료</th>
                    <th>실수령액</th>
                    <th>방식</th>
                    <th>상태</th>
                    <th>정산일</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userSettlements.map(s => (
                    <tr key={s.id}>
                      <td className="ps-3 small text-muted">#{s.id}</td>
                      <td>
                        <div className="small fw-medium">{s.artistName}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{s.albumName}</div>
                      </td>
                      <td className="small">₩{s.salePrice.toLocaleString()}</td>
                      <td className="small text-danger">-₩{s.feeAmount.toLocaleString()}</td>
                      <td className="small fw-bold text-success">₩{s.netAmount.toLocaleString()}</td>
                      <td className="small text-muted">{s.trigger === 'confirm' ? '구매확정' : s.trigger === 'auto' ? '자동' : '수동'}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td className="small text-muted">{s.settledAt ? s.settledAt.slice(0, 10) : '—'}</td>
                      <td><Link to={`/settlements/${s.id}`} className="btn btn-sm btn-outline-primary">상세</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── 계좌 현황 Tab ───────────────────────────────────────────────── */}
      {activeTab === 'account' && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold">현재 정산 계좌</div>
              <div className="card-body">
                {user.settlementAccount ? (
                  <div className="row g-2 small">
                    <div className="col-4 text-muted">은행</div><div className="col-8 fw-medium">{user.settlementAccount.bankName}</div>
                    <div className="col-4 text-muted">계좌번호</div><div className="col-8 fw-medium">{user.settlementAccount.accountNumber}</div>
                    <div className="col-4 text-muted">예금주</div><div className="col-8">{user.settlementAccount.accountHolder}</div>
                    <div className="col-4 text-muted">상태</div>
                    <div className="col-8"><span className="badge bg-success">활성</span></div>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">등록된 계좌가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">계좌 등록 내역</div>
              <div className="card-body p-0">
                {accountHistory.length === 0 ? (
                  <div className="text-center text-muted py-4">계좌 등록 내역이 없습니다.</div>
                ) : (
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">은행</th>
                        <th>계좌번호</th>
                        <th>예금주</th>
                        <th>등록일</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountHistory.map(a => (
                        <tr key={a.id}>
                          <td className="ps-3 small">{a.bankName}</td>
                          <td className="small">{a.accountNumber}</td>
                          <td className="small">{a.accountHolder}</td>
                          <td className="small text-muted">{a.registeredAt.slice(0, 10)}</td>
                          <td>
                            <span className={`badge ${a.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {a.status === 'active' ? '활성' : '해제'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 알림 내역 Tab ───────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">알림 발송 내역 ({notifications.length}건)</div>
          <div className="card-body p-0">
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-4">알림 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">유형</th>
                    <th>메시지</th>
                    <th>채널</th>
                    <th>발송일시</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n.id}>
                      <td className="ps-3"><span className="badge bg-info text-dark">{n.type}</span></td>
                      <td className="small">{n.message}</td>
                      <td>
                        <span className={`badge ${n.channel === 'push' ? 'bg-primary' : 'bg-secondary'}`}>
                          {n.channel === 'push' ? '푸시' : '이메일'}
                        </span>
                      </td>
                      <td className="small text-muted">{n.sentAt.slice(0, 16).replace('T', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── CS 내역 Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'cs' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">CS 내역 ({csRecords.length}건)</div>
          <div className="card-body p-0">
            {csRecords.length === 0 ? (
              <div className="text-center text-muted py-4">CS 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">유형</th>
                    <th>제목</th>
                    <th>상태</th>
                    <th>접수일</th>
                    <th>처리일</th>
                  </tr>
                </thead>
                <tbody>
                  {csRecords.map(cs => (
                    <tr key={cs.id}>
                      <td className="ps-3"><span className="badge bg-warning text-dark">{cs.type}</span></td>
                      <td className="small fw-medium">{cs.title}</td>
                      <td>
                        <span className={`badge ${
                          cs.status === 'resolved' ? 'bg-success' :
                          cs.status === 'rejected' ? 'bg-danger' :
                          cs.status === 'in_progress' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {CS_STATUS_LABELS[cs.status] ?? cs.status}
                        </span>
                      </td>
                      <td className="small text-muted">{cs.createdAt.slice(0, 10)}</td>
                      <td className="small text-muted">{cs.resolvedAt ? cs.resolvedAt.slice(0, 10) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── 변경 내역 Tab ───────────────────────────────────────────────── */}
      {activeTab === 'changes' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">프로필 변경 내역 ({profileChanges.length}건)</div>
          <div className="card-body p-0">
            {profileChanges.length === 0 ? (
              <div className="text-center text-muted py-4">변경 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">항목</th>
                    <th>변경 전</th>
                    <th>변경 후</th>
                    <th>변경 주체</th>
                    <th>변경일시</th>
                  </tr>
                </thead>
                <tbody>
                  {profileChanges.map(ch => (
                    <tr key={ch.id}>
                      <td className="ps-3 small fw-medium">{ch.field}</td>
                      <td className="small text-muted">{ch.before}</td>
                      <td className="small fw-medium">{ch.after}</td>
                      <td>
                        <span className={`badge ${ch.changedBy === '관리자' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {ch.changedBy}
                        </span>
                      </td>
                      <td className="small text-muted">{ch.changedAt.slice(0, 16).replace('T', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── 패널티 Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'penalties' && (
        <div>
          {canEdit && (
            <div className="mb-3">
              {showPenaltyForm ? (
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white fw-semibold">패널티 부여</div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">유형</label>
                        <select className="form-select form-select-sm" value={penaltyForm.type}
                          onChange={e => setPenaltyForm(p => ({ ...p, type: e.target.value as UserPenalty['type'] }))}>
                          <option value="warning">경고</option>
                          <option value="suspended">이용정지</option>
                          <option value="banned">영구정지</option>
                        </select>
                      </div>
                      {penaltyForm.type === 'suspended' && (
                        <div className="col-md-3">
                          <label className="form-label small fw-semibold">정지 기간 (일)</label>
                          <input type="number" className="form-control form-control-sm" value={penaltyForm.duration}
                            min={1} placeholder="예: 30"
                            onChange={e => setPenaltyForm(p => ({ ...p, duration: e.target.value }))} />
                        </div>
                      )}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">사유</label>
                        <input className="form-control form-control-sm" value={penaltyForm.reason}
                          onChange={e => setPenaltyForm(p => ({ ...p, reason: e.target.value }))}
                          placeholder="패널티 부여 사유를 입력하세요" />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button className="btn btn-sm btn-danger" onClick={addPenalty}>부여</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowPenaltyForm(false)}>취소</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn btn-sm btn-danger" onClick={() => setShowPenaltyForm(true)}>+ 패널티 부여</button>
              )}
            </div>
          )}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">패널티 내역 ({penalties.length}건)</div>
            <div className="card-body p-0">
              {penalties.length === 0 ? (
                <div className="text-center text-muted py-4">패널티 내역이 없습니다.</div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">유형</th>
                      <th>사유</th>
                      <th>기간</th>
                      <th>상태</th>
                      <th>부여자</th>
                      <th>부여일</th>
                      <th>만료일</th>
                      {canEdit && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {penalties.map(p => (
                      <tr key={p.id}>
                        <td className="ps-3">
                          <span className={`badge bg-${p.type === 'banned' ? 'dark' : p.type === 'suspended' ? 'danger' : 'warning text-dark'}`}>
                            {PENALTY_TYPE_LABELS[p.type]}
                          </span>
                        </td>
                        <td className="small">{p.reason}</td>
                        <td className="small text-muted">{p.duration ? `${p.duration}일` : '—'}</td>
                        <td>
                          <span className={`badge bg-${PENALTY_STATUS_COLORS[p.status]}`}>
                            {PENALTY_STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="small text-muted">{p.adminNickname}</td>
                        <td className="small text-muted">{p.createdAt.slice(0, 10)}</td>
                        <td className="small text-muted">{p.expiresAt ? p.expiresAt.slice(0, 10) : '무기한'}</td>
                        {canEdit && (
                          <td>
                            {p.status === 'active' && (
                              <button className="btn btn-sm btn-outline-secondary"
                                onClick={() => revokePenalty(p.id)}>취소</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 로그인 기록 Tab ─────────────────────────────────────────────── */}
      {activeTab === 'loginlogs' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">로그인 기록 ({userLoginLogs.length}건)</div>
          <div className="card-body p-0">
            {userLoginLogs.length === 0 ? (
              <div className="text-center text-muted py-4">로그인 기록이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">일시</th>
                    <th>결과</th>
                    <th>IP 주소</th>
                    <th>기기 / 브라우저</th>
                  </tr>
                </thead>
                <tbody>
                  {userLoginLogs.map(l => (
                    <tr key={l.id}>
                      <td className="ps-3 small text-muted text-nowrap">{l.createdAt.slice(0, 16).replace('T', ' ')}</td>
                      <td>
                        <span className={`badge bg-${LOGIN_RESULT_COLORS[l.result]}`}>
                          {LOGIN_RESULT_LABELS[l.result]}
                        </span>
                      </td>
                      <td className="small font-monospace text-muted">{l.ipAddress}</td>
                      <td className="small text-muted">{l.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmAction !== null}
        title={confirmAction === 'suspend' ? '계정 정지' : '계정 활성화'}
        body={confirmAction === 'suspend'
          ? `"${user.nickname}" 계정을 정지하시겠습니까?`
          : `"${user.nickname}" 계정을 활성화하시겠습니까?`}
        confirmLabel={confirmAction === 'suspend' ? '정지' : '활성화'}
        confirmVariant={confirmAction === 'suspend' ? 'danger' : 'success'}
        onConfirm={() => confirmAction && executeAccountAction(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
