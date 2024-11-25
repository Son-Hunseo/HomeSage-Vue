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
        await userStore.fetchInterestedSales()
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

const formatPrice = (price) => {
    if (price === null || price === undefined) return '-'
    return price.toLocaleString('ko-KR') + '만원'
}

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

const openProductDetail = (sale) => {
    selectedSale.value = {
        saleId: sale.saleId,
        providerUserId: sale.providerUserId,
        saleType: sale.saleType,
        homeType: sale.homeType,
        price: sale.price,
        monthlyFee: sale.monthlyFee,
        managementFee: sale.managementFee,
        space: sale.space,
        description: sale.description,
        floor: sale.floor,
        nearStation: sale.nearStation,
        city: sale.city,
        gu: sale.gu,
        dong: sale.dong,
        latitude: Number(sale.latitude),
        longitude: Number(sale.longitude),
        saleImgUrl: sale.saleImgUrl,
    }
    showProductDetail.value = true
}

const handleInterestChanged = async () => {
    await userStore.fetchInterestedSales()
}
</script>

<template>
    <div class="favorites-list">
        <h2 class="page-title">찜한 상품</h2>

        <div v-if="userStore.interestedSales.length === 0" class="empty-state">
            찜한 상품이 없습니다.
        </div>

        <div v-else class="favorites">
            <div
                v-for="sale in userStore.interestedSales"
                :key="sale.UserInterestedSaleId"
                class="favorite-item"
                @click="openProductDetail(sale)"
            >
                <div class="sale-info">
                    <div class="property-info">
                        <div class="main-info">
                            <span class="property-title">
                                {{ sale.saleType }} {{ sale.homeType }}
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
.favorites-list {
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

.favorites {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.favorite-item {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.favorite-item:hover {
    border-color: #4a90e2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #f8f9fa;
}

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

/* 반응형 스타일 */
@media (max-width: 768px) {
    .favorites-list {
        padding: 24px 16px;
    }

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

    .modal-container {
        width: 95%;
        height: 90vh;
    }
}
</style>
