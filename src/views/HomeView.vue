<script setup>
import Header from '@/components/Header.vue'
import ProductList from '@/components/sale/ProductList.vue'
import MapSection from '@/components/MapSection.vue'
</script>

<template>
    <div class="home-container">
        <Header />
        <div class="content-container">
            <ProductList class="product-list" />
            <MapSection class="map-section" />
        </div>
    </div>
</template>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.content-container {
    display: flex;
    flex: 1;
    min-height: 0;
}

.product-list {
    width: 400px;
    flex-shrink: 0;
}

.map-section {
    flex: 1;
}
</style>
