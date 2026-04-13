import type { MarketingEvent } from '../types';

export const mockEvents: MarketingEvent[] = [
  {
    id: 'e1', title: '봄맞이 LP 특가전',
    description: '봄을 맞아 다양한 장르의 LP를 특가에 만나보세요. 선착순 100명에게 추가 할인 쿠폰을 드립니다.',
    imageUrl: 'https://placehold.co/800x400?text=Spring+Sale',
    status: 'ongoing', couponId: 'c1',
    startAt: '2026-04-01T00:00:00Z', endAt: '2026-04-30T23:59:59Z',
    participantCount: 87,
    createdAt: '2026-03-28T10:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'e2', title: 'JAZZ 위크',
    description: '재즈를 사랑하는 분들을 위한 특별 이벤트. 재즈 LP 구매 시 특별 할인이 적용됩니다.',
    imageUrl: 'https://placehold.co/800x400?text=Jazz+Week',
    status: 'ended', couponId: 'c3',
    startAt: '2026-02-14T00:00:00Z', endAt: '2026-02-28T23:59:59Z',
    participantCount: 50,
    createdAt: '2026-02-10T09:00:00Z', createdBy: '마케팅팀',
  },
  {
    id: 'e3', title: '신년 감사 이벤트',
    description: '새해를 맞아 모든 회원분들께 감사드립니다. 특별 할인 쿠폰을 선물로 드립니다.',
    status: 'ended', couponId: 'c5',
    startAt: '2026-01-01T00:00:00Z', endAt: '2026-01-31T23:59:59Z',
    participantCount: 200,
    createdAt: '2026-01-01T09:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'e4', title: '여름 컬렉션 예고 이벤트',
    description: '2026년 여름 시즌 LP 컬렉션 사전 공개 이벤트입니다.',
    status: 'upcoming',
    startAt: '2026-05-01T00:00:00Z', endAt: '2026-05-31T23:59:59Z',
    participantCount: 0,
    createdAt: '2026-04-10T11:00:00Z', createdBy: '운영팀',
  },
];
