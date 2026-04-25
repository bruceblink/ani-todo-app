import { getWeekDays, type WeekDay } from "@/utils/weekUtils";

interface WeekNavProps {
    selectedDate: string;       // "YYYY/MM/DD"
    onSelect: (day: WeekDay) => void;
}

export default function WeekNav({ selectedDate, onSelect }: WeekNavProps) {
    const days = getWeekDays();

    return (
        <div
            style={{
                display: 'flex',
                gap: 4,
                padding: '0 24px',
                maxWidth: 960,
                margin: '0 auto',
                width: '100%',
                overflowX: 'auto',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}
        >
            {days.map(day => {
                const active = day.dateStr === selectedDate;
                return (
                    <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => onSelect(day)}
                        style={{
                            flex: 1,
                            minWidth: 52,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            padding: '8px 4px',
                            borderRadius: 12,
                            border: active
                                ? '1.5px solid var(--color-primary)'
                                : '1.5px solid transparent',
                            background: active
                                ? 'var(--color-primary-light)'
                                : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                color: active ? 'var(--color-primary-text)' : 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {day.weekdayLabel.replace('星期', '')}
                        </span>
                        <span
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.88rem',
                                fontWeight: active ? 700 : 400,
                                background: day.isToday && !active
                                    ? 'var(--color-primary)'
                                    : active
                                        ? 'var(--color-primary)'
                                        : 'transparent',
                                color: day.isToday || active ? '#fff' : 'var(--text-primary)',
                            }}
                        >
                            {day.dayOfMonth}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
