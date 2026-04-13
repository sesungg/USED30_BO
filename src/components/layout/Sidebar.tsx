import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../constants/permissions';
import type { Section } from '../../constants/permissions';

type NavItem = { path: string; label: string; icon: string; section: Section };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: '운영',
    items: [
      { path: '/',            label: '대시보드',    icon: '📊', section: 'dashboard' },
      { path: '/inspections', label: '검수 관리',    icon: '🔍', section: 'inspections' },
      { path: '/orders',      label: '주문 관리',    icon: '📦', section: 'orders' },
      { path: '/products',    label: '상품 관리',    icon: '💿', section: 'products' },
      { path: '/settlements', label: '정산 관리',    icon: '💰', section: 'settlements' },
      { path: '/users',       label: '사용자 관리',  icon: '👥', section: 'users' },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { path: '/notices', label: '공지사항',     icon: '📢', section: 'notices' },
      { path: '/banners', label: '배너 관리',    icon: '🖼️', section: 'banners' },
      { path: '/events',  label: '이벤트 관리',  icon: '🎉', section: 'events' },
      { path: '/coupons', label: '쿠폰 관리',    icon: '🎟️', section: 'coupons' },
      { path: '/faq',     label: 'FAQ 관리',     icon: '❓', section: 'faq' },
    ],
  },
  {
    label: '시스템',
    items: [
      { path: '/admins',      label: '관리자 관리', icon: '🛡️', section: 'admins' },
      { path: '/permissions', label: '권한 관리',   icon: '🔐', section: 'permissions' },
      { path: '/audit-logs',  label: '활동 로그',   icon: '📋', section: 'audit_logs' },
      { path: '/login-logs',  label: '로그인 기록', icon: '🔑', section: 'login_logs' },
      { path: '/settings',    label: '시스템 설정', icon: '⚙️', section: 'settings' },
    ],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{ width: 220, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, overflowY: 'auto' }}
    >
      {/* Logo */}
      <div className="px-3 py-4 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: 22 }}>🎵</span>
          <div>
            <div className="fw-bold text-dark" style={{ fontSize: 15, lineHeight: 1.2 }}>USED30</div>
            <div className="text-muted" style={{ fontSize: 11 }}>Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 py-2 px-2">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item =>
            user ? canAccess(user.role, item.section) : false
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-2">
              <div className="text-muted px-3 py-1" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {group.label}
              </div>
              <ul className="nav flex-column gap-1">
                {group.items.map(item => {
                  const accessible = user ? canAccess(user.role, item.section) : false;
                  return (
                    <li key={item.path} className="nav-item">
                      {accessible ? (
                        <NavLink
                          to={item.path}
                          end={item.path === '/'}
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                              isActive ? 'bg-primary text-white fw-semibold' : 'text-secondary'
                            }`
                          }
                          style={{ fontSize: 13 }}
                        >
                          <span style={{ fontSize: 14 }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </NavLink>
                      ) : (
                        <span
                          className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded text-muted"
                          style={{ fontSize: 13, opacity: 0.35, cursor: 'not-allowed' }}
                        >
                          <span style={{ fontSize: 14 }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-top flex-shrink-0">
        <div className="text-muted" style={{ fontSize: 11 }}>v1.0.0 · USED30 BO</div>
      </div>
    </div>
  );
}
