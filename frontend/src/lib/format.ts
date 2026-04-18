export function formatDate(value?: string | null, includeTime = false) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return includeTime
    ? date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString('ko-KR');
}

export function formatPrice(value?: number | null) {
  if (value === null || value === undefined) {
    return '—';
  }
  return `₩${value.toLocaleString()}`;
}

export function toDateTimeParam(value?: string) {
  if (!value) {
    return undefined;
  }
  return `${value}T00:00:00+09:00`;
}

export function toDateTimeEndParam(value?: string) {
  if (!value) {
    return undefined;
  }
  return `${value}T23:59:59+09:00`;
}
