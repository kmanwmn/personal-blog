/* ============================================
   博客文章数据
   格式说明：
   - id: 唯一标识
   - title: 文章标题
   - date: 发布日期 (YYYY-MM-DD)
   - category: 分类
   - tags: 标签数组
   - excerpt: 摘要（首页展示）
   - content: 完整内容（支持 HTML 标签）
   ============================================ */

// 尝试从 localStorage 加载用户数据
function loadBlogPosts() {
    const saved = localStorage.getItem('blogPosts');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {
            console.warn('localStorage 数据解析失败，使用默认数据');
        }
    }
    return null;
}

const defaultPosts = [
    {
        id: 1,
        title: "从零搭建个人博客：Hexo + GitHub Pages 完全指南",
        date: "2024-12-20",
        category: "教程",
        tags: ["Hexo", "GitHub Pages", "博客"],
        excerpt: "想要拥有一个属于自己的个人博客，又不想花钱买服务器？本文将详细介绍如何使用 Hexo 静态博客框架结合 GitHub Pages 免费服务，从零搭建一个功能完备的个人博客网站...",
        content: `
            <div class="article-header">
                <span class="article-category">教程</span>
                <h1 class="article-title">从零搭建个人博客：Hexo + GitHub Pages 完全指南</h1>
                <div class="article-meta">
                    <span>📅 2024-12-20</span>
                    <span class="article-tags">
                        <span class="article-tag">Hexo</span>
                        <span class="article-tag">GitHub Pages</span>
                        <span class="article-tag">博客</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>近些年来，很多开发者都喜欢使用 <strong>GitHub Pages</strong> 来搭建 Hexo 静态博客网站。它最大的优点就是——<strong>完全免费</strong>，而且非常稳定。</p>
                <p>虽然搭建时稍微有些折腾，但配置完成后，基本不需要操心维护的事，甚至过了几年再打开来看，文章依然还在。</p>
                <h2>什么是 GitHub Pages？</h2>
                <p>GitHub Pages 是由 GitHub 官方提供的一种免费的静态站点托管服务，让我们可以在 GitHub 仓库里托管和发布自己的静态网站页面。</p>
                <h2>什么是 Hexo？</h2>
                <p>Hexo 是一个快速、简洁且高效的静态博客框架，它基于 Node.js 运行，可以将我们撰写的 Markdown 文档解析渲染成静态的 HTML 网页。</p>
                <h2>环境搭建</h2>
                <p>首先需要安装 Node.js 和 Git：</p>
                <pre><code># 检查 Node.js 是否安装成功
node -v
npm -v

# 检查 Git 是否安装成功
git --version</code></pre>
                <h2>安装 Hexo</h2>
                <pre><code>npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
hexo g
hexo s</code></pre>
                <blockquote><p>小提示：如果端口被占用了，可以运行 <code>hexo server -p 5000</code> 更改端口号。</p></blockquote>
                <h2>部署到 GitHub Pages</h2>
                <p>首先在 GitHub 上创建一个名为 <code>用户名.github.io</code> 的仓库，然后安装部署插件并配置后运行 <code>hexo d</code> 即可部署。</p>
            </div>
        `
    },
    {
        id: 2,
        title: "JavaScript 异步编程：从回调到 Async/Await",
        date: "2024-12-15",
        category: "前端",
        tags: ["JavaScript", "异步", "Promise"],
        excerpt: "JavaScript 的异步编程经历了回调函数、Promise、Generator 到 Async/Await 的演变。本文将从最基础的概念讲起，带你彻底搞懂 JS 异步编程的来龙去脉...",
        content: `
            <div class="article-header">
                <span class="article-category">前端</span>
                <h1 class="article-title">JavaScript 异步编程：从回调到 Async/Await</h1>
                <div class="article-meta">
                    <span>📅 2024-12-15</span>
                    <span class="article-tags">
                        <span class="article-tag">JavaScript</span>
                        <span class="article-tag">异步</span>
                        <span class="article-tag">Promise</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>JavaScript 是一门单线程语言，这意味着它一次只能做一件事。但 Web 应用中有大量耗时操作（网络请求、文件读写等），如果都同步执行，页面就会卡死。因此，<strong>异步编程</strong>成为了 JavaScript 的核心能力。</p>
                <h2>回调函数时代</h2>
                <pre><code>function fetchData(callback) {
    setTimeout(() => {
        callback('数据加载完成');
    }, 1000);
}
fetchData((data) => console.log(data));</code></pre>
                <h2>Promise 登场</h2>
                <pre><code>const fetchData = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve('完成'), 1000);
    });
};
fetchData().then(data => console.log(data));</code></pre>
                <h2>Async/Await：终极方案</h2>
                <pre><code>async function getData() {
    const data = await fetchData();
    console.log(data);
}</code></pre>
                <blockquote><p>使用 async/await 配合 try/catch 可以让异步代码保持直观的线性结构。</p></blockquote>
            </div>
        `
    },
    {
        id: 3,
        title: "CSS Grid 布局完全指南",
        date: "2024-12-08",
        category: "前端",
        tags: ["CSS", "Grid", "布局"],
        excerpt: "CSS Grid 是 CSS 中最强大的布局系统之一。本文通过大量实例，手把手教你掌握网格布局的方方面面，从基础概念到实战技巧...",
        content: `
            <div class="article-header">
                <span class="article-category">前端</span>
                <h1 class="article-title">CSS Grid 布局完全指南</h1>
                <div class="article-meta">
                    <span>📅 2024-12-08</span>
                    <span class="article-tags">
                        <span class="article-tag">CSS</span>
                        <span class="article-tag">Grid</span>
                        <span class="article-tag">布局</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>CSS Grid 布局是 CSS 中最强大的布局系统。它是一个二维布局系统，可以同时控制行和列，让复杂的页面布局变得简单直观。</p>
                <h2>基本概念</h2>
                <ul>
                    <li><strong>网格容器</strong>：通过 display: grid 创建</li>
                    <li><strong>网格项</strong>：容器的直接子元素</li>
                    <li><strong>网格线</strong>：构成网格结构的分界线</li>
                    <li><strong>网格轨道</strong>：行或列的统称</li>
                </ul>
                <h2>创建网格</h2>
                <pre><code>.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}</code></pre>
                <h2>响应式布局</h2>
                <pre><code>.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
}</code></pre>
                <blockquote><p>auto-fill 和 minmax() 配合使用，可以创建无需媒体查询的响应式网格。</p></blockquote>
            </div>
        `
    },
    {
        id: 4,
        title: "我用 Vue 3 写了一个 Markdown 编辑器",
        date: "2024-11-28",
        category: "项目实战",
        tags: ["Vue3", "Markdown", "项目"],
        excerpt: "分享一下我使用 Vue 3 Composition API 开发 Markdown 编辑器的全过程，包括设计思路、关键技术选型以及遇到的问题和解决方案...",
        content: `
            <div class="article-header">
                <span class="article-category">项目实战</span>
                <h1 class="article-title">我用 Vue 3 写了一个 Markdown 编辑器</h1>
                <div class="article-meta">
                    <span>📅 2024-11-28</span>
                    <span class="article-tags">
                        <span class="article-tag">Vue3</span>
                        <span class="article-tag">Markdown</span>
                        <span class="article-tag">项目</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>最近使用 Vue 3 的 Composition API 开发了一个简易的 Markdown 编辑器，支持实时预览、语法高亮和主题切换。</p>
                <h2>技术选型</h2>
                <ul>
                    <li><strong>Vue 3</strong> — Composition API + script setup</li>
                    <li><strong>marked</strong> — Markdown 解析库</li>
                    <li><strong>highlight.js</strong> — 代码语法高亮</li>
                    <li><strong>Vite</strong> — 构建工具</li>
                </ul>
                <h2>核心实现</h2>
                <pre><code>import { marked } from 'marked';
import { ref, watch } from 'vue';
const input = ref('');
const output = ref('');
watch(input, (val) => {
    output.value = marked(val);
});</code></pre>
                <blockquote><p>安全提示：处理用户输入的 Markdown 时，务必进行 XSS 防护。</p></blockquote>
            </div>
        `
    },
    {
        id: 5,
        title: "程序员必备的 10 个 VS Code 插件",
        date: "2024-11-18",
        category: "工具",
        tags: ["VS Code", "插件", "效率"],
        excerpt: "工欲善其事，必先利其器。本文推荐 10 个提高开发效率的 VS Code 插件，涵盖代码编辑、Git 管理、调试等多个方面...",
        content: `
            <div class="article-header">
                <span class="article-category">工具</span>
                <h1 class="article-title">程序员必备的 10 个 VS Code 插件</h1>
                <div class="article-meta">
                    <span>📅 2024-11-18</span>
                    <span class="article-tags">
                        <span class="article-tag">VS Code</span>
                        <span class="article-tag">插件</span>
                        <span class="article-tag">效率</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>VS Code 已成为最流行的代码编辑器之一，它的强大很大程度上来自于丰富的插件生态。</p>
                <h2>1. Prettier</h2>
                <p>自动格式化代码，支持多种语言，搭配 ESLint 使用效果更佳。</p>
                <h2>2. GitLens</h2>
                <p>增强 VS Code 的 Git 功能，可以直观地查看代码行的修改历史。</p>
                <h2>3. Error Lens</h2>
                <p>将错误提示直接显示在代码行后面，不用鼠标悬停也能看到错误信息。</p>
                <h2>4. Thunder Client</h2>
                <p>轻量级 API 测试工具，直接在 VS Code 中测试接口。</p>
                <h2>5. Material Icon Theme</h2>
                <p>让文件图标更美观，不同的文件类型显示不同的图标。</p>
                <h2>6. Live Server</h2>
                <p>一键启动本地开发服务器，支持热更新。</p>
                <h2>7. GitHub Copilot</h2>
                <p>AI 代码助手，根据上下文自动补全代码。</p>
                <h2>8. Path Intellisense</h2>
                <p>文件路径自动补全，导入模块时不用手动输入完整路径。</p>
                <h2>9. Better Comments</h2>
                <p>让注释更好看，支持不同颜色的注释分类。</p>
                <h2>10. Code Runner</h2>
                <p>一键运行代码片段，支持多种语言。</p>
                <blockquote><p>插件虽好，但也不要装太多，否则会影响 VS Code 的启动速度。</p></blockquote>
            </div>
        `
    },
    {
        id: 6,
        title: "关于学习编程的一些建议",
        date: "2024-11-05",
        category: "感悟",
        tags: ["编程", "学习", "成长"],
        excerpt: "学习编程是一条漫长的路，本文分享我在自学编程过程中的一些经验和思考，希望能给正在学习编程的朋友们一些启发...",
        content: `
            <div class="article-header">
                <span class="article-category">感悟</span>
                <h1 class="article-title">关于学习编程的一些建议</h1>
                <div class="article-meta">
                    <span>📅 2024-11-05</span>
                    <span class="article-tags">
                        <span class="article-tag">编程</span>
                        <span class="article-tag">学习</span>
                        <span class="article-tag">成长</span>
                    </span>
                </div>
            </div>
            <div class="article-body">
                <p>经常有朋友问我："我想学编程，应该从哪里开始？" 这篇文章就来聊聊我的一些想法和建议。</p>
                <h2>选择一门合适的语言</h2>
                <p>对于初学者，我推荐从 Python 或 JavaScript 开始。</p>
                <h2>动手实践最重要</h2>
                <p>看 100 个教程不如自己动手写一个项目。</p>
                <h2>学会阅读文档</h2>
                <p>编程的核心能力不是记住 API，而是能够阅读和理解文档。</p>
                <h2>善用搜索引擎</h2>
                <p>遇到问题先自己搜索。Stack Overflow、GitHub Issues 都是很好的资源。</p>
                <h2>不要害怕犯错</h2>
                <p>错误是学习的一部分。每一个报错信息都是一次学习的机会。</p>
                <blockquote><p>"编程并不难，难的是坚持。每天写一点代码，比一周写一整天更有效。"</p></blockquote>
            </div>
        `
    }
];

// 按日期倒序排列
defaultPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

// 最终导出的文章数据
// 优先使用 localStorage 中的用户数据，否则使用默认数据
let blogPosts = loadBlogPosts() || defaultPosts;

// 生成文章唯一 ID（用户文章从 1001 开始）
function generateId() {
    const maxId = blogPosts.reduce((max, p) => Math.max(max, p.id), 0);
    return Math.max(maxId + 1, 1001);
}

// 保存到 localStorage
function savePostsToStorage() {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}

// 重新从 localStorage 加载
function reloadPostsFromStorage() {
    const saved = localStorage.getItem('blogPosts');
    if (saved) {
        try {
            blogPosts = JSON.parse(saved);
            return true;
        } catch(e) {}
    }
    return false;
}
