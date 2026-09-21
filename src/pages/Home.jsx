import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'
import { SHOP, APPLIANCE_KEYS, APPLIANCE_IMAGES } from '../config.js'
import { getBookings, subscribe, getOffers, subscribeOffers, DEFAULT_OFFERS } from '../store.js'

const APPLIANCE_ICONS = {
  ac: '❄️',
  refrigerator: '🧊',
  washingMachine: '🌀',
}

const BRANDS_LIST = [
  { name: 'Samsung', logo: '🌐' },
  { name: 'LG', logo: '✨' },
  { name: 'Whirlpool', logo: '🌀' },
  { name: 'Voltas', logo: '❄️' },
  { name: 'Blue Star', logo: '⭐' },
  { name: 'Daikin', logo: '💨' },
  { name: 'Godrej', logo: '🟢' },
  { name: 'Haier', logo: '🔴' },
  { name: 'Panasonic', logo: '⚡' },
  { name: 'Lloyd', logo: '💎' },
]

export default function Home() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [adIndex, setAdIndex] = useState(0)
  const [acceptedBooking, setAcceptedBooking] = useState(null)
  const [offers, setOffers] = useState(() => getOffers())

  // Active banner / festival cards for top slider
  const activeBanners = offers.filter((o) => o.active && (o.type === 'banner' || o.type === 'festival' || !o.type))
  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_OFFERS

  // Active discount vouchers / coupons
  const activeVouchers = offers.filter((o) => o.active && (o.type === 'voucher' || o.couponCode))

  const checkAcceptedBooking = () => {
    const latestId = localStorage.getItem('latest_booking_id')
    if (latestId) {
      const b = getBookings().find((x) => x.id === latestId)
      if (b && b.status === 'confirmed') {
        setAcceptedBooking(b)
      } else {
        setAcceptedBooking(null)
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((i) => (i + 1) % (displayBanners.length || 1))
    }, 4200)

    checkAcceptedBooking()
    const unsubBookings = subscribe(checkAcceptedBooking)
    const unsubOffers = subscribeOffers(() => setOffers(getOffers()))

    return () => {
      clearInterval(timer)
      unsubBookings()
      unsubOffers()
    }
  }, [displayBanners.length])

  const handlePrevAd = () => {
    setAdIndex((i) => (i - 1 + displayBanners.length) % displayBanners.length)
  }

  const handleNextAd = () => {
    setAdIndex((i) => (i + 1) % displayBanners.length)
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapsQuery)}`
  const ad = displayBanners[adIndex % displayBanners.length] || displayBanners[0]

  return (
    <div className="page">
      {acceptedBooking && (
        <div className="active-accepted-card">
          <div className="aac-left">
            <span className="aac-ico">🟢</span>
            <div>
              <div className="aac-title">{t('bookingAcceptedTitle')}</div>
              <div className="aac-desc">
                Your booking for <strong>{t(acceptedBooking.appliance)}</strong> on {acceptedBooking.date} ({acceptedBooking.time}) has been confirmed!
              </div>
            </div>
          </div>
          <button type="button" className="aac-close" onClick={() => setAcceptedBooking(null)}>✕</button>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-logo">
          <img src="/logo.png" alt="Orange Logo" className="hero-logo-img" />
        </div>
        <h1 className="hero-title">{SHOP.name}</h1>
        <p className="hero-prop">{t('proprietor')}: {SHOP.proprietor}</p>
        <p className="hero-tag">{t('tagline')}</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>
          {t('bookAService')}
        </button>
      </section>

      {/* Promotional Ads Slider Banner */}
      {ad && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔥 {t('specialOffers')}</h2>
            <span className="banner-badge-indicator">
              {(adIndex % displayBanners.length) + 1}/{displayBanners.length}
            </span>
          </div>
          <div
            className="promo-card"
            onClick={() => navigate('/book', {
              state: {
                appliance: ad.appliance && ad.appliance !== 'all' ? ad.appliance : undefined,
                appliedVoucher: ad.couponCode ? ad : undefined,
              },
            })}
            style={{
              background: ad.image
                ? `${ad.gradient || 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.82) 100%)'}, url('${ad.image}') center/cover no-repeat`
                : ad.gradient || 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
              borderColor: ad.border || 'rgba(242, 101, 34, 0.6)',
              cursor: 'pointer',
            }}
          >
            <div className="promo-top">
              <span className="promo-badge">{ad.badge}</span>
              <span className="promo-tag-pill">{ad.tag}</span>
            </div>
            <h3 className="promo-title">{ad.title}</h3>
            <p className="promo-desc">{ad.desc}</p>
            <div className="promo-bottom">
              {ad.couponCode && (
                <div className="promo-coupon-badge">
                  Use Code: <strong>{ad.couponCode}</strong>
                </div>
              )}
              <div className="promo-controls" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="promo-arrow" onClick={handlePrevAd} aria-label="Previous banner">‹</button>
                <div className="promo-dots">
                  {displayBanners.map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`promo-dot ${i === (adIndex % displayBanners.length) ? 'active' : ''}`}
                      onClick={() => setAdIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button type="button" className="promo-arrow" onClick={handleNextAd} aria-label="Next banner">›</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Discount Vouchers & Festival Coupons Section */}
      {activeVouchers.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🎟️ Discount Coupons & Vouchers</h2>
            <span className="banner-badge-indicator">{activeVouchers.length} Deals</span>
          </div>
          <div className="vouchers-list">
            {activeVouchers.map((v) => (
              <div
                key={v.id}
                className="voucher-ticket-card"
                onClick={() => navigate('/book', {
                  state: {
                    appliance: v.appliance && v.appliance !== 'all' ? v.appliance : undefined,
                    appliedVoucher: v,
                  },
                })}
              >
                <div className="vtc-left">
                  <span className="vtc-badge">{v.badge || 'COUPON'}</span>
                  <div className="vtc-title">{v.title}</div>
                  <div className="vtc-desc">{v.desc}</div>
                  {v.couponCode && (
                    <div className="vtc-code-pill">
                      CODE: <strong>{v.couponCode}</strong>
                    </div>
                  )}
                </div>
                <div className="vtc-right">
                  <div className="vtc-discount">{v.discount || v.tag}</div>
                  <button
                    type="button"
                    className="vtc-apply-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/book', {
                        state: {
                          appliance: v.appliance && v.appliance !== 'all' ? v.appliance : undefined,
                          appliedVoucher: v,
                        },
                      })
                    }}
                  >
                    Apply & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Grid */}
      <section className="section">
        <h2 className="section-title">{t('ourServices')}</h2>
        <div className="service-grid">
          {APPLIANCE_KEYS.map((k) => (
            <button key={k} className="service-card" onClick={() => navigate('/book', { state: { appliance: k } })}>
              <div className="service-img-wrap">
                <img src={APPLIANCE_IMAGES[k]} alt={t(k)} className="service-img" loading="lazy" />
              </div>
              <span className="service-name">{t(k)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banners */}
      <section className="section">
        <div className="trust-grid">
          <div className="trust-card">
            <span className="trust-ico">🛡️</span>
            <div>
              <div className="trust-title">{t('trustWarrantyTitle')}</div>
              <div className="trust-desc">{t('trustWarrantyDesc')}</div>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-ico">⚡</span>
            <div>
              <div className="trust-title">{t('trustExpressTitle')}</div>
              <div className="trust-desc">{t('trustExpressDesc')}</div>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-ico">👨‍🔧</span>
            <div>
              <div className="trust-title">{t('trustExpertTitle')}</div>
              <div className="trust-desc">{t('trustExpertDesc')}</div>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-ico">💰</span>
            <div>
              <div className="trust-title">{t('trustPriceTitle')}</div>
              <div className="trust-desc">{t('trustPriceDesc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <h2 className="section-title">{t('contact')}</h2>
        <div className="contact-compact-card">
          <div className="contact-address-box">
            <span className="contact-ico">📍</span>
            <span className="contact-address-text">{SHOP.address}</span>
          </div>

          <div className="contact-details-list">
            <div className="contact-item-row">
              <span className="contact-item-label">📞 {t('phoneNumber')}:</span>
              <span className="contact-item-val">
                <a href={`tel:${SHOP.phones[0]}`}>{SHOP.phones[0]}</a>, <a href={`tel:${SHOP.phones[1]}`}>{SHOP.phones[1]}</a>
              </span>
            </div>
            <div className="contact-item-row">
              <span className="contact-item-label">💬 WhatsApp:</span>
              <a
                className="contact-item-val wa-link"
                href={`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent('Hi Orange Refrigeration, I need service/repair for my appliance.')}`}
                target="_blank"
                rel="noreferrer"
              >
                +{SHOP.whatsapp.slice(0, 2)} {SHOP.whatsapp.slice(2)}
              </a>
            </div>
          </div>

          <a
            className="btn btn-whatsapp btn-block"
            style={{ marginTop: '14px' }}
            href={`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent('Hi Orange Refrigeration, I need service/repair for my appliance.')}`}
            target="_blank"
            rel="noreferrer"
          >
            <span style={{ fontSize: '18px' }}>💬</span> {t('chatOnWhatsApp')} ({SHOP.phones[0]})
          </a>

          <div className="btn-row" style={{ marginTop: '8px' }}>
            <a className="btn btn-primary" href={`tel:${SHOP.phones[0]}`}>📞 {t('callNow')}</a>
            <a className="btn btn-outline" href={mapsUrl} target="_blank" rel="noreferrer">🧭 {t('directions')}</a>
          </div>
        </div>
      </section>
    </div>
  )
}
