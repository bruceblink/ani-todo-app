-- 1. 先临时关掉外键检查
PRAGMA foreign_keys = OFF;

--------------------------------------------------------------------------------
-- 1.5 清洗旧表中的孤儿数据
--------------------------------------------------------------------------------
-- 先删掉所有 ani_collect 里找不到 ani_info 的
DELETE FROM ani_collect
WHERE ani_item_id NOT IN (SELECT id FROM ani_info);

-- 再删掉所有 ani_watch_history 里找不到 ani_collect 的
DELETE FROM ani_watch_history
WHERE NOT EXISTS (
    SELECT 1
    FROM ani_collect c
    WHERE c.user_id     = ani_watch_history.user_id
      AND c.ani_item_id = ani_watch_history.ani_item_id
);

--------------------------------------------------------------------------------
-- 2. 按需创建新表（同之前脚本，带外键、UTC+8 时间戳字段）
--------------------------------------------------------------------------------

CREATE TABLE ani_info_new (
                              id           INTEGER PRIMARY KEY AUTOINCREMENT,
                              title        TEXT    NOT NULL,
                              update_count TEXT,
                              update_info  TEXT,
                              image_url    TEXT    NOT NULL,
                              detail_url   TEXT    NOT NULL,
                              update_time  INTEGER NOT NULL,
                              platform     TEXT    NOT NULL,
                              UNIQUE(title, platform, update_count)
);

CREATE TABLE ani_collect_new (
                                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                 user_id      TEXT    DEFAULT '',
                                 ani_item_id  INTEGER NOT NULL,
                                 ani_title    TEXT    NOT NULL,
                                 collect_time INTEGER NOT NULL,
                                 is_watched   INTEGER NOT NULL DEFAULT 0,
                                 UNIQUE(user_id, ani_item_id),
                                 FOREIGN KEY (ani_item_id)
                                     REFERENCES ani_info_new(id)
                                     ON DELETE CASCADE
);

CREATE TABLE ani_watch_history_new (
                                       id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                       user_id      TEXT    DEFAULT '',
                                       ani_item_id  INTEGER NOT NULL,
                                       watched_time INTEGER NOT NULL,
                                       UNIQUE(user_id, ani_item_id),
                                       FOREIGN KEY (user_id, ani_item_id)
                                           REFERENCES ani_collect_new(user_id, ani_item_id)
                                           ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 3. 拷贝数据（时间字段转成 UTC+8 时间戳）
--------------------------------------------------------------------------------

INSERT INTO ani_info_new
(id, title, update_count, update_info, image_url, detail_url, update_time, platform)
SELECT
    id, title, update_count, update_info, image_url, detail_url,
    strftime('%s', REPLACE(update_time,'/','-'), '+8 hours'),
    platform
FROM ani_info;

INSERT INTO ani_collect_new
(id, user_id, ani_item_id, ani_title, collect_time, is_watched)
SELECT
    id, user_id, ani_item_id, ani_title,
    strftime('%s', REPLACE(collect_time,'/','-'), '+8 hours'),
    is_watched
FROM ani_collect;

INSERT INTO ani_watch_history_new
(id, user_id, ani_item_id, watched_time)
SELECT
    id, user_id, ani_item_id,
    strftime('%s', REPLACE(watched_time,'/','-'), '+8 hours')
FROM ani_watch_history;

--------------------------------------------------------------------------------
-- 4. 删旧表、改名
--------------------------------------------------------------------------------

DROP TABLE ani_watch_history;
DROP TABLE ani_collect;
DROP TABLE ani_info;

ALTER TABLE ani_info_new          RENAME TO ani_info;
ALTER TABLE ani_collect_new       RENAME TO ani_collect;
ALTER TABLE ani_watch_history_new RENAME TO ani_watch_history;

--------------------------------------------------------------------------------
-- 5. 重建索引
--------------------------------------------------------------------------------

CREATE INDEX idx_ani_info_update_time
    ON ani_info(update_time);
CREATE INDEX idx_ani_collect_item_time
    ON ani_collect(ani_item_id, collect_time);
CREATE INDEX idx_ani_watch_history_item_time
    ON ani_watch_history(ani_item_id, watched_time);
CREATE INDEX idx_ani_watch_history_time
    ON ani_watch_history(watched_time);

--------------------------------------------------------------------------------
-- 6. 重建触发器
--------------------------------------------------------------------------------

CREATE TRIGGER trg_after_insert_watch
    AFTER INSERT ON ani_watch_history
    FOR EACH ROW
BEGIN
    UPDATE ani_collect
    SET is_watched = 1
    WHERE user_id     = NEW.user_id
      AND ani_item_id = NEW.ani_item_id;
END;

--------------------------------------------------------------------------------
-- 7. 恢复外键检查
--------------------------------------------------------------------------------

PRAGMA foreign_keys = ON;
