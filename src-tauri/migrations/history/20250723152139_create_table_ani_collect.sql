-- Add migration script here
-- 动漫收藏表
CREATE TABLE IF NOT EXISTS ani_collect (
     id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  -- 主键id
     user_id TEXT DEFAULT '',                       -- 用户ID，标识哪个用户收藏的
     ani_item_id INTEGER NOT NULL,                   -- 番剧ID，外键关联ani_items
     ani_title INTEGER NOT NULL,                   -- 番剧ID，外键关联ani_items
     collect_time TEXT NOT NULL,                     -- 收藏时间
     UNIQUE(user_id, ani_item_id)                    -- 用户与番剧的唯一约束，确保每个用户只能收藏一次同一番剧
);
