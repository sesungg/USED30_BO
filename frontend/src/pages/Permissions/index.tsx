import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite, ROLE_LABELS, SECTION_LABELS, ROLE_PERMISSIONS } from '../../constants/permissions';
import type { AdminRole } from '../../types';
import type { Section, Permission } from '../../constants/permissions';

const ALL_ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const ALL_SECTIONS = Object.keys(SECTION_LABELS) as Section[];

export default function PermissionsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'permissions') : false;

  // Local editable copy
  const [perms, setPerms] = useState<Record<AdminRole, Set<Permission>>>(() => {
    const result = {} as Record<AdminRole, Set<Permission>>;
    for (const role of ALL_ROLES) {
      result[role] = new Set(ROLE_PERMISSIONS[role]);
    }
    return result;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');

  function toggle(role: AdminRole, perm: Permission) {
    if (!canEdit) return;
    setPerms(prev => {
      const next = new Set(prev[role]);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return { ...prev, [role]: next };
    });
    setIsDirty(true);
  }

  function handleSave() {
    setIsDirty(false);
    showToast('권한이 저장되었습니다.', 'success');
  }

  function handleReset() {
    setPerms(() => {
      const result = {} as Record<AdminRole, Set<Permission>>;
      for (const role of ALL_ROLES) {
        result[role] = new Set(ROLE_PERMISSIONS[role]);
      }
      return result;
    });
    setIsDirty(false);
  }

  const rolePerms = perms[selectedRole];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">권한 관리</h5>
        {canEdit && isDirty && (
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={handleReset}>초기화</button>
            <button className="btn btn-sm btn-primary" onClick={handleSave}>저장</button>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Role selector */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold small">역할 선택</div>
            <div className="list-group list-group-flush">
              {ALL_ROLES.map(role => (
                <button key={role}
                  className={`list-group-item list-group-item-action small py-2 ${selectedRole === role ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role)}>
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permission matrix for selected role */}
        <div className="col-md-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold d-flex align-items-center gap-2">
              <span>{ROLE_LABELS[selectedRole]}</span>
              {selectedRole === 'super_admin' && (
                <span className="badge bg-warning text-dark small">슈퍼어드민은 모든 권한을 가집니다</span>
              )}
            </div>
            <div className="card-body">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>섹션</th>
                    <th className="text-center" style={{ width: 100 }}>읽기</th>
                    <th className="text-center" style={{ width: 100 }}>쓰기</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_SECTIONS.map(section => {
                    const readPerm: Permission = `${section}:read`;
                    const writePerm: Permission = `${section}:write`;
                    const hasRead = rolePerms.has(readPerm);
                    const hasWrite = rolePerms.has(writePerm);
                    const isSuper = selectedRole === 'super_admin';
                    return (
                      <tr key={section}>
                        <td className="small fw-medium">{SECTION_LABELS[section]}</td>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input"
                            checked={hasRead}
                            disabled={isSuper || !canEdit}
                            onChange={() => toggle(selectedRole, readPerm)} />
                        </td>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input"
                            checked={hasWrite}
                            disabled={isSuper || !canEdit}
                            onChange={() => toggle(selectedRole, writePerm)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Full matrix overview */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white fw-semibold">전체 권한 매트릭스</div>
        <div className="card-body p-0" style={{ overflowX: 'auto' }}>
          <table className="table table-sm table-bordered mb-0" style={{ minWidth: 900 }}>
            <thead className="table-light">
              <tr>
                <th className="ps-3" style={{ minWidth: 120 }}>섹션</th>
                {ALL_ROLES.map(role => (
                  <th key={role} className="text-center small" style={{ minWidth: 90 }}>{ROLE_LABELS[role]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_SECTIONS.map(section => (
                <tr key={section}>
                  <td className="ps-3 small fw-medium">{SECTION_LABELS[section]}</td>
                  {ALL_ROLES.map(role => {
                    const hasRead = perms[role].has(`${section}:read`);
                    const hasWrite = perms[role].has(`${section}:write`);
                    return (
                      <td key={role} className="text-center">
                        {hasWrite ? (
                          <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>읽기+쓰기</span>
                        ) : hasRead ? (
                          <span className="badge bg-success bg-opacity-75" style={{ fontSize: '0.65rem' }}>읽기</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
