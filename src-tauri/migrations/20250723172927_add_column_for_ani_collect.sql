-- Add migration script here
alter table ani_collect add COLUMN is_watched integer not null default 0;  -- 0为未看，1为已看