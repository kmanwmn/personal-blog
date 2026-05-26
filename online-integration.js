/* ============================================
   在线集成 - 将前端与后端 API 连接
   在 app.js 之后加载，覆盖函数实现
   ============================================ */

let isOnlineMode = false;

// ---------- 用户状态 UI ----------
function updateUserStatus() {
    const text = document.getElementById('userStatusText');
    const btn = document.getElementById('userStatusBtn');
    const stored = loadStoredUser();
    if (stored && stored.username) {
        currentUser = stored;
        isOnlineMode = true;
        text.innerHTML = '&#x1F310; ' + (stored.nickname || stored.username);
        btn.textContent = '退出';
        btn.onclick = function() { apiLogout(); updateUserStatus(); window.location.reload(); };
    } else {
        isOnlineMode = false;
        text.innerHTML = '&#x1F310; 离线模式';
        btn.textContent = '登录';
        btn.onclick = function() { showAuthModal(); };
    }
}

// ---------- 登录弹窗 ----------
let isRegisterMode = false;

function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('authError').textContent = '';
    isRegisterMode = false;
    document.getElementById('authTitle').textContent = '登录';
    document.getElementById('authSubmit').textContent = '登录';
    document.getElementById('authToggle').textContent = '注册账号';
    document.getElementById('nicknameField').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

document.getElementById('authModalClose').onclick = closeAuthModal;
document.getElementById('auth-modal').onclick = function(e) {
    if (e.target === this) closeAuthModal();
};

document.getElementById('authToggle').onclick = function() {
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
        document.getElementById('authTitle').textContent = '注册';
        document.getElementById('authSubmit').textContent = '注册';
        document.getElementById('authToggle').textContent = '已有账号？去登录';
        document.getElementById('nicknameField').style.display = 'block';
    } else {
        document.getElementById('authTitle').textContent = '登录';
        document.getElementById('authSubmit').textContent = '登录';
        document.getElementById('authToggle').textContent = '注册账号';
        document.getElementById('nicknameField').style.display = 'none';
    }
    document.getElementById('authError').textContent = '';
};

document.getElementById('authSubmit').onclick = async function() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const nickname = document.getElementById('authNickname').value.trim();
    const errDiv = document.getElementById('authError');

    if (!username || !password) {
        errDiv.textContent = '请输入用户名和密码';
        return;
    }

    let result;
    if (isRegisterMode) {
        result = await apiRegister(username, password, nickname || username);
    } else {
        result = await apiLogin(username, password);
    }

    if (result.success) {
        closeAuthModal();
        await loadOnlineData();
        window.location.reload();
    } else {
        errDiv.textContent = result.message || '操作失败';
    }
};

document.getElementById('authPassword').onkeydown = function(e) {
    if (e.key === 'Enter') document.getElementById('authSubmit').click();
};

// ---------- 在线数据加载 ----------
async function loadOnlineData() {
    if (!isLoggedIn()) return;
    const username = getUsername();

    // 关键：始终用服务器数据覆盖本地缓存，即使返回空数组
    // 这样才能保证切换账号时不会残留上一个用户的数据
    try {
        const posts = await apiGetPosts(username);
        blogPosts = posts || [];
        savePostsToStorage();
    } catch(e) { console.warn('加载在线文章失败:', e); }

    try {
        const awards = await apiGetAwards(username);
        profileAwards = awards || [];
        saveProfileData('awards', awards || []);
    } catch(e) { console.warn('加载在线竞赛经历失败:', e); }

    try {
        const projects = await apiGetProjects(username);
        profileProjects = projects || [];
        saveProfileData('projects', projects || []);
    } catch(e) { console.warn('加载在线项目经历失败:', e); }

    try {
        const work = await apiGetWork(username);
        profileWork = work || [];
        saveProfileData('work', work || []);
    } catch(e) { console.warn('加载在线工作经历失败:', e); }

    try {
        const settings = await apiGetSettings(username);
        if (settings) {
            pageSettings = settings;
            savePageSettings(settings);
        }
    } catch(e) { console.warn('加载在线设置失败:', e); }

    try {
        const about = await apiGetAbout(username);
        if (about) {
            profileAbout = about;
            saveProfileData('about', about);
        }
    } catch(e) { console.warn('加载在线关于页失败:', e); }
}

// ---------- 覆盖发布文章（在线模式） ----------
const _origPublishPost = window.publishPost;
window.publishPost = async function() {
    if (!isOnlineMode || !isLoggedIn()) {
        if (_origPublishPost) _origPublishPost();
        return;
    }

    const title = document.getElementById('editTitle').value.trim();
    const category = document.getElementById('editCategory').value.trim();
    const tagsStr = document.getElementById('editTags').value.trim();
    const content = document.getElementById('editContent').value.trim();

    if (!title) { alert('请输入文章标题！'); return; }
    if (!content) { alert('请输入文章内容！'); return; }
    if (!category) { alert('请输入文章分类！'); return; }

    const tags = tagsStr ? tagsStr.split(/[,，、\s]+/).filter(function(t) { return t.trim(); }) : [];

    const excerpt = generateExcerpt(parseMarkdown(content));

    const result = await apiAddPost(getUsername(), {
        title: title,
        category: category,
        tags: tags,
        content: content,
        excerpt: excerpt
    });

    if (result.success) {
        // 保存原始 Markdown 以便后续编辑
        if (result.post && result.post.id) {
            localStorage.setItem('raw_' + result.post.id, content);
        }
        alert('文章已在线发布！');
        document.getElementById('editTitle').value = '';
        document.getElementById('editCategory').value = '';
        document.getElementById('editTags').value = '';
        document.getElementById('editContent').value = '';
        document.getElementById('editPreview').innerHTML = '<div class="preview-placeholder">&#x1F58A;&#xFE0F; 在编辑器中写点内容，预览会实时显示在这里</div>';
        window.editingPostId = null;
        document.getElementById('btnPublish').textContent = '发布文章';

        // 刷新文章列表
        const posts = await apiGetPosts(getUsername());
        if (posts) blogPosts = posts;
        if (typeof renderPosts === 'function') renderPosts();
        if (typeof renderArchives === 'function') renderArchives();
        if (typeof renderSavedPosts === 'function') renderSavedPosts();
    } else {
        alert('发布失败: ' + (result.message || '未知错误'));
    }
};

// ---------- 覆盖删除文章 ----------
const _origDeletePost = window.deletePost;
window.deletePost = async function(id) {
    if (!isOnlineMode || !isLoggedIn()) {
        if (_origDeletePost) _origDeletePost(id);
        return;
    }

    const post = blogPosts.find(function(p) { return p.id === id; });
    if (!post) return;
    if (!confirm('确定要删除《' + post.title + '》吗？此操作不可恢复！')) return;

    const result = await apiDeletePost(getUsername(), id);
    if (result.success) {
        blogPosts = blogPosts.filter(function(p) { return p.id !== id; });
        savePostsToStorage();
        if (typeof renderPosts === 'function') renderPosts();
        if (typeof renderArchives === 'function') renderArchives();
        if (typeof renderSavedPosts === 'function') renderSavedPosts();
        alert('文章已删除');
    } else {
        alert('删除失败: ' + (result.message || '未知错误'));
    }
};

// ---------- 初始化 ----------
updateUserStatus();

// 如果已登录，从服务器加载数据（防止切换账号后残留上一个用户的数据）
if (isLoggedIn()) {
    loadOnlineData().then(function() {
        // 数据加载完成后刷新页面显示
        if (typeof renderPosts === 'function') renderPosts();
        if (typeof renderAwards === 'function') renderAwards();
        if (typeof renderProjects === 'function') renderProjects();
        if (typeof renderWork === 'function') renderWork();
        if (typeof renderAbout === 'function') renderAbout();
        if (typeof renderArchives === 'function') renderArchives();
        if (typeof renderSavedPosts === 'function') renderSavedPosts();
        if (typeof renderSettings === 'function') renderSettings();
    });
}

// ---------- 覆盖保存函数（在线模式） ----------
if (typeof saveAwardsFromEdit === 'function') {
    const _origSaveAwards = window.saveAwardsFromEdit;
    window.saveAwardsFromEdit = async function() {
        if (!isOnlineMode || !isLoggedIn()) {
            _origSaveAwards();
            return;
        }
        const rows = document.querySelectorAll('#awards-edit-list .edit-row');
        const awards = [];
        rows.forEach(function(row) {
            const idEl = row.querySelector('[data-award-id]');
            const award = {};
            row.querySelectorAll('[data-field]').forEach(function(el) {
                award[el.dataset.field] = el.value;
            });
            award.id = idEl ? parseInt(idEl.dataset.awardId) : 0;
            awards.push(award);
        });
        const result = await apiRequest('POST', '/api/awards?username=' + getUsername(), awards);
        if (result.success) {
            profileAwards = awards;
            saveProfileData('awards', awards);
            if (typeof renderAwards === 'function') renderAwards();
            alert('竞赛经历已保存');
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    };
}

if (typeof saveProjectsFromEdit === 'function') {
    const _origSaveProjects = window.saveProjectsFromEdit;
    window.saveProjectsFromEdit = async function() {
        if (!isOnlineMode || !isLoggedIn()) {
            _origSaveProjects();
            return;
        }
        const rows = document.querySelectorAll('#projects-edit-list .edit-row');
        const projects = [];
        rows.forEach(function(row) {
            const idEl = row.querySelector('[data-project-id]');
            const project = {};
            row.querySelectorAll('[data-field]').forEach(function(el) {
                const field = el.dataset.field;
                if (field === 'tech') {
                    project.tech = el.value.split(/[,，、\s]+/).filter(t => t.trim());
                } else {
                    project[field] = el.value;
                }
            });
            project.id = idEl ? parseInt(idEl.dataset.projectId) : 0;
            projects.push(project);
        });
        const result = await apiRequest('POST', '/api/projects?username=' + getUsername(), projects);
        if (result.success) {
            profileProjects = projects;
            saveProfileData('projects', projects);
            if (typeof renderProjects === 'function') renderProjects();
            alert('项目经历已保存');
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    };
}

if (typeof saveWorkFromEdit === 'function') {
    const _origSaveWork = window.saveWorkFromEdit;
    window.saveWorkFromEdit = async function() {
        if (!isOnlineMode || !isLoggedIn()) {
            _origSaveWork();
            return;
        }
        const rows = document.querySelectorAll('#work-edit-list .edit-row');
        const workList = [];
        rows.forEach(function(row) {
            const idEl = row.querySelector('[data-work-id]');
            const work = {};
            row.querySelectorAll('[data-field]').forEach(function(el) {
                work[el.dataset.field] = el.value;
            });
            work.id = idEl ? parseInt(idEl.dataset.workId) : 0;
            workList.push(work);
        });
        const result = await apiRequest('POST', '/api/work?username=' + getUsername(), workList);
        if (result.success) {
            profileWork = workList;
            saveProfileData('work', workList);
            if (typeof renderWork === 'function') renderWork();
            alert('工作经历已保存');
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    };
}

// 覆盖 settings 保存
if (typeof saveSettings === 'function') {
    const _origSaveSettings = window.saveSettings;
    window.saveSettings = async function() {
        if (!isOnlineMode || !isLoggedIn()) {
            _origSaveSettings();
            return;
        }
        const checkboxes = document.querySelectorAll('#settings-page-list input[type="checkbox"]');
        const settings = {};
        checkboxes.forEach(function(cb) {
            settings[cb.dataset.settingKey] = cb.checked;
        });
        settings.theme = currentTheme;
        const result = await apiSaveSettings(getUsername(), settings);
        if (result.success) {
            pageSettings = settings;
            savePageSettings(settings);
            if (typeof renderSettings === 'function') renderSettings();
            if (typeof updateNavbar === 'function') updateNavbar();
            alert('设置已保存');
        } else {
            alert('保存失败: ' + (result.message || '未知错误'));
        }
    };
}

// ---------- 覆盖关于页保存 ----------
if (typeof saveAboutFromEdit === 'function') {
    const _origSaveAbout = window.saveAboutFromEdit;
    window.saveAboutFromEdit = async function() {
        if (!isOnlineMode || !isLoggedIn()) {
            _origSaveAbout();
            return;
        }
        const about = {
            name: document.getElementById('aboutEditName').value.trim() || '未命名',
            tagline: document.getElementById('aboutEditTagline').value.trim() || '',
            avatar: document.getElementById('aboutEditAvatar').value.trim() || '',
            description: document.getElementById('aboutEditDesc').value.trim() || '',
            skills: profileAbout.skills || [],
            email: document.getElementById('aboutEditEmail').value.trim() || '',
            github: document.getElementById('aboutEditGithub').value.trim() || '',
            zhihu: document.getElementById('aboutEditZhihu').value.trim() || ''
        };
        const result = await apiSaveAbout(getUsername(), about);
        if (result.success) {
            profileAbout = about;
            saveProfileData('about', about);
            if (typeof renderAbout === 'function') renderAbout();
            if (typeof renderHero === 'function') renderHero();
            document.getElementById('about-editor').style.display = 'none';
            alert('关于页已保存');
        } else {
            // API 失败时回退到本地存储，不丢失用户数据
            console.warn('API 保存失败，回退到本地存储:', result.message);
            _origSaveAbout();
        }
    };
}
