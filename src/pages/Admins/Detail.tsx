import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockAdminAccounts } from '../../data/mockAdminAccounts';
import { mockAuditLogs } from '../../data/mockAuditLogs';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite, ROLE_LABELS, SECTION_LABELS, ROLE_PERMISSIONS } from '../../constants/permissions';
import type { AdminAccount, AdminRole } from '../../types';

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'admins') : false;
  const isNew = id === 'new';

  const existing = isNew ? null : mockAdminAccounts.find(a => a.id === id);
  const [form, setForm] = useState<Partial<AdminAccount>>(existing ?? {
    email: '', nickname: '', role: 'inspector', status: 'active',
  });
  const [isEditing, setIsEditing] = useState(isNew);
  const [tab, setTab] = useState<'info' | 'permissions' | 'activity'>('info');

  if (!isNew && !existing) {
    return <div className="text-center py-5 text-muted">관리자를 찾을 수 없습니다.</div>;
  }

  function handleSave() {
    if (!form.email?.trim()) { showToast('이메일을 입력해주세요.', 'warning'); return; }
    if (!form.nickname?.trim()) { showToast('닉네임을 입력해주세요.', 'warning'); return; }
    setIsEditing(false);
    showToast(isNew ? '관리자가 등록되었습니다.' : '관리자 정보가 수정되었습니다.', 'success');
    if (isNew) navigate('/admins');
  }

  const adminLogs = mockAuditLogs.filter(l => l.adminId === id);
  const rolePerms = form.role ? ROLE_PERMISSIONS[form.role as AdminRole] ?? [] : [];

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admins" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{isNew ? '관리자 추가' : `관리자 상세 — ${existing?.nickname}`}</h5>
        {!isNew && (
          <span className={`badge bg-${existing?.status === 'active' ? 'success' : 'secondary'}`}>
            {existing?.status === 'active' ? '활성' : '비활성'}
          </span>
        )}
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setIsEditing(true)}>수정</button>
        )}
      </div>

      {!isNew && (
        <ul className="nav nav-tabs mb-3">
          {(['info', 'permissions', 'activity'] as const).map(t => (
            <li className="nav-item" key={t}>
              <button className={`nav-link${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'info' ? '기본 정보' : t === 'permissions' ? '권한 목록' : '활동 내역'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {(isNew || tab === 'info') && (
        <div className="card border-0 shadow-sm" style={{ maxWidth: 600 }}>
          <div className="card-header bg-white fw-semibold">기본 정보</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">이메일</label>
                {isEditing ? (
                  <input type="email" className="form-control form-control-sm" value={form.email ?? ''}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                ) : <div className="small">{form.email}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">닉네임</label>
                {isEditing ? (
                  <input className="form-control form-control-sm" value={form.nickname ?? ''}
                    onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))} />
                ) : <div className="small fw-medium">{form.nickname}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">역할</label>
                {isEditing ? (
                  <select className="form-select form-select-sm" value={form.role ?? 'inspector'}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value as AdminRole }))}>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                ) : <div><span className="badge bg-primary bg-opacity-10 text-primary">{ROLE_LABELS[form.role as AdminRole]}</span></div>}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">상태</label>
                {isEditing ? (
                  <select className="form-select form-select-sm" value={form.status ?? 'active'}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as AdminAccount['status'] }))}>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                ) : (
                  <div>
                    <span className={`badge bg-${form.status === 'active' ? 'success' : 'secondary'}`}>
                      {form.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                )}
              </div>
              {isNew && (
                <div className="col-12">
                  <label className="form-label small fw-semibold">임시 비밀번호</label>
                  <input type="password" className="form-control form-control-sm" placeholder="초기 비밀번호 설정" />
                  <div className="form-text">등록 후 관리자에게 이메일로 발송됩니다.</div>
                </div>
              )}
              {!isNew && (
                <>
                  <div className="col-12"><hr className="my-0" /></div>
                  <div className="col-6"><div className="text-muted small">마지막 로그인</div>
                    <div className="small">{existing?.lastLoginAt ? existing.lastLoginAt.slice(0, 16).replace('T', ' ') : '—'}</div></div>
                  <div className="col-6"><div className="text-muted small">등록일</div>
                    <div className="small">{existing?.createdAt.slice(0, 10)}</div></div>
                  {existing?.createdBy && (
                    <div className="col-6"><div className="text-muted small">등록자</div>
                      <div className="small">{existing.createdBy}</div></div>
                  )}
                </>
              )}
            </div>
            {isEditing && canEdit && (
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={handleSave}>저장</button>
                <button className="btn btn-outline-secondary"
                  onClick={() => { setIsEditing(false); if (isNew) navigate('/admins'); }}>취소</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'permissions' && !isNew && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">
            권한 목록 — {ROLE_LABELS[form.role as AdminRole]}
            <span className="text-muted fw-normal small ms-2">(역할 기반 권한이며 개별 수정은 권한 관리 페이지에서 가능합니다)</span>
          </div>
          <div className="card-body">
            <div className="row g-2">
              {Object.entries(SECTION_LABELS).map(([section, label]) => {
                const hasRead = rolePerms.includes(`${section}:read` as never);
                const hasWrite = rolePerms.includes(`${section}:write` as never);
                return (
                  <div className="col-md-4" key={section}>
                    <div className={`border rounded p-2 small ${hasRead ? '' : 'opacity-50'}`}>
                      <div className="fw-medium">{label}</div>
                      <div className="mt-1 d-flex gap-1">
                        <span className={`badge bg-${hasRead ? 'success' : 'light text-muted'}`}>읽기</span>
                        <span className={`badge bg-${hasWrite ? 'primary' : 'light text-muted'}`}>쓰기</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && !isNew && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">활동 내역</div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">일시</th>
                  <th>액션</th>
                  <th>대상</th>
                  <th>내용</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {adminLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-4">활동 내역이 없습니다.</td></tr>
                )}
                {adminLogs.map(l => (
                  <tr key={l.id}>
                    <td className="ps-3 small text-muted text-nowrap">{l.createdAt.slice(0, 16).replace('T', ' ')}</td>
                    <td><span className={`badge bg-${l.action === 'create' ? 'success' : l.action === 'update' ? 'primary' : l.action === 'delete' ? 'danger' : 'secondary'}`}>{l.action}</span></td>
                    <td className="small text-muted">{l.targetType}</td>
                    <td className="small">{l.description}</td>
                    <td className="small font-monospace text-muted">{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
