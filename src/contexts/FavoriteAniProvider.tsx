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
            const data = new Set(res.map(aniCollect => aniCollect.id));
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
                // 触发器的情况，不做操作
            } else {
                if (!isFavorite) {
                    await api.collectAni(id, aniTitle);
                } else {
                    await api.cancelCollectAni(id, aniTitle);
                }
            }

        } catch (e) {
            console.error(`切换关注 ${aniTitle} 失败，回滚 UI`, e);

        } finally {
            await fetchFavoriteUpdateAniList();
        }
    };

    return (
        <FavoriteAniContext.Provider value={{
            favoriteAniItems: favoriteAniItems,
            handleFavor: handleToggleFavorite,
            isLoaded }}>
            {children}
        </FavoriteAniContext.Provider>
    )
}
