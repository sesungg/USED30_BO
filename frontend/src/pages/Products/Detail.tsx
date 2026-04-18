import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GradeTag } from '../../components/common/GradeTag';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchProduct, type ProductDetail } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchProduct(id)
      .then(response => {
        if (!cancelled) {
          setProduct(response);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '상품 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="text-center py-5 text-muted">상품 정보를 불러오는 중입니다.</div>;
  }

  if (error || !product) {
    return <div className="alert alert-danger">{error || '상품을 찾을 수 없습니다.'}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/products" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">{product.artistName} - {product.albumName}</h5>
        <StatusBadge status={product.status} />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">음반 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">아티스트</div><div className="col-8 fw-medium">{product.artistName}</div>
                <div className="col-4 text-muted">앨범</div><div className="col-8">{product.albumName}</div>
                <div className="col-4 text-muted">레이블</div><div className="col-8">{product.label}</div>
                <div className="col-4 text-muted">국가</div><div className="col-8">{product.country}</div>
                <div className="col-4 text-muted">발매년도</div><div className="col-8">{product.releaseYear}</div>
                <div className="col-4 text-muted">프레싱</div><div className="col-8">{product.pressing ?? '—'}</div>
                <div className="col-4 text-muted">카탈로그 번호</div><div className="col-8">{product.catalogNumber ?? '—'}</div>
                <div className="col-4 text-muted">포맷</div><div className="col-8">{product.format} / {product.rpm} RPM</div>
                <div className="col-4 text-muted">장르</div><div className="col-8">{product.genres.join(', ') || '—'}</div>
                <div className="col-4 text-muted">설명</div><div className="col-8">{product.description ?? '—'}</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">상태 및 가격</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">미디어 등급</div><div className="col-8"><GradeTag grade={product.mediaGrade} /></div>
                <div className="col-4 text-muted">슬리브 등급</div><div className="col-8"><GradeTag grade={product.sleeveGrade} /></div>
                <div className="col-4 text-muted">인서트</div><div className="col-8">{product.hasInsert ? '있음' : '없음'}</div>
                <div className="col-4 text-muted">OBI 스트립</div><div className="col-8">{product.hasObiStrip ? '있음' : '없음'}</div>
                <div className="col-4 text-muted">판매 희망가</div><div className="col-8 fw-medium">{formatPrice(product.askingPrice)}</div>
                <div className="col-4 text-muted">최종가</div><div className="col-8">{formatPrice(product.finalPrice)}</div>
                <div className="col-4 text-muted">보증 여부</div><div className="col-8">{product.guaranteed ? '보증' : '일반'}</div>
                <div className="col-4 text-muted">등록일</div><div className="col-8">{formatDate(product.createdAt, true)}</div>
                <div className="col-4 text-muted">판매 시작일</div><div className="col-8">{formatDate(product.listedAt, true)}</div>
                <div className="col-4 text-muted">판매 완료일</div><div className="col-8">{formatDate(product.soldAt, true)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">판매자 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">판매자</div>
                <div className="col-8">
                  {product.sellerId ? (
                    <Link to={`/users/${product.sellerId}`} className="text-decoration-none fw-medium">
                      {product.sellerNickname ?? product.sellerId}
                    </Link>
                  ) : '—'}
                </div>
                <div className="col-4 text-muted">이메일</div><div className="col-8">{product.sellerEmail ?? '—'}</div>
                <div className="col-4 text-muted">유튜브 샘플</div>
                <div className="col-8">
                  {product.sampleYoutubeId
                    ? <a href={`https://www.youtube.com/watch?v=${product.sampleYoutubeId}`} target="_blank" rel="noreferrer">열기</a>
                    : '—'}
                </div>
                <div className="col-4 text-muted">커버 색상</div><div className="col-8">{product.coverBg} / {product.coverAccent}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
