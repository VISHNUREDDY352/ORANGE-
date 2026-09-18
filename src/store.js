// Simple booking store backed by localStorage.
// NOTE: This stores data on the device only. For cross-device sync between
// customer phones and the owner's admin phone, connect a free backend
// (Supabase / Firebase). See README for the drop-in swap points.

const KEY = 'orange_bookings'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
  // Notify listeners in same tab
  window.dispatchEvent(new Event('bookings-updated'))
}

export function getBookings() {
  return read().sort((a, b) => b.createdAt - a.createdAt)
}

export function addBooking(booking) {
  const list = read()
  const record = {
    id: 'BK' + Date.now().toString(36).toUpperCase(),
    status: 'pending',
    createdAt: Date.now(),
    ...booking,
  }
  list.push(record)
  write(list)
  localStorage.setItem('latest_booking_id', record.id)
  return record
}

export function updateBookingStatus(id, status) {
  const list = read()
  const idx = list.findIndex((b) => b.id === id)
  if (idx !== -1) {
    list[idx].status = status
    write(list)
  }
}

export function deleteBooking(id) {
  write(read().filter((b) => b.id !== id))
}

export function subscribe(callback) {
  const handler = () => callback()
  window.addEventListener('bookings-updated', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('bookings-updated', handler)
    window.removeEventListener('storage', handler)
  }
}
