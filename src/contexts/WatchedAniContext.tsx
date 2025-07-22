import { useState, useEffect, type ReactNode } from 'react'
import {invokeCommand} from "@/utils/utils";
import { WatchedAniContext } from '@/hooks/useWatchedAni.ts';
import type {Ani} from "@/components/AniItem.tsx";



export function WatchedAniProvider({ children }: { children: ReactNode }) {
    const [watchedAniIds, setWatchedAniIds] = useState<Set<number>>(new Set())

    useEffect(() => {
        void fetchWatchedAniIds()
    }, [])

    const fetchWatchedAniIds = async () => {
        try {
            const data = await invokeCommand("get_watched_ani_item_list") as Record<string, Ani[]>
            const today = Object.keys(data)[0]
            const aniList = data[today] as Ani[]
            const ids = new Set(aniList.map(ani => ani.id))
            setWatchedAniIds(ids)
        } catch (err) {
            console.error("加载 watched 番剧失败:", err)
        }
    }

    const handleWatch = async (id: number) => {
        try {
            //await removeAniItemFromDatabase(id)
            await invokeCommand("remove_ani_item_data", { aniId: id})
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
