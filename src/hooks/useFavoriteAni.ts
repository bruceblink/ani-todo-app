import {createContext, useContext} from "react";


type FavoriteAniCtx = {
    favoriteAniIds: Set<number>
    favoriteAniTitles: Set<string>
    handleFavor: (id: number, aniTitle: string, isFavorite: boolean) => void
    isLoaded: boolean
}

const FavoriteAniContext = createContext<FavoriteAniCtx | null>(null)

const useFavoriteAni = () => {
    const ctx = useContext(FavoriteAniContext)
    if (!ctx) throw new Error('useWatchedAni must be inside WatchedAniProvider')
    return ctx
}

export {FavoriteAniContext, useFavoriteAni}