import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from './i18n.jsx'
import { SHOP } from './config.js'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'

function TopBar() {
  const { t, lang, toggleLang } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

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
        <button className="lang-btn" onClick={toggleLang} aria-label="Change language">
          {lang === 'en' ? 'తెలుగు' : 'ENG'}
        </button>
      </header>
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
