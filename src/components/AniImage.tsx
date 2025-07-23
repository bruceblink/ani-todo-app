import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Props {
    url: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
}

// 判断所属平台（返回后端 command 名）
const getImageCommand = (url: string): string | null => {
    if (url.includes('hdslb.com')) return 'fetch_bilibili_image';
    if (url.includes('iqiyipic.com')) return 'fetch_iqiyi_image';
    return null;
};

const AniImage: React.FC<Props> = ({ url, alt = '', className }) => {
    const [src, setSrc] = useState<string>(url);

    useEffect(() => {
        const command = getImageCommand(url);
        let cancelled = false;

        // 如果不需要转 base64，直接使用原图
        if (!command) {
            setSrc(url);
            return;
        }

        const fetchImage = async () => {
            try {
                const dataUrl = await invoke<string>(command, { url });
                if (!cancelled) setSrc(dataUrl);
            } catch (e) {
                console.error(`fetch_image failed (${command})`, e);
                if (!cancelled) setSrc(url); // 回退
            }
        };

        void fetchImage();

        return () => {
            cancelled = true;
        };
    }, [url]);

        const baseStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    return src ? (
        <img 
            src={src} 
            alt={alt} 
            className={className}
            style={baseStyle} 
        />
    ) : (
        <div 
            className={className} 
            style={{ 
                ...baseStyle,
                background: '#eee',
            }} 
        />
    );
};

export default AniImage;
