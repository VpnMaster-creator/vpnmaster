import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  city: text("city").notNull(),
  ping: integer("ping").notNull(),
  load: integer("load").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  status: text("status").notNull().default("available"), // available, busy, maintenance
});

export const connectionHistory = pgTable("connection_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serverId: integer("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address").notNull(),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
  disconnectedAt: timestamp("disconnected_at"),
  duration: integer("duration"), // in seconds
  dataUsed: integer("data_used"), // in bytes
});

export const usersRelations = relations(users, ({ many }) => ({
  connectionHistory: many(connectionHistory),
}));

export const serversRelations = relations(servers, ({ many }) => ({
  connectionHistory: many(connectionHistory),
}));

export const connectionHistoryRelations = relations(connectionHistory, ({ one }) => ({
  user: one(users, {
    fields: [connectionHistory.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [connectionHistory.serverId],
    references: [servers.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
});

export const insertConnectionHistorySchema = createInsertSchema(connectionHistory).omit({
  id: true,
  duration: true,
  disconnectedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Server = typeof servers.$inferSelect;
export type ConnectionHistory = typeof connectionHistory.$inferSelect;