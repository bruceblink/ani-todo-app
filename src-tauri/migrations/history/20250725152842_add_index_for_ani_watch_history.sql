-- Add migration script here
-- 1. 先判断索引是否已存在，再创建
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_item_time
    ON ani_watch_history(ani_item_id, watched_time);

-- 2. （可选）如果你经常单独按 watched_time 查询，也可以额外建一个
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_time
    ON ani_watch_history(watched_time);
-- 3. 查询今天的更新的动漫
CREATE INDEX IF NOT EXISTS idx_ani_info_update_time
    ON ani_info(update_time);