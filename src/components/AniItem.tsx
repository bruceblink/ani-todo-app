import { useState } from "react";
import { toast } from "react-hot-toast";
import { Star, X } from "lucide-react";
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
    onClear: (id: number) => void;
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

    const handleClearClick = () => {
        setOpen(true); // 打开确认弹窗
    };

    const handleFavorClick = () => {
        onToggleFavorite(ani.id, ani.title, isFavorite);
        toast(
            isFavorite ? `已取消关注《${ani.title}》` : `关注了《${ani.title}》`,
            { icon: isFavorite ? "💔" : "⭐️" }
        );
    };

    const handleConfirm = () => {
        onClear(ani.id);
        if (isFavorite) {
            onToggleFavorite(ani.id, ani.title, 0);
        }
        toast.success(`已经观看了${aniInfo} 这部番剧`);
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <div
                className="ani-item"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    position: "relative",
                    padding: 16,
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: isHovered
                        ? "0 16px 32px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"
                        : "0 1px 3px rgba(0,0,0,0.1)",
                    border: `1px solid ${isHovered ? "#646cff" : "#eee"}`,
                    transition:
                        "transform 0.3s cubic-bezier(0.25,0.8,0.25,1), box-shadow 0.3s cubic-bezier(0.25,0.8,0.25,1), border-color 0.3s ease",
                    cursor: "default",
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    transform: isHovered ? "translateY(-6px) scale(1.02)" : "none",
                    minHeight: "100%",
                }}
            >
                {/* 关注按钮 */}
                <button
                    onClick={handleFavorClick}
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        background: isHovered ? "#fff" : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isHovered
                            ? "0 4px 12px rgba(251,191,36,0.3)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                        opacity: isFavorite ? 1 : isHovered ? 1 : 0,
                        transform: `scale(${isFavorite ? 1 : isHovered ? 1 : 0.8})`,
                        zIndex: 10,
                    }}
                    title={isFavorite ? "取消关注" : "关注"}
                >
                    <Star
                        size={18}
                        fill={isFavorite ? "#FBBF24" : "none"}
                        color={isFavorite ? "#FBBF24" : "#666"}
                        strokeWidth={2.5}
                    />
                </button>

                {/* 标记为已观看 */}
                <button
                    onClick={handleClearClick}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        background: isHovered
                            ? "rgba(255,59,48,0.95)"
                            : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isHovered
                            ? "0 4px 8px rgba(255,59,48,0.25)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                        opacity: isHovered ? 1 : 0,
                        transform: `scale(${isHovered ? 1 : 0.8})`,
                        color: isHovered ? "#fff" : "#666",
                        zIndex: 10,
                    }}
                    title="标记为已观看"
                >
                    <X size={18} color={isHovered ? "#fff" : "#666"} strokeWidth={2.5} />
                </button>

                <AniInfo ani={ani} />
            </div>

            {/* MUI Dialog */}
            <Dialog open={open} onClose={handleCancel}>
                <DialogTitle>确认观看</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        你确定观看过 <strong>{aniInfo}</strong> 这部番剧吗？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>取消</Button>
                    <Button onClick={handleConfirm} color="error">
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}