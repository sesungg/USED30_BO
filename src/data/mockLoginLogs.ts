import type { LoginLog } from '../types';

export const mockLoginLogs: LoginLog[] = [
  {
    id: 'll1', userId: 'u1', userNickname: '재즈러버',
    email: 'jazz@example.com', result: 'success',
    ipAddress: '211.49.23.100', device: 'Chrome / macOS',
    createdAt: '2026-04-13T08:55:00Z',
  },
  {
    id: 'll2', userId: 'u4', userNickname: '레코드맨',
    email: 'record@example.com', result: 'success',
    ipAddress: '58.141.32.5', device: 'Safari / iOS',
    createdAt: '2026-04-13T08:30:00Z',
  },
  {
    id: 'll3',
    email: 'classic@example.com', result: 'fail_suspended',
    ipAddress: '175.223.44.12', device: 'Chrome / Windows',
    createdAt: '2026-04-13T07:12:00Z',
  },
  {
    id: 'll4',
    email: 'unknown@example.com', result: 'fail_not_found',
    ipAddress: '203.89.10.4', device: 'Firefox / Linux',
    createdAt: '2026-04-13T06:44:00Z',
  },
  {
    id: 'll5', userId: 'u3', userNickname: '빈티지헌터',
    email: 'vintage@example.com', result: 'success',
    ipAddress: '123.45.67.89', device: 'Samsung Browser / Android',
    createdAt: '2026-04-12T22:10:00Z',
  },
  {
    id: 'll6',
    email: 'jazz@example.com', result: 'fail_password',
    ipAddress: '211.49.23.100', device: 'Chrome / macOS',
    createdAt: '2026-04-12T21:58:00Z',
  },
  {
    id: 'll7', userId: 'u6', userNickname: '펑크마스터',
    email: 'funk@example.com', result: 'success',
    ipAddress: '59.6.71.100', device: 'Chrome / Windows',
    createdAt: '2026-04-12T18:33:00Z',
  },
  {
    id: 'll8',
    email: 'record@example.com', result: 'fail_password',
    ipAddress: '1.2.3.4', device: 'Unknown Browser',
    createdAt: '2026-04-12T15:00:00Z',
  },
  {
    id: 'll9',
    email: 'record@example.com', result: 'fail_password',
    ipAddress: '1.2.3.4', device: 'Unknown Browser',
    createdAt: '2026-04-12T14:58:00Z',
  },
  {
    id: 'll10', userId: 'u8', userNickname: '블루스마니아',
    email: 'blues@example.com', result: 'success',
    ipAddress: '220.88.10.55', device: 'Chrome / Android',
    createdAt: '2026-04-12T11:20:00Z',
  },
  {
    id: 'll11', userId: 'u2', userNickname: '소울킹',
    email: 'soul@example.com', result: 'success',
    ipAddress: '112.34.56.78', device: 'Safari / macOS',
    createdAt: '2026-04-11T09:00:00Z',
  },
  {
    id: 'll12',
    email: 'notexist@example.com', result: 'fail_not_found',
    ipAddress: '91.108.4.1', device: 'Telegram Bot',
    createdAt: '2026-04-10T03:22:00Z',
  },
];
