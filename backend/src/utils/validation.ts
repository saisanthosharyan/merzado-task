import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SUPPLIER"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export const createRFQSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),
  deliveryLocation: z
    .string()
    .trim()
    .min(2, "Delivery location is required")
    .max(300),
  deadline: z
    .string()
    .datetime("Invalid deadline"),
});
export const createQuotationSchema = z.object({
  rfqId: z.string().min(1, "RFQ ID is required"),
  quotedPrice: z
    .number()
    .nonnegative("Quoted price cannot be negative"),
  estimatedDeliveryTime: z
    .string()
    .trim()
    .min(1, "Estimated delivery time is required")
    .max(200),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});