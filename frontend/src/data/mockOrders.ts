import type { Order } from '../types';
import { mockProducts } from './mockProducts';
import { mockInspections } from './mockInspections';

const p = (id: string) => mockProducts.find(x => x.id === id)!;
const ins = (id: string) => mockInspections.find(x => x.id === id);

export const mockOrders: Order[] = [
  {
    id: 'o1', productId: 'p1', product: p('p1'), buyerId: 'u3', buyerNickname: '빈티지헌터',
    status: 'confirmed',
    payment: { method: 'card', amount: 171000, paidAt: '2026-04-03T10:00:00Z' },
    appliedCoupon: { couponId: 'c1', code: 'SPRING2026', name: '봄맞이 5% 할인', discountAmount: 9000 },
    shipping: { carrier: 'CJ대한통운', trackingNo: '576123456789', currentStatus: '배송완료', estimatedAt: '2026-04-07T00:00:00Z' },
    inspection: ins('ins4'),
    createdAt: '2026-04-03T10:00:00Z', deliveredAt: '2026-04-07T14:00:00Z',
  },
  {
    id: 'o2', productId: 'p2', product: p('p2'), buyerId: 'u7', buyerNickname: '록앤롤',
    status: 'inspection_pending',
    payment: { method: 'card', amount: 95000, paidAt: '2026-04-11T09:00:00Z' },
    inspection: ins('ins1'),
    createdAt: '2026-04-11T09:00:00Z',
  },
  {
    id: 'o3', productId: 'p3', product: p('p3'), buyerId: 'u1', buyerNickname: '재즈러버',
    status: 'shipping',
    payment: { method: 'transfer', amount: 120000, paidAt: '2026-04-05T14:00:00Z' },
    shipping: { carrier: '로젠택배', trackingNo: '123456789012', currentStatus: '배송 중', estimatedAt: '2026-04-14T00:00:00Z' },
    inspection: ins('ins7'),
    createdAt: '2026-04-05T14:00:00Z',
  },
  {
    id: 'o4', productId: 'p4', product: p('p4'), buyerId: 'u8', buyerNickname: '블루스마니아',
    status: 'delivered',
    payment: { method: 'card', amount: 75000, paidAt: '2026-03-20T11:00:00Z' },
    shipping: { carrier: 'CJ대한통운', trackingNo: '999888777666', currentStatus: '배송완료' },
    createdAt: '2026-03-20T11:00:00Z', deliveredAt: '2026-03-25T13:00:00Z',
  },
  {
    id: 'o5', productId: 'p5', product: p('p5'), buyerId: 'u2', buyerNickname: '소울킹',
    status: 'inspection_grade_mismatch',
    payment: { method: 'card', amount: 350000, paidAt: '2026-04-12T08:00:00Z' },
    inspection: ins('ins5'),
    createdAt: '2026-04-12T08:00:00Z',
  },
  {
    id: 'o6', productId: 'p6', product: p('p6'), buyerId: 'u4', buyerNickname: '레코드맨',
    status: 'inspection_pending',
    payment: { method: 'card', amount: 85000, paidAt: '2026-04-12T07:00:00Z' },
    inspection: ins('ins2'),
    createdAt: '2026-04-12T07:00:00Z',
  },
  {
    id: 'o7', productId: 'p7', product: p('p7'), buyerId: 'u6', buyerNickname: '펑크마스터',
    status: 'inspection_pass',
    payment: { method: 'card', amount: 140000, paidAt: '2026-04-10T13:00:00Z' },
    createdAt: '2026-04-10T13:00:00Z',
  },
  {
    id: 'o8', productId: 'p8', product: p('p8'), buyerId: 'u5', buyerNickname: '클래식팬',
    status: 'inspection_rejected',
    payment: { method: 'card', amount: 45000, paidAt: '2026-04-08T10:00:00Z' },
    inspection: ins('ins6'),
    createdAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'o9', productId: 'p9', product: p('p9'), buyerId: 'u3', buyerNickname: '빈티지헌터',
    status: 'inspection_pending',
    payment: { method: 'transfer', amount: 65000, paidAt: '2026-04-10T07:30:00Z' },
    inspection: ins('ins3'),
    createdAt: '2026-04-10T07:30:00Z',
  },
  {
    id: 'o10', productId: 'p10', product: p('p10'), buyerId: 'u8', buyerNickname: '블루스마니아',
    status: 'return_requested',
    payment: { method: 'card', amount: 105000, paidAt: '2026-04-01T15:00:00Z' },
    appliedCoupon: { couponId: 'c4', code: 'GRADE5000', name: '등급차이 보상 5,000원', discountAmount: 5000 },
    shipping: { carrier: 'CJ대한통운', trackingNo: '321654987321', currentStatus: '배송완료' },
    returnRequest: {
      id: 'r1', orderId: 'o10', reason: 'grade_mismatch',
      photos: ['https://placehold.co/400x400?text=Damage'],
      description: '수령한 음반 상태가 VG+가 아닌 VG 수준입니다.',
      status: 'requested', createdAt: '2026-04-09T10:00:00Z',
    },
    createdAt: '2026-04-01T15:00:00Z', deliveredAt: '2026-04-05T12:00:00Z',
  },
];
