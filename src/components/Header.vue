<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoginModal from '@/components/auth/LoginModal.vue'
import SignUpModal from '@/components/auth/SignUpModal.vue'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
    { name: '등기부등본 / 건축물대장 분석', path: '/analyze' },
    { name: '부동산 QA 챗봇', path: '/chatbot' },
    { name: '공지 사항', path: '/notices' },
]

// 모달 상태 관리
const isLoginModalVisible = ref(false)
const isSignUpModalVisible = ref(false)

const login = () => {
    isLoginModalVisible.value = true
}

const signUp = () => {
    isSignUpModalVisible.value = true
}

const handleSwitchToSignup = () => {
    isLoginModalVisible.value = false
    isSignUpModalVisible.value = true
}

const mypage = () => {
    router.push('/mypage')
}

const logout = async () => {
    await authStore.logout()
    alert('로그아웃 성공!')
    router.push('/')
}
</script>

<template>
    <header class="header">
        <nav class="nav-items">
            <RouterLink to="/"
                ><img src="@/assets/logo.png" alt="Logo" class="logo" width="40" height="40"
            /></RouterLink>
            <button
                class="btn btn-nav"
                v-for="item in menuItems"
                :key="item"
                @click="item.path ? router.push(item.path) : null"
            >
                {{ item.name }}
            </button>
        </nav>

        <div class="auth-buttons">
            <!-- 로그인 전 -->
            <template v-if="!authStore.authStatus">
                <button class="btn btn-login" @click="login">로그인</button>
                <button class="btn btn-signup" @click="signUp">회원가입</button>
            </template>

            <!-- 로그인 후 -->
            <template v-else>
                <button class="btn btn-mypage" @click="mypage">마이페이지</button>
                <button class="btn btn-logout" @click="logout">로그아웃</button>
            </template>
        </div>
    </header>

    <!-- 로그인 모달 -->
    <LoginModal
        v-if="isLoginModalVisible"
        @close="isLoginModalVisible = false"
        @switchToSignup="handleSwitchToSignup"
    />

    <!-- 회원가입 모달 -->
    <SignUpModal v-if="isSignUpModalVisible" @close="isSignUpModalVisible = false" />
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid #ddd;
}

.nav-items {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.auth-buttons {
    display: flex;
    gap: 1rem;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.btn-nav {
    background: none; /* 배경색 제거 */
    padding: 0.5rem 1rem;
    border: none; /* 버튼 테두리 제거 */
    cursor: pointer;
}

.btn-login {
    background: white;
    border: 1px solid #ddd;
}

.btn-signup {
    background: #007bff;
    color: white;
}

.btn-mypage {
    background: #007bff;
    color: white;
}

.btn-logout {
    background: #dc3545;
    color: white;
}
</style>
