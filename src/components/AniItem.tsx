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
    variant?: "grid" | "list";
    onToggleFavorite: (id: number, aniTitle: string, isFavorite: boolean | number) => void;
}

export default function AniItem({
    ani,
    onClear,
    isFavorite,
    variant = "grid",
    onToggleFavorite,
}: Props) {
    const aniInfo = `《${ani.title}》第${ani.update_count}集`;
    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, ani.title, isFavorite);
        toast(isFavorite ? `已取消关注《${ani.title}》` : `已关注《${ani.title}》`, {
            icon: isFavorite ? "💔" : "⭐️",
        });
    };

    const handleConfirm = () => {
        onClear(ani.id, ani.title);
        if (isFavorite) {
            onToggleFavorite(ani.id, ani.title, 0);
        }
        toast.success(`已标记观看 ${aniInfo}`);
        setOpen(false);
    };

    const showFavorite = variant === "list" || isHovered || isFavorite;
    const showWatch = variant === "list" || isHovered;

    return (
        <>
            <div
                className={`ani-item ani-item--${variant}${isHovered ? " is-hovered" : ""}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    type="button"
                    onClick={handleFavorClick}
                    className={`ani-item-action ani-item-action--favorite${showFavorite ? " is-visible" : ""}`}
                    title={isFavorite ? "取消关注" : "关注"}
                >
                    <Star
                        size={15}
                        fill={isFavorite ? "#F59E0B" : "none"}
                        color={isFavorite ? "#F59E0B" : "#9ca3af"}
                        strokeWidth={2}
                    />
                </button>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={`ani-item-action ani-item-action--watch${showWatch ? " is-visible" : ""}`}
                    title="标记为已观看"
                >
                    <Check size={15} color={showWatch ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
                </button>

                <AniInfo ani={ani} variant={variant} />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>确认观看</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确认已观看 <strong>{aniInfo}</strong>？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} sx={{ color: "text.secondary" }}>
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
