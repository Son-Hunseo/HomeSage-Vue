<script setup>
import { ref, onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar-store'
import { useUserStore } from '@/stores/user-store'

const calendarStore = useCalendarStore()
const userStore = useUserStore()

// 각 날짜별 현재 페이지를 저장하는 Map
const currentPages = ref(new Map())

const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

onMounted(async () => {
    await userStore.fetchReservations()
})

// 해당 날짜의 예약 목록 확인 (시간순 정렬)
const getReservationsForDate = (date) => {
    return userStore.reservations
        .filter((reservation) => {
            const reserveDate = new Date(reservation.reservationDatetime)
            return (
                reserveDate.getFullYear() === date.year &&
                reserveDate.getMonth() + 1 === date.month &&
                reserveDate.getDate() === date.date
            )
        })
        .sort((a, b) => {
            const timeA = new Date(a.reservationDatetime)
            const timeB = new Date(b.reservationDatetime)
            return timeA - timeB
        })
}

// 페이지별 예약 목록 가져오기
const getPagedReservations = (date) => {
    const reservations = getReservationsForDate(date)
    const dateKey = `${date.year}-${date.month}-${date.date}`
    const currentPage = currentPages.value.get(dateKey) || 0
    const startIdx = currentPage * 3
    return reservations.slice(startIdx, startIdx + 3)
}

// 총 페이지 수 계산
const getTotalPages = (date) => {
    const reservations = getReservationsForDate(date)
    return Math.ceil(reservations.length / 3)
}

// 페이지 이동
const changePage = (date, direction) => {
    const dateKey = `${date.year}-${date.month}-${date.date}`
    const currentPage = currentPages.value.get(dateKey) || 0
    const totalPages = getTotalPages(date)

    let newPage = currentPage + direction
    if (newPage < 0) newPage = totalPages - 1
    if (newPage >= totalPages) newPage = 0

    currentPages.value.set(dateKey, newPage)
}

// 날짜별 예약 개수
const getReservationCount = (date) => {
    return getReservationsForDate(date).length
}
</script>

<template>
    <div class="calendar">
        <div class="calendar-header">
            <button @click="calendarStore.prevMonth">&lt;</button>
            <h2>
                {{ calendarStore.currentYear }}.{{
                    String(calendarStore.currentMonth).padStart(2, '0')
                }}
            </h2>
            <button @click="calendarStore.nextMonth">&gt;</button>
        </div>

        <div class="calendar-grid">
            <div class="weekday-header">일</div>
            <div class="weekday-header">월</div>
            <div class="weekday-header">화</div>
            <div class="weekday-header">수</div>
            <div class="weekday-header">목</div>
            <div class="weekday-header">금</div>
            <div class="weekday-header">토</div>

            <div
                v-for="date in calendarStore.calendarDates"
                :key="`${date.year}-${date.month}-${date.date}`"
                class="calendar-cell"
                :class="{
                    'other-month': !date.isCurrentMonth,
                    today: calendarStore.isToday(date),
                    'has-events': getReservationCount(date) > 0,
                }"
            >
                <div class="date-number">{{ date.date }}</div>
                <div class="events-container">
                    <div v-if="getReservationCount(date) > 0" class="events-navigation">
                        <button
                            v-if="getReservationCount(date) > 3"
                            class="nav-btn"
                            @click.stop="changePage(date, -1)"
                        >
                            &lt;
                        </button>
                        <div class="page-indicator" v-if="getReservationCount(date) > 3">
                            {{
                                (currentPages.get(`${date.year}-${date.month}-${date.date}`) || 0) +
                                1
                            }}/{{ getTotalPages(date) }}
                        </div>
                        <button
                            v-if="getReservationCount(date) > 3"
                            class="nav-btn"
                            @click.stop="changePage(date, 1)"
                        >
                            &gt;
                        </button>
                    </div>
                    <div
                        v-for="reservation in getPagedReservations(date)"
                        :key="`${reservation.saleId}-${reservation.reservationDatetime}`"
                        class="event"
                    >
                        <div class="event-time">
                            {{ formatTime(reservation.reservationDatetime) }}
                        </div>
                        <div class="event-title">
                            {{ reservation.saleType }} {{ reservation.homeType }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.calendar-header button {
    padding: 8px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
    color: #4a90e2;
}

.calendar-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.weekday-header {
    text-align: center;
    padding: 12px;
    font-weight: 500;
    color: #666;
    background: #f8f9fa;
}

.calendar-cell {
    min-height: 100px;
    padding: 8px;
    border: 1px solid #e5e5e5;
    background: white;
}

.date-number {
    font-size: 14px;
    margin-bottom: 4px;
    color: #2c3e50;
}

.other-month {
    background: #f8f9fa;
    .date-number {
        color: #999;
    }
}

.today {
    .date-number {
        color: #4a90e2;
        font-weight: 600;
    }
}

.has-events {
    background: #f8f9fa;
}

.events-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.events-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
}

.nav-btn {
    padding: 1px 4px;
    border: none;
    background: #4a90e2;
    color: white;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    line-height: 1;
}

.nav-btn:hover {
    background: #357abd;
}

.page-indicator {
    font-size: 10px;
    color: #666;
}

.event {
    background: #4a90e2;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.event-time {
    font-weight: 500;
}

.event-title {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .calendar {
        padding: 16px;
    }

    .calendar-cell {
        min-height: 80px;
        padding: 4px;
    }

    .event {
        padding: 2px 4px;
    }

    .events-navigation {
        margin-bottom: 2px;
    }

    .nav-btn {
        padding: 0 3px;
        font-size: 9px;
    }

    .page-indicator {
        font-size: 9px;
    }
}
</style>
