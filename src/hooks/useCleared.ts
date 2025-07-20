import {createContext, useContext} from "react";


type ClearedCtx = {
    clearedIds: Set<number>
    clear: (id: number) => void
}

const ClearedContext = createContext<ClearedCtx | null>(null)

const useCleared = () => {
    const ctx = useContext(ClearedContext)
    if (!ctx) throw new Error('useCleared must be inside ClearedProvider')
    return ctx
}

export {ClearedContext, useCleared}