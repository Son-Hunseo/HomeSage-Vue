<script setup>
import { defineProps, defineEmits } from 'vue'
import { useCalendarStore } from '@/stores/calendar-store'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'submit'])
const calendarStore = useCalendarStore()

const handleSubmit = () => {
    const selectedDateTime = calendarStore.getFormattedSelection()
    if (!selectedDateTime) {
        alert('날짜와 시간을 선택해주세요.')
        return
    }
    emit('submit', selectedDateTime)
}
</script>

<template>
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div class="modal">
            <div class="modal-header">
                <h3>예약하기</h3>
                <button class="close-btn" @click="emit('close')">×</button>
            </div>
            <div class="modal-body">
                <!-- 달력 컴포넌트 -->
                <div class="calendar-section">
                    <div class="calendar-header">
                        <button @click="calendarStore.prevMonth">&lt;</button>
                        <span
                            >{{ calendarStore.currentYear }}.{{
                                String(calendarStore.currentMonth).padStart(2, '0')
                            }}</span
                        >
                        <button @click="calendarStore.nextMonth">&gt;</button>
                    </div>
                    <div class="calendar-days">
                        <div class="day-header">일</div>
                        <div class="day-header">월</div>
                        <div class="day-header">화</div>
                        <div class="day-header">수</div>
                        <div class="day-header">목</div>
                        <div class="day-header">금</div>
                        <div class="day-header">토</div>
                    </div>
                    <div class="calendar-dates">
                        <div
                            v-for="date in calendarStore.calendarDates"
                            :key="`${date.year}-${date.month}-${date.date}`"
                            class="date-cell"
                            :class="{
                                disabled: !date.isCurrentMonth || date.isPast,
                                selected: calendarStore.isSelectedDate(date),
                                today: calendarStore.isToday(date),
                            }"
                            @click="calendarStore.selectDate(date)"
                        >
                            {{ date.date }}
                        </div>
                    </div>
                </div>

                <!-- 시간 선택 -->
                <div class="time-section">
                    <h4>오전</h4>
                    <div class="time-grid">
                        <button
                            v-for="time in calendarStore.morningTimes"
                            :key="time"
                            class="time-btn"
                            :class="{ selected: calendarStore.selectedTime === time }"
                            @click="calendarStore.selectTime(time)"
                        >
                            {{ time }}
                        </button>
                    </div>
                    <h4>오후</h4>
                    <div class="time-grid">
                        <button
                            v-for="time in calendarStore.afternoonTimes"
                            :key="time"
                            class="time-btn"
                            :class="{ selected: calendarStore.selectedTime === time }"
                            @click="calendarStore.selectTime(time)"
                        >
                            {{ time }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn" @click="emit('close')">취소</button>
                <button
                    class="confirm-btn"
                    @click="handleSubmit"
                    :disabled="!calendarStore.selectedDate || !calendarStore.selectedTime"
                >
                    예약하기
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    color: #666;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

/* Calendar Styles */
.calendar-section {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
}

.calendar-header button {
    border: none;
    background: none;
    padding: 4px 8px;
    cursor: pointer;
    color: #666;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
}

.day-header {
    text-align: center;
    font-size: 12px;
    color: #666;
    padding: 4px 0;
}

.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.date-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.date-cell:hover:not(.disabled) {
    background: #f5f5f5;
}

.date-cell.disabled {
    color: #ccc;
    cursor: not-allowed;
}

.date-cell.selected {
    background: #4a90e2;
    color: white;
}

.date-cell.today {
    border: 1px solid #4a90e2;
}

/* Time Selection Styles */
.time-section h4 {
    margin: 16px 0 8px 0;
    font-size: 14px;
    color: #666;
}

.time-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.time-btn {
    padding: 8px;
    border: 1px solid #e5e5e5;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.time-btn:hover:not(.selected) {
    background: #f5f5f5;
}

.time-btn.selected {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.modal-actions {
    padding: 16px 24px;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.modal-actions button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.cancel-btn {
    background: white;
    border: 1px solid #ddd;
}

.confirm-btn {
    background: #4a90e2;
    color: white;
    border: none;
}

.confirm-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .time-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-overlay {
    animation: fadeIn 0.2s ease;
}

.modal {
    animation: slideIn 0.3s ease;
}
</style>
