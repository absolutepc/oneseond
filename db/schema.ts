import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const catalogState=sqliteTable('catalog_state',{id:text('id').primaryKey(),body:text('body').notNull(),revision:integer('revision').notNull().default(0),updatedAt:text('updated_at').notNull()});
export const shopOwner=sqliteTable('shop_owner',{id:text('id').primaryKey(),userId:text('user_id').notNull()});
