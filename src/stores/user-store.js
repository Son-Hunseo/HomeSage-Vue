import { inject, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth-store'

export const useUserStore = defineStore('user', () => {
    const axios = inject('axios')
    const authStore = useAuthStore()
    const interestedSales = ref([]) // 찜한 매물 ID 목록
    const reservations = ref([]) // 예약 목록

    // 찜 목록 조회
    const fetchInterestedSales = async () => {
        if (!authStore.isAuthenticated) return

        try {
            const response = await axios.get('/user/interest/list', { withCredentials: true })
            interestedSales.value = response.data.map((item) => item.saleId)
        } catch (error) {
            console.error('찜 목록 조회 중 오류 발생:', error)
            interestedSales.value = []
            if (error.response && error.response.status === 204) {
                // 찜한 매물이 없는 경우
                return
            }
            throw new Error('찜 목록을 불러오는데 실패했습니다.')
        }
    }

    // 예약 목록 조회
    const fetchReservations = async () => {
        if (!authStore.isAuthenticated) return

        try {
            const response = await axios.get('/user/reserve/list', { withCredentials: true })
            reservations.value = response.data
        } catch (error) {
            console.error('예약 목록 조회 중 오류 발생:', error)
            reservations.value = []
            if (error.response && error.response.status === 204) {
                // 예약한 매물이 없는 경우
                return
            }
            throw new Error('예약 목록을 불러오는데 실패했습니다.')
        }
    }

    // 찜한 매물인지 확인
    const isInterested = (saleId) => {
        return interestedSales.value.includes(saleId)
    }

    // 예약한 매물인지 확인
    const isReserved = (saleId) => {
        return reservations.value.some((reservation) => reservation.saleId === saleId)
    }

    // 찜하기/찜취소
    const toggleInterest = async (saleId) => {
        if (!authStore.isAuthenticated) {
            throw new Error('로그인이 필요한 서비스입니다.')
        }

        try {
            const response = await axios.put(
                `/user/interest/${saleId}`,
                {},
                { withCredentials: true },
            )
            if (response.data.isInterest) {
                interestedSales.value.push(saleId)
            } else {
                interestedSales.value = interestedSales.value.filter((id) => id !== saleId)
            }
            return response.data.isInterest
        } catch (error) {
            console.error('찜하기 처리 중 오류 발생:', error)
            throw new Error('찜하기 처리 중 오류가 발생했습니다.')
        }
    }

    // 예약하기
    const makeReservation = async (reserveData) => {
        if (!authStore.isAuthenticated) {
            throw new Error('로그인이 필요한 서비스입니다.')
        }

        try {
            await axios.post('/user/reserve', reserveData, { withCredentials: true })
            // 예약 성공 후 예약 목록 갱신
            await fetchReservations()
            return true
        } catch (error) {
            console.error('예약 처리 중 오류 발생:', error)
            if (error.response && error.response.status === 500) {
                throw new Error('이미 예약된 매물입니다.')
            }
            throw new Error('예약 처리 중 오류가 발생했습니다.')
        }
    }

    // 예약 취소
    const cancelReservation = async (saleId) => {
        if (!authStore.isAuthenticated) {
            throw new Error('로그인이 필요한 서비스입니다.')
        }

        try {
            await axios.delete(`/user/cancel/${saleId}`, { withCredentials: true })
            // 예약 취소 후 예약 목록에서 제거
            reservations.value = reservations.value.filter(
                (reservation) => reservation.saleId !== saleId,
            )
            return true
        } catch (error) {
            console.error('예약 취소 중 오류 발생:', error)
            if (error.response && error.response.status === 500) {
                throw new Error('이미 취소된 예약입니다.')
            }
            throw new Error('예약 취소 중 오류가 발생했습니다.')
        }
    }

    return {
        interestedSales,
        reservations,
        fetchInterestedSales,
        fetchReservations,
        isInterested,
        isReserved,
        toggleInterest,
        makeReservation,
        cancelReservation,
    }
})
