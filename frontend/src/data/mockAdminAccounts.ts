import type { AdminAccount } from '../types';

export const mockAdminAccounts: AdminAccount[] = [
  {
    id: 'a1', email: 'super@used30.com', nickname: '슈퍼어드민',
    role: 'super_admin', status: 'active',
    lastLoginAt: '2026-04-13T09:00:00Z',
    createdAt: '2023-01-01T09:00:00Z',
  },
  {
    id: 'a2', email: 'admin@used30.com', nickname: '어드민',
    role: 'admin', status: 'active',
    lastLoginAt: '2026-04-13T08:45:00Z',
    createdAt: '2023-01-15T09:00:00Z', createdBy: '슈퍼어드민',
  },
  {
    id: 'a3', email: 'cs@used30.com', nickname: 'CS담당자',
    role: 'cs_agent', status: 'active',
    lastLoginAt: '2026-04-13T09:02:00Z',
    createdAt: '2023-06-01T09:00:00Z', createdBy: '어드민',
  },
  {
    id: 'a4', email: 'inspector@used30.com', nickname: '검수원1',
    role: 'inspector', status: 'active',
    lastLoginAt: '2026-04-09T14:00:00Z',
    createdAt: '2023-09-01T09:00:00Z', createdBy: '어드민',
  },
  {
    id: 'a5', email: 'settlement@used30.com', nickname: '정산매니저',
    role: 'settlement_manager', status: 'active',
    lastLoginAt: '2026-04-07T09:00:00Z',
    createdAt: '2024-01-10T09:00:00Z', createdBy: '슈퍼어드민',
  },
  {
    id: 'a6', email: 'product@used30.com', nickname: '상품리뷰어',
    role: 'product_reviewer', status: 'active',
    lastLoginAt: '2026-04-08T10:00:00Z',
    createdAt: '2024-03-01T09:00:00Z', createdBy: '어드민',
  },
  {
    id: 'a7', email: 'store@used30.com', nickname: '스토어매니저',
    role: 'store_manager', status: 'active',
    lastLoginAt: '2026-04-05T11:00:00Z',
    createdAt: '2024-05-01T09:00:00Z', createdBy: '어드민',
  },
  {
    id: 'a8', email: 'analyst@used30.com', nickname: '분석가',
    role: 'readonly_analyst', status: 'inactive',
    createdAt: '2025-01-01T09:00:00Z', createdBy: '슈퍼어드민',
  },
];
