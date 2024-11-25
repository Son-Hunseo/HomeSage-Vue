import { ref, computed } from 'vue'

export function usePagination(items, itemsPerPage = 10) {
    const currentPage = ref(1)

    // 페이지네이션된 아이템 목록
    const paginatedItems = computed(() => {
        const startIndex = (currentPage.value - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return items.value.slice(startIndex, endIndex)
    })

    // 총 페이지 수
    const totalPages = computed(() => {
        return Math.ceil(items.value.length / itemsPerPage)
    })

    // 페이지 변경 함수들
    const changePage = (page) => {
        currentPage.value = page
    }

    const goToFirstPage = () => {
        currentPage.value = 1
    }

    const goToLastPage = () => {
        currentPage.value = totalPages.value
    }

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
        }
    }

    return {
        currentPage,
        paginatedItems,
        totalPages,
        changePage,
        goToFirstPage,
        goToLastPage,
        prevPage,
        nextPage,
    }
}
