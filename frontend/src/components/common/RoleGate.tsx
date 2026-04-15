import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess, type Section } from '../../constants/permissions';

interface RoleGateProps {
  section: Section;
  children: ReactNode;
}

export function RoleGate({ section, children }: RoleGateProps) {
  const { user } = useAuth();
  if (!user || !canAccess(user.role, section)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 400 }}>
        <div className="text-center">
          <div className="display-1 text-secondary mb-3">403</div>
          <h4 className="mb-2">접근 권한이 없습니다</h4>
          <p className="text-muted">이 섹션에 접근할 수 있는 권한이 없습니다.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
