-- Add migration script here
-- 动漫收藏表
CREATE TABLE IF NOT EXISTS ani_collect (
     id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  -- 主键id
     ani_item_id  INTEGER NOT NULL,                  -- 番剧ID
     collect_time TEXT NOT NULL,                     -- 收藏时间
     watched INTEGER NOT NULL DEFAULT 0              -- 是否已观看，0为false，1为true
);