import { useState, useEffect, type ReactNode } from 'react'
import {FavoriteAniContext} from "@/hooks/useFavoriteAni.ts";
import {api} from "@/utils/api";



export function FavoriteAniProvider({ children }: { children: ReactNode }) {
    const [favoriteAniTitles, setFavoriteAniTitles] = useState<Set<string>>(new Set())
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        void fetchFavoriteAniList()
    }, [])


    const fetchFavoriteAniList = async () => {
        try {
            const res = await api.queryFavoriteAniList()
            const dataTitles = new Set(res.map(aniCollect => aniCollect.ani_title));
            setFavoriteAniTitles(dataTitles)
        } catch (e) {
            console.error('加载已清除/收藏 ID 列表失败', e)
        } finally {
            setIsLoaded(true)
        }
    }

    const handleToggleFavorite = async (id: number, aniTitle: string, isFavorite: boolean) => {
        try {
            if (!isFavorite) { // 如果没有收藏则收藏
                await api.collectAni(id, aniTitle);
            }else { // 反之取消收藏
                await api.cancelCollectAni(id, aniTitle);
            }
            setFavoriteAniTitles(prev => {
                const next = new Set(prev)
                if (next.has(aniTitle)) next.delete(aniTitle)
                else next.add(aniTitle)
                return next
            })
        } catch (e) {
            console.error(`切换收藏 ${aniTitle} 失败`, e)
        }
    }

    return (
        <FavoriteAniContext.Provider value={{
            favoriteAniTitles: favoriteAniTitles,
            handleFavor: handleToggleFavorite,
            isLoaded }}>
            {children}
        </FavoriteAniContext.Provider>
    )
}
