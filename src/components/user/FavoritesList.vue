<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user-store'
import { useAuthStore } from '@/stores/auth-store'
import ProductDetail from '@/components/sale/ProductDetail.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/pagination'
import { useProductModal } from '@/composables/useProductModal'
import { formatPrice } from '@/utils/formatters'
import '@/assets/styles/common.css'
import '@/assets/styles/list.css'

const userStore = useUserStore()
const authStore = useAuthStore()

// 페이지네이션 설정
const {
    currentPage,
    paginatedItems: paginatedSales,
    totalPages,
    changePage,
    goToFirstPage,
    goToLastPage,
    prevPage,
    nextPage,
} = usePagination(computed(() => userStore.interestedSales))

// 모달 관련 설정
const { showProductDetail, selectedSale, openProductDetail, handleEscape, handleOverlayClick } =
    useProductModal()

// 찜 해제 처리
const handleRemoveFavorite = async (saleId) => {
    try {
        const confirmation = confirm('찜 목록에서 삭제하시겠습니까?')
        if (confirmation) {
            await userStore.toggleInterest(saleId)
            await userStore.fetchInterestedSales()
        }
    } catch (error) {
        alert(error.message)
    }
}

const handleInterestChanged = async () => {
    await userStore.fetchInterestedSales()
}

onMounted(async () => {
    if (!authStore.isAuthenticated) {
        alert('로그인이 필요한 서비스입니다.')
        return
    }

    try {
        await userStore.fetchInterestedSales()
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
        <h2 class="page-title">찜한 상품</h2>

        <div v-if="userStore.interestedSales.length === 0" class="empty-state">
            찜한 상품이 없습니다.
        </div>

        <div v-else class="list-container">
            <div
                v-for="sale in paginatedSales"
                :key="sale.UserInterestedSaleId"
                class="list-item"
                @click="openProductDetail(sale)"
            >
                <div class="sale-info">
                    <div class="property-info">
                        <div class="main-info">
                            <span class="property-title">
                                #{{ sale.saleId }} {{ sale.saleType }} {{ sale.homeType }}
                            </span>
                            <span class="price">{{ formatPrice(sale.price) }}</span>
                        </div>
                        <span class="address"> {{ sale.city }} {{ sale.gu }} {{ sale.dong }} </span>
                        <div class="details">
                            <span v-if="sale.monthlyFee"
                                >월세 {{ formatPrice(sale.monthlyFee) }} /
                            </span>
                            <span>관리비 {{ formatPrice(sale.managementFee) }} / </span>
                            <span>{{ sale.space }}㎡</span>
                        </div>
                    </div>
                    <div class="action-area">
                        <span class="station" v-if="sale.nearStation">{{ sale.nearStation }}</span>
                        <button class="remove-btn" @click.stop="handleRemoveFavorite(sale.saleId)">
                            찜 해제
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
                <ProductDetail
                    :sale="selectedSale"
                    @close="showProductDetail = false"
                    @interest-changed="handleInterestChanged"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 컴포넌트 고유의 스타일 */
.sale-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
}

.property-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
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

.details {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 14px;
    color: #666;
}

.action-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
}

.station {
    font-size: 14px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
}

.remove-btn {
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

.remove-btn:hover {
    background: #e74c3c;
    color: white;
}

@media (max-width: 768px) {
    .sale-info {
        flex-direction: column;
    }

    .action-area {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #eee;
    }
}
</style>
