// High-performance reactive store backed by LocalStorage with multi-tab & multi-window BroadcastChannel sync.

const LOCAL_KEY = 'orange_bookings'
const OFFERS_LOCAL_KEY = 'orange_offers'

// Cross-tab broadcast channel for instantaneous zero-latency synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('orange_services_sync')
  : null

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to persist bookings to localStorage:', err)
  }
  window.dispatchEvent(new Event('bookings-updated'))
  try {
    syncChannel?.postMessage({ type: 'bookings-updated' })
  } catch {}
}

export function getBookings() {
  return readLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export function addBooking(booking) {
  const list = readLocal()
  const record = {
    id: 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
    status: 'pending',
    createdAt: Date.now(),
    ...booking,
  }
  list.push(record)
  writeLocal(list)
  try {
    localStorage.setItem('latest_booking_id', record.id)
  } catch {}
  return record
}

export function updateBookingStatus(id, status) {
  const list = readLocal()
  const idx = list.findIndex((b) => b.id === id)
  if (idx !== -1) {
    list[idx].status = status
    writeLocal(list)
  }
}

export function deleteBooking(id) {
  const list = readLocal().filter((b) => b.id !== id)
  writeLocal(list)
}

export function subscribe(callback) {
  const localHandler = () => callback()
  const storageHandler = (e) => {
    if (!e || e.key === LOCAL_KEY) {
      callback()
    }
  }
  const channelHandler = (e) => {
    if (e.data?.type === 'bookings-updated') {
      callback()
    }
  }

  window.addEventListener('bookings-updated', localHandler)
  window.addEventListener('storage', storageHandler)
  syncChannel?.addEventListener('message', channelHandler)

  return () => {
    window.removeEventListener('bookings-updated', localHandler)
    window.removeEventListener('storage', storageHandler)
    syncChannel?.removeEventListener('message', channelHandler)
  }
}

// ---------------------------------------------------------------------------
// Offers, Vouchers & Festival Deals Store
// ---------------------------------------------------------------------------

export const DEFAULT_OFFERS = [
  {
    id: 'OFFER_DEFAULT_1',
    type: 'banner',
    badge: '⚡ EXPERT AC SERVICE',
    tag: 'DOORSTEP SERVICE',
    title: 'AC Service & Free Gas Pressure Test',
    desc: 'Deep jet wash outdoor & indoor unit overhaul for super fast cooling',
    appliance: 'ac',
    image: '/promo-ac.png',
    gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)',
    border: 'rgba(242, 101, 34, 0.6)',
    cta: 'Book AC Service',
    active: true,
    createdAt: 1710000000001,
  },
  {
    id: 'OFFER_DEFAULT_2',
    type: 'banner',
    badge: '🛠️ COMBO SERVICE',
    tag: 'COMPLETE CARE',
    title: '3-in-1 Complete Home Maintenance Pack',
    desc: 'AC + Refrigerator + Washing Machine Full Inspection & Tune-Up',
    appliance: 'ac',
    image: '/promo-combo.png',
    gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)',
    border: 'rgba(242, 101, 34, 0.6)',
    cta: 'Book Combo Pack',
    active: true,
    createdAt: 1710000000002,
  },
  {
    id: 'OFFER_DEFAULT_3',
    type: 'banner',
    badge: '🌀 REFRIGERATOR CARE',
    tag: 'EXPERT REPAIR',
    title: 'Fridge Cooling & Compressor Overhaul',
    desc: 'Fast gas leak detection, thermostat fix & deep cooling restoration',
    appliance: 'refrigerator',
    image: '/promo-fridge.jpg',
    gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)',
    border: 'rgba(242, 101, 34, 0.6)',
    cta: 'Book Fridge Repair',
    active: true,
    createdAt: 1710000000003,
  },
  {
    id: 'OFFER_DEFAULT_4',
    type: 'banner',
    badge: '🚀 EXPRESS SERVICE',
    tag: '45-MIN ARRIVAL',
    title: 'Same-Day Fast Repair & Diagnosis',
    desc: 'Urgent doorstep technician arrival anywhere in Sullurupeta & nearby',
    appliance: 'all',
    image: '/hero-bg.png',
    gradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.82) 100%)',
    border: 'rgba(242, 101, 34, 0.6)',
    cta: 'Book Express Visit',
    active: true,
    createdAt: 1710000000004,
  },
  {
    id: 'OFFER_DEFAULT_5',
    type: 'voucher',
    badge: '🎟️ SPECIAL VOUCHER',
    tag: 'FLAT ₹150 OFF',
    title: 'Welcome First-Time Service Discount',
    desc: 'Get flat ₹150 off on any AC, Fridge or Washing Machine repair booking',
    appliance: 'all',
    couponCode: 'ORANGE150',
    discount: '₹150 OFF',
    validTill: 'Limited Time Offer',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    border: '#a78bfa',
    cta: 'Apply & Book',
    active: true,
    createdAt: 1710000000005,
  },
]

function readOffersLocal() {
  try {
    const raw = localStorage.getItem(OFFERS_LOCAL_KEY)
    if (!raw) return DEFAULT_OFFERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_OFFERS
  } catch {
    return DEFAULT_OFFERS
  }
}

function writeOffersLocal(list) {
  try {
    localStorage.setItem(OFFERS_LOCAL_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to persist offers to localStorage:', err)
  }
  window.dispatchEvent(new Event('offers-updated'))
  try {
    syncChannel?.postMessage({ type: 'offers-updated' })
  } catch {}
}

export function getOffers() {
  return readOffersLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export function addOffer(offer) {
  const list = readOffersLocal()
  const record = {
    id: 'OFFER_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
    active: true,
    createdAt: Date.now(),
    ...offer,
  }
  list.unshift(record)
  writeOffersLocal(list)
  return record
}

export function updateOffer(id, updated) {
  const list = readOffersLocal()
  const idx = list.findIndex((o) => o.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updated }
    writeOffersLocal(list)
  }
}

export function toggleOfferActive(id) {
  const list = readOffersLocal()
  const idx = list.findIndex((o) => o.id === id)
  if (idx !== -1) {
    list[idx].active = !list[idx].active
    writeOffersLocal(list)
  }
}

export function deleteOffer(id) {
  const list = readOffersLocal().filter((o) => o.id !== id)
  writeOffersLocal(list)
}

export function resetOffersToDefault() {
  writeOffersLocal(DEFAULT_OFFERS)
}

export function subscribeOffers(callback) {
  const localHandler = () => callback()
  const storageHandler = (e) => {
    if (!e || e.key === OFFERS_LOCAL_KEY) {
      callback()
    }
  }
  const channelHandler = (e) => {
    if (e.data?.type === 'offers-updated') {
      callback()
    }
  }

  window.addEventListener('offers-updated', localHandler)
  window.addEventListener('storage', storageHandler)
  syncChannel?.addEventListener('message', channelHandler)

  return () => {
    window.removeEventListener('offers-updated', localHandler)
    window.removeEventListener('storage', storageHandler)
    syncChannel?.removeEventListener('message', channelHandler)
  }
}
