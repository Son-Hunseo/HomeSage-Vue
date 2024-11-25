<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar-store'
import { useUserStore } from '@/stores/user-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'

const calendarStore = useCalendarStore()
const userStore = useUserStore()
const error = ref(null)
const currentPages = ref(new Map())

// 모달 관련 상태
const showProductDetail = ref(false)
const selectedSale = ref(null)

// 날짜/시간 포맷팅 함수
const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

// 가격 포맷팅
const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

// 데이터 로드
const loadReservations = async () => {
    try {
        isLoading.value = true
        error.value = null
        await userStore.fetchProviderReservations()
    } catch (e) {
        error.value = e.message
    } finally {
        isLoading.value = false
    }
}

// 해당 날짜의 예약 목록 확인 (시간순 정렬)
const getReservationsForDate = (date) => {
    return userStore.providerReservations
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
    return Math.max(Math.ceil(reservations.length / 3), 1)
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

// 모달 열기
const openProductDetail = (reservation) => {
    selectedSale.value = {
        saleId: reservation.saleId,
        providerUserId: reservation.providerUserId,
        saleType: reservation.saleType,
        homeType: reservation.homeType,
        price: reservation.price,
        monthlyFee: reservation.monthlyFee,
        managementFee: reservation.managementFee,
        space: reservation.space,
        description: reservation.description,
        floor: reservation.floor,
        nearStation: reservation.nearStation,
        city: reservation.city,
        gu: reservation.gu,
        dong: reservation.dong,
        latitude: Number(reservation.latitude),
        longitude: Number(reservation.longitude),
        saleImgUrl: reservation.saleImgUrl,
    }
    showProductDetail.value = true
}

// ESC 키로 모달 닫기
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        showProductDetail.value = false
    }
}

// 오버레이 클릭으로 모달 닫기
const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        showProductDetail.value = false
    }
}

onMounted(() => {
    loadReservations()
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <div class="calendar-container">
        <h2 class="title">예약 일정</h2>
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
                            <button class="nav-btn" @click.stop="changePage(date, -1)">&lt;</button>
                            <div class="page-indicator">
                                {{
                                    (currentPages.get(`${date.year}-${date.month}-${date.date}`) ||
                                        0) + 1
                                }}/{{ getTotalPages(date) }}
                            </div>
                            <button class="nav-btn" @click.stop="changePage(date, 1)">&gt;</button>
                        </div>
                        <div
                            v-for="reservation in getPagedReservations(date)"
                            :key="`${reservation.saleId}-${reservation.reservationDatetime}`"
                            class="event"
                            @click="openProductDetail(reservation)"
                        >
                            <div class="event-time">
                                {{ formatTime(reservation.reservationDatetime) }}
                            </div>
                            <div class="event-info">
                                <div class="event-title">
                                    {{ reservation.homeType }} /
                                    {{ reservation.saleType }}
                                </div>
                                <div class="event-price">
                                    {{ formatPrice(reservation.price) }}
                                </div>
                            </div>
                            <div class="event-customer">
                                예약자 ID: {{ reservation.consumerUserId }}
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
.calendar-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.loading,
.error {
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f5f5f5;
    border-radius: 8px;
}

.error {
    color: #dc3545;
    background: #ffebee;
}

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
    min-height: 120px;
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
    color: #4a90e2;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    line-height: 1;
    background: white; /* 기본 배경색 (이번달) */
}

.other-month .nav-btn {
    background: #f8f9fa; /* 다음달 배경색 */
}

.nav-btn:hover {
    background: white;
}

.page-indicator {
    font-size: 10px;
    color: #666;
}

.event {
    cursor: pointer;
    background: #4a90e2;
    color: white;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    transition: background-color 0.2s;
}

.event:hover {
    background: #357abd;
}

.event-time {
    font-weight: 500;
    font-size: 11px;
}

.event-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2px 0;
}

.event-title {
    font-size: 11px;
    font-weight: 500;
}

.event-price {
    font-size: 11px;
}

.event-customer {
    font-size: 10px;
    opacity: 0.8;
    margin-top: 2px;
}

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

.refresh-button {
    margin-top: 20px;
    padding: 8px 16px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
}

.refresh-button:hover {
    background: #45a049;
}

@media (max-width: 768px) {
    .calendar {
        padding: 16px;
    }

    .calendar-cell {
        min-height: 100px;
        padding: 4px;
    }

    .event {
        padding: 4px 6px;
    }

    .event-time,
    .event-title,
    .event-price,
    .event-customer {
        font-size: 10px;
    }

    .modal-container {
        width: 95%;
        height: 90vh;
    }
}
</style>
