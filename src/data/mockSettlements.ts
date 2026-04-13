import type { Settlement } from '../types';

export const mockSettlements: Settlement[] = [
  {
    id: 's1', orderId: 'o1', productId: 'p1', sellerId: 'u4', sellerNickname: '레코드맨',
    artistName: 'Miles Davis', albumName: 'Kind of Blue',
    salePrice: 180000, feeRate: 0.10, feeAmount: 18000, netAmount: 162000,
    status: 'completed', settledAt: '2026-04-10T09:00:00Z', trigger: 'confirm',
    createdAt: '2026-04-07T14:00:00Z',
  },
  {
    id: 's2', orderId: 'o4', productId: 'p4', sellerId: 'u6', sellerNickname: '펑크마스터',
    artistName: 'James Brown', albumName: 'Sex Machine',
    salePrice: 75000, feeRate: 0.10, feeAmount: 7500, netAmount: 67500,
    status: 'pending', trigger: 'auto',
    createdAt: '2026-03-25T13:00:00Z',
  },
  {
    id: 's3', orderId: 'o3', productId: 'p3', sellerId: 'u2', sellerNickname: '소울킹',
    artistName: 'Marvin Gaye', albumName: "What's Going On",
    salePrice: 120000, feeRate: 0.10, feeAmount: 12000, netAmount: 108000,
    status: 'pending', trigger: 'confirm',
    createdAt: '2026-04-13T00:00:00Z',
  },
  {
    id: 's4', orderId: 'o7', productId: 'p7', sellerId: 'u7', sellerNickname: '록앤롤',
    artistName: 'Led Zeppelin', albumName: 'Led Zeppelin IV',
    salePrice: 140000, feeRate: 0.10, feeAmount: 14000, netAmount: 126000,
    status: 'pending', trigger: 'confirm',
    createdAt: '2026-04-13T00:00:00Z',
  },
  {
    id: 's5', orderId: 'o1', productId: 'p10', sellerId: 'u1', sellerNickname: '재즈러버',
    artistName: 'Kendrick Lamar', albumName: 'To Pimp a Butterfly',
    salePrice: 110000, feeRate: 0.10, feeAmount: 11000, netAmount: 99000,
    status: 'completed', settledAt: '2026-04-08T10:00:00Z', trigger: 'manual',
    createdAt: '2026-04-05T12:00:00Z',
  },
];
