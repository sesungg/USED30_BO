import type { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'al1', adminId: 'a1', adminNickname: '슈퍼어드민', adminRole: 'super_admin',
    action: 'update', targetType: 'user', targetId: 'u5',
    description: '사용자 "클래식팬" 계정 정지 처리',
    ipAddress: '192.168.1.1', createdAt: '2026-04-13T09:15:00Z',
  },
  {
    id: 'al2', adminId: 'a3', adminNickname: 'CS담당자', adminRole: 'cs_agent',
    action: 'read', targetType: 'user', targetId: 'u3',
    description: '사용자 "빈티지헌터" 정보 조회',
    ipAddress: '10.0.0.5', createdAt: '2026-04-13T09:02:00Z',
  },
  {
    id: 'al3', adminId: 'a2', adminNickname: '어드민', adminRole: 'admin',
    action: 'create', targetType: 'notice', targetId: 'n3',
    description: '공지사항 "4월 정기 서버 점검 안내" 등록',
    ipAddress: '192.168.1.10', createdAt: '2026-04-10T09:05:00Z',
  },
  {
    id: 'al4', adminId: 'a1', adminNickname: '슈퍼어드민', adminRole: 'super_admin',
    action: 'update', targetType: 'settings',
    description: '시스템 설정 수정 (수수료율 변경)',
    ipAddress: '192.168.1.1', createdAt: '2026-04-09T16:30:00Z',
  },
  {
    id: 'al5', adminId: 'a4', adminNickname: '검수원1', adminRole: 'inspector',
    action: 'update', targetType: 'inspection', targetId: 'ins1',
    description: '검수 ins1 합격 처리',
    ipAddress: '10.0.0.8', createdAt: '2026-04-09T14:22:00Z',
  },
  {
    id: 'al6', adminId: 'a2', adminNickname: '어드민', adminRole: 'admin',
    action: 'create', targetType: 'coupon', targetId: 'c4',
    description: '쿠폰 "등급차이 보상 5,000원" 생성',
    ipAddress: '192.168.1.10', createdAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'al7', adminId: 'a1', adminNickname: '슈퍼어드민', adminRole: 'super_admin',
    action: 'create', targetType: 'admin',
    description: '신규 관리자 계정 생성 (inspector 역할)',
    ipAddress: '192.168.1.1', createdAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'al8', adminId: 'a5', adminNickname: '정산매니저', adminRole: 'settlement_manager',
    action: 'update', targetType: 'settlement', targetId: 's2',
    description: '정산 s2 수동 정산 처리',
    ipAddress: '10.0.0.12', createdAt: '2026-04-07T09:30:00Z',
  },
  {
    id: 'al9', adminId: 'a3', adminNickname: 'CS담당자', adminRole: 'cs_agent',
    action: 'export', targetType: 'user',
    description: '사용자 목록 CSV 내보내기',
    ipAddress: '10.0.0.5', createdAt: '2026-04-06T15:45:00Z',
  },
  {
    id: 'al10', adminId: 'a1', adminNickname: '슈퍼어드민', adminRole: 'super_admin',
    action: 'update', targetType: 'permission',
    description: 'store_manager 역할 권한 변경',
    ipAddress: '192.168.1.1', createdAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'al11', adminId: 'a2', adminNickname: '어드민', adminRole: 'admin',
    action: 'create', targetType: 'banner', targetId: 'b1',
    description: '배너 "봄맞이 LP 특가전" 등록',
    ipAddress: '192.168.1.10', createdAt: '2026-03-28T10:10:00Z',
  },
  {
    id: 'al12', adminId: 'a2', adminNickname: '어드민', adminRole: 'admin',
    action: 'update', targetType: 'product', targetId: 'p8',
    description: '상품 p8 상태 변경 (on_sale → returning)',
    ipAddress: '192.168.1.10', createdAt: '2026-04-01T09:05:00Z',
  },
];
