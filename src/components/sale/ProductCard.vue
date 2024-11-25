<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    sale: {
        type: Object,
        required: true,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
})

const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}
</script>

<template>
    <div class="product-card" :class="{ selected: isSelected }">
        <div class="image-container">
            <img :src="sale.saleImgUrl" alt="sale image" />
        </div>
        <div class="info-container">
            <div class="price">{{ formatPrice(sale.price) }}</div>
            <div class="main-info">
                <span>{{ sale.homeType }}</span>
                <span>{{ sale.space }}㎡</span>
                <span>{{ sale.floor }}층</span>
            </div>
            <div class="sub-info">
                <span>{{ sale.nearStation }}</span>
            </div>
            <div class="address">{{ sale.city }} {{ sale.gu }} {{ sale.dong }}</div>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
    transition: background-color 0.2s;
}

.product-card:hover {
    background-color: #f8f9fa;
}

.product-card.selected {
    background-color: #e3f2fd;
}

.image-container {
    width: 100%;
    height: 200px;
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.price {
    font-size: 18px;
    font-weight: 600;
}

.main-info {
    display: flex;
    gap: 8px;
    color: #424242;
}

.sub-info {
    font-size: 14px;
    color: #666;
}

.address {
    font-size: 14px;
    color: #666;
}
</style>
