import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  en: {
    // App / nav
    appName: 'Orange Refrigeration',
    home: 'Home',
    bookNow: 'Book Now',
    booking: 'Book a Service',
    admin: 'Admin',
    back: 'Back',

    // Home
    proprietor: 'Proprietor',
    tagline: 'All types of AC, Washing Machine & Refrigerator services',
    ourServices: 'Our Services',
    specialOffers: 'Special Offers',
    brandsWeService: 'Brands We Service',
    call: 'Call',
    callNow: 'Call Now',
    directions: 'Directions',
    address: 'Address',
    contact: 'Contact',
    bookAService: 'Book a Service',
    bookServiceDesc: 'Request repair for your AC, fridge or washing machine',

    // Appliances
    ac: 'Air Conditioner (AC)',
    refrigerator: 'Refrigerator',
    washingMachine: 'Washing Machine',

    // Booking form
    yourDetails: 'Your Details',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    fullAddress: 'Full Address',
    applianceType: 'Appliance Type',
    selectService: 'Select Service',
    selectedService: 'Selected Service',
    changeService: 'Change',
    selectAppliance: 'Select appliance',
    brandName: 'Appliance Brand',
    selectBrand: 'Select brand',
    otherBrand: 'Other / Not Listed',
    specifyBrand: 'Specify Brand Name',
    specifyBrandPlaceholder: 'e.g. O General, TCL, Sharp...',
    issueDescription: 'Describe the Problem',
    issuePlaceholder: 'e.g. AC not cooling, water leaking...',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time Slot',
    selectTime: 'Select time slot',
    submitBooking: 'Submit Booking Request',
    sendWhatsApp: 'Also send on WhatsApp',
    bookingSuccess: 'Booking request submitted successfully!',
    bookingSuccessDesc: 'We will contact you shortly to confirm your appointment.',
    newBooking: 'Make Another Booking',
    required: 'This field is required',
    invalidPhone: 'Enter a valid 10-digit phone number',

    // Admin
    adminLogin: 'Admin Login',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    wrongPassword: 'Incorrect password',
    allBookings: 'All Bookings',
    noBookings: 'No bookings yet.',
    filterStatus: 'Filter by status',
    all: 'All',
    status: 'Status',
    updateStatus: 'Update status',
    bookedOn: 'Booked on',
    for: 'For',
    at: 'at',

    // Banners
    topTickerBanner: '🔥 Special Offer: Discount on AC & Appliance Servicing! • Free Inspection',
    brandsMarqueeTitle: 'Brands We Repair & Service',
    trustWarrantyTitle: '6-Month Warranty',
    trustWarrantyDesc: 'On genuine replacement spare parts',
    trustExpressTitle: '45-Min Express',
    trustExpressDesc: 'Fast technician arrival at your home',
    trustExpertTitle: 'Certified Experts',
    trustExpertDesc: 'Trained & background verified engineers',
    trustPriceTitle: 'Best Price Guarantee',
    trustPriceDesc: 'Transparent rates with zero hidden costs',
    couponBannerTitle: 'FESTIVE DISCOUNT VOUCHER',
    couponBannerDesc: 'Get Special Discount on your repair service today!',
    couponCode: 'ORANGE100',
    applyCoupon: 'Apply Discount',
    couponApplied: 'Discount Offer Applied!',
    bookingAcceptedTitle: 'Booking Accepted! 🟢',
    bookingAcceptedDesc: 'Your service booking has been accepted & confirmed by Orange Services.',
    sendAcceptanceWa: 'Send WhatsApp Acceptance',
    notifyCustomer: 'Notify Customer',
  },
  te: {
    appName: 'ఆరెంజ్ రిఫ్రిజిరేషన్',
    home: 'హోమ్',
    bookNow: 'బుక్ చేయండి',
    booking: 'సర్వీస్ బుక్ చేయండి',
    admin: 'అడ్మిన్',
    back: 'వెనుకకు',

    proprietor: 'యజమాని',
    tagline: 'అన్ని రకాల ఏసీ, వాషింగ్ మెషిన్ & రిఫ్రిజిరేటర్ సర్వీసులు',
    ourServices: 'మా సేవలు',
    specialOffers: 'ప్రత్యేక ఆఫర్లు',
    brandsWeService: 'మేము సర్వీస్ చేసే బ్రాండ్లు',
    call: 'కాల్',
    callNow: 'ఇప్పుడే కాల్ చేయండి',
    directions: 'దారి చూపించు',
    address: 'చిరునామా',
    contact: 'సంప్రదించండి',
    bookAService: 'సర్వీస్ బుక్ చేయండి',
    bookServiceDesc: 'మీ ఏసీ, ఫ్రిజ్ లేదా వాషింగ్ మెషిన్ కోసం రిపేర్ అభ్యర్థించండి',

    ac: 'ఎయిర్ కండిషనర్ (ఏసీ)',
    refrigerator: 'రిఫ్రిజిరేటర్ (ఫ్రిజ్)',
    washingMachine: 'వాషింగ్ మెషిన్',

    yourDetails: 'మీ వివరాలు',
    fullName: 'పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    fullAddress: 'పూర్తి చిరునామా',
    applianceType: 'ఉపకరణం రకం',
    selectService: 'సేవను ఎంచుకోండి',
    selectedService: 'ఎంచుకున్న సేవ',
    changeService: 'మార్చండి',
    selectAppliance: 'ఉపకరణాన్ని ఎంచుకోండి',
    brandName: 'ఉపకరణం బ్రాండ్',
    selectBrand: 'బ్రాండ్‌ను ఎంచుకోండి',
    otherBrand: 'ఇతర బ్రాండ్',
    specifyBrand: 'బ్రాండ్ పేరు తెలపండి',
    specifyBrandPlaceholder: 'ఉదా. ఓ జనరల్, టీసీఎల్, షార్ప్...',
    issueDescription: 'సమస్యను వివరించండి',
    issuePlaceholder: 'ఉదా. ఏసీ చల్లబడటం లేదు, నీరు లీక్ అవుతోంది...',
    preferredDate: 'ఇష్టమైన తేదీ',
    preferredTime: 'ఇష్టమైన సమయం',
    selectTime: 'సమయాన్ని ఎంచుకోండి',
    submitBooking: 'బుకింగ్ అభ్యర్థన సమర్పించండి',
    sendWhatsApp: 'వాట్సాప్‌లో కూడా పంపండి',
    bookingSuccess: 'బుకింగ్ అభ్యర్థన విజయవంతంగా సమర్పించబడింది!',
    bookingSuccessDesc: 'మీ అపాయింట్‌మెంట్‌ను ధృవీకరించడానికి మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.',
    newBooking: 'మరో బుకింగ్ చేయండి',
    required: 'ఈ ఫీల్డ్ అవసరం',
    invalidPhone: 'సరైన 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి',

    adminLogin: 'అడ్మిన్ లాగిన్',
    password: 'పాస్‌వర్డ్',
    login: 'లాగిన్',
    logout: 'లాగౌట్',
    wrongPassword: 'తప్పు పాస్‌వర్డ్',
    allBookings: 'అన్ని బుకింగ్‌లు',
    noBookings: 'ఇంకా బుకింగ్‌లు లేవు.',
    filterStatus: 'స్థితి ద్వారా వడపోత',
    all: 'అన్నీ',
    status: 'స్థితి',
    updateStatus: 'స్థితిని నవీకరించండి',
    bookedOn: 'బుక్ చేసిన తేదీ',
    for: 'కోసం',
    at: 'వద్ద',

    pending: 'పెండింగ్',
    confirmed: 'నిర్ధారించబడింది',
    completed: 'పూర్తయింది',
    cancelled: 'రద్దు చేయబడింది',

    // Banners
    topTickerBanner: '🔥 ప్రత్యేక ఆఫర్: ఏసీ & హోమ్ అప్లయన్స్ సర్వీసింగ్‌పై ప్రత్యేక తగ్గింపు! • ఉచిత పరిశీలన',
    brandsMarqueeTitle: 'మేము రిపేర్ చేసే బ్రాండ్లు',
    trustWarrantyTitle: '6-నెలల వారంటీ',
    trustWarrantyDesc: 'ఒరిజినల్ స్పేర్ పార్టులపై హామీ',
    trustExpressTitle: '45-నిమిషాల సర్వీస్',
    trustExpressDesc: 'మీ ఇంటి వద్దకే వేగవంతమైన టెక్నీషియన్',
    trustExpertTitle: 'సర్టిఫైడ్ టెక్నీషియన్లు',
    trustExpertDesc: 'అన్ని బ్రాండ్లలో శిక్షణ పొందిన నిపుణులు',
    trustPriceTitle: 'సరసమైన ధరలు',
    trustPriceDesc: 'ఎటువంటి దాగి ఉన్న చార్జీలు లేవు',
    couponBannerTitle: 'పండుగ ఆఫర్ వోチャー',
    couponBannerDesc: 'నేడే మీ రిపేర్ సర్వీస్‌పై ప్రత్యేక తగ్గింపు పొందండి!',
    couponCode: 'ORANGE100',
    applyCoupon: 'తగ్గింపు పొందండి',
    couponApplied: 'ప్రత్యేక తగ్గింపు ఆఫర్ వర్తించబడింది!',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const changeLang = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }, [])

  const toggleLang = useCallback(() => {
    changeLang(lang === 'en' ? 'te' : 'en')
  }, [lang, changeLang])

  const t = useCallback((key) => translations[lang][key] ?? translations.en[key] ?? key, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
