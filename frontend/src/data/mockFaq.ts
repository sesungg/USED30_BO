import type { Faq } from '../types';

export const mockFaq: Faq[] = [
  {
    id: 'f1', category: '거래', order: 1,
    question: '거래는 어떻게 진행되나요?',
    answer: '구매자가 상품을 결제하면, 판매자가 USED30 창고로 상품을 발송합니다. 저희 검수팀이 상품 상태를 확인한 후, 합격 시 구매자에게 배송됩니다.',
    status: 'published', viewCount: 3421,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'f2', category: '검수', order: 1,
    question: '검수 기준이 무엇인가요?',
    answer: 'Goldmine Standard를 기반으로 M(Mint), NM(Near Mint), VG+(Very Good Plus), VG(Very Good), G+(Good Plus), G(Good), F(Fair), P(Poor) 8단계로 평가합니다.',
    status: 'published', viewCount: 2890,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'f3', category: '검수', order: 2,
    question: '등급이 다르게 나왔을 때는 어떻게 되나요?',
    answer: '검수원의 판정 등급이 판매자 선언 등급보다 낮을 경우, 판매자에게 통보 후 가격 조정 또는 반송 중 선택할 수 있습니다.',
    status: 'published', viewCount: 1567,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'f4', category: '정산', order: 1,
    question: '정산은 언제 받을 수 있나요?',
    answer: '구매자가 구매확정 후 영업일 기준 3일 이내에 정산됩니다. 자동확정(배송완료 후 7일)의 경우도 동일합니다.',
    status: 'published', viewCount: 2103,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'f5', category: '배송', order: 1,
    question: '배송은 얼마나 걸리나요?',
    answer: '검수 완료 후 영업일 기준 1-2일 이내 발송되며, 발송 후 1-3일 내 수령 가능합니다.',
    status: 'published', viewCount: 1892,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'f6', category: '계정', order: 1,
    question: '계정 정지 사유는 무엇인가요?',
    answer: '허위 등급 신고, 사기 거래 시도, 반복적인 무단 취소 등의 경우 계정이 정지될 수 있습니다.',
    status: 'published', viewCount: 445,
    createdAt: '2026-01-01T09:00:00Z', updatedAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'f7', category: '기타', order: 1,
    question: '쿠폰 사용 방법 (작성 중)',
    answer: '',
    status: 'draft', viewCount: 0,
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
];
