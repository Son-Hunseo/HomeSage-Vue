<script setup>
import { ref } from 'vue'

const favorites = ref([
    {
        id: 1,
        image: '@/assets/property1.jpg',
        price: { deposit: 5000, monthly: 50 },
        location: '서울시 강남구',
        size: 32,
        floor: 3,
    },
    {
        id: 2,
        image: '@/assets/property2.jpg',
        price: { deposit: 3000, monthly: 40 },
        location: '서울시 서초구',
        size: 25,
        floor: 5,
    },
])

const removeFromFavorites = (id) => {
    favorites.value = favorites.value.filter((f) => f.id !== id)
}
</script>

<template>
    <div class="favorites-list">
        <h2>찜 목록</h2>
        <div class="favorites-grid">
            <div v-for="property in favorites" :key="property.id" class="favorite-card">
                <img :src="property.image" :alt="property.location" />
                <div class="property-details">
                    <div class="property-price">
                        월세 {{ property.price.deposit.toLocaleString() }} /
                        {{ property.price.monthly.toLocaleString() }}
                    </div>
                    <div class="property-info">{{ property.size }}m² / {{ property.floor }}층</div>
                    <div class="property-location">
                        {{ property.location }}
                    </div>
                    <button @click="removeFromFavorites(property.id)" class="btn-remove">
                        찜 해제
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.favorites-list {
    width: 100%;
}

.favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.favorite-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.favorite-card img {
    width: 100%;
    height: 250px;
    object-fit: cover;
}

.property-details {
    padding: 1rem;
}

.property-price {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.btn-remove {
    width: 100%;
    background-color: #8b4513;
    color: white;
    border: none;
    padding: 0.5rem;
    margin-top: 0.5rem;
    cursor: pointer;
}
</style>
