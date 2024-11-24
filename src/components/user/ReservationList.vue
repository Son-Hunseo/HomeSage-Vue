<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import { useAuthStore } from '@/stores/auth-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'

const userStore = useUserStore()
const authStore = useAuthStore()

const showProductDetail = ref(false)
const selectedSale = ref(null)

onMounted(async () => {
    if (!authStore.isAuthenticated) {
        alert('로그인이 필요한 서비스입니다.')
        return
    }

    try {
        await userStore.fetchReservations()
        document.addEventListener('keydown', handleEscape)
    } catch (error) {
        alert(error.message)
    }
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})

const handleEscape = (e) => {
    if (e.key === 'Escape') {
        showProductDetail.value = false
    }
}

const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        showProductDetail.value = false
    }
}

const formatDateTime = (dateTimeStr) => {
    const dateTime = new Date(dateTimeStr)
    return dateTime.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

const handleCancelReservation = async (saleId) => {
    try {
        const confirmation = confirm('예약을 취소하시겠습니까?')
        if (confirmation) {
            await userStore.cancelReservation(saleId)
            alert('예약이 취소되었습니다.')
        }
    } catch (error) {
        alert(error.message)
    }
}

const openProductDetail = (reservation) => {
    const saleInfo = {
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
        latitude: reservation.latitude,
        longitude: reservation.longitude,
    }
    selectedSale.value = saleInfo
    showProductDetail.value = true
}
</script>

<template>
    <div class="reservation-list">
        <h2 class="page-title">예약 목록</h2>

        <div v-if="userStore.reservations.length === 0" class="empty-state">
            예약된 매물이 없습니다.
        </div>

        <div v-else class="reservations">
            <div
                v-for="reservation in userStore.reservations"
                :key="`${reservation.saleId}-${reservation.reservationDatetime}`"
                class="reservation-item"
                @click="openProductDetail(reservation)"
            >
                <div class="reservation-info">
                    <div class="property-info">
                        <div class="main-info">
                            <span class="property-title">
                                {{ reservation.saleType }} {{ reservation.homeType }}
                            </span>
                            <span class="price">{{ formatPrice(reservation.price) }}</span>
                        </div>
                        <span class="address">
                            {{ reservation.city }} {{ reservation.gu }} {{ reservation.dong }}
                        </span>
                    </div>
                    <div class="visit-info">
                        <span class="visit-date">
                            방문 예정: {{ formatDateTime(reservation.reservationDatetime) }}
                        </span>
                        <button
                            class="cancel-btn"
                            @click.stop="handleCancelReservation(reservation.saleId)"
                        >
                            예약 취소
                        </button>
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
.reservation-list {
    max-width: 1024px;
    margin: 0 auto;
    padding: 32px 24px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 32px;
    color: #2c3e50;
}

.empty-state {
    text-align: center;
    padding: 48px;
    background: #f8f9fa;
    border-radius: 8px;
    color: #666;
    font-size: 16px;
}

.reservations {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.reservation-item {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.reservation-item:hover {
    border-color: #4a90e2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #f8f9fa;
}

.reservation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.property-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.main-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.property-title {
    font-size: 16px;
    font-weight: 500;
    color: #4a90e2;
}

.price {
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
}

.address {
    font-size: 14px;
    color: #666;
}

.visit-info {
    display: flex;
    align-items: center;
    gap: 24px;
}

.visit-date {
    font-size: 14px;
    color: #2c3e50;
    white-space: nowrap;
}

.cancel-btn {
    padding: 8px 16px;
    background: white;
    border: 1px solid #e74c3c;
    color: #e74c3c;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.cancel-btn:hover {
    background: #e74c3c;
    color: white;
}

/* 모달 스타일 */
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
    height: 90vh; /* 높이를 고정 */
    background: white;
    border-radius: 8px;
    overflow: hidden; /* 컨테이너 자체는 overflow hidden */
    display: flex; /* flex 추가 */
    flex-direction: column; /* 세로 방향 정렬 */
}

/* ProductDetail 컴포넌트를 감싸는 div에 스크롤 적용 */
.modal-container > :deep(.product-detail) {
    height: 100%;
    overflow-y: auto;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
    .reservation-list {
        padding: 24px 16px;
    }

    .reservation-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .visit-info {
        width: 100%;
        justify-content: space-between;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #eee;
    }

    .visit-date {
        font-size: 13px;
    }

    .cancel-btn {
        padding: 6px 12px;
        font-size: 13px;
    }

    .modal-container {
        width: 95%;
        height: 90vh;
    }
}
</style>
