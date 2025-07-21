-- Add migration script here
ALTER TABLE ani_items
    ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0;   -- 是否喜爱，0为false，1为true