import type { AdminUser } from '../types';

export const mockAdminUsers: AdminUser[] = [
  { id: 'a1', email: 'super@used30.com', nickname: '슈퍼관리자', role: 'super_admin' },
  { id: 'a2', email: 'admin@used30.com', nickname: '어드민', role: 'admin' },
  { id: 'a3', email: 'inspector@used30.com', nickname: '검수원김', role: 'inspector' },
  { id: 'a4', email: 'settlement@used30.com', nickname: '정산매니저', role: 'settlement_manager' },
  { id: 'a5', email: 'cs@used30.com', nickname: 'CS에이전트', role: 'cs_agent' },
  { id: 'a6', email: 'reviewer@used30.com', nickname: '상품리뷰어', role: 'product_reviewer' },
  { id: 'a7', email: 'store@used30.com', nickname: '스토어매니저', role: 'store_manager' },
  { id: 'a8', email: 'analyst@used30.com', nickname: '분석가', role: 'readonly_analyst' },
];

export function mockLogin(email: string, password: string): AdminUser | null {
  if (password !== 'password123') return null;
  return mockAdminUsers.find(u => u.email === email) ?? null;
}
