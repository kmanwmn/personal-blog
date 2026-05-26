/* ============================================
   个人经历数据和页面设置
   ============================================ */

// ---------- 竞赛经历 ----------
const defaultAwards = [
    {
        id: 1,
        title: "ACM-ICPC 国际大学生程序设计竞赛",
        rank: "金牌",
        org: "ACM / ICPC Foundation",
        date: "2024-05",
        image: "",
        desc: "作为队长带队参加亚洲区域赛，获得金牌，排名赛区前10%。负责算法设计与代码实现，在5小时内解决8道难题。"
    },
    {
        id: 2,
        title: "全国大学生数学建模竞赛",
        rank: "国家级一等奖",
        org: "中国工业与应用数学学会",
        date: "2023-11",
        image: "",
        desc: "负责建立数学模型和编写Python程序，解决了城市交通流量优化问题，论文被评为优秀论文。"
    },
    {
        id: 3,
        title: "蓝桥杯全国软件和信息技术专业人才大赛",
        rank: "省赛一等奖",
        org: "工业和信息化部",
        date: "2023-04",
        image: "",
        desc: "参加C/C++程序设计大学A组，获得省级一等奖并晋级全国总决赛。"
    }
];

// ---------- 项目经历 ----------
const defaultProjects = [
    {
        id: 1,
        title: "智能博客管理系统",
        tech: ["React", "Node.js", "MongoDB", "Docker"],
        link: "https://github.com/xiaoming/blog",
        date: "2024-10 - 至今",
        desc: "开发了一个全栈博客管理系统，支持Markdown编辑、用户认证、评论系统和数据统计面板。使用Docker容器化部署，日均处理1000+请求。"
    },
    {
        id: 2,
        title: "在线代码协作平台",
        tech: ["Vue 3", "WebSocket", "Redis", "Kubernetes"],
        link: "https://github.com/xiaoming/code-collab",
        date: "2024-06 - 2024-09",
        desc: "实现了一个支持多人实时协作编程的Web应用，基于WebSocket实现光标同步和代码合并，使用CRDT算法解决冲突。"
    },
    {
        id: 3,
        title: "校园二手交易小程序",
        tech: ["WePY", "PHP", "MySQL"],
        link: "",
        date: "2024-03 - 2024-06",
        desc: "开发了一款微信小程序，为校内师生提供安全的二手商品交易平台。实现了用户认证、商品发布、即时通讯等功能，上线后月活跃用户2000+。"
    },
    {
        id: 4,
        title: "个人博客网站",
        tech: ["HTML", "CSS", "JavaScript"],
        link: "",
        date: "2024-12",
        desc: "从零搭建的个人静态博客网站，支持在线写文章、文章管理、响应式设计，所有数据存储在localStorage中。"
    }
];

// ---------- 工作经历 ----------
const defaultWork = [
    {
        id: 1,
        company: "字节跳动",
        position: "前端开发实习生",
        period: "2024.07 - 2024.10",
        desc: "参与抖音电商平台的前端开发工作，负责商品详情页和购物车模块的重构优化。使用React + TypeScript进行开发，优化后页面加载速度提升40%。"
    },
    {
        id: 2,
        company: "阿里巴巴",
        position: "后端开发实习生",
        period: "2023.07 - 2023.10",
        desc: "在阿里云智能部门参与云监控系统的后端开发，使用Java Spring Boot框架实现数据采集和告警模块。参与了系统微服务化改造，提升了系统的可扩展性。"
    }
];

// ---------- 页面可见性设置 ----------
const pageSettingsKeys = {
    home: { label: '🏠 首页', default: true, alwaysShow: true },
    write: { label: '✍️ 写文章', default: true, alwaysShow: false },
    archives: { label: '📂 归档', default: true, alwaysShow: false },
    awards: { label: '🏆 竞赛经历', default: true, alwaysShow: false },
    projects: { label: '💻 项目经历', default: true, alwaysShow: false },
    work: { label: '💼 工作经历', default: true, alwaysShow: false },
    about: { label: '👤 关于', default: true, alwaysShow: true },
    settings: { label: '⚙️ 设置', default: true, alwaysShow: true }
};

// Default theme
const DEFAULT_THEME = 'default';

// Current theme
let currentTheme = DEFAULT_THEME;

// 从 localStorage 加载设置
function loadPageSettings() {
    const saved = localStorage.getItem('blogPageSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.theme) {
                currentTheme = parsed.theme;
            }
            return parsed;
        } catch(e) {}
    }
    const defaults = {};
    for (const key in pageSettingsKeys) {
        defaults[key] = pageSettingsKeys[key].default;
    }
    defaults.theme = DEFAULT_THEME;
    return defaults;
}

// 保存设置
function savePageSettings(settings) {
    localStorage.setItem('blogPageSettings', JSON.stringify(settings));
}

// Apply theme to HTML element
function applyTheme(theme) {
    const html = document.documentElement;
    // Remove all theme classes
    html.className = '';
    if (theme !== 'default') {
        html.classList.add('theme-' + theme);
    }
    currentTheme = theme;
}

// 从 localStorage 加载个人数据
function loadProfileData(type) {
    const saved = localStorage.getItem('blogProfile_' + type);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return null;
}

// 保存个人数据
function saveProfileData(type, data) {
    localStorage.setItem('blogProfile_' + type, JSON.stringify(data));
}

// ---------- 关于页 ----------
const defaultAbout = {
    name: '小明',
    tagline: '全栈开发者 / 终身学习者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
    description: '<p>你好！我是一名全栈软件工程师，热衷于探索新技术并用代码创造价值。</p><p>工作之余，我喜欢通过写作来分享自己的学习心得和技术思考。</p><p>这个博客记录了我对技术、生活和学习的思考，希望能对你有所启发。</p>',
    skills: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Docker', 'Linux'],
    email: 'xiaoming@blog.com',
    github: 'github.com/xiaoming',
    zhihu: 'zhihu.com/people/xiaoming'
};

// 加载所有个人数据
let profileAwards = loadProfileData('awards') || defaultAwards;
let profileProjects = loadProfileData('projects') || defaultProjects;
let profileWork = loadProfileData('work') || defaultWork;
let profileAbout = loadProfileData('about') || JSON.parse(JSON.stringify(defaultAbout));
let pageSettings = loadPageSettings();
