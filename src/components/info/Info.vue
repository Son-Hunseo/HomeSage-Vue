<template>
    <Header/>
    <br>
    <br>
    <br>
    <div class="notice-board">
      <div class="notice-header">
        <h2>부동산 주요 정보</h2>
        <div class="total-count">
          전체 <strong>{{ notices.length }}</strong>건
        </div>
      </div>
  
      <div class="notice-list">
        <div
          v-for="notice in currentPageNotices"
          :key="notice.id"
          class="notice-item"
          @click="openModal(notice)"
        >
          <div class="notice-item-left">
            <span class="notice-number">{{ notice.id }}</span>
            <div class="notice-title-wrapper">
              <span class="notice-title">{{ notice.title }}</span>
              <span v-if="isNew(notice.date)" class="new-badge">NEW</span>
            </div>
          </div>
          <div class="notice-item-right">
            <span class="notice-date">{{ notice.date }}</span>
            <div class="notice-views">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                class="view-icon"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5.251C7.969 5.183 3.8 8 1.179 10.885a1.663 1.663 0 0 0 0 2.226C3.743 15.935 7.9 18.817 12 18.748c4.1.069 8.258-2.813 10.824-5.637a1.663 1.663 0 0 0 0-2.226C20.2 8 16.031 5.183 12 5.251z"
                ></path>
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"
                ></path>
              </svg>
              <span>{{ formatNumber(notice.views) }}</span>
            </div>
          </div>
        </div>
      </div>
  

<div class="pagination">
  <button 
    class="pagination-button" 
    :class="{ disabled: currentPage === 1 }"
    @click="goToPage(1)"
  >
    &lt;&lt;
  </button>
  <button 
    class="pagination-button"
    :class="{ disabled: currentPage === 1 }"
    @click="previousPage"
  >
    &lt;
  </button>
  <button
    v-for="page in displayedPages"
    :key="page"
    class="pagination-button"
    :class="{ active: currentPage === page }"
    @click="goToPage(page)"
  >
    {{ page }}
  </button>
  <button 
    class="pagination-button"
    :class="{ disabled: currentPage === totalPages }"
    @click="nextPage"
  >
    &gt;
  </button>
  <button 
    class="pagination-button"
    :class="{ disabled: currentPage === totalPages }"
    @click="goToPage(totalPages)"
  >
    &gt;&gt;
  </button>
</div>
  
      <!-- Modal -->
      <div v-if="selectedNotice" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <h3>{{ selectedNotice.title }}</h3>
              <span v-if="isNew(selectedNotice.date)" class="new-badge">NEW</span>
            </div>
            <button class="modal-close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-info">
            <div class="modal-meta">
              <span>등록일: {{ selectedNotice.date }}</span>
              <div class="notice-views">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  class="view-icon"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5.251C7.969 5.183 3.8 8 1.179 10.885a1.663 1.663 0 0 0 0 2.226C3.743 15.935 7.9 18.817 12 18.748c4.1.069 8.258-2.813 10.824-5.637a1.663 1.663 0 0 0 0-2.226C20.2 8 16.031 5.183 12 5.251z"
                  ></path>
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"
                  ></path>
                </svg>
                <span>{{ formatNumber(selectedNotice.views) }}</span>
              </div>
            </div>
            <div class="modal-body">
              {{ selectedNotice.content }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-button" @click="closeModal">닫기</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed } from 'vue'
import Header from "../Header.vue";

const selectedNotice = ref(null)

const openModal = (notice) => {
  selectedNotice.value = notice
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedNotice.value = null
  document.body.style.overflow = 'auto'
}
  
  const notices = ref([
    { id: 535, title: '전세 사기 위험 아파트 목록', date: '2024.10.18', views: 29 },
    { id: 534, title: '2024년 집주인 융자형 임대주택사업 2차 공고', date: '2024.10.18', views: 112 },
    { id: 533, title: '한국부동산원 2024 해외사업 동반진출 간담회 참석기업 초청 공지', date: '2024.10.14', views: 186 },
    { id: 532, title: '2024.6.1기준 공동주택 가격 열람 및 이의신청', date: '2024.09.27', views: 1235 },
    { id: 531, title: '2024 녹색건축한마당 개최 안내', date: '2024.08.26', views: 650 },
    { id: 530, title: '2024.6.1기준 공동주택가격(안) 열람 및 의견 제출', date: '2024.08.07', views: 2743 },
    { id: 529, title: '2024년 공공기관 종합합동평가 대비 관련 개인정보 목적적합성 제3자 제공사항 알림', date: '2024.07.24', views: 985 }
  ])
  
  const currentPage = ref(1)
  const itemsPerPage = 7
  const maxDisplayPages = 5
  
  const totalPages = computed(() => Math.ceil(notices.value.length / itemsPerPage))
  
  const displayedPages = computed(() => {
    let start = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2))
    let end = Math.min(totalPages.value, start + maxDisplayPages - 1)
    
    if (end - start + 1 < maxDisplayPages) {
      start = Math.max(1, end - maxDisplayPages + 1)
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })
  
  const currentPageNotices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return notices.value.slice(start, start + itemsPerPage)
  })
  
  const isNew = (date) => {
    const postDate = new Date(date.replace(/\./g, '-'))
    const now = new Date()
    const diffTime = Math.abs(now - postDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }
  
  const formatNumber = (num) => {
    return num.toLocaleString()
  }
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  </script>
  
  <style scoped>
  .notice-board {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f3f4f6;
  }
  
  .notice-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
  
  .total-count {
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .total-count strong {
    color: #111827;
    font-weight: 600;
  }
  
  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .notice-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .notice-item:hover {
    background-color: #f9fafb;
    transform: translateX(4px);
  }
  
  .notice-item-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
  }
  
  .notice-number {
    min-width: 48px;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .notice-title-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .notice-title {
    font-weight: 500;
    color: #1f2937;
  }
  
  .new-badge {
    background-color: #ef4444;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .notice-item-right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .notice-date {
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .notice-views {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .view-icon {
    color: #6b7280;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }
  
  .pagination-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    color: #374151;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .pagination-button:hover:not(.disabled) {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }
  
  .pagination-button.active {
    background-color: #2563eb;
    border-color: #2563eb;
    color: white;
  }
  
  .pagination-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    .notice-board {
      padding: 1rem;
    }
  
    .notice-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  
    .notice-item-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  .notice-item {
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-info {
  padding: 1.5rem;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-body {
  color: #374151;
  line-height: 1.6;
  white-space: pre-line;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 1rem;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-button:hover {
  background-color: #1d4ed8;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    height: 95vh;
    max-height: none;
  }
  
  .modal-body {
    max-height: calc(95vh - 250px);
  }
}
  </style>