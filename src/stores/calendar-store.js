import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCalendarStore = defineStore('calendar', () => {
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const selectedTime = ref(null)

    const currentYear = computed(() => currentDate.value.getFullYear())
    const currentMonth = computed(() => currentDate.value.getMonth() + 1)

    const morningTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']

    const afternoonTimes = [
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
    ]

    // 달력 날짜 계산
    const calendarDates = computed(() => {
        const year = currentDate.value.getFullYear()
        const month = currentDate.value.getMonth()

        // 해당 월의 첫 날과 마지막 날
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // 달력에 표시할 날짜들
        const dates = []

        // 이전 달의 날짜들
        const firstDayOfWeek = firstDay.getDay()
        if (firstDayOfWeek > 0) {
            const prevLastDay = new Date(year, month, 0)
            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const date = prevLastDay.getDate() - i
                dates.push({
                    year: month === 0 ? year - 1 : year,
                    month: month === 0 ? 12 : month,
                    date,
                    isCurrentMonth: false,
                    isPast: new Date(year, month - 1, date) < new Date().setHours(0, 0, 0, 0),
                })
            }
        }

        // 현재 달의 날짜들
        for (let date = 1; date <= lastDay.getDate(); date++) {
            dates.push({
                year,
                month: month + 1,
                date,
                isCurrentMonth: true,
                isPast: new Date(year, month, date) < new Date().setHours(0, 0, 0, 0),
            })
        }

        // 다음 달의 날짜들
        const remainingDays = 42 - dates.length // 6주 달력을 위해
        for (let date = 1; date <= remainingDays; date++) {
            dates.push({
                year: month === 11 ? year + 1 : year,
                month: month === 11 ? 1 : month + 2,
                date,
                isCurrentMonth: false,
                isPast: false,
            })
        }

        return dates
    })

    // 날짜 이동
    const prevMonth = () => {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() - 1,
            1,
        )
    }

    const nextMonth = () => {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() + 1,
            1,
        )
    }

    // 날짜 선택
    const selectDate = (date) => {
        if (date.isPast || !date.isCurrentMonth) return
        selectedDate.value = date
    }

    // 시간 선택
    const selectTime = (time) => {
        selectedTime.value = time
    }

    // 선택된 날짜인지 확인
    const isSelectedDate = (date) => {
        if (!selectedDate.value) return false
        return (
            date.year === selectedDate.value.year &&
            date.month === selectedDate.value.month &&
            date.date === selectedDate.value.date
        )
    }

    // 오늘 날짜인지 확인
    const isToday = (date) => {
        const today = new Date()
        return (
            date.year === today.getFullYear() &&
            date.month === today.getMonth() + 1 &&
            date.date === today.getDate()
        )
    }

    // 선택된 날짜와 시간 초기화
    const resetSelection = () => {
        selectedDate.value = null
        selectedTime.value = null
        currentDate.value = new Date()
    }

    // 선택된 날짜와 시간을 서버 형식으로 변환
    const getFormattedSelection = () => {
        if (!selectedDate.value || !selectedTime.value) return null

        const formattedDate = `${selectedDate.value.year}-${String(selectedDate.value.month).padStart(2, '0')}-${String(selectedDate.value.date).padStart(2, '0')}`

        return {
            reserveDate: formattedDate,
            reserveTime: selectedTime.value,
        }
    }

    return {
        currentYear,
        currentMonth,
        selectedDate,
        selectedTime,
        calendarDates,
        morningTimes,
        afternoonTimes,
        prevMonth,
        nextMonth,
        selectDate,
        selectTime,
        isSelectedDate,
        isToday,
        resetSelection,
        getFormattedSelection,
    }
})
