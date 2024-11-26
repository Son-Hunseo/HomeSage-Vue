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
            <div v-if="isDeleteMode" class="delete-actions">
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
                    <div class="document-toggle">
                        <button 
                            :class="{ active: activeDocumentType === 'registered' }"
                            @click="activeDocumentType = 'registered'"
                            class="toggle-button"
                        >
                            등기부 등본
                        </button>
                        <button 
                            :class="{ active: activeDocumentType === 'ledger' }"
                            @click="activeDocumentType = 'ledger'"
                            class="toggle-button"
                        >
                            건축물 대장
                        </button>
                    </div>
                </div>

                <div class="upload-section" v-if="activeDocumentType === 'registered'">
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

                        <div class="upper-content">
                            <div class="upper-content">
                                <div class="document-preview">
                                    <div class="document-container">
                                        <img 
                                            :src="activeAnalysis[`${activeDocumentType}Url`]" 
                                            :alt="`${activeDocumentType} Document`"
                                            class="main-image"
                                        />
                                        <img 
                                            v-if="activeAnalysis[`${activeDocumentType}Score`] === 'A+'"
                                            src="@/assets/A+.png"
                                            alt="A+"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'A'"
                                            src="@/assets/A.png"
                                            alt="A"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'B+'"
                                            src="@/assets/B+.png"
                                            alt="B+"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'B'"
                                            src="@/assets/B.png"
                                            alt="B"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'C+'"
                                            src="@/assets/C+.png"
                                            alt="C+"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'C'"
                                            src="@/assets/C.png"
                                            alt="C"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'D'"
                                            src="@/assets/D.png"
                                            alt="D"
                                            class="score-image"
                                        />
                                        <img 
                                            v-else-if="activeAnalysis[`${activeDocumentType}Score`] === 'F'"
                                            src="@/assets/F.png"
                                            alt="F"
                                            class="score-image"
                                        />
                                    </div>
                                </div>
                                <div class="document-summary" v-if="showRegisteredSummary">
                                    <div class="summary-box">
                                        <div class="summary-header">
                                            <h3>분석 요약</h3>
                                            <div class="risk-indicator"></div>
                                        </div>
                                        <div 
                                            class="summary-content"
                                            v-html="renderMarkdown(activeAnalysis[`${activeDocumentType}Summary`])"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            v-if="!activeAnalysis.registeredResult"
                            @click="analyzeRegistered"
                            :disabled="isAnalyzingRegistered"
                            class="analyze-button"
                        >
                            등기부 등본 분석
                        </button>
                        <div 
                            v-if="(isAnalyzingRegistered && !typingRegistered) || (isAnalyzingLedger && !typingLedger)" 
                            class="analysis-progress"
                        >
                            <div class="progress-container">
                                <transition-group 
                                    name="slide-up" 
                                    tag="div" 
                                    class="progress-messages"
                                >
                                    <p 
                                        v-for="(message, index) in analysisMessages" 
                                        :key="message"
                                        v-show="currentMessageIndex === index"
                                        class="progress-message"
                                    >
                                        {{ message }}{{ '.'.repeat(dotCount) }}
                                    </p>
                                </transition-group>
                                <div class="progress-bar">
                                    <div class="progress-bar-fill" :style="{ width: `${progressWidth}%` }"></div>
                                </div>
                            </div>
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

                <div class="upload-section" v-if="activeDocumentType === 'ledger'">
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

                        <div class="upper-content">
                            <div class="document-preview">
                                <div class="document-container">
                                    <img 
                                        :src="activeAnalysis.ledgerUrl" 
                                        alt="Ledger Document"
                                        class="main-image"
                                    />
                                    <img 
                                        v-if="activeAnalysis.ledgerScore === 'A+'"
                                        src="@/assets/A+.png"
                                        alt="A+"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'A'"
                                        src="@/assets/A.png"
                                        alt="A"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'B+'"
                                        src="@/assets/B+.png"
                                        alt="B+"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'B'"
                                        src="@/assets/B.png"
                                        alt="B"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'C+'"
                                        src="@/assets/C+.png"
                                        alt="C+"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'C'"
                                        src="@/assets/C.png"
                                        alt="C"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'D'"
                                        src="@/assets/D.png"
                                        alt="D"
                                        class="score-image"
                                    />
                                    <img 
                                        v-else-if="activeAnalysis.ledgerScore === 'F'"
                                        src="@/assets/F.png"
                                        alt="F"
                                        class="score-image"
                                    />
                                </div>
                            </div>
                            <div class="document-summary" v-if="showLedgerSummary">
                                <div class="summary-box">
                                    <div class="summary-header">
                                        <h3>분석 요약</h3>
                                        <div class="risk-indicator"></div>
                                    </div>
                                    <div 
                                        class="summary-content"
                                        v-html="renderMarkdown(activeAnalysis[`${activeDocumentType}Summary`])"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            v-if="!activeAnalysis.ledgerResult"
                            @click="analyzeLedger"
                            :disabled="isAnalyzingLedger"
                            class="analyze-button"
                        >
                            건축물 대장 분석
                        </button>
                        <div 
                            v-if="isAnalyzingLedger && !typingLedger" 
                            class="analysis-progress"
                        >
                            <div class="progress-container">
                                <transition-group 
                                    name="slide-up" 
                                    tag="div" 
                                    class="progress-messages"
                                >
                                    <p 
                                        v-for="(message, index) in analysisMessages" 
                                        :key="message"
                                        v-show="currentMessageIndex === index"
                                        class="progress-message"
                                    >
                                        {{ message }}{{ '.'.repeat(dotCount) }}
                                    </p>
                                </transition-group>
                                <div class="progress-bar">
                                    <div class="progress-bar-fill" :style="{ width: `${progressWidth}%` }"></div>
                                </div>
                            </div>
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
            <div v-else class="empty-state">
                <h3>분석을 선택하거나 새로운 분석을 시작하세요</h3>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, nextTick, watch, onUnmounted, computed } from 'vue'
import Header from '@/components/Header.vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const axios = inject('axios')

const analysisList = ref([])
const activeAnalysis = ref(null)
const isDeleteMode = ref(false)
const selectedItems = ref([])
const activeDocumentType = ref('registered') // 새로 추가된 상태

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

const showRegisteredSummary = ref(false)
const showLedgerSummary = ref(false)
const typingContent = computed(() => 
    activeDocumentType.value === 'registered' ? typingRegistered.value : typingLedger.value
)

// 분석 진행 상태 관련 상태 추가
const analysisMessages = ref([
    '문서를 스캔하는 중입니다',
    '안심전세 포털의 부동산 사기 사례들을 참조하는 중입니다',
    '부동산 용어집을 참조하는 중입니다'
])
const currentMessageIndex = ref(0)
const dotCount = ref(1)
const progressWidth = ref(0)

// 메시지 및 진행률 업데이트를 위한 타이머 관리
let messageInterval = null
let dotInterval = null

const startProgressAnimation = () => {
    // 메시지 변경 타이머
    messageInterval = setInterval(() => {
        currentMessageIndex.value = (currentMessageIndex.value + 1) % analysisMessages.value.length
        progressWidth.value = ((currentMessageIndex.value * 3000) % (analysisMessages.value.length * 3000)) / (analysisMessages.value.length * 3000) * 100
    }, 3000)

    // 점(...) 애니메이션 타이머
    dotInterval = setInterval(() => {
        dotCount.value = (dotCount.value % 3) + 1
    }, 500)
}

const stopProgressAnimation = () => {
    if (messageInterval) clearInterval(messageInterval)
    if (dotInterval) clearInterval(dotInterval)
    currentMessageIndex.value = 0
    dotCount.value = 1
    progressWidth.value = 0
}

// 분석 상태 변경 감시
// 분석 상태와 타이핑 상태 모두를 감시
watch([isAnalyzingRegistered, isAnalyzingLedger, typingRegistered, typingLedger], 
    ([newReg, newLedg, newTypeReg, newTypeLedg], [oldReg, oldLedg, oldTypeReg, oldTypeLedg]) => {
        // 분석이 시작되고 아직 타이핑이 시작되지 않았을 때 애니메이션 시작
        if ((!oldReg && !oldLedg) && (newReg || newLedg) && !newTypeReg && !newTypeLedg) {
            startProgressAnimation()
        }
        // 분석이 끝났거나 타이핑이 시작되면 애니메이션 정지
        if (((oldReg || oldLedg) && (!newReg && !newLedg)) || 
            (!oldTypeReg && !oldTypeLedg && (newTypeReg || newTypeLedg))) {
            stopProgressAnimation()
        }
    }
)

watch(typingContent, (newValue) => {
    if (!newValue && activeAnalysis.value?.[`${activeDocumentType.value}Result`]) {
        startSummaryTypingEffect(activeAnalysis.value[`${activeDocumentType.value}Summary`])
    }
})

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
    stopProgressAnimation()
})

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
    const typingRef = type === 'registered' ? typingRegistered : typingLedger;
    typingRef.value = {
        message: '',
        fullMessage: message,
    };

    let currentIndex = 0;
    const typeNextCharacter = () => {
        if (currentIndex < typingRef.value.fullMessage.length) {
            typingRef.value.message += typingRef.value.fullMessage[currentIndex];
            currentIndex++;
            setTimeout(typeNextCharacter, 30);
        } else {
            if (type === 'registered') {
                activeAnalysis.value.registeredResult = typingRef.value.fullMessage;
                showRegisteredSummary.value = true; // 등록 결과가 완료되면 요약 표시
                typingRegistered.value = null;
                isAnalyzingRegistered.value = false;
            } else {
                activeAnalysis.value.ledgerResult = typingRef.value.fullMessage;
                showLedgerSummary.value = true; // 건축물 대장 결과가 완료되면 요약 표시
                typingLedger.value = null;
                isAnalyzingLedger.value = false;
            }
        }
    };

    typeNextCharacter();
};

watch(typingContent, (newValue) => {
    if (!newValue && activeAnalysis.value?.[`${activeDocumentType.value}Result`]) {
        if (activeDocumentType.value === 'registered') {
            showRegisteredSummary.value = true; // 등기부 등본 요약 표시
        } else if (activeDocumentType.value === 'ledger') {
            showLedgerSummary.value = true; // 건축물 대장 요약 표시
        }
    }
});

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
            `/analyze/${activeAnalysis.value.analyzeId}/registered`
        )
        activeAnalysis.value.registeredSummary = response.data.summary
        activeAnalysis.value.registeredScore = response.data.score
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
            `/analyze/${activeAnalysis.value.analyzeId}/ledger`
        )
        activeAnalysis.value.ledgerSummary = response.data.summary
        activeAnalysis.value.ledgerScore = response.data.score
        startTypingEffect(response.data.result, 'ledger')
    } catch (error) {
        console.error('Error analyzing ledger document:', error)
        isAnalyzingLedger.value = false
    }
}

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

        showRegisteredSummary.value = !!response.data.registeredResult
        showLedgerSummary.value = !!response.data.ledgerResult
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
            (analysis) => !selectedItems.value.includes(analysis.analyzeId)
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
    height: calc(100vh - 100px);
    background-color: #f0f2f5;
    margin-top: 1px;
}

.sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    position: relative;
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
    align-items: center;
    gap: 12px;
}

.item-icon {
    font-size: 1.2em;
}

.item-name {
    font-weight: 500;
}

.new-analysis {
    border: 2px dashed #e0e0e0;
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
}

.document-toggle {
    display: flex;
    gap: 1px;
    background: #e0e0e0;
    padding: 1px;
    border-radius: 8px;
    margin-top: 16px;
}

.toggle-button {
    flex: 1;
    padding: 12px 24px;
    border: none;
    background: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.toggle-button:first-child {
    border-radius: 8px 0 0 8px;
}

.toggle-button:last-child {
    border-radius: 0 8px 8px 0;
}

.toggle-button.active {
    background: #4A90E2;
    color: white;
}

.upload-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    min-height: calc(100vh - 300px);
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
    max-width: 400px;
    height: auto;
    border-radius: 4px;
    margin-bottom: 16px;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

.result-text {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    white-space: pre-wrap;
    line-height: 1.7;
    font-size: 14px;
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
    background: white;
    display: flex;
    gap: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
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
    background-color: #4A90E2;
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
    background-color: #255584;
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
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}

.typing {
    opacity: 0.8;
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
    border-color: #255584;
}

.result-text :deep(p),
.result-text :deep(ul),
.result-text :deep(ol),
.result-text :deep(blockquote) {
    margin: 0.5em 0;  /* 여백도 살짝 줄임 */
    line-height: 1.7;  /* 1.7에서 1.3으로 줄간격 감소 */
}

/* 제목 스타일 */
.result-text :deep(h1),
.result-text :deep(h2),
.result-text :deep(h3),
.result-text :deep(h4),
.result-text :deep(h5),
.result-text :deep(h6) {
    margin: 1em 0 0.5em 0;  /* 여백 조정 */
    line-height: 1;  /* 제목 줄간격 감소 */
    font-weight: 600;
}

.result-text :deep(li) {
    margin: 0.3em 0;  /* 리스트 아이템 간격 감소 */
    line-height: 1;  /* 줄간격 감소 */
}

.result-text :deep(ul),
.result-text :deep(ol) {
    padding-left: 2em;
    margin: 0em 0;  /* 여백 감소 */
}

.result-text :deep(blockquote) {
    padding: 0.5em 1em;  /* 안쪽 여백 감소 */
    border-left: 4px solid #e2e8f0;
    background-color: #f8fafc;
    margin: 0.7em 0;
    line-height: 1;  /* 블록인용구 줄간격도 감소 */
}

/* Analysis Progress Styles */
.analysis-progress {
    width: 100%;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.progress-container {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;  /* 1.5rem에서 증가 */
}

.progress-messages {
    height: 80px;  /* 60px에서 증가 */
    width: 100%;
    position: relative;
    overflow: hidden;
}

.progress-message {
    position: absolute;
    width: 100%;
    text-align: center;
    font-size: 1.25rem;  /* 더 크게 변경 */
    font-weight: 500;    /* 글씨를 약간 더 굵게 */
    color: #4a5568;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.5s ease;
}

.slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-up-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.progress-bar {
    width: 300px;      /* 너비도 좀 더 넓게 */
    height: 8px;       /* 높이를 2배로 */
    background-color: #e2e8f0;
    border-radius: 4px; /* 모서리도 약간 더 둥글게 */
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background-color: #4A90E2;
    border-radius: 4px; /* 이것도 맞춰서 수정 */
    transition: width 0.3s ease-out;
}

.upper-content {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    justify-content: center;
    align-items: flex-start;
}

.document-preview {
    flex: 0 0 400px; /* 고정 너비 설정 */
    position: relative;
}

.document-preview img {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 4px;
}

.score-badge {
    position: absolute;
    top: 8px;
    right: 250px;
    z-index: 10;
}

.score-image {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 150px !important;
    height: 150px !important;
    z-index: 10;
}

.document-summary {
    flex: 0 0 400px; /* 고정 너비 설정 */
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.document-summary h3 {
    margin-bottom: 16px;
    color: #2d3748;
}

.document-container {
    width: 400px;
    position: relative;
    display: inline-block;
}

.main-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 4px;
}
</style>