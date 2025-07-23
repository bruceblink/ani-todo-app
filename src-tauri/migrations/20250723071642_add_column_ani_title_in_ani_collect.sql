-- Add migration script here
ALTER TABLE ani_collect
    ADD COLUMN ani_title TEXT NOT NULL default ''; -- 新增 ani_title 列，默认值为空字符串