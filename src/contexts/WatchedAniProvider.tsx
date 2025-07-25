import { useState, useEffect, type ReactNode } from 'react'
import { WatchedAniContext } from '@/hooks/useWatchedAni.ts';
import {api} from "@/utils/api";



export function WatchedAniProvider({ children }: { children: ReactNode }) {
    const [watchedAniIds, setWatchedAniIds] = useState<Set<number>>(new Set())

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

    const handleWatch = async (id: number) => {
        try {
            await api.clearAni(id);
            setWatchedAniIds(prev => {
                const updated = new Set(prev)
                updated.add(id)
                return updated
            })
        } catch (err) {
            console.error(`清除番剧 ${id} 失败:`, err)
        }
    }

    return (
        <WatchedAniContext.Provider value={{ watchedAniIds: watchedAniIds, handleWatch: handleWatch }}>
            {children}
        </WatchedAniContext.Provider>
    )
}
