import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WatchedAniProvider } from '@/contexts/WatchedAniContext'
import {FavoriteAniProvider} from "@/contexts/FavoriteAniContext.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WatchedAniProvider>
            <FavoriteAniProvider>
                <App/>
            </FavoriteAniProvider>
        </WatchedAniProvider>
    </StrictMode>,
)
