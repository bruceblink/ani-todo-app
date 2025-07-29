-- Add migration script here
PRAGMA foreign_keys = OFF;

-- 1) 重建 ani_watch_history 新表，改为引用 ani_info(id)
CREATE TABLE ani_watch_history_new (
       id           INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id      TEXT    DEFAULT '',
       ani_item_id  INTEGER NOT NULL,
       watched_time INTEGER NOT NULL,
       UNIQUE(user_id, ani_item_id),
       FOREIGN KEY (ani_item_id)
           REFERENCES ani_info(id)
           ON DELETE CASCADE
);

-- 2) 拷贝旧数据
INSERT INTO ani_watch_history_new (id, user_id, ani_item_id, watched_time)
SELECT id, user_id, ani_item_id, watched_time
FROM ani_watch_history;

-- 3) 删除旧表，重命名新表
DROP TABLE ani_watch_history;
ALTER TABLE ani_watch_history_new RENAME TO ani_watch_history;

-- 4) 重建索引和触发器
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_item_time
    ON ani_watch_history(ani_item_id, watched_time);
CREATE INDEX IF NOT EXISTS idx_ani_watch_history_time
    ON ani_watch_history(watched_time);

/* 如果你有针对旧表的触发器（trg_after_insert_watch），
   并且它仍然合理，就先 DROP，再 CREATE 一遍： */

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

PRAGMA foreign_keys = ON;
