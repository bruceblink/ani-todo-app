// src/components/AniImage.tsx
import React, { useEffect, useState } from 'react';
import {invoke} from "@tauri-apps/api/core";

interface Props {
    url: string;
    alt?: string;
    className?: string;
}

const AniImage: React.FC<Props> = ({ url, alt = '', className }) => {
    const [src, setSrc] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        invoke<string>('fetch_image', { url })
            .then((dataUrl) => {
                if (!cancelled) setSrc(dataUrl);
            })
            .catch((e) => console.error('fetch_image failed', e));

        return () => {
            cancelled = true;
        };
    }, [url]);

    return src ? (
        <img src={src} alt={alt} className={className} />
    ) : (
        <div className={className} style={{ background: '#eee' }} />
    );
};

export default AniImage;
