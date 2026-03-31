import { z } from "zod";

export const listingQuerySchema = z.object({
  cityId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().max(10000).optional(),
  roomType: z.string().optional(),
  rentalType: z.enum(["SHORT", "LONG"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const listingGeoQuerySchema = z.object({
  cityId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().max(10000).optional(),
  roomType: z.string().optional(),
  rentalType: z.enum(["SHORT", "LONG"]).optional(),
});
