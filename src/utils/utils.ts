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

export function formatUnixMs2Date(ts: number) {
    if(ts) {
        return dayjs(ts).format('YYYY-MM-DD')
    }
}

export function formatUnixMs2Timestamp(ts: number) {
    if(ts) {
        return dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
    }
}


/**
 * 多字段模糊搜索工具
 *
 * @param rows 待搜索的数据数组（元素可以是对象或原始类型）
 * @param query 搜索关键词（可为空、null、undefined）
 * @param fields 可选，需要搜索的字段（如 ['title','platform']），不传则搜索对象所有字段
 */
export function fuzzySearch<T>(
    rows: readonly T[],
    query?: string | null,
    fields?: (keyof T)[]
): T[] {
    const raw = (query ?? '').toString();
    const trimmed = raw.trim();
    if (trimmed === '') return Array.from(rows);

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const out: T[] = [];

    for (const row of rows) {
        if (row == null) continue;

        // 如果 row 是原始类型（string/number/boolean），直接匹配它本身
        const t = typeof row;
        if (t === 'string' || t === 'number' || t === 'boolean') {
            if (regex.test(String(row))) out.push(row);
            continue;
        }

        // 此时 row 被视作对象；用安全的 Record<string, unknown> 来索引字段，避免 any
        const obj = row as unknown as Record<string, unknown>;

        if (!fields || fields.length === 0) {
            // 搜索对象所有自有可枚举字段
            let matched = false;
            for (const k in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                const val = obj[k];
                if (val == null) continue;
                if (regex.test(String(val))) {
                    matched = true;
                    break;
                }
            }
            if (matched) out.push(row);
        } else {
            // 仅按指定字段搜索（f 是 keyof T）
            let matched = false;
            for (const f of fields) {
                // 将 keyof 转为 string 安全索引
                const key = String(f);
                const val = obj[key];
                if (val == null) continue;
                if (regex.test(String(val))) {
                    matched = true;
                    break;
                }
            }
            if (matched) out.push(row);
        }
    }

    return out;
}