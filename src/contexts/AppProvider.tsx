import type {ReactNode} from 'react';
import { WatchedAniProvider } from '@/contexts/WatchedAniProvider';
import { FavoriteAniProvider } from '@/contexts/FavoriteAniProvider';

interface Props {
    children: ReactNode;
}

export const AppProvider = ({ children }: Props) => {
    return (
        <FavoriteAniProvider>
            <WatchedAniProvider>
                {children}
            </WatchedAniProvider>
        </FavoriteAniProvider>
    );
};