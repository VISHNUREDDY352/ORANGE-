// Central shop configuration. Edit these values to update the app everywhere.
export const SHOP = {
  name: 'Orange Refrigeration',
  shortName: 'Orange',
  proprietor: 'Manikanta',
  // Phone numbers from the business card. VERIFY these are correct.
  phones: ['7287831424', '9490171029'],
  // WhatsApp number that receives booking requests (owner). Use full intl format without +.
  whatsapp: '917287831424',
  address: 'Athreya Street, Vikram College Road, Sullurupeta - 524121',
  mapsQuery: 'Vikram College Road, Sullurupeta 524121',
  brands: ['LG', 'Voltas', 'Daikin', 'Carrier', 'Samsung', 'Panasonic', 'Mitsubishi Electric', 'Hitachi'],
}

// Admin login password. Change this before sharing the app.
export const ADMIN_PASSWORD = 'Mani@123'

// Appliance types offered
export const APPLIANCE_KEYS = ['ac', 'refrigerator', 'washingMachine']

// Service photos
export const APPLIANCE_IMAGES = {
  ac: '/service-ac.jpg',
  refrigerator: '/service-fridge.jpg',
  washingMachine: '/service-washing.jpg',
}

// Service-specific brand mapping
export const APPLIANCE_BRANDS = {
  ac: ['LG', 'Voltas', 'Daikin', 'Carrier', 'Blue Star', 'Hitachi', 'Mitsubishi Electric', 'Panasonic', 'Samsung', 'Lloyd', 'Godrej'],
  refrigerator: ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Bosch', 'Panasonic', 'Kelvinator', 'Liebherr', 'Voltas Beko'],
  washingMachine: ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Godrej', 'Panasonic', 'Haier', 'Lloyd'],
}

// Available time slots for booking
export const TIME_SLOTS = [
  '09:00 - 11:00',
  '11:00 - 13:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
]

export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']
