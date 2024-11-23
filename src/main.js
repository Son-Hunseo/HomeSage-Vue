import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useKakao } from 'vue3-kakao-maps/@utils'

import App from './App.vue'
import router from './router'
const { VITE_KAKAO_MAP_KEY } = import.meta.env

const app = createApp(App)

/**
 * [ Axios ]
 *
 * npm install axios
 * https://axios-http.com/kr/docs/intro
 */
import { instance } from '@/api/axios'
app.provide('axios', instance)

app.use(createPinia())
app.use(router)

useKakao(VITE_KAKAO_MAP_KEY)
app.mount('#app')
