import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'
import { SHOP, APPLIANCE_KEYS, APPLIANCE_IMAGES } from '../config.js'
import {
  getBookings,
  subscribe,
  getOffers,
  subscribeOffers,
  DEFAULT_OFFERS,
  getReviews,
  addReview,
  getRatingStats,
  subscribeReviews,
} from '../store.js'

function AllCouponsModal({ vouchers, onClose, onSelect }) {
  const [copied, setCopied] = useState(null)

  const copyCode = (code, e) => {
    e.stopPropagation()
    try {
      navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  return (
    <div className="lang-modal-overlay" onClick={onClose}>
      <div className="lang-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="lang-modal-head">
          <h3>🎟️ All Available Coupons ({vouchers.length})</h3>
          <button type="button" className="lang-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '4px 0 12px' }}>
          Tap any coupon to automatically apply it to your service booking.
        </p>
        <div className="vouchers-list">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="voucher-ticket-card"
              onClick={() => onSelect(v)}
            >
              <div className="vtc-left">
                <span className="vtc-badge">{v.badge || 'COUPON'}</span>
                <div className="vtc-title">{v.title}</div>
                <div className="vtc-desc">{v.desc}</div>
                {v.couponCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <div className="vtc-code-pill">CODE: <strong>{v.couponCode}</strong></div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '10.5px' }}
                      onClick={(e) => copyCode(v.couponCode, e)}
                    >
                      {copied === v.couponCode ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                )}
              </div>
              <div className="vtc-right">
                <div className="vtc-discount">{v.discount || v.tag}</div>
                <button type="button" className="vtc-apply-btn">
                  {v.cta || 'Apply'} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedbackModal({ onClose, prefillAppliance, prefillName, bookingId }) {
  const { t } = useI18n()
  const [rating, setRating] = useState(5)
  const [name, setName] = useState(prefillName || '')
  const [appliance, setAppliance] = useState(prefillAppliance || 'ac')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ratingLabels = {
    1: `😠 ${t('poor')}`,
    2: `😐 ${t('fair')}`,
    3: `🙂 ${t('good')}`,
    4: `😊 ${t('veryGood')}`,
    5: `🤩 ${t('excellent')}`,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim() && !name.trim()) return
    addReview({
      name: name.trim() || 'Verified Customer',
      rating,
      appliance,
      comment: comment.trim(),
      bookingId,
    })
    if (bookingId) {
      try {
        localStorage.setItem('rated_' + bookingId, 'true')
      } catch {}
    }
    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 1800)
  }

  return (
    <div className="lang-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-head">
          <h3>⭐ {t('leaveFeedback')}</h3>
          <button type="button" className="lang-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {submitted ? (
          <div className="fbm-success-box">
            <div className="fbm-success-ico">🎉</div>
            <h4>{t('feedbackSuccess')}</h4>
            <p>{t('feedbackSuccessDesc')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fbm-form">
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 12px' }}>
              {t('rateServiceDesc')}
            </p>

            <div className="fbm-stars-wrap">
              <div className="fbm-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`fbm-star-btn ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    aria-label={`${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="fbm-rating-label">{ratingLabels[rating]}</div>
            </div>

            <label className="field" style={{ marginTop: '12px' }}>
              <span>{t('fullName')} *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                required
              />
            </label>

            <label className="field" style={{ marginTop: '10px' }}>
              <span>{t('applianceType')}</span>
              <select value={appliance} onChange={(e) => setAppliance(e.target.value)}>
                <option value="ac">❄️ {t('ac')}</option>
                <option value="refrigerator">🧊 {t('refrigerator')}</option>
                <option value="washingMachine">🧺 {t('washingMachine')}</option>
                <option value="general">🛠️ General Appliance Service</option>
              </select>
            </label>

            <label className="field" style={{ marginTop: '10px' }}>
              <span>{t('leaveFeedback')} *</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={t('feedbackPlaceholder')}
                required
              />
            </label>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '14px' }}>
              ⭐ {t('submitFeedback')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [adIndex, setAdIndex] = useState(0)
  const [voucherIndex, setVoucherIndex] = useState(0)
  const [showAllCoupons, setShowAllCoupons] = useState(false)
  const [acceptedBooking, setAcceptedBooking] = useState(null)
  const [completedBooking, setCompletedBooking] = useState(null)
  const [reviews, setReviews] = useState(() => getReviews())
  const [stats, setStats] = useState(() => getRatingStats())
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackBookingContext, setFeedbackBookingContext] = useState(null)
  const [offers, setOffers] = useState(() => getOffers())
  const timerRef = useRef(null)

  // Active banner / festival cards for top slider
  const activeBanners = offers.filter((o) => o.active && (o.type === 'banner' || o.type === 'festival' || !o.type))
  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_OFFERS

  // Active discount vouchers / coupons
  const activeVouchers = offers.filter((o) => o.active && (o.type === 'voucher' || o.couponCode))

  const checkAcceptedBooking = () => {
    try {
      const latestId = localStorage.getItem('latest_booking_id')
      if (latestId) {
        const b = getBookings().find((x) => x.id === latestId)
        if (b && b.status === 'confirmed') {
          setAcceptedBooking(b)
          setCompletedBooking(null)
        } else if (b && b.status === 'completed' && !localStorage.getItem('rated_' + latestId)) {
          setCompletedBooking(b)
          setAcceptedBooking(null)
        } else {
          setAcceptedBooking(null)
          setCompletedBooking(null)
        }
      }
    } catch {}
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setAdIndex((i) => (i + 1) % (displayBanners.length || 1))
    }, 4500)
  }

  useEffect(() => {
    resetTimer()
    checkAcceptedBooking()
    const unsubBookings = subscribe(checkAcceptedBooking)
    const unsubOffers = subscribeOffers(() => setOffers(getOffers()))
    const unsubReviews = subscribeReviews(() => {
      setReviews(getReviews())
      setStats(getRatingStats())
    })

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      unsubBookings()
      unsubOffers()
      unsubReviews()
    }
  }, [displayBanners.length])

  const handlePrevAd = () => {
    setAdIndex((i) => (i - 1 + displayBanners.length) % displayBanners.length)
    resetTimer()
  }

  const handleNextAd = () => {
    setAdIndex((i) => (i + 1) % displayBanners.length)
    resetTimer()
  }

  const handlePrevVoucher = () => {
    if (!activeVouchers.length) return
    setVoucherIndex((i) => (i - 1 + activeVouchers.length) % activeVouchers.length)
  }

  const handleNextVoucher = () => {
    if (!activeVouchers.length) return
    setVoucherIndex((i) => (i + 1) % activeVouchers.length)
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
                {t('bookingAcceptedDesc')} <strong>{t(acceptedBooking.appliance)}</strong> ({acceptedBooking.date} {acceptedBooking.time})
              </div>
            </div>
          </div>
          <button type="button" className="aac-close" onClick={() => setAcceptedBooking(null)} aria-label="Close notification">✕</button>
        </div>
      )}

      {completedBooking && (
        <div className="active-completed-rating-card">
          <div className="acrc-left">
            <span className="acrc-ico">🎉</span>
            <div>
              <div className="acrc-title">{t('serviceCompletedPrompt')}</div>
              <div className="acrc-desc">
                {t(completedBooking.appliance)} • {completedBooking.brand || 'Appliance'} ({completedBooking.date})
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm acrc-rate-btn"
            onClick={() => {
              setFeedbackBookingContext(completedBooking)
              setShowFeedbackModal(true)
            }}
          >
            {t('rateNow')}
          </button>
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
            {displayBanners.length > 1 && (
              <span className="banner-badge-indicator">
                {(adIndex % displayBanners.length) + 1}/{displayBanners.length}
              </span>
            )}
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
              {displayBanners.length > 1 && (
                <div className="promo-controls" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="promo-arrow" onClick={handlePrevAd} aria-label="Previous banner">‹</button>
                  <div className="promo-dots">
                    {displayBanners.map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        className={`promo-dot ${i === (adIndex % displayBanners.length) ? 'active' : ''}`}
                        onClick={() => {
                          setAdIndex(i)
                          resetTimer()
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button type="button" className="promo-arrow" onClick={handleNextAd} aria-label="Next banner">›</button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Active Discount Vouchers & Festival Coupons Section with Arrow Controls */}
      {activeVouchers.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🎟️ {t('specialOffers')} & Vouchers</h2>
            <div className="section-header-actions">
              {activeVouchers.length > 1 && (
                <div className="section-arrow-controls">
                  <button
                    type="button"
                    className="nav-arrow-btn"
                    onClick={handlePrevVoucher}
                    title="Previous coupon"
                    aria-label="Previous coupon"
                  >
                    ←
                  </button>
                  <span className="coupons-counter-pill">
                    {(voucherIndex % activeVouchers.length) + 1} / {activeVouchers.length}
                  </span>
                  <button
                    type="button"
                    className="nav-arrow-btn"
                    onClick={handleNextVoucher}
                    title="Next coupon"
                    aria-label="Next coupon"
                  >
                    →
                  </button>
                </div>
              )}
              <button
                type="button"
                className="see-all-coupons-btn"
                onClick={() => setShowAllCoupons(true)}
                title="See all coupons"
              >
                <span>{t('seeAll') || 'See All'}</span>
                <span className="arrow-sym">→</span>
              </button>
            </div>
          </div>

          <div className="vouchers-carousel-wrap">
            {(() => {
              const v = activeVouchers[voucherIndex % activeVouchers.length]
              if (!v) return null
              return (
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
                      {v.cta || 'Apply & Book'} →
                    </button>
                  </div>
                </div>
              )
            })()}

            {activeVouchers.length > 1 && (
              <div className="promo-dots" style={{ justifyContent: 'center', marginTop: '10px' }}>
                {activeVouchers.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`promo-dot ${i === (voucherIndex % activeVouchers.length) ? 'active' : ''}`}
                    onClick={() => setVoucherIndex(i)}
                    aria-label={`Go to coupon ${i + 1}`}
                  />
                ))}
              </div>
            )}
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

      {/* Customer Reviews & Ratings */}
      <section className="section reviews-section">
        <div className="section-head-row">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>⭐ {t('customerReviews')}</h2>
            <div className="section-sub-rating">
              <span className="ssr-star">★</span> <strong>{stats.average.toFixed(1)}</strong> / 5.0 • {stats.count} {t('verifiedReviews')}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm btn-rate-cta"
            onClick={() => {
              setFeedbackBookingContext(null)
              setShowFeedbackModal(true)
            }}
          >
            ✍️ {t('writeReview')}
          </button>
        </div>

        {/* Rating summary bar */}
        <div className="reviews-summary-card">
          <div className="rsc-left">
            <div className="rsc-score">{stats.average.toFixed(1)}</div>
            <div className="rsc-stars">{'★'.repeat(Math.round(stats.average))}</div>
            <div className="rsc-count">{stats.count} {t('verifiedCustomer')}s</div>
          </div>
          <div className="rsc-bars">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.breakdown[s] || 0
              const pct = stats.count ? Math.round((count / stats.count) * 100) : 0
              return (
                <div key={s} className="rsc-bar-row">
                  <span className="rsc-bar-star">{s}★</span>
                  <div className="rsc-bar-track">
                    <div className="rsc-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="rsc-bar-pct">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="reviews-scroll-container">
          {reviews.map((rev) => (
            <div key={rev.id} className="home-review-card">
              <div className="hrc-head">
                <div className="hrc-user">
                  <div className="hrc-avatar">{rev.name ? rev.name.charAt(0).toUpperCase() : 'C'}</div>
                  <div>
                    <div className="hrc-name">{rev.name}</div>
                    <div className="hrc-verified">✓ {t('verifiedCustomer')}</div>
                  </div>
                </div>
                <span className="hrc-appliance-badge">
                  {rev.appliance === 'ac' ? '❄️ AC' : rev.appliance === 'refrigerator' ? '🧊 Fridge' : rev.appliance === 'washingMachine' ? '🧺 Washer' : '🛠️'}
                </span>
              </div>
              <div className="hrc-stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
              <p className="hrc-comment">"{rev.comment}"</p>
              <div className="hrc-date">{rev.date}</div>
            </div>
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

      {showAllCoupons && (
        <AllCouponsModal
          vouchers={activeVouchers}
          onClose={() => setShowAllCoupons(false)}
          onSelect={(v) => navigate('/book', {
            state: {
              appliance: v.appliance && v.appliance !== 'all' ? v.appliance : undefined,
              appliedVoucher: v,
            },
          })}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => {
            setShowFeedbackModal(false)
            setFeedbackBookingContext(null)
          }}
          prefillAppliance={feedbackBookingContext?.appliance}
          prefillName={feedbackBookingContext?.name}
          bookingId={feedbackBookingContext?.id}
        />
      )}
    </div>
  )
}
