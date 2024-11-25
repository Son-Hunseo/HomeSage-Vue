import { ref } from 'vue'

export function useProductModal() {
    const showProductDetail = ref(false)
    const selectedSale = ref(null)

    const openProductDetail = (sale) => {
        selectedSale.value = sale
        showProductDetail.value = true
    }

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            showProductDetail.value = false
        }
    }

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            showProductDetail.value = false
        }
    }

    // 이벤트 리스너 설정/해제는 컴포넌트에서 처리
    return {
        showProductDetail,
        selectedSale,
        openProductDetail,
        handleEscape,
        handleOverlayClick,
    }
}
