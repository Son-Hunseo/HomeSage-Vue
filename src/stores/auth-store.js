import { ref, inject, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authStore', () => {
    /**
     * State
     */
    const axios = inject('axios')

    // 로그인 여부 상태
    const isAuthenticated = ref(false)

    // 로그인 상태 반환 (getter)
    const authStatus = computed(() => isAuthenticated.value)

    /**
     * actions
     */

    /**
     * 1. 페이지 로딩 시 로그인 여부 확인 (refreshToken 을 통해)
     * 2. 로그인이 필요한 페이지 접근 시 refreshToken 이 있다면 accessToken 재발급, 로그인 상태 유지
     */
    const checkAuthStatus = async () => {
        await axios
            .get('/auth/refresh', { withCredentials: true })
            .then((response) => {
                axios.defaults.headers.common['Authorization'] = response.headers.authorization
                isAuthenticated.value = true // 로그인 성공 시 상태 변경
            })
            .catch((error) => {
                console.log(error)
                isAuthenticated.value = false
            })
    }

    const login = async (userInfo) => {
        await axios
            .post('/auth/login', userInfo, { withCredentials: true })
            .then((response) => {
                axios.defaults.headers.common['Authorization'] = response.headers.authorization
                isAuthenticated.value = true // 로그인 성공 시 상태 변경
                alert('로그인 성공!')
            })
            .catch((error) => {
                console.log(error)
                isAuthenticated.value = false
                alert('로그인 실패. 이메일과 비밀번호를 확인해주세요.')
            })
    }

    const logout = async () => {
        await axios.delete('/auth/logout', { withCredentials: true }).then((response) => {
            axios.defaults.headers.common['Authorization'] = ''
            isAuthenticated.value = false
        })
    }

    const changedPassword = async (userInfo) => {
        // 서버 API 호출 로직 추가
        await axios
            .put('/user/changedPassword', userInfo, { withCredentials: true })
            .then(() => {
                // 비밀번호 변경 완료
                alert('비밀번호 변경이 완료되었습니다!')
                axios.defaults.headers.common['Authorization'] = ''
                isAuthenticated.value = false
            })
            .catch(() => {
                alert('기존 비밀번호가 일치하지 않습니다.')
            })
    }

    return {
        isAuthenticated,
        authStatus,
        checkAuthStatus,
        login,
        logout,
        changedPassword,
    }
})
