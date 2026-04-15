import type { Coupon } from '../types';

export const mockCoupons: Coupon[] = [
  {
    id: 'c1', code: 'SPRING2026', name: '봄맞이 5% 할인',
    type: 'percentage', value: 5,
    minOrderAmount: 50000, maxDiscount: 10000,
    totalLimit: 100, issuedCount: 87, usedCount: 45,
    status: 'active', expiresAt: '2026-04-30T23:59:59Z',
    createdAt: '2026-04-01T09:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'c2', code: 'WELCOME3000', name: '신규 가입 환영 3,000원',
    type: 'fixed', value: 3000,
    minOrderAmount: 30000,
    issuedCount: 234, usedCount: 189,
    status: 'active',
    createdAt: '2026-01-01T09:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'c3', code: 'JAZZ10', name: '재즈 애호가 10% 할인',
    type: 'percentage', value: 10,
    minOrderAmount: 80000, maxDiscount: 20000,
    totalLimit: 50, issuedCount: 50, usedCount: 38,
    status: 'inactive',
    createdAt: '2026-02-14T09:00:00Z', createdBy: '마케팅팀',
  },
  {
    id: 'c4', code: 'GRADE5000', name: '등급차이 보상 5,000원',
    type: 'fixed', value: 5000,
    issuedCount: 12, usedCount: 9,
    status: 'active',
    createdAt: '2026-03-01T09:00:00Z', createdBy: 'CS팀',
  },
  {
    id: 'c5', code: 'NEWYEAR20', name: '신년 20% 할인 (만료)',
    type: 'percentage', value: 20,
    minOrderAmount: 100000, maxDiscount: 30000,
    totalLimit: 200, issuedCount: 200, usedCount: 176,
    status: 'expired', expiresAt: '2026-01-31T23:59:59Z',
    createdAt: '2026-01-01T09:00:00Z', createdBy: '운영팀',
  },
];
