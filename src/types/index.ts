import type {
  User,
  MerchantProfile,
  Product,
  ProductVariant,
  VariantOption,
  Order,
  OrderItem,
  OrderEvent,
  Review,
  Address,
  SavedProduct,
  BankAccount,
  Transaction,
  Conversation,
  ConversationParticipant,
  Message,
  Notification,
  UserRole,
  ProductStatus,
  OrderStatus,
  NotifType,
  ProductCategory,
} from "@prisma/client";

export type {
  User,
  MerchantProfile,
  Product,
  ProductVariant,
  VariantOption,
  Order,
  OrderItem,
  OrderEvent,
  Review,
  Address,
  SavedProduct,
  BankAccount,
  Transaction,
  Conversation,
  ConversationParticipant,
  Message,
  Notification,
  UserRole,
  ProductStatus,
  OrderStatus,
  NotifType,
  ProductCategory,
};

export type ProductWithMerchant = Product & {
  merchant: MerchantProfile & {
    user: Pick<User, "id" | "name" | "avatar" | "faculty">;
  };
  _count?: { reviews: number; savedBy: number };
};

export type OrderWithDetails = Order & {
  buyer: Pick<User, "id" | "name" | "avatar" | "email">;
  merchant: MerchantProfile & {
    user: Pick<User, "id" | "name" | "avatar">;
  };
  items: (OrderItem & { product: Pick<Product, "id" | "title" | "images"> })[];
  timeline: OrderEvent[];
};

export type ReviewWithBuyer = Review & {
  buyer: Pick<User, "id" | "name" | "avatar">;
};

export type ConversationWithDetails = Conversation & {
  participants: (ConversationParticipant & {
    user: Pick<User, "id" | "name" | "avatar">;
  })[];
  messages: Message[];
};

export type MeilisearchProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  tags: string[];
  images: string[];
  stock: number;
  status: ProductStatus;
  isPerishable: boolean;
  expiresAt?: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  merchantId: string;
  merchantStoreName: string;
  merchantAvatar?: string;
  merchantVerified: boolean;
  createdAt: string;
};

export type CartItem = {
  id?: string;
  productId: string;
  title: string;
  image?: string;
  price: number;
  merchantId: string;
  merchantName?: string;
  quantity: number;
  stock: number;
  variantOptionId?: string;
  variantLabel?: string;
};

export type ActionResult<T = null> = {
  data?: T;
  error?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};
