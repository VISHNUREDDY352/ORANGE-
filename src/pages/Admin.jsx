import { useState, useEffect } from 'react'
import { useI18n } from '../i18n.jsx'
import { ADMIN_PASSWORD, BOOKING_STATUSES } from '../config.js'
import { getBookings, updateBookingStatus, deleteBooking, subscribe } from '../store.js'

function useBookings() {
  const [list, setList] = useState(getBookings())
  useEffect(() => subscribe(() => setList(getBookings())), [])
  return list
}

function LoginView({ onLogin }) {
  const { t } = useI18n()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
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

function Dashboard({ onLogout }) {
  const { t } = useI18n()
  const bookings = useBookings()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  const fmtDate = (ts) => new Date(ts).toLocaleString()

  return (
    <div className="page">
      <div className="admin-head">
        <h1 className="page-title">{t('allBookings')} ({bookings.length})</h1>
        <button className="btn btn-outline btn-sm" onClick={onLogout}>{t('logout')}</button>
      </div>

      <div className="filter-row">
        <label>
          <span>{t('filterStatus')}:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t('all')}</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </label>
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
                {b.issue && <div className="bc-row"><span>📝</span> {b.issue}</div>}
                <div className="bc-row"><span>📅</span> {b.date} {t('at')} {b.time}</div>
                <div className="bc-row"><span>📍</span> {b.address}</div>
                <a className="bc-row link" href={`tel:${b.phone}`}><span>📞</span> {b.phone}</a>
                <div className="bc-row muted"><span>🕒</span> {t('bookedOn')} {fmtDate(b.createdAt)}</div>
              </div>

              <div className="bc-actions">
                <label>
                  <span>{t('updateStatus')}:</span>
                  <select
                    value={b.status}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      updateBookingStatus(b.id, newStatus)
                    }}
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>{t(s)}</option>
                    ))}
                  </select>
                </label>
                <button className="btn btn-danger btn-sm" onClick={() => deleteBooking(b.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
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
