// ProductList.vue
<script setup>
import { useSaleStore } from '@/stores/sale-store'
import { storeToRefs } from 'pinia'
import SearchBar from '@/components/SearchBar.vue'
import SearchDetail from '@/components/SearchDetail.vue'
import ProductCard from '@/components/sale/ProductCard.vue'
import ProductDetail from '@/components/sale/ProductDetail.vue'
import { ref } from 'vue'

const saleStore = useSaleStore()
const { sales, selectedSale } = storeToRefs(saleStore)
const showSearchDetail = ref(false)

const handleSelectSale = (sale) => {
    saleStore.setSelectedSale(sale)
}

const handleCloseDetail = () => {
    saleStore.clearSelectedSale()
}

const toggleSearchDetail = () => {
    showSearchDetail.value = !showSearchDetail.value
}
</script>

<template>
    <div class="product-list-container">
        <div class="product-list-header">
            <SearchBar @toggle-detail="toggleSearchDetail" />
            <!-- SearchDetail을 ProductList 내부로 이동 -->
            <Transition name="slide-down">
                <SearchDetail
                    v-if="showSearchDetail"
                    class="search-detail-section"
                    @close="toggleSearchDetail"
                />
            </Transition>
        </div>
        <div class="list-section">
            <div class="list-header">
                <span class="total-count">총 {{ sales.length }}개</span>
                <div class="sort-options">
                    <button class="sort-btn active">추천순</button>
                    <button class="sort-btn">최신순</button>
                </div>
            </div>
            <div class="cards-container">
                <ProductCard
                    v-for="sale in sales"
                    :key="sale.saleId"
                    :sale="sale"
                    :isSelected="selectedSale?.saleId === sale.saleId"
                    @click="handleSelectSale(sale)"
                />
            </div>
        </div>

        <!-- ProductDetail -->
        <Transition name="slide">
            <ProductDetail
                v-if="selectedSale"
                :sale="selectedSale"
                @close="handleCloseDetail"
                class="detail-section"
            />
        </Transition>
    </div>
</template>

<style scoped>
.product-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: white;
    width: 400px;
    position: relative;
    border-right: 1px solid #e5e5e5;
}

.product-list-header {
    position: relative;
    z-index: 2;
}

/* SearchDetail 스타일 */
.search-detail-section {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e5e5;
    border-top: none;
}

/* SearchDetail 애니메이션 */
.slide-down-enter-active,
.slide-down-leave-active {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1;
}

.list-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
}

.total-count {
    font-weight: 600;
    color: #333;
}

.sort-options {
    display: flex;
    gap: 8px;
}

.sort-btn {
    padding: 6px 12px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    color: #666;
}

.sort-btn.active {
    font-weight: 600;
    color: #4a90e2;
}

.sort-btn:hover {
    color: #4a90e2;
}

.cards-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

/* 스크롤바 스타일링 */
.cards-container::-webkit-scrollbar {
    width: 6px;
}

.cards-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.cards-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.cards-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* ProductDetail 섹션 */
.detail-section {
    position: absolute;
    top: 0;
    left: 400px;
    width: 400px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 3;
}

/* ProductDetail 애니메이션 */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
