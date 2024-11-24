<script setup>
import { ref, inject } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const userInfo = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
})

const changePassword = async () => {
    // 비밀번호 변경 로직
    if (userInfo.value.newPassword !== userInfo.value.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
    }
    await authStore.changedPassword(userInfo.value)
    router.push('/')
}
</script>

<template>
    <br />
    <div class="password-change">
        <h2>비밀번호 변경</h2>
        <br />
        <form @submit.prevent="changePassword">
            <input
                type="password"
                v-model="userInfo.currentPassword"
                placeholder="현재 비밀번호"
                required
            />
            <input
                type="password"
                v-model="userInfo.newPassword"
                placeholder="새 비밀번호"
                required
            />
            <input
                type="password"
                v-model="userInfo.confirmPassword"
                placeholder="새 비밀번호 확인"
                required
            />
            <button type="submit" class="btn-submit">변경하기</button>
        </form>
    </div>
</template>

<style scoped>
.password-change {
    max-width: 400px;
    margin: 0 auto;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.btn-submit {
    background-color: #4a90e2;
    color: white;
    border: none;
    padding: 1rem;
    cursor: pointer;
}
</style>
