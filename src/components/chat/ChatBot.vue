<template>
    <Header />
    <div class="app-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>나의 챗봇 목록</h2>
                <button
                    @click="toggleDeleteMode"
                    class="delete-mode-button"
                    :class="{ active: isDeleteMode }"
                >
                    삭제
                </button>
            </div>

            <div class="chat-rooms-list">
                <div
                    v-for="room in chatRooms"
                    :key="room.chatRoomId"
                    class="chat-room-item"
                    @click="isDeleteMode ? null : enterChatRoom(room)"
                >
                    <div class="room-content">
                        <span class="room-icon">💬</span>
                        <span class="room-name">{{ room.chatRoomName }}</span>
                    </div>
                    <input
                        v-if="isDeleteMode"
                        type="checkbox"
                        v-model="selectedRooms"
                        :value="room.chatRoomId"
                        class="delete-checkbox"
                        @click.stop
                    />
                </div>

                <div
                    v-if="!isDeleteMode"
                    class="chat-room-item new-chat"
                    @click="startNewRoomCreation"
                >
                    <div v-if="!isCreatingNewRoom" class="room-content">
                        <span class="plus-icon">+</span>
                        <span>새 채팅방</span>
                    </div>
                    <input
                        v-if="isCreatingNewRoom"
                        :value="newChatRoomName"
                        @input="handleInput"
                        @compositionstart="handleCompositionStart"
                        @compositionend="handleCompositionEnd"
                        @keydown.enter.prevent="handleEnter"
                        @blur="isCreatingNewRoom = false"
                        class="new-chat-input"
                        placeholder="채팅방 이름을 입력하세요"
                        type="text"
                    />
                </div>
            </div>

            <!-- Fixed Delete Actions -->
            <div v-if="isDeleteMode" class="delete-actions">
                <button
                    @click="deleteSelectedRooms"
                    :disabled="selectedRooms.length === 0"
                    class="delete-button"
                >
                    선택한 채팅방 삭제
                </button>
                <button @click="toggleDeleteMode" class="cancel-button">취소</button>
            </div>
        </div>

        <!-- Main Chat Area -->
        <div class="main-content">
            <div class="chat-area" v-if="activeChatRoom">
                <div class="chat-header">
                    <h2>{{ activeChatRoom.chatRoomName }}</h2>
                </div>

                <!-- Messages Container -->
                <div class="messages-wrapper">
                    <div ref="chatBodyRef" class="messages-container">
                        <div
                            v-for="(message, index) in messages"
                            :key="index"
                            :class="['message', message.type.toLowerCase()]"
                        >
                            <div v-html="message.message"></div>
                        </div>

                        <div v-if="isLoading" class="loading-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>

                        <div v-if="typingMessage" class="message ai typing">
                            <div v-html="renderMarkdown(typingMessage.message)"></div>
                        </div>
  
                    </div>
                </div>

                <!-- 더미 공간 추가 -->
                <div class="chat-input-dummy"></div>  

                <!-- Chat Input -->
                <div class="chat-input">
                    <input
                        :value="userInput"
                        type="text"
                        placeholder="질문을 입력하세요..."
                        @input="handleChatInput"
                        @compositionstart="handleChatCompositionStart"
                        @compositionend="handleChatCompositionEnd"
                        @keydown.enter="handleChatEnter"
                        :disabled="sendingMessage"
                    />
                    <button @click="sendMessage" :disabled="sendingMessage">보내기</button>
                </div>
            </div>
            <div v-else class="empty-state">
                <h3>채팅방을 선택하거나 새로운 채팅을 시작하세요</h3>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, nextTick } from 'vue'

import Header from '@/components/Header.vue'
import MarkdownIt from 'markdown-it'

// Markdown-it 초기화
const md = new MarkdownIt()
const axios = inject('axios')

// State variables
const chatRooms = ref([])
const activeChatRoom = ref(null)
const messages = ref([])
const userInput = ref('')
const sendingMessage = ref(false) // 메시지 전송 중 여부를 나타냄
const typingMessage = ref(null)
const isLoading = ref(false)
const chatBodyRef = ref(null)
const isDeleteMode = ref(false)
const selectedRooms = ref([])
const newChatRoomName = ref('')
const isCreatingNewRoom = ref(false)
const isComposing = ref(false)

const handleChatInput = (event) => {
    if (!isComposing.value) {
        userInput.value = event.target.value
    }
}

const handleChatCompositionStart = () => {
    isComposing.value = true
}

const handleChatCompositionEnd = (event) => {
    isComposing.value = false
    userInput.value = event.target.value
}

const handleChatEnter = (event) => {
    if (!isComposing.value) {
        sendMessage()
    }
}

const handleInput = (event) => {
    if (!isComposing.value) {
        newChatRoomName.value = event.target.value
    }
}

const handleCompositionStart = () => {
    isComposing.value = true
}

const handleCompositionEnd = (event) => {
    isComposing.value = false
    newChatRoomName.value = event.target.value
}

const handleEnter = (event) => {
    if (!isComposing.value) {
        createNewChatRoom()
    }
}

// 삭제 모드 토글
const toggleDeleteMode = () => {
    isDeleteMode.value = !isDeleteMode.value
    selectedRooms.value = [] // 삭제 모드 해제 시 선택 초기화
}

// 새 채팅방 생성
const createNewChatRoom = async () => {
    if (!newChatRoomName.value.trim()) return

    try {
        // 이미 생성 중인지 체크하는 플래그 추가
        if (sendingMessage.value) return
        sendingMessage.value = true

        const response = await axios.post(
            '/chat',
            {
                chatRoomName: newChatRoomName.value,
            },
            { withCredentials: true },
        )

        const newRoom = {
            chatRoomId: response.data.chatRoomId,
            chatRoomName: newChatRoomName.value,
        }
        chatRooms.value.push(newRoom)

        // Reset creation state
        isCreatingNewRoom.value = false
        newChatRoomName.value = ''
    } catch (error) {
        console.error('Error creating new chat room:', error)
    } finally {
        sendingMessage.value = false
    }
}

const startNewRoomCreation = () => {
    isCreatingNewRoom.value = true
    nextTick(() => {
        // Focus the input when it appears
        document.querySelector('.new-chat-input')?.focus()
    })
}

// 선택된 채팅방 삭제
const deleteSelectedRooms = async () => {
    try {
        // 선택된 모든 채팅방에 대해 삭제 요청 보내기
        await Promise.all(
            selectedRooms.value.map((roomId) =>
                axios.delete(`/chat/${roomId}`, { withCredentials: true }),
            ),
        )

        // 삭제된 채팅방을 목록에서 제거
        chatRooms.value = chatRooms.value.filter(
            (room) => !selectedRooms.value.includes(room.chatRoomId),
        )

        // 삭제 모드 해제
        toggleDeleteMode()
    } catch (error) {
        console.error('Error deleting chat rooms:', error)
    }
}

const scrollToBottom = async () => {
    await nextTick()
    // 스크롤이 즉시 실행되지 않을 수 있으므로 약간의 지연을 줍니다
    setTimeout(() => {
        if (chatBodyRef.value) {
            chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
        }
    }, 100)
}

// 다음과 같이 messages의 텍스트를 마크다운으로 렌더링합니다.
const renderMarkdown = (text) => {
    return md.render(text)
}

const updateUserInput = (event) => {
    if (!isComposing.value) {
        userInput.value = event.target.value
    }
}

// Typing effect function
// 타이핑 효과 완료 후 sendingMessage를 false로 설정하는 로직 추가
const startTypingEffect = (message) => {
    typingMessage.value = {
        type: 'AI',
        message: '',
        fullMessage: message,
    }

    let currentIndex = 0
    const typeNextCharacter = () => {
        if (currentIndex < typingMessage.value.fullMessage.length) {
            typingMessage.value.message += typingMessage.value.fullMessage[currentIndex]
            currentIndex++
            setTimeout(typeNextCharacter, 30)
            scrollToBottom() // 타이핑 중에도 스크롤 추가
        } else {
            // 타이핑 완료 시 메시지 추가 및 상태 초기화
            messages.value.push({
                type: 'AI',
                message: renderMarkdown(typingMessage.value.fullMessage),
            })
            typingMessage.value = null
            sendingMessage.value = false // 여기서 sendingMessage를 false로 설정
            scrollToBottom() // 타이핑 완료 후 스크롤 추가
        }
    }

    typeNextCharacter()
}

// Fetch chat room list
const fetchChatRooms = async () => {
    try {
        const response = await axios.get('/chat', { withCredentials: true })
        chatRooms.value = response.data.chatRoomList
    } catch (error) {
        console.error('Error fetching chat rooms:', error)
    }
}

// Enter a chat room
const enterChatRoom = async (chatRoom) => {
    activeChatRoom.value = chatRoom // 먼저 채팅방 설정

    try {
        const response = await axios.get(`/chat/${chatRoom.chatRoomId}`, { withCredentials: true })

        const humanMessages = response.data.humanMessageList.map((msg) => ({
            type: 'HUMAN',
            message: renderMarkdown(msg.message),
        }))

        const aiMessages = response.data.aiMessageList.map((msg) => ({
            type: 'AI',
            message: renderMarkdown(msg.message),
        }))

        const combinedMessages = []
        const maxLength = Math.max(aiMessages.length, humanMessages.length)
        for (let i = 0; i < maxLength; i++) {
            if (aiMessages[i]) {
                combinedMessages.push(aiMessages[i])
            }
            if (humanMessages[i]) {
                combinedMessages.push(humanMessages[i])
            }
        }

        messages.value = combinedMessages

        await nextTick()
        scrollToBottom()
    } catch (error) {
        console.error('Error entering chat room:', error)
        // 에러 발생 시 채팅방 상태 초기화
        activeChatRoom.value = null
    }
}

// Leave chat room to go back to the list
const leaveChatRoom = () => {
    activeChatRoom.value = null
    messages.value = [] // Clear messages when leaving room
}

const sendMessage = async () => {
    if (userInput.value.trim() === '' || sendingMessage.value) return

    sendingMessage.value = true
    isLoading.value = true

    const userMessage = {
        type: 'HUMAN',
        message: userInput.value,
    }

    messages.value.push(userMessage)
    scrollToBottom() // 사용자 메시지 추가 후 스크롤

    try {
        const response = await axios.post(`/chat/${activeChatRoom.value.chatRoomId}`, userMessage, {
            withCredentials: true,
        })

        isLoading.value = false
        startTypingEffect(response.data.message)
    } catch (error) {
        console.error('Error sending message:', error)
        isLoading.value = false
    } finally {
        sendingMessage.value = false
    }

    userInput.value = ''
}

// Fetch chat rooms on component mounted
onMounted(fetchChatRooms)
</script>

<style scoped>
.app-container {
    display: flex;
    height: calc(100vh - 100px); /* 73px is header height (64px) + border (1px) + padding (8px) */
    background-color: #f9f9f9;
    margin-top: 1px; /* Add small margin to account for header border */
}

.sidebar {
    width: 280px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e0e0e0;
}

.sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-rooms-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.chat-room-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chat-room-item:hover {
    background-color: #f0f0f0;
}

.room-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.room-icon {
    font-size: 1.2em;
}

.new-chat {
    border: 1px dashed #ccc;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-width: 800px; /* 추가: 최대 너비 제한 */
    margin: 0 auto; /* 추가: 중앙 정렬 */
    border-right: 1px solid #e0e0e0; /* 추가: 오른쪽 경계선 */
}

.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    position: relative;
}

.chat-header {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
}

.messages-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.messages-container {
    height: calc(100% - 76px); /* chat-input-dummy의 높이만큼 빼줌 */
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message {
    max-width: 70%; /* 수정: 메시지 너비 비율 조정 */
    padding: 12px 16px;
    border-radius: 8px;
    line-height: 1.7;
}

.message.ai {
    background-color: white;
    align-self: flex-start;
    border: 1px solid #e0e0e0;
    padding: 12px 16px 12px 40px;
    position: relative;
}

.message.human {
    background-color: #8b4513;
    color: white;
    align-self: flex-end;
}

.chat-input {
    padding: 20px;
    background: white;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 76px;
    z-index: 10;
}

.chat-input input {
    flex: 1;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1em;
}

.chat-input button {
    padding: 12px 24px;
    background-color: #8b4513;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.chat-input button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-dots {
    display: flex;
    gap: 8px;
    padding: 12px;
    align-self: flex-start;
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

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
}

.delete-mode-button {
    padding: 6px 12px;
    border: 1px solid #8b4513;
    color: #8b4513;
    background: none;
    border-radius: 4px;
    cursor: pointer;
}

.delete-mode-button.active {
    background: #8b4513;
    color: white;
}

.delete-actions {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 8px;
}

.delete-button {
    padding: 8px 16px;
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
    padding: 8px 16px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.new-chat-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.new-chat-input:focus {
    outline: none;
    border-color: #8b4513;
}

.chat-input-dummy {
    flex-shrink: 0;
    height: 76px;
    min-height: 76px;
    visibility: hidden;
}
</style>