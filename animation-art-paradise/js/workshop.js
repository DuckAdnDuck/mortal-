// 创意工坊交互逻辑

class Workshop {
    constructor() {
        this.currentTab = 'draw';
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'brush';
        this.currentColor = '#FFB6C1';
        this.brushSize = 5;
        this.undoStack = [];
        this.redoStack = [];
        
        this.init();
    }
    
    init() {
        this.bindTabNavigation();
        this.initDrawingTools();
        this.initEmojiTools();
        this.initVoiceTools();
        this.initAICreation();
        this.loadSavedWorks();
    }
    
    bindTabNavigation() {
        const navBtns = document.querySelectorAll('.workshop-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // 更新导航按钮状态
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 显示对应标签页
                document.querySelectorAll('.workshop-tab').forEach(t => t.classList.remove('active'));
                document.getElementById(`${tab}Tab`).classList.add('active');
                
                this.currentTab = tab;
                
                // 如果切换到画板，重新初始化canvas尺寸
                if (tab === 'draw' && this.canvas) {
                    setTimeout(() => this.resizeCanvas(), 100);
                }
            });
        });
    }
    
    // ========== 绘画工具 ==========
    initDrawingTools() {
        this.canvas = document.getElementById('drawCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.bindDrawingEvents();
        this.bindDrawingTools();
        this.bindAISuggestions();
    }
    
    setupCanvas() {
        // 设置canvas实际尺寸
        this.resizeCanvas();
        
        // 设置绘画样式
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 保存初始状态
        this.saveState();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // 保持宽高比
        this.canvas.width = containerWidth;
        this.canvas.height = containerWidth * 0.625; // 800/500的比例
    }
    
    bindDrawingEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        this.lastY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        if (this.currentTool === 'brush') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        switch(this.currentTool) {
            case 'brush':
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
                
            case 'eraser':
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
        }
        
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    bindDrawingTools() {
        // 工具切换
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
        
        // 颜色选择
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
        });
        
        // 笔刷大小
        const brushSizeInput = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        brushSizeInput.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            brushSizeValue.textContent = this.brushSize + 'px';
        });
        
        // 撤销
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        
        // 重做
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // 清空
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('确定要清空画布吗？')) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.saveState();
            }
        });
        
        // 保存
        document.getElementById('saveDrawing').addEventListener('click', () => this.saveDrawing());
        
        // 分享
        document.getElementById('shareDrawing').addEventListener('click', () => this.shareDrawing());
    }
    
    saveState() {
        const imageData = this.canvas.toDataURL();
        this.undoStack.push(imageData);
        this.redoStack = [];
    }
    
    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.loadImage(this.undoStack[this.undoStack.length - 1]);
        }
    }
    
    redo() {
        if (this.redoStack.length > 0) {
            const imageData = this.redoStack.pop();
            this.undoStack.push(imageData);
            this.loadImage(imageData);
        }
    }
    
    loadImage(imageData) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
    }
    
    saveDrawing() {
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    shareDrawing() {
        // 分享到社区
        this.canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('image', blob);
            formData.append('type', 'drawing');
            
            fetch('/api/community/share', {
                method: 'POST',
                body: formData
            }).then(() => {
                alert('分享成功！');
            });
        });
    }
    
    bindAISuggestions() {
        // AI配色建议
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const colors = item.dataset.colors.split(',');
                // 应用渐变色建议
                this.showColorPreview(colors);
            });
        });
        
        // AI生成线稿
        document.getElementById('generateWithAI').addEventListener('click', () => {
            const prompt = document.getElementById('aiPrompt').value;
            if (!prompt) {
                alert('请输入描述');
                return;
            }
            
            // 调用AI生成线稿
            fetch('/api/ai/generate-sketch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })
            .then(res => res.json())
            .then(data => {
                this.loadImage(data.imageUrl);
            });
        });
    }
    
    // ========== 表情包工具 ==========
    initEmojiTools() {
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.addEventListener('click', () => {
                const template = item.dataset.template;
                this.loadEmojiTemplate(template);
            });
        });
        
        document.getElementById('generateEmoji').addEventListener('click', () => {
            this.generateEmoji();
        });
        
        document.getElementById('saveEmoji').addEventListener('click', () => {
            this.saveEmoji();
        });
        
        // 监听控件变化实时预览
        ['eyeStyle', 'mouthStyle', 'blush', 'emojiText'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                this.updateEmojiPreview();
            });
        });
    }
    
    loadEmojiTemplate(template) {
        const preview = document.getElementById('emojiPreview').querySelector('img');
        preview.src = `images/emoji/template-${template}.png`;
    }
    
    updateEmojiPreview() {
        // 实时更新表情预览
        const eyeStyle = document.getElementById('eyeStyle').value;
        const mouthStyle = document.getElementById('mouthStyle').value;
        const blush = document.getElementById('blush').checked;
        const text = document.getElementById('emojiText').value;
        
        // 这里可以调用API生成预览
    }
    
    generateEmoji() {
        const eyeStyle = document.getElementById('eyeStyle').value;
        const mouthStyle = document.getElementById('mouthStyle').value;
        const blush = document.getElementById('blush').checked;
        const text = document.getElementById('emojiText').value;
        
        fetch('/api/ai/generate-emoji', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eyeStyle, mouthStyle, blush, text })
        })
        .then(res => res.json())
        .then(data => {
            this.addEmojiToGallery(data);
        });
    }
    
    saveEmoji() {
        // 保存表情
        alert('表情已保存！');
    }
    
    addEmojiToGallery(emoji) {
        const gallery = document.getElementById('emojiGallery');
        const item = document.createElement('div');
        item.className = 'emoji-item';
        item.innerHTML = `
            <img src="${emoji.url}" alt="表情">
            <span>${emoji.name}</span>
        `;
        gallery.appendChild(item);
    }
    
    // ========== 配音工具 ==========
    initVoiceTools() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        document.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.loadScene(card);
            });
        });
        
        document.getElementById('startRecording').addEventListener('click', () => {
            this.startRecording();
        });
        
        document.getElementById('stopRecording').addEventListener('click', () => {
            this.stopRecording();
        });
        
        document.getElementById('playRecording').addEventListener('click', () => {
            this.playRecording();
        });
    }
    
    loadScene(card) {
        const video = document.getElementById('sceneVideo');
        // 加载对应视频
        video.src = `videos/scene${card.dataset.scene}.mp4`;
        
        // 获取AI配音指导
        this.getAIGuidance(card.dataset.scene);
    }
    
    getAIGuidance(sceneId) {
        fetch(`/api/ai/voice-guidance/${sceneId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('aiGuidance').innerHTML = data.guidance;
            });
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.saveRecording(audioBlob);
            };
            
            this.mediaRecorder.start();
            
            document.getElementById('startRecording').disabled = true;
            document.getElementById('stopRecording').disabled = false;
        } catch (error) {
            console.error('无法访问麦克风:', error);
            alert('请确保已允许麦克风访问');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            document.getElementById('startRecording').disabled = false;
            document.getElementById('stopRecording').disabled = true;
            document.getElementById('playRecording').disabled = false;
        }
    }
    
    playRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
    
    saveRecording(audioBlob) {
        // 应用声音滤镜
        const filter = document.getElementById('voiceFilter').value;
        
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('filter', filter);
        
        fetch('/api/voice/save', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            this.addVoiceToWorks(data);
        });
    }
    
    addVoiceToWorks(work) {
        const grid = document.getElementById('voiceWorks');
        const item = document.createElement('div');
        item.className = 'voice-work-item';
        item.innerHTML = `
            <h4>${work.name}</h4>
            <audio controls src="${work.url}"></audio>
            <p>${work.date}</p>
        `;
        grid.appendChild(item);
    }
    
    // ========== AI创作 ==========
    initAICreation() {
        // 切换创作类型
        document.querySelectorAll('.creation-type').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.creation-type').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.creation-workspace').forEach(w => w.classList.remove('active'));
                document.getElementById(`${btn.dataset.type}Workspace`).classList.add('active');
            });
        });
        
        // 故事生成
        document.getElementById('generateStory')?.addEventListener('click', () => {
            this.generateStory();
        });
        
        // 角色设计
        document.getElementById('generateCharacter')?.addEventListener('click', () => {
            this.generateCharacter();
        });
        
        // 世界观构建
        document.getElementById('generateWorld')?.addEventListener('click', () => {
            this.generateWorld();
        });
        
        // 台词生成
        document.getElementById('generateDialogue')?.addEventListener('click', () => {
            this.generateDialogue();
        });
    }
    
    generateStory() {
        const input = document.getElementById('storyInput').value;
        const style = document.getElementById('storyStyle').value;
        const length = document.getElementById('storyLength').value;
        
        if (!input) {
            alert('请输入创意灵感');
            return;
        }
        
        fetch('/api/ai/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, style, length })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('storyOutput').querySelector('.output-content').innerHTML = 
                data.story.replace(/\n/g, '<br>');
            this.addToHistory('story', data);
        });
    }
    
    generateCharacter() {
        const input = document.getElementById('characterInput').value;
        const type = document.getElementById('characterType').value;
        const age = document.getElementById('characterAge').value;
        
        fetch('/api/ai/generate-character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, type, age })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('characterImage').src = data.imageUrl;
            document.getElementById('characterDetails').innerHTML = `
                <p><strong>姓名：</strong>${data.name}</p>
                <p><strong>年龄：</strong>${data.age}</p>
                <p><strong>性格：</strong>${data.personality}</p>
                <p><strong>背景：</strong>${data.background}</p>
                <p><strong>能力：</strong>${data.abilities}</p>
            `;
            this.addToHistory('character', data);
        });
    }
    
    generateWorld() {
        const input = document.getElementById('worldInput').value;
        const era = document.getElementById('worldEra').value;
        
        fetch('/api/ai/generate-world', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, era })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('worldMap').src = data.mapUrl;
            document.getElementById('worldDetails').innerHTML = `
                <h4>${data.name}</h4>
                <p><strong>时代：</strong>${data.era}</p>
                <p><strong>地理：</strong>${data.geography}</p>
                <p><strong>文明：</strong>${data.civilization}</p>
                <p><strong>特色：</strong>${data.features}</p>
            `;
            this.addToHistory('world', data);
        });
    }
    
    generateDialogue() {
        const input = document.getElementById('dialogueInput').value;
        const tone = document.getElementById('dialogueTone').value;
        
        fetch('/api/ai/generate-dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, tone })
        })
        .then(res => res.json())
        .then(data => {
            const dialogueBox = document.getElementById('dialogueOutput').querySelector('.dialogue-box');
            dialogueBox.innerHTML = data.dialogue.map(d => 
                `<p><strong>${d.character}:</strong> ${d.line}</p>`
            ).join('');
            this.addToHistory('dialogue', data);
        });
    }
    
    addToHistory(type, data) {
        const historyGrid = document.getElementById('creationHistory');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <i class="fas ${this.getIconForType(type)}"></i>
            <h4>${data.title || '未命名'}</h4>
            <p>${new Date().toLocaleDateString()}</p>
        `;
        item.onclick = () => this.loadFromHistory(type, data);
        historyGrid.prepend(item);
    }
    
    getIconForType(type) {
        const icons = {
            story: 'fa-book',
            character: 'fa-user',
            world: 'fa-globe',
            dialogue: 'fa-comments'
        };
        return icons[type] || 'fa-file';
    }
    
    loadFromHistory(type, data) {
        // 加载历史创作
        console.log('加载历史:', type, data);
    }
    
    loadSavedWorks() {
        // 从localStorage加载已保存的作品
        const savedDrawings = JSON.parse(localStorage.getItem('drawings') || '[]');
        const savedEmojis = JSON.parse(localStorage.getItem('emojis') || '[]');
        const savedVoices = JSON.parse(localStorage.getItem('voices') || '[]');
        const savedCreations = JSON.parse(localStorage.getItem('creations') || '[]');
        
        // 加载到对应的图库
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new Workshop();
});