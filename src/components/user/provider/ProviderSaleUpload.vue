<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSaleStore } from '@/stores/sale-store'

const router = useRouter()
const saleStore = useSaleStore()

// 폼 데이터
const saleData = ref({
    saleType: '',
    homeType: '',
    price: null,
    monthlyFee: null,
    managementFee: null,
    space: null,
    description: '',
    floor: '',
    nearStation: '',
    city: '',
    gu: '',
    dong: '',
    latitude: null,
    longitude: null,
})

// 파일 관련
const imageFile = ref(null)
const imagePreview = ref(null)

// 옵션 데이터
const saleTypeOptions = [
    { value: '월세', label: '월세' },
    { value: '전세', label: '전세' },
    { value: '매매', label: '매매' },
]

const homeTypeOptions = [
    { value: '아파트', label: '아파트' },
    { value: '원룸', label: '원룸' },
    { value: '투룸', label: '투룸' },
    { value: '주택', label: '주택' },
]

// 이미지 선택 핸들러
const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.includes('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
    }

    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => (imagePreview.value = e.target.result)
    reader.readAsDataURL(file)
}

// 폼 제출 처리
const handleSubmit = async () => {
    if (!imageFile.value) {
        alert('매물 이미지를 선택해주세요.')
        return
    }

    try {
        await saleStore.uploadSale(saleData.value, imageFile.value)
        alert('매물이 성공적으로 등록되었습니다.')
        router.push('/provider/sales')
    } catch (e) {
        alert(saleStore.error || '매물 등록에 실패했습니다.')
    }
}
</script>

<template>
    <div class="upload-container">
        <h2 class="title">매물 등록</h2>

        <form @submit.prevent="handleSubmit" class="upload-form">
            <!-- 매물 기본 정보 -->
            <div class="form-section">
                <h3>기본 정보</h3>

                <div class="form-group">
                    <label>매물 종류</label>
                    <select v-model="saleData.saleType" required>
                        <option value="">선택해주세요</option>
                        <option
                            v-for="option in saleTypeOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label>건물 종류</label>
                    <select v-model="saleData.homeType" required>
                        <option value="">선택해주세요</option>
                        <option
                            v-for="option in homeTypeOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- 가격 정보 -->
            <div class="form-section">
                <h3>가격 정보</h3>

                <div class="form-group">
                    <label>매매/전세가 (만원)</label>
                    <input type="number" v-model="saleData.price" required min="0" />
                </div>

                <div class="form-group" v-if="saleData.saleType === 'MONTHLY'">
                    <label>월세 (만원)</label>
                    <input type="number" v-model="saleData.monthlyFee" min="0" />
                </div>

                <div class="form-group">
                    <label>관리비 (만원)</label>
                    <input type="number" v-model="saleData.managementFee" required min="0" />
                </div>
            </div>

            <!-- 상세 정보 -->
            <div class="form-section">
                <h3>상세 정보</h3>

                <div class="form-group">
                    <label>면적 (평)</label>
                    <input type="number" v-model="saleData.space" required min="0" step="0.1" />
                </div>

                <div class="form-group">
                    <label>층수</label>
                    <input type="text" v-model="saleData.floor" required />
                </div>

                <div class="form-group">
                    <label>인근 역</label>
                    <input type="text" v-model="saleData.nearStation" />
                </div>

                <div class="form-group">
                    <label>설명</label>
                    <textarea v-model="saleData.description" required rows="4"></textarea>
                </div>
            </div>

            <!-- 위치 정보 -->
            <div class="form-section">
                <h3>위치 정보</h3>

                <div class="form-group">
                    <label>시</label>
                    <input type="text" v-model="saleData.city" required />
                </div>

                <div class="form-group">
                    <label>구</label>
                    <input type="text" v-model="saleData.gu" required />
                </div>

                <div class="form-group">
                    <label>동</label>
                    <input type="text" v-model="saleData.dong" required />
                </div>

                <div class="form-group">
                    <label>위도</label>
                    <input type="number" v-model="saleData.latitude" required step="any" />
                </div>

                <div class="form-group">
                    <label>경도</label>
                    <input type="number" v-model="saleData.longitude" required step="any" />
                </div>
            </div>

            <!-- 이미지 업로드 -->
            <div class="form-section">
                <h3>매물 이미지</h3>

                <div class="form-group">
                    <label>대표 이미지</label>
                    <input type="file" @change="handleImageSelect" accept="image/*" required />
                </div>

                <div v-if="imagePreview" class="image-preview">
                    <img :src="imagePreview" alt="매물 이미지 미리보기" />
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" :disabled="saleStore.loading" class="submit-button">
                    {{ saleStore.loading ? '등록 중...' : '매물 등록' }}
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.upload-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.form-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 18px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #666;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-group textarea {
    resize: vertical;
}

.image-preview {
    margin-top: 10px;
}

.image-preview img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
}

.form-actions {
    margin-top: 20px;
    text-align: center;
}

.submit-button {
    padding: 12px 24px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
}

.submit-button:hover {
    background: #45a049;
}

.submit-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
}
</style>
