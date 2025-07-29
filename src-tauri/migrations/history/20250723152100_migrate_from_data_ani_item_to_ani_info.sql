-- Add migration script here
INSERT INTO ani_info (title, update_count, update_info, image_url, detail_url, update_time, platform)
SELECT title, update_count, update_info, image_url, detail_url, update_time, platform FROM ani_items;