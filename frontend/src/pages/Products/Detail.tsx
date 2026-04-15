import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProducts } from '../../data/mockProducts';
import { mockOrders } from '../../data/mockOrders';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GradeTag } from '../../components/common/GradeTag';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';
import type { Product, MediaGrade, ProductStatus } from '../../types';

type Tab = 'info' | 'transaction' | 'photos' | 'history';

const GRADES: MediaGrade[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: '초안' },
  { value: 'inspection_pending', label: '검수대기' },
  { value: 'on_sale', label: '판매중' },
  { value: 'sold', label: '판매완료' },
  { value: 'returning', label: '반송중' },
  { value: 'cancelled', label: '취소' },
  { value: 'disposed', label: '폐기' },
];

// Mock edit history per product
const MOCK_EDIT_HISTORY: Record<string, { id: string; field: string; before: string; after: string; editedAt: string; editedBy: string }[]> = {
  p1: [
    { id: 'eh1', field: '가격', before: '200,000', after: '180,000', editedAt: '2026-04-02T10:00:00Z', editedBy: '레코드맨' },
    { id: 'eh2', field: '미디어 등급', before: 'VG+', after: 'NM', editedAt: '2026-04-01T15:00:00Z', editedBy: '레코드맨' },
  ],
  p5: [
    { id: 'eh3', field: '슬리브 등급', before: 'VG+', after: 'NM', editedAt: '2026-04-08T17:00:00Z', editedBy: '레코드맨' },
  ],
  p8: [
    { id: 'eh4', field: '상태', before: 'on_sale', after: 'returning', editedAt: '2026-04-01T09:00:00Z', editedBy: '관리자' },
    { id: 'eh5', field: '가격', before: '60,000', after: '45,000', editedAt: '2026-03-28T11:00:00Z', editedBy: '블루스마니아' },
  ],
};

const TAB_LIST: { key: Tab; label: string }[] = [
  { key: 'info', label: '상품 정보' },
  { key: 'transaction', label: '거래 정보' },
  { key: 'photos', label: '검수 사진' },
  { key: 'history', label: '수정 내역' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { user: adminUser } = useAuth();
  const canEdit = adminUser ? canWrite(adminUser.role, 'products') : false;

  const [product, setProduct] = useState<Product | null>(
    () => mockProducts.find(p => p.id === id) ?? null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [activeTab, setActiveTab] = useState<Tab>('info');

  if (!product) return <div className="text-center py-5 text-muted">상품을 찾을 수 없습니다.</div>;

  // Related data
  const relatedOrder = mockOrders.find(o => o.productId === id);
  const inspection = relatedOrder?.inspection;
  const editHistory = MOCK_EDIT_HISTORY[id ?? ''] ?? [];

  function startEdit() {
    if (!product) return;
    setEditForm({
      price: product.price,
      status: product.status,
      mediaGrade: product.mediaGrade,
      sleeveGrade: product.sleeveGrade,
      location: product.location,
    });
    setIsEditing(true);
  }

  function saveEdit() {
    setProduct(prev => prev ? { ...prev, ...editForm } : null);
    setIsEditing(false);
    showToast('상품 정보가 수정되었습니다.', 'success');
  }

  function cancelEdit() {
    setEditForm({});
    setIsEditing(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <Link to="/products" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{product.artistName} — {product.albumName}</h5>
        <StatusBadge status={product.status} />
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary ms-auto" onClick={startEdit}>
            수정
          </button>
        )}
        {isEditing && (
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={saveEdit}>저장</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>취소</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TAB_LIST.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.key === 'photos' && inspection && inspection.photos.length > 0 && (
                <span className="badge bg-secondary ms-1" style={{ fontSize: 10 }}>{inspection.photos.length}</span>
              )}
              {t.key === 'history' && editHistory.length > 0 && (
                <span className="badge bg-secondary ms-1" style={{ fontSize: 10 }}>{editHistory.length}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* ── 상품 정보 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold">음반 정보</div>
              <div className="card-body">
                <div className="row g-2 small">
                  <div className="col-4 text-muted">아티스트</div><div className="col-8 fw-bold">{product.artistName}</div>
                  <div className="col-4 text-muted">앨범</div><div className="col-8 fw-medium">{product.albumName}</div>
                  <div className="col-4 text-muted">레이블</div><div className="col-8">{product.label}</div>
                  <div className="col-4 text-muted">국가</div><div className="col-8">{product.country}</div>
                  <div className="col-4 text-muted">발매년도</div><div className="col-8">{product.releaseYear}</div>
                  <div className="col-4 text-muted">프레싱</div><div className="col-8">{product.pressing}</div>
                  <div className="col-4 text-muted">포맷</div><div className="col-8">{product.format} / {product.rpm}RPM</div>
                  <div className="col-4 text-muted">장르</div><div className="col-8">{product.genre.join(', ')}</div>
                  {product.catalogNumber && <>
                    <div className="col-4 text-muted">카탈로그</div><div className="col-8">{product.catalogNumber}</div>
                  </>}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                <span>상태 및 가격</span>
                {isEditing && <span className="badge bg-warning text-dark">편집 중</span>}
              </div>
              <div className="card-body">
                <div className="row g-2 small">
                  <div className="col-4 text-muted">미디어 등급</div>
                  <div className="col-8">
                    {isEditing ? (
                      <select className="form-select form-select-sm" style={{ width: 100 }}
                        value={editForm.mediaGrade ?? product.mediaGrade}
                        onChange={e => setEditForm(f => ({ ...f, mediaGrade: e.target.value as MediaGrade }))}>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : <GradeTag grade={product.mediaGrade} />}
                  </div>
                  <div className="col-4 text-muted">슬리브 등급</div>
                  <div className="col-8">
                    {isEditing ? (
                      <select className="form-select form-select-sm" style={{ width: 100 }}
                        value={editForm.sleeveGrade ?? product.sleeveGrade}
                        onChange={e => setEditForm(f => ({ ...f, sleeveGrade: e.target.value as MediaGrade }))}>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : <GradeTag grade={product.sleeveGrade} />}
                  </div>
                  <div className="col-4 text-muted">인서트</div><div className="col-8">{product.hasInsert ? '있음' : '없음'}</div>
                  <div className="col-4 text-muted">OBI 스트립</div><div className="col-8">{product.hasObiStrip ? '있음' : '없음'}</div>
                  <div className="col-12"><hr className="my-1" /></div>
                  <div className="col-4 text-muted">가격</div>
                  <div className="col-8">
                    {isEditing ? (
                      <input type="number" className="form-control form-control-sm" style={{ width: 140 }}
                        value={editForm.price ?? product.price}
                        onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} />
                    ) : <span className="fw-bold text-primary">₩{product.price.toLocaleString()}</span>}
                  </div>
                  {product.originalPrice && <>
                    <div className="col-4 text-muted">희망가</div>
                    <div className="col-8 text-muted">₩{product.originalPrice.toLocaleString()}</div>
                  </>}
                  <div className="col-4 text-muted">위치</div>
                  <div className="col-8">
                    {isEditing ? (
                      <input className="form-control form-control-sm" style={{ width: 180 }}
                        value={editForm.location ?? product.location}
                        onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
                    ) : product.location}
                  </div>
                  <div className="col-4 text-muted">상태</div>
                  <div className="col-8">
                    {isEditing ? (
                      <select className="form-select form-select-sm" style={{ width: 160 }}
                        value={editForm.status ?? product.status}
                        onChange={e => setEditForm(f => ({ ...f, status: e.target.value as ProductStatus }))}>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : <StatusBadge status={product.status} />}
                  </div>
                  <div className="col-4 text-muted">등록일</div>
                  <div className="col-8">{product.createdAt.slice(0, 10)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">판매자 정보</div>
              <div className="card-body">
                <div className="row g-2 small">
                  <div className="col-4 text-muted">닉네임</div>
                  <div className="col-8">
                    <Link to={`/users/${product.sellerId}`} className="text-decoration-none fw-medium">
                      {product.sellerNickname}
                    </Link>
                  </div>
                  <div className="col-4 text-muted">판매자 ID</div>
                  <div className="col-8 text-muted">#{product.sellerId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 거래 정보 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'transaction' && (
        <div className="row g-3">
          {relatedOrder ? (
            <>
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white fw-semibold d-flex align-items-center justify-content-between">
                    <span>주문 정보</span>
                    <Link to={`/orders/${relatedOrder.id}`} className="btn btn-sm btn-outline-secondary">주문 상세</Link>
                  </div>
                  <div className="card-body">
                    <div className="row g-2 small">
                      <div className="col-4 text-muted">주문 ID</div>
                      <div className="col-8 text-muted">#{relatedOrder.id}</div>
                      <div className="col-4 text-muted">주문 상태</div>
                      <div className="col-8"><StatusBadge status={relatedOrder.status} /></div>
                      <div className="col-4 text-muted">결제 금액</div>
                      <div className="col-8 fw-bold text-primary">₩{relatedOrder.payment.amount.toLocaleString()}</div>
                      <div className="col-4 text-muted">결제 수단</div>
                      <div className="col-8">
                        {relatedOrder.payment.method === 'card' ? '카드' :
                         relatedOrder.payment.method === 'transfer' ? '계좌이체' : '잔액'}
                      </div>
                      <div className="col-4 text-muted">결제일시</div>
                      <div className="col-8">{relatedOrder.payment.paidAt.slice(0, 16).replace('T', ' ')}</div>
                      <div className="col-4 text-muted">주문일</div>
                      <div className="col-8">{relatedOrder.createdAt.slice(0, 10)}</div>
                      {relatedOrder.deliveredAt && <>
                        <div className="col-4 text-muted">수령일</div>
                        <div className="col-8">{relatedOrder.deliveredAt.slice(0, 10)}</div>
                      </>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white fw-semibold">구매자 정보</div>
                  <div className="card-body">
                    <div className="row g-2 small">
                      <div className="col-4 text-muted">닉네임</div>
                      <div className="col-8">
                        <Link to={`/users/${relatedOrder.buyerId}`} className="text-decoration-none fw-medium">
                          {relatedOrder.buyerNickname}
                        </Link>
                      </div>
                      <div className="col-4 text-muted">구매자 ID</div>
                      <div className="col-8 text-muted">#{relatedOrder.buyerId}</div>
                    </div>
                  </div>
                </div>

                {relatedOrder.shipping && (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-header bg-white fw-semibold">배송 정보</div>
                    <div className="card-body">
                      <div className="row g-2 small">
                        <div className="col-4 text-muted">택배사</div><div className="col-8">{relatedOrder.shipping.carrier}</div>
                        <div className="col-4 text-muted">운송장</div><div className="col-8 fw-medium">{relatedOrder.shipping.trackingNo}</div>
                        <div className="col-4 text-muted">배송 상태</div><div className="col-8">{relatedOrder.shipping.currentStatus}</div>
                      </div>
                    </div>
                  </div>
                )}

                {relatedOrder.returnRequest && (
                  <div className="card border-0 shadow-sm border-danger-subtle">
                    <div className="card-header bg-white fw-semibold text-danger">반품 신청</div>
                    <div className="card-body">
                      <div className="row g-2 small">
                        <div className="col-4 text-muted">사유</div>
                        <div className="col-8">
                          {relatedOrder.returnRequest.reason === 'grade_mismatch' ? '등급 불일치' :
                           relatedOrder.returnRequest.reason === 'delivery_damage' ? '배송 파손' : '오발송'}
                        </div>
                        <div className="col-4 text-muted">상태</div>
                        <div className="col-8"><StatusBadge status={relatedOrder.returnRequest.status} /></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center text-muted py-5">
                  아직 거래 내역이 없는 상품입니다.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 검수 사진 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'photos' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">
            검수 사진
            {inspection && (
              <Link to={`/inspections/${inspection.id}`} className="btn btn-sm btn-outline-secondary ms-2">검수 상세</Link>
            )}
          </div>
          <div className="card-body">
            {!inspection || inspection.photos.length === 0 ? (
              <div className="text-center text-muted py-4">등록된 검수 사진이 없습니다.</div>
            ) : (
              <>
                {inspection && (
                  <div className="mb-3 small">
                    <span className="text-muted">검수 결과:</span>{' '}
                    <StatusBadge status={inspection.result} />
                    {inspection.inspectorMediaGrade && (
                      <span className="ms-2 text-muted">
                        판정 등급: <GradeTag grade={inspection.inspectorMediaGrade} showLabel={false} />
                      </span>
                    )}
                    {inspection.notes && (
                      <p className="mt-2 mb-0 text-muted">{inspection.notes}</p>
                    )}
                  </div>
                )}
                <div className="row g-3">
                  {inspection.photos.map(photo => {
                    const LABELS: Record<string, string> = {
                      record_side: '음반 면',
                      label: '레이블',
                      sleeve_front: '슬리브 앞',
                      sleeve_back: '슬리브 뒤',
                    };
                    return (
                      <div key={photo.id} className="col-6 col-md-3">
                        <div className="border rounded overflow-hidden" style={{ aspectRatio: '1', background: '#f8f9fa' }}>
                          <img src={photo.url} alt={photo.type} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="text-muted mt-1 small">{LABELS[photo.type] ?? photo.type}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 수정 내역 Tab ────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold">수정 내역 ({editHistory.length}건)</div>
          <div className="card-body p-0">
            {editHistory.length === 0 ? (
              <div className="text-center text-muted py-4">수정 내역이 없습니다.</div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">항목</th>
                    <th>변경 전</th>
                    <th>변경 후</th>
                    <th>수정자</th>
                    <th>수정일시</th>
                  </tr>
                </thead>
                <tbody>
                  {editHistory.map(h => (
                    <tr key={h.id}>
                      <td className="ps-3 small fw-medium">{h.field}</td>
                      <td className="small text-muted">{h.before}</td>
                      <td className="small fw-medium">{h.after}</td>
                      <td className="small">{h.editedBy}</td>
                      <td className="small text-muted">{h.editedAt.slice(0, 16).replace('T', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
