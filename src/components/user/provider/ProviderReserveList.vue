<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/pagination'
import { useProductModal } from '@/composables/useProductModal'
import { formatPrice, formatDate } from '@/utils/formatters'
import '@/assets/styles/common.css'
import '@/assets/styles/list.css'

const userStore = useUserStore()

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
} = usePagination(computed(() => userStore.providerReservations))

// 모달 관련 설정
const { showProductDetail, selectedSale, openProductDetail, handleEscape, handleOverlayClick } =
    useProductModal()

onMounted(() => {
    userStore.fetchProviderReservations()
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <div class="page-container">
        <h2 class="page-title">예약 관리</h2>

        <div v-if="userStore.providerReservations.length === 0" class="empty-state">
            예약된 매물이 없습니다.
        </div>

        <div v-else class="list-content">
            <div class="list-header">
                <div class="col-property">매물 정보</div>
                <div class="col-customer">예약자</div>
                <div class="col-date">예약 일시</div>
                <div class="col-price">가격</div>
            </div>

            <div
                v-for="reservation in paginatedReservations"
                :key="reservation.saleId"
                class="list-item"
            >
                <div class="col-property" @click="openProductDetail(reservation)">
                    <div class="property-type">
                        #{{ reservation.saleId }} {{ reservation.homeType }} /
                        {{ reservation.saleType }}
                    </div>
                    <div class="property-address">
                        {{ reservation.cityGuDong }} {{ reservation.floor }}층
                    </div>
                    <div class="property-info">
                        {{ reservation.space }}평 | {{ reservation.nearStation }}
                    </div>
                </div>

                <div class="col-customer">
                    <div class="customer-id">예약자: {{ reservation.consumerUserName }}</div>
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
/* 컴포넌트 고유의 스타일 */
.list-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-header {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 2fr;
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-weight: bold;
    border-radius: 8px 8px 0 0;
}

.list-item {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 2fr;
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
    align-items: center;
}

.col-property {
    cursor: pointer;
}

.property-type {
    font-weight: bold;
    color: #2c3e50;
}

.property-address,
.property-info,
.customer-id {
    font-size: 0.9em;
    color: #666;
    margin-top: 4px;
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
</style>
