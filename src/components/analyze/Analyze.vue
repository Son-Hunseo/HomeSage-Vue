<template>
    <Header />
    <div class="app-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>분석 목록</h2>
                <button
                    @click="toggleDeleteMode"
                    class="delete-mode-button"
                    :class="{ active: isDeleteMode }"
                >
                    삭제
                </button>
            </div>

            <div class="analysis-list">
                <div
                    v-for="analysis in analysisList"
                    :key="analysis.analyzeId"
                    class="analysis-item"
                    @click="isDeleteMode ? null : selectAnalysis(analysis)"
                >
                    <div class="item-content">
                        <span class="item-icon">📊</span>
                        <span class="item-name">{{ analysis.analyzeName }}</span>
                    </div>
                    <input
                        v-if="isDeleteMode"
                        type="checkbox"
                        v-model="selectedItems"
                        :value="analysis.analyzeId"
                        class="delete-checkbox"
                        @click.stop
                    />
                </div>

                <div
                    v-if="!isDeleteMode"
                    class="analysis-item new-analysis"
                    @click="startNewAnalysisCreation"
                >
                    <div v-if="!isCreatingNewAnalysis" class="item-content">
                        <span class="plus-icon">+</span>
                        <span>새 분석 시작</span>
                    </div>
                    <input
                        v-else
                        :value="newAnalysisName"
                        @input="(e) => (newAnalysisName = e.target.value)"
                        @compositionstart="isComposing = true"
                        @compositionend="isComposing = false"
                        @keydown.enter.prevent="handleEnterKey"
                        @blur="handleBlur"
                        class="new-analysis-input"
                        placeholder="분석 이름을 입력하세요"
                        type="text"
                    />
                </div>
            </div>

            <!-- Delete Actions -->
            <div v-if="isDeleteMode" class="delete-actions">  <!-- fixed-bottom 클래스는 필요없음 -->
                <button
                    @click="deleteSelectedAnalyses"
                    :disabled="selectedItems.length === 0"
                    class="delete-button"
                >
                    선택한 항목 삭제
                </button>
                <button @click="toggleDeleteMode" class="cancel-button">취소</button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <div v-if="activeAnalysis" class="analysis-area">
                <div class="analysis-header">
                    <h2>{{ activeAnalysis.analyzeName }}</h2>
                </div>

                <div class="analysis-grid">
                    <!-- Document Upload Section -->
                    <div class="upload-section">
                        <h3>등기부 등본</h3>
                        <div
                            v-if="!activeAnalysis.registeredUrl"
                            class="upload-area"
                            @drop.prevent="handleRegisteredDrop"
                            @dragover.prevent
                        >
                            <input
                                type="file"
                                ref="registeredInput"
                                @change="handleRegisteredUpload"
                                accept=".jpg,.png,.pdf"
                                style="display: none"
                            />
                            <div class="upload-placeholder" @click="triggerRegisteredUpload">
                                <span class="upload-icon">📄</span>
                                <span>파일을 드래그하거나 클릭하여 업로드</span>
                            </div>
                        </div>
                        <div v-else class="result-area">
                            <img :src="activeAnalysis.registeredUrl" alt="Registered Document" />
                            <button
                                v-if="!activeAnalysis.registeredResult"
                                @click="analyzeRegistered"
                                :disabled="isAnalyzingRegistered"
                                class="analyze-button"
                            >
                                등기부 등본 분석
                            </button>
                            <div v-if="isAnalyzingRegistered" class="loading-dots">
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                            </div>
                            <div
                                v-if="typingRegistered"
                                class="result-text typing"
                                v-html="renderMarkdown(typingRegistered.message)"
                            ></div>
                            <div
                                v-else-if="activeAnalysis.registeredResult"
                                class="result-text"
                                v-html="renderMarkdown(activeAnalysis.registeredResult)"
                            ></div>
                        </div>
                    </div>

                    <div class="upload-section">
                        <h3>건축물 대장</h3>
                        <div
                            v-if="!activeAnalysis.ledgerUrl"
                            class="upload-area"
                            @drop.prevent="handleLedgerDrop"
                            @dragover.prevent
                        >
                            <input
                                type="file"
                                ref="ledgerInput"
                                @change="handleLedgerUpload"
                                accept=".jpg,.png,.pdf"
                                style="display: none"
                            />
                            <div class="upload-placeholder" @click="triggerLedgerUpload">
                                <span class="upload-icon">📄</span>
                                <span>파일을 드래그하거나 클릭하여 업로드</span>
                            </div>
                        </div>
                        <div v-else class="result-area">
                            <img :src="activeAnalysis.ledgerUrl" alt="Ledger Document" />
                            <button
                                v-if="!activeAnalysis.ledgerResult"
                                @click="analyzeLedger"
                                :disabled="isAnalyzingLedger"
                                class="analyze-button"
                            >
                                건축물 대장 분석
                            </button>
                            <div v-if="isAnalyzingLedger" class="loading-dots">
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                            </div>
                            <div
                                v-if="typingLedger"
                                class="result-text typing"
                                v-html="renderMarkdown(typingLedger.message)"
                            ></div>
                            <div
                                v-else-if="activeAnalysis.ledgerResult"
                                class="result-text"
                                v-html="renderMarkdown(activeAnalysis.ledgerResult)"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="empty-state">
                <h3>분석을 선택하거나 새로운 분석을 시작하세요</h3>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, nextTick } from 'vue'
import Header from '@/components/Header.vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const axios = inject('axios')

const analysisList = ref([])
const activeAnalysis = ref(null)
const isDeleteMode = ref(false)
const selectedItems = ref([])

const registeredInput = ref(null)
const ledgerInput = ref(null)

// 분석 상태 관리
const isAnalyzingRegistered = ref(false)
const isAnalyzingLedger = ref(false)
const typingRegistered = ref(null)
const typingLedger = ref(null)

// 새로운 상태 변수들
const newAnalysisName = ref('')
const isCreatingNewAnalysis = ref(false)

const isComposing = ref(false)
const isCreating = ref(false)

// 엔터 키 핸들러 추가
const handleEnterKey = () => {
    if (!isComposing.value && !isCreating.value) {
        createNewAnalysis()
    }
}

// blur 핸들러 추가
const handleBlur = () => {
    if (!isCreating.value) {
        isCreatingNewAnalysis.value = false
        newAnalysisName.value = ''
    }
}

// Markdown 렌더링
const renderMarkdown = (text) => {
    if (!text) return ''
    return md.render(text)
}

// 타이핑 효과
const startTypingEffect = (message, type) => {
    const typingRef = type === 'registered' ? typingRegistered : typingLedger
    typingRef.value = {
        message: '',
        fullMessage: message,
    }

    let currentIndex = 0
    const typeNextCharacter = () => {
        if (currentIndex < typingRef.value.fullMessage.length) {
            typingRef.value.message += typingRef.value.fullMessage[currentIndex]
            currentIndex++
            setTimeout(typeNextCharacter, 30)
        } else {
            // 타이핑 완료 시 결과 저장 및 상태 초기화
            if (type === 'registered') {
                activeAnalysis.value.registeredResult = typingRef.value.fullMessage
                typingRegistered.value = null
                isAnalyzingRegistered.value = false
            } else {
                activeAnalysis.value.ledgerResult = typingRef.value.fullMessage
                typingLedger.value = null
                isAnalyzingLedger.value = false
            }
        }
    }

    typeNextCharacter()
}

// 새 분석 생성 관련 함수들
const startNewAnalysisCreation = () => {
    isCreatingNewAnalysis.value = true
    nextTick(() => {
        document.querySelector('.new-analysis-input')?.focus()
    })
}

const createNewAnalysis = async () => {
    if (!newAnalysisName.value.trim() || isCreating.value) return

    try {
        isCreating.value = true
        const response = await axios.post('/analyze', {
            analyzeName: newAnalysisName.value,
        })
        analysisList.value.push(response.data)
        await selectAnalysis(response.data)

        // Reset creation state
        isCreatingNewAnalysis.value = false
        newAnalysisName.value = ''
    } catch (error) {
        console.error('Error creating new analysis:', error)
    } finally {
        isCreating.value = false
    }
}

// 분석 요청 함수
const analyzeRegistered = async () => {
    if (isAnalyzingRegistered.value) return

    isAnalyzingRegistered.value = true
    try {
        const response = await axios.get(
            `/analyze/${activeAnalysis.value.analyzeId}/registered`,
        )
        startTypingEffect(response.data.result, 'registered')
    } catch (error) {
        console.error('Error analyzing registered document:', error)
        isAnalyzingRegistered.value = false
    }
}

const analyzeLedger = async () => {
    if (isAnalyzingLedger.value) return

    isAnalyzingLedger.value = true
    try {
        const response = await axios.get(
            `/analyze/${activeAnalysis.value.analyzeId}/ledger`,
        )
        startTypingEffect(response.data.result, 'ledger')
    } catch (error) {
        console.error('Error analyzing ledger document:', error)
        isAnalyzingLedger.value = false
    }
}

// 파일 업로드 관련 함수들
const fetchAnalysisList = async () => {
    try {
        const response = await axios.get('/analyze')
        analysisList.value = response.data.analyzeList
    } catch (error) {
        console.error('Error fetching analysis list:', error)
    }
}

const selectAnalysis = async (analysis) => {
    try {
        const response = await axios.get(`/analyze/${analysis.analyzeId}`)
        activeAnalysis.value = {
            ...analysis,
            ...response.data,
        }
    } catch (error) {
        console.error('Error selecting analysis:', error)
    }
}

const toggleDeleteMode = () => {
    isDeleteMode.value = !isDeleteMode.value
    selectedItems.value = []
}

const deleteSelectedAnalyses = async () => {
    try {
        await Promise.all(selectedItems.value.map((id) => axios.delete(`/analyze/${id}`)))
        analysisList.value = analysisList.value.filter(
            (analysis) => !selectedItems.value.includes(analysis.analyzeId),
        )
        toggleDeleteMode()
    } catch (error) {
        console.error('Error deleting analyses:', error)
    }
}

// File upload handlers
const triggerRegisteredUpload = () => {
    registeredInput.value.click()
}

const triggerLedgerUpload = () => {
    ledgerInput.value.click()
}

const handleRegisteredUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
        await uploadFile(file, 'registered')
    }
}

const handleLedgerUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
        await uploadFile(file, 'ledger')
    }
}

const handleRegisteredDrop = async (event) => {
    const file = event.dataTransfer.files[0]
    if (file) {
        await uploadFile(file, 'registered')
    }
}

const handleLedgerDrop = async (event) => {
    const file = event.dataTransfer.files[0]
    if (file) {
        await uploadFile(file, 'ledger')
    }
}

const uploadFile = async (file, type) => {
    if (!activeAnalysis.value) return

    const formData = new FormData()
    formData.append('file', file)

    try {
        await axios.post(`/analyze/${activeAnalysis.value.analyzeId}/${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        // Refresh analysis data after upload
        await selectAnalysis(activeAnalysis.value)
    } catch (error) {
        console.error(`Error uploading ${type} file:`, error)
    }
}

onMounted(fetchAnalysisList)
</script>

<style scoped>
.app-container {
    display: flex;
    height: calc(100vh - 100px); /* 헤더 높이(64px) + 테두리(1px) + 패딩(8px) 제외 */
    background-color: #f0f2f5;
    margin-top: 1px;
}

.sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.analysis-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.analysis-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.analysis-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.item-icon {
    font-size: 1.2em;
}

.item-name {
    font-weight: 500;
}

.item-stats {
    display: flex;
    gap: 12px;
    font-size: 0.9em;
    color: #666;
}

.new-analysis {
    border: 2px dashed #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.plus-icon {
    font-size: 1.5em;
    margin-right: 8px;
}

.main-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.analysis-header {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.progress-indicator {
    background: #e8f5e9;
    color: #2e7d32;
    padding: 8px 16px;
    border-radius: 16px;
    font-weight: 500;
}

.analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.upload-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
}

.upload-area {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 40px;
    margin-top: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-area:hover {
    border-color: #2196f3;
    background: #f5f9ff;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
}

.upload-icon {
    font-size: 2em;
}

.result-area {
    margin-top: 16px;
}

.result-area img {
    width: 100%;
    max-width: 400px; /* 최대 너비 제한 */
    height: auto;
    border-radius: 4px;
    margin-bottom: 16px;
    display: block; /* 이미지 중앙 정렬을 위해 */
    margin-left: auto;
    margin-right: auto;
}

.result-text {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    white-space: pre-wrap;
    line-height: 1.7; /* 줄간격 조정 */
    font-size: 14px; /* 폰트 크기 조정 */
}

.delete-mode-button {
    padding: 6px 12px;
    border: 1px solid #dc3545;
    color: #dc3545;
    background: none;
    border-radius: 4px;
    cursor: pointer;
}

.delete-mode-button.active {
    background: #dc3545;
    color: white;
}

.delete-actions {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 8px;
}

.delete-button {
    flex: 1;
    padding: 8px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.delete-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.cancel-button {
    flex: 1;
    padding: 8px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
}

.analyze-button {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    background-color: #8b4513;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.analyze-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.loading-dots {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 16px;
}

.dot {
    width: 8px;
    height: 8px;
    background-color: #8b4513;
    border-radius: 50%;
    animation: bounce 0.8s infinite;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}
.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}

.typing {
    opacity: 0.8;
}

/* 나머지 기존 스타일은 유지 */

.analysis-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.analysis-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-content {
    display: flex;
}

.new-analysis-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.new-analysis-input:focus {
    outline: none;
    border-color: #8b4513;
}

/* 마크다운 요소들의 스타일 통일 */
.result-text :deep(p),
.result-text :deep(ul),
.result-text :deep(ol),
.result-text :deep(h1),
.result-text :deep(h2),
.result-text :deep(h3),
.result-text :deep(h4),
.result-text :deep(h5),
.result-text :deep(h6),
.result-text :deep(blockquote) {
    margin: 0;
    line-height: 1.7;
}

.result-text :deep(li) {
    margin: 0;
    line-height: 1.7;
}

/* 리스트 패딩 조정 */
.result-text :deep(ul),
.result-text :deep(ol) {
    padding-left: 1.5em;
    margin: 0;
}

.sidebar {
    position: relative; /* 추가 */
}

.sidebar .delete-actions {
    position: fixed;
    bottom: 0;
    width: 300px;
    background: white;
    z-index: 10;
    border-top: 1px solid #e0e0e0;
}


</style>
