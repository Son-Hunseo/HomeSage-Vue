// stores/sale-store.js
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'

export const useSaleStore = defineStore('saleStore', () => {
    const axios = inject('axios')
    const sales = ref([])
    const loading = ref(false)
    const error = ref(null)
    const selectedSale = ref(null)
    const isSearchMode = ref(false)

    const isValidSale = (sale) => {
        return (
            sale &&
            typeof sale.latitude === 'number' &&
            !isNaN(sale.latitude) &&
            typeof sale.longitude === 'number' &&
            !isNaN(sale.longitude)
        )
    }

    const processSalesData = (data) => {
        return data.filter(isValidSale).map((sale) => ({
            ...sale,
            latitude: Number(sale.latitude),
            longitude: Number(sale.longitude),
            price: Number(sale.price),
            monthlyFee: sale.monthlyFee ? Number(sale.monthlyFee) : null,
            managementFee: sale.managementFee ? Number(sale.managementFee) : null,
            space: Number(sale.space),
        }))
    }

    const fetchSalesByMapCenter = async (centerLat, centerLng, radius) => {
        if (!centerLat || !centerLng || !radius) {
            console.error('Invalid parameters:', { centerLat, centerLng, radius })
            return
        }

        try {
            loading.value = true
            error.value = null

            const response = await axios.get('/sales/map-search', {
                params: {
                    lat: centerLat,
                    lng: centerLng,
                    radius: Math.round(radius),
                },
            })

            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Invalid response data:', response.data)
                sales.value = []
                return
            }

            sales.value = processSalesData(response.data)
            console.log(`Found ${sales.value.length} properties by map search`)
        } catch (err) {
            console.error('Map search failed:', err)
            error.value = '매물을 불러오는데 실패했습니다.'
            sales.value = []
        } finally {
            loading.value = false
        }
    }

    const searchSales = async (searchCondition) => {
        try {
            loading.value = true
            error.value = null

            isSearchMode.value = true
            console.log('Search mode started')

            console.log('Searching with conditions:', searchCondition)
            const response = await axios.get('/sales/list', {
                params: searchCondition,
            })

            if (!response.data || !Array.isArray(response.data)) {
                console.warn('Invalid response data:', response.data)
                sales.value = []
                return
            }

            sales.value = processSalesData(response.data)
            console.log(`Found ${sales.value.length} properties by search`)
        } catch (err) {
            console.error('Search failed:', err)
            error.value = '매물을 검색하는데 실패했습니다.'
            sales.value = []
        } finally {
            loading.value = false
        }
    }

    const hasSales = computed(() => sales.value.length > 0)
    const hasSelected = computed(() => selectedSale.value !== null)

    return {
        sales,
        loading,
        error,
        selectedSale,
        isSearchMode,
        hasSales,
        hasSelected,
        fetchSalesByMapCenter,
        searchSales,
        setSelectedSale: (sale) => {
            selectedSale.value = sale ? { ...sale } : null
        },
        clearSelectedSale: () => {
            selectedSale.value = null
        },
    }
})
