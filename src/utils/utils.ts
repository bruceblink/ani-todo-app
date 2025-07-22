import {invoke} from '@tauri-apps/api/core';
/**
 *  从各个视频网站获取最新的动漫更新数据
 * @param url
 * @param cmd
 */
export async function fetchAniData(url: string, cmd: string) {
    try {
        // 调用命令，拿到 JSON 字符串
        const jsonStr = await invoke<string>(cmd, { url });
        // 解析成对象
        const data = JSON.parse(jsonStr);
        console.log(`fetch data from ${url}：`, data);
        return data;
    } catch (e) {
        console.error(`fetch data from ${url} 失败：`, e);
        return {};
    }
}
/**
 *  调用tauri的command函数
 * @param cmd 调用的后端command
 * @param args command所需的参数
 *
 * usage:
 * type Response = { status: string };
 * type Args = { aniTitle: string; platform: string };
 *
 * const res = await invokeCommand<Response, Args>('remove_ani_item_data', {
 *     aniTitle: '凉宫春日的忧郁',
 *     platform: 'B站'
 * });
 *
 *
 */
export async function invokeCommand<T, Args extends Record<string, unknown> = Record<string, unknown>>(
    cmd: string,
    args?: Args
): Promise<T | undefined> {
    try {
        // 1) 强制用 string 拿回 JSON 字符串
        const raw = await invoke<string>(cmd, args ?? {});

        // 2) parse 出 R 类型
        const data = JSON.parse(raw) as T;

        console.log(`invoke cmd ${cmd} args`, args, 'success!', data);
        return data;
    } catch (e) {
        console.error(`invoke cmd ${cmd} args`, args, 'failed:', e);
        return undefined;
    }
}
