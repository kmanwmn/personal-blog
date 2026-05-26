/* ============================================
   Blog API 客户端 - 与 C++ 后端通信
   ============================================ */

// 自动检测：本地开发用 127.0.0.1，生产环境用 Cloudflare Tunnel 域名
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8080'
    : 'https://[替换为你的Cloudflare隧道域名]';
let currentUser = null;

async function apiRequest(method, path, body) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) { options.body = JSON.stringify(body); }
    try {
        const resp = await fetch(API_BASE + path, options);
        return await resp.json();
    } catch (err) {
        console.error('API 请求失败:', err);
        return { success: false, message: '网络错误: ' + err.message };
    }
}

async function apiRegister(username, password, nickname) {
    return await apiRequest('POST', '/api/register', { username: username, password: password, nickname: nickname });
}

async function apiLogin(username, password) {
    const result = await apiRequest('POST', '/api/login', { username: username, password: password });
    if (result.success && result.user) {
        currentUser = result.user;
        localStorage.setItem('blogCurrentUser', JSON.stringify(currentUser));
    }
    return result;
}

function apiLogout() {
    currentUser = null;
    localStorage.removeItem('blogCurrentUser');
}

function loadStoredUser() {
    const saved = localStorage.getItem('blogCurrentUser');
    if (saved) {
        try { currentUser = JSON.parse(saved); return currentUser; } catch(e) {}
    }
    return null;
}

async function apiGetPosts(username) {
    const path = username ? '/api/posts?username=' + encodeURIComponent(username) : '/api/posts';
    const data = await apiRequest('GET', path);
    return data.posts || [];
}

async function apiAddPost(username, post) {
    post.username = username;
    return await apiRequest('POST', '/api/posts', post);
}

async function apiDeletePost(username, postId) {
    return await apiRequest('DELETE', '/api/posts?username=' + encodeURIComponent(username) + '&id=' + postId);
}

async function apiGetAwards(username) {
    if (!username) return [];
    const data = await apiRequest('GET', '/api/awards?username=' + encodeURIComponent(username));
    return data.awards || [];
}

async function apiGetProjects(username) {
    if (!username) return [];
    const data = await apiRequest('GET', '/api/projects?username=' + encodeURIComponent(username));
    return data.projects || [];
}

async function apiGetWork(username) {
    if (!username) return [];
    const data = await apiRequest('GET', '/api/work?username=' + encodeURIComponent(username));
    return data.work || [];
}

async function apiGetSettings(username) {
    if (!username) return null;
    const data = await apiRequest('GET', '/api/settings?username=' + encodeURIComponent(username));
    return data.settings || null;
}

async function apiSaveSettings(username, settings) {
    return await apiRequest('POST', '/api/settings?username=' + encodeURIComponent(username), settings);
}

async function apiGetAbout(username) {
    if (!username) return null;
    const data = await apiRequest('GET', '/api/about?username=' + encodeURIComponent(username));
    return data.about || null;
}

async function apiSaveAbout(username, about) {
    return await apiRequest('POST', '/api/about?username=' + encodeURIComponent(username), about);
}

function isLoggedIn() {
    return currentUser !== null && currentUser.username;
}

function getUsername() {
    return currentUser ? currentUser.username : '';
}