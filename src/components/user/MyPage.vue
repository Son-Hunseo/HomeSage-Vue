<!-- MyPage.vue -->
<script setup>
import { onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import ConsumerMyPage from '@/components/user/ConsumerMyPage.vue'
import ProviderMyPage from '@/components/user/provider/ProviderMyPage.vue'

const authStore = useAuthStore()
const router = useRouter()

// userRole이 변경될 때마다 실행
watchEffect(() => {
    console.log('Current userRole:', authStore.userRole) // 디버깅용
})

onMounted(async () => {
    // 이미 router.beforeEach에서 인증 체크를 하므로,
    // 여기서는 role 정보만 확인합니다
    if (!authStore.userRole) {
        try {
            await authStore.checkAuthStatus()
        } catch (error) {
            console.error('권한 정보 확인 중 오류 발생:', error)
        }
    }
})
</script>

<template>
    <div class="my-page">
        <ConsumerMyPage v-if="authStore.userRole === 'CONSUMER'" />
        <ProviderMyPage v-if="authStore.userRole === 'PROVIDER'" />
        <div v-if="!authStore.userRole" class="error-state">권한 정보를 불러오는 중...</div>
    </div>
</template>
