-- Add migration script here
-- 动漫信息表
CREATE TABLE IF NOT EXISTS ani_info_temp (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,  -- 主键id
    title TEXT NOT NULL,                            -- 番剧标题
    update_count TEXT,                              -- 更新集数（整数类型）
    update_info TEXT,                               -- 更新信息
    image_url TEXT NOT NULL,                        -- 番剧的封面图片
    detail_url TEXT NOT NULL,                       -- 番剧观看地址
    update_time TEXT NOT NULL,                       -- 番剧更新时间（使用时间戳）
    platform TEXT NOT NULL,                         -- 番剧的视频平台
    UNIQUE(title, platform, update_count)           -- 唯一约束，避免重复插入
);
-- 将原表数据迁移到新表
INSERT INTO ani_info_temp (id, title, update_count, update_info, image_url, detail_url, update_time, platform)
SELECT id, title, update_count, update_info, image_url, detail_url, update_time, platform FROM ani_info;
-- 删除原表
DROP TABLE IF EXISTS ani_info;
-- 重命名新表为原表名
ALTER TABLE ani_info_temp RENAME TO ani_info;