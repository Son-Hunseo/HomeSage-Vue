<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import ProviderCalendar from '@/components/user/provider/ProviderCalendar.vue'
import ProviderReserveList from '@/components/user/provider/ProviderReserveList.vue'
import ProviderSaleUpload from '@/components/user/provider/ProviderSaleUpload.vue'
import PasswordChange from '@/components/user/PasswordChange.vue'

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

<style scoped>
.mypage-container {
    display: flex;
    height: calc(100vh - 80px); /* 헤더 높이 제외 */
}

.mypage-nav {
    width: 200px;
    background-color: #f4f4f4;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.mypage-nav button {
    padding: 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.3s;
}

.mypage-nav button.active,
.mypage-nav button:hover {
    background-color: #e0e0e0;
}

.mypage-content {
    flex-grow: 1;
    padding: 1rem;
    overflow-y: auto;
}
</style>
