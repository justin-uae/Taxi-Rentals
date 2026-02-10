// Helper function to format date from MM/DD/YYYY to readable format
export const formatDateDisplay = (dateString: string) => {
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    const dayNum = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const fullYear = date.getFullYear();

    // Get ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${dayNum}${getOrdinal(dayNum)} ${weekday} ${fullYear}`;
};

export const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

export const formatDateWithOrdinal = (date: Date) => {
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const year = date.getFullYear();

    // Get ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${weekday} ${year}`;
};

export const generateCalendar = (currentMonthDate: Date) => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day));
    }

    return days;
};

// Check if date is less than 12 hours from now
export const isDateWithin12Hours = (date: Date) => {
    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    return date < twelveHoursFromNow;
};

export const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

// Generate time slots with 12-hour restriction
export const generateTimeSlots = (date: Date) => {
    const times: string[] = [];
    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // Check if selected date is today or in the future
    const isToday = date.toDateString() === now.toDateString();
    const isFutureDate = date > now;

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            const time = `${h}:${m}`;

            // Create datetime for this slot
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, minute, 0, 0);

            // If it's today, check if it's at least 12 hours from now
            if (isToday) {
                if (slotDateTime >= twelveHoursFromNow) {
                    times.push(time);
                }
            } else if (isFutureDate) {
                // For future dates, all times are allowed
                times.push(time);
            } else {
                // For past dates, no times allowed
                // This case shouldn't happen due to date validation
            }
        }
    }
    return times;
};

// Update selected time to ensure it's at least 12 hours from now
export const updateSelectedTimeToValid = (date: Date, currentTime: string) => {
    const timeSlots = generateTimeSlots(date);

    if (timeSlots.length === 0) {
        // No valid times for today, set to first available time tomorrow
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstValidTime = '00:00';
        return { date: tomorrow, time: firstValidTime };
    }

    // Check if current time is valid
    if (!timeSlots.includes(currentTime)) {
        // Find the next valid time
        const nextValidTime = timeSlots[0];
        return { date, time: nextValidTime };
    }

    return { date, time: currentTime };
};

// Helper function to check if a time slot is at least 12 hours from now
export const isTimeAtLeast12HoursFromNow = (date: Date, time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    return selectedDateTime >= twelveHoursFromNow;
};

// Helper function to get category text based on car type
export const getCategoryText = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('standard sedan')) {
        return 'Or a similar standard sedan';
    } else if (lowerType.includes('vip luxury sedan')) {
        return 'Or a similar VIP luxury sedan';
    } else if (lowerType.includes('luxury sedan')) {
        return 'Or a similar luxury sedan';
    } else if (lowerType.includes('executive minivan')) {
        return 'Or a similar executive minivan';
    } else if (lowerType.includes('luxury suv')) {
        return 'Or a similar luxury SUV';
    } else if (lowerType.includes('luxury limousine')) {
        return 'Or a similar luxury limousine';
    } else if (lowerType.includes('budget group transport')) {
        return 'Or a similar budget transport';
    } else if (lowerType.includes('executive minibus')) {
        return 'Or a similar executive minibus';
    } else if (lowerType.includes('large group transport')) {
        return 'Or a similar large transport';
    } else if (lowerType.includes('luxury vip group transport')) {
        return 'Or a similar VIP luxury transport';
    } else if (lowerType.includes('luxury group transport')) {
        return 'Or a similar luxury transport';
    } else {
        return 'Or a similar vehicle';
    }
};