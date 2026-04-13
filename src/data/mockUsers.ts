import type { BoUser } from '../types';

export const mockUsers: BoUser[] = [
  {
    id: 'u1', nickname: '재즈러버', email: 'jazz@example.com',
    mannerScore: 4.8, trustScore: 92, salesCount: 34, purchaseCount: 12,
    accountStatus: 'active',
    settlementAccount: { bankName: '카카오뱅크', accountNumber: '3333-12-3456789', accountHolder: '김재즈' },
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'u2', nickname: '소울킹', email: 'soul@example.com',
    mannerScore: 4.5, trustScore: 78, salesCount: 22, purchaseCount: 45,
    accountStatus: 'active',
    settlementAccount: { bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '이소울' },
    createdAt: '2024-05-20T09:00:00Z',
  },
  {
    id: 'u3', nickname: '빈티지헌터', email: 'vintage@example.com',
    mannerScore: 3.9, trustScore: 55, salesCount: 5, purchaseCount: 88,
    accountStatus: 'active',
    createdAt: '2024-08-01T09:00:00Z',
  },
  {
    id: 'u4', nickname: '레코드맨', email: 'record@example.com',
    mannerScore: 4.9, trustScore: 98, salesCount: 120, purchaseCount: 30,
    accountStatus: 'active',
    settlementAccount: { bankName: '국민은행', accountNumber: '123456-12-123456', accountHolder: '박레코드' },
    createdAt: '2023-12-15T09:00:00Z',
  },
  {
    id: 'u5', nickname: '클래식팬', email: 'classic@example.com',
    mannerScore: 2.1, trustScore: 20, salesCount: 2, purchaseCount: 3,
    accountStatus: 'suspended',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'u6', nickname: '펑크마스터', email: 'funk@example.com',
    mannerScore: 4.7, trustScore: 85, salesCount: 67, purchaseCount: 18,
    accountStatus: 'active',
    settlementAccount: { bankName: '우리은행', accountNumber: '1002-123-456789', accountHolder: '최펑크' },
    createdAt: '2024-02-28T09:00:00Z',
  },
  {
    id: 'u7', nickname: '록앤롤', email: 'rock@example.com',
    mannerScore: 4.3, trustScore: 70, salesCount: 15, purchaseCount: 52,
    accountStatus: 'active',
    createdAt: '2024-07-07T09:00:00Z',
  },
  {
    id: 'u8', nickname: '블루스마니아', email: 'blues@example.com',
    mannerScore: 4.6, trustScore: 88, salesCount: 42, purchaseCount: 25,
    accountStatus: 'active',
    settlementAccount: { bankName: '하나은행', accountNumber: '123-456789-01234', accountHolder: '정블루스' },
    createdAt: '2024-04-12T09:00:00Z',
  },
];
