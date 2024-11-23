<script setup>
import { ref } from 'vue'
import { useSaleStore } from '@/stores/sale-store'

const emit = defineEmits(['toggle-detail'])
const keyword = ref('')
const saleStore = useSaleStore()

const handleSearch = () => {
    if (!keyword.value.trim()) return

    saleStore.searchSales({
        keyword: keyword.value.trim(),
    })

    // 검색 후 키워드 초기화 (선택사항)
    // keyword.value = '';
}
</script>

<template>
    <div class="search-bar">
        <input
            v-model="keyword"
            type="text"
            placeholder="지하철역명, 학교명, 지역 검색"
            @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">검색</button>
        <button class="filter-btn" @click="$emit('toggle-detail')">상세검색</button>
    </div>
</template>

<style scoped>
.search-bar {
    padding: 16px;
    display: flex;
    gap: 8px;
    background: white;
    border-bottom: 1px solid #e5e5e5;
}

input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

input:focus {
    outline: none;
    border-color: #4a90e2;
}

button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;
}

.search-btn {
    background: #4a90e2;
    color: white;
    border: none;
}

.search-btn:hover {
    background: #357abd;
}

.filter-btn:hover {
    background: #f5f5f5;
}
</style>
