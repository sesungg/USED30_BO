import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../constants/permissions';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <header
      className="d-flex align-items-center justify-content-between bg-white border-bottom px-4"
      style={{ height: 56, position: 'fixed', top: 0, left: 220, right: 0, zIndex: 99 }}
    >
      <div />
      <div className="d-flex align-items-center gap-3">
        <span className="badge bg-secondary-subtle text-secondary-emphasis" style={{ fontSize: 12 }}>
          {ROLE_LABELS[user.role]}
        </span>
        <span className="text-dark fw-medium" style={{ fontSize: 14 }}>{user.nickname}</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
