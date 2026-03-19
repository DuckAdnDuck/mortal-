// 首页交互逻辑

// 轮播图功能
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // 自动轮播
        setInterval(() => this.next(), 5000);
    }
    
    showSlide(index) {
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;
        
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(ind => ind.classList.remove('active'));
        
        this.slides[index].classList.add('active');
        this.indicators[index].classList.add('active');
        this.currentIndex = index;
    }
    
    next() {
        this.showSlide(this.currentIndex + 1);
    }
    
    prev() {
        this.showSlide(this.currentIndex - 1);
    }
}

// 加载热门动画
async function loadHotAnimations() {
    const container = document.getElementById('hotAnimations');
    if (!container) return;
    
    // 模拟数据
    const animations = [
        { id: 1, title: '梦幻之旅', image: 'images/animations/anime1.jpg', rating: 9.5, tags: ['奇幻', '治愈'], aiScore: 95 },
        { id: 2, title: '星空物语', image: 'images/animations/anime2.jpg', rating: 9.2, tags: ['科幻', '恋爱'], aiScore: 88 },
        { id: 3, title: '魔法学院', image: 'images/animations/anime3.jpg', rating: 9.8, tags: ['魔法', '冒险'], aiScore: 92 },
        { id: 4, title: '春日告白', image: 'images/animations/anime4.jpg', rating: 9.0, tags: ['校园', '青春'], aiScore: 85 }
    ];
    
    container.innerHTML = animations.map(anime => `
        <div class="card anime-card" onclick="location.href='library.html?id=${anime.id}'">
            <div class="anime-image" style="position: relative;">
                <img src="${anime.image}" alt="${anime.title}" style="width:100%; height:200px; object-fit:cover; border-radius:15px;">
                <span class="tag tag-ai" style="position:absolute; top:10px; right:10px;">AI评分 ${anime.aiScore}</span>
            </div>
            <div class="anime-info" style="padding: 15px 0;">
                <h3 style="margin-bottom: 5px;">${anime.title}</h3>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        ${anime.tags.map(tag => `<span class="tag tag-pink">${tag}</span>`).join('')}
                    </div>
                    <span style="color: gold;">⭐ ${anime.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载最新资讯
async function loadLatestNews() {
    const container = document.getElementById('latestNews');
    if (!container) return;
    
    const news = [
        { id: 1, title: '2024夏季新番推荐', summary: 'AI为你精选10部必看新番', image: 'images/news/news1.jpg', aiSummary: true },
        { id: 2, title: '经典动画幕后故事', summary: '制作团队访谈特辑', image: 'images/news/news2.jpg', aiSummary: false },
        { id: 3, title: '声优见面会精彩回顾', summary: '现场直击报道', image: 'images/news/news3.jpg', aiSummary: true }
    ];
    
    container.innerHTML = news.map(item => `
        <div class="card news-card" style="display: flex; gap: 20px; margin-bottom: 20px;">
            <img src="${item.image}" alt="${item.title}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 10px;">
            <div style="flex:1;">
                <h3 style="margin-bottom: 10px;">${item.title}</h3>
                <p style="color: #666; margin-bottom: 10px;">${item.summary}</p>
                ${item.aiSummary ? '<span class="tag tag-ai">AI摘要</span>' : ''}
                <span class="tag tag-blue">阅读更多</span>
            </div>
        </div>
    `).join('');
}

// 加载社区精选
async function loadCommunityPosts() {
    const container = document.getElementById('communityPosts');
    if (!container) return;
    
    const posts = [
        { id: 1, user: '画师小梦', avatar: 'images/avatars/user1.jpg', content: '原创角色设计 - 星空精灵', image: 'images/community/post1.jpg', likes: 234, comments: 45, aiReview: '✨ 色彩搭配很有梦幻感' },
        { id: 2, user: '动画迷小明', avatar: 'images/avatars/user2.jpg', content: '手办收藏展示', image: 'images/community/post2.jpg', likes: 567, comments: 89, aiReview: '🎨 收藏品很有艺术价值' }
    ];
    
    container.innerHTML = posts.map(post => `
        <div class="card post-card" style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <img src="${post.avatar}" alt="${post.user}" style="width: 50px; height: 50px; border-radius: 50%;">
                <div>
                    <h4>${post.user}</h4>
                    <span style="color: #999;">刚刚</span>
                </div>
            </div>
            <p style="margin-bottom: 15px;">${post.content}</p>
            <img src="${post.image}" alt="社区作品" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px; margin-bottom:15px;">
            <div style="display: flex; gap: 20px; margin-bottom: 10px;">
                <span><i class="far fa-heart"></i> ${post.likes}</span>
                <span><i class="far fa-comment"></i> ${post.comments}</span>
            </div>
            <div style="background: var(--gradient-soft); padding: 10px; border-radius: 10px;">
                <span class="tag tag-ai">AI点评</span> ${post.aiReview}
            </div>
        </div>
    `).join('');
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
    loadHotAnimations();
    loadLatestNews();
    loadCommunityPosts();
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});