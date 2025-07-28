-- Add migration script here
-- 把 ani_info.update_time 乘以 1000，转换为毫秒
UPDATE ani_info
SET update_time = update_time * 1000
WHERE update_time < 2000000000;  -- 小于这个值基本可判断是秒级（毫秒值是13位数）

-- ani_collect_new.collect_time 同样处理
UPDATE ani_collect
SET collect_time = collect_time * 1000
WHERE collect_time < 2000000000;

-- ani_watch_history_new.watched_time 同样处理
UPDATE ani_watch_history
SET watched_time = watched_time * 1000
WHERE watched_time < 2000000000;
