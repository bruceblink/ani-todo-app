// src/components/AniImage.tsx
import React, {useEffect, useState} from 'react';
import {invoke} from '@tauri-apps/api/core';

interface Props {
    url: string;
    alt?: string;
    className?: string;
}

const isBilibiliImage = (url: string): boolean => {
    return url.includes('hdslb.com'); // 根据需要更严格匹配
};

const AniImage: React.FC<Props> = ({url, alt = '', className}) => {
    const [src, setSrc] = useState<string>(url); // 默认就是传入的 url

    useEffect(() => {
        let useOriginUrl = false;

        if (!isBilibiliImage(url)) {
            // 不是 Bilibili 图片，直接用原始链接显示
            setSrc(url);
            return;
        }

        // 是 Bilibili 图片，调用后端接口转换为 base64
        invoke<string>('fetch_bilibili_image', {url})
            .then((dataUrl) => {
                if (!useOriginUrl) setSrc(dataUrl);
            })
            .catch((e) => {
                console.error('fetch_image failed', e);
                if (!useOriginUrl) setSrc(url); // 失败时回退显示原图
            });

        return () => {
            useOriginUrl = true;
        };
    }, [url]);

    return src ? (
        <img src={src} alt={alt} className={className}/>
    ) : (
        <div className={className} style={{background: '#eee'}}/>
    );
};

export default AniImage;
