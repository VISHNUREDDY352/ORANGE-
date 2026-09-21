// Real-time store backed by LocalStorage + Cloud DB Sync for cross-device support (Laptop <-> Mobile).

const LOCAL_KEY = 'orange_bookings'
const CLOUD_API_URL = 'https://api.jsonbin.io/v3/b'
// Shared public cloud ID for cross-device live sync
const CLOUD_BIN_ID = '66eab537ad19ca34f8aa4b12' 

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []
  } catch {
    return []
  }
}

function writeLocal(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('bookings-updated'))
}

// Fetch latest bookings from cloud DB
async function fetchCloudBookings() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects?ids=orange_services_app_bookings`)
    if (res.ok) {
      const data = await res.json()
      if (data && data[0]?.data?.list) {
        const cloudList = data[0].data.list
        const localList = readLocal()
        // Merge cloud & local by ID & timestamp
        const map = new Map()
        localList.forEach((b) => map.set(b.id, b))
        cloudList.forEach((b) => map.set(b.id, b))
        const merged = Array.from(map.values())
        writeLocal(merged)
      }
    }
  } catch (err) {
    // Fallback to local
  }
}

// Push updated bookings to cloud DB
async function pushCloudBookings(list) {
  try {
    await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'orange_services_app_bookings',
        name: 'Orange Services Bookings',
        data: { list, updatedAt: Date.now() },
      }),
    })
  } catch (err) {
    // Silent fallback
  }
}

export function getBookings() {
  return readLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export function addBooking(booking) {
  const list = readLocal()
  const record = {
    id: 'BK' + Date.now().toString(36).toUpperCase(),
    status: 'pending',
    createdAt: Date.now(),
    ...booking,
  }
  list.push(record)
  writeLocal(list)
  localStorage.setItem('latest_booking_id', record.id)
  pushCloudBookings(list)
  return record
}

export function updateBookingStatus(id, status) {
  const list = readLocal()
  const idx = list.findIndex((b) => b.id === id)
  if (idx !== -1) {
    list[idx].status = status
    writeLocal(list)
    pushCloudBookings(list)
  }
}

export function deleteBooking(id) {
  const list = readLocal().filter((b) => b.id !== id)
  writeLocal(list)
  pushCloudBookings(list)
}

export function subscribe(callback) {
  const handler = () => callback()
  window.addEventListener('bookings-updated', handler)
  window.addEventListener('storage', handler)

  // Initial cloud fetch & periodic poll for cross-device sync (e.g. Laptop -> Mobile)
  fetchCloudBookings().then(callback)
  const timer = setInterval(() => {
    fetchCloudBookings().then(callback)
  }, 4000)

  return () => {
    window.removeEventListener('bookings-updated', handler)
    window.removeEventListener('storage', handler)
    clearInterval(timer)
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

const OFFERS_LOCAL_KEY = 'orange_offers'

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
  localStorage.setItem(OFFERS_LOCAL_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('offers-updated'))
}

async function fetchCloudOffers() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects?ids=orange_services_app_offers`)
    if (res.ok) {
      const data = await res.json()
      if (data && data[0]?.data?.list) {
        const cloudList = data[0].data.list
        if (Array.isArray(cloudList) && cloudList.length > 0) {
          writeOffersLocal(cloudList)
        }
      }
    }
  } catch {}
}

async function pushCloudOffers(list) {
  try {
    await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'orange_services_app_offers',
        name: 'Orange Services Offers',
        data: { list, updatedAt: Date.now() },
      }),
    })
  } catch {}
}

export function getOffers() {
  return readOffersLocal().sort((a, b) => b.createdAt - a.createdAt)
}

export function addOffer(offer) {
  const list = readOffersLocal()
  const record = {
    id: 'OFFER_' + Date.now().toString(36).toUpperCase(),
    active: true,
    createdAt: Date.now(),
    ...offer,
  }
  list.unshift(record)
  writeOffersLocal(list)
  pushCloudOffers(list)
  return record
}

export function updateOffer(id, updated) {
  const list = readOffersLocal()
  const idx = list.findIndex((o) => o.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updated }
    writeOffersLocal(list)
    pushCloudOffers(list)
  }
}

export function toggleOfferActive(id) {
  const list = readOffersLocal()
  const idx = list.findIndex((o) => o.id === id)
  if (idx !== -1) {
    list[idx].active = !list[idx].active
    writeOffersLocal(list)
    pushCloudOffers(list)
  }
}

export function deleteOffer(id) {
  const list = readOffersLocal().filter((o) => o.id !== id)
  writeOffersLocal(list)
  pushCloudOffers(list)
}

export function resetOffersToDefault() {
  writeOffersLocal(DEFAULT_OFFERS)
  pushCloudOffers(DEFAULT_OFFERS)
}

export function subscribeOffers(callback) {
  const handler = () => callback()
  window.addEventListener('offers-updated', handler)
  window.addEventListener('storage', handler)

  fetchCloudOffers().then(callback)
  const timer = setInterval(() => {
    fetchCloudOffers().then(callback)
  }, 5000)

  return () => {
    window.removeEventListener('offers-updated', handler)
    window.removeEventListener('storage', handler)
    clearInterval(timer)
  }
}
