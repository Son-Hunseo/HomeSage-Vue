<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import { useAuthStore } from '@/stores/auth-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/pagination'
import { useProductModal } from '@/composables/useProductModal'
import { formatDateTime, formatPrice } from '@/utils/formatters'
import '@/assets/styles/common.css'
import '@/assets/styles/list.css'

const userStore = useUserStore()
const authStore = useAuthStore()

// 페이지네이션 설정
const {
    currentPage,
    paginatedItems: paginatedReservations,
    totalPages,
    changePage,
    goToFirstPage,
    goToLastPage,
    prevPage,
    nextPage,
} = usePagination(computed(() => userStore.reservations))

// 모달 관련 설정
const { showProductDetail, selectedSale, openProductDetail, handleEscape, handleOverlayClick } =
    useProductModal()

// 예약 취소 처리
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
</script>

<template>
    <div class="page-container">
        <h2 class="page-title">예약 목록</h2>

        <div v-if="userStore.reservations.length === 0" class="empty-state">
            예약된 매물이 없습니다.
        </div>

        <div v-else class="list-container">
            <div
                v-for="reservation in paginatedReservations"
                :key="`${reservation.saleId}-${reservation.reservationDatetime}`"
                class="list-item"
                @click="openProductDetail(reservation)"
            >
                <div class="reservation-info">
                    <div class="property-info">
                        <div class="main-info">
                            <span class="property-title">
                                #{{ reservation.saleId }} {{ reservation.saleType }}
                                {{ reservation.homeType }}
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

            <Pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                @change-page="changePage"
                @go-first="goToFirstPage"
                @go-last="goToLastPage"
                @prev-page="prevPage"
                @next-page="nextPage"
            />
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

@media (max-width: 768px) {
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
}
</style>
