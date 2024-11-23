<script setup>
import { ref } from 'vue'

const reservations = ref([
    {
        id: 1,
        propertyName: '강남 원룸',
        date: '2024-03-15',
        status: '상담 대기중',
    },
    {
        id: 2,
        propertyName: '서초동 아파트',
        date: '2024-03-22',
        status: '방문 예정',
    },
])

const cancelReservation = (id) => {
    // 예약 취소 로직
    reservations.value = reservations.value.filter((r) => r.id !== id)
}
</script>

<template>
    <div class="reservations-list">
        <h2>예약 목록</h2>
        <table>
            <thead>
                <tr>
                    <th>매물명</th>
                    <th>예약 날짜</th>
                    <th>상태</th>
                    <th>액션</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="reservation in reservations" :key="reservation.id">
                    <td>{{ reservation.propertyName }}</td>
                    <td>{{ reservation.date }}</td>
                    <td>{{ reservation.status }}</td>
                    <td>
                        <button @click="cancelReservation(reservation.id)" class="btn-cancel">
                            취소
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.reservations-list {
    width: 100%;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 0.8rem;
    text-align: left;
}

.btn-cancel {
    background-color: #8b4513;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
}
</style>
