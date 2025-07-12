import type {Ani} from "../components/AniItem.tsx";

export function getAniId(ani: Ani): string {
    return `${ani.title}-${ani.image_url}`;
}
