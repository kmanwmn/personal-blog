/* ============================================
   博客交互逻辑
   ============================================ */

// ---------- DOM 引用（通用） ----------
const postsList = document.getElementById('posts-list');
const archivesContent = document.getElementById('archives-content');
const modalOverlay = document.getElementById('post-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modalClose');

const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// ---------- DOM 引用（编辑器） ----------
const editTitle = document.getElementById('editTitle');
const editCategory = document.getElementById('editCategory');
const editTags = document.getElementById('editTags');
const editContent = document.getElementById('editContent');
const editPreview = document.getElementById('editPreview');
const btnPublish = document.getElementById('btnPublish');
const btnClear = document.getElementById('btnClear');
const editorTabs = document.querySelectorAll('.editor-tab');
const savedPostsList = document.getElementById('saved-posts-list');

let editingPostId = null;

// ============================================
//   页面显示设置
// ============================================

function applyPageSettings() {
    navLinks.forEach(link => {
        const pageId = link.dataset.page;
        if (pageSettings[pageId] === false) {
            link.style.display = 'none';
        } else {
            link.style.display = '';
        }
    });
    pages.forEach(page => {
        const pageId = page.id.replace('page-', '');
        if (pageSettings[pageId] === false) {
            page.style.display = 'none';
        } else {
            page.style.display = '';
        }
    });
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const activeId = activePage.id.replace('page-', '');
        if (pageSettings[activeId] === false) {
            switchPage('home');
        }
    }
}

function renderSettings() {
    const container = document.getElementById('settings-page-list');
    if (!container) return;
    let html = '';
    for (const key in pageSettingsKeys) {
        const setting = pageSettingsKeys[key];
        const isChecked = pageSettings[key] !== false;
        const disabled = setting.alwaysShow ? 'disabled' : '';
        html += `
            <div class="setting-item">
                <span class="setting-item-label">
                    <span class="emoji">${setting.label.split(' ')[0]}</span>
                    ${setting.label}
                    ${setting.alwaysShow ? '<span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px">(必显示)</span>' : ''}
                </span>
                <label class="toggle-switch">
                    <input type="checkbox" data-setting-key="${key}" ${isChecked ? 'checked' : ''} ${disabled}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    }
    container.innerHTML = html;

    // Update theme selector
    updateThemeSelector();
}

function updateThemeSelector() {
    const selector = document.getElementById('themeSelector');
    if (!selector) return;
    const options = selector.querySelectorAll('.theme-option');
    options.forEach(opt => {
        const theme = opt.dataset.theme;
        opt.classList.toggle('active', theme === currentTheme);
        opt.onclick = function() {
            selectTheme(theme);
        };
    });
}

function selectTheme(theme) {
    applyTheme(theme);
    pageSettings.theme = theme;
    updateThemeSelector();
    savePageSettings(pageSettings);
}

function saveSettings() {
    const checkboxes = document.querySelectorAll('#settings-page-list input[type="checkbox"]');
    checkboxes.forEach(cb => {
        const key = cb.dataset.settingKey;
        if (!pageSettingsKeys[key]?.alwaysShow) {
            pageSettings[key] = cb.checked;
        }
    });
    pageSettings.theme = currentTheme;
    savePageSettings(pageSettings);
    applyPageSettings();
    applyTheme(currentTheme);
    alert('✅ 设置已保存！');
}

// ============================================
//   竞赛经历
// ============================================

function renderAwards() {
    const container = document.getElementById('awards-content');
    if (!container) return;
    if (!profileAwards || profileAwards.length === 0) {
        container.innerHTML = '<div class="empty-state"><p style="font-size:2rem;margin-bottom:8px">🏆</p><p>暂无竞赛经历</p></div>';
        return;
    }
    let html = '';
    profileAwards.forEach(award => {
        const imgHtml = award.image
            ? `<img src="${award.image}" alt="${award.title}">`
            : '<div class="img-placeholder">🏆</div>';
        html += `
            <div class="award-card" data-id="${award.id}">
                <div class="award-card-img-wrapper" onclick="changeAwardImage(${award.id})" title="点击更换图片">
                    ${imgHtml}
                </div>
                <div class="award-card-info">
                    <div class="award-card-title">
                        ${award.title}
                        ${award.rank ? `<span class="award-card-rank">${award.rank}</span>` : ''}
                    </div>
                    <div class="award-card-org">${award.org}</div>
                    <div class="award-card-date">${award.date}</div>
                    <div class="award-card-desc">${award.desc}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function changeAwardImage(id) {
    const award = profileAwards.find(a => a.id === id);
    if (!award) return;
    const url = prompt('请输入图片URL（支持网络图片链接）：', award.image || 'https://');
    if (url !== null) {
        award.image = url;
        saveProfileData('awards', profileAwards);
        renderAwards();
        renderAwardsEdit();
    }
}

function renderAwardsEdit() {
    const container = document.getElementById('awards-edit-list');
    if (!container) return;
    let html = '';
    profileAwards.forEach(award => {
        html += `
            <div class="edit-row">
                <div class="edit-row-header">
                    <span class="edit-row-title">${escapeHtml(award.title) || '新竞赛'}</span>
                    <button class="edit-row-remove" onclick="removeAward(${award.id})">🗑️ 删除</button>
                </div>
                <div class="edit-field">
                    <label>标题</label>
                    <input type="text" value="${escapeHtml(award.title)}" data-award-id="${award.id}" data-field="title">
                </div>
                <div class="edit-field">
                    <label>获奖等级</label>
                    <input type="text" value="${escapeHtml(award.rank || '')}" data-award-id="${award.id}" data-field="rank">
                </div>
                <div class="edit-field">
                    <label>组织方</label>
                    <input type="text" value="${escapeHtml(award.org)}" data-award-id="${award.id}" data-field="org">
                </div>
                <div class="edit-field">
                    <label>日期</label>
                    <input type="text" value="${escapeHtml(award.date)}" data-award-id="${award.id}" data-field="date">
                </div>
                <div class="edit-field">
                    <label>图片URL</label>
                    <input type="text" value="${escapeHtml(award.image || '')}" data-award-id="${award.id}" data-field="image" placeholder="留空则显示默认图标">
                </div>
                <div class="edit-field">
                    <label>描述</label>
                    <textarea rows="3" data-award-id="${award.id}" data-field="desc">${escapeHtml(award.desc)}</textarea>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function saveAwardsFromEdit() {
    const rows = document.querySelectorAll('#awards-edit-list .edit-row');
    rows.forEach(row => {
        const id = parseInt(row.querySelector('[data-award-id]').dataset.awardId);
        const award = profileAwards.find(a => a.id === id);
        if (!award) return;
        row.querySelectorAll('[data-field]').forEach(el => {
            award[el.dataset.field] = el.value;
        });
    });
    saveProfileData('awards', profileAwards);
    renderAwards();
    alert('✅ 竞赛经历已保存！');
}

function removeAward(id) {
    if (!confirm('确定要删除这条竞赛经历吗？')) return;
    profileAwards = profileAwards.filter(a => a.id !== id);
    saveProfileData('awards', profileAwards);
    renderAwards();
    renderAwardsEdit();
}

function addAward() {
    const maxId = profileAwards.reduce((max, a) => Math.max(max, a.id), 0);
    profileAwards.push({ id: maxId + 1, title: '新竞赛', rank: '', org: '', date: '', image: '', desc: '' });
    renderAwardsEdit();
}

// ============================================
//   项目经历
// ============================================

function renderProjects() {
    const container = document.getElementById('projects-content');
    if (!container) return;
    if (!profileProjects || profileProjects.length === 0) {
        container.innerHTML = '<div class="empty-state"><p style="font-size:2rem;margin-bottom:8px">💻</p><p>暂无项目经历</p></div>';
        return;
    }
    let html = '';
    profileProjects.forEach(project => {
        const techHtml = (project.tech || []).map(t => `<span class="project-card-tech-tag">${t}</span>`).join('');
        const linkHtml = project.link ? `<a href="${project.link}" class="project-card-link" target="_blank" rel="noopener">🔗 查看</a>` : '';
        html += `
            <div class="project-card">
                <div class="project-card-header">
                    <span class="project-card-title">${project.title}</span>
                    ${linkHtml}
                </div>
                <div class="project-card-tech">${techHtml}</div>
                <div class="project-card-desc">${project.desc}</div>
                <div class="project-card-date">${project.date}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderProjectsEdit() {
    const container = document.getElementById('projects-edit-list');
    if (!container) return;
    let html = '';
    profileProjects.forEach(project => {
        html += `
            <div class="edit-row">
                <div class="edit-row-header">
                    <span class="edit-row-title">${escapeHtml(project.title) || '新项目'}</span>
                    <button class="edit-row-remove" onclick="removeProject(${project.id})">🗑️ 删除</button>
                </div>
                <div class="edit-field">
                    <label>项目名称</label>
                    <input type="text" value="${escapeHtml(project.title)}" data-project-id="${project.id}" data-field="title">
                </div>
                <div class="edit-field">
                    <label>技术栈（逗号分隔）</label>
                    <input type="text" value="${escapeHtml((project.tech || []).join(', '))}" data-project-id="${project.id}" data-field="tech">
                </div>
                <div class="edit-field">
                    <label>项目链接</label>
                    <input type="text" value="${escapeHtml(project.link || '')}" data-project-id="${project.id}" data-field="link" placeholder="https://...">
                </div>
                <div class="edit-field">
                    <label>时间范围</label>
                    <input type="text" value="${escapeHtml(project.date)}" data-project-id="${project.id}" data-field="date" placeholder="如：2024.01 - 2024.06">
                </div>
                <div class="edit-field">
                    <label>描述</label>
                    <textarea rows="3" data-project-id="${project.id}" data-field="desc">${escapeHtml(project.desc)}</textarea>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function saveProjectsFromEdit() {
    const rows = document.querySelectorAll('#projects-edit-list .edit-row');
    rows.forEach(row => {
        const id = parseInt(row.querySelector('[data-project-id]').dataset.projectId);
        const project = profileProjects.find(p => p.id === id);
        if (!project) return;
        row.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            if (field === 'tech') {
                project.tech = el.value.split(/[,，、\s]+/).filter(t => t.trim());
            } else {
                project[field] = el.value;
            }
        });
    });
    saveProfileData('projects', profileProjects);
    renderProjects();
    alert('✅ 项目经历已保存！');
}

function removeProject(id) {
    if (!confirm('确定要删除这个项目吗？')) return;
    profileProjects = profileProjects.filter(p => p.id !== id);
    saveProfileData('projects', profileProjects);
    renderProjects();
    renderProjectsEdit();
}

function addProject() {
    const maxId = profileProjects.reduce((max, p) => Math.max(max, p.id), 0);
    profileProjects.push({ id: maxId + 1, title: '新项目', tech: [], link: '', date: '', desc: '' });
    renderProjectsEdit();
}

// ============================================
//   工作经历
// ============================================

function renderWork() {
    const container = document.getElementById('work-content');
    if (!container) return;
    if (!profileWork || profileWork.length === 0) {
        container.innerHTML = '<div class="empty-state"><p style="font-size:2rem;margin-bottom:8px">💼</p><p>暂无工作经历</p></div>';
        return;
    }
    let html = '';
    profileWork.forEach(work => {
        html += `
            <div class="work-card">
                <div class="work-card-timeline">
                    <div class="work-card-period">${work.period}</div>
                </div>
                <div class="work-card-info">
                    <div class="work-card-company">${work.company}</div>
                    <div class="work-card-position">${work.position}</div>
                    <div class="work-card-desc">${work.desc}</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderWorkEdit() {
    const container = document.getElementById('work-edit-list');
    if (!container) return;
    let html = '';
    profileWork.forEach(work => {
        html += `
            <div class="edit-row">
                <div class="edit-row-header">
                    <span class="edit-row-title">${escapeHtml(work.company) || '新公司'}</span>
                    <button class="edit-row-remove" onclick="removeWork(${work.id})">🗑️ 删除</button>
                </div>
                <div class="edit-field">
                    <label>公司名称</label>
                    <input type="text" value="${escapeHtml(work.company)}" data-work-id="${work.id}" data-field="company">
                </div>
                <div class="edit-field">
                    <label>职位</label>
                    <input type="text" value="${escapeHtml(work.position)}" data-work-id="${work.id}" data-field="position">
                </div>
                <div class="edit-field">
                    <label>时间周期</label>
                    <input type="text" value="${escapeHtml(work.period)}" data-work-id="${work.id}" data-field="period" placeholder="如：2024.07 - 2024.10">
                </div>
                <div class="edit-field">
                    <label>描述</label>
                    <textarea rows="3" data-work-id="${work.id}" data-field="desc">${escapeHtml(work.desc)}</textarea>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function saveWorkFromEdit() {
    const rows = document.querySelectorAll('#work-edit-list .edit-row');
    rows.forEach(row => {
        const id = parseInt(row.querySelector('[data-work-id]').dataset.workId);
        const work = profileWork.find(w => w.id === id);
        if (!work) return;
        row.querySelectorAll('[data-field]').forEach(el => {
            work[el.dataset.field] = el.value;
        });
    });
    saveProfileData('work', profileWork);
    renderWork();
    alert('✅ 工作经历已保存！');
}

function removeWork(id) {
    if (!confirm('确定要删除这条工作经历吗？')) return;
    profileWork = profileWork.filter(w => w.id !== id);
    saveProfileData('work', profileWork);
    renderWork();
    renderWorkEdit();
}

function addWork() {
    const maxId = profileWork.reduce((max, w) => Math.max(max, w.id), 0);
    profileWork.push({ id: maxId + 1, company: '新公司', position: '职位', period: '', desc: '' });
    renderWorkEdit();
}

// ============================================
//   关于我
// ============================================

function renderAbout() {
    const container = document.getElementById('about-content');
    if (!container) {
        console.warn('renderAbout: #about-content not found!');
        return;
    }
    const ab = profileAbout;
    console.log('renderAbout: name=', ab.name, 'tagline=', ab.tagline, 'email=', ab.email);
    const avatarHtml = ab.avatar
        ? `<img src="${ab.avatar}" alt="头像">`
        : '<div class="img-placeholder" style="width:100px;height:100px;border-radius:50%;background:var(--border-color);display:flex;align-items:center;justify-content:center;font-size:2rem">👤</div>';
    const skillsHtml = (ab.skills && ab.skills.length > 0)
        ? ab.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')
        : '<p style="color:var(--text-muted)">暂无</p>';
    container.innerHTML = `
        <div class="about-card-inner">
            <div class="about-avatar">${avatarHtml}</div>
            <h3>${escapeHtml(ab.name)}</h3>
            <p class="about-tagline">${escapeHtml(ab.tagline)}</p>
            <div class="about-text">${ab.description || ''}</div>
            <h4>🛠️ 技能栈</h4>
            <div class="skills">${skillsHtml}</div>
            <h4>📬 联系我</h4>
            <div class="contact-info">
                <p>📧 Email: ${ab.email ? escapeHtml(ab.email) : '未设置'}</p>
                <p>🐱 GitHub: ${ab.github ? escapeHtml(ab.github) : '未设置'}</p>
                <p>💡 知乎: ${ab.zhihu ? escapeHtml(ab.zhihu) : '未设置'}</p>
            </div>
        </div>`;
}

function renderHero() {
    const ab = profileAbout;
    const avatarImg = document.getElementById('heroAvatar');
    const nameSpan = document.getElementById('heroName');
    const subP = document.getElementById('heroSubtitle');
    const descP = document.getElementById('heroDesc');
    if (avatarImg && ab.avatar) avatarImg.src = ab.avatar;
    if (nameSpan) nameSpan.textContent = ab.name || '未命名';
    if (subP) subP.textContent = ab.tagline || '';
    if (descP) descP.textContent = ab.description ? ab.description.replace(/<[^>]*>/g, '') : '';
}

function renderAboutEdit() {
    const ab = profileAbout;
    document.getElementById('aboutEditAvatar').value = ab.avatar || '';
    document.getElementById('aboutEditName').value = ab.name || '';
    document.getElementById('aboutEditTagline').value = ab.tagline || '';
    document.getElementById('aboutEditDesc').value = ab.description || '';
    document.getElementById('aboutEditEmail').value = ab.email || '';
    document.getElementById('aboutEditGithub').value = ab.github || '';
    document.getElementById('aboutEditZhihu').value = ab.zhihu || '';
    renderAboutSkillsEdit();
}

function renderAboutSkillsEdit() {
    const container = document.getElementById('aboutEditSkills');
    if (!container) return;
    const skills = profileAbout.skills || [];
    container.innerHTML = skills.length === 0
        ? '<span style="color:var(--text-muted);font-size:0.9rem">暂无技能，请在下方添加</span>'
        : skills.map((s, i) =>
            `<span class="skill-tag" style="cursor:pointer" onclick="removeAboutSkill(${i})" title="点击删除">${escapeHtml(s)} ✕</span>`
          ).join('');
}

function saveAboutFromEdit() {
    const ab = profileAbout;
    ab.avatar = document.getElementById('aboutEditAvatar').value.trim();
    ab.name = document.getElementById('aboutEditName').value.trim() || '未命名';
    ab.tagline = document.getElementById('aboutEditTagline').value.trim() || '';
    ab.description = document.getElementById('aboutEditDesc').value.trim() || '';
    ab.email = document.getElementById('aboutEditEmail').value.trim() || '';
    ab.github = document.getElementById('aboutEditGithub').value.trim() || '';
    ab.zhihu = document.getElementById('aboutEditZhihu').value.trim() || '';
    // skills are already updated in profileAbout.skills array
    saveProfileData('about', profileAbout);
    renderAbout();
    renderHero();
    document.getElementById('about-editor').style.display = 'none';
}

function addAboutSkill() {
    const input = document.getElementById('aboutSkillInput');
    const skill = input.value.trim();
    if (!skill) return;
    if (!profileAbout.skills) profileAbout.skills = [];
    if (profileAbout.skills.includes(skill)) { alert('该技能已存在'); return; }
    profileAbout.skills.push(skill);
    input.value = '';
    renderAboutSkillsEdit();
}

function removeAboutSkill(idx) {
    if (!profileAbout.skills || idx < 0 || idx >= profileAbout.skills.length) return;
    profileAbout.skills.splice(idx, 1);
    renderAboutSkillsEdit();
}

// ============================================
//   通用辅助函数
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================
//   Markdown & 文章相关
// ============================================

function parseMarkdown(md) {
    if (!md || !md.trim()) return '';
    let html = md;
    var savedBlocks = [];

    // 1. 代码块 - 替换为占位符，同时内部内容做 HTML 转义
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function(m, lang, code) {
        var langAttr = lang ? ' class="language-' + lang + '"' : '';
        var safe = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var key = '%%BLOCK_' + savedBlocks.length + '%%';
        savedBlocks.push('<pre><code' + langAttr + '>' + safe + '</code></pre>');
        return key;
    });

    // 2. 引用 - 替换为占位符，同时内容做 HTML 转义
    html = html.replace(/^>\s?(.+)$/gm, function(m, content) {
        var safe = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var key = '%%BLOCK_' + savedBlocks.length + '%%';
        savedBlocks.push('<blockquote><p>' + safe + '</p></blockquote>');
        return key;
    });

    // 3. HTML 转义剩余文本
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 4. 还原保护块
    for (var i = 0; i < savedBlocks.length; i++) {
        html = html.replace('%%BLOCK_' + i + '%%', savedBlocks[i]);
    }

    // 5. 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 6. 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // 7. 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // 8. 删除线
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 9. 粗体和斜体
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 10. 标题
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // 11. 分隔线
    html = html.replace(/^-{3,}$/gm, '<hr>');

    // 12. 无序列表 & 任务列表（合并避免 <li> 标签冲突）
    html = html.replace(/((?:^- .+\n?)+)/gm, function(m) {
        var items = m.trim().split('\n').map(function(line) {
            var content = line.replace(/^-\s*/, '');
            var taskMatch = content.match(/^\[(x| )\]\s*(.*)/i);
            if (taskMatch) {
                var checked = taskMatch[1].toLowerCase() === 'x' ? ' checked' : '';
                return '<li><input type="checkbox"' + checked + ' disabled> ' + taskMatch[2] + '</li>';
            }
            return '<li>' + content + '</li>';
        }).join('\n');
        return '<ul>\n' + items + '\n</ul>\n';
    });

    // 13. 有序列表
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, function(m) {
        var items = m.trim().split('\n').map(function(line) {
            return '<li>' + line.replace(/^\d+\.\s*/, '') + '</li>';
        }).join('\n');
        return '<ol>\n' + items + '\n</ol>\n';
    });

    // 14. 表格（GFM 风格）
    html = html.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm, function(m, headerLine, bodyLines) {
        var headers = headerLine.split('|').map(function(h) { return h.trim(); }).filter(function(h) { return h; });
        var rows = bodyLines.trim().split('\n').map(function(row) {
            var cells = row.split('|').map(function(c) { return c.trim(); }).filter(function(c) { return c; });
            return '<tr>' + cells.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }).join('');
        return '<table><thead><tr>' + headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
    });

    // 15. 段落包裹
    var lines = html.split('\n');
    var result = '';
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        if (line.indexOf('<h') === 0 || line.indexOf('<li') === 0 || line.indexOf('<ul') === 0 ||
            line.indexOf('<ol') === 0 || line.indexOf('<pre') === 0 || line.indexOf('<blockquote') === 0 ||
            line.indexOf('<hr') === 0 || line.indexOf('<table') === 0 || line.indexOf('<thead') === 0 ||
            line.indexOf('<tbody') === 0 || line.indexOf('<tr') === 0 || line.indexOf('<th') === 0 ||
            line.indexOf('<td') === 0 || line.indexOf('</ul') === 0 || line.indexOf('</ol') === 0 ||
            line.indexOf('</pre') === 0 || line.indexOf('</blockquote') === 0 || line.indexOf('</table') === 0 ||
            line.indexOf('<img') === 0 || line.indexOf('<p') === 0 || line.indexOf('</p') === 0) {
            result += line + '\n';
            continue;
        }
        result += '<p>' + line + '</p>\n';
    }
    return result.trim();
}

function updatePreview() {
    const md = editContent.value;
    if (!md.trim()) {
        editPreview.innerHTML = '<div class="preview-placeholder">🖊️ 在编辑器中写点内容，预览会实时显示在这里</div>';
        return;
    }
    editPreview.innerHTML = `<div class="article-body">${parseMarkdown(md)}</div>`;
}

function clearEditor() {
    if (!confirm('确定要清空当前编辑内容吗？')) return;
    editTitle.value = '';
    editCategory.value = '';
    editTags.value = '';
    editContent.value = '';
    editPreview.innerHTML = '<div class="preview-placeholder">🖊️ 在编辑器中写点内容，预览会实时显示在这里</div>';
    editingPostId = null;
    btnPublish.textContent = '发布文章';
}

function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function generateExcerpt(content) {
    const plain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 150 ? plain.slice(0, 150) + '...' : plain;
}

function publishPost() {
    const title = editTitle.value.trim();
    const category = editCategory.value.trim();
    const tagsStr = editTags.value.trim();
    const content = editContent.value.trim();
    if (!title) { alert('请输入文章标题！'); editTitle.focus(); return; }
    if (!content) { alert('请输入文章内容！'); editContent.focus(); return; }
    if (!category) { alert('请输入文章分类！'); editCategory.focus(); return; }

    const tags = tagsStr ? tagsStr.split(/[,，、\s]+/).filter(t => t.trim()) : [];
    const excerpt = generateExcerpt(parseMarkdown(content));
    const tagsHtml = tags.map(t => `<span class="article-tag">${t}</span>`).join('');
    const contentHtml = `
        <div class="article-header">
            <span class="article-category">${category}</span>
            <h1 class="article-title">${title}</h1>
            <div class="article-meta">
                <span>📅 ${getToday()}</span>
                <span class="article-tags">${tagsHtml}</span>
            </div>
        </div>
        <div class="article-body">${parseMarkdown(content)}</div>`;

    if (editingPostId !== null) {
        const idx = blogPosts.findIndex(p => p.id === editingPostId);
        if (idx !== -1) blogPosts[idx] = { ...blogPosts[idx], title, date: getToday(), category, tags, excerpt, content: contentHtml };
        editingPostId = null;
        btnPublish.textContent = '发布文章';
    } else {
        blogPosts.push({ id: generateId(), title, date: getToday(), category, tags, excerpt, content: contentHtml });
    }
    savePostsToStorage();
    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderPosts(); renderArchives(); renderSavedPosts();
    editTitle.value = ''; editCategory.value = ''; editTags.value = ''; editContent.value = '';
    editPreview.innerHTML = '<div class="preview-placeholder">🖊️ 在编辑器中写点内容，预览会实时显示在这里</div>';
    alert('✅ 文章发布成功！');
}

function loadPostToEditor(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;
    const savedRaw = localStorage.getItem('raw_' + id);
    editingPostId = id;
    editTitle.value = post.title;
    editCategory.value = post.category;
    editTags.value = post.tags.join(', ');
    // 优先使用 localStorage 保存的原始 Markdown，否则尝试直接用 post.content（在线模式下存的是原始 Markdown）
    editContent.value = savedRaw || (post.content && post.content.indexOf('<') === -1 ? post.content : '');
    updatePreview();
    btnPublish.textContent = '更新文章';
    switchPage('write');
}

function deletePost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;
    if (!confirm(`确定要删除《${post.title}》吗？此操作不可恢复！`)) return;
    blogPosts = blogPosts.filter(p => p.id !== id);
    savePostsToStorage();
    localStorage.removeItem('raw_' + id);
    renderPosts(); renderArchives(); renderSavedPosts();
    alert('🗑️ 文章已删除');
}

function renderSavedPosts() {
    const userPosts = blogPosts.filter(p => p.id > 1000);
    if (userPosts.length === 0) {
        savedPostsList.innerHTML = '<div class="empty-state"><p style="font-size:2rem;margin-bottom:8px">📝</p><p>你还没有发布过文章，去"写文章"页面发布第一篇吧！</p></div>';
        return;
    }
    let html = '';
    userPosts.forEach(post => {
        html += `<div class="saved-post-item">
            <div class="saved-post-info">
                <h4>${post.title}</h4>
                <div class="saved-post-meta">
                    <span>📅 ${post.date}</span>
                    <span>🏷️ ${post.category}</span>
                    <span>🏷️ ${post.tags.slice(0,3).join(', ')}</span>
                </div>
            </div>
            <div class="saved-post-actions">
                <button class="btn btn-outline" onclick="loadPostToEditor(${post.id})">✏️ 编辑</button>
                <button class="btn btn-danger" onclick="deletePost(${post.id})">🗑️ 删除</button>
            </div>
        </div>`;
    });
    savedPostsList.innerHTML = html;
}

function renderPosts() {
    let html = '';
    blogPosts.forEach(post => {
        const tagsHtml = post.tags.slice(0, 3).map(t => `<span class="post-card-tag">${t}</span>`).join('');
        html += `<article class="post-card" data-id="${post.id}">
            <span class="post-card-category">${post.category}</span>
            <h3 class="post-card-title">${post.title}</h3>
            <p class="post-card-excerpt">${post.excerpt}</p>
            <div class="post-card-meta">
                <span class="post-card-date">📅 ${post.date}</span>
                <div class="post-card-tags">${tagsHtml}</div>
            </div>
        </article>`;
    });
    postsList.innerHTML = html;
    postsList.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => { openPost(parseInt(card.dataset.id)); });
    });
}

function renderArchives() {
    const yearMap = {};
    blogPosts.forEach(post => {
        const year = post.date.slice(0, 4);
        if (!yearMap[year]) yearMap[year] = [];
        yearMap[year].push(post);
    });
    const years = Object.keys(yearMap).sort((a, b) => b - a);
    let html = '';
    years.forEach(year => {
        html += `<div class="archive-year">${year}</div>`;
        yearMap[year].forEach(post => {
            html += `<a class="archive-item" data-id="${post.id}">
                <span class="archive-item-date">${post.date.slice(5)}</span>
                <span class="archive-item-title">${post.title}</span>
                <span class="archive-item-category">${post.category}</span>
            </a>`;
        });
    });
    archivesContent.innerHTML = html;
    archivesContent.querySelectorAll('.archive-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openPost(parseInt(item.dataset.id));
        });
    });
}

function openPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;
    // 检查内容是否已渲染为 HTML（旧版离线文章），否则当作原始 Markdown 解析
    if (post.content && post.content.indexOf('<div class="article-body">') === -1) {
        modalContent.innerHTML = '<div class="article-body">' + parseMarkdown(post.content) + '</div>';
    } else {
        modalContent.innerHTML = post.content;
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function switchPage(pageId) {
    pages.forEach(page => page.classList.toggle('active', page.id === `page-${pageId}`));
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pageId === 'write') renderSavedPosts();
    if (pageId === 'awards') renderAwards();
    if (pageId === 'projects') renderProjects();
    if (pageId === 'work') renderWork();
    if (pageId === 'about') renderAbout();
    if (pageId === 'settings') renderSettings();
}

// ============================================
//   事件绑定
// ============================================

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(link.dataset.page);
    });
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

editContent.addEventListener('input', updatePreview);

editorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        editorTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById('editorPane').classList.toggle('active', target === 'editor');
        document.getElementById('previewPane').classList.toggle('active', target === 'preview');
    });
});

btnPublish.addEventListener('click', publishPost);
btnClear.addEventListener('click', clearEditor);

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        publishPost();
    }
});

// 竞赛编辑切换
document.getElementById('awardsToggleEdit')?.addEventListener('click', () => {
    const editor = document.getElementById('awards-editor');
    const show = editor.style.display === 'none';
    editor.style.display = show ? 'block' : 'none';
    if (show) renderAwardsEdit();
});

// 项目编辑切换
document.getElementById('projectsToggleEdit')?.addEventListener('click', () => {
    const editor = document.getElementById('projects-editor');
    const show = editor.style.display === 'none';
    editor.style.display = show ? 'block' : 'none';
    if (show) renderProjectsEdit();
});

// 工作编辑切换
document.getElementById('workToggleEdit')?.addEventListener('click', () => {
    const editor = document.getElementById('work-editor');
    const show = editor.style.display === 'none';
    editor.style.display = show ? 'block' : 'none';
    if (show) renderWorkEdit();
});

// 关于编辑切换
document.getElementById('aboutToggleEdit')?.addEventListener('click', () => {
    const editor = document.getElementById('about-editor');
    const show = editor.style.display === 'none';
    editor.style.display = show ? 'block' : 'none';
    if (show) renderAboutEdit();
});

// 添加按钮
document.getElementById('awardsAddItem')?.addEventListener('click', addAward);
document.getElementById('projectsAddItem')?.addEventListener('click', addProject);
document.getElementById('workAddItem')?.addEventListener('click', addWork);

// 关于技能添加
document.getElementById('aboutAddSkill')?.addEventListener('click', addAboutSkill);
document.getElementById('aboutSkillInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addAboutSkill();
});

// 保存按钮
document.querySelectorAll('.save-profile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (type === 'awards') saveAwardsFromEdit();
        if (type === 'projects') saveProjectsFromEdit();
        if (type === 'work') saveWorkFromEdit();
        if (type === 'about') saveAboutFromEdit();
    });
});

// 设置保存
document.getElementById('settingsSaveBtn')?.addEventListener('click', saveSettings);

// ============================================
//   初始化
// ============================================
applyTheme(currentTheme);
applyPageSettings();
renderPosts();
renderArchives();
renderAwards();
renderProjects();
renderWork();
renderAbout();
renderHero();
renderSavedPosts();
renderSettings();

console.log('🎉 博客加载成功！');
console.log(`📝 共 ${blogPosts.length} 篇文章`);
console.log('💡 支持 Ctrl+S 快捷键发布文章');