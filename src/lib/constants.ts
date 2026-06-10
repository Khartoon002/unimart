import { ProductCategory } from "@prisma/client";

export const NIGERIAN_FACULTIES = [
  "Engineering",
  "Medicine & Surgery",
  "Law",
  "Business Administration",
  "Sciences",
  "Arts & Humanities",
  "Education",
  "Agricultural Sciences",
  "Pharmacy",
  "Social Sciences",
  "Computing & Informatics",
  "Architecture & Environmental Design",
  "Veterinary Medicine",
  "Economics",
  "Environmental Sciences",
  "Political Science",
  "Mass Communication",
];

export const NIGERIAN_HOSTELS = ["Boys Hostel", "Girls Hostel"];

export const NIGERIAN_BANKS: { code: string; name: string }[] = [
  { code: "058", name: "GTBank (Guaranty Trust Bank)" },
  { code: "044", name: "Access Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "070", name: "Fidelity Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "101", name: "ProvidusBank" },
  { code: "076", name: "Polaris Bank" },
  { code: "039", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "567", name: "Kuda Bank" },
  { code: "999992", name: "OPay" },
  { code: "999991", name: "PalmPay" },
  { code: "090115", name: "Moniepoint MFB" },
  { code: "090267", name: "Kuda Microfinance Bank" },
  { code: "000026", name: "Taj Bank" },
];

export const PRODUCT_CATEGORIES: {
  value: ProductCategory;
  label: string;
  icon: string;
}[] = [
  { value: "ELECTRONICS", label: "Electronics", icon: "Cpu" },
  { value: "BOOKS", label: "Books", icon: "BookOpen" },
  { value: "FASHION", label: "Fashion", icon: "Shirt" },
  { value: "FOOD", label: "Food", icon: "UtensilsCrossed" },
  { value: "SERVICES", label: "Services", icon: "Briefcase" },
  { value: "ART", label: "Art & Crafts", icon: "Palette" },
  { value: "BEAUTY", label: "Beauty", icon: "Sparkles" },
  { value: "SPORTS", label: "Sports", icon: "Dumbbell" },
  { value: "STATIONERY", label: "Stationery", icon: "PenTool" },
  { value: "OTHER", label: "Other", icon: "Package" },
];

export const PLATFORM_FEE_PERCENT = parseFloat(
  process.env.PLATFORM_FEE_PERCENT ?? "2.5"
);

export const ESCROW_RELEASE_HOURS = parseInt(
  process.env.ESCROW_RELEASE_HOURS ?? "48",
  10
);

export const MAX_PRODUCT_IMAGES = 8;
export const ITEMS_PER_PAGE = 24;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export const DELIVERY_FEE = 1000;
