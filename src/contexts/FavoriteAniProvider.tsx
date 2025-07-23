import { useState, useEffect, type ReactNode } from 'react'
import {FavoriteAniContext} from "@/hooks/useFavoriteAni.ts";
import {api} from "@/utils/api";



export function FavoriteAniProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Set<number>>(new Set())
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        void fetchFavoriteAniIds()
    }, [])


    const fetchFavoriteAniIds = async () => {
        try {
            const res = await api.queryFavoriteAniList()
            const data = new Set(res.map(aniCollect => aniCollect.ani_item_id));
            setFavorites(data)
        } catch (e) {
            console.error('加载已清除/收藏 ID 列表失败', e)
        } finally {
            setIsLoaded(true)
        }
    }

    const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
        try {
            if (!isFavorite) { // 如果没有收藏则收藏
                await api.collectAni(id);
            }else { // 反之取消收藏
                await api.cancelCollectAni(id);
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
        <FavoriteAniContext.Provider value={{ favoriteAniIds: favorites, handleFavor: handleToggleFavorite, isLoaded }}>
            {children}
        </FavoriteAniContext.Provider>
    )
}
