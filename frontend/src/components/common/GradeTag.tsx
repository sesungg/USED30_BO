import type { MediaGrade } from '../../types';

const GRADE_MAP: Record<MediaGrade, { bg: string; text: string }> = {
  M:    { bg: 'success',   text: 'Mint' },
  NM:   { bg: 'success',   text: 'Near Mint' },
  'VG+':{ bg: 'primary',   text: 'VG+' },
  VG:   { bg: 'primary',   text: 'VG' },
  'G+': { bg: 'warning',   text: 'G+' },
  G:    { bg: 'warning',   text: 'G' },
  F:    { bg: 'danger',    text: 'Fair' },
  P:    { bg: 'danger',    text: 'Poor' },
};

interface GradeTagProps {
  grade: MediaGrade;
  showLabel?: boolean;
  className?: string;
}

export function GradeTag({ grade, showLabel = true, className = '' }: GradeTagProps) {
  const { bg, text } = GRADE_MAP[grade] ?? { bg: 'secondary', text: grade };
  return (
    <span className={`badge bg-${bg} ${className}`}>
      {grade}{showLabel && ` · ${text}`}
    </span>
  );
}
