# 个人博客网站 - 使用说明

## 目录

1. [环境要求](#1-环境要求)
2. [快速启动](#2-快速启动)
3. [注册与登录](#3-注册与登录)
4. [文章管理](#4-文章管理)
5. [Markdown 语法参考](#5-markdown-语法参考)
6. [个人档案管理](#6-个人档案管理)
7. [页面设置](#7-页面设置)
8. [主题切换](#8-主题切换)
9. [离线模式](#9-离线模式)
10. [常见问题](#10-常见问题)

---

## 1. 环境要求

### 1.1 软件依赖

- **操作系统**: Windows 10/11 或 Linux
- **MySQL**: 5.7 或 8.0（默认端口 3306）
- **浏览器**: Chrome / Firefox / Edge 等现代浏览器（支持 ES6）

### 1.2 编译环境（仅首次运行需要）

**Windows (MSVC)**:
- Visual Studio 2019+（含 C++ CMake 工具）
- MySQL Connector/C（libmysql.dll 及其头文件）
- CMake 3.10+

**Linux (GCC)**:
```bash
sudo apt install g++ cmake libmysqlclient-dev libssl-dev
```

### 1.3 数据库准备

确保 MySQL 服务正在运行，然后创建数据库并初始化表结构：

```sql
CREATE DATABASE IF NOT EXISTS blogdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blogdb;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    tags TEXT,
    content LONGTEXT,
    excerpt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 竞赛表
CREATE TABLE IF NOT EXISTS awards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    award_rank VARCHAR(100),
    org VARCHAR(255),
    award_date VARCHAR(20),
    image_url VARCHAR(500),
    description TEXT
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    tech TEXT,
    link VARCHAR(500),
    project_date VARCHAR(20),
    description TEXT
);

-- 工作经历表
CREATE TABLE IF NOT EXISTS work_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    company VARCHAR(255),
    position VARCHAR(255),
    period VARCHAR(100),
    description TEXT
);

-- 页面设置表
CREATE TABLE IF NOT EXISTS page_settings (
    username VARCHAR(50) PRIMARY KEY,
    home BOOLEAN DEFAULT TRUE,
    write_page BOOLEAN DEFAULT TRUE,
    archives BOOLEAN DEFAULT TRUE,
    awards BOOLEAN DEFAULT TRUE,
    projects BOOLEAN DEFAULT TRUE,
    work BOOLEAN DEFAULT TRUE,
    about_page BOOLEAN DEFAULT TRUE,
    settings_page BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'default'
);

-- 关于我表
CREATE TABLE IF NOT EXISTS about (
    username VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    tagline VARCHAR(200),
    avatar VARCHAR(500),
    description TEXT,
    skills TEXT,
    email VARCHAR(100),
    github VARCHAR(200),
    zhihu VARCHAR(200)
);
```

该脚本会创建 `blogdb` 数据库及 7 张表。

---

## 2. 快速启动

### 2.1 编译服务器

**Windows**（在项目根目录下双击 `start.bat` 即可自动完成编译和启动）:

```bash
# 或者手动执行：
cd server
cmake -S . -B build
cmake --build build --config Release
cd build\Release
blog_server.exe
```

**Linux**:
```bash
cd server
cmake -S . -B build
cmake --build build
./build/blog_server
```

### 2.2 启动服务器

编译完成后，运行 `blog_server`（或 `blog_server.exe`）：

```
服务端默认监听端口: 8080
数据库连接默认: 127.0.0.1:3306, 用户名 lyc, 密码 123456789
```

看到以下输出表示启动成功：

```
MySQL connected to 127.0.0.1:3306/blogdb
HttpServer started on port 8080
```

### 2.3 访问网站

打开浏览器，访问 `http://localhost:8080`。

---

## 3. 注册与登录

### 3.1 首次使用

1. 打开网站后，页面右上角显示"离线模式"和"登录"按钮
2. 点击"登录"按钮，弹出登录/注册对话框
3. 点击底部的"注册账号"切换到注册模式
4. 输入用户名、密码和昵称（昵称可选，不填则默认使用用户名）
5. 点击"注册"完成注册
6. 注册成功后会自动登录并刷新页面

### 3.2 登录

1. 点击右上角"登录"按钮
2. 输入用户名和密码
3. 点击"登录"（或在密码输入框按回车）
4. 登录成功后页面刷新，右上角显示用户名和"退出"按钮

### 3.3 退出登录

点击右上角的"退出"按钮即可退出当前账号，页面刷新后回到离线模式。

### 3.4 注意事项

- 用户名不能重复，重复注册会提示错误
- 密码长度不限，但建议不少于 6 位
- 登录状态保存在浏览器本地，关闭浏览器后重新打开仍会保持登录

---

## 4. 文章管理

### 4.1 写文章

1. 确保已登录（右上角显示用户名）
2. 点击导航栏的"写文章"
3. 填写以下内容：
   - **标题**: 文章标题（必填）
   - **分类**: 文章所属分类（必填）
   - **标签**: 标签之间用空格、逗号、中文逗号或顿号分隔
   - **内容**: 使用 Markdown 语法编写文章正文（必填），支持完整的 GitHub Flavored Markdown（GFM）语法，包括表格、任务列表、代码块、删除线等
4. 右侧预览区会实时显示 Markdown 渲染效果
5. 点击"发布文章"按钮提交

> 编辑器基于 `marked` 库实现，支持标准 Markdown + GFM 扩展语法。详细语法参考见下一章。

### 4.2 编辑文章

1. 在"文章"或"归档"页面找到要编辑的文章
2. 点击文章卡片上的"编辑"按钮
3. 页面跳转到编辑器，文章原有内容自动填入
4. 修改后点击"更新文章"保存

### 4.3 删除文章

1. 在"文章"或"归档"页面找到要删除的文章
2. 点击文章卡片上的"删除"按钮
3. 在弹出的确认对话框中点击"确定"
4. 文章被永久删除，不可恢复

> 在线模式下删除操作直接作用于服务器数据库；离线模式下删除仅影响本地缓存。

### 4.4 查看文章

- **文章列表**: 在首页或"文章"页面浏览所有文章卡片
- **归档视图**: 在"归档"页面按时间倒序查看文章，每篇文章显示摘要
- **文章详情**: 点击文章标题进入阅读模式，可查看文章完整内容、分类、标签和发表日期

---

## 5. Markdown 语法参考

编辑器支持以下 Markdown 语法（基于 `marked` 库，兼容 GFM）：

### 5.1 基础语法

| 语法 | 写法 | 效果 |
|------|------|------|
| 一级标题 | `# 标题` | **标题** |
| 二级标题 | `## 标题` | **标题** |
| 三级标题 | `### 标题` | **标题** |
| 粗体 | `**文字**` | **文字** |
| 斜体 | `*文字*` | *文字* |
| 删除线 | `~~文字~~` | ~~文字~~ |
| 链接 | `[文本](url)` | [文本](url) |
| 图片 | `![alt](url)` | 显示图片 |
| 行内代码 | \`代码\` | `代码` |
| 引用 | `> 引用内容` | 引用样式块 |
| 无序列表 | `- 项目` | 圆点列表 |
| 有序列表 | `1. 项目` | 数字列表 |
| 分割线 | `---` | 水平线 |

### 5.2 代码块

使用三个反引号包裹代码块，可指定语言实现语法高亮：

````
```javascript
function hello() {
    console.log("Hello World");
}
```
````

### 5.3 表格

```
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |
```

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |

### 5.4 任务列表

```
- [x] 已完成的任务
- [ ] 未完成的任务
```

- [x] 已完成的任务
- [ ] 未完成的任务

### 5.5 嵌套列表

```
- 一级
  - 二级
    - 三级
```

### 5.6 组合使用示例

```markdown
## 项目介绍

本项目是一个**个人博客系统**，支持以下*核心功能*：

- 文章管理（撰写、编辑、删除）
- Markdown 渲染（基于 `marked` 库）
- 多用户支持

> 更多信息请访问[项目主页](https://example.com)

| 功能 | 状态 |
|------|------|
| 文章 | 已完成 |
| 评论 | 开发中 |

代码示例：

```javascript
console.log("Hello World");
```
```

---

## 6. 个人档案管理

个人档案包含竞赛经历、项目经历、工作经历三个模块，均支持在线编辑并保存到服务器。

### 6.1 竞赛经历

1. 确保已登录
2. 点击导航栏的"竞赛经历"
3. 点击"编辑"按钮进入编辑模式
4. 每行包含以下字段：
   - **竞赛名称**: 赛事全称
   - **奖项等级**: 如一等奖、金奖等
   - **主办单位**: 组织方名称
   - **获奖时间**: 日期
   - **封面图片链接**: 可选，证书或奖状图片 URL
   - **描述**: 可选，补充说明
5. 可添加多行、删除行、拖拽排序
6. 点击"保存"提交到服务器

### 6.2 项目经历

1. 确保已登录
2. 点击导航栏的"项目经历"
3. 点击"编辑"按钮进入编辑模式
4. 每行包含以下字段：
   - **项目名称**: 项目标题
   - **技术栈**: 使用的技术，用逗号/空格分隔
   - **项目链接**: 可选，项目地址 URL
   - **时间**: 项目周期
   - **描述**: 项目简介
5. 点击"保存"提交

### 6.3 工作经历

1. 确保已登录
2. 点击导航栏的"工作经历"
3. 点击"编辑"按钮进入编辑模式
4. 每行包含以下字段：
   - **公司名称**
   - **职位**
   - **时间**: 在职时间
   - **描述**: 工作内容
5. 点击"保存"提交

> 重要提示: 在线模式下编辑的内容会保存到服务器数据库；切换账号后不会互相干扰。离线模式下编辑的内容仅保存在本地浏览器，不同设备之间不会同步。

### 6.4 关于我

关于页面支持编辑头像、名称、岗位标语、个人简介、技能栈和联系方式。编辑保存后，**首页的头像、名称和标语会自动同步更新**。

1. 确保已登录（离线模式下也可编辑，数据保存在本地）
2. 点击导航栏的"关于"
3. 点击"编辑"按钮进入编辑模式
4. 可编辑以下内容：
   - **头像 URL**: 头像图片链接，支持网络图片或本地图片（放入 `images/` 目录，填写 `/images/文件名.jpg`）
   - **名称**: 你的名字，保存后首页同步显示
   - **岗位 / 标语**: 如"全栈开发者 / 终身学习者"，保存后首页同步显示
   - **简介**: 支持 HTML 格式的个人介绍，首页显示纯文本版本
   - **技能栈**: 输入技能名称后点击"添加"，点击技能标签上的 ✕ 可删除
   - **邮箱**: 联系邮箱
   - **GitHub**: GitHub 地址
   - **知乎**: 知乎地址
5. 点击"保存"提交，刷新页面后数据不丢失，首页同步更新

---

## 7. 页面设置

### 7.1 页面可见性

在"设置"页面，可以通过复选框控制导航栏中各页面的显示/隐藏：

- **首页**: 控制文章列表页是否显示
- **写文章**: 控制编辑器入口是否显示
- **归档**: 控制归档页面是否显示
- **竞赛经历**: 控制竞赛经历模块是否显示
- **项目经历**: 控制项目经历模块是否显示
- **工作经历**: 控制工作经历模块是否显示
- **关于**: 控制关于页面是否显示
- **设置**: 控制设置页面入口是否显示

### 7.2 保存设置

勾选或取消勾选后，点击"保存"按钮提交。在线模式下设置会保存到服务器；离线模式下仅保存在本地。

### 7.3 注意事项

- 如果隐藏了"设置"页面入口，需要清除浏览器 localStorage 或在 URL 后加 `#settings` 恢复访问
- 建议至少保留"首页"可见

---

## 8. 主题切换

### 8.1 可用主题

网站内置 5 套主题：

| 主题名称 | 特点 |
|---------|------|
| 默认 | 蓝白配色，简洁清晰 |
| 暗夜 | 深色背景，适合夜间阅读 |
| 森林 | 绿色系，护眼舒适 |
| 日落 | 暖橙色，温馨柔和 |
| 海洋 | 蓝青色，清爽通透 |

### 8.2 切换主题

- 在"设置"页面的主题选择器中点击对应主题
- 选择后立即生效并可预览效果
- 点击"保存"使主题设置持久化

---

## 9. 离线模式

### 9.1 什么是离线模式

未登录状态下，网站以离线模式运行。所有数据存储在浏览器的 localStorage 中，不涉及服务器交互。

### 9.2 离线模式的功能

离线模式下仍然可以使用大部分功能：
- 写文章、编辑文章、删除文章
- 管理竞赛/项目/工作经历
- 切换主题
- 调整页面设置

### 9.3 离线模式的限制

- 数据仅保存在当前浏览器，清除浏览器数据会丢失
- 不同设备之间无法同步
- 无法在其他浏览器中查看离线数据

### 9.4 从离线切换到在线

注册并登录账号后，服务器上已有的数据会自动加载到本地并覆盖本地缓存。如果服务器上没有数据（新账号），本地的离线数据仍然可用。

---

## 10. 常见问题

### 10.1 服务器无法启动

**现象**: `blog_server.exe` 闪退或报错

**排查步骤**:
1. 确认 MySQL 服务正在运行
2. 确认数据库 `blogdb` 已创建，表结构已初始化
3. 确认 MySQL 用户名和密码正确（默认 lyc / 123456789）
4. 检查端口 8080 是否被占用：`netstat -ano | findstr 8080`

### 10.2 连接数据库失败

**现象**: 启动日志显示 "MySQL connect failed"

**可能原因**:
- MySQL 服务未启动
- 用户名或密码错误
- MySQL 端口不是 3306

**解决办法**: 修改 `blog_server.cpp` 中的数据库连接参数并重新编译。

### 10.3 页面显示异常

**现象**: 页面错乱、样式失效

**可能原因**:
- 浏览器缓存了旧的 CSS/JS 文件
- 使用了不兼容的浏览器

**解决办法**: 按 Ctrl+F5 强制刷新页面，或清除浏览器缓存。

### 10.4 登录后数据为空

**现象**: 登录成功后文章列表/档案为空

**原因**: 新注册的账号服务器上没有数据，这是正常现象。登录后可以手动添加数据，下次登录时会自动加载。

### 10.5 切换账号后数据残留

**现象**: 登录账号 B 后看到账号 A 的数据

**原因**: 本地缓存未刷新

**解决办法**: 刷新页面即可。如果问题持续，清除浏览器 localStorage 后重新登录。

### 10.6 文章内容丢失

**现象**: 编辑中的文章内容突然消失

**建议**: 在编辑长文章时，定期手动保存内容到本地文本文件。当前版本不提供自动保存草稿功能。

### 10.7 Markdown 不生效

**现象**: 编辑器预览区与最终显示效果不一致，或某些 Markdown 语法没有效果

**可能原因**:
- 浏览器缓存了旧的 `marked.min.js` 或 `app.js`
- 网络问题导致 `marked.min.js` 未加载

**解决办法**: 按 Ctrl+F5 强制刷新页面。如果仍未解决，确认 `marked.min.js` 文件存在于项目根目录（约 40KB），或者重新下载到本地。
