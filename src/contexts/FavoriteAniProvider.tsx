import { useState, useEffect, type ReactNode } from 'react'
import {FavoriteAniContext} from "@/hooks/useFavoriteAni.ts";
import {api} from "@/utils/api";



export function FavoriteAniProvider({ children }: { children: ReactNode }) {
    const [favoriteAniItems, setFavoriteAniItems] = useState<Set<unknown>>(new Set())
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        void fetchFavoriteUpdateAniList()
    }, [])


    const fetchFavoriteUpdateAniList = async () => {
        try {
            const res = await api.queryFavoriteUpdateAniList()
            const data = new Set(res.map(aniCollect => aniCollect.title));
            setFavoriteAniItems(data)
        } catch (e) {
            console.error('加载已清除/关注 ID 列表失败', e)
        } finally {
            setIsLoaded(true)
        }
    }

    const handleToggleFavorite = async (id: number, aniTitle: string, isFavorite: boolean | number) => {
        try {
            if (typeof isFavorite !== 'boolean') {
                //await api.updateCollectedAni(id, aniTitle); 由于数据库使用了触发器，这里的操作不需要了
                // 只需要更新关注列表的状态即可
            }else {
                if (!isFavorite) { // 如果没有关注则关注
                    await api.collectAni(id, aniTitle);
                }else { // 反之取消关注
                    await api.cancelCollectAni(id, aniTitle);
                }
            }
            setFavoriteAniItems(prev => {
                const next = new Set(prev)
                if (next.has(aniTitle)) next.delete(aniTitle)
                else next.add(aniTitle)
                return next
            })
        } catch (e) {
            console.error(`切换关注 ${aniTitle} 失败`, e)
        }
    }

    return (
        <FavoriteAniContext.Provider value={{
            favoriteAniItems: favoriteAniItems,
            handleFavor: handleToggleFavorite,
            isLoaded }}>
            {children}
        </FavoriteAniContext.Provider>
    )
}
