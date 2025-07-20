import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClearedProvider } from './contexts/ClearedContext'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ClearedProvider>
            <App/>
        </ClearedProvider>
    </StrictMode>,
)
