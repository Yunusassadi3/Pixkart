export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  categoryType: "phone" | "audio" | "accessory" | "all";
  color: string;
  featured?: boolean;
}

export const brands: Brand[] = [
  // 1. Apple / iPhone
  { id: "apple", name: "Apple", slug: "apple", logo: "/logo/Apple.png", categoryType: "all", color: "#A8A8A8", featured: true },
  // 2. Samsung
  { id: "samsung", name: "Samsung", slug: "samsung", logo: "/logo/Samsung.png", categoryType: "all", color: "#1428A0", featured: true },
  // 3. Vivo
  { id: "vivo", name: "Vivo", slug: "vivo", logo: "/logo/vivo.png", categoryType: "all", color: "#415FFF", featured: true },
  // 4. OPPO
  { id: "oppo", name: "OPPO", slug: "oppo", logo: "/logo/oppo.png", categoryType: "all", color: "#008A5E", featured: true },
  // 5. Xiaomi
  { id: "xiaomi", name: "Xiaomi", slug: "xiaomi", logo: "/logo/Mi.png", categoryType: "all", color: "#FF6900", featured: true },
  // 6. Redmi
  { id: "redmi", name: "Redmi", slug: "redmi", logo: "/logo/Redmi.png", categoryType: "all", color: "#E50914", featured: true },
  // 7. POCO
  { id: "poco", name: "POCO", slug: "poco", logo: "/logo/Poco.png", categoryType: "all", color: "#FFD700", featured: true },
  // 8. Realme
  { id: "realme", name: "Realme", slug: "realme", logo: "/logo/Realme.png", categoryType: "all", color: "#FFC700", featured: true },
  // 9. Motorola
  { id: "motorola", name: "Motorola", slug: "motorola", logo: "/logo/Moto.png", categoryType: "all", color: "#00A3E0", featured: true },
  // 10. OnePlus
  { id: "oneplus", name: "OnePlus", slug: "oneplus", logo: "/logo/Oneplus.png", categoryType: "all", color: "#F5010C", featured: true },
  // 11. iQOO
  { id: "iqoo", name: "iQOO", slug: "iqoo", logo: "/logo/Iqoo.png", categoryType: "all", color: "#FF0033", featured: true },
  // 12. Nothing
  { id: "nothing", name: "Nothing", slug: "nothing", logo: "/logo/Nothing.png", categoryType: "all", color: "#FFFFFF", featured: true },
  // 13. Google Pixel
  { id: "google", name: "Google Pixel", slug: "google", logo: "/logo/Google pixel.png", categoryType: "all", color: "#4285F4", featured: true },
  // 14. Honor
  { id: "honor", name: "Honor", slug: "honor", logo: "/logo/Honor.png", categoryType: "all", color: "#00A4E4" },
  // 15. Tecno
  { id: "tecno", name: "Tecno", slug: "tecno", logo: "/logo/Tecno.png", categoryType: "all", color: "#0066FF" },
  // 16. Infinix
  { id: "infinix", name: "Infinix", slug: "infinix", logo: "/logo/Infinix.png", categoryType: "all", color: "#00E676" },
  // 17. itel
  { id: "itel", name: "itel", slug: "itel", logo: "/logo/Itel.png", categoryType: "all", color: "#FF002B" },
  // 18. Lava
  { id: "lava", name: "Lava", slug: "lava", logo: "/logo/Lava.png", categoryType: "all", color: "#FF3300" },
  // 19. HMD
  { id: "hmd", name: "HMD", slug: "hmd", logo: "/logo/HMD.png", categoryType: "all", color: "#124191" },
  // 20. Nokia
  { id: "nokia", name: "Nokia", slug: "nokia", logo: "/logo/Nokia.png", categoryType: "all", color: "#124191" },
  // 21. ASUS
  { id: "asus", name: "ASUS / ROG", slug: "asus", logo: "/logo/Asus Rog.png", categoryType: "all", color: "#FF0000" },
  // 22. Sony
  { id: "sony", name: "Sony Xperia", slug: "sony", logo: "/logo/Sony.png", categoryType: "all", color: "#000000" },
  // 23. Lenovo
  { id: "lenovo", name: "Lenovo", slug: "lenovo", logo: "/logo/Lenovo.png", categoryType: "all", color: "#E2231A" },
  // 24. ZTE
  { id: "zte", name: "ZTE", slug: "zte", logo: "/logo/ZTE.png", categoryType: "all", color: "#0066CC" },
  // 25. Nubia
  { id: "nubia", name: "Nubia", slug: "nubia", logo: "/logo/Nubia.png", categoryType: "all", color: "#E60012" },
  // 26. TCL
  { id: "tcl", name: "TCL", slug: "tcl", logo: "/logo/TCL.png", categoryType: "all", color: "#E20613" },
  // 27. Huawei
  { id: "huawei", name: "Huawei", slug: "huawei", logo: "/logo/Huawei.png", categoryType: "all", color: "#FF0000" },
  // 28. Jio
  { id: "jio", name: "Jio", slug: "jio", logo: "/logo/Jio.png", categoryType: "all", color: "#0A2885" },
  // 29. RedMagic
  { id: "redmagic", name: "RedMagic", slug: "redmagic", logo: "/logo/Redmagic.png", categoryType: "all", color: "#E60012" },

  // Audio & Accessory brands
  { id: "jbl", name: "JBL", slug: "jbl", logo: "/logo/JBL.png", categoryType: "audio", color: "#FF6600" },
  { id: "boat", name: "boAt", slug: "boat", logo: "/logo/Boat.png", categoryType: "audio", color: "#E50914" },
  { id: "noise", name: "Noise", slug: "noise", logo: "/logo/Noise.png", categoryType: "audio", color: "#00D2FF" },
  { id: "anker", name: "Anker", slug: "anker", logo: "/logo/Anker.png", categoryType: "accessory", color: "#00A3E0" },
  { id: "spigen", name: "Spigen", slug: "spigen", logo: "/logo/Spigen.png", categoryType: "accessory", color: "#FF5900" },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}
