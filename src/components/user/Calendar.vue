<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar-store'
import { useUserStore } from '@/stores/user-store'
import { useCalendarEvents } from '@/composables/useCalendarEvents'
import { useProductModal } from '@/composables/useProductModal'
import ProductDetail from '@/components/sale/ProductDetail.vue'
import '@/assets/styles/calendar.css'

const calendarStore = useCalendarStore()
const userStore = useUserStore()

const { currentPages, formatTime, getPagedEvents, getTotalPages, changePage } = useCalendarEvents()

const { showProductDetail, selectedSale, openProductDetail, handleEscape, handleOverlayClick } =
    useProductModal()

onMounted(async () => {
    await userStore.fetchReservations()
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <div class="calendar-container">
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
                    }"
                >
                    <div class="date-number">{{ date.date }}</div>
                    <div class="events-container">
                        <div class="events-navigation">
                            <button
                                class="nav-btn"
                                @click.stop="changePage(date, -1, userStore.reservations)"
                            >
                                &lt;
                            </button>
                            <div class="page-indicator">
                                {{
                                    (currentPages.get(`${date.year}-${date.month}-${date.date}`) ||
                                        0) + 1
                                }}/{{ getTotalPages(date, userStore.reservations) }}
                            </div>
                            <button
                                class="nav-btn"
                                @click.stop="changePage(date, 1, userStore.reservations)"
                            >
                                &gt;
                            </button>
                        </div>
                        <div
                            v-for="reservation in getPagedEvents(date, userStore.reservations)"
                            :key="`${reservation.saleId}-${reservation.reservationDatetime}`"
                            class="event"
                            @click="openProductDetail(reservation)"
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

        <!-- ProductDetail 모달 -->
        <div
            v-if="showProductDetail && selectedSale"
            class="modal-overlay"
            @click="handleOverlayClick"
        >
            <div class="modal-container">
                <ProductDetail :sale="selectedSale" @close="showProductDetail = false" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    height: 90vh;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-container > :deep(.product-detail) {
    height: 100%;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .modal-container {
        width: 95%;
        height: 90vh;
    }
}
</style>
