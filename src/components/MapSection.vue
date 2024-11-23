<script setup>
import { ref, watch } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'
import { useSaleStore } from '@/stores/sale-store'
import { storeToRefs } from 'pinia'

const saleStore = useSaleStore()
const { sales, selectedSale, loading, isSearchMode } = storeToRefs(saleStore)

const map = ref(null)
const center = ref({
    lat: 37.5665,
    lng: 126.978,
})
const zoomLevel = ref(5)

const calculateRadius = (level) => {
    const baseRadius = 100
    const multiplier = Math.pow(2, level - 1)
    return baseRadius * multiplier
}

// 지도 이동에 의한 데이터 갱신
watch(
    [center, zoomLevel],
    async ([newCenter, newLevel]) => {
        if (isSearchMode.value || !newCenter || !newLevel) return
        console.log('Map moved, fetching new data...')
        await saleStore.fetchSalesByMapCenter(
            newCenter.lat,
            newCenter.lng,
            calculateRadius(newLevel),
        )
    },
    { deep: true },
)

// sales 변경 감지 및 지도 이동
watch(
    sales,
    (newSales) => {
        if (!isSearchMode.value || !newSales.length || !map.value) return

        console.log('Moving map to search results...')

        // 첫 번째 매물 위치로 이동
        const firstSale = newSales[0]
        const moveLatLng = new kakao.maps.LatLng(firstSale.latitude, firstSale.longitude)
        map.value.setCenter(moveLatLng)

        // 모든 매물이 보이도록 범위 조정
        const bounds = new kakao.maps.LatLngBounds()
        newSales.forEach((sale) => {
            bounds.extend(new kakao.maps.LatLng(sale.latitude, sale.longitude))
        })
        map.value.setBounds(bounds)

        console.log('Map moved to:', {
            lat: firstSale.latitude,
            lng: firstSale.longitude,
        })

        setTimeout(() => {
            isSearchMode.value = false
            console.log('Search mode disabled')
        }, 500)
    },
    { immediate: true },
)

const updateMapInfo = () => {
    if (isSearchMode.value || !map.value) return

    const mapCenter = map.value.getCenter()
    center.value = {
        lat: mapCenter.getLat(),
        lng: mapCenter.getLng(),
    }
    zoomLevel.value = map.value.getLevel()
}

const onLoadKakaoMap = (mapInstance) => {
    map.value = mapInstance
    const mapTypeControl = new kakao.maps.MapTypeControl()
    map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)
    updateMapInfo()
    kakao.maps.event.addListener(map.value, 'idle', updateMapInfo)
}

const handleMarkerClick = (sale) => {
    // 이미 선택된 매물을 다시 클릭하면 선택 해제
    if (selectedSale.value?.saleId === sale.saleId) {
        saleStore.clearSelectedSale()
    } else {
        saleStore.setSelectedSale(sale)
    }
}

const formatPrice = (price) => {
    return price?.toLocaleString('ko-KR') + '만원'
}

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
/* 스타일은 동일하게 유지 */
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
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 12px;
    font-weight: bold;
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
</style>
