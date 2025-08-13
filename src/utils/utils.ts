import type {Ani} from "@/utils/api";
import dayjs from 'dayjs';
/**
 * 判断两个标题是否相似
 * @param a
 * @param b
 */
export function isSimilarTitle(a: string, b: string): boolean {
    return a.includes(b) || b.includes(a);
}

/**
 * 合并多个 Ani 分组数据
 * @param successList
 */
export function mergeAniGroups(successList: Record<string, Ani[]>[]): Record<string, Ani[]> {
    // 使用 reduce 累加每个 week 的结果
    return successList.reduce((acc, cur) => {
        Object.entries(cur).forEach(([week, list]) => {
            // 取出之前已经累积的这一周的数据（如果没有则用空数组）
            const existing = acc[week] || []

            // 将新一批数据拼接到已有数据之后
            const combined = existing.concat(list)

            // 用于记录已经出现过的 title
            const seenTitles = new Set<string>()
            // 存放去重后的结果
            const deduped: Ani[] = []

            for (const item of combined) {
                // 如果当前标题还没出现过，就加入结果，并标记为已出现
                if (!seenTitles.has(item.title)) {
                    seenTitles.add(item.title)
                    deduped.push(item)
                }
                // 如果已出现过，则跳过（保留第一次出现的）
            }

            // 将去重后的数组赋回累加器
            acc[week] = deduped
        })

        return acc
    }, {} as Record<string, Ani[]>)
}

export function formatUnixTimestampMs(ts: number) {
    if(ts) {
        return dayjs(ts).format('YYYY-MM-DD')
    }
}