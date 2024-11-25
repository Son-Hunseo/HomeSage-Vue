<script setup>
// 필요한 모듈 import
import { ref, watch } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'
import { useSaleStore } from '@/stores/sale-store'
import { storeToRefs } from 'pinia'

// Pinia store 및 상태 설정
const saleStore = useSaleStore()
const { sales, selectedSale, loading, isSearchMode } = storeToRefs(saleStore)

// 지도 관련 상태 정의
const map = ref(null) // 카카오맵 인스턴스
const center = ref({
    // 지도 중심 좌표
    lat: 37.5665,
    lng: 126.978,
})
const zoomLevel = ref(5) // 지도 줌 레벨
let isMoving = false // 지도 이동/줌 중인지 추적하는 플래그

/**
 * 줌 레벨에 따른 검색 반경 계산
 * @param {number} level - 현재 지도의 줌 레벨
 * @returns {number} - 계산된 검색 반경
 */
const calculateRadius = (level) => {
    const baseRadius = 100
    const multiplier = Math.pow(2, level - 1)
    return baseRadius * multiplier
}

/**
 * 검색 결과에 따른 지도 이동 처리
 * isSearchMode가 true일 때만 동작
 */
watch(
    sales,
    (newSales) => {
        if (!isSearchMode.value || !newSales.length || !map.value) return

        // 첫 번째 매물 위치로 지도 중심 이동
        const firstSale = newSales[0]
        const moveLatLng = new kakao.maps.LatLng(
            Number(firstSale.latitude),
            Number(firstSale.longitude),
        )

        // 모든 매물이 보이도록 지도 영역 설정
        const bounds = new kakao.maps.LatLngBounds()
        newSales.forEach((sale) => {
            bounds.extend(new kakao.maps.LatLng(Number(sale.latitude), Number(sale.longitude)))
        })

        // 지도 이동 및 영역 설정
        map.value.setCenter(moveLatLng)
        map.value.setBounds(bounds, {
            padding: 50, // 마커와 지도 경계 사이 여백
        })

        // 검색 모드 종료
        setTimeout(() => {
            isSearchMode.value = false
        }, 500)
    },
    { immediate: true },
)

/**
 * 지도 정보 업데이트 및 매물 데이터 조회
 * 지도 이동이 끝난 후 호출됨
 */
const updateMapAndFetch = async () => {
    if (isSearchMode.value || !map.value) return

    // 현재 지도 중심 좌표 업데이트
    const mapCenter = map.value.getCenter()
    center.value = {
        lat: Number(mapCenter.getLat().toFixed(6)),
        lng: Number(mapCenter.getLng().toFixed(6)),
    }
    zoomLevel.value = map.value.getLevel()
    console.log('위도: ' + center.value.lat)
    console.log('경도: ' + center.value.lng)

    // 현재 위치 기준으로 매물 데이터 조회
    await saleStore.fetchSalesByMapCenter(
        center.value.lat,
        center.value.lng,
        calculateRadius(zoomLevel.value),
    )
}

/**
 * 카카오맵 로드 완료 시 호출되는 핸들러
 * @param {object} mapInstance - 카카오맵 인스턴스
 */
const onLoadKakaoMap = (mapInstance) => {
    map.value = mapInstance

    // 지도 타입 컨트롤 추가
    const mapTypeControl = new kakao.maps.MapTypeControl()
    map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)

    // 초기 지도 정보 설정
    const initialCenter = map.value.getCenter()
    center.value = {
        lat: Number(initialCenter.getLat().toFixed(6)),
        lng: Number(initialCenter.getLng().toFixed(6)),
    }
    zoomLevel.value = map.value.getLevel()

    // 초기 데이터 조회
    updateMapAndFetch()

    // 지도 이벤트 리스너 등록
    kakao.maps.event.addListener(map.value, 'dragstart', () => {
        isMoving = true
    })

    kakao.maps.event.addListener(map.value, 'dragend', () => {
        isMoving = false
        updateMapAndFetch()
    })

    kakao.maps.event.addListener(map.value, 'zoom_started', () => {
        isMoving = true
    })

    kakao.maps.event.addListener(map.value, 'zoom_changed', () => {
        if (!isMoving) {
            updateMapAndFetch()
        }
    })
}

/**
 * 마커 클릭 시 상세 정보 표시
 */
const handleMarkerClick = (sale) => {
    // 이미 선택된 매물을 다시 클릭한 경우 선택 해제
    if (selectedSale.value?.saleId === sale.saleId) {
        saleStore.clearSelectedSale()
    } else {
        // 다른 매물을 클릭한 경우 선택
        saleStore.setSelectedSale(sale)
    }
}

/**
 * 가격 포맷팅 (ex: 1,000만원)
 */
const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

/**
 * 마커의 인포윈도우 표시 여부 결정
 */
const isInfoWindowVisible = (saleId) => {
    return selectedSale.value?.saleId === saleId
}
</script>

<template>
    <div id="map-section" class="map-container">
        <div v-if="loading" class="loading-indicator">Loading...</div>

        <KakaoMap
            :lat="center.lat"
            :lng="center.lng"
            :level="zoomLevel"
            @onLoadKakaoMap="onLoadKakaoMap"
            style="width: 100%; height: 100%"
        >
            <template v-if="sales.length > 0">
                <KakaoMapMarker
                    v-for="sale in sales"
                    :key="sale.saleId"
                    :lat="sale.latitude"
                    :lng="sale.longitude"
                    :clickable="true"
                    :infoWindow="{
                        content: `<div class='marker-info'>${formatPrice(sale.price)}</div>`,
                        visible: isInfoWindowVisible(sale.saleId),
                    }"
                    @onClickKakaoMapMarker="() => handleMarkerClick(sale)"
                />
            </template>
        </KakaoMap>
    </div>
</template>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.loading-indicator {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 1000;
}

:deep(.marker-info) {
    margin: 0 40px;
    padding: 7px 5px;
    /* background: rgba(255, 255, 255, 0.9); */
    /* border-radius: 4px; */
    /* border: 1px solid #ddd; */
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    display: inline-block;
}

.map-detail-section {
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
