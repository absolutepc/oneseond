import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const catalogState=sqliteTable('catalog_state',{id:text('id').primaryKey(),body:text('body').notNull(),revision:integer('revision').notNull().default(0),updatedAt:text('updated_at').notNull()});
export const shopOwner=sqliteTable('shop_owner',{id:text('id').primaryKey(),userId:text('user_id').notNull()});
export const adminAccount=sqliteTable('admin_account',{id:text('id').primaryKey(),passwordHash:text('password_hash').notNull(),version:integer('version').notNull().default(1)});
export const adminSession=sqliteTable('admin_session',{tokenHash:text('token_hash').primaryKey(),accountVersion:integer('account_version').notNull(),expiresAt:integer('expires_at').notNull()});
export const adminLoginLimit=sqliteTable('admin_login_limit',{id:text('id').primaryKey(),attempts:integer('attempts').notNull(),resetAt:integer('reset_at').notNull()});
