export interface PhoneModel {
  id: string;
  brandId: string;
  series: string;
  name: string;
  slug: string;
  releaseYear: number;
  displaySize?: string;
}

export const phoneModels: PhoneModel[] = [
  // ==========================================
  // APPLE (iPhones)
  // ==========================================
  { id: "iphone-16-pro-max", brandId: "apple", series: "iPhone 16 Series", name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", releaseYear: 2024, displaySize: "6.9\"" },
  { id: "iphone-16-pro", brandId: "apple", series: "iPhone 16 Series", name: "iPhone 16 Pro", slug: "iphone-16-pro", releaseYear: 2024, displaySize: "6.3\"" },
  { id: "iphone-16-plus", brandId: "apple", series: "iPhone 16 Series", name: "iPhone 16 Plus", slug: "iphone-16-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "iphone-16", brandId: "apple", series: "iPhone 16 Series", name: "iPhone 16", slug: "iphone-16", releaseYear: 2024, displaySize: "6.1\"" },

  { id: "iphone-15-pro-max", brandId: "apple", series: "iPhone 15 Series", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "iphone-15-pro", brandId: "apple", series: "iPhone 15 Series", name: "iPhone 15 Pro", slug: "iphone-15-pro", releaseYear: 2023, displaySize: "6.1\"" },
  { id: "iphone-15-plus", brandId: "apple", series: "iPhone 15 Series", name: "iPhone 15 Plus", slug: "iphone-15-plus", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "iphone-15", brandId: "apple", series: "iPhone 15 Series", name: "iPhone 15", slug: "iphone-15", releaseYear: 2023, displaySize: "6.1\"" },

  { id: "iphone-14-pro-max", brandId: "apple", series: "iPhone 14 Series", name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "iphone-14-pro", brandId: "apple", series: "iPhone 14 Series", name: "iPhone 14 Pro", slug: "iphone-14-pro", releaseYear: 2022, displaySize: "6.1\"" },
  { id: "iphone-14-plus", brandId: "apple", series: "iPhone 14 Series", name: "iPhone 14 Plus", slug: "iphone-14-plus", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "iphone-14", brandId: "apple", series: "iPhone 14 Series", name: "iPhone 14", slug: "iphone-14", releaseYear: 2022, displaySize: "6.1\"" },

  { id: "iphone-13-pro-max", brandId: "apple", series: "iPhone 13 Series", name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max", releaseYear: 2021, displaySize: "6.7\"" },
  { id: "iphone-13-pro", brandId: "apple", series: "iPhone 13 Series", name: "iPhone 13 Pro", slug: "iphone-13-pro", releaseYear: 2021, displaySize: "6.1\"" },
  { id: "iphone-13", brandId: "apple", series: "iPhone 13 Series", name: "iPhone 13", slug: "iphone-13", releaseYear: 2021, displaySize: "6.1\"" },
  { id: "iphone-13-mini", brandId: "apple", series: "iPhone 13 Series", name: "iPhone 13 Mini", slug: "iphone-13-mini", releaseYear: 2021, displaySize: "5.4\"" },

  { id: "iphone-12-pro-max", brandId: "apple", series: "iPhone 12 Series", name: "iPhone 12 Pro Max", slug: "iphone-12-pro-max", releaseYear: 2020, displaySize: "6.7\"" },
  { id: "iphone-12-pro", brandId: "apple", series: "iPhone 12 Series", name: "iPhone 12 Pro", slug: "iphone-12-pro", releaseYear: 2020, displaySize: "6.1\"" },
  { id: "iphone-12", brandId: "apple", series: "iPhone 12 Series", name: "iPhone 12", slug: "iphone-12", releaseYear: 2020, displaySize: "6.1\"" },
  { id: "iphone-12-mini", brandId: "apple", series: "iPhone 12 Series", name: "iPhone 12 Mini", slug: "iphone-12-mini", releaseYear: 2020, displaySize: "5.4\"" },

  { id: "iphone-11-pro-max", brandId: "apple", series: "iPhone 11 Series", name: "iPhone 11 Pro Max", slug: "iphone-11-pro-max", releaseYear: 2019, displaySize: "6.5\"" },
  { id: "iphone-11-pro", brandId: "apple", series: "iPhone 11 Series", name: "iPhone 11 Pro", slug: "iphone-11-pro", releaseYear: 2019, displaySize: "5.8\"" },
  { id: "iphone-11", brandId: "apple", series: "iPhone 11 Series", name: "iPhone 11", slug: "iphone-11", releaseYear: 2019, displaySize: "6.1\"" },

  { id: "iphone-se-2022", brandId: "apple", series: "iPhone SE Series", name: "iPhone SE (2022)", slug: "iphone-se-2022", releaseYear: 2022, displaySize: "4.7\"" },
  { id: "iphone-se-2020", brandId: "apple", series: "iPhone SE Series", name: "iPhone SE (2020)", slug: "iphone-se-2020", releaseYear: 2020, displaySize: "4.7\"" },

  { id: "iphone-xs-max", brandId: "apple", series: "iPhone X Series", name: "iPhone XS Max", slug: "iphone-xs-max", releaseYear: 2018, displaySize: "6.5\"" },
  { id: "iphone-xs", brandId: "apple", series: "iPhone X Series", name: "iPhone XS", slug: "iphone-xs", releaseYear: 2018, displaySize: "5.8\"" },
  { id: "iphone-xr", brandId: "apple", series: "iPhone X Series", name: "iPhone XR", slug: "iphone-xr", releaseYear: 2018, displaySize: "6.1\"" },
  { id: "iphone-x", brandId: "apple", series: "iPhone X Series", name: "iPhone X", slug: "iphone-x", releaseYear: 2017, displaySize: "5.8\"" },
  { id: "iphone-8-plus", brandId: "apple", series: "iPhone 8 Series", name: "iPhone 8 Plus", slug: "iphone-8-plus", releaseYear: 2017, displaySize: "5.5\"" },
  { id: "iphone-8", brandId: "apple", series: "iPhone 8 Series", name: "iPhone 8", slug: "iphone-8", releaseYear: 2017, displaySize: "4.7\"" },
  { id: "iphone-7-plus", brandId: "apple", series: "iPhone 7 Series", name: "iPhone 7 Plus", slug: "iphone-7-plus", releaseYear: 2016, displaySize: "5.5\"" },
  { id: "iphone-7", brandId: "apple", series: "iPhone 7 Series", name: "iPhone 7", slug: "iphone-7", releaseYear: 2016, displaySize: "4.7\"" },

  // ==========================================
  // SAMSUNG (Galaxy Series)
  // ==========================================
  // S25 Series
  { id: "galaxy-s25-ultra", brandId: "samsung", series: "Galaxy S25 Series", name: "Galaxy S25 Ultra", slug: "galaxy-s25-ultra", releaseYear: 2025, displaySize: "6.9\"" },
  { id: "galaxy-s25-plus", brandId: "samsung", series: "Galaxy S25 Series", name: "Galaxy S25+", slug: "galaxy-s25-plus", releaseYear: 2025, displaySize: "6.7\"" },
  { id: "galaxy-s25", brandId: "samsung", series: "Galaxy S25 Series", name: "Galaxy S25", slug: "galaxy-s25", releaseYear: 2025, displaySize: "6.2\"" },

  // S24 Series
  { id: "galaxy-s24-ultra", brandId: "samsung", series: "Galaxy S24 Series", name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "galaxy-s24-plus", brandId: "samsung", series: "Galaxy S24 Series", name: "Galaxy S24+", slug: "galaxy-s24-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "galaxy-s24", brandId: "samsung", series: "Galaxy S24 Series", name: "Galaxy S24", slug: "galaxy-s24", releaseYear: 2024, displaySize: "6.2\"" },
  { id: "galaxy-s24-fe", brandId: "samsung", series: "Galaxy S24 Series", name: "Galaxy S24 FE", slug: "galaxy-s24-fe", releaseYear: 2024, displaySize: "6.7\"" },
  // S23 Series
  { id: "galaxy-s23-ultra", brandId: "samsung", series: "Galaxy S23 Series", name: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra", releaseYear: 2023, displaySize: "6.8\"" },
  { id: "galaxy-s23-plus", brandId: "samsung", series: "Galaxy S23 Series", name: "Galaxy S23+", slug: "galaxy-s23-plus", releaseYear: 2023, displaySize: "6.6\"" },
  { id: "galaxy-s23", brandId: "samsung", series: "Galaxy S23 Series", name: "Galaxy S23", slug: "galaxy-s23", releaseYear: 2023, displaySize: "6.1\"" },
  { id: "galaxy-s23-fe", brandId: "samsung", series: "Galaxy S23 Series", name: "Galaxy S23 FE", slug: "galaxy-s23-fe", releaseYear: 2023, displaySize: "6.4\"" },
  // S22 Series
  { id: "galaxy-s22-ultra", brandId: "samsung", series: "Galaxy S22 Series", name: "Galaxy S22 Ultra", slug: "galaxy-s22-ultra", releaseYear: 2022, displaySize: "6.8\"" },
  { id: "galaxy-s22-plus", brandId: "samsung", series: "Galaxy S22 Series", name: "Galaxy S22+", slug: "galaxy-s22-plus", releaseYear: 2022, displaySize: "6.6\"" },
  { id: "galaxy-s22", brandId: "samsung", series: "Galaxy S22 Series", name: "Galaxy S22", slug: "galaxy-s22", releaseYear: 2022, displaySize: "6.1\"" },
  // S21 Series
  { id: "galaxy-s21-ultra", brandId: "samsung", series: "Galaxy S21 Series", name: "Galaxy S21 Ultra", slug: "galaxy-s21-ultra", releaseYear: 2021, displaySize: "6.8\"" },
  { id: "galaxy-s21-plus", brandId: "samsung", series: "Galaxy S21 Series", name: "Galaxy S21+", slug: "galaxy-s21-plus", releaseYear: 2021, displaySize: "6.7\"" },
  { id: "galaxy-s21", brandId: "samsung", series: "Galaxy S21 Series", name: "Galaxy S21", slug: "galaxy-s21", releaseYear: 2021, displaySize: "6.2\"" },
  { id: "galaxy-s21-fe", brandId: "samsung", series: "Galaxy S21 Series", name: "Galaxy S21 FE", slug: "galaxy-s21-fe", releaseYear: 2021, displaySize: "6.4\"" },
  // Z Fold/Flip
  { id: "galaxy-z-fold-6", brandId: "samsung", series: "Galaxy Foldables", name: "Galaxy Z Fold 6", slug: "galaxy-z-fold-6", releaseYear: 2024, displaySize: "7.6\"" },
  { id: "galaxy-z-flip-6", brandId: "samsung", series: "Galaxy Foldables", name: "Galaxy Z Flip 6", slug: "galaxy-z-flip-6", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "galaxy-z-fold-5", brandId: "samsung", series: "Galaxy Foldables", name: "Galaxy Z Fold 5", slug: "galaxy-z-fold-5", releaseYear: 2023, displaySize: "7.6\"" },
  { id: "galaxy-z-flip-5", brandId: "samsung", series: "Galaxy Foldables", name: "Galaxy Z Flip 5", slug: "galaxy-z-flip-5", releaseYear: 2023, displaySize: "6.7\"" },
  // A Series
  { id: "galaxy-a55", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A55 5G", slug: "galaxy-a55", releaseYear: 2024, displaySize: "6.6\"" },
  { id: "galaxy-a35", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A35 5G", slug: "galaxy-a35", releaseYear: 2024, displaySize: "6.6\"" },
  { id: "galaxy-a25", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A25 5G", slug: "galaxy-a25", releaseYear: 2023, displaySize: "6.5\"" },
  { id: "galaxy-a15", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A15 5G", slug: "galaxy-a15", releaseYear: 2023, displaySize: "6.5\"" },
  { id: "galaxy-a54", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A54 5G", slug: "galaxy-a54", releaseYear: 2023, displaySize: "6.4\"" },
  { id: "galaxy-a34", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A34 5G", slug: "galaxy-a34", releaseYear: 2023, displaySize: "6.6\"" },
  { id: "galaxy-a73", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A73 5G", slug: "galaxy-a73", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "galaxy-a53", brandId: "samsung", series: "Galaxy A Series", name: "Galaxy A53 5G", slug: "galaxy-a53", releaseYear: 2022, displaySize: "6.5\"" },
  // M / F Series
  { id: "galaxy-m55", brandId: "samsung", series: "Galaxy M Series", name: "Galaxy M55 5G", slug: "galaxy-m55", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "galaxy-m35", brandId: "samsung", series: "Galaxy M Series", name: "Galaxy M35 5G", slug: "galaxy-m35", releaseYear: 2024, displaySize: "6.6\"" },
  { id: "galaxy-f55", brandId: "samsung", series: "Galaxy F Series", name: "Galaxy F55 5G", slug: "galaxy-f55", releaseYear: 2024, displaySize: "6.7\"" },

  // ==========================================
  // ONEPLUS
  // ==========================================
  { id: "oneplus-13", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 13", slug: "oneplus-13", releaseYear: 2025, displaySize: "6.82\"" },
  { id: "oneplus-12", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 12", slug: "oneplus-12", releaseYear: 2024, displaySize: "6.82\"" },
  { id: "oneplus-12r", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 12R", slug: "oneplus-12r", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "oneplus-11", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 11", slug: "oneplus-11", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "oneplus-11r", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 11R", slug: "oneplus-11r", releaseYear: 2023, displaySize: "6.74\"" },
  { id: "oneplus-10-pro", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 10 Pro", slug: "oneplus-10-pro", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "oneplus-10t", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 10T", slug: "oneplus-10t", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "oneplus-9-pro", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 9 Pro", slug: "oneplus-9-pro", releaseYear: 2021, displaySize: "6.7\"" },
  { id: "oneplus-9", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 9", slug: "oneplus-9", releaseYear: 2021, displaySize: "6.55\"" },
  { id: "oneplus-9r", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 9R", slug: "oneplus-9r", releaseYear: 2021, displaySize: "6.55\"" },
  { id: "oneplus-8-pro", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 8 Pro", slug: "oneplus-8-pro", releaseYear: 2020, displaySize: "6.78\"" },
  { id: "oneplus-8", brandId: "oneplus", series: "OnePlus Series", name: "OnePlus 8", slug: "oneplus-8", releaseYear: 2020, displaySize: "6.55\"" },
  // Nord Series
  { id: "oneplus-nord-4", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord 4", slug: "oneplus-nord-4", releaseYear: 2024, displaySize: "6.74\"" },
  { id: "oneplus-nord-3", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord 3", slug: "oneplus-nord-3", releaseYear: 2023, displaySize: "6.74\"" },
  { id: "oneplus-nord-ce4", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord CE4", slug: "oneplus-nord-ce4", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oneplus-nord-ce4-lite", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord CE4 Lite", slug: "oneplus-nord-ce4-lite", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "oneplus-nord-ce3-lite", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord CE 3 Lite", slug: "oneplus-nord-ce3-lite", releaseYear: 2023, displaySize: "6.72\"" },
  { id: "oneplus-nord-2t", brandId: "oneplus", series: "OnePlus Nord Series", name: "OnePlus Nord 2T", slug: "oneplus-nord-2t", releaseYear: 2022, displaySize: "6.43\"" },
  { id: "oneplus-open", brandId: "oneplus", series: "OnePlus Foldables", name: "OnePlus Open", slug: "oneplus-open", releaseYear: 2023, displaySize: "7.82\"" },

  // ==========================================
  // GOOGLE PIXEL
  // ==========================================
  // Pixel 10 Series
  { id: "pixel-10-pro-xl", brandId: "google", series: "Pixel 10 Series", name: "Google Pixel 10 Pro XL", slug: "pixel-10-pro-xl", releaseYear: 2025, displaySize: "6.8\"" },
  { id: "pixel-10-pro", brandId: "google", series: "Pixel 10 Series", name: "Google Pixel 10 Pro", slug: "pixel-10-pro", releaseYear: 2025, displaySize: "6.3\"" },
  { id: "pixel-10", brandId: "google", series: "Pixel 10 Series", name: "Google Pixel 10", slug: "pixel-10", releaseYear: 2025, displaySize: "6.3\"" },
  { id: "pixel-10-pro-fold", brandId: "google", series: "Pixel 10 Series", name: "Google Pixel 10 Pro Fold", slug: "pixel-10-pro-fold", releaseYear: 2025, displaySize: "8.0\"" },
  // Pixel 9 Series
  { id: "pixel-9-pro-xl", brandId: "google", series: "Pixel 9 Series", name: "Google Pixel 9 Pro XL", slug: "pixel-9-pro-xl", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "pixel-9-pro", brandId: "google", series: "Pixel 9 Series", name: "Google Pixel 9 Pro", slug: "pixel-9-pro", releaseYear: 2024, displaySize: "6.3\"" },
  { id: "pixel-9", brandId: "google", series: "Pixel 9 Series", name: "Google Pixel 9", slug: "pixel-9", releaseYear: 2024, displaySize: "6.3\"" },
  { id: "pixel-9-pro-fold", brandId: "google", series: "Pixel 9 Series", name: "Google Pixel 9 Pro Fold", slug: "pixel-9-pro-fold", releaseYear: 2024, displaySize: "8.0\"" },
  // Pixel 8 Series
  { id: "pixel-8-pro", brandId: "google", series: "Pixel 8 Series", name: "Google Pixel 8 Pro", slug: "pixel-8-pro", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "pixel-8", brandId: "google", series: "Pixel 8 Series", name: "Google Pixel 8", slug: "pixel-8", releaseYear: 2023, displaySize: "6.2\"" },
  { id: "pixel-8a", brandId: "google", series: "Pixel 8 Series", name: "Google Pixel 8a", slug: "pixel-8a", releaseYear: 2024, displaySize: "6.1\"" },
  // Pixel 7 Series
  { id: "pixel-7-pro", brandId: "google", series: "Pixel 7 Series", name: "Google Pixel 7 Pro", slug: "pixel-7-pro", releaseYear: 2022, displaySize: "6.7\"" },
  { id: "pixel-7", brandId: "google", series: "Pixel 7 Series", name: "Google Pixel 7", slug: "pixel-7", releaseYear: 2022, displaySize: "6.3\"" },
  { id: "pixel-7a", brandId: "google", series: "Pixel 7 Series", name: "Google Pixel 7a", slug: "pixel-7a", releaseYear: 2023, displaySize: "6.1\"" },
  // Pixel 6 Series
  { id: "pixel-6-pro", brandId: "google", series: "Pixel 6 Series", name: "Google Pixel 6 Pro", slug: "pixel-6-pro", releaseYear: 2021, displaySize: "6.7\"" },
  { id: "pixel-6", brandId: "google", series: "Pixel 6 Series", name: "Google Pixel 6", slug: "pixel-6", releaseYear: 2021, displaySize: "6.4\"" },
  { id: "pixel-6a", brandId: "google", series: "Pixel 6 Series", name: "Google Pixel 6a", slug: "pixel-6a", releaseYear: 2022, displaySize: "6.1\"" },

  // ==========================================
  // XIAOMI (Xiaomi, Redmi, POCO)
  // ==========================================
  // Flagships
  { id: "xiaomi-14-ultra", brandId: "xiaomi", series: "Xiaomi Series", name: "Xiaomi 14 Ultra", slug: "xiaomi-14-ultra", releaseYear: 2024, displaySize: "6.73\"" },
  { id: "xiaomi-14", brandId: "xiaomi", series: "Xiaomi Series", name: "Xiaomi 14", slug: "xiaomi-14", releaseYear: 2024, displaySize: "6.36\"" },
  { id: "xiaomi-13-ultra", brandId: "xiaomi", series: "Xiaomi Series", name: "Xiaomi 13 Ultra", slug: "xiaomi-13-ultra", releaseYear: 2023, displaySize: "6.73\"" },
  { id: "xiaomi-13-pro", brandId: "xiaomi", series: "Xiaomi Series", name: "Xiaomi 13 Pro", slug: "xiaomi-13-pro", releaseYear: 2023, displaySize: "6.73\"" },
  { id: "xiaomi-12-pro", brandId: "xiaomi", series: "Xiaomi Series", name: "Xiaomi 12 Pro", slug: "xiaomi-12-pro", releaseYear: 2022, displaySize: "6.73\"" },
  // Redmi Note 13 Series
  { id: "redmi-note-13-pro-plus", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13 Pro+", slug: "redmi-note-13-pro-plus", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "redmi-note-13-pro", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13 Pro", slug: "redmi-note-13-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "redmi-note-13", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13", slug: "redmi-note-13", releaseYear: 2024, displaySize: "6.67\"" },
  // Redmi Note 12 Series
  { id: "redmi-note-12-pro-plus", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 12 Pro+", slug: "redmi-note-12-pro-plus", releaseYear: 2023, displaySize: "6.67\"" },
  { id: "redmi-note-12-pro", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 12 Pro", slug: "redmi-note-12-pro", releaseYear: 2023, displaySize: "6.67\"" },
  { id: "redmi-note-12", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 12", slug: "redmi-note-12", releaseYear: 2023, displaySize: "6.67\"" },
  // POCO Series
  { id: "poco-f6-pro", brandId: "poco", series: "POCO Series", name: "POCO F6 Pro", slug: "poco-f6-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-f6", brandId: "poco", series: "POCO Series", name: "POCO F6", slug: "poco-f6", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-x6-pro", brandId: "poco", series: "POCO Series", name: "POCO X6 Pro", slug: "poco-x6-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-x6", brandId: "poco", series: "POCO Series", name: "POCO X6", slug: "poco-x6", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-f5", brandId: "poco", series: "POCO Series", name: "POCO F5", slug: "poco-f5", releaseYear: 2023, displaySize: "6.67\"" },

  // ==========================================
  // VIVO
  // ==========================================
  // X Series
  { id: "vivo-x100-ultra", brandId: "vivo", series: "Vivo X Series", name: "Vivo X100 Ultra", slug: "vivo-x100-ultra", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-x100-pro", brandId: "vivo", series: "Vivo X Series", name: "Vivo X100 Pro", slug: "vivo-x100-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-x100", brandId: "vivo", series: "Vivo X Series", name: "Vivo X100", slug: "vivo-x100", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-x90-pro", brandId: "vivo", series: "Vivo X Series", name: "Vivo X90 Pro", slug: "vivo-x90-pro", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "vivo-x80-pro", brandId: "vivo", series: "Vivo X Series", name: "Vivo X80 Pro", slug: "vivo-x80-pro", releaseYear: 2022, displaySize: "6.78\"" },
  // V Series
  { id: "vivo-v40-pro", brandId: "vivo", series: "Vivo V Series", name: "Vivo V40 Pro", slug: "vivo-v40-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-v40", brandId: "vivo", series: "Vivo V Series", name: "Vivo V40", slug: "vivo-v40", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-v30-pro", brandId: "vivo", series: "Vivo V Series", name: "Vivo V30 Pro", slug: "vivo-v30-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-v30", brandId: "vivo", series: "Vivo V Series", name: "Vivo V30", slug: "vivo-v30", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-v30e", brandId: "vivo", series: "Vivo V Series", name: "Vivo V30e", slug: "vivo-v30e", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "vivo-v29-pro", brandId: "vivo", series: "Vivo V Series", name: "Vivo V29 Pro", slug: "vivo-v29-pro", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "vivo-v29", brandId: "vivo", series: "Vivo V Series", name: "Vivo V29", slug: "vivo-v29", releaseYear: 2023, displaySize: "6.78\"" },
  // T Series
  { id: "vivo-t3-pro", brandId: "vivo", series: "Vivo T Series", name: "Vivo T3 Pro 5G", slug: "vivo-t3-pro", releaseYear: 2024, displaySize: "6.77\"" },
  { id: "vivo-t3", brandId: "vivo", series: "Vivo T Series", name: "Vivo T3 5G", slug: "vivo-t3", releaseYear: 2024, displaySize: "6.67\"" },

  // ==========================================
  // OPPO
  // ==========================================
  // ==========================================
  // OPPO
  // ==========================================
  // Find Series
  { id: "oppo-find-x9-pro", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X9 Pro", slug: "oppo-find-x9-pro", releaseYear: 2025, displaySize: "6.82\"" },
  { id: "oppo-find-x9", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X9", slug: "oppo-find-x9", releaseYear: 2025, displaySize: "6.78\"" },
  { id: "oppo-find-x8-pro", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X8 Pro", slug: "oppo-find-x8-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "oppo-find-x8", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X8", slug: "oppo-find-x8", releaseYear: 2024, displaySize: "6.59\"" },
  { id: "oppo-find-x7-ultra", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X7 Ultra", slug: "oppo-find-x7-ultra", releaseYear: 2024, displaySize: "6.82\"" },
  { id: "oppo-find-x6-pro", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find X6 Pro", slug: "oppo-find-x6-pro", releaseYear: 2023, displaySize: "6.82\"" },
  { id: "oppo-find-n3-flip", brandId: "oppo", series: "Oppo Find Series", name: "Oppo Find N3 Flip", slug: "oppo-find-n3-flip", releaseYear: 2023, displaySize: "6.8\"" },
  // Reno Series
  { id: "oppo-reno-12-pro", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 12 Pro", slug: "oppo-reno-12-pro", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oppo-reno-12", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 12", slug: "oppo-reno-12", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oppo-reno-11-pro", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 11 Pro", slug: "oppo-reno-11-pro", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oppo-reno-11", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 11", slug: "oppo-reno-11", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oppo-reno-10-pro-plus", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 10 Pro+", slug: "oppo-reno-10-pro-plus", releaseYear: 2023, displaySize: "6.74\"" },
  { id: "oppo-reno-10-pro", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 10 Pro", slug: "oppo-reno-10-pro", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "oppo-reno-8-pro", brandId: "oppo", series: "Oppo Reno Series", name: "Oppo Reno 8 Pro", slug: "oppo-reno-8-pro", releaseYear: 2022, displaySize: "6.7\"" },
  // F Series
  { id: "oppo-f27-pro-plus", brandId: "oppo", series: "Oppo F Series", name: "Oppo F27 Pro+", slug: "oppo-f27-pro-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "oppo-f25-pro", brandId: "oppo", series: "Oppo F Series", name: "Oppo F25 Pro", slug: "oppo-f25-pro", releaseYear: 2024, displaySize: "6.7\"" },

  // ==========================================
  // REALME
  // ==========================================
  // GT Series
  { id: "realme-gt-6", brandId: "realme", series: "Realme GT Series", name: "Realme GT 6", slug: "realme-gt-6", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "realme-gt-6t", brandId: "realme", series: "Realme GT Series", name: "Realme GT 6T", slug: "realme-gt-6t", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "realme-gt-neo-6-se", brandId: "realme", series: "Realme GT Series", name: "Realme GT Neo 6 SE", slug: "realme-gt-neo-6-se", releaseYear: 2024, displaySize: "6.78\"" },
  // Number Series
  { id: "realme-13-pro-plus", brandId: "realme", series: "Realme Number Series", name: "Realme 13 Pro+", slug: "realme-13-pro-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "realme-13-pro", brandId: "realme", series: "Realme Number Series", name: "Realme 13 Pro", slug: "realme-13-pro", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "realme-12-pro-plus", brandId: "realme", series: "Realme Number Series", name: "Realme 12 Pro+", slug: "realme-12-pro-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "realme-12-pro", brandId: "realme", series: "Realme Number Series", name: "Realme 12 Pro", slug: "realme-12-pro", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "realme-11-pro-plus", brandId: "realme", series: "Realme Number Series", name: "Realme 11 Pro+", slug: "realme-11-pro-plus", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "realme-11-pro", brandId: "realme", series: "Realme Number Series", name: "Realme 11 Pro", slug: "realme-11-pro", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "realme-10-pro-plus", brandId: "realme", series: "Realme Number Series", name: "Realme 10 Pro+", slug: "realme-10-pro-plus", releaseYear: 2022, displaySize: "6.7\"" },
  // C Series
  { id: "realme-c67", brandId: "realme", series: "Realme C Series", name: "Realme C67 5G", slug: "realme-c67", releaseYear: 2023, displaySize: "6.72\"" },
  { id: "realme-c55", brandId: "realme", series: "Realme C Series", name: "Realme C55", slug: "realme-c55", releaseYear: 2023, displaySize: "6.72\"" },

  // ==========================================
  // NOTHING
  // ==========================================
  { id: "nothing-phone-1", brandId: "nothing", series: "Nothing Series", name: "Nothing Phone (1)", slug: "nothing-phone-1", releaseYear: 2022, displaySize: "6.55\"" },
  { id: "nothing-phone-2", brandId: "nothing", series: "Nothing Series", name: "Nothing Phone (2)", slug: "nothing-phone-2", releaseYear: 2023, displaySize: "6.7\"" },
  { id: "nothing-phone-2a", brandId: "nothing", series: "Nothing Series", name: "Nothing Phone (2a)", slug: "nothing-phone-2a", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "nothing-phone-2a-plus", brandId: "nothing", series: "Nothing Series", name: "Nothing Phone (2a) Plus", slug: "nothing-phone-2a-plus", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "cmf-phone-1", brandId: "nothing", series: "Nothing Series", name: "CMF Phone 1 by Nothing", slug: "cmf-phone-1", releaseYear: 2024, displaySize: "6.67\"" },

  // ==========================================
  // MOTOROLA
  // ==========================================
  // Edge Series
  { id: "moto-edge-50-ultra", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 50 Ultra", slug: "moto-edge-50-ultra", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "moto-edge-50-pro", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 50 Pro", slug: "moto-edge-50-pro", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "moto-edge-50-fusion", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 50 Fusion", slug: "moto-edge-50-fusion", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "moto-edge-40-pro", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 40 Pro", slug: "moto-edge-40-pro", releaseYear: 2023, displaySize: "6.67\"" },
  { id: "moto-edge-40", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 40", slug: "moto-edge-40", releaseYear: 2023, displaySize: "6.55\"" },
  { id: "moto-edge-40-neo", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 40 Neo", slug: "moto-edge-40-neo", releaseYear: 2023, displaySize: "6.55\"" },
  { id: "moto-edge-30-ultra", brandId: "motorola", series: "Moto Edge Series", name: "Motorola Edge 30 Ultra", slug: "moto-edge-30-ultra", releaseYear: 2022, displaySize: "6.67\"" },
  // G Series
  { id: "moto-g85", brandId: "motorola", series: "Moto G Series", name: "Motorola Moto G85 5G", slug: "moto-g85", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "moto-g64", brandId: "motorola", series: "Moto G Series", name: "Motorola Moto G64 5G", slug: "moto-g64", releaseYear: 2024, displaySize: "6.5\"" },
  { id: "moto-g54", brandId: "motorola", series: "Moto G Series", name: "Motorola Moto G54 5G", slug: "moto-g54", releaseYear: 2023, displaySize: "6.5\"" },
  { id: "moto-g84", brandId: "motorola", series: "Moto G Series", name: "Motorola Moto G84 5G", slug: "moto-g84", releaseYear: 2023, displaySize: "6.5\"" },
  // Razr Foldables
  { id: "moto-razr-50-ultra", brandId: "motorola", series: "Moto Razr Series", name: "Motorola Razr 50 Ultra", slug: "moto-razr-50-ultra", releaseYear: 2024, displaySize: "6.9\"" },
  { id: "moto-razr-40-ultra", brandId: "motorola", series: "Moto Razr Series", name: "Motorola Razr 40 Ultra", slug: "moto-razr-40-ultra", releaseYear: 2023, displaySize: "6.9\"" },

  // ==========================================
  // iQOO
  // ==========================================
  { id: "iqoo-12-5g", brandId: "iqoo", series: "iQOO Flagship Series", name: "iQOO 12 5G", slug: "iqoo-12-5g", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "iqoo-neo-9-pro", brandId: "iqoo", series: "iQOO Neo Series", name: "iQOO Neo 9 Pro 5G", slug: "iqoo-neo-9-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "iqoo-neo-7-pro", brandId: "iqoo", series: "iQOO Neo Series", name: "iQOO Neo 7 Pro 5G", slug: "iqoo-neo-7-pro", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "iqoo-z9-5g", brandId: "iqoo", series: "iQOO Z Series", name: "iQOO Z9 5G", slug: "iqoo-z9-5g", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "iqoo-z9x-5g", brandId: "iqoo", series: "iQOO Z Series", name: "iQOO Z9x 5G", slug: "iqoo-z9x-5g", releaseYear: 2024, displaySize: "6.72\"" },
  { id: "iqoo-z7-pro-5g", brandId: "iqoo", series: "iQOO Z Series", name: "iQOO Z7 Pro 5G", slug: "iqoo-z7-pro-5g", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "iqoo-9-pro-5g", brandId: "iqoo", series: "iQOO Flagship Series", name: "iQOO 9 Pro 5G", slug: "iqoo-9-pro-5g", releaseYear: 2022, displaySize: "6.78\"" },

  // ==========================================
  // INFINIX
  // ==========================================
  { id: "infinix-gt-20-pro", brandId: "infinix", series: "Infinix GT Series", name: "Infinix GT 20 Pro 5G", slug: "infinix-gt-20-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "infinix-gt-10-pro", brandId: "infinix", series: "Infinix GT Series", name: "Infinix GT 10 Pro 5G", slug: "infinix-gt-10-pro", releaseYear: 2023, displaySize: "6.67\"" },
  { id: "infinix-note-40-pro-plus", brandId: "infinix", series: "Infinix Note Series", name: "Infinix Note 40 Pro+ 5G", slug: "infinix-note-40-pro-plus", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "infinix-zero-30-5g", brandId: "infinix", series: "Infinix Zero Series", name: "Infinix Zero 30 5G", slug: "infinix-zero-30-5g", releaseYear: 2023, displaySize: "6.78\"" },

  // ==========================================
  // TECNO
  // ==========================================
  { id: "tecno-camon-30-premier", brandId: "tecno", series: "Tecno Camon Series", name: "Tecno Camon 30 Premier 5G", slug: "tecno-camon-30-premier", releaseYear: 2024, displaySize: "6.77\"" },
  { id: "tecno-camon-30-5g", brandId: "tecno", series: "Tecno Camon Series", name: "Tecno Camon 30 5G", slug: "tecno-camon-30-5g", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "tecno-phantom-v-fold", brandId: "tecno", series: "Tecno Phantom Series", name: "Tecno Phantom V Fold", slug: "tecno-phantom-v-fold", releaseYear: 2023, displaySize: "7.85\"" },
  { id: "tecno-pova-6-pro", brandId: "tecno", series: "Tecno Pova Series", name: "Tecno Pova 6 Pro 5G", slug: "tecno-pova-6-pro", releaseYear: 2024, displaySize: "6.78\"" },

  // ==========================================
  // HONOR
  // ==========================================
  { id: "honor-magic-6-pro", brandId: "honor", series: "Honor Magic Series", name: "Honor Magic 6 Pro", slug: "honor-magic-6-pro", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "honor-200-pro", brandId: "honor", series: "Honor Number Series", name: "Honor 200 Pro 5G", slug: "honor-200-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "honor-200-5g", brandId: "honor", series: "Honor Number Series", name: "Honor 200 5G", slug: "honor-200-5g", releaseYear: 2024, displaySize: "6.7\"" },
  { id: "honor-90-5g", brandId: "honor", series: "Honor Number Series", name: "Honor 90 5G", slug: "honor-90-5g", releaseYear: 2023, displaySize: "6.7\"" },

  // ==========================================
  // ASUS / ROG
  // ==========================================
  { id: "asus-rog-phone-8-pro", brandId: "asus", series: "ASUS ROG Series", name: "ASUS ROG Phone 8 Pro", slug: "asus-rog-phone-8-pro", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "asus-rog-phone-8", brandId: "asus", series: "ASUS ROG Series", name: "ASUS ROG Phone 8", slug: "asus-rog-phone-8", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "asus-rog-phone-7", brandId: "asus", series: "ASUS ROG Series", name: "ASUS ROG Phone 7", slug: "asus-rog-phone-7", releaseYear: 2023, displaySize: "6.78\"" },

  // ==========================================
  // LAVA
  // ==========================================
  { id: "lava-agni-2-5g", brandId: "lava", series: "Lava Agni Series", name: "Lava Agni 2 5G", slug: "lava-agni-2-5g", releaseYear: 2023, displaySize: "6.78\"" },
  { id: "lava-blaze-curve-5g", brandId: "lava", series: "Lava Blaze Series", name: "Lava Blaze Curve 5G", slug: "lava-blaze-curve-5g", releaseYear: 2024, displaySize: "6.67\"" },

  // ==========================================
  // NOKIA / HMD
  // ==========================================
  { id: "hmd-skyline", brandId: "nokia", series: "HMD Series", name: "HMD Skyline 5G", slug: "hmd-skyline", releaseYear: 2024, displaySize: "6.55\"" },
  { id: "nokia-g42-5g", brandId: "nokia", series: "Nokia G Series", name: "Nokia G42 5G", slug: "nokia-g42-5g", releaseYear: 2023, displaySize: "6.56\"" },

  // ==========================================
  // REDMI
  // ==========================================
  { id: "redmi-note-14-pro-plus", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 14 Pro+", slug: "redmi-note-14-pro-plus", releaseYear: 2025, displaySize: "6.67\"" },
  { id: "redmi-note-14-pro", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 14 Pro", slug: "redmi-note-14-pro", releaseYear: 2025, displaySize: "6.67\"" },
  { id: "redmi-note-14-5g", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 14 5G", slug: "redmi-note-14-5g", releaseYear: 2025, displaySize: "6.67\"" },
  { id: "redmi-note-13-pro-plus", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13 Pro+", slug: "redmi-note-13-pro-plus", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "redmi-note-13-pro", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13 Pro", slug: "redmi-note-13-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "redmi-note-13-5g", brandId: "redmi", series: "Redmi Note Series", name: "Redmi Note 13 5G", slug: "redmi-note-13-5g", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "redmi-13-5g", brandId: "redmi", series: "Redmi Series", name: "Redmi 13 5G", slug: "redmi-13-5g", releaseYear: 2024, displaySize: "6.79\"" },
  { id: "redmi-12-5g", brandId: "redmi", series: "Redmi Series", name: "Redmi 12 5G", slug: "redmi-12-5g", releaseYear: 2023, displaySize: "6.79\"" },

  // ==========================================
  // POCO
  // ==========================================
  { id: "poco-f6-pro", brandId: "poco", series: "POCO F Series", name: "POCO F6 Pro", slug: "poco-f6-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-f6", brandId: "poco", series: "POCO F Series", name: "POCO F6 5G", slug: "poco-f6", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-x6-pro", brandId: "poco", series: "POCO X Series", name: "POCO X6 Pro 5G", slug: "poco-x6-pro", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-x6", brandId: "poco", series: "POCO X Series", name: "POCO X6 5G", slug: "poco-x6", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "poco-m6-pro-5g", brandId: "poco", series: "POCO M Series", name: "POCO M6 Pro 5G", slug: "poco-m6-pro-5g", releaseYear: 2023, displaySize: "6.79\"" },
  { id: "poco-c65", brandId: "poco", series: "POCO C Series", name: "POCO C65", slug: "poco-c65", releaseYear: 2023, displaySize: "6.74\"" },

  // ==========================================
  // ITEL
  // ==========================================
  { id: "itel-color-pro-5g", brandId: "itel", series: "itel Color Pro Series", name: "itel Color Pro 5G", slug: "itel-color-pro-5g", releaseYear: 2024, displaySize: "6.6\"" },
  { id: "itel-p55-plus", brandId: "itel", series: "itel P Series", name: "itel P55+ 5G", slug: "itel-p55-plus", releaseYear: 2024, displaySize: "6.6\"" },
  { id: "itel-s24", brandId: "itel", series: "itel S Series", name: "itel S24", slug: "itel-s24", releaseYear: 2024, displaySize: "6.6\"" },

  // ==========================================
  // HMD
  // ==========================================
  { id: "hmd-skyline-pro", brandId: "hmd", series: "HMD Skyline Series", name: "HMD Skyline 5G", slug: "hmd-skyline-pro", releaseYear: 2024, displaySize: "6.55\"" },
  { id: "hmd-crest-max", brandId: "hmd", series: "HMD Crest Series", name: "HMD Crest Max 5G", slug: "hmd-crest-max", releaseYear: 2024, displaySize: "6.67\"" },
  { id: "hmd-pulse-pro", brandId: "hmd", series: "HMD Pulse Series", name: "HMD Pulse Pro", slug: "hmd-pulse-pro", releaseYear: 2024, displaySize: "6.65\"" },

  // ==========================================
  // LENOVO
  // ==========================================
  { id: "lenovo-legion-y70", brandId: "lenovo", series: "Lenovo Legion Series", name: "Lenovo Legion Y70", slug: "lenovo-legion-y70", releaseYear: 2022, displaySize: "6.67\"" },
  { id: "lenovo-legion-duel-2", brandId: "lenovo", series: "Lenovo Legion Series", name: "Lenovo Legion Phone Duel 2", slug: "lenovo-legion-duel-2", releaseYear: 2021, displaySize: "6.92\"" },

  // ==========================================
  // ZTE & NUBIA & REDMAGIC
  // ==========================================
  { id: "zte-axon-50-ultra", brandId: "zte", series: "ZTE Axon Series", name: "ZTE Axon 50 Ultra", slug: "zte-axon-50-ultra", releaseYear: 2023, displaySize: "6.67\"" },
  { id: "nubia-z60-ultra", brandId: "nubia", series: "Nubia Z Series", name: "Nubia Z60 Ultra", slug: "nubia-z60-ultra", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "nubia-flip-5g", brandId: "nubia", series: "Nubia Flip Series", name: "Nubia Flip 5G", slug: "nubia-flip-5g", releaseYear: 2024, displaySize: "6.9\"" },
  { id: "redmagic-9-pro-plus", brandId: "redmagic", series: "RedMagic 9 Series", name: "RedMagic 9 Pro+", slug: "redmagic-9-pro-plus", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "redmagic-9-pro", brandId: "redmagic", series: "RedMagic 9 Series", name: "RedMagic 9 Pro", slug: "redmagic-9-pro", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "redmagic-8s-pro", brandId: "redmagic", series: "RedMagic 8 Series", name: "RedMagic 8S Pro", slug: "redmagic-8s-pro", releaseYear: 2023, displaySize: "6.8\"" },

  // ==========================================
  // TCL
  // ==========================================
  { id: "tcl-50-xl-5g", brandId: "tcl", series: "TCL 50 Series", name: "TCL 50 XL 5G", slug: "tcl-50-xl-5g", releaseYear: 2024, displaySize: "6.78\"" },
  { id: "tcl-40-nxtpaper", brandId: "tcl", series: "TCL NxtPaper Series", name: "TCL 40 NxtPaper 5G", slug: "tcl-40-nxtpaper", releaseYear: 2023, displaySize: "6.6\"" },

  // ==========================================
  // HUAWEI
  // ==========================================
  { id: "huawei-pura-70-ultra", brandId: "huawei", series: "Huawei Pura Series", name: "Huawei Pura 70 Ultra", slug: "huawei-pura-70-ultra", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "huawei-pura-70-pro", brandId: "huawei", series: "Huawei Pura Series", name: "Huawei Pura 70 Pro", slug: "huawei-pura-70-pro", releaseYear: 2024, displaySize: "6.8\"" },
  { id: "huawei-mate-60-pro", brandId: "huawei", series: "Huawei Mate Series", name: "Huawei Mate 60 Pro", slug: "huawei-mate-60-pro", releaseYear: 2023, displaySize: "6.82\"" },
  { id: "huawei-mate-x5", brandId: "huawei", series: "Huawei Foldables", name: "Huawei Mate X5 Foldable", slug: "huawei-mate-x5", releaseYear: 2023, displaySize: "7.85\"" },

  // ==========================================
  // JIO
  // ==========================================
  { id: "jiophone-next", brandId: "jio", series: "JioPhone Series", name: "JioPhone Next 4G", slug: "jiophone-next", releaseYear: 2021, displaySize: "5.45\"" },
  { id: "jiophone-prima", brandId: "jio", series: "JioPhone Series", name: "JioPhone Prima 4G", slug: "jiophone-prima", releaseYear: 2023, displaySize: "2.4\"" },
];

export function getModelsByBrand(brandId: string): PhoneModel[] {
  return phoneModels.filter((m) => m.brandId === brandId);
}

export function getSeriesByBrand(brandId: string): string[] {
  const models = getModelsByBrand(brandId);
  return [...new Set(models.map((m) => m.series))];
}

export function getModelsBySeries(brandId: string, series: string): PhoneModel[] {
  return phoneModels.filter((m) => m.brandId === brandId && m.series === series);
}

export function getModelBySlug(slug: string): PhoneModel | undefined {
  return phoneModels.find((m) => m.slug === slug);
}
