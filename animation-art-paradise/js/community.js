// 社区交互逻辑

class Community {
    constructor() {
        this.currentFilter = 'latest';
        this.page = 1;
        this.posts = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadPosts();
        this.loadHotTopics();
        this.loadActiveUsers();
        this.loadAIRecommendations();
    }
    
    bindEvents() {
        // 筛选按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.page = 1;
                this.loadPosts();
            });
        });
        
        // 发布帖子
        document.getElementById('createPostBtn').addEventListener('click', () => {
            this.openPostModal();
        });
        
        // AI生成话题
        document.getElementById('aiTopicBtn').addEventListener('click', () => {
            this.generateAITopic();
        });
        
        document.getElementById('generateTopic').addEventListener('click', () => {
            this.generateAITopic();
        });
        
        // 加载更多
        document.getElementById('loadMorePosts').addEventListener('click', () => {
            this.page++;
            this.loadPosts(true);
        });
        
        // 图片上传
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('imageUpload');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-pink)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'rgba(255, 182, 193, 0.3)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(255, 182, 193, 0.3)';
            this.handleImageUpload(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files);
        });
        
        // 提交帖子
        document.getElementById('submitPost').addEventListener('click', () => {
            this.submitPost();
        });
        
        // 关闭模态框
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });
    }
    
    loadPosts(append = false) {
        // 模拟加载帖子
        const mockPosts = this.generateMockPosts();
        
        if (!append) {
            this.posts = mockPosts;
        } else {
            this.posts = [...this.posts, ...mockPosts];
        }
        
        this.renderPosts();
    }
    
    generateMockPosts() {
        const posts = [];
        const users = ['画师小梦', '动画迷小明', '声优控', '原画师', '剧本娘'];
        const avatars = ['user1.jpg', 'user2.jpg', 'user3.jpg', 'user4.jpg', 'user5.jpg'];
        const titles = [
            '大家最喜欢哪部新番？',
            '分享我的原创角色设计',
            '宫崎骏电影中最感人的台词',
            '今天去了吉卜力美术馆！',
            '求推荐治愈系动画'
        ];
        const contents = [
            '最近看了几部新番，感觉质量都不错，大家有什么推荐吗？',
            '花了一个月设计的原创角色，希望大家喜欢！',
            '每次看千与千寻都会哭，无脸男的陪伴真的太温暖了',
            '梦想成真的一天，真的太震撼了，拍了超多照片！',
            '工作学习太累了，求推荐一些治愈的动画～'
        ];
        
        for (let i = 0; i < 5; i++) {
            const userIndex = Math.floor(Math.random() * users.length);
            posts.push({
                id: Date.now() + i,
                author: users[userIndex],
                avatar: `images/avatars/${avatars[userIndex]}`,
                title: titles[Math.floor(Math.random() * titles.length)],
                content: contents[Math.floor(Math.random() * contents.length)],
                time: `${Math.floor(Math.random() * 24)}小时前`,
                likes: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 100),
                hasAIReview: Math.random() > 0.5,
                tags: ['动画讨论', '原创', '推荐'].slice(0, Math.floor(Math.random() * 3) + 1)
            });
        }
        
        return posts;
    }
    
    renderPosts() {
        const container = document.getElementById('postsList');
        
        container.innerHTML = this.posts.map(post => `
            <div class="post-card" onclick="community.showPostDetail('${post.id}')">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="post-author-avatar">
                    <div class="post-author-info">
                        <h4>${post.author}</h4>
                        <span class="post-time">${post.time}</span>
                    </div>
                </div>
                
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content}</p>
                
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    ${post.hasAIReview ? '<span class="post-tag ai">AI点评</span>' : ''}
                </div>
                
                <div class="post-stats">
                    <span><i class="far fa-heart"></i> ${post.likes}</span>
                    <span><i class="far fa-comment"></i> ${post.comments}</span>
                </div>
                
                ${post.hasAIReview ? `
                    <div class="ai-review-badge">
                        <i class="fas fa-robot"></i>
                        AI点评：很有创意的想法，色彩搭配很棒！
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    loadHotTopics() {
        const topics = [
            { name: '#宫崎骏诞辰', count: 1234 },
            { name: '#新海诚新作', count: 987 },
            { name: '#原创角色设计大赛', count: 756 },
            { name: '#最催泪动画', count: 543 },
            { name: '#国漫崛起', count: 432 }
        ];
        
        const container = document.querySelector('.hot-topics');
        container.innerHTML = topics.map(topic => `
            <div class="hot-topic-item" onclick="community.searchTopic('${topic.name}')">
                <span class="topic-name">${topic.name}</span>
                <span class="topic-count">${topic.count}讨论</span>
            </div>
        `).join('');
    }
    
    loadActiveUsers() {
        const users = [
            { name: '画师小梦', avatar: 'user1.jpg', status: 'online' },
            { name: '动画迷小明', avatar: 'user2.jpg', status: 'online' },
            { name: '声优控', avatar: 'user3.jpg', status: 'offline' },
            { name: '原画师', avatar: 'user4.jpg', status: 'online' },
            { name: '剧本娘', avatar: 'user5.jpg', status: 'offline' }
        ];
        
        const container = document.querySelector('.active-users');
        container.innerHTML = users.map(user => `
            <div class="active-user-item">
                <img src="images/avatars/${user.avatar}" alt="${user.name}" class="active-user-avatar">
                <div class="active-user-info">
                    <div class="active-user-name">${user.name}</div>
                    <div class="active-user-status ${user.status}">${user.status === 'online' ? '在线' : '离线'}</div>
                </div>
            </div>
        `).join('');
    }
    
    loadAIRecommendations() {
        const recommendations = [
            '如何设计一个讨喜的动画角色？',
            '2024年最值得期待的动画电影',
            'AI辅助创作：从零开始构建世界观',
            '那些年我们追过的经典动画',
            '动画配音技巧大公开'
        ];
        
        const container = document.querySelector('.ai-recommendations');
        container.innerHTML = recommendations.map(rec => `
            <div class="ai-recommendation-item" onclick="community.searchTopic('${rec}')">
                <i class="fas fa-robot"></i> ${rec}
            </div>
        `).join('');
    }
    
    generateAITopic() {
        // 调用AI生成话题
        fetch('/api/ai/generate-topic')
            .then(res => res.json())
            .then(data => {
                alert(`AI生成话题：${data.topic}\n\n${data.description}`);
            });
    }
    
    openPostModal() {
        document.getElementById('postModal').style.display = 'flex';
    }
    
    handleImageUpload(files) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '10px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
    
    submitPost() {
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const tags = document.getElementById('postTags').value;
        const aiReview = document.getElementById('aiReview').checked;
        
        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('tags', tags);
        formData.append('aiReview', aiReview);
        
        // 上传图片
        const files = document.getElementById('imageUpload').files;
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });
        
        fetch('/api/community/posts', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert('发布成功！');
            this.closeModal();
            this.loadPosts();
        });
    }
    
    showPostDetail(postId) {
        // 获取帖子详情
        fetch(`/api/community/posts/${postId}`)
            .then(res => res.json())
            .then(post => {
                const modal = document.getElementById('postDetailModal');
                document.getElementById('detailTitle').textContent = post.title;
                
                document.getElementById('postDetailBody').innerHTML = `
                    <div class="post-detail">
                        <div class="post-detail-header">
                            <div class="post-detail-author">
                                <img src="${post.avatar}" alt="${post.author}" class="post-author-avatar">
                                <div>
                                    <h4>${post.author}</h4>
                                    <span class="post-time">${post.time}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="post-detail-content">
                            ${post.content}
                        </div>
                        
                        <div class="post-detail-images">
                            ${post.images ? post.images.map(img => 
                                `<img src="${img}" alt="帖子图片">`
                            ).join('') : ''}
                        </div>
                        
                        <div class="comments-section">
                            <h3>评论 (${post.comments?.length || 0})</h3>
                            ${post.comments ? post.comments.map(comment => `
                                <div class="comment-item">
                                    <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <span class="comment-author">${comment.author}</span>
                                            <span class="comment-time">${comment.time}</span>
                                        </div>
                                        <p class="comment-text">${comment.content}</p>
                                        <div class="comment-actions">
                                            <button><i class="far fa-heart"></i> ${comment.likes || 0}</button>
                                            <button><i class="far fa-comment"></i> 回复</button>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : ''}
                            
                            <div class="comment-form">
                                <input type="text" placeholder="写下你的评论...">
                                <button onclick="community.addComment('${postId}')">发布</button>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'flex';
            });
    }
    
    addComment(postId) {
        const input = document.querySelector('.comment-form input');
        const content = input.value.trim();
        
        if (!content) return;
        
        fetch(`/api/community/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        })
        .then(res => res.json())
        .then(() => {
            input.value = '';
            this.showPostDetail(postId);
        });
    }
    
    searchTopic(topic) {
        // 搜索话题
        alert(`搜索话题：${topic}`);
    }
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// 初始化
const community = new Community();