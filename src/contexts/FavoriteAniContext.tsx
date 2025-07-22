import { useState, useEffect, type ReactNode } from 'react'
import {invokeCommand} from "@/utils/utils";
import {FavoriteAniContext} from "@/hooks/useFavoriteAni.ts";

export interface AniCollect {
    id: number,
    ani_item_id: number,
    collect_time: string,
    watched: boolean,
}

export function FavoriteAniProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Set<number>>(new Set())
    useEffect(() => {
        void fetchFavoriteAniIds()
    }, [])


    const fetchFavoriteAniIds = async () => {
        try {
            const res = await invokeCommand<AniCollect[]>("get_favorite_ani_item_list") as AniCollect[]
            const data = new Set(res.map(aniCollect => aniCollect.ani_item_id));
            setFavorites(data)
        } catch (e) {
            console.error('加载已清除/收藏 ID 列表失败', e)
        }
    }

    const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
        try {
            if (!isFavorite) { // 如果没有收藏则收藏
                await invokeCommand("collect_ani_item", {aniId: id});
            }else { // 反之取消收藏
                await invokeCommand("cancel_collect_ani_item", {aniId: id});
            }
            setFavorites(prev => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
            })
        } catch (e) {
            console.error(`切换收藏 ${id} 失败`, e)
        }
    }

    return (
        <FavoriteAniContext.Provider value={{ favoriteAniIds: favorites, handleFavor: handleToggleFavorite }}>
            {children}
        </FavoriteAniContext.Provider>
    )
}
