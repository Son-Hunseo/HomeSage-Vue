<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
// 앱 초기화 시 로그인 상태 확인
onMounted(() => {
    authStore.checkAuthStatus()
})
</script>

<template>
    <header>
        <div class="wrapper">
            <nav>
                <!-- <RouterLink to="/">Home</RouterLink> -->
            </nav>
        </div>
    </header>

    <RouterView />
</template>

<style scoped></style>
