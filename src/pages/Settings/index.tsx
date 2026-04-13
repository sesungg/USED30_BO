import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { canWrite } from '../../constants/permissions';

interface SystemSettings {
  siteName: string;
  supportEmail: string;
  feeRate: number;
  autoConfirmDays: number;
  slaHours: number;
  maxPendingInspections: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'USED30',
  supportEmail: 'support@used30.com',
  feeRate: 5,
  autoConfirmDays: 7,
  slaHours: 48,
  maxPendingInspections: 200,
  maintenanceMode: false,
  allowNewRegistrations: true,
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user ? canWrite(user.role, 'settings') : false;

  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isEditing, setIsEditing] = useState(false);

  function handleSave() {
    if (settings.feeRate < 0 || settings.feeRate > 100) {
      showToast('수수료율은 0~100% 사이여야 합니다.', 'warning'); return;
    }
    setIsEditing(false);
    showToast('설정이 저장되었습니다.', 'success');
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold mb-0">시스템 설정</h5>
        {canEdit && !isEditing && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>설정 수정</button>
        )}
      </div>

      <div className="row g-4">
        {/* Site Info */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">사이트 기본 정보</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">서비스 명</label>
                {isEditing ? (
                  <input className="form-control form-control-sm" value={settings.siteName}
                    onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))} />
                ) : <div className="small fw-medium">{settings.siteName}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">고객센터 이메일</label>
                {isEditing ? (
                  <input type="email" className="form-control form-control-sm" value={settings.supportEmail}
                    onChange={e => setSettings(p => ({ ...p, supportEmail: e.target.value }))} />
                ) : <div className="small">{settings.supportEmail}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">신규 회원가입</label>
                {isEditing ? (
                  <div className="form-check form-switch mt-1">
                    <input className="form-check-input" type="checkbox"
                      checked={settings.allowNewRegistrations}
                      onChange={e => setSettings(p => ({ ...p, allowNewRegistrations: e.target.checked }))} />
                    <label className="form-check-label small">
                      {settings.allowNewRegistrations ? '허용' : '차단'}
                    </label>
                  </div>
                ) : (
                  <span className={`badge bg-${settings.allowNewRegistrations ? 'success' : 'danger'}`}>
                    {settings.allowNewRegistrations ? '허용' : '차단'}
                  </span>
                )}
              </div>
              <div>
                <label className="form-label small fw-semibold">점검 모드</label>
                {isEditing ? (
                  <div className="form-check form-switch mt-1">
                    <input className="form-check-input" type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={e => setSettings(p => ({ ...p, maintenanceMode: e.target.checked }))} />
                    <label className="form-check-label small">
                      {settings.maintenanceMode ? '점검 중' : '정상 운영'}
                    </label>
                  </div>
                ) : (
                  <span className={`badge bg-${settings.maintenanceMode ? 'warning text-dark' : 'success'}`}>
                    {settings.maintenanceMode ? '점검 중' : '정상 운영'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Settings */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">거래 정책</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">수수료율 (%)</label>
                {isEditing ? (
                  <input type="number" className="form-control form-control-sm" value={settings.feeRate}
                    min={0} max={100} step={0.1}
                    onChange={e => setSettings(p => ({ ...p, feeRate: Number(e.target.value) }))} />
                ) : <div className="small fw-medium">{settings.feeRate}%</div>}
                <div className="form-text small">판매 금액에서 차감되는 서비스 수수료</div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">자동 구매확정 기간 (일)</label>
                {isEditing ? (
                  <input type="number" className="form-control form-control-sm" value={settings.autoConfirmDays}
                    min={1} max={30}
                    onChange={e => setSettings(p => ({ ...p, autoConfirmDays: Number(e.target.value) }))} />
                ) : <div className="small fw-medium">{settings.autoConfirmDays}일</div>}
                <div className="form-text small">배송 완료 후 자동 구매확정까지의 대기 기간</div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">CS SLA (시간)</label>
                {isEditing ? (
                  <input type="number" className="form-control form-control-sm" value={settings.slaHours}
                    min={1} max={168}
                    onChange={e => setSettings(p => ({ ...p, slaHours: Number(e.target.value) }))} />
                ) : <div className="small fw-medium">{settings.slaHours}시간</div>}
                <div className="form-text small">CS 문의 처리 목표 응답 시간</div>
              </div>
              <div>
                <label className="form-label small fw-semibold">최대 검수 대기 건수</label>
                {isEditing ? (
                  <input type="number" className="form-control form-control-sm" value={settings.maxPendingInspections}
                    min={1}
                    onChange={e => setSettings(p => ({ ...p, maxPendingInspections: Number(e.target.value) }))} />
                ) : <div className="small fw-medium">{settings.maxPendingInspections}건</div>}
                <div className="form-text small">이 수치를 초과하면 신규 입고 접수를 제한합니다</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && canEdit && (
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={handleSave}>저장</button>
          <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>취소</button>
        </div>
      )}
    </div>
  );
}
