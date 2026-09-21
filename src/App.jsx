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
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

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
          <img src="/logo.svg" alt="Orange Logo" className="logo-img" />
          <span className="brand-name">{SHOP.shortName || 'Orange'}</span>
          <span className="brand-tag">SERVICES</span>
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
  const waUrl = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent('Hi Orange Refrigeration, I need service/repair for my appliance.')}`

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
      <a href={waUrl} target="_blank" rel="noreferrer" className="navitem navitem-wa">
        <span className="ico">💬</span>
        <span>WhatsApp</span>
      </a>
      <NavLink to="/admin" className="navitem">
        <span className="ico">🔒</span>
        <span>{t('admin')}</span>
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
