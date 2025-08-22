import { useState, useEffect, type ReactNode } from 'react'
import { WatchedAniContext } from '@/hooks/useWatchedAni.ts';
import {api} from "@/utils/api";
import {useFavoriteAni} from "@/hooks/useFavoriteAni.ts";



export function WatchedAniProvider({ children }: { children: ReactNode }) {
    const [watchedAniIds, setWatchedAniIds] = useState<Set<number>>(new Set())
    const { favoriteAniItems, handleFavor } = useFavoriteAni();

    useEffect(() => {
        void fetchWatchedAniIds()
    }, [])

    const fetchWatchedAniIds = async () => {
        try {
            const data = await api.queryWatchedAniIds();
            const ids = new Set(data.map(ani => ani.ani_item_id));
            setWatchedAniIds(ids);
        } catch (err) {
            console.error("加载 watched 番剧失败:", err)
        }
    }

    const handleWatch = async (id: number, title: string) => {
        try {
            await api.clearAni(id); // 向后端发送“已观看”请求
            setWatchedAniIds(prev => {
                const updated = new Set(prev)
                updated.add(id)
                return updated
            });

            if (favoriteAniItems.has(id)) {
                // handleFavor 会自动处理后端 API 调用和本地状态同步
                handleFavor(id, title, 0);
            }

        } catch (err) {
            console.error(`清除番剧 ${id} 失败:`, err)
        }
    }

    return (
        <WatchedAniContext.Provider value={{
            watchedAniIds: watchedAniIds,
            handleWatch: handleWatch,
           }}>
            {children}
        </WatchedAniContext.Provider>
    )
}
