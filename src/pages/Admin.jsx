import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'
import { SHOP, ADMIN_PASSWORD } from '../config.js'
import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
  subscribe,
  getOffers,
  addOffer,
  deleteOffer,
  toggleOfferActive,
  resetOffersToDefault,
  subscribeOffers,
} from '../store.js'

function useBookings() {
  const [list, setList] = useState(getBookings())
  useEffect(() => subscribe(() => setList(getBookings())), [])
  return list
}

function useOffers() {
  const [list, setList] = useState(getOffers())
  useEffect(() => subscribeOffers(() => setList(getOffers())), [])
  return list
}

const THEME_PRESETS = [
  { id: 'ac', label: '❄️ AC Service', image: '/promo-ac.png', gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)', border: 'rgba(242, 101, 34, 0.6)' },
  { id: 'fridge', label: '🧊 Refrigerator', image: '/promo-fridge.jpg', gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)', border: 'rgba(242, 101, 34, 0.6)' },
  { id: 'combo', label: '🛠️ Combo Pack', image: '/promo-combo.png', gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)', border: 'rgba(242, 101, 34, 0.6)' },
  { id: 'express', label: '⚡ Express Van', image: '/hero-bg.png', gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)', border: 'rgba(242, 101, 34, 0.6)' },
  { id: 'festive_gold', label: '🎉 Festive Gold', image: '', gradient: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', border: '#f59e0b' },
  { id: 'festive_red', label: '🪔 Festive Red', image: '', gradient: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)', border: '#ef4444' },
  { id: 'voucher_purple', label: '🎟️ Royal Voucher', image: '', gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', border: '#a78bfa' },
  { id: 'arctic_blue', label: '❄️ Arctic Chill', image: '', gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: '#38bdf8' },
]

function LoginView({ onLogin }) {
  const { t } = useI18n()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (pw.trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', '1')
      onLogin()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="page center-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-ico">🔒</div>
        <h2>{t('adminLogin')}</h2>
        <label className="field">
          <span>{t('password')}</span>
          <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }} autoFocus />
        </label>
        {err && <em className="err">{t('wrongPassword')}</em>}
        <button type="submit" className="btn btn-primary btn-block">{t('login')}</button>
      </form>
    </div>
  )
}

function StatusBadge({ status }) {
  const { t } = useI18n()
  return <span className={`badge badge-${status}`}>{t(status)}</span>
}

function CreateOfferModal({ onClose }) {
  const [form, setForm] = useState({
    type: 'festival',
    title: '',
    desc: '',
    badge: '🎉 FESTIVAL SPECIAL',
    tag: 'FLAT ₹200 OFF',
    appliance: 'all',
    couponCode: '',
    discount: '',
    validTill: '',
    cta: 'Book Offer Now',
  })
  const [selectedTheme, setSelectedTheme] = useState('festive_gold')
  const [customImage, setCustomImage] = useState('')
  const [err, setErr] = useState('')

  const handleTypeChange = (newType) => {
    let defaultBadge = '🎉 FESTIVAL SPECIAL'
    let defaultTag = 'FLAT ₹200 OFF'
    let defaultCta = 'Book Offer Now'
    let defaultTheme = 'festive_gold'

    if (newType === 'banner') {
      defaultBadge = '⚡ EXPERT SERVICE'
      defaultTag = 'DOORSTEP SERVICE'
      defaultCta = 'Book Service'
      defaultTheme = 'ac'
    } else if (newType === 'voucher') {
      defaultBadge = '🎟️ DISCOUNT VOUCHER'
      defaultTag = 'SPECIAL COUPON'
      defaultCta = 'Apply & Book'
      defaultTheme = 'voucher_purple'
    }

    setForm((f) => ({
      ...f,
      type: newType,
      badge: defaultBadge,
      tag: defaultTag,
      cta: defaultCta,
    }))
    setSelectedTheme(defaultTheme)
  }

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 8MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 800
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setCustomImage(compressed)
        setSelectedTheme('custom')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setErr('Please enter an offer title.')
      return
    }
    if (!form.desc.trim()) {
      setErr('Please enter an offer description.')
      return
    }

    let chosenTheme = THEME_PRESETS.find((p) => p.id === selectedTheme) || THEME_PRESETS[0]
    let finalImage = chosenTheme.image
    let finalGradient = chosenTheme.gradient
    let finalBorder = chosenTheme.border

    if (selectedTheme === 'custom' && customImage) {
      finalImage = customImage
      finalGradient = 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.85) 100%)'
      finalBorder = 'rgba(242, 101, 34, 0.8)'
    }

    addOffer({
      type: form.type,
      title: form.title.trim(),
      desc: form.desc.trim(),
      badge: form.badge.trim() || 'SPECIAL OFFER',
      tag: form.tag.trim() || 'LIMITED TIME',
      appliance: form.appliance,
      couponCode: form.couponCode.trim().toUpperCase(),
      discount: form.discount.trim(),
      validTill: form.validTill.trim(),
      cta: form.cta.trim() || 'Book Now',
      image: finalImage,
      gradient: finalGradient,
      border: finalBorder,
    })

    onClose()
  }

  return (
    <div className="lang-modal-overlay" onClick={onClose}>
      <div className="offer-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-head">
          <h3>📢 Post New Offer or Voucher</h3>
          <button type="button" className="lang-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: '10px' }}>
          {err && <div className="offer-form-err">{err}</div>}

          {/* Type Selector */}
          <div className="field">
            <span>Offer Category:</span>
            <div className="offer-type-chips">
              <button
                type="button"
                className={`offer-type-chip ${form.type === 'festival' ? 'active' : ''}`}
                onClick={() => handleTypeChange('festival')}
              >
                🎉 Festival Offer
              </button>
              <button
                type="button"
                className={`offer-type-chip ${form.type === 'voucher' ? 'active' : ''}`}
                onClick={() => handleTypeChange('voucher')}
              >
                🎟️ Discount Voucher
              </button>
              <button
                type="button"
                className={`offer-type-chip ${form.type === 'banner' ? 'active' : ''}`}
                onClick={() => handleTypeChange('banner')}
              >
                📢 Slider Banner
              </button>
            </div>
          </div>

          {/* Title */}
          <label className="field">
            <span>Offer Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErr('') }}
              placeholder="e.g. Ugadi Festival AC Special Offer"
              required
            />
          </label>

          {/* Description */}
          <label className="field">
            <span>Description / Details *</span>
            <textarea
              rows={2}
              value={form.desc}
              onChange={(e) => { setForm({ ...form, desc: e.target.value }); setErr('') }}
              placeholder="e.g. Complete gas checkup, indoor jet cleaning and tuneup"
              required
            />
          </label>

          {/* Badge & Tag row */}
          <div className="form-two-col">
            <label className="field">
              <span>Top Badge</span>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. 🎉 FESTIVAL OFFER"
              />
            </label>
            <label className="field">
              <span>Pill Tag</span>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="e.g. FLAT ₹200 OFF"
              />
            </label>
          </div>

          {/* Coupon Code & Discount (if voucher or festival) */}
          <div className="form-two-col">
            <label className="field">
              <span>Coupon Code (Optional)</span>
              <input
                type="text"
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                placeholder="e.g. FESTIVAL200"
              />
            </label>
            <label className="field">
              <span>Discount (Optional)</span>
              <input
                type="text"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="e.g. ₹200 OFF or 20%"
              />
            </label>
          </div>

          {/* Appliance target */}
          <div className="form-two-col">
            <label className="field">
              <span>Applicable Appliance</span>
              <select value={form.appliance} onChange={(e) => setForm({ ...form, appliance: e.target.value })}>
                <option value="all">All Appliances</option>
                <option value="ac">Air Conditioner (AC)</option>
                <option value="refrigerator">Refrigerator (Fridge)</option>
                <option value="washingMachine">Washing Machine</option>
              </select>
            </label>
            <label className="field">
              <span>Button Text</span>
              <input
                type="text"
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                placeholder="e.g. Book Offer"
              />
            </label>
          </div>

          {/* Theme Preset Selector */}
          <div className="field">
            <span>Visual Theme / Background:</span>
            <div className="theme-preset-grid">
              {THEME_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`theme-preset-btn ${selectedTheme === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(p.id)}
                >
                  {p.label}
                </button>
              ))}
              <label className={`theme-preset-btn theme-upload-btn ${selectedTheme === 'custom' ? 'active' : ''}`}>
                📷 {customImage ? 'Photo Attached ✓' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Offer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OffersManager() {
  const offers = useOffers()
  const [showCreate, setShowCreate] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const filtered = filterType === 'all' ? offers : offers.filter((o) => o.type === filterType)

  return (
    <div className="offers-manager">
      <div className="offers-header-row">
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>📢 Ads, Vouchers & Festival Cards</h2>
          <p className="offers-subtitle">Published cards appear live on the homepage carousel & vouchers section.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          ➕ Post New Offer
        </button>
      </div>

      <div className="offers-filter-tabs">
        <button
          type="button"
          className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({offers.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterType === 'festival' ? 'active' : ''}`}
          onClick={() => setFilterType('festival')}
        >
          🎉 Festival Offers ({offers.filter((o) => o.type === 'festival').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterType === 'voucher' ? 'active' : ''}`}
          onClick={() => setFilterType('voucher')}
        >
          🎟️ Vouchers ({offers.filter((o) => o.type === 'voucher').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterType === 'banner' ? 'active' : ''}`}
          onClick={() => setFilterType('banner')}
        >
          📢 Slider Banners ({offers.filter((o) => o.type === 'banner').length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-offers-box">
          <p>No offers found in this category.</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCreate(true)}>
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="admin-offers-list">
          {filtered.map((item) => (
            <div key={item.id} className={`admin-offer-card ${!item.active ? 'paused' : ''}`}>
              {/* Visual mini card preview */}
              <div
                className="aoc-preview"
                style={{
                  background: item.image
                    ? `${item.gradient || 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.8) 100%)'}, url('${item.image}') center/cover no-repeat`
                    : item.gradient || 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                }}
              >
                <div className="aoc-preview-top">
                  <span className="aoc-badge">{item.badge}</span>
                  <span className="aoc-tag">{item.tag}</span>
                </div>
                <div className="aoc-preview-title">{item.title}</div>
                {item.couponCode && (
                  <div className="aoc-coupon-chip">CODE: <strong>{item.couponCode}</strong></div>
                )}
              </div>

              {/* Offer Details & Actions */}
              <div className="aoc-details">
                <div className="aoc-info">
                  <div className="aoc-type-row">
                    <span className={`aoc-type-pill pill-${item.type}`}>
                      {item.type === 'festival' ? '🎉 Festival Deal' : item.type === 'voucher' ? '🎟️ Discount Voucher' : '📢 Ad Banner'}
                    </span>
                    <span className="aoc-appliance-tag">Appliance: {item.appliance?.toUpperCase()}</span>
                  </div>
                  <p className="aoc-desc">{item.desc}</p>
                </div>

                <div className="aoc-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${item.active ? 'btn-status-active' : 'btn-status-paused'}`}
                    onClick={() => toggleOfferActive(item.id)}
                    title="Click to toggle visibility"
                  >
                    {item.active ? '🟢 Active' : '⏸️ Paused'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (window.confirm(`Delete "${item.title}"?`)) {
                        deleteOffer(item.id)
                      }
                    }}
                    title="Delete offer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            if (window.confirm('Reset all offers and vouchers back to default factory settings?')) {
              resetOffersToDefault()
            }
          }}
        >
          🔄 Restore Default Offers
        </button>
      </div>

      {showCreate && <CreateOfferModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

// Pleasant Web Audio notification chime (E-Major arpeggio)
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    const now = ctx.currentTime
    const notes = [
      { freq: 659.25, time: 0.00, dur: 0.35, gain: 0.35 },
      { freq: 830.61, time: 0.14, dur: 0.35, gain: 0.35 },
      { freq: 987.77, time: 0.28, dur: 0.70, gain: 0.45 },
    ]

    notes.forEach(({ freq, time, dur, gain }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + time)

      gainNode.gain.setValueAtTime(0.0001, now + time)
      gainNode.gain.exponentialRampToValueAtTime(gain, now + time + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now + time)
      osc.stop(now + time + dur)
    })
  } catch (err) {
    console.warn('Audio playback error:', err)
  }
}

function Dashboard({ onLogout }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const bookings = useBookings()
  const offers = useOffers()
  const [activeTab, setActiveTab] = useState('bookings')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('admin_sound_enabled') !== 'false'
    } catch {
      return true
    }
  })
  const [newBookingAlert, setNewBookingAlert] = useState(null)
  const lastBookingIdsRef = useRef(null)

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    try {
      localStorage.setItem('admin_sound_enabled', String(next))
    } catch {}
    if (next) {
      playNotificationSound()
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }

  // Detect newly received bookings and trigger notification sound
  useEffect(() => {
    if (lastBookingIdsRef.current === null) {
      // First render: record existing booking IDs without alarming
      lastBookingIdsRef.current = new Set(bookings.map((b) => b.id))
      return
    }

    // Find any new booking that wasn't previously known
    const newItems = bookings.filter((b) => !lastBookingIdsRef.current.has(b.id))
    if (newItems.length > 0) {
      const latest = newItems[0]
      if (soundEnabled) {
        playNotificationSound()
      }
      setNewBookingAlert(latest)

      // Native browser notification if available
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🔔 New Service Booking Received!', {
            body: `${latest.name} (${latest.phone}) booked ${t(latest.appliance)} for ${latest.date} at ${latest.time}`,
            icon: '/logo.png',
          })
        } catch {}
      }
    }

    lastBookingIdsRef.current = new Set(bookings.map((b) => b.id))
  }, [bookings, soundEnabled, t])

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }

  const filtered = bookings.filter((b) => {
    const matchesStatus = filter === 'all' || b.status === filter
    if (!matchesStatus) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.address && b.address.toLowerCase().includes(q)) ||
      (b.brand && b.brand.toLowerCase().includes(q)) ||
      (b.appliance && b.appliance.toLowerCase().includes(q))
    )
  })

  const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString() : '')

  return (
    <div className="page">
      <div className="admin-head">
        <h1 className="page-title">{t('admin')}</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${soundEnabled ? 'btn-sound-on' : 'btn-sound-off'}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Notification chime is ON. Click to mute.' : 'Notification chime is MUTED. Click to enable.'}
          >
            {soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF'}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/')}>🏠 User View</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onLogout}>{t('logout')}</button>
        </div>
      </div>

      {/* New Booking Alert Banner */}
      {newBookingAlert && (
        <div className="admin-alert-banner">
          <div className="aab-left">
            <span className="aab-ico">🔔</span>
            <div>
              <div className="aab-title">New Booking Received! — {newBookingAlert.name}</div>
              <div className="aab-desc">
                {t(newBookingAlert.appliance)} • {newBookingAlert.date} ({newBookingAlert.time}) • 📞 {newBookingAlert.phone}
              </div>
            </div>
          </div>
          <div className="aab-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch(newBookingAlert.id)
                setActiveTab('bookings')
                setNewBookingAlert(null)
              }}
            >
              View
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#92400e' }}
              onClick={() => setNewBookingAlert(null)}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Statistics Bar - Clickable to Filter */}
      <div className="admin-stats-grid">
        <button
          type="button"
          className={`admin-stat-card ${filter === 'all' ? 'active-filter' : ''}`}
          onClick={() => setFilter('all')}
          title="Show all bookings"
        >
          <div className="asc-num">{stats.total}</div>
          <div className="asc-label">{t('all') || 'Total'}</div>
        </button>
        <button
          type="button"
          className={`admin-stat-card stat-pending ${filter === 'pending' ? 'active-filter' : ''}`}
          onClick={() => setFilter('pending')}
          title="Filter pending bookings"
        >
          <div className="asc-num">{stats.pending}</div>
          <div className="asc-label">{t('pending')}</div>
        </button>
        <button
          type="button"
          className={`admin-stat-card stat-confirmed ${filter === 'confirmed' ? 'active-filter' : ''}`}
          onClick={() => setFilter('confirmed')}
          title="Filter confirmed bookings"
        >
          <div className="asc-num">{stats.confirmed}</div>
          <div className="asc-label">{t('confirmed')}</div>
        </button>
        <button
          type="button"
          className={`admin-stat-card stat-completed ${filter === 'completed' ? 'active-filter' : ''}`}
          onClick={() => setFilter('completed')}
          title="Filter completed bookings"
        >
          <div className="asc-num">{stats.completed}</div>
          <div className="asc-label">{t('completed')}</div>
        </button>
      </div>

      {/* Admin Tab Switcher */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Bookings ({bookings.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          📢 Ads & Offers ({offers.filter((o) => o.active).length} Active)
        </button>
      </div>

      {activeTab === 'offers' ? (
        <OffersManager />
      ) : (
        <>
          <div className="admin-controls-row">
            <input
              type="text"
              className="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search bookings by name, phone, ID, or area..."
            />
            <div className="filter-chips-row">
              <button
                type="button"
                className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                {t('all')} ({bookings.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                {t('pending')} ({stats.pending})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                {t('confirmed')} ({stats.confirmed})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                {t('completed')} ({stats.completed})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                {t('cancelled')} ({bookings.filter((b) => b.status === 'cancelled').length})
              </button>
              {search && (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearch('')}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="empty">{t('noBookings')}</p>
          ) : (
            <div className="booking-list">
              {filtered.map((b) => (
                <div key={b.id} className="booking-card">
                  <div className="bc-top">
                    <div>
                      <strong>{b.name}</strong>
                      <div className="bc-id">{b.id}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="bc-body">
                    <div className="bc-row"><span>🔧</span> {t(b.appliance)} {b.brand ? `• ${b.brand}` : ''}</div>
                    {b.voucher && <div className="bc-row" style={{ color: '#16a34a', fontWeight: 'bold' }}><span>🎟️</span> Voucher: {b.voucher}</div>}
                    {b.issue && <div className="bc-row"><span>📝</span> {b.issue}</div>}
                    <div className="bc-row"><span>📅</span> {b.date} {t('at')} {b.time}</div>
                    <div className="bc-row"><span>📍</span> {b.address}</div>
                    <a className="bc-row link" href={`tel:${b.phone}`}><span>📞</span> {b.phone}</a>
                    <div className="bc-row muted"><span>🕒</span> {t('bookedOn')} {fmtDate(b.createdAt)}</div>
                  </div>

                  <div className="bc-actions">
                    <div className="bc-status-btns">
                      {/* PENDING: Admin can Accept or Cancel */}
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-accept"
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            title="Accept and confirm this booking"
                          >
                            ✓ {t('accept')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-cancel"
                            onClick={() => {
                              if (window.confirm(`Cancel booking ${b.id} for ${b.name}?`)) {
                                updateBookingStatus(b.id, 'cancelled')
                              }
                            }}
                            title="Cancel booking"
                          >
                            ✕ {t('cancelBooking')}
                          </button>
                        </>
                      )}

                      {/* CONFIRMED: Admin can Complete or Cancel */}
                      {b.status === 'confirmed' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-complete"
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            title="Mark this service as completed"
                          >
                            ✓ {t('markComplete')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-cancel"
                            onClick={() => {
                              if (window.confirm(`Cancel booking ${b.id} for ${b.name}?`)) {
                                updateBookingStatus(b.id, 'cancelled')
                              }
                            }}
                            title="Cancel booking"
                          >
                            ✕ {t('cancelBooking')}
                          </button>
                        </>
                      )}

                      {/* COMPLETED: Service completed, with Reopen option */}
                      {b.status === 'completed' && (
                        <div className="bc-done-indicator">
                          <span className="bc-done-text">✓ {t('serviceCompleted')}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-reopen"
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            title="Reopen booking back to Confirmed"
                          >
                            ↺ {t('reopen')}
                          </button>
                        </div>
                      )}

                      {/* CANCELLED: Booking cancelled, with Restore option */}
                      {b.status === 'cancelled' && (
                        <div className="bc-done-indicator">
                          <span className="bc-cancelled-text">✕ {t('bookingCancelled')}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-action-reopen"
                            onClick={() => updateBookingStatus(b.id, 'pending')}
                            title="Restore booking back to Pending"
                          >
                            ↺ {t('restore')}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bc-utility-btns">
                      <a
                        className="btn btn-whatsapp btn-sm"
                        href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(
                          `Hi ${b.name}, your service booking (${b.id}) for ${t(b.appliance)} on ${b.date} (${b.time}) has been ${b.status === 'completed' ? 'completed' : 'confirmed'} by Orange Refrigeration.\nAddress: ${b.address}\nOur technician will visit your location. For queries call: ${SHOP.phones[0]}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title={t('sendAcceptanceWa')}
                      >
                        💬 {t('notifyCustomer') || 'WhatsApp'}
                      </a>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm(`Delete booking ${b.id} for ${b.name}? This action cannot be undone.`)) {
                            deleteBooking(b.id)
                          }
                        }}
                        title="Delete booking"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_ok') === '1')

  function logout() {
    sessionStorage.removeItem('admin_ok')
    setAuthed(false)
  }

  return authed ? <Dashboard onLogout={logout} /> : <LoginView onLogin={() => setAuthed(true)} />
}
