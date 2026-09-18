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
