<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user-store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(true)
const error = ref(null)

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date)
}

// 매물 타입 한글 변환
const getSaleTypeText = (type) => {
    switch (type) {
        case 'MONTHLY':
            return '월세'
        case 'YEARLY':
            return '전세'
        case 'PURCHASE':
            return '매매'
        default:
            return type
    }
}

// 집 타입 한글 변환
const getHomeTypeText = (type) => {
    switch (type) {
        case 'APARTMENT':
            return '아파트'
        case 'VILLA':
            return '빌라'
        case 'OFFICETEL':
            return '오피스텔'
        case 'HOUSE':
            return '단독주택'
        default:
            return type
    }
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

// 매물 상세 페이지로 이동
const goToSaleDetail = (saleId) => {
    router.push(`/sale/${saleId}`)
}

onMounted(() => {
    loadReservations()
})
</script>

<template>
    <div class="reservations-container">
        <h2 class="title">예약 관리</h2>

        <div v-if="isLoading" class="loading">데이터를 불러오는 중...</div>

        <div v-else-if="error" class="error">
            {{ error }}
        </div>

        <div v-else-if="userStore.providerReservations.length === 0" class="empty-state">
            예약된 매물이 없습니다.
        </div>

        <div v-else class="reservations-list">
            <div class="reservations-header">
                <div class="col-property">매물 정보</div>
                <div class="col-customer">예약자</div>
                <div class="col-date">예약 일시</div>
                <div class="col-price">가격</div>
            </div>

            <div
                v-for="reservation in userStore.providerReservations"
                :key="reservation.saleId"
                class="reservation-item"
            >
                <div class="col-property" @click="goToSaleDetail(reservation.saleId)">
                    <div class="property-type">
                        {{ getHomeTypeText(reservation.homeType) }} /
                        {{ getSaleTypeText(reservation.saleType) }}
                    </div>
                    <div class="property-address">
                        {{ reservation.cityGuDong }} {{ reservation.floor }}층
                    </div>
                    <div class="property-info">
                        {{ reservation.space }}평 | {{ reservation.nearStation }}
                    </div>
                </div>

                <div class="col-customer">
                    <div class="customer-id">예약자 ID: {{ reservation.consumerUserId }}</div>
                </div>

                <div class="col-date">
                    {{ formatDate(reservation.reservationDatetime) }}
                </div>

                <div class="col-price">
                    <div class="price">{{ formatPrice(reservation.price) }}</div>
                    <div v-if="reservation.monthlyFee" class="monthly-fee">
                        월세: {{ formatPrice(reservation.monthlyFee) }}
                    </div>
                    <div v-if="reservation.managementFee" class="management-fee">
                        관리비: {{ formatPrice(reservation.managementFee) }}
                    </div>
                </div>
            </div>
        </div>

        <button @click="loadReservations" class="refresh-button">새로고침</button>
    </div>
</template>

<style scoped>
.reservations-container {
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
.error,
.empty-state {
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

.reservations-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reservations-header {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 2fr;
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-weight: bold;
    border-radius: 8px 8px 0 0;
}

.reservation-item {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 2fr;
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
    align-items: center;
}

.reservation-item:hover {
    background: #f8f9fa;
}

.col-property {
    cursor: pointer;
}

.property-type {
    font-weight: bold;
    color: #2c3e50;
}

.property-address {
    font-size: 0.9em;
    color: #666;
    margin-top: 4px;
}

.property-info {
    font-size: 0.9em;
    color: #666;
    margin-top: 2px;
}

.customer-id {
    font-size: 0.9em;
    color: #666;
}

.price {
    font-weight: bold;
    color: #2c3e50;
}

.monthly-fee,
.management-fee {
    font-size: 0.9em;
    color: #666;
    margin-top: 2px;
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
}

.refresh-button:hover {
    background: #45a049;
}
</style>
