-- Add migration script here
-- 动漫观看历史表
CREATE TABLE IF NOT EXISTS ani_watch_history (
     id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  -- 主键id
     user_id TEXT DEFAULT '',                       -- 用户ID，标识哪个用户观看的
     ani_item_id INTEGER NOT NULL,                   -- 番剧ID，外键关联ani_items
     watched_time TEXT NOT NULL,                     -- 观看时间
     UNIQUE(user_id, ani_item_id)                    -- 用户与番剧的唯一约束，确保每个用户只能记录一次观看历史
);
