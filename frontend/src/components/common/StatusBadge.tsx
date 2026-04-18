import type { OrderStatus, ProductStatus, InspectionResult, SettlementStatus, UserAccountStatus } from '../../types';

type AnyStatus = OrderStatus | ProductStatus | InspectionResult | SettlementStatus | UserAccountStatus | string;

const STATUS_MAP: Record<string, { label: string; bg: string }> = {
  // OrderStatus
  payment_complete:             { label: '결제완료',    bg: 'primary' },
  inspection_pending:           { label: '검수대기',    bg: 'warning text-dark' },
  inspection_pass:              { label: '검수합격',    bg: 'success' },
  inspection_grade_mismatch:    { label: '등급차이',    bg: 'warning text-dark' },
  inspection_rejected:          { label: '검수반려',    bg: 'danger' },
  shipping:                     { label: '배송중',      bg: 'info text-dark' },
  delivered:                    { label: '수령완료',    bg: 'success' },
  confirmed:                    { label: '구매확정',    bg: 'success' },
  auto_confirmed:               { label: '자동확정',    bg: 'secondary' },
  return_requested:             { label: '반품신청',    bg: 'danger' },
  refunded:                     { label: '환불완료',    bg: 'secondary' },
  cancelled:                    { label: '취소',        bg: 'secondary' },
  // ProductStatus
  draft:                        { label: '임시저장',    bg: 'secondary' },
  on_sale:                      { label: '판매중',      bg: 'primary' },
  sold:                         { label: '판매완료',    bg: 'success' },
  returning:                    { label: '반송중',      bg: 'warning text-dark' },
  disposed:                     { label: '폐기',        bg: 'dark' },
  // InspectionResult
  pending:                      { label: '검수대기',    bg: 'warning text-dark' },
  approved:                     { label: '합격',        bg: 'success' },
  grade_mismatch:               { label: '등급차이',    bg: 'warning text-dark' },
  rejected:                     { label: '반려',        bg: 'danger' },
  // SettlementStatus
  processing:                   { label: '처리중',      bg: 'info text-dark' },
  completed:                    { label: '정산완료',    bg: 'success' },
  failed:                       { label: '실패',        bg: 'danger' },
  // UserAccountStatus
  active:                       { label: '활성',        bg: 'success' },
  suspended:                    { label: '정지',        bg: 'danger' },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { label, bg } = STATUS_MAP[status] ?? { label: status, bg: 'secondary' };
  return (
    <span className={`badge bg-${bg} ${className}`}>{label}</span>
  );
}
