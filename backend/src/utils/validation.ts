import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),

  role: z.enum(["BUYER", "SUPPLIER"]),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password must be at most 100 characters"),
});

export const createRFQSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),

  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  deliveryLocation: z
    .string()
    .trim()
    .min(2, "Delivery location is required")
    .max(300, "Delivery location must be at most 300 characters"),

  deadline: z
    .string()
    .datetime("Invalid deadline"),
});

export const createQuotationSchema = z.object({
  rfqId: z
    .string()
    .min(1, "RFQ ID is required"),

  quotedPrice: z
    .number()
    .positive("Quoted price must be greater than 0")
    .finite("Quoted price must be a valid number"),

  estimatedDeliveryTime: z
    .string()
    .trim()
    .min(1, "Estimated delivery time is required")
    .max(
      200,
      "Estimated delivery time must be at most 200 characters",
    ),

  message: z
    .string()
    .trim()
    .max(2000, "Message must be at most 2000 characters")
    .optional(),
});