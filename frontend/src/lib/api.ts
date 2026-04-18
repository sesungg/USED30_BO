import type { AdminRole, InspectionResult, MediaGrade, OrderStatus, ProductStatus, SettlementStatus } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:8080/api';

const SESSION_STORAGE_KEY = 'bo_auth_session';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SessionUser {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SessionUser;
}

export interface DashboardStats {
  todayInspectionPending: number;
  activeOrders: number;
  pendingSettlements: number;
  activeProducts: number;
  urgentInspections: InspectionSummary[];
  recentOrders: OrderSummary[];
}

export interface UserSummary {
  id: string;
  email: string;
  nickname: string;
  role: string;
  adminRole: AdminRole | null;
  mannerScore: number;
  salesCount: number;
  purchaseCount: number;
  active: boolean;
  createdAt: string;
}

export interface UserDetail extends UserSummary {
  phone: string | null;
  phoneVerified: boolean;
  profileBg: string;
  wishCount: number;
}

export interface ProductSummary {
  id: string;
  sellerId: string | null;
  artistName: string;
  albumName: string;
  askingPrice: number;
  finalPrice: number | null;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  sellerId: string | null;
  sellerEmail: string | null;
  sellerNickname: string | null;
  artistName: string;
  albumName: string;
  label: string;
  country: string;
  releaseYear: number;
  pressing: string | null;
  catalogNumber: string | null;
  format: string;
  rpm: number;
  mediaGrade: MediaGrade;
  sleeveGrade: MediaGrade;
  hasInsert: boolean;
  hasObiStrip: boolean;
  description: string | null;
  askingPrice: number;
  finalPrice: number | null;
  status: ProductStatus;
  guaranteed: boolean;
  sampleYoutubeId: string | null;
  coverBg: string;
  coverAccent: string;
  genres: string[];
  listedAt: string | null;
  soldAt: string | null;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  buyerId: string | null;
  buyerEmail: string | null;
  buyerNickname: string | null;
  productId: string | null;
  artistName: string | null;
  albumName: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  inspectionId: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingAddress2: string | null;
  shippingZipcode: string;
  deliveredAt: string | null;
  confirmedAt: string | null;
  autoConfirmAt: string | null;
}

export interface InspectionSummary {
  id: string;
  productId: string | null;
  artistName: string | null;
  albumName: string | null;
  result: InspectionResult;
  originalPrice: number;
  adjustedPrice: number | null;
  createdAt: string;
}

export interface InspectionDetail extends InspectionSummary {
  sellerMediaGrade: MediaGrade;
  sellerSleeveGrade: MediaGrade;
  inspectorMediaGrade: MediaGrade | null;
  inspectorSleeveGrade: MediaGrade | null;
  rejectionReason: string | null;
  notes: string | null;
  sellerResponse: string | null;
  sellerRespondedAt: string | null;
  responseDeadline: string | null;
  rejectionAction: string | null;
  rejectionActionedAt: string | null;
  receivedAt: string | null;
  inspectedAt: string | null;
}

export interface SettlementSummary {
  id: string;
  sellerId: string | null;
  sellerEmail: string | null;
  sellerNickname: string | null;
  salePrice: number;
  feeAmount: number;
  netAmount: number;
  status: SettlementStatus;
  trigger: string;
  createdAt: string;
}

export interface SettlementDetail extends SettlementSummary {
  orderId: string | null;
  bankAccountId: string | null;
  feeRate: number;
  settledAt: string | null;
  pgTransferId: string | null;
  failedReason: string | null;
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

function normalizeMessage(message: string | null | undefined, fallback: string) {
  return message && message.trim() ? message : fallback;
}

function getStoredSession(): AuthSession | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function readSession() {
  return getStoredSession();
}

export function writeSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = options.token ?? session?.accessToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const fallback = response.status === 401
      ? '로그인이 필요합니다.'
      : response.status === 403
        ? '접근 권한이 없습니다.'
        : '요청 처리 중 오류가 발생했습니다.';
    throw new Error(normalizeMessage(payload?.message, fallback));
  }

  return payload.data;
}

function toSessionUser(response: LoginResponseDto): SessionUser {
  return {
    id: response.userId,
    email: response.email,
    nickname: response.nickname,
    role: (response.adminRole ?? 'admin') as AdminRole,
  };
}

function mapPage<T>(page: PageResult<T>) {
  return {
    ...page,
    page: page.page + 1,
  };
}

interface LoginResponseDto {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  adminRole: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const data = await request<LoginResponseDto>('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null,
  });

  const session = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + data.accessTokenExpiresIn,
    user: toSessionUser(data),
  };

  writeSession(session);
  return session;
}

export async function fetchDashboard() {
  return request<DashboardStats>('/dashboard');
}

export async function fetchUsers(params: { page: number; size: number; search?: string }) {
  const searchParams = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.search) {
    searchParams.set('search', params.search);
  }
  const data = await request<PageResult<UserSummary>>(`/users?${searchParams.toString()}`);
  return mapPage(data);
}

export async function fetchUser(id: string) {
  return request<UserDetail>(`/users/${id}`);
}

export async function updateUserMannerScore(id: string, mannerScore: number, reason?: string) {
  return request<UserDetail>(`/users/${id}/manner-score`, {
    method: 'PATCH',
    body: { mannerScore, reason },
  });
}

export async function banUser(id: string, reason: string) {
  return request<UserDetail>(`/users/${id}/ban`, {
    method: 'POST',
    body: { reason },
  });
}

export async function activateUser(id: string) {
  return request<UserDetail>(`/users/${id}/activate`, {
    method: 'POST',
  });
}

export async function fetchProducts(params: { page: number; size: number; status?: ProductStatus | 'all'; search?: string }) {
  const searchParams = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  const data = await request<PageResult<ProductSummary>>(`/products?${searchParams.toString()}`);
  return mapPage(data);
}

export async function fetchProduct(id: string) {
  return request<ProductDetail>(`/products/${id}`);
}

export async function fetchOrders(params: {
  page: number;
  size: number;
  status?: OrderStatus | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('endDate', params.endDate);
  }
  const data = await request<PageResult<OrderSummary>>(`/orders?${searchParams.toString()}`);
  return mapPage(data);
}

export async function fetchOrder(id: string) {
  return request<OrderDetail>(`/orders/${id}`);
}

export async function registerOrderShipping(id: string, carrier: string, trackingNo: string) {
  return request<OrderDetail>(`/orders/${id}/shipping`, {
    method: 'POST',
    body: { carrier, trackingNo },
  });
}

export async function approveOrderReturn(id: string) {
  return request<OrderDetail>(`/orders/${id}/return/approve`, {
    method: 'POST',
  });
}

export async function rejectOrderReturn(id: string) {
  return request<OrderDetail>(`/orders/${id}/return/reject`, {
    method: 'POST',
  });
}

export async function fetchInspections(params: {
  page: number;
  size: number;
  result?: InspectionResult | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.result && params.result !== 'all') {
    searchParams.set('result', params.result);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('endDate', params.endDate);
  }
  const data = await request<PageResult<InspectionSummary>>(`/inspections?${searchParams.toString()}`);
  return mapPage(data);
}

export async function fetchInspection(id: string) {
  return request<InspectionDetail>(`/inspections/${id}`);
}

export async function approveInspection(id: string, inspectorMediaGrade: MediaGrade, inspectorSleeveGrade: MediaGrade, notes?: string) {
  return request<InspectionDetail>(`/inspections/${id}/approve`, {
    method: 'POST',
    body: { inspectorMediaGrade, inspectorSleeveGrade, notes },
  });
}

export async function gradeMismatchInspection(
  id: string,
  inspectorMediaGrade: MediaGrade,
  inspectorSleeveGrade: MediaGrade,
  adjustedPrice: number,
  notes?: string,
) {
  return request<InspectionDetail>(`/inspections/${id}/grade-mismatch`, {
    method: 'POST',
    body: { inspectorMediaGrade, inspectorSleeveGrade, adjustedPrice, notes },
  });
}

export async function rejectInspection(id: string, rejectionReason: string, notes?: string) {
  return request<InspectionDetail>(`/inspections/${id}/reject`, {
    method: 'POST',
    body: { rejectionReason, notes },
  });
}

export async function fetchSettlements(params: {
  page: number;
  size: number;
  status?: SettlementStatus | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page - 1),
    size: String(params.size),
  });
  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.startDate) {
    searchParams.set('startDate', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('endDate', params.endDate);
  }
  const data = await request<PageResult<SettlementSummary>>(`/settlements?${searchParams.toString()}`);
  return mapPage(data);
}

export async function fetchSettlement(id: string) {
  return request<SettlementDetail>(`/settlements/${id}`);
}

export async function processSettlement(id: string) {
  return request<SettlementDetail>(`/settlements/${id}/process`, {
    method: 'POST',
  });
}
