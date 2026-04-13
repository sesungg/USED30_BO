import type { UserPenalty } from '../types';

export const mockPenalties: UserPenalty[] = [
  {
    id: 'p1', userId: 'u5', type: 'suspended',
    reason: '허위 등급 신고 반복 (3회 이상). 서비스 이용 약관 위반.',
    duration: 30,
    status: 'active',
    adminId: 'a1', adminNickname: '슈퍼어드민',
    createdAt: '2026-01-15T09:00:00Z',
    expiresAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'p2', userId: 'u3', type: 'warning',
    reason: '구매확정 지연 반복 (2회). 다음 위반 시 이용 제한 예정.',
    status: 'active',
    adminId: 'a2', adminNickname: '어드민',
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'p3', userId: 'u8', type: 'warning',
    reason: '부적절한 반품 신청 (사실과 다른 사유)',
    status: 'expired',
    adminId: 'a3', adminNickname: 'CS담당자',
    createdAt: '2026-01-05T09:00:00Z',
    expiresAt: '2026-02-05T09:00:00Z',
  },
  {
    id: 'p4', userId: 'u5', type: 'warning',
    reason: '상품 상태 허위 기재 최초 경고',
    status: 'expired',
    adminId: 'a2', adminNickname: '어드민',
    createdAt: '2025-11-01T09:00:00Z',
    expiresAt: '2025-12-01T09:00:00Z',
  },
];
