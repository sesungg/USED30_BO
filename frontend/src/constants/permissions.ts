import type { AdminRole } from '../types';

export type Section =
  | 'dashboard'
  | 'inspections'
  | 'orders'
  | 'products'
  | 'settlements'
  | 'users'
  | 'notices'
  | 'coupons'
  | 'banners'
  | 'events'
  | 'faq'
  | 'admins'
  | 'permissions'
  | 'audit_logs'
  | 'login_logs'
  | 'settings';

export type Permission = `${Section}:read` | `${Section}:write`;

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard:read',
    'inspections:read', 'inspections:write',
    'orders:read', 'orders:write',
    'products:read', 'products:write',
    'settlements:read', 'settlements:write',
    'users:read', 'users:write',
    'notices:read', 'notices:write',
    'coupons:read', 'coupons:write',
    'banners:read', 'banners:write',
    'events:read', 'events:write',
    'faq:read', 'faq:write',
    'admins:read', 'admins:write',
    'permissions:read', 'permissions:write',
    'audit_logs:read',
    'login_logs:read',
    'settings:read', 'settings:write',
  ],
  admin: [
    'dashboard:read',
    'inspections:read', 'inspections:write',
    'orders:read', 'orders:write',
    'products:read', 'products:write',
    'settlements:read',
    'users:read', 'users:write',
    'notices:read', 'notices:write',
    'coupons:read', 'coupons:write',
    'banners:read', 'banners:write',
    'events:read', 'events:write',
    'faq:read', 'faq:write',
    'audit_logs:read',
    'login_logs:read',
  ],
  inspector: [
    'dashboard:read',
    'inspections:read', 'inspections:write',
    'orders:read',
    'products:read',
  ],
  settlement_manager: [
    'dashboard:read',
    'orders:read',
    'settlements:read', 'settlements:write',
    'audit_logs:read',
  ],
  cs_agent: [
    'dashboard:read',
    'inspections:read',
    'orders:read', 'orders:write',
    'products:read',
    'users:read', 'users:write',
    'notices:read',
    'faq:read',
    'login_logs:read',
    'audit_logs:read',
  ],
  product_reviewer: [
    'dashboard:read',
    'inspections:read',
    'products:read', 'products:write',
    'notices:read',
  ],
  store_manager: [
    'dashboard:read',
    'products:read',
    'notices:read',
    'banners:read', 'banners:write',
    'events:read', 'events:write',
    'faq:read', 'faq:write',
  ],
  readonly_analyst: [
    'dashboard:read',
    'inspections:read',
    'orders:read',
    'products:read',
    'settlements:read',
    'users:read',
    'notices:read',
    'coupons:read',
    'banners:read',
    'events:read',
    'faq:read',
    'audit_logs:read',
    'login_logs:read',
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccess(role: AdminRole, section: Section): boolean {
  return hasPermission(role, `${section}:read`);
}

export function canWrite(role: AdminRole, section: Section): boolean {
  return hasPermission(role, `${section}:write`);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: '슈퍼 어드민',
  admin: '어드민',
  inspector: '검수원',
  settlement_manager: '정산 매니저',
  cs_agent: 'CS 에이전트',
  product_reviewer: '상품 리뷰어',
  store_manager: '스토어 매니저',
  readonly_analyst: '분석가 (읽기전용)',
};

export const SECTION_LABELS: Record<Section, string> = {
  dashboard: '대시보드',
  inspections: '검수 관리',
  orders: '주문 관리',
  products: '상품 관리',
  settlements: '정산 관리',
  users: '사용자 관리',
  notices: '공지사항',
  coupons: '쿠폰 관리',
  banners: '배너 관리',
  events: '이벤트 관리',
  faq: 'FAQ 관리',
  admins: '관리자 관리',
  permissions: '권한 관리',
  audit_logs: '감사 로그',
  login_logs: '로그인 기록',
  settings: '시스템 설정',
};
