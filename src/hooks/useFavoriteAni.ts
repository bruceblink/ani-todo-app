import {createContext, useContext} from "react";


type FavoriteAniCtx = {
    favoriteAniItems: Set<unknown>
    handleFavor: (id: number, aniTitle: string, isFavorite: boolean | number) => void
    isLoaded: boolean
}

const FavoriteAniContext = createContext<FavoriteAniCtx | null>(null)

const useFavoriteAni = () => {
    const ctx = useContext(FavoriteAniContext)
    if (!ctx) throw new Error('useFavoriteAni must be inside FavoriteAniProvider')
    return ctx
}

export {FavoriteAniContext, useFavoriteAni}