// AI聊天页面交互逻辑

class AIChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendMessage');
        this.chatMessages = document.getElementById('chatMessages');
        this.modelSelect = document.getElementById('modelSelect');
        this.roleplayBar = document.getElementById('roleplayBar');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.quickQuestionCards = document.querySelectorAll('.quick-question-card');
        this.characterChips = document.querySelectorAll('.character-chip');
        
        this.currentSession = {
            id: this.generateSessionId(),
            model: 'roleplay',
            messages: [],
            role: null
        };
        
        this.isTyping = false;
        this.ws = null;
        
        this.init();
    }
    
    init() {
        this.initWebSocket();
        this.bindEvents();
        this.loadHistory();
        this.autoResizeTextarea();
    }
    
    initWebSocket() {
        // 使用WebSocket连接后端
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}/ws-ai`);
        
        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleIncomingMessage(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.showErrorMessage('连接断开，请刷新页面重试');
        };
    }
    
    bindEvents() {
        // 发送消息
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 回车发送
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 模型切换
        this.modelSelect.addEventListener('change', (e) => {
            this.currentSession.model = e.target.value;
            if (e.target.value === 'roleplay') {
                this.roleplayBar.style.display = 'block';
                this.showRoleplayPrompt();
            } else {
                this.roleplayBar.style.display = 'none';
            }
        });
        
        // 新对话
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // 快捷提问
        this.quickQuestionCards.forEach(card => {
            card.addEventListener('click', () => {
                const question = card.dataset.question;
                this.messageInput.value = question;
                this.sendMessage();
            });
        });
        
        // 角色选择
        this.characterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.characterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentSession.role = chip.dataset.role;
                this.startRolePlay(chip.dataset.role);
            });
        });
        
        // 附件按钮
        document.getElementById('attachBtn')?.addEventListener('click', () => {
            this.showFileUpload();
        });
        
        // 表情按钮
        document.querySelector('.emoj-btn')?.addEventListener('click', () => {
            this.showEmojiPicker();
        });
    }
    
    sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || this.isTyping) return;
        
        // 添加用户消息到界面
        this.addMessage({
            type: 'user',
            content: content,
            time: new Date().toLocaleTimeString()
        });
        
        // 清空输入框
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // 显示正在输入
        this.showTypingIndicator();
        
        // 发送到后端
        const message = {
            sessionId: this.currentSession.id,
            content: content,
            model: this.currentSession.model,
            role: this.currentSession.role,
            timestamp: Date.now()
        };
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // 降级使用HTTP API
            this.sendViaHttp(message);
        }
    }
    
    sendViaHttp(message) {
        fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        })
        .then(response => response.json())
        .then(data => {
            this.removeTypingIndicator();
            this.addMessage({
                type: 'ai',
                content: data.response,
                time: new Date().toLocaleTimeString()
            });
        })
        .catch(error => {
            console.error('发送失败:', error);
            this.removeTypingIndicator();
            this.showErrorMessage('发送失败，请稍后重试');
        });
    }
    
    handleIncomingMessage(data) {
        this.removeTypingIndicator();
        
        if (data.type === 'stream') {
            // 流式响应，逐步显示
            this.handleStreamResponse(data);
        } else {
            // 完整响应
            this.addMessage({
                type: 'ai',
                content: data.response,
                time: new Date().toLocaleTimeString()
            });
        }
    }
    
    handleStreamResponse(data) {
        const lastMessage = this.chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('ai-message-stream')) {
            // 更新现有消息
            const bubble = lastMessage.querySelector('.message-bubble');
            bubble.textContent += data.content;
        } else {
            // 创建新消息
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message ai-message-stream';
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="images/ai-avatar-small.png" alt="AI">
                </div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">${data.content}</div>
                    <div class="message-time">正在输入...</div>
                </div>
            `;
            this.chatMessages.appendChild(messageDiv);
        }
        
        // 滚动到底部
        this.scrollToBottom();
    }
    
    addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.style.animation = 'slideIn 0.3s ease';
        
        if (message.type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user-bubble">${this.escapeHtml(message.content)}</div>
                    <div class="message-time">${message.time}</div>
                </div>
                <div class="message-avatar">
                    <img src="images/avatars/default-avatar.png" alt="用户">
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="images/ai-avatar-small.png" alt="AI">
                </div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">${this.formatAIResponse(message.content)}</div>
                    <div class="message-time">${message.time}</div>
                </div>
            `;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // 保存到会话
        this.currentSession.messages.push(message);
    }
    
    formatAIResponse(content) {
        // 处理Markdown、链接、表情等
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator-message';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="images/ai-avatar-small.png" alt="AI">
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    showRoleplayPrompt() {
        const prompt = "🎭 角色扮演模式已开启！选择你想要对话的动画角色，让我化身成TA，和你一起聊天吧~";
        this.addMessage({
            type: 'ai',
            content: prompt,
            time: new Date().toLocaleTimeString()
        });
    }
    
    startRolePlay(role) {
        const roleNames = {
            'totoro': '龙猫',
            'chihiro': '千寻',
            'howl': '哈尔',
            'mononoke': '幽灵公主',
            'nezuko': '祢豆子'
        };
        
        const prompt = `现在开始，我将化身为 ${roleNames[role]}！你可以开始和我对话啦~`;
        this.addMessage({
            type: 'ai',
            content: prompt,
            time: new Date().toLocaleTimeString()
        });
    }
    
    startNewChat() {
        if (this.currentSession.messages.length > 0) {
            // 保存当前会话到历史
            this.saveSession();
        }
        
        // 清空消息区域
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <img src="images/ai-avatar-small.png" alt="AI">
                </div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">
                        你好呀！我是动画小灵✨ 我可以帮你推荐动画、分析角色、构思剧情，还可以扮演你喜欢的动画角色哦！有什么想聊的吗？
                    </div>
                    <div class="message-time">刚刚</div>
                </div>
            </div>
            <div class="quick-questions">
                <div class="quick-question-card" data-question="推荐几部治愈系动画">
                    <i class="fas fa-heart"></i>
                    <span>治愈系推荐</span>
                </div>
                <div class="quick-question-card" data-question="帮我设计一个魔法少女角色">
                    <i class="fas fa-wand-magic"></i>
                    <span>角色设计</span>
                </div>
                <div class="quick-question-card" data-question="扮演宫崎骏风格">
                    <i class="fas fa-dragon"></i>
                    <span>角色扮演</span>
                </div>
            </div>
        `;
        
        // 重置会话
        this.currentSession = {
            id: this.generateSessionId(),
            model: this.modelSelect.value,
            messages: [],
            role: null
        };
        
        // 重新绑定快捷提问事件
        document.querySelectorAll('.quick-question-card').forEach(card => {
            card.addEventListener('click', () => {
                const question = card.dataset.question;
                this.messageInput.value = question;
                this.sendMessage();
            });
        });
    }
    
    showFileUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadFile(file);
            }
        };
        input.click();
    }
    
    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/api/ai/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            this.addMessage({
                type: 'user',
                content: `[图片] ${file.name}`,
                time: new Date().toLocaleTimeString()
            });
            
            // AI分析图片
            this.showTypingIndicator();
            // 发送图片分析请求...
        });
    }
    
    showEmojiPicker() {
        // 简单的表情选择器
        const emojis = ['😊', '😂', '🥹', '😍', '🤔', '😴', '🥺', '😎', '✨', '🎨', '🎬', '📺'];
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            background: white;
            border-radius: 20px;
            padding: 10px;
            box-shadow: var(--soft-shadow);
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 5px;
            z-index: 100;
        `;
        
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.cssText = `
                border: none;
                background: transparent;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 10px;
                transition: background 0.3s;
            `;
            btn.onmouseover = () => btn.style.background = '#f0f0f0';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => {
                this.messageInput.value += emoji;
                picker.remove();
            };
            picker.appendChild(btn);
        });
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌';
        closeBtn.style.cssText = `
            grid-column: span 6;
            border: none;
            background: transparent;
            padding: 5px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => picker.remove();
        picker.appendChild(closeBtn);
        
        // 定位并显示
        const inputWrapper = document.querySelector('.input-wrapper');
        inputWrapper.style.position = 'relative';
        inputWrapper.appendChild(picker);
        
        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && !e.target.closest('.emoj-btn')) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 0);
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    autoResizeTextarea() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    loadHistory() {
        // 从localStorage加载对话历史
        const history = localStorage.getItem('chatHistory');
        if (history) {
            // 更新侧边栏历史列表
            // ...
        }
    }
    
    saveSession() {
        // 保存会话到localStorage
        const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        sessions.unshift({
            id: this.currentSession.id,
            title: this.currentSession.messages[0]?.content.substring(0, 20) + '...',
            time: new Date().toLocaleString(),
            model: this.currentSession.model
        });
        localStorage.setItem('chatSessions', JSON.stringify(sessions.slice(0, 20)));
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});