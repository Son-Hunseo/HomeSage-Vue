<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Calendar from '@/components/user/Calendar.vue'
import PasswordChange from '@/components/user/PasswordChange.vue'
import ReservationList from '@/components/user/ReservationList.vue'
import FavoritesList from '@/components/user/FavoritesList.vue'

const activeTab = ref('calendar')
</script>

<template>
    <div>
        <Header />
        <div class="mypage-container">
            <nav class="mypage-nav">
                <button
                    @click="activeTab = 'calendar'"
                    :class="{ active: activeTab === 'calendar' }"
                >
                    달력
                </button>
                <button
                    @click="activeTab = 'reservations'"
                    :class="{ active: activeTab === 'reservations' }"
                >
                    예약목록
                </button>
                <button
                    @click="activeTab = 'favorites'"
                    :class="{ active: activeTab === 'favorites' }"
                >
                    찜목록
                </button>
                <button
                    @click="activeTab = 'password'"
                    :class="{ active: activeTab === 'password' }"
                >
                    비밀번호 변경
                </button>
            </nav>

            <main class="mypage-content">
                <Calendar v-if="activeTab === 'calendar'" />
                <PasswordChange v-if="activeTab === 'password'" />
                <ReservationList v-if="activeTab === 'reservations'" />
                <FavoritesList v-if="activeTab === 'favorites'" />
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
