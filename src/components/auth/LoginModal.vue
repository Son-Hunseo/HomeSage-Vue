<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

// 부모 컴포넌트에서 전달받은 이벤트
const emit = defineEmits(['close', 'switchToSignup'])

// Pinia 상태와 Vue Router
const authStore = useAuthStore()
const router = useRouter()

// 유저 입력값 상태 관리
const userInfo = ref({
    email: '',
    password: '',
})

// 로그인 처리 함수
const login = async () => {
    await authStore.login(userInfo.value)
    emit('close') // 모달 닫기
    router.push('/') // 홈으로 이동
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal">
            <h2>HomeSage</h2>
            <form @submit.prevent="login">
                <input
                    v-model="userInfo.email"
                    type="text"
                    placeholder="아이디 (이메일)"
                    required
                />
                <input
                    v-model="userInfo.password"
                    type="password"
                    placeholder="비밀번호"
                    required
                />
                <button type="submit" class="login-btn">로그인</button>
            </form>
            <!-- 회원가입 버튼 -->
            <a href="#" class="signup-link" @click.prevent="emit('switchToSignup')">회원가입</a>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 그대로 유지 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    width: 400px;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative;
}

input {
    display: block;
    width: 100%; /* 400px에서 100%로 변경 */
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f0f0f0;
    box-sizing: border-box; /* padding이 width에 포함되도록 설정 */
}

form {
    width: 100%; /* 폼 자체의 너비도 100%로 설정 */
}

.login-btn {
    width: 100%;
    padding: 10px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box; /* padding이 width에 포함되도록 설정 */
}

.login-btn:hover {
    background: #357abd;
}

.signup-link {
    display: block;
    text-align: center;
    margin-top: 15px;
    font-size: 14px;
    color: #aaa;
    text-decoration: none;
}

.signup-link:hover {
    color: #357abd;
}
</style>
