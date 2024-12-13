<script setup>
import { ref } from 'vue'
import { useSaleStore } from '@/stores/sale-store'

const saleStore = useSaleStore()
const searchCondition = ref({
    saleType: '',
    homeType: '',
    minPrice: null,
    maxPrice: null,
    minMonthlyFee: null,
    maxMonthlyFee: null,
    minSpace: null,
    maxSpace: null,
    station: '',
})

const emit = defineEmits(['close'])

const handleSearch = () => {
    // 빈 문자열이나 0값은 제외하고 검색 조건 구성
    const conditions = {}

    if (searchCondition.value.saleType) conditions.saleType = searchCondition.value.saleType

    if (searchCondition.value.homeType) conditions.homeType = searchCondition.value.homeType

    if (searchCondition.value.minPrice) conditions.minPrice = searchCondition.value.minPrice

    if (searchCondition.value.maxPrice) conditions.maxPrice = searchCondition.value.maxPrice

    if (searchCondition.value.minSpace) conditions.minSpace = searchCondition.value.minSpace

    if (searchCondition.value.maxSpace) conditions.maxSpace = searchCondition.value.maxSpace

    if (searchCondition.value.station) conditions.station = searchCondition.value.station

    // store의 searchSales 호출
    saleStore.searchSales(conditions)

    // 검색 후 상세검색 패널 닫기
    emit('close')
}

const handleReset = () => {
    searchCondition.value = {
        saleType: '',
        homeType: '',
        minPrice: null,
        maxPrice: null,
        minMonthlyFee: null,
        maxMonthlyFee: null,
        minSpace: null,
        maxSpace: null,
        station: '',
    }
}
</script>

<template>
    <div class="search-detail">
        <div class="search-detail-content">
            <h3>상세 검색</h3>

            <div class="search-row">
                <select v-model="searchCondition.saleType" @keyup.enter="handleSearch">
                    <option value="">거래유형</option>
                    <option value="매매">매매</option>
                    <option value="전세">전세</option>
                    <option value="월세">월세</option>
                </select>
                <select v-model="searchCondition.homeType" @keyup.enter="handleSearch">
                    <option value="">주택유형</option>
                    <option value="아파트">아파트</option>
                    <option value="원룸">원룸</option>
                    <option value="투룸">투룸</option>
                    <option value="주택">주택</option>
                </select>
            </div>

            <div class="search-row">
                <input
                    v-model.number="searchCondition.minPrice"
                    type="number"
                    placeholder="최소 가격"
                    @keyup.enter="handleSearch"
                />
                <span class="separator">~</span>
                <input
                    v-model.number="searchCondition.maxPrice"
                    type="number"
                    placeholder="최대 가격"
                    @keyup.enter="handleSearch"
                />
            </div>

            <div class="search-row">
                <input
                    v-model.number="searchCondition.minSpace"
                    type="number"
                    placeholder="최소 평수"
                    @keyup.enter="handleSearch"
                />
                <span class="separator">~</span>
                <input
                    v-model.number="searchCondition.maxSpace"
                    type="number"
                    placeholder="최대 평수"
                    @keyup.enter="handleSearch"
                />
            </div>

            <div class="search-row">
                <input
                    v-model="searchCondition.station"
                    type="text"
                    placeholder="역세권"
                    @keyup.enter="handleSearch"
                />
            </div>

            <div class="button-group">
                <button class="reset-btn" @click="handleReset">초기화</button>
                <button class="search-btn" @click="handleSearch">검색하기</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-detail {
    background: white;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-detail-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

h3 {
    margin: 0;
    font-size: 14px;
    color: #333;
    font-weight: 600;
}

.search-row {
    display: flex;
    gap: 6px;
    align-items: center;
}

select,
input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    height: 32px;
    box-sizing: border-box;
}

select:focus,
input:focus {
    outline: none;
    border-color: #4a90e2;
}

.separator {
    color: #666;
    padding: 0 2px;
    font-size: 12px;
}

.button-group {
    display: flex;
    gap: 6px;
    margin-top: 4px;
}

.reset-btn,
.search-btn {
    flex: 1;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reset-btn {
    background: white;
    border: 1px solid #ddd;
    color: #666;
}

.search-btn {
    background: #4a90e2;
    color: white;
    border: none;
    font-weight: 500;
}

.reset-btn:hover {
    background: #f5f5f5;
}

.search-btn:hover {
    background: #357abd;
}

/* Chrome, Safari, Edge에서 number input의 화살표 제거 */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox에서 number input의 화살표 제거 */
/* input[type='number'] {
    -moz-appearance: textfield;
} */
</style>
