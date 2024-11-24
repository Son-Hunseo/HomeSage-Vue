<script setup>
import { defineEmits, ref, inject, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['close'])
const axios = inject('axios')

const userInfo = ref({
    email: '',
    name: '',
    password: '',
    retryPassword: '',
    role: 'CONSUMER',
})

const checkEmailMessage = ref('')
const checkEmailMessageColor = ref('')

// 이메일 중복 체크
const checkUserEmail = async () => {
    if (!userInfo.value.email.trim()) {
        checkEmailMessage.value = ''
        checkEmailMessageColor.value = ''
        return
    }

    await axios
        .get(`/auth/checkEmail/${userInfo.value.email}`)
        .then(() => {
            checkEmailMessage.value = '사용할 수 있는 이메일 입니다.'
            checkEmailMessageColor.value = 'text-green'
        })
        .catch(() => {
            checkEmailMessage.value = '사용할 수 없는 이메일 입니다.'
            checkEmailMessageColor.value = 'text-red'
        })
}

// 비밀번호 확인
const isSamePassword = ref(false)
watch(
    () => [userInfo.value.password, userInfo.value.retryPassword],
    () => {
        isSamePassword.value = userInfo.value.password === userInfo.value.retryPassword
    },
    { immediate: true },
)

// 관리자 체크박스 상태
const isAdminChecked = ref(false)

// isAdminChecked의 상태 변화를 감지하여 userInfo.role 업데이트
watch(isAdminChecked, (newValue) => {
    userInfo.value.role = newValue ? 'PROVIDER' : 'CONSUMER'
})

const passwordVisible = ref(false)
const passwordCheckVisible = ref(false)

// 회원가입
const signUp = async () => {
    await axios.post('/auth/signUp', userInfo.value).then((response) => {
        emit('close') // 모달 닫기
        router.push('/')
    })
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal">
            <button class="close-btn" @click="emit('close')">&times;</button>
            <img src="@/assets/logo.png" alt="Logo" class="modal-logo" />
            <h2>회원가입</h2>
            <p class="modal-description">HomeSage와 안전한 부동산 거래를 완료하세요</p>

            <div>
                <!-- 이메일 입력 -->
                <div>
                    <label for="email" class="form-label">이메일</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="이메일"
                        v-model="userInfo.email"
                        @keyup="checkUserEmail"
                        class="form-input"
                    />
                    <template v-if="checkEmailMessage !== ''">
                        <span :class="checkEmailMessageColor">{{ checkEmailMessage }}</span>
                    </template>
                </div>

                <!-- 이름 입력 -->
                <div>
                    <label for="name" class="form-label">이름</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="이름"
                        v-model="userInfo.name"
                        class="form-input"
                    />
                </div>

                <!-- 비밀번호 입력 -->
                <div>
                    <label for="password" class="form-label">비밀번호</label>
                    <div class="password-container">
                        <input
                            id="password"
                            :type="passwordVisible ? 'text' : 'password'"
                            placeholder="비밀번호"
                            v-model="userInfo.password"
                            class="form-input"
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            @click="passwordVisible = !passwordVisible"
                        >
                            {{ passwordVisible ? '숨기기' : '보기' }}
                        </button>
                    </div>
                </div>

                <!-- 비밀번호 확인 -->
                <div>
                    <label for="password-confirm" class="form-label">비밀번호 확인</label>
                    <div class="password-container">
                        <input
                            id="password-confirm"
                            :type="passwordCheckVisible ? 'text' : 'password'"
                            placeholder="비밀번호 확인"
                            v-model="userInfo.retryPassword"
                            class="form-input"
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            @click="passwordCheckVisible = !passwordCheckVisible"
                        >
                            {{ passwordCheckVisible ? '숨기기' : '보기' }}
                        </button>
                    </div>
                    <template v-if="!isSamePassword">
                        <span class="text-red">비밀번호가 일치하지 않습니다.</span>
                    </template>
                </div>

                <!-- 관리자 체크 -->
                <div>
                    <label class="form-label">
                        <input type="checkbox" id="admin-check" v-model="isAdminChecked" />
                        판매자로 가입하기
                    </label>
                </div>

                <!-- 버튼들 -->
                <div class="button-container">
                    <button type="button" class="signup-btn" @click="signUp">회원가입</button>
                    <button type="button" class="cancel-btn" @click="emit('close')">취소</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    width: 500px;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 18px;
    color: #333;
    background: none;
    border: none;
    cursor: pointer;
}

.modal-logo {
    width: 50px;
    margin-bottom: 20px;
}

h2 {
    margin-bottom: 10px;
    font-size: 24px;
    /* color: #8b4513; */
}

.modal-description {
    margin-bottom: 20px;
    font-size: 14px;
    color: #555;
}

.form-label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

.form-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f0f0f0;
    box-sizing: border-box;
}

.text-green {
    color: green;
    font-size: 12px;
}

.text-red {
    color: red;
    font-size: 12px;
}

.password-container {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
}

.password-container input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f0f0f0;
    box-sizing: border-box;
}

.password-toggle {
    padding: 10px;
    white-space: nowrap;
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
}

.password-toggle:hover {
    text-decoration: underline;
    color: #0056b3;
}

.button-container {
    width: 100%;
}

.signup-btn {
    width: 100%;
    padding: 10px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    box-sizing: border-box;
}

.signup-btn:hover {
    background: #357abd;
}

.cancel-btn {
    width: 100%;
    padding: 10px;
    background: #ccc;
    color: black;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
    box-sizing: border-box;
}

.cancel-btn:hover {
    background: #aaa;
}

#admin-check {
    margin-right: 5px;
}

.form-label input[type='checkbox'] {
    transform: scale(1.2);
    margin-right: 10px;
}
</style>
