import {createContext, useContext} from "react";


type WatchedAniCtx = {
    watchedAniIds: Set<number>
    handleWatch: (id: number) => void
}

const WatchedAniContext = createContext<WatchedAniCtx | null>(null)

const useWatchedAni = () => {
    const ctx = useContext(WatchedAniContext)
    if (!ctx) throw new Error('useWatchedAni must be inside WatchedAniProvider')
    return ctx
}

export {WatchedAniContext, useWatchedAni}