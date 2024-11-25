export const formatPrice = (price) => {
    if (price === null || price === undefined) return '-'
    return price?.toLocaleString('ko-KR') + '만원'
}

export const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date)
}

export const formatDateTime = (dateTimeStr) => {
    const dateTime = new Date(dateTimeStr)
    return dateTime.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}
