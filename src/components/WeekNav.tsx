import { getWeekDays, type WeekDay } from "@/utils/weekUtils";

interface WeekNavProps {
    selectedDate: string;
    onSelect: (day: WeekDay) => void;
}

export default function WeekNav({ selectedDate, onSelect }: WeekNavProps) {
    const days = getWeekDays();

    return (
        <div className="overview-week-nav-wrap">
            <div className="overview-week-nav">
                {days.map((day) => {
                    const active = day.dateStr === selectedDate;
                    return (
                        <button
                            key={day.dateStr}
                            type="button"
                            onClick={() => onSelect(day)}
                            className={`overview-week-btn${active ? " is-active" : ""}`}
                        >
                            <span className="overview-weekday-label">{day.weekdayLabel.replace("星期", "")}</span>
                            <span className={`overview-day-badge${day.isToday ? " is-today" : ""}${active ? " is-active" : ""}`}>
                                {day.dayOfMonth}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
