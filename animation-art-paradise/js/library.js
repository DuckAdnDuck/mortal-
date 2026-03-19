// 动画库页面逻辑

class AnimeLibrary {
    constructor() {
        this.animeGrid = document.getElementById('animeGrid');
        this.modal = document.getElementById('animeModal');
        this.modalBody = document.getElementById('modalBody');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.aiFilterInput = document.querySelector('.ai-filter input');
        this.aiFilterBtn = document.querySelector('.btn-ai-small');
        
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {
            genre: '全部',
            year: '全部',
            aiQuery: ''
        };
        this.allAnimes = [];
        
        this.init();
    }
    
    async init() {
        await this.loadAnimes();
        this.bindEvents();
    }
    
    async loadAnimes() {
        // 模拟加载动画数据
        this.showLoading();
        
        // 模拟API请求
        setTimeout(() => {
            this.allAnimes = this.generateMockAnimes();
            this.renderAnimes();
            this.hideLoading();
        }, 1000);
    }
    
    generateMockAnimes() {
        const genres = ['热血', '治愈', '科幻', '奇幻', '恋爱', '搞笑', '悬疑', '日常'];
        const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];
        const titles = [
            '星空的记忆', '春日的约定', '魔法使的新娘', '夏目友人帐',
            '紫罗兰永恒花园', '你的名字。', '天气之子', '铃芽之旅',
            '间谍过家家', '咒术回战', '鬼灭之刃', '进击的巨人',
            '夏洛特', 'Angel Beats!', 'CLANNAD', '未闻花名'
        ];
        
        return Array(50).fill().map((_, index) => {
            const title = titles[index % titles.length] + (Math.floor(index / titles.length) + 1);
            const genre = genres[Math.floor(Math.random() * genres.length)];
            const year = years[Math.floor(Math.random() * years.length)];
            const rating = (7 + Math.random() * 2.5).toFixed(1);
            const aiScore = Math.floor(70 + Math.random() * 25);
            const episodes = Math.floor(12 + Math.random() * 38);
            
            return {
                id: index + 1,
                title: title,
                cover: `images/animations/anime${(index % 8) + 1}.jpg`,
                genre: genre,
                year: year,
                rating: rating,
                aiScore: aiScore,
                episodes: episodes,
                description: '这是一个关于' + genre + '的动画故事，讲述了...',
                studio: ['京都动画', 'MAPPA', 'A-1 Pictures', '骨头社'][Math.floor(Math.random() * 4)],
                director: ['新海诚', '宫崎骏', '今敏', '细田守'][Math.floor(Math.random() * 4)]
            };
        });
    }
    
    renderAnimes() {
        const filtered = this.filterAnimes();
        const pageAnimes = filtered.slice(0, this.currentPage * this.pageSize);
        
        this.animeGrid.innerHTML = pageAnimes.map(anime => `
            <div class="anime-card" data-id="${anime.id}" onclick="library.showDetails(${anime.id})">
                <div class="anime-card-image">
                    <img src="${anime.cover}" alt="${anime.title}" loading="lazy">
                    <span class="anime-card-badge">AI评分 ${anime.aiScore}</span>
                </div>
                <div class="anime-card-info">
                    <h3 class="anime-card-title">${anime.title}</h3>
                    <div class="anime-card-meta">
                        <span>${anime.year}</span>
                        <span class="anime-card-rating">⭐ ${anime.rating}</span>
                    </div>
                    <div class="anime-card-tags">
                        <span class="anime-card-tag">${anime.genre}</span>
                        <span class="anime-card-tag">${anime.episodes}集</span>
                    </div>
                    <div class="anime-card-ai">
                        <i class="fas fa-robot"></i>
                        <span>${this.getAITagline(anime)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 隐藏加载更多按钮
        if (filtered.length <= this.currentPage * this.pageSize) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'inline-block';
        }
    }
    
    getAITagline(anime) {
        const taglines = [
            '治愈系神作，看完暖暖的',
            '画风精美，每一帧都是壁纸',
            '剧情神转折，不容错过',
            '音乐超赞，代入感极强',
            '角色塑造深入人心',
            '与你的心情完美匹配'
        ];
        return taglines[anime.id % taglines.length];
    }
    
    filterAnimes() {
        return this.allAnimes.filter(anime => {
            if (this.currentFilters.genre !== '全部' && anime.genre !== this.currentFilters.genre) {
                return false;
            }
            if (this.currentFilters.year !== '全部') {
                if (this.currentFilters.year === '更早' && parseInt(anime.year) >= 2000) {
                    return false;
                } else if (this.currentFilters.year.includes('-')) {
                    const [start, end] = this.currentFilters.year.split('-');
                    const year = parseInt(anime.year);
                    if (year < parseInt(start) || year > parseInt(end)) {
                        return false;
                    }
                } else if (anime.year !== this.currentFilters.year) {
                    return false;
                }
            }
            if (this.currentFilters.aiQuery) {
                // AI语义搜索
                return anime.title.includes(this.currentFilters.aiQuery) || 
                       anime.genre.includes(this.currentFilters.aiQuery);
            }
            return true;
        });
    }
    
    async showDetails(id) {
        const anime = this.allAnimes.find(a => a.id === id);
        if (!anime) return;
        
        // 加载AI分析
        const aiAnalysis = await this.getAIAnalysis(anime);
        
        this.modalBody.innerHTML = `
            <div class="anime-detail">
                <div class="detail-header" style="display: flex; gap: 30px; margin-bottom: 30px;">
                    <img src="${anime.cover}" alt="${anime.title}" style="width: 300px; height: 400px; object-fit: cover; border-radius: 20px;">
                    <div style="flex:1;">
                        <h1 style="font-size: 2rem; margin-bottom: 15px;">${anime.title}</h1>
                        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                            <span><i class="fas fa-star" style="color: gold;"></i> ${anime.rating}</span>
                            <span><i class="fas fa-calendar"></i> ${anime.year}</span>
                            <span><i class="fas fa-film"></i> ${anime.episodes}集</span>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <span class="tag tag-pink">${anime.genre}</span>
                            <span class="tag tag-blue">${anime.studio}</span>
                            <span class="tag tag-ai">AI评分 ${anime.aiScore}</span>
                        </div>
                        <p style="line-height: 1.8; margin-bottom: 20px;">${anime.description}</p>
                        <div class="detail-actions" style="display: flex; gap: 15px;">
                            <button class="btn btn-primary" onclick="library.watchAnime(${anime.id})">
                                <i class="fas fa-play"></i> 立即观看
                            </button>
                            <button class="btn btn-secondary" onclick="library.addToFavorites(${anime.id})">
                                <i class="far fa-heart"></i> 收藏
                            </button>
                            <button class="btn btn-secondary" onclick="library.askAI(${anime.id})">
                                <i class="fas fa-robot"></i> 问AI
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="detail-ai-analysis" style="background: var(--gradient-soft); padding: 20px; border-radius: 20px; margin-bottom: 30px;">
                    <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <i class="fas fa-robot" style="color: var(--ai-purple);"></i>
                        AI深度分析
                    </h3>
                    <div class="ai-analysis-content" style="line-height: 1.8;">
                        ${aiAnalysis}
                    </div>
                </div>
                
                <div class="detail-similar">
                    <h3 style="margin-bottom: 20px;">相似作品推荐</h3>
                    <div class="similar-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                        ${this.getSimilarAnimes(anime).map(similar => `
                            <div class="similar-card" onclick="library.showDetails(${similar.id})" style="cursor: pointer;">
                                <img src="${similar.cover}" alt="${similar.title}" style="width:100%; height:150px; object-fit:cover; border-radius:10px;">
                                <p style="margin-top:5px; font-weight:600;">${similar.title}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.modal.style.display = 'flex';
        
        // 关闭按钮
        this.modal.querySelector('.modal-close').onclick = () => {
            this.modal.style.display = 'none';
        };
        
        // 点击背景关闭
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        };
    }
    
    async getAIAnalysis(anime) {
        // 模拟AI分析
        return `
            <p><strong>🎬 剧情分析：</strong> ${anime.title}是一部${anime.genre}题材的动画，讲述了一个关于成长与羁绊的故事。剧情节奏张弛有度，情感渲染到位。</p>
            <p><strong>🎨 美术风格：</strong> 画面制作精良，色彩运用极具特色，${anime.studio}的招牌作画质量保证了每一帧的观赏性。</p>
            <p><strong>🎵 音乐评价：</strong> 配乐与剧情完美契合，主题曲旋律优美，多次在关键情节中起到画龙点睛的作用。</p>
            <p><strong>💡 适合人群：</strong> 推荐给喜欢${anime.genre}题材、注重剧情深度和美术表现的观众。如果你喜欢《${this.getSimilarAnimes(anime)[0]?.title}》这类作品，那么这部动画也很可能符合你的口味。</p>
        `;
    }
    
    getSimilarAnimes(anime) {
        return this.allAnimes
            .filter(a => a.id !== anime.id && a.genre === anime.genre)
            .slice(0, 4);
    }
    
    bindEvents() {
        // 筛选标签点击
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const parent = e.target.closest('.filter-section');
                const filterType = parent.querySelector('h3').textContent;
                const value = e.target.textContent;
                
                // 更新UI
                parent.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // 更新过滤器
                if (filterType === '类型') {
                    this.currentFilters.genre = value;
                } else if (filterType === '年代') {
                    this.currentFilters.year = value;
                }
                
                this.currentPage = 1;
                this.renderAnimes();
            });
        });
        
        // AI筛选
        this.aiFilterBtn.addEventListener('click', () => {
            this.currentFilters.aiQuery = this.aiFilterInput.value;
            this.currentPage = 1;
            this.renderAnimes();
        });
        
        this.aiFilterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.aiFilterBtn.click();
            }
        });
        
        // 加载更多
        this.loadMoreBtn.addEventListener('click', () => {
            this.currentPage++;
            this.renderAnimes();
        });
    }
    
    watchAnime(id) {
        alert('跳转到播放页面');
    }
    
    addToFavorites(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favorites.includes(id)) {
            favorites.push(id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('已添加到收藏');
        } else {
            alert('已经在收藏夹中');
        }
    }
    
    askAI(id) {
        const anime = this.allAnimes.find(a => a.id === id);
        // 跳转到AI聊天页面并带上动画信息
        localStorage.setItem('aiContext', JSON.stringify({ anime: anime }));
        window.location.href = `ai-chat.html?context=anime&id=${id}`;
    }
    
    showLoading() {
        this.animeGrid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1;">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
    }
    
    hideLoading() {
        // 加载完成后的清理
    }
}

// 初始化
const library = new AnimeLibrary();