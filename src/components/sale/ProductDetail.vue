<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    sale: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])

const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}
</script>

<template>
    <div class="product-detail">
        <div class="detail-header">
            <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="detail-content">
            <div class="image-container">
                <!-- <img src="/api/placeholder/800/600" alt="매물 상세 이미지" /> -->
            </div>
            <div class="info-section">
                <h2 class="price">{{ formatPrice(sale.price) }}</h2>
                <div class="info-row">
                    <span class="label">면적</span>
                    <span>{{ sale.space }}㎡</span>
                </div>
                <div class="info-row">
                    <span class="label">층수</span>
                    <span>{{ sale.floor }}층</span>
                </div>
                <div class="info-row">
                    <span class="label">관리비</span>
                    <span>{{ formatPrice(sale.managementFee) }}</span>
                </div>
                <div class="info-row">
                    <span class="label">주소</span>
                    <span>{{ sale.city }} {{ sale.gu }} {{ sale.dong }}</span>
                </div>
                <div class="info-row">
                    <span class="label">역세권</span>
                    <span>{{ sale.nearStation }}</span>
                </div>
                <div class="description">
                    {{ sale.description }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
}

.detail-header {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: flex-end;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
}

.detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.image-container {
    width: 100%;
    height: 300px;
    margin-bottom: 24px;
    border-radius: 4px;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.price {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.info-row {
    display: flex;
    gap: 16px;
}

.label {
    min-width: 80px;
    color: #666;
}

.description {
    margin-top: 24px;
    white-space: pre-line;
    color: #424242;
}
</style>
