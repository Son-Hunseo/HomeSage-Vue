<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Calendar from '@/components/user/Calendar.vue'
import PasswordChange from '@/components/user/PasswordChange.vue'
import ReservationList from '@/components/user/ReservationList.vue'
import FavoritesList from '@/components/user/FavoritesList.vue'
import '@/assets/styles/mypage.css'

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

<style scoped></style>
