import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    matricNumber: z.string().min(1, "Matric number is required"),
    faculty: z.string().min(1, "Faculty is required"),
    hostel: z.string().min(1, "Hostel is required"),
    wantsToSell: z.boolean().default(false),
    storeName: z.string().optional(),
    storeDescription: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createProductSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().max(5000).optional().nullable(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    compareAtPrice: z.coerce.number().positive().optional().nullable(),
    category: z.enum([
      "ELECTRONICS", "BOOKS", "FASHION", "FOOD", "SERVICES",
      "ART", "BEAUTY", "SPORTS", "STATIONERY", "OTHER",
    ]),
    tags: z.array(z.string()).max(10, "Maximum 10 tags").default([]),
    images: z.array(z.string().url()).max(8).default([]),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    sku: z.string().optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("DRAFT"),
    isPerishable: z.boolean().default(false),
    expiresAt: z.string().optional().nullable(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          options: z.array(
            z.object({
              label: z.string(),
              price: z.coerce.number().optional(),
              stock: z.coerce.number().int().min(0).default(0),
            })
          ),
        })
      )
      .optional(),
  })
  .refine(
    (d) => !d.isPerishable || (d.expiresAt && new Date(d.expiresAt) > new Date()),
    { message: "Expiry date must be in the future for perishable items", path: ["expiresAt"] }
  );

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
        variantOptionId: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  addressId: z.string().cuid("Invalid address"),
  deliveryNote: z.string().max(200).optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  orderId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
  images: z.array(z.string().url()).max(3).optional(),
});

export const sendMessageSchema = z
  .object({
    conversationId: z.string().optional(),
    recipientId: z.string().cuid().optional(),
    content: z.string().min(1, "Message cannot be empty").max(2000),
    productRefId: z.string().optional(),
  })
  .refine((d) => d.conversationId || d.recipientId, {
    message: "Either conversationId or recipientId is required",
  });

export const addAddressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  hostel: z.string().optional(),
  room: z.string().optional(),
  faculty: z.string().optional(),
  pickupPoint: z.string().optional(),
  note: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const addBankAccountSchema = z.object({
  bankCode: z.string().min(3),
  accountNumber: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().max(500).optional().nullable(),
  faculty: z.string().optional().nullable(),
  hostel: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  storeName: z.string().min(3).max(60).optional(),
  storeDescription: z.string().max(500).optional(),
  storeBanner: z.string().url().optional().nullable(),
});

export const onboardingBuyerSchema = z.object({
  faculty: z.string().min(1, "Faculty is required"),
  hostel: z.string().min(1, "Hostel is required"),
});

export const onboardingMerchantSchema = z.object({
  storeName: z
    .string()
    .min(3, "Store name must be at least 3 characters")
    .max(60)
    .regex(/^[a-zA-Z0-9 '\-]+$/, "Store name can only contain letters, numbers, spaces, hyphens and apostrophes"),
  storeDescription: z.string().max(500).optional(),
  faculty: z.string().min(1, "Faculty is required"),
  hostel: z.string().min(1, "Hostel is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
export type AddBankAccountInput = z.infer<typeof addBankAccountSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingBuyerInput = z.infer<typeof onboardingBuyerSchema>;
export type OnboardingMerchantInput = z.infer<typeof onboardingMerchantSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
