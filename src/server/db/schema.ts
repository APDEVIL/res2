import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ───────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", [
  "CUSTOMER",
  "OWNER",
  "DELIVERY",
])

export const orderStatusEnum = pgEnum("order_status", [
  "PLACED",
  "CONFIRMED",
  "REJECTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
])

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable("user", {
  id:            text("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  phone:         text("phone"),
  role:          userRoleEnum("role").notNull().default("CUSTOMER"),
  image:         text("image"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
})

// ─── Better Auth tables ──────────────────────────────────────────────
export const sessions = pgTable("session", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull().references(() => users.id),
  token:     text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("account", {
  id:                    text("id").primaryKey(),
  userId:                text("user_id").notNull().references(() => users.id),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  idToken:               text("id_token"),
  password:              text("password"),
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verification", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
})

// ─── Restaurants ─────────────────────────────────────────────────────
export const restaurants = pgTable("restaurants", {
  id:          uuid("id").primaryKey().defaultRandom(),
  ownerId:     text("owner_id").notNull().references(() => users.id),
  name:        text("name").notNull(),
  description: text("description"),
  address:     text("address").notNull(),
  phone:       text("phone"),
  isOpen:      boolean("is_open").default(true).notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
})

// ─── Menu Categories ─────────────────────────────────────────────────
export const menuCategories = pgTable("menu_categories", {
  id:           uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id),
  name:         text("name").notNull(),
  sortOrder:    integer("sort_order").default(0),
})

// ─── Menu Items ──────────────────────────────────────────────────────
export const menuItems = pgTable("menu_items", {
  id:           uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id),
  categoryId:   uuid("category_id").references(() => menuCategories.id),
  name:         text("name").notNull(),
  description:  text("description"),
  price:        decimal("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable:  boolean("is_available").default(true).notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
})

// ─── Orders ──────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id:                uuid("id").primaryKey().defaultRandom(),
  customerId:        text("customer_id").notNull().references(() => users.id),
  restaurantId:      uuid("restaurant_id").notNull().references(() => restaurants.id),
  deliveryPartnerId: text("delivery_partner_id").references(() => users.id),
  status:            orderStatusEnum("status").notNull().default("PLACED"),
  deliveryAddress:   text("delivery_address").notNull(),
  totalAmount:       decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes:             text("notes"),
  createdAt:         timestamp("created_at").defaultNow().notNull(),
  updatedAt:         timestamp("updated_at").defaultNow().notNull(),
})

// ─── Order Items ─────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id:         uuid("id").primaryKey().defaultRandom(),
  orderId:    uuid("order_id").notNull().references(() => orders.id),
  menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id),
  name:       text("name").notNull(),
  price:      decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity:   integer("quantity").notNull(),
})

// ─── Relations ───────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  restaurants:      many(restaurants),
  ordersAsCustomer: many(orders, { relationName: "customerOrders" }),
  ordersAsDelivery: many(orders, { relationName: "deliveryOrders" }),
}))

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner:      one(users, { fields: [restaurants.ownerId], references: [users.id] }),
  categories: many(menuCategories),
  menuItems:  many(menuItems),
  orders:     many(orders),
}))

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [menuCategories.restaurantId], references: [restaurants.id] }),
  menuItems:  many(menuItems),
}))

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, { fields: [menuItems.restaurantId],  references: [restaurants.id] }),
  category:   one(menuCategories, { fields: [menuItems.categoryId], references: [menuCategories.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer:        one(users, { fields: [orders.customerId],        references: [users.id], relationName: "customerOrders" }),
  deliveryPartner: one(users, { fields: [orders.deliveryPartnerId], references: [users.id], relationName: "deliveryOrders" }),
  restaurant:      one(restaurants, { fields: [orders.restaurantId], references: [restaurants.id] }),
  items:           many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order:    one(orders,    { fields: [orderItems.orderId],    references: [orders.id] }),
  menuItem: one(menuItems, { fields: [orderItems.menuItemId], references: [menuItems.id] }),
}))