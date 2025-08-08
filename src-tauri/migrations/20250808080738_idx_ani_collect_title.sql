-- Add migration script here
DROP INDEX IF EXISTS idx_ani_collect_title;
-- 大批量插入…
CREATE INDEX idx_ani_collect_title ON ani_collect (ani_title);