import {
  bigint,
  boolean,
  inet,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "deposit",
  "partial",
  "final",
  "full",
]);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "viewer"]);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  googleEventId: varchar("google_event_id", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  sessionType: varchar("session_type", { length: 100 }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  location: text("location"),
  notes: text("notes"),
  status: sessionStatusEnum("status").notNull().default("pending"),
  totalPriceCents: integer("total_price_cents").notNull(),
  maxPhotoCount: integer("max_photo_count").notNull().default(25),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }).unique(),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  amountCents: integer("amount_cents").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  description: text("description"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleries = pgTable("galleries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id")
    .notNull()
    .unique()
    .references(() => sessions.id, { onDelete: "cascade" }),
  accessToken: varchar("access_token", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  photoLimit: integer("photo_limit").notNull().default(25),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: uuid("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  s3Key: varchar("s3_key", { length: 500 }).notNull(),
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  width: integer("width"),
  height: integer("height"),
  sortOrder: integer("sort_order").notNull().default(0),
  uploadedAt: timestamp("uploaded_at"),
});

export const gallerySessions = pgTable("gallery_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: uuid("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token", { length: 64 }).notNull().unique(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const pinAttempts = pgTable("pin_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryToken: varchar("gallery_token", { length: 64 }).notNull(),
  ipAddress: text("ip_address").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  role: adminRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const customersRelations = relations(customers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sessions.customerId],
    references: [customers.id],
  }),
  payments: many(payments),
  gallery: one(galleries, {
    fields: [sessions.id],
    references: [galleries.sessionId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  session: one(sessions, {
    fields: [payments.sessionId],
    references: [sessions.id],
  }),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  session: one(sessions, {
    fields: [galleries.sessionId],
    references: [sessions.id],
  }),
  photos: many(galleryPhotos),
  sessions: many(gallerySessions),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryPhotos.galleryId],
    references: [galleries.id],
  }),
}));

export const gallerySessionsRelations = relations(
  gallerySessions,
  ({ one }) => ({
    gallery: one(galleries, {
      fields: [gallerySessions.galleryId],
      references: [galleries.id],
    }),
  })
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type NewGalleryPhoto = typeof galleryPhotos.$inferInsert;

export type GallerySession = typeof gallerySessions.$inferSelect;
export type NewGallerySession = typeof gallerySessions.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type PinAttempt = typeof pinAttempts.$inferSelect;
export type NewPinAttempt = typeof pinAttempts.$inferInsert;
