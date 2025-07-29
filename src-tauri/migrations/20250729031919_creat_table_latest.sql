-- Add migration script here

--------------------------------------------------------------------------------
-- 1. 按需创建新表（同之前脚本，带外键、UTC+8 时间戳字段）
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ani_info (
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

CREATE TABLE IF NOT EXISTS ani_collect (
         id           INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id      TEXT    DEFAULT '',
         ani_item_id  INTEGER NOT NULL,
         ani_title    TEXT    NOT NULL,
         collect_time INTEGER NOT NULL,
         is_watched   INTEGER NOT NULL DEFAULT 0,
         UNIQUE(user_id, ani_item_id),
         FOREIGN KEY (ani_item_id)
             REFERENCES ani_info(id)
             ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ani_watch_history (
       id           INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id      TEXT    DEFAULT '',
       ani_item_id  INTEGER NOT NULL,
       watched_time INTEGER NOT NULL,
       UNIQUE(user_id, ani_item_id),
       FOREIGN KEY (user_id, ani_item_id)
           REFERENCES ani_collect(user_id, ani_item_id)
           ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 2. 建索引
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ani_info_update_time
    ON ani_info(update_time);
CREATE INDEX IF NOT EXISTS idx_ani_collect_item_time
    ON ani_collect(ani_item_id, collect_time);
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_item_time
    ON ani_watch_history(ani_item_id, watched_time);
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_time
    ON ani_watch_history(watched_time);

--------------------------------------------------------------------------------
-- 3. 重建触发器
--------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_after_insert_watch;
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
-- 4. 恢复外键检查
--------------------------------------------------------------------------------
PRAGMA foreign_keys = ON;