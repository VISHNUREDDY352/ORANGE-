import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './config.js'

// Initialize Supabase Client (singleton to avoid duplicate GoTrueClient instances during HMR)
export const supabase =
  typeof window !== 'undefined' && window.__supabaseInstance
    ? window.__supabaseInstance
    : createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

if (typeof window !== 'undefined') {
  window.__supabaseInstance = supabase
}

const LOCAL_KEY = 'orange_bookings'
const OFFERS_LOCAL_KEY = 'orange_offers'

// Cross-tab broadcast channel for instantaneous zero-latency synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('orange_services_sync')
  : null

function normalizeFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    appliance: row.appliance,
    brand: row.brand || '',
    issue: row.issue || '',
    date: row.date,
    time: row.time,
    voucher: row.voucher || '',
    status: row.status || 'pending',
    createdAt: Number(row.created_at) || Date.now(),
  }
}

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

// Fetch remote bookings from Supabase Cloud
async function fetchRemoteBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      const remoteList = data
        .filter((row) => !row.id?.startsWith('__APP_'))
        .map(normalizeFromDb)
      writeLocal(remoteList)
      return remoteList
    }
  } catch (err) {
    console.warn('Supabase fetch error, using local data:', err)
  }
  return readLocal()
}

export function getBookings() {
  return readLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export async function addBooking(booking) {
  const id = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()
  const now = Date.now()
  const record = {
    id,
    status: 'pending',
    createdAt: now,
    ...booking,
  }

  // 1. Instant local write for 0ms UI response
  const list = readLocal()
  list.unshift(record)
  writeLocal(list)
  try {
    localStorage.setItem('latest_booking_id', record.id)
  } catch {}

  // 2. Cloud sync to Supabase
  try {
    await supabase.from('bookings').insert([{
      id,
      name: record.name,
      phone: record.phone,
      address: record.address,
      appliance: record.appliance,
      brand: record.brand || '',
      issue: record.issue || '',
      date: record.date,
      time: record.time,
      voucher: record.voucher || '',
      status: record.status,
      created_at: now,
    }])
  } catch (err) {
    console.warn('Failed to insert booking to Supabase cloud:', err)
  }

  return record
}

export async function updateBookingStatus(id, status) {
  // 1. Instant local update
  const list = readLocal()
  const idx = list.findIndex((b) => b.id === id)
  if (idx !== -1) {
    list[idx].status = status
    writeLocal(list)
  }

  // 2. Cloud update to Supabase
  try {
    await supabase.from('bookings').update({ status }).eq('id', id)
  } catch (err) {
    console.warn('Failed to update status in Supabase:', err)
  }
}

export async function deleteBooking(id) {
  // 1. Instant local removal
  const list = readLocal().filter((b) => b.id !== id)
  writeLocal(list)

  // 2. Cloud deletion in Supabase
  try {
    await supabase.from('bookings').delete().eq('id', id)
  } catch (err) {
    console.warn('Failed to delete booking in Supabase:', err)
  }
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

  // Initial cloud fetch to get latest bookings
  fetchRemoteBookings().then(() => callback())

  // Real-time Supabase PostgreSQL change listener (WebSocket)
  const channelName = 'supabase-realtime-bookings-' + Math.random().toString(36).slice(2, 7)
  let dbChannel = null
  try {
    dbChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        async () => {
          await fetchRemoteBookings()
          callback()
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('Supabase realtime listener setup error:', err)
  }

  // Fast auto-poll fallback every 3.5s for instant sync across devices
  const pollTimer = setInterval(async () => {
    try {
      await fetchRemoteBookings()
      callback()
    } catch {}
  }, 3500)

  // Instant refresh on focus or app foregrounding
  const focusHandler = async () => {
    await fetchRemoteBookings()
    callback()
  }
  const visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      focusHandler()
    }
  }

  window.addEventListener('focus', focusHandler)
  document.addEventListener('visibilitychange', visibilityHandler)

  return () => {
    window.removeEventListener('bookings-updated', localHandler)
    window.removeEventListener('storage', storageHandler)
    syncChannel?.removeEventListener('message', channelHandler)
    clearInterval(pollTimer)
    window.removeEventListener('focus', focusHandler)
    document.removeEventListener('visibilitychange', visibilityHandler)
    if (dbChannel) {
      supabase.removeChannel(dbChannel)
    }
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

const OFFERS_SYNC_ID = '__APP_SYNC_OFFERS__'

async function syncOffersToCloud(list) {
  try {
    await supabase.from('bookings').upsert([{
      id: OFFERS_SYNC_ID,
      name: JSON.stringify(list),
      phone: '0000000000',
      address: 'Cloud Sync Offers Storage',
      appliance: 'all',
      brand: '',
      issue: 'Offers Storage',
      date: '2026-01-01',
      time: '00:00',
      voucher: '',
      status: 'system',
      created_at: Date.now(),
    }])
  } catch (err) {
    console.warn('Failed to sync offers to Supabase cloud:', err)
  }
}

async function fetchRemoteOffers() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', OFFERS_SYNC_ID)
      .limit(1)

    if (!error && data && data.length > 0 && data[0].name) {
      try {
        const parsed = JSON.parse(data[0].name)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(OFFERS_LOCAL_KEY, JSON.stringify(parsed))
          window.dispatchEvent(new Event('offers-updated'))
          return parsed
        }
      } catch (e) {
        console.warn('Failed to parse remote offers:', e)
      }
    } else {
      // Cloud is empty; initialize with current offers
      const current = readOffersLocal()
      await syncOffersToCloud(current)
      return current
    }
  } catch (err) {
    console.warn('Failed to fetch remote offers from cloud:', err)
  }
  return readOffersLocal()
}

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
  syncOffersToCloud(list)
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

  // 1. Initial cloud fetch to get latest offers created on any device
  fetchRemoteOffers().then(() => callback())

  // 2. Real-time Supabase listener for offers synced across devices
  const channelName = 'supabase-realtime-offers-' + Math.random().toString(36).slice(2, 7)
  let offersDbChannel = null
  try {
    offersDbChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        async (payload) => {
          if (payload.new?.id === OFFERS_SYNC_ID || payload.old?.id === OFFERS_SYNC_ID) {
            await fetchRemoteOffers()
            callback()
          }
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('Supabase realtime offers listener error:', err)
  }

  // 3. Fast auto-poll fallback every 3 seconds for instant cross-device updates
  const pollTimer = setInterval(async () => {
    try {
      const prevRaw = localStorage.getItem(OFFERS_LOCAL_KEY)
      const { data } = await supabase
        .from('bookings')
        .select('name')
        .eq('id', OFFERS_SYNC_ID)
        .limit(1)
      if (data && data[0]?.name && data[0].name !== prevRaw) {
        const parsed = JSON.parse(data[0].name)
        if (Array.isArray(parsed)) {
          localStorage.setItem(OFFERS_LOCAL_KEY, JSON.stringify(parsed))
          window.dispatchEvent(new Event('offers-updated'))
          callback()
        }
      }
    } catch {}
  }, 3000)

  // 4. Instant update on window focus or app foregrounding
  const focusHandler = async () => {
    await fetchRemoteOffers()
    callback()
  }
  const visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      focusHandler()
    }
  }

  window.addEventListener('focus', focusHandler)
  document.addEventListener('visibilitychange', visibilityHandler)

  return () => {
    window.removeEventListener('offers-updated', localHandler)
    window.removeEventListener('storage', storageHandler)
    syncChannel?.removeEventListener('message', channelHandler)
    clearInterval(pollTimer)
    window.removeEventListener('focus', focusHandler)
    document.removeEventListener('visibilitychange', visibilityHandler)
    if (offersDbChannel) {
      supabase.removeChannel(offersDbChannel)
    }
  }
}

// ==========================================
// CUSTOMER REVIEWS & RATINGS (Cloud Synced)
// ==========================================
const REVIEWS_LOCAL_KEY = 'orange_customer_reviews'
const REVIEWS_SYNC_ID = '__APP_SYNC_REVIEWS__'

const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    name: 'Suresh Kumar',
    rating: 5,
    appliance: 'ac',
    comment: 'Excellent AC master service! Technician arrived within 45 mins. Cooling is ice-cold now and pricing is very honest.',
    date: '2026-09-20',
    verified: true,
    createdAt: 1726830000000,
  },
  {
    id: 'rev_2',
    name: 'Priya Sharma',
    rating: 5,
    appliance: 'refrigerator',
    comment: 'My double-door fridge stopped cooling suddenly. Orange technician diagnosed the gas leak and fixed it on the spot. Highly recommend!',
    date: '2026-09-18',
    verified: true,
    createdAt: 1726650000000,
  },
  {
    id: 'rev_3',
    name: 'Venkatesh Rao',
    rating: 5,
    appliance: 'washingMachine',
    comment: 'Very professional front-load drum repair. Clean work, genuine spare parts used with warranty.',
    date: '2026-09-15',
    verified: true,
    createdAt: 1726390000000,
  },
  {
    id: 'rev_4',
    name: 'Ananya Reddy',
    rating: 4,
    appliance: 'ac',
    comment: 'Good experience with split AC jet pump cleaning. Very polite technician and left the room completely spotless.',
    date: '2026-09-10',
    verified: true,
    createdAt: 1725960000000,
  },
]

async function syncReviewsToCloud(list) {
  try {
    const payload = JSON.stringify(list)
    await supabase.from('bookings').upsert([{
      id: REVIEWS_SYNC_ID,
      name: payload,
      phone: 'SYSTEM_REVIEWS',
      address: 'Cloud Synced Customer Reviews',
      appliance: 'reviews',
      brand: 'system',
      issue: 'Customer ratings and feedback collection',
      date: '2026-01-01',
      time: '00:00',
      voucher: '',
      status: 'system',
      created_at: Date.now(),
    }])
  } catch (err) {
    console.warn('Failed to sync reviews to Supabase cloud:', err)
  }
}

async function fetchRemoteReviews() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', REVIEWS_SYNC_ID)
      .limit(1)

    if (!error && data && data.length > 0 && data[0].name) {
      try {
        const parsed = JSON.parse(data[0].name)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(parsed))
          window.dispatchEvent(new Event('reviews-updated'))
          return parsed
        }
      } catch (e) {
        console.warn('Failed to parse remote reviews:', e)
      }
    } else {
      const current = readReviewsLocal()
      await syncReviewsToCloud(current)
      return current
    }
  } catch (err) {
    console.warn('Failed to fetch remote reviews from cloud:', err)
  }
  return readReviewsLocal()
}

function readReviewsLocal() {
  try {
    const raw = localStorage.getItem(REVIEWS_LOCAL_KEY)
    if (!raw) return DEFAULT_REVIEWS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REVIEWS
  } catch {
    return DEFAULT_REVIEWS
  }
}

function writeReviewsLocal(list) {
  try {
    localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to persist reviews:', err)
  }
  window.dispatchEvent(new Event('reviews-updated'))
  try {
    syncChannel?.postMessage({ type: 'reviews-updated' })
  } catch {}
  syncReviewsToCloud(list)
}

export function getReviews() {
  return readReviewsLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export function addReview({ name, rating, appliance, comment, bookingId }) {
  const list = readReviewsLocal()
  const today = new Date().toISOString().slice(0, 10)
  const newReview = {
    id: 'rev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    name: name?.trim() || 'Verified Customer',
    rating: Number(rating) || 5,
    appliance: appliance || 'general',
    comment: comment?.trim() || '',
    date: today,
    verified: true,
    bookingId: bookingId || null,
    createdAt: Date.now(),
  }
  list.unshift(newReview)
  writeReviewsLocal(list)
  return newReview
}

export function deleteReview(id) {
  const list = readReviewsLocal().filter((r) => r.id !== id)
  writeReviewsLocal(list)
}

export function getRatingStats() {
  const list = readReviewsLocal()
  if (!list.length) return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0
  list.forEach((r) => {
    const score = Math.max(1, Math.min(5, Math.round(r.rating || 5)))
    breakdown[score] = (breakdown[score] || 0) + 1
    sum += score
  })
  const average = Number((sum / list.length).toFixed(1))
  return { average, count: list.length, breakdown }
}

export function subscribeReviews(callback) {
  const localHandler = () => callback()
  const storageHandler = (e) => {
    if (!e || e.key === REVIEWS_LOCAL_KEY) callback()
  }
  const channelHandler = (e) => {
    if (e.data?.type === 'reviews-updated') callback()
  }

  window.addEventListener('reviews-updated', localHandler)
  window.addEventListener('storage', storageHandler)
  syncChannel?.addEventListener('message', channelHandler)

  fetchRemoteReviews().then(() => callback())

  const channelName = 'supabase-realtime-reviews-' + Math.random().toString(36).slice(2, 7)
  let reviewsDbChannel = null
  try {
    reviewsDbChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        async (payload) => {
          if (payload.new?.id === REVIEWS_SYNC_ID || payload.old?.id === REVIEWS_SYNC_ID) {
            await fetchRemoteReviews()
            callback()
          }
        }
      )
      .subscribe()
  } catch (err) {
    console.warn('Supabase realtime reviews listener error:', err)
  }

  // Auto-poll fallback every 3.5 seconds
  const pollTimer = setInterval(async () => {
    try {
      const prevRaw = localStorage.getItem(REVIEWS_LOCAL_KEY)
      const { data } = await supabase
        .from('bookings')
        .select('name')
        .eq('id', REVIEWS_SYNC_ID)
        .limit(1)
      if (data && data[0]?.name && data[0].name !== prevRaw) {
        const parsed = JSON.parse(data[0].name)
        if (Array.isArray(parsed)) {
          localStorage.setItem(REVIEWS_LOCAL_KEY, JSON.stringify(parsed))
          window.dispatchEvent(new Event('reviews-updated'))
          callback()
        }
      }
    } catch {}
  }, 3500)

  const focusHandler = async () => {
    await fetchRemoteReviews()
    callback()
  }
  const visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      focusHandler()
    }
  }

  window.addEventListener('focus', focusHandler)
  document.addEventListener('visibilitychange', visibilityHandler)

  return () => {
    window.removeEventListener('reviews-updated', localHandler)
    window.removeEventListener('storage', storageHandler)
    syncChannel?.removeEventListener('message', channelHandler)
    clearInterval(pollTimer)
    window.removeEventListener('focus', focusHandler)
    document.removeEventListener('visibilitychange', visibilityHandler)
    if (reviewsDbChannel) {
      supabase.removeChannel(reviewsDbChannel)
    }
  }
}

