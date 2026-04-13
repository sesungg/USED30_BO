// TODO: extract shared types to a shared package when backend is added
export type Genre =
  | 'ALL' | 'JAZZ' | 'R&B' | 'DISCO' | 'SOUL'
  | 'ROCK' | 'CLASSICAL' | 'HIP-HOP' | 'FUNK' | 'BLUES' | 'POP';

export type MediaGrade = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P';

export type ProductStatus =
  | 'draft'
  | 'inspection_pending'
  | 'on_sale'
  | 'sold'
  | 'returning'
  | 'disposed'
  | 'cancelled';

export type OrderStatus =
  | 'payment_complete'
  | 'inspection_pending'
  | 'inspection_pass'
  | 'inspection_grade_mismatch'
  | 'inspection_rejected'
  | 'shipping'
  | 'delivered'
  | 'confirmed'
  | 'auto_confirmed'
  | 'return_requested'
  | 'refunded'
  | 'cancelled';

export type InspectionResult = 'pending' | 'approved' | 'grade_mismatch' | 'rejected';

export type SettlementStatus = 'pending' | 'completed';

export type UserAccountStatus = 'active' | 'suspended';

export interface Product {
  id: string;
  artistName: string;
  albumName: string;
  label: string;
  country: string;
  releaseYear: number;
  pressing: string;
  format: string;
  rpm: 33 | 45 | 78;
  genre: Genre[];
  mediaGrade: MediaGrade;
  sleeveGrade: MediaGrade;
  hasInsert: boolean;
  hasObiStrip: boolean;
  price: number;
  originalPrice?: number;
  location: string;
  sellerId: string;
  sellerNickname: string;
  status: ProductStatus;
  createdAt: string;
  catalogNumber?: string;
}

export interface InspectionPhoto {
  id: string;
  type: 'record_side' | 'label' | 'sleeve_front' | 'sleeve_back';
  url: string;
}

export interface Inspection {
  id: string;
  productId: string;
  orderId: string;
  result: InspectionResult;
  sellerMediaGrade: MediaGrade;
  inspectorMediaGrade?: MediaGrade;
  sellerSleeveGrade: MediaGrade;
  inspectorSleeveGrade?: MediaGrade;
  photos: InspectionPhoto[];
  notes?: string;
  adjustedPrice?: number;
  originalPrice: number;
  deadline?: string;
  createdAt: string;
  // denormalized for list display
  artistName: string;
  albumName: string;
  sellerNickname: string;
}

export interface Order {
  id: string;
  productId: string;
  product: Product;
  buyerId: string;
  buyerNickname: string;
  status: OrderStatus;
  payment: {
    method: 'card' | 'balance' | 'transfer';
    amount: number;
    paidAt: string;
  };
  shipping?: {
    carrier: string;
    trackingNo: string;
    currentStatus: string;
    estimatedAt?: string;
  };
  inspection?: Inspection;
  returnRequest?: ReturnRequest;
  createdAt: string;
  deliveredAt?: string;
}

export interface Settlement {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  sellerNickname: string;
  artistName: string;
  albumName: string;
  salePrice: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  status: SettlementStatus;
  settledAt?: string;
  trigger: 'confirm' | 'auto' | 'manual';
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: 'delivery_damage' | 'wrong_item' | 'grade_mismatch';
  photos: string[];
  description?: string;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface BoUser {
  id: string;
  nickname: string;
  email: string;
  phone?: string;
  mannerScore: number;
  trustScore: number;
  salesCount: number;
  purchaseCount: number;
  accountStatus: UserAccountStatus;
  penaltyLevel?: 'warning' | 'restricted' | 'suspended' | 'banned';
  settlementAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: string;
}

export type PenaltyType = 'warning' | 'restricted' | 'suspended' | 'banned';

export interface UserPenalty {
  id: string;
  userId: string;
  type: PenaltyType;
  reason: string;
  duration?: number; // days, undefined = permanent
  status: 'active' | 'expired' | 'revoked';
  adminId: string;
  adminNickname: string;
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

// Admin-specific types
export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'inspector'
  | 'settlement_manager'
  | 'cs_agent'
  | 'product_reviewer'
  | 'store_manager'
  | 'readonly_analyst';

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
}

export interface AdminAccount {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: string;
}

// ── Operational types ───────────────────────────────────────────────────────

export type NoticeStatus = 'draft' | 'published' | 'archived';
export type NoticeCategory = '공지' | '업데이트' | '이벤트' | '점검' | '기타';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  status: NoticeStatus;
  isPinned: boolean;
  authorAdminId: string;
  authorNickname: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  value: number;          // % or ₩
  minOrderAmount?: number;
  maxDiscount?: number;   // for percentage coupons
  totalLimit?: number;    // max issuable
  issuedCount: number;
  usedCount: number;
  status: CouponStatus;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

export type BannerPosition = 'main_top' | 'main_middle' | 'popup' | 'sidebar';
export type BannerStatus = 'active' | 'inactive' | 'scheduled';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  status: BannerStatus;
  order: number;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  createdBy: string;
}

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'ended';

export interface MarketingEvent {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: EventStatus;
  couponId?: string;
  startAt: string;
  endAt: string;
  participantCount: number;
  createdAt: string;
  createdBy: string;
}

export type FaqCategory = '거래' | '검수' | '정산' | '배송' | '계정' | '기타';
export type FaqStatus = 'published' | 'draft';

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  status: FaqStatus;
  order: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Audit & Log types ────────────────────────────────────────────────────────

export type AuditAction = 'read' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';
export type AuditTargetType =
  | 'user' | 'product' | 'order' | 'inspection' | 'settlement'
  | 'notice' | 'coupon' | 'banner' | 'event' | 'faq'
  | 'admin' | 'permission' | 'settings' | 'system';

export interface AuditLog {
  id: string;
  adminId: string;
  adminNickname: string;
  adminRole: AdminRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  description: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export type LoginResult = 'success' | 'fail_password' | 'fail_suspended' | 'fail_not_found';

export interface LoginLog {
  id: string;
  userId?: string;
  userNickname?: string;
  email: string;
  result: LoginResult;
  ipAddress: string;
  device: string;
  createdAt: string;
}

// ── System Settings ──────────────────────────────────────────────────────────

export interface SystemSettings {
  feeRate: number;            // e.g. 0.10
  autoConfirmDays: number;    // days until auto-confirm
  slaHours: number;           // inspection SLA
  maxPendingInspections: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  siteName: string;
  supportEmail: string;
}
