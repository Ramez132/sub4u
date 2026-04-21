export type Language = "en" | "he";

export const translations = {
  en: {
    // Home
    slogan: "Find your next sublet, simply and quickly.",
    letsStart: "Let's Start!",
    city: "City",
    allCities: "All cities",
    months: "Months",
    search: "Search",
    availableSublets: "Available sublets",
    subletsIn: "Sublets in",
    listingsCount: "listing(s)",
    noListingsFound: "No listings found",
    tryDifferent: "Try choosing a different city or month.",
    viewListing: "View listing",

    // Navigation
    myAccount: "My Account",
    createListing: "Create listing",
    signIn: "Sign in",
    signOut: "Sign out",
    back: "← Back",

    // Listing detail page
    listingDetail: "Listing Details",
    locationLabel: "City",
    priceLabel: "Price",
    availableFrom: "Available from",
    availableUntil: "Available until",
    description: "Description",
    translating: "Translating...",

    // Create listing page
    createListingTitle: "Create a Listing",
    // My account page
    myAccountTitle: "My Account",

    monthLabels: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December",
    },
  },
  he: {
    // Home
    slogan: "מצא את דירת הסאבלט הבאה שלך בפשטות ובמהירות.",
    letsStart: "בואו נתחיל!",
    city: "עיר",
    allCities: "כל הערים",
    months: "חודשים",
    search: "חיפוש",
    availableSublets: "סאבלטים זמינים",
    subletsIn: "סאבלטים ב",
    listingsCount: "מודעות",
    noListingsFound: "לא נמצאו מודעות",
    tryDifferent: "נסה לבחור עיר או חודש אחרים.",
    viewListing: "לצפייה במודעה",

    // Navigation
    myAccount: "החשבון שלי",
    createListing: "פרסם מודעה",
    signIn: "התחברות",
    signOut: "התנתקות",
    back: "← חזרה",

    // Listing detail page
    listingDetail: "פרטי המודעה",
    locationLabel: "עיר",
    priceLabel: "מחיר",
    availableFrom: "זמין מ",
    availableUntil: "זמין עד",
    description: "תיאור",
    translating: "מתרגם...",

    // Create listing page
    createListingTitle: "פרסום מודעה",
    // My account page
    myAccountTitle: "החשבון שלי",

    monthLabels: {
      january: "ינואר",
      february: "פברואר",
      march: "מרץ",
      april: "אפריל",
      may: "מאי",
      june: "יוני",
      july: "יולי",
      august: "אוגוסט",
      september: "ספטמבר",
      october: "אוקטובר",
      november: "נובמבר",
      december: "דצמבר",
    },
  },
} as const;