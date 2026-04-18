import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { canWrite } from '../../constants/permissions';
import { activateUser, banUser, fetchUser, updateUserMannerScore, type UserDetail } from '../../lib/api';
import { formatDate } from '../../lib/format';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: adminUser } = useAuth();
  const { showToast } = useToast();
  const canEdit = adminUser ? canWrite(adminUser.role, 'users') : false;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mannerScore, setMannerScore] = useState('');
  const [reason, setReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    void fetchUser(id)
      .then(response => {
        if (cancelled) {
          return;
        }
        setUser(response);
        setMannerScore(String(response.mannerScore));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '사용자 정보를 불러오지 못했습니다.');
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

  async function handleMannerScoreSave() {
    if (!id) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUserMannerScore(id, Number(mannerScore), reason || undefined);
      setUser(updated);
      setMannerScore(String(updated.mannerScore));
      setReason('');
      showToast('매너 점수를 수정했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '매너 점수 수정에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleBan() {
    if (!id || !banReason.trim()) {
      showToast('정지 사유를 입력해주세요.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updated = await banUser(id, banReason);
      setUser(updated);
      setBanReason('');
      showToast('사용자를 정지했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '정지 처리에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!id) {
      return;
    }

    setSaving(true);
    try {
      const updated = await activateUser(id);
      setUser(updated);
      showToast('사용자를 활성화했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '활성화 처리에 실패했습니다.', 'danger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5 text-muted">사용자 정보를 불러오는 중입니다.</div>;
  }

  if (error || !user) {
    return <div className="alert alert-danger">{error || '사용자를 찾을 수 없습니다.'}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/users" className="btn btn-sm btn-outline-secondary">← 목록</Link>
        <h5 className="fw-bold mb-0">사용자 상세</h5>
        <StatusBadge status={user.active ? 'active' : 'suspended'} />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-semibold">기본 정보</div>
            <div className="card-body">
              <div className="row g-2 small">
                <div className="col-4 text-muted">닉네임</div><div className="col-8 fw-medium">{user.nickname}</div>
                <div className="col-4 text-muted">이메일</div><div className="col-8">{user.email}</div>
                <div className="col-4 text-muted">전화번호</div><div className="col-8">{user.phone ?? '—'}</div>
                <div className="col-4 text-muted">전화 인증</div><div className="col-8">{user.phoneVerified ? '완료' : '미인증'}</div>
                <div className="col-4 text-muted">회원 역할</div><div className="col-8">{user.role}</div>
                <div className="col-4 text-muted">관리자 역할</div><div className="col-8">{user.adminRole ?? '—'}</div>
                <div className="col-4 text-muted">가입일</div><div className="col-8">{formatDate(user.createdAt, true)}</div>
                <div className="col-4 text-muted">프로필 배경</div><div className="col-8">{user.profileBg}</div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">활동 요약</div>
            <div className="card-body">
              <div className="row row-cols-2 g-3">
                <div className="col"><div className="border rounded p-3"><div className="text-muted small">매너 점수</div><div className="fw-bold fs-5">{user.mannerScore.toFixed(2)}</div></div></div>
                <div className="col"><div className="border rounded p-3"><div className="text-muted small">판매 수</div><div className="fw-bold fs-5">{user.salesCount}</div></div></div>
                <div className="col"><div className="border rounded p-3"><div className="text-muted small">구매 수</div><div className="fw-bold fs-5">{user.purchaseCount}</div></div></div>
                <div className="col"><div className="border rounded p-3"><div className="text-muted small">위시 수</div><div className="fw-bold fs-5">{user.wishCount}</div></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">관리 작업</div>
            <div className="card-body">
              {!canEdit ? (
                <p className="text-muted small mb-0">수정 권한이 없습니다.</p>
              ) : (
                <>
                  <label className="form-label small fw-semibold">매너 점수 수정</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm mb-2"
                    value={mannerScore}
                    onChange={event => setMannerScore(event.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm mb-3"
                    placeholder="사유 (선택)"
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                  />
                  <button className="btn btn-sm btn-primary mb-4" disabled={saving} onClick={handleMannerScoreSave}>
                    매너 점수 저장
                  </button>

                  <hr />

                  {!user.active ? (
                    <button className="btn btn-sm btn-success" disabled={saving} onClick={handleActivate}>
                      계정 활성화
                    </button>
                  ) : (
                    <>
                      <label className="form-label small fw-semibold mt-2">계정 정지 사유</label>
                      <textarea
                        className="form-control form-control-sm mb-3"
                        rows={3}
                        value={banReason}
                        onChange={event => setBanReason(event.target.value)}
                        placeholder="정지 사유를 입력하세요."
                      />
                      <button className="btn btn-sm btn-danger" disabled={saving} onClick={handleBan}>
                        계정 정지
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
