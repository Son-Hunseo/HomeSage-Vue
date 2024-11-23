import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store' // Pinia의 Auth Store 가져오기
import HomeView from '../views/HomeView.vue'
import MyPage from '@/components/user/MyPage.vue'
import Analyze from '@/components/analyze/Analyze.vue'
import ChatBot from '@/components/chat/ChatBot.vue'
import Notices from '@/components/nav/Notices.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/mypage',
            name: 'MyPage',
            component: MyPage,
            meta: { requiresAuth: true }, // 로그인 필요 플래그 추가
        },
        {
            path: '/analyze',
            name: 'Analyze',
            component: Analyze,
            meta: { requiresAuth: true }, // 로그인 필요 플래그 추가
        },
        {
            path: '/chatbot',
            name: 'ChatBot',
            component: ChatBot,
            meta: { requiresAuth: true }, // 로그인 필요 플래그 추가
        },
        {
            path: '/notices',
            name: 'Notices',
            component: Notices,
        },
    ],
})

// 전역 Navigation Guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 보호된 라우트에 접근할 때만 인증 체크
    if (to.meta.requiresAuth) {
        await authStore.checkAuthStatus()

        // 로그인이 필요한 경로인지 확인
        if (!authStore.isAuthenticated) {
            alert('로그인이 필요한 페이지입니다.')
            return next('/') // 로그인 안 된 경우 메인 화면으로 리다이렉트
        }
    }
    next() // 정상적으로 이동
})

export default router
