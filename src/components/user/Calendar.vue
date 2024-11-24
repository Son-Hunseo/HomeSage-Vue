<script setup>
import { onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar-store'
import { useUserStore } from '@/stores/user-store'

const calendarStore = useCalendarStore()
const userStore = useUserStore()

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
                    'has-events': getReservationsForDate(date).length > 0,
                }"
            >
                <div class="date-number">{{ date.date }}</div>
                <div class="events-container">
                    <div
                        v-for="reservation in getReservationsForDate(date)"
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
}
</style>
