export type Language = "en" | "he";

export const translations = {
  en: {
    slogan: "Find your next sublet, simply and quickly.",
    letsStart: "Let's Start!",
    city: "City",
    allCities: "All cities",
    months: "Months",
    search: "Search",
    availableSublets: "Available sublets",
    subletsIn: "Sublets in",
    listingsCount: "listing(s)",
    failedToLoad: "Failed to load listings.",
    noListingsFound: "No listings found",
    tryDifferent: "Try choosing a different city or month.",
    viewListing: "View listing",
  },
  he: {
    slogan: "מצא את דירת הסאבלט הבאה שלך בפשטות ובמהירות.",
    letsStart: "בואו נתחיל!",
    city: "עיר",
    allCities: "כל הערים",
    months: "חודשים",
    search: "חיפוש",
    availableSublets: "סאבלטים זמינים",
    subletsIn: "סאבלטים ב",
    listingsCount: "מודעות",
    failedToLoad: "טעינת המודעות נכשלה.",
    noListingsFound: "לא נמצאו מודעות",
    tryDifferent: "נסה לבחור עיר או חודש אחרים.",
    viewListing: "לצפייה במודעה",
  },
} as const;