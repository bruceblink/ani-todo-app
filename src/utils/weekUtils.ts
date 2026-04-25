/**
 * Returns the Mon–Sun week that contains `baseDate`.
 * Each entry: { dateStr: "YYYY/MM/DD", weekdayLabel: "星期X", isToday: bool }
 */
export interface WeekDay {
    dateStr: string;      // "2025/04/21"
    weekdayLabel: string; // "星期一" … "星期日"
    isToday: boolean;
    dayOfMonth: number;   // just the number, for display
}

const WEEKDAY_CN = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

export function getWeekDays(baseDate: Date = new Date()): WeekDay[] {
    const todayStr = toDateStr(new Date());
    // JS: 0=Sun,1=Mon,...,6=Sat  →  convert to Mon=0
    const dow = (baseDate.getDay() + 6) % 7; // Mon=0..Sun=6
    // Monday of the same week
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - dow);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = toDateStr(d);
        return {
            dateStr,
            weekdayLabel: WEEKDAY_CN[i],
            isToday: dateStr === todayStr,
            dayOfMonth: d.getDate(),
        };
    });
}

export function getTodayDateStr(): string {
    return toDateStr(new Date());
}

export function getTodayWeekdayLabel(): string {
    const dow = (new Date().getDay() + 6) % 7;
    return WEEKDAY_CN[dow];
}
