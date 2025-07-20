import { useState, useEffect, type ReactNode } from 'react'
import {loadAniData, removeAniItemFromDatabase} from "@/utils/utils";
import { ClearedContext } from '@/hooks/useCleared';
import type {Ani} from "@/components/AniItem.tsx";



export function ClearedProvider({ children }: { children: ReactNode }) {
    const [clearedIds, setClearedIds] = useState<Set<number>>(new Set())

    useEffect(() => {
        void fetchClearedIds()
    }, [])

    const fetchClearedIds = async () => {
        try {
            const data = await loadAniData("get_watched_ani_item_list")
            const today = Object.keys(data)[0]
            const aniList = data[today] as Ani[]
            const ids = aniList.map(ani => ani.id)
            setClearedIds(new Set(ids))
        } catch (err) {
            console.error("加载 watched 番剧失败:", err)
        }
    }

    const clear = async (id: number) => {
        try {
            await removeAniItemFromDatabase(id)
            setClearedIds(prev => {
                const updated = new Set(prev)
                updated.add(id)
                return updated
            })
        } catch (err) {
            console.error(`清除番剧 ${id} 失败:`, err)
        }
    }

    return (
        <ClearedContext.Provider value={{ clearedIds, clear }}>
            {children}
        </ClearedContext.Provider>
    )
}
