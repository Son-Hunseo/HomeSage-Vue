<template>
    <div class="pagination">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="emit('go-first')">
            &lt;&lt;
        </button>

        <button class="pagination-btn" :disabled="currentPage === 1" @click="emit('prev-page')">
            &lt;
        </button>

        <button
            v-for="page in totalPages"
            :key="page"
            class="pagination-btn"
            :class="{ active: currentPage === page }"
            @click="emit('change-page', page)"
        >
            {{ page }}
        </button>

        <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="emit('next-page')"
        >
            &gt;
        </button>

        <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="emit('go-last')"
        >
            &gt;&gt;
        </button>
    </div>
</template>

<script setup>
defineProps({
    currentPage: {
        type: Number,
        required: true,
    },
    totalPages: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['change-page', 'go-first', 'go-last', 'prev-page', 'next-page'])
</script>

<style scoped>
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

@media (max-width: 768px) {
    .pagination {
        gap: 4px;
    }

    .pagination-btn {
        padding: 6px 10px;
        font-size: 0.9em;
    }
}
</style>
