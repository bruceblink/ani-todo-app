-- Add migration script here
-- 动漫信息表
CREATE TABLE IF NOT EXISTS ani_info (
     id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  -- 主键id
     title TEXT NOT NULL,                            -- 番剧标题
     update_count INTEGER,                           -- 更新集数（整数类型）
     update_info TEXT,                               -- 更新信息
     image_url TEXT NOT NULL,                        -- 番剧的封面图片
     detail_url TEXT NOT NULL,                       -- 番剧观看地址
     update_time TEXT NOT NULL,                       -- 番剧更新时间（使用时间戳）
     platform TEXT NOT NULL,                         -- 番剧的视频平台
     UNIQUE(title, platform, update_count)           -- 唯一约束，避免重复插入
);