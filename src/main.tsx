import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WatchedAniProvider } from '@/contexts/WatchedAniContext'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WatchedAniProvider>
            <App/>
        </WatchedAniProvider>
    </StrictMode>,
)
