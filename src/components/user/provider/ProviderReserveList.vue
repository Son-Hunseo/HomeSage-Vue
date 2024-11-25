<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'

const userStore = useUserStore()
const currentPage = ref(1)
const itemsPerPage = 10

// 모달 관련 상태
const showProductDetail = ref(false)
const selectedSale = ref(null)

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

// 가격 포맷팅
const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

// 페이지네이션된 예약 목록
const paginatedReservations = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return userStore.providerReservations.slice(startIndex, endIndex)
})

// 총 페이지 수
const totalPages = computed(() => {
    return Math.ceil(userStore.providerReservations.length / itemsPerPage)
})

// 모달 관련 함수
const openProductDetail = (sale) => {
    selectedSale.value = sale
    showProductDetail.value = true
}

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

// 페이지네이션 관련 함수
const changePage = (page) => {
    currentPage.value = page
}

const goToFirstPage = () => {
    currentPage.value = 1
}

const goToLastPage = () => {
    currentPage.value = totalPages.value
}

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

onMounted(() => {
    userStore.fetchProviderReservations()
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <div class="reservations-container">
        <h2 class="title">예약 관리</h2>

        <div v-if="userStore.providerReservations.length === 0" class="empty-state">
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
                v-for="reservation in paginatedReservations"
                :key="reservation.saleId"
                class="reservation-item"
            >
                <div class="col-property" @click="openProductDetail(reservation)">
                    <div class="property-type">
                        {{ reservation.homeType }} /
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

            <!-- 페이지네이션 UI -->
            <div class="pagination">
                <button class="pagination-btn" :disabled="currentPage === 1" @click="goToFirstPage">
                    &lt;&lt;
                </button>

                <button class="pagination-btn" :disabled="currentPage === 1" @click="prevPage">
                    &lt;
                </button>

                <button
                    v-for="page in totalPages"
                    :key="page"
                    class="pagination-btn"
                    :class="{ active: currentPage === page }"
                    @click="changePage(page)"
                >
                    {{ page }}
                </button>

                <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                >
                    &gt;
                </button>

                <button
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="goToLastPage"
                >
                    &gt;&gt;
                </button>
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

.empty-state {
    text-align: center;
    padding: 40px;
    color: #666;
    background: #f5f5f5;
    border-radius: 8px;
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

.pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    background: white;
    border-top: 1px solid #dee2e6;
}

.pagination-btn {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    background: white;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
}

.pagination-btn.active {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.pagination-btn:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
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

@media (max-width: 768px) {
    .modal-container {
        width: 95%;
        height: 90vh;
    }

    .pagination {
        gap: 4px;
    }

    .pagination-btn {
        padding: 6px 10px;
        font-size: 0.9em;
    }
}
</style>
