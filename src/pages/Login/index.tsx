import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        navigate('/');
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: 400 }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div style={{ fontSize: 36 }}>🎵</div>
            <h4 className="fw-bold mt-2 mb-0">USED30</h4>
            <p className="text-muted small">Admin Console</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium">이메일</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@used30.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">비밀번호</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : null}
              로그인
            </button>
          </form>

          <hr className="my-4" />
          <div className="small text-muted">
            <p className="mb-1 fw-medium">테스트 계정 (비밀번호: password123)</p>
            <div className="d-flex flex-wrap gap-1">
              {[
                'super@used30.com',
                'inspector@used30.com',
                'settlement@used30.com',
                'analyst@used30.com',
              ].map(e => (
                <button
                  key={e}
                  type="button"
                  className="badge bg-secondary-subtle text-secondary border-0"
                  style={{ cursor: 'pointer', fontSize: 11 }}
                  onClick={() => { setEmail(e); setPassword('password123'); }}
                >
                  {e.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
