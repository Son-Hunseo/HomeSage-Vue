```vue
<script setup>
import { defineProps, defineEmits } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'vue-router'

const props = defineProps({
    sale: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])
const userStore = useUserStore()
const calendarStore = useCalendarStore()
const authStore = useAuthStore()
const router = useRouter()
const showReserveModal = ref(false)

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
    if (authStore.isAuthenticated) {
        await Promise.all([userStore.fetchReservations(), userStore.fetchInterestedSales()])
    }
})

const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

const toggleLike = async () => {
    try {
        if (!authStore.isAuthenticated) {
            // const confirmation = confirm(
            //     '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?',
            // )
            // if (confirmation) {
            //     router.push('/login')
            // }
            alert('로그인이 필요한 서비스입니다.')
            return
        }

        await userStore.toggleInterest(props.sale.saleId)
    } catch (error) {
        alert(error.message)
    }
}

const handleReservation = async () => {
    if (!authStore.isAuthenticated) {
        // const confirmation = confirm(
        //     '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?',
        // )
        // if (confirmation) {
        //     router.push('/login')
        // }
        alert('로그인이 필요한 서비스입니다.')
        return
    }

    if (userStore.isReserved(props.sale.saleId)) {
        const confirmation = confirm('예약을 취소하시겠습니까?')
        if (confirmation) {
            try {
                await userStore.cancelReservation(props.sale.saleId)
                alert('예약이 취소되었습니다.')
            } catch (error) {
                alert(error.message)
            }
        }
    } else {
        showReserveModal.value = true
        calendarStore.resetSelection()
    }
}

const submitReservation = async () => {
    const selectedDateTime = calendarStore.getFormattedSelection()
    if (!selectedDateTime) {
        alert('날짜와 시간을 선택해주세요.')
        return
    }

    try {
        await userStore.makeReservation({
            providerUserId: props.sale.providerUserId,
            saleId: props.sale.saleId,
            ...selectedDateTime,
        })

        alert('예약이 완료되었습니다.')
        showReserveModal.value = false
        calendarStore.resetSelection()
    } catch (error) {
        alert(error.message)
    }
}
</script>

<template>
    <div class="product-detail">
        <div class="detail-header">
            <div class="header-content">
                <h1 class="sale-id">매물 #{{ sale.saleId }}</h1>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>
        </div>
        <div class="detail-content">
            <div class="image-container">
                <!-- <img src="/api/placeholder/800/600" alt="매물 상세 이미지" /> -->
            </div>
            <div class="info-section">
                <div class="price-section">
                    <h2 class="price">{{ formatPrice(sale.price) }}</h2>
                    <div class="property-type">
                        <span class="tag">{{ sale.saleType }}</span>
                        <span class="tag">{{ sale.homeType }}</span>
                    </div>
                </div>

                <div class="main-info">
                    <div class="info-row">
                        <span class="label">전/월세</span>
                        <span>{{ sale.monthlyFee ? formatPrice(sale.monthlyFee) : '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">관리비</span>
                        <span>{{ formatPrice(sale.managementFee) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">면적</span>
                        <span>{{ sale.space }}㎡</span>
                    </div>
                    <div class="info-row">
                        <span class="label">층수</span>
                        <span>{{ sale.floor }}층</span>
                    </div>
                    <div class="info-row">
                        <span class="label">주소</span>
                        <span>{{ sale.city }} {{ sale.gu }} {{ sale.dong }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">역세권</span>
                        <span>{{ sale.nearStation }}</span>
                    </div>
                </div>

                <div class="description-section">
                    <h3>상세 설명</h3>
                    <p class="description">{{ sale.description }}</p>
                </div>

                <div class="map-section">
                    <h3>위치</h3>
                    <div class="map-container">
                        <KakaoMap
                            :lat="sale.latitude"
                            :lng="sale.longitude"
                            :level="3"
                            style="width: 100%; height: 200px"
                        >
                            <KakaoMapMarker :lat="sale.latitude" :lng="sale.longitude" />
                        </KakaoMap>
                    </div>
                </div>

                <div class="action-buttons">
                    <button
                        class="like-btn"
                        :class="{ active: userStore.isInterested(sale.saleId) }"
                        @click="toggleLike"
                    >
                        <svg
                            class="heart-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            :fill="userStore.isInterested(sale.saleId) ? 'currentColor' : 'none'"
                        >
                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            ></path>
                        </svg>
                        찜하기
                    </button>
                    <button
                        class="reserve-btn"
                        :class="{ 'cancel-btn': userStore.isReserved(sale.saleId) }"
                        @click="handleReservation"
                    >
                        {{ userStore.isReserved(sale.saleId) ? '예약취소' : '예약하기' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 예약 모달 -->
        <div v-if="showReserveModal" class="modal-overlay">
            <div class="modal">
                <h3>예약하기</h3>
                <div class="modal-content">
                    <!-- 달력 컴포넌트 -->
                    <div class="calendar-section">
                        <div class="calendar-header">
                            <button @click="calendarStore.prevMonth">&lt;</button>
                            <span
                                >{{ calendarStore.currentYear }}.{{
                                    String(calendarStore.currentMonth).padStart(2, '0')
                                }}</span
                            >
                            <button @click="calendarStore.nextMonth">&gt;</button>
                        </div>
                        <div class="calendar-days">
                            <div class="day-header">일</div>
                            <div class="day-header">월</div>
                            <div class="day-header">화</div>
                            <div class="day-header">수</div>
                            <div class="day-header">목</div>
                            <div class="day-header">금</div>
                            <div class="day-header">토</div>
                        </div>
                        <div class="calendar-dates">
                            <div
                                v-for="date in calendarStore.calendarDates"
                                :key="`${date.year}-${date.month}-${date.date}`"
                                class="date-cell"
                                :class="{
                                    disabled: !date.isCurrentMonth || date.isPast,
                                    selected: calendarStore.isSelectedDate(date),
                                    today: calendarStore.isToday(date),
                                }"
                                @click="calendarStore.selectDate(date)"
                            >
                                {{ date.date }}
                            </div>
                        </div>
                    </div>

                    <!-- 시간 선택 -->
                    <div class="time-section">
                        <h4>오전</h4>
                        <div class="time-grid">
                            <button
                                v-for="time in calendarStore.morningTimes"
                                :key="time"
                                class="time-btn"
                                :class="{ selected: calendarStore.selectedTime === time }"
                                @click="calendarStore.selectTime(time)"
                            >
                                {{ time }}
                            </button>
                        </div>
                        <h4>오후</h4>
                        <div class="time-grid">
                            <button
                                v-for="time in calendarStore.afternoonTimes"
                                :key="time"
                                class="time-btn"
                                :class="{ selected: calendarStore.selectedTime === time }"
                                @click="calendarStore.selectTime(time)"
                            >
                                {{ time }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button @click="showReserveModal = false">취소</button>
                    <button
                        class="confirm-btn"
                        @click="submitReservation"
                        :disabled="!calendarStore.selectedDate || !calendarStore.selectedTime"
                    >
                        예약하기
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
}

.detail-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e5e5;
    background: #f8f9fa;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sale-id {
    font-size: 18px;
    margin: 0;
    color: #4a4a4a;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    color: #666;
}

.detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.image-container {
    width: 100%;
    height: 300px;
    margin-bottom: 24px;
    border-radius: 8px;
    background: #f1f1f1;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.price-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e5e5;
}

.price {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    color: #2c3e50;
}

.property-type {
    display: flex;
    gap: 8px;
}

.tag {
    padding: 4px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 500;
}

.main-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.info-row {
    display: flex;
    gap: 16px;
}

.label {
    min-width: 80px;
    color: #666;
    font-weight: 500;
}

.description-section h3,
.map-section h3 {
    font-size: 16px;
    color: #2c3e50;
    margin-bottom: 12px;
}

.description {
    white-space: pre-line;
    color: #424242;
    line-height: 1.6;
}

.map-container {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    margin-bottom: 24px;
}

.action-buttons {
    display: flex;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid #e5e5e5;
}

.like-btn,
.reserve-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.heart-icon {
    width: 20px;
    height: 20px;
    transition: all 0.2s ease;
}

.like-btn {
    background: white;
    border: 1px solid #e5e5e5;
    color: #666;
}

.like-btn.active {
    background: #fff0f6;
    border-color: #f06595;
    color: #f06595;
}

.like-btn:hover .heart-icon {
    transform: scale(1.1);
}

.reserve-btn {
    background: #4a90e2;
    border: none;
    color: white;
}

.reserve-btn:hover {
    background: #357abd;
}

.reserve-btn.cancel-btn {
    background: #e74c3c;
}

.reserve-btn.cancel-btn:hover {
    background: #c0392b;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 24px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
}

.modal h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
}

.modal h4 {
    margin: 16px 0 8px 0;
    font-size: 14px;
    color: #666;
}

.modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 달력 스타일 */
.calendar-section {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
}

.calendar-header button {
    border: none;
    background: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    color: #666;
}

.calendar-header button:hover {
    color: #4a90e2;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
}

.day-header {
    text-align: center;
    font-size: 12px;
    color: #666;
    padding: 4px 0;
}

.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.date-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.date-cell:hover:not(.disabled) {
    background: #f5f5f5;
}

.date-cell.disabled {
    color: #ccc;
    cursor: not-allowed;
}

.date-cell.selected {
    background: #4a90e2;
    color: white;
}

.date-cell.today {
    border: 1px solid #4a90e2;
}

/* 시간 선택 스타일 */
.time-section {
    margin-top: 16px;
}

.time-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.time-btn {
    padding: 8px;
    border: 1px solid #e5e5e5;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.time-btn:hover:not(.selected) {
    background: #f5f5f5;
}

.time-btn.selected {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
}

.modal-actions button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.modal-actions .confirm-btn {
    background: #4a90e2;
    color: white;
    border: none;
}

.modal-actions .confirm-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.modal-actions button:not(.confirm-btn) {
    background: white;
    border: 1px solid #ddd;
}

/* 스크롤바 스타일 */
.detail-content::-webkit-scrollbar {
    width: 6px;
}

.detail-content::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.detail-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
    .detail-content {
        padding: 16px;
    }

    .price {
        font-size: 24px;
    }

    .image-container {
        height: 250px;
    }

    .modal {
        width: 95%;
        padding: 20px;
    }

    .time-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 애니메이션 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-overlay {
    animation: fadeIn 0.2s ease;
}

.modal {
    animation: slideIn 0.3s ease;
}
</style>
