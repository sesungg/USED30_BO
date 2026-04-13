import type { Inspection } from '../types';

const now = new Date('2026-04-13T10:00:00Z');
const h = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();
const d = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

export const mockInspections: Inspection[] = [
  {
    id: 'ins1', productId: 'p2', orderId: 'o2', result: 'pending',
    sellerMediaGrade: 'NM', sellerSleeveGrade: 'VG+',
    photos: [], notes: undefined, originalPrice: 95000,
    deadline: h(70), // 임박 — 70시간 남음
    createdAt: d(2),
    artistName: 'John Coltrane', albumName: 'A Love Supreme', sellerNickname: '재즈러버',
  },
  {
    id: 'ins2', productId: 'p6', orderId: 'o6', result: 'pending',
    sellerMediaGrade: 'NM', sellerSleeveGrade: 'NM',
    photos: [], notes: undefined, originalPrice: 85000,
    deadline: h(48), // 임박 — 48시간
    createdAt: d(1),
    artistName: 'Beethoven', albumName: 'Symphony No.9', sellerNickname: '클래식팬',
  },
  {
    id: 'ins3', productId: 'p9', orderId: 'o9', result: 'pending',
    sellerMediaGrade: 'NM', sellerSleeveGrade: 'NM',
    photos: [], notes: undefined, originalPrice: 65000,
    deadline: h(20), // 매우 임박 — 20시간
    createdAt: d(3),
    artistName: 'Daft Punk', albumName: 'Random Access Memories', sellerNickname: '빈티지헌터',
  },
  {
    id: 'ins4', productId: 'p1', orderId: 'o1', result: 'approved',
    sellerMediaGrade: 'NM', inspectorMediaGrade: 'NM',
    sellerSleeveGrade: 'VG+', inspectorSleeveGrade: 'VG+',
    photos: [
      { id: 'ph1', type: 'record_side', url: 'https://placehold.co/400x400?text=Record' },
      { id: 'ph2', type: 'label', url: 'https://placehold.co/400x400?text=Label' },
      { id: 'ph3', type: 'sleeve_front', url: 'https://placehold.co/400x400?text=Front' },
      { id: 'ph4', type: 'sleeve_back', url: 'https://placehold.co/400x400?text=Back' },
    ],
    notes: '상태 양호. 선언 등급과 일치.',
    originalPrice: 180000, createdAt: d(10),
    artistName: 'Miles Davis', albumName: 'Kind of Blue', sellerNickname: '레코드맨',
  },
  {
    id: 'ins5', productId: 'p5', orderId: 'o5', result: 'grade_mismatch',
    sellerMediaGrade: 'M', inspectorMediaGrade: 'NM',
    sellerSleeveGrade: 'NM', inspectorSleeveGrade: 'VG+',
    adjustedPrice: 280000, originalPrice: 350000,
    photos: [
      { id: 'ph5', type: 'record_side', url: 'https://placehold.co/400x400?text=Record' },
      { id: 'ph6', type: 'sleeve_front', url: 'https://placehold.co/400x400?text=Front' },
    ],
    notes: '판매자 선언 M급이나 미세한 스크래치 발견. NM으로 조정.',
    deadline: h(36), // 판매자 응답 기한
    createdAt: d(1),
    artistName: 'Pink Floyd', albumName: 'The Dark Side of the Moon', sellerNickname: '레코드맨',
  },
  {
    id: 'ins6', productId: 'p8', orderId: 'o8', result: 'rejected',
    sellerMediaGrade: 'VG+', inspectorMediaGrade: 'G',
    sellerSleeveGrade: 'VG', inspectorSleeveGrade: 'G+',
    photos: [
      { id: 'ph7', type: 'record_side', url: 'https://placehold.co/400x400?text=Record' },
    ],
    notes: '음반 상태가 선언 등급과 현저히 다름. 깊은 스크래치 다수.',
    originalPrice: 45000, createdAt: d(5),
    artistName: 'Robert Johnson', albumName: 'King of the Delta Blues', sellerNickname: '블루스마니아',
  },
  {
    id: 'ins7', productId: 'p3', orderId: 'o3', result: 'approved',
    sellerMediaGrade: 'VG+', inspectorMediaGrade: 'VG+',
    sellerSleeveGrade: 'VG+', inspectorSleeveGrade: 'VG+',
    photos: [
      { id: 'ph8', type: 'record_side', url: 'https://placehold.co/400x400?text=Record' },
      { id: 'ph9', type: 'label', url: 'https://placehold.co/400x400?text=Label' },
      { id: 'ph10', type: 'sleeve_front', url: 'https://placehold.co/400x400?text=Front' },
      { id: 'ph11', type: 'sleeve_back', url: 'https://placehold.co/400x400?text=Back' },
    ],
    notes: '선언 등급과 정확히 일치.',
    originalPrice: 120000, createdAt: d(8),
    artistName: 'Marvin Gaye', albumName: "What's Going On", sellerNickname: '소울킹',
  },
];
