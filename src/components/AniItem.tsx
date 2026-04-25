import { useState } from "react";
import { toast } from "react-hot-toast";
import { Star, Check } from "lucide-react";
import type { Ani } from "@/utils/api";
import AniInfo from "./AniInfo";

import {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
} from "@mui/material";

interface Props {
    ani: Ani;
    onClear: (id: number, title: string) => void;
    isFavorite: boolean;
    onToggleFavorite: (
        id: number,
        aniTitle: string,
        isFavorite: boolean | number
    ) => void;
}

export default function AniItem({
    ani,
    onClear,
    isFavorite,
    onToggleFavorite,
}: Props) {
    const aniInfo = `《${ani.title}》第${ani.update_count}集`;
    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, ani.title, isFavorite);
        toast(
            isFavorite ? `已取消关注《${ani.title}》` : `已关注《${ani.title}》`,
            { icon: isFavorite ? "💔" : "⭐️" }
        );
    };

    const handleConfirm = () => {
        onClear(ani.id, ani.title);
        if (isFavorite) {
            onToggleFavorite(ani.id, ani.title, 0);
        }
        toast.success(`已标记观看 ${aniInfo}`);
        setOpen(false);
    };

    return (
        <>
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'relative',
                    background: 'var(--bg-surface)',
                    borderRadius: 14,
                    border: `1.5px solid ${isHovered ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    boxShadow: isHovered
                        ? 'var(--shadow-lg), 0 0 0 3px var(--color-primary-light)'
                        : 'var(--shadow-sm)',
                    transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    cursor: 'default',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {/* Favorite button */}
                <button
                    onClick={handleFavorClick}
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        background: isFavorite
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'var(--bg-overlay)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '50%',
                        border: isFavorite ? '1.5px solid rgba(245,158,11,0.3)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isFavorite ? 1 : isHovered ? 1 : 0,
                        transform: `scale(${isFavorite || isHovered ? 1 : 0.7})`,
                        zIndex: 10,
                    }}
                    title={isFavorite ? "取消关注" : "关注"}
                >
                    <Star
                        size={15}
                        fill={isFavorite ? "#F59E0B" : "none"}
                        color={isFavorite ? "#F59E0B" : "#9ca3af"}
                        strokeWidth={2}
                    />
                </button>

                {/* Mark watched button */}
                <button
                    onClick={() => setOpen(true)}
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        background: isHovered
                            ? 'rgba(16, 185, 129, 0.9)'
                            : 'var(--bg-overlay)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isHovered ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                        opacity: isHovered ? 1 : 0,
                        transform: `scale(${isHovered ? 1 : 0.7})`,
                        zIndex: 10,
                    }}
                    title="标记为已观看"
                >
                    <Check
                        size={15}
                        color={isHovered ? "#fff" : "#9ca3af"}
                        strokeWidth={2.5}
                    />
                </button>

                <AniInfo ani={ani} />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>确认观看</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确认已观看 <strong>{aniInfo}</strong>？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>
                        取消
                    </Button>
                    <Button onClick={handleConfirm} variant="contained" color="success">
                        确认观看
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
