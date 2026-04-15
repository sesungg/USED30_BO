import type { Notice } from '../types';

export const mockNotices: Notice[] = [
  {
    id: 'n1', title: '[공지] 검수 서비스 운영 안내', category: '공지',
    content: '안녕하세요. USED30 검수 서비스 운영 관련 안내드립니다.\n\n검수 신청 후 영업일 기준 3일 이내에 검수가 완료됩니다. 검수 결과에 따라 등급이 조정될 수 있으며, 등급 차이가 발생할 경우 판매자에게 개별 통보됩니다.',
    status: 'published', isPinned: true,
    authorAdminId: 'a1', authorNickname: '운영팀',
    viewCount: 1523, publishedAt: '2026-03-01T09:00:00Z',
    createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'n2', title: '[업데이트] 새로운 등급 비교 기능 출시', category: '업데이트',
    content: '판매자가 선언한 등급과 검수원의 판정 등급을 직관적으로 비교할 수 있는 기능이 추가되었습니다.\n\n상품 상세 페이지에서 확인하실 수 있습니다.',
    status: 'published', isPinned: false,
    authorAdminId: 'a2', authorNickname: '개발팀',
    viewCount: 892, publishedAt: '2026-03-15T10:00:00Z',
    createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'n3', title: '[점검] 4월 정기 서버 점검 안내', category: '점검',
    content: '4월 20일(일) 02:00 ~ 06:00 서버 정기 점검이 예정되어 있습니다.\n\n점검 시간 동안 서비스 이용이 불가합니다.',
    status: 'published', isPinned: true,
    authorAdminId: 'a1', authorNickname: '운영팀',
    viewCount: 344, publishedAt: '2026-04-10T09:00:00Z',
    createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'n4', title: '[이벤트] 봄맞이 LP 특가전', category: '이벤트',
    content: '봄을 맞아 특별 할인 이벤트를 진행합니다. 선착순 100명에게 5% 추가 할인 쿠폰을 드립니다.',
    status: 'published', isPinned: false,
    authorAdminId: 'a1', authorNickname: '운영팀',
    viewCount: 2100, publishedAt: '2026-04-01T09:00:00Z',
    createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'n5', title: '[공지] 정산 정책 변경 안내 (임시저장)', category: '공지',
    content: '정산 수수료 및 지급 일정 변경에 대한 안내입니다. (작성 중)',
    status: 'draft', isPinned: false,
    authorAdminId: 'a2', authorNickname: '개발팀',
    viewCount: 0,
    createdAt: '2026-04-12T14:00:00Z', updatedAt: '2026-04-12T14:00:00Z',
  },
];
