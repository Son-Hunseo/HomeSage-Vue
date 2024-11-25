<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import ProviderCalendar from '@/components/user/provider/ProviderCalendar.vue'
import ProviderReserveList from '@/components/user/provider/ProviderReserveList.vue'
import ProviderSaleUpload from '@/components/user/provider/ProviderSaleUpload.vue'
import PasswordChange from '@/components/user/PasswordChange.vue'
import '@/assets/styles/mypage.css'

const activeTab = ref('providerCalendar')
</script>

<template>
    <div>
        <Header />
        <div class="mypage-container">
            <nav class="mypage-nav">
                <button
                    @click="activeTab = 'providerCalendar'"
                    :class="{ active: activeTab === 'providerCalendar' }"
                >
                    예약 일정
                </button>
                <button
                    @click="activeTab = 'reservations'"
                    :class="{ active: activeTab === 'reservations' }"
                >
                    예약 관리
                </button>
                <button
                    @click="activeTab = 'saleUpload'"
                    :class="{ active: activeTab === 'saleUpload' }"
                >
                    매물 등록
                </button>
                <button
                    @click="activeTab = 'password'"
                    :class="{ active: activeTab === 'password' }"
                >
                    비밀번호 변경
                </button>
            </nav>

            <main class="mypage-content">
                <ProviderCalendar v-if="activeTab === 'providerCalendar'" />
                <ProviderReserveList v-if="activeTab === 'reservations'" />
                <ProviderSaleUpload v-if="activeTab === 'saleUpload'" />
                <PasswordChange v-if="activeTab === 'password'" />
            </main>
        </div>
    </div>
</template>

<style scoped></style>
