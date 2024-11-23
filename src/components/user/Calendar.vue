<script setup>
import { ref, onMounted } from 'vue'
// import '@/assets/calendar.css' // 필요한 경우 달력 스타일시트 ㅐ추가

const currentDate = ref(new Date())
const events = ref([
    {
        date: '2024-03-15',
        title: '강남 원룸 상담',
        type: 'consultation',
    },
    {
        date: '2024-03-22',
        title: '서초동 아파트 방문',
        type: 'viewing',
    },
])

// const generateCalendar = () => {
//   // 달력 생성 로직
// }

// onMounted(() => {
//   generateCalendar()
// })
</script>

<template>
    <div class="calendar-container">
        <div class="calendar-header">
            <button @click="changeMonth(-1)">이전 달</button>
            <h2>{{ currentDate.toLocaleString('default', { year: 'numeric', month: 'long' }) }}</h2>
            <button @click="changeMonth(1)">다음 달</button>
        </div>
        <div class="calendar-grid">
            <div v-for="day in 42" :key="day" class="calendar-day">
                <div class="day-number">{{ day }}</div>
                <!-- <div 
          v-for="event in getEventsForDay(day)" 
          :key="event.title" 
          class="day-event"
        >
          {{ event.title }}
        </div> -->
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar-container {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
}

.calendar-day {
    border: 1px solid #f0f0f0;
    min-height: 100px;
    padding: 0.5rem;
}

.day-event {
    background-color: #8b4513;
    color: white;
    margin: 0.25rem 0;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.8rem;
}
</style>
