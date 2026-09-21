import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'
import { SHOP, APPLIANCE_KEYS, APPLIANCE_BRANDS, TIME_SLOTS } from '../config.js'
import { addBooking } from '../store.js'

const APPLIANCE_ICONS = {
  ac: '❄️',
  refrigerator: '🧊',
  washingMachine: '🌀',
}

function todayStr() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function Booking() {
  const { t, lang } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const preset = location.state?.appliance || ''
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    appliance: preset,
    brand: '',
    customBrand: '',
    issue: '',
    date: '',
    time: '',
  })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (location.state?.appliance) {
      const selectedAppliance = location.state.appliance
      const availableBrands = APPLIANCE_BRANDS[selectedAppliance] || SHOP.brands
      setForm((f) => ({
        ...f,
        appliance: selectedAppliance,
        brand: availableBrands.includes(f.brand) ? f.brand : '',
      }))
    }
  }, [location.state])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const err = {}
    if (!form.name.trim()) err.name = t('required')
    if (!/^\d{10}$/.test(form.phone.trim())) err.phone = t('invalidPhone')
    if (!form.address.trim()) err.address = t('required')
    if (!form.appliance) err.appliance = t('required')
    if (!form.brand) err.brand = t('required')
    if (form.brand === 'Other' && !form.customBrand.trim()) err.customBrand = t('required')
    if (!form.date) err.date = t('required')
    if (!form.time) err.time = t('required')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const finalBrand = form.brand === 'Other' ? (form.customBrand.trim() || 'Other') : form.brand
    addBooking({ ...form, brand: finalBrand })
    setDone(true)
  }

  function reset() {
    setForm({ name: '', phone: '', address: '', appliance: '', brand: '', customBrand: '', issue: '', date: '', time: '' })
    setErrors({})
    setDone(false)
  }

  if (done) {
    return (
      <div className="page center-page">
        <div className="success-card">
          <div className="success-ico">✅</div>
          <h2>{t('bookingSuccess')}</h2>
          <p>{t('bookingSuccessDesc')}</p>
          <button className="btn btn-primary" onClick={reset}>{t('newBooking')}</button>
        </div>
      </div>
    )
  }

  const currentBrands = form.appliance ? (APPLIANCE_BRANDS[form.appliance] || SHOP.brands) : []

  return (
    <div className="page">
      <h1 className="page-title">{t('booking')}</h1>
      

      <form className="form" onSubmit={handleSubmit} noValidate>
        <fieldset className="fieldset">
          <legend>{t('yourDetails')}</legend>

          <label className="field">
            <span>{t('fullName')} *</span>
            <input value={form.name} onChange={set('name')} type="text" />
            {errors.name && <em className="err">{errors.name}</em>}
          </label>

          <label className="field">
            <span>{t('phoneNumber')} *</span>
            <input value={form.phone} onChange={set('phone')} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit" />
            {errors.phone && <em className="err">{errors.phone}</em>}
          </label>

          <label className="field">
            <span>{t('fullAddress')} *</span>
            <textarea value={form.address} onChange={set('address')} rows={2} />
            {errors.address && <em className="err">{errors.address}</em>}
          </label>
        </fieldset>

        <fieldset className="fieldset">
          <legend>{t('applianceType')}</legend>

          {form.appliance ? (
            <div className="selected-service-banner">
              <div className="ssb-info">
                <span className="ssb-ico">{APPLIANCE_ICONS[form.appliance]}</span>
                <div>
                  <div className="ssb-label">{t('selectedService')}</div>
                  <div className="ssb-name">{t(form.appliance)}</div>
                </div>
              </div>
              <button
                type="button"
                className="ssb-change-btn"
                onClick={() => setForm((f) => ({ ...f, appliance: '', brand: '', customBrand: '' }))}
              >
                ✏️ {t('changeService')}
              </button>
            </div>
          ) : (
            <div className="field">
              <span>{t('selectService')} *</span>
              <div className="service-select-grid">
                {APPLIANCE_KEYS.map((k) => (
                  <button
                    type="button"
                    key={k}
                    className="service-select-btn"
                    onClick={() => {
                      setForm((f) => ({ ...f, appliance: k, brand: '', customBrand: '' }))
                      setErrors((e) => ({ ...e, appliance: null, brand: null }))
                    }}
                  >
                    <span className="ss-ico">{APPLIANCE_ICONS[k]}</span>
                    <span className="ss-name">{t(k)}</span>
                  </button>
                ))}
              </div>
              {errors.appliance && <em className="err">{errors.appliance}</em>}
            </div>
          )}

          {form.appliance && (
            <>
              <label className="field" style={{ marginTop: '14px' }}>
                <span>{t('brandName')} *</span>
                <select
                  value={form.brand}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((f) => ({ ...f, brand: val, customBrand: val === 'Other' ? f.customBrand : '' }))
                    setErrors((er) => ({ ...er, brand: null, customBrand: null }))
                  }}
                >
                  <option value="">{t('selectBrand')}</option>
                  {currentBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Other">{t('otherBrand')}</option>
                </select>
                {errors.brand && <em className="err">{errors.brand}</em>}
              </label>

              {form.brand === 'Other' && (
                <label className="field" style={{ marginTop: '12px' }}>
                  <span>{t('specifyBrand')} *</span>
                  <input
                    type="text"
                    value={form.customBrand}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, customBrand: e.target.value }))
                      setErrors((er) => ({ ...er, customBrand: null }))
                    }}
                    placeholder={t('specifyBrandPlaceholder')}
                  />
                  {errors.customBrand && <em className="err">{errors.customBrand}</em>}
                </label>
              )}
            </>
          )}

          <label className="field" style={{ marginTop: '14px' }}>
            <span>{t('issueDescription')}</span>
            <textarea value={form.issue} onChange={set('issue')} rows={3} placeholder={t('issuePlaceholder')} />
          </label>
        </fieldset>

        <fieldset className="fieldset">
          <legend>{t('preferredDate')} / {t('preferredTime')}</legend>

          <label className="field">
            <span>{t('preferredDate')} *</span>
            <input value={form.date} onChange={set('date')} type="date" min={todayStr()} />
            {errors.date && <em className="err">{errors.date}</em>}
          </label>

          <label className="field">
            <span>{t('preferredTime')} *</span>
            <select value={form.time} onChange={set('time')}>
              <option value="">{t('selectTime')}</option>
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.time && <em className="err">{errors.time}</em>}
          </label>
        </fieldset>

        <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: '16px' }}>{t('submitBooking')}</button>
      </form>
    </div>
  )
}
