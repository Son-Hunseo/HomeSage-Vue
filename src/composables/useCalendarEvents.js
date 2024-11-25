import { ref } from 'vue'

export function useCalendarEvents() {
    const currentPages = ref(new Map())

    const formatTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const getEventsForDate = (date, events) => {
        return events
            .filter((event) => {
                const eventDate = new Date(event.reservationDatetime)
                return (
                    eventDate.getFullYear() === date.year &&
                    eventDate.getMonth() + 1 === date.month &&
                    eventDate.getDate() === date.date
                )
            })
            .sort((a, b) => {
                const timeA = new Date(a.reservationDatetime)
                const timeB = new Date(b.reservationDatetime)
                return timeA - timeB
            })
    }

    const getPagedEvents = (date, events, pageSize = 3) => {
        const dateEvents = getEventsForDate(date, events)
        const dateKey = `${date.year}-${date.month}-${date.date}`
        const currentPage = currentPages.value.get(dateKey) || 0
        const startIdx = currentPage * pageSize
        return dateEvents.slice(startIdx, startIdx + pageSize)
    }

    const getTotalPages = (date, events, pageSize = 3) => {
        const dateEvents = getEventsForDate(date, events)
        return Math.max(Math.ceil(dateEvents.length / pageSize), 1)
    }

    const changePage = (date, direction, events, pageSize = 3) => {
        const dateKey = `${date.year}-${date.month}-${date.date}`
        const currentPage = currentPages.value.get(dateKey) || 0
        const totalPages = getTotalPages(date, events, pageSize)

        let newPage = currentPage + direction
        if (newPage < 0) newPage = totalPages - 1
        if (newPage >= totalPages) newPage = 0

        currentPages.value.set(dateKey, newPage)
    }

    const getEventCount = (date, events) => {
        return getEventsForDate(date, events).length
    }

    return {
        currentPages,
        formatTime,
        getEventsForDate,
        getPagedEvents,
        getTotalPages,
        changePage,
        getEventCount,
    }
}
