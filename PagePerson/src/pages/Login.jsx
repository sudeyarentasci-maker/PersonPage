import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

// İkonlar için basit SVG bileşenleri
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

function Login() {
  const [focusedInput, setFocusedInput] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setErrorMessage("");

    // Input validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Lütfen tüm alanları doldurunuz.");
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    // ÖNCE BACKEND'İ KONTROL ET - Loading gösterme!
    try {
      const result = await login(email, password);

      if (result && result.success) {
        // SADECE BAŞARILI OLUNCA Loading göster
        setIsLoading(true);

        // Başarılı giriş - kullanıcının rolüne göre yönlendir
        const dashboardPath = getDashboardPath();
        navigate(dashboardPath);
      } else {
        // HATA - Loading gösterme, sadece hata mesajı
        setErrorMessage(result?.error || "Giriş başarısız");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="ambient-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-card fade-in">
        <div className="card-header">
          <div className="logo-area">
            <h1 className="logo">PersonPage</h1>
          </div>
          <p className="subtitle">İnsan Kaynakları Yönetim Platformu</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className={`field ${focusedInput === 'email' ? 'active' : ''}`}>
            <label>E-posta Adresi</label>
            <div className="input-group">
              <span className="input-icon"><MailIcon /></span>
              <input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={`field ${focusedInput === 'password' ? 'active' : ''}`}>
            <div className="label-row">
              <label>Şifre</label>
            </div>
            <div className="input-group">
              <span className="input-icon"><LockIcon /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                disabled={isLoading}
              />
            </div>
            <div className="forgot-password-container">
              <a href="#" className="forgot-password">Şifremi unuttum?</a>
            </div>
          </div>

          <div className="form-actions">
            <label className="checkbox-frame">
              <input type="checkbox" />
              <div className="box"></div>
              <span>Beni hatırla</span>
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="footer-area">
          <p>© 2025 PersonPage Inc.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;