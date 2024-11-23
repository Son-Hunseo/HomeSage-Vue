<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'

const notices = ref([
    { id: 535, title: '전세 사기 위험 아파트 목록', date: '2024.10.18', views: 29 },
    {
        id: 534,
        title: '2024년 집주인 융자형 임대주택사업 2차 공고',
        date: '2024.10.18',
        views: 112,
    },
    {
        id: 533,
        title: '한국부동산원 2024 해외사업 동반진출 간담회 참석기업 초청 공지',
        date: '2024.10.14',
        views: 186,
    },
    {
        id: 532,
        title: '2024.6.1기준 공동주택 가격 열람 및 이의신청',
        date: '2024.09.27',
        views: 1235,
    },
    { id: 531, title: '2024 녹색건축한마당 개최 안내', date: '2024.08.26', views: 650 },
    {
        id: 530,
        title: '2024.6.1기준 공동주택가격(안) 열람 및 의견 제출',
        date: '2024.08.07',
        views: 2743,
    },
    {
        id: 529,
        title: '2024년 공공기관 종합합동평가 대비 관련 개인정보 목적적합성 제3자 제공사항 알림',
        date: '2024.07.24',
        views: 985,
    },
])

const totalNotices = notices.value.length // 전체 공지사항 개수
const totalPages = Math.ceil(totalNotices / 10) // 페이지 계산 (기본 10개씩)
</script>

<template>
    <Header />
    <div class="notice-container">
        <div class="header">
            <h2>알림마당</h2>
        </div>
        <br />
        <div class="meta-info">
            <span
                >전체 <strong>{{ totalNotices }}</strong
                >건</span
            >
            <span>1/{{ totalPages }}페이지</span>
        </div>
        <table class="notice-table">
            <thead>
                <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>등록일</th>
                    <th>조회</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="notice in notices" :key="notice.id">
                    <td>{{ notice.id }}</td>
                    <td>{{ notice.title }}</td>
                    <td>{{ notice.date }}</td>
                    <td>{{ notice.views }}</td>
                </tr>
            </tbody>
        </table>
        <div class="pagination">
            <button>&lt;&lt;</button>
            <button>&lt;</button>
            <button v-for="page in totalPages" :key="page">{{ page }}</button>
            <button>&gt;</button>
            <button>&gt;&gt;</button>
        </div>
    </div>
</template>

<style scoped>
.notice-container {
    padding: 20px;
    background: #f9f9f9;
}

.header {
    margin-bottom: 20px;
}

.notice-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.notice-table th,
.notice-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

.meta-info {
    margin-bottom: 10px;
    font-size: 0.9rem;
}

.pagination {
    display: flex;
    gap: 5px;
    justify-content: center;
}
</style>
