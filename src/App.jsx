import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from './i18n.jsx'
import { SHOP } from './config.js'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'

function TopBar() {
  const { t, lang, changeLang, languages } = useI18n()
  const [showLangModal, setShowLangModal] = useState(false)
  const [showPortalModal, setShowPortalModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname.startsWith('/admin')

  const currentLang = languages.find((l) => l.code === lang) || languages[0]

  return (
    <>
      <header className="topbar">
        <div className="brand">
          {!isHome && (
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate(-1)}
              aria-label={t('back')}
            >
              ←
            </button>
          )}
          <img src="/logo.png" alt="Orange Logo" className="logo-img" />
          <span className="brand-name">{SHOP.shortName || 'Orange'}</span>
          <button
            type="button"
            className={`brand-tag ${isAdmin ? 'brand-tag-admin' : 'brand-tag-user'}`}
            onClick={() => setShowPortalModal(true)}
            title={t('selectPortal')}
            aria-label={t('selectPortal')}
          >
            <span>{isAdmin ? 'ADMIN' : 'USER'}</span>
            <span className="brand-tag-arrow">▾</span>
          </button>
        </div>
        <button
          type="button"
          className="lang-btn"
          onClick={() => setShowLangModal(true)}
          aria-label={t('chooseLanguage')}
        >
          🌐 {currentLang.short} ▾
        </button>
      </header>

      {/* Portal / Mode Selection Popup Modal */}
      {showPortalModal && (
        <div className="lang-modal-overlay" onClick={() => setShowPortalModal(false)}>
          <div className="role-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lang-modal-head">
              <h3>👥 {t('selectPortal')}</h3>
              <button
                type="button"
                className="lang-modal-close"
                onClick={() => setShowPortalModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="role-options-list">
              <button
                type="button"
                className={`role-option-card ${!isAdmin ? 'active' : ''}`}
                onClick={() => {
                  navigate('/')
                  setShowPortalModal(false)
                }}
              >
                <div className="role-opt-ico role-ico-user">👤</div>
                <div className="role-opt-info">
                  <div className="role-opt-title-row">
                    <span className="role-opt-title">{t('userPage')}</span>
                    {!isAdmin && <span className="role-active-badge">Active</span>}
                  </div>
                  <span className="role-opt-desc">{t('userDesc')}</span>
                </div>
                {!isAdmin ? <span className="role-opt-check">✓</span> : <span className="role-opt-arrow">→</span>}
              </button>

              <button
                type="button"
                className={`role-option-card ${isAdmin ? 'active' : ''}`}
                onClick={() => {
                  navigate('/admin')
                  setShowPortalModal(false)
                }}
              >
                <div className="role-opt-ico role-ico-admin">🔒</div>
                <div className="role-opt-info">
                  <div className="role-opt-title-row">
                    <span className="role-opt-title">{t('adminPage')}</span>
                    {isAdmin && <span className="role-active-badge">Active</span>}
                  </div>
                  <span className="role-opt-desc">{t('adminDesc')}</span>
                </div>
                {isAdmin ? <span className="role-opt-check">✓</span> : <span className="role-opt-arrow">→</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLangModal && (
        <div className="lang-modal-overlay" onClick={() => setShowLangModal(false)}>
          <div className="lang-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lang-modal-head">
              <h3>🌐 {t('chooseLanguage')}</h3>
              <button
                type="button"
                className="lang-modal-close"
                onClick={() => setShowLangModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="lang-grid">
              {languages.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  className={`lang-option-btn ${lang === l.code ? 'active' : ''}`}
                  onClick={() => {
                    changeLang(l.code)
                    setShowLangModal(false)
                  }}
                >
                  <div className="lang-opt-text">
                    <span className="lang-opt-native">{l.nativeName}</span>
                    <span className="lang-opt-sub">{l.label}</span>
                  </div>
                  {lang === l.code && <span className="lang-opt-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="ticker-banner">
        <div className="ticker-track">
          <span>{t('topTickerBanner')}</span>
          <span>⚡ {t('trustExpressTitle')} • {t('trustWarrantyTitle')}</span>
          <span>📞 {t('callNow')}: {SHOP.phones[0]}</span>
        </div>
      </div>
    </>
  )
}

function BottomNav() {
  const { t } = useI18n()

  return (
    <nav className="bottomnav">
      <NavLink to="/" end className="navitem">
        <span className="ico">🏠</span>
        <span>{t('home')}</span>
      </NavLink>
      <NavLink to="/book" className="navitem navitem-primary">
        <span className="ico">🛠️</span>
        <span>{t('bookNow')}</span>
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
