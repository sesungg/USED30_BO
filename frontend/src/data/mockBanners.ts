import type { Banner } from '../types';

export const mockBanners: Banner[] = [
  {
    id: 'b1', title: '봄맞이 LP 특가전',
    imageUrl: 'https://placehold.co/1200x400?text=Spring+Sale',
    linkUrl: '/events/spring',
    position: 'main_top', status: 'active', order: 1,
    startAt: '2026-04-01T00:00:00Z', endAt: '2026-04-30T23:59:59Z',
    createdAt: '2026-03-28T10:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'b2', title: 'JAZZ 컬렉션 소개',
    imageUrl: 'https://placehold.co/1200x400?text=Jazz+Collection',
    linkUrl: '/products?genre=JAZZ',
    position: 'main_top', status: 'active', order: 2,
    createdAt: '2026-04-01T10:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'b3', title: '신규 가입 환영 팝업',
    imageUrl: 'https://placehold.co/600x400?text=Welcome+Popup',
    linkUrl: '/coupons',
    position: 'popup', status: 'active', order: 1,
    createdAt: '2026-01-01T09:00:00Z', createdBy: '운영팀',
  },
  {
    id: 'b4', title: '검수 서비스 안내 (비활성)',
    imageUrl: 'https://placehold.co/1200x300?text=Inspection+Guide',
    position: 'main_middle', status: 'inactive', order: 1,
    createdAt: '2026-02-01T09:00:00Z', createdBy: '개발팀',
  },
  {
    id: 'b5', title: '여름 시즌 예고 (예약)',
    imageUrl: 'https://placehold.co/1200x400?text=Summer+Preview',
    position: 'main_top', status: 'scheduled', order: 3,
    startAt: '2026-05-01T00:00:00Z', endAt: '2026-05-31T23:59:59Z',
    createdAt: '2026-04-10T11:00:00Z', createdBy: '운영팀',
  },
];
