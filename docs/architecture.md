# 个人博客网站 - 系统架构文档

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [后端服务器](#3-后端服务器)
4. [数据库设计](#4-数据库设计)
5. [前端架构](#5-前端架构)
6. [API 接口文档](#6-api-接口文档)
7. [主题系统](#7-主题系统)
8. [部署指南](#8-部署指南)
9. [开发指南](#9-开发指南)

---

## 1. 项目概述

一个全栈个人博客网站，支持用户注册登录、文章发布与管理、个人档案管理（竞赛/项目/工作经历）、页面可见性设置、多主题切换等功能。

**技术栈：**

| 层次 | 技术 |
|------|------|
| 后端 | C++17, Linux epoll, 线程池, Socket 编程 |
| 数据库 | MySQL 8.0+ |
| 前端 | 原生 JavaScript (SPA), CSS3 自定义属性 |
| 构建 | CMake |
| 密码 | SHA-256 (OpenSSL) |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────┐
│                  浏览器 (SPA)                     │
│  index.html  app.js  profile-data.js  data.js    │
│  api-client.js  online-integration.js  style.css │
│  themes.css                                      │
└──────────────┬──────────────────────────────────┘
               │ HTTP REST API (JSON)
               ▼
┌─────────────────────────────────────────────────┐
│              C++ HTTP Server (epoll)              │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐   │
│  │ 事件循环  │→│  线程池(Tasks)│→│  响应队列   │   │
│  │ (epoll)  │  │ (Worker 线程) │  │ (send 回传) │   │
│  └─────────┘  └──────┬───────┘  └────────────┘   │
│                      │                            │
│               ┌──────┴───────┐                    │
│               │  Route Handler                    │
│               │  (blog_server.cpp)                │
│               └──────┬───────┘                    │
│                      │                            │
│               ┌──────┴───────┐                    │
│               │  BlogDB (MySQL C API)             │
│               └──────┬───────┘                    │
└──────────────────────┼────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │     MySQL       │
              │     blogdb      │
              │  6 张表         │
              └─────────────────┘
```

### 请求处理流程

```
客户端 HTTP 请求
    │
    ▼
epoll_wait 检测到事件
    │
    ├─ 新连接 → accept4() → 注册到 epoll
    │
    └─ 客户端数据可读 → read() → 解析 HTTP 请求
                              │
                              ▼
                     投递到 Task 队列
                              │
                              ▼
                     Worker 线程取出任务
                              │
                              ▼
                     routeRequest() 分发
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              API 处理函数         静态文件服务
              (JSON 响应)         (HTML/CSS/JS)
                    │                    │
                    └─────────┬──────────┘
                              ▼
                     投递到 Response 队列
                              │
                              ▼
                     事件循环 send() 回客户端
```

---

## 3. 后端服务器

### 3.1 HttpServer (httpserver.h / .cpp)

基于 Linux epoll 边缘触发 (ET) 模式的高并发 HTTP 服务器。

**核心特性：**

| 特性 | 实现 |
|------|------|
| 事件驱动 | epoll ET + 非阻塞 socket |
| 并发模型 | 事件循环线程 + Worker 线程池 |
| 线程池数量 | max(4, CPU核心数 × 2) |
| HTTP 解析 | 手动解析请求行/头部/正文 |
| 静态文件 | 直接读取文件 + MIME 类型映射 |
| CORS | 跨域支持 (Access-Control-Allow-*) |

**配置常量：**

```cpp
constexpr int MAX_EVENTS = 1024;    // epoll 最大事件数
constexpr int BUFFER_SIZE = 8192;   // 读取缓冲区大小
constexpr int MAX_WAIT_TIME_MS = 500; // epoll_wait 超时(已废弃, 硬编码200ms)
```

**路由注册：**

```cpp
server.get("/api/posts", handleGetPosts);
server.post("/api/posts", handleAddPost);
server.del("/api/posts", handleDeletePost);
// 支持 GET / POST / PUT / DELETE
```

### 3.2 BlogDB (blogdb.h / .cpp)

MySQL C API 封装，提供线程安全的数据库操作。

**安全措施：**
- `mysql_real_escape_string` 防 SQL 注入
- `std::mutex` 保证线程安全
- SHA-256 密码哈希（OpenSSL）
- 预处理语句参数化查询

**核心方法：**

| 方法 | 说明 |
|------|------|
| `registerUser()` | 注册新用户（密码哈希后存储） |
| `loginUser()` | 用户登录验证 |
| `addPost()` | 添加文章（自动生成 excerpt） |
| `getPosts()` | 获取用户文章列表 |
| `saveAwards()` | 批量保存竞赛经历（先删后插） |
| `saveProjects()` | 批量保存项目经历 |
| `saveWork()` | 批量保存工作经历 |
| `getPageSettings()` | 获取页面可见性设置 |
| `savePageSettings()` | 保存页面设置（含主题） |

### 3.3 主程序 (blog_server.cpp)

**命令行参数：**

```bash
blog_server [port] [db_host] [db_port] [db_user] [db_pass] [db_name]
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| port | 8080 | HTTP 监听端口 |
| db_host | 127.0.0.1 | MySQL 主机 |
| db_port | 3306 | MySQL 端口 |
| db_user | root | 数据库用户 |
| db_pass | (空) | 数据库密码 |
| db_name | blogdb | 数据库名 |

**信号处理：** SIGINT / SIGTERM → 优雅关闭（停止服务器 → 断开数据库 → exit）。

**静态文件目录：** 自动检测可执行文件所在目录的父目录（例如 `./server/build/blog_server` → 根目录为 `./`）。

---

## 4. 数据库设计

### 4.1 E-R 图

```
users (1) ────── (N) posts
users (1) ────── (N) awards
users (1) ────── (N) projects
users (1) ────── (N) work_experience
users (1) ────── (1) page_settings
users (1) ────── (1) about
```

### 4.2 表结构

#### users - 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) UNIQUE | 用户名 |
| password_hash | VARCHAR(255) | SHA-256 哈希密码 |
| nickname | VARCHAR(100) | 昵称 |
| avatar | VARCHAR(500) | 头像 URL |
| created_at | TIMESTAMP | 注册时间 |

#### posts - 文章表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) FK | 作者 |
| title | VARCHAR(200) | 标题 |
| category | VARCHAR(100) | 分类 |
| tags | TEXT | JSON 数组 ["tag1","tag2"] |
| content | TEXT | Markdown 内容 |
| excerpt | TEXT | 自动生成的摘要(150字) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 (ON UPDATE) |

#### awards - 竞赛经历表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) FK | 所属用户 |
| title | VARCHAR(200) | 竞赛名称 |
| award_rank | VARCHAR(100) | 获奖等级 |
| org | VARCHAR(200) | 主办方 |
| award_date | VARCHAR(50) | 获奖日期 |
| image_url | VARCHAR(500) | 证书图片 |
| description | TEXT | 描述 |

#### projects - 项目表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) FK | 所属用户 |
| title | VARCHAR(200) | 项目名称 |
| tech | TEXT | JSON 数组 ["tech1","tech2"] |
| link | VARCHAR(500) | 项目链接 |
| project_date | VARCHAR(50) | 项目日期 |
| description | TEXT | 描述 |

#### work_experience - 工作经历表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) FK | 所属用户 |
| company | VARCHAR(200) | 公司名称 |
| position | VARCHAR(200) | 职位 |
| period | VARCHAR(100) | 时间段 |
| description | TEXT | 描述 |

#### page_settings - 页面设置表

| 字段 | 类型 | 说明 |
|------|------|------|
| username | VARCHAR(50) PK,FK | 用户名（一对一） |
| home | BOOLEAN | 首页可见 |
| write_page | BOOLEAN | 写文章页可见 |
| archives | BOOLEAN | 归档页可见 |
| awards | BOOLEAN | 竞赛页可见 |
| projects | BOOLEAN | 项目页可见 |
| work | BOOLEAN | 工作页可见 |
| about_page | BOOLEAN | 关于页可见 |
| settings_page | BOOLEAN | 设置页可见 |
| theme | VARCHAR(50) | 主题名称 |

#### about - 关于我资料表

| 字段 | 类型 | 说明 |
|------|------|------|
| username | VARCHAR(50) PK,FK | 用户名（一对一） |
| name | VARCHAR(100) | 显示名称 |
| tagline | VARCHAR(200) | 岗位 / 标语 |
| avatar | VARCHAR(500) | 头像 URL |
| description | TEXT | 个人简介（支持 HTML） |
| skills | TEXT | 技能栈 JSON 数组 |
| email | VARCHAR(100) | 邮箱 |
| github | VARCHAR(200) | GitHub 地址 |
| zhihu | VARCHAR(200) | 知乎地址 |

---

## 5. 前端架构

### 5.1 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | SPA 入口，所有页面模板（首页、写文章、归档、档案、设置、关于） |
| `style.css` | 全局样式，CSS 变量体系，响应式布局 |
| `themes.css` | 5 套主题定义 + 主题选择器样式 |
| `app.js` | 核心逻辑：路由、页面渲染、编辑器、localStorage 操作 |
| `profile-data.js` | 档案数据管理：竞赛/项目/工作/关于的编辑和渲染 |
| `data.js` | 示例数据（离线模式使用） |
| `api-client.js` | API 客户端：封装 fetch 请求，用户状态管理 |
| `online-integration.js` | 在线模式覆盖：登录弹窗、数据同步、覆盖离线函数 |
| `images/` | 本地图片资源目录 |

### 5.2 核心数据流

```
localStorage  ↔  app.js (离线模式)
                     │
API 请求  ←── online-integration.js (在线模式，覆盖同名函数)
               │
               ▼
        api-client.js → fetch → HTTP Server
```

**离线模式：** 无需后端，数据存储在 localStorage，适合本地预览。

**在线模式：** 用户登录后自动切换，数据读写走后端 API。`online-integration.js` 通过同名函数覆盖（`window.xxx = async function() { ... }`）实现无侵入切换。

### 5.3 页面路由（Hash 路由）

| Hash | 页面 | 说明 |
|------|------|------|
| `#home` | 首页 | 博客文章列表、Hero 区域（头像/名称/标语同步自"关于"页） |
| `#write` | 写文章 | Markdown 编辑器、实时预览、标签管理 |
| `#archives` | 归档 | 按时间线展示所有文章 |
| `#awards` | 竞赛 | 竞赛获奖经历展示与编辑 |
| `#projects` | 项目 | 项目展示与编辑 |
| `#work` | 工作 | 工作经历时间线展示与编辑 |
| `#about` | 关于 | 个人信息展示与编辑（头像、名称、简介、技能栈、联系方式） |
| `#settings` | 设置 | 页面可见性开关、主题选择 |

### 5.4 编辑器功能

- **Markdown 实时预览**：输入即预览，支持标题、列表、代码块、引用、图片、链接
- **标签系统**：用中文逗号、顿号或空格分隔
- **文章管理**：发布、编辑、删除（含确认对话框）

---

## 6. API 接口文档

所有接口返回 JSON 格式，支持 CORS。

### 6.1 用户认证

#### POST /api/register

注册新用户。

**请求体：**
```json
{
    "username": "example",
    "password": "123456",
    "nickname": "示例用户"
}
```

**成功响应 (200)：**
```json
{
    "success": true,
    "message": "注册成功",
    "username": "example"
}
```

**错误响应：**
- `400` - 用户名/密码为空或长度不合法
- `409` - 用户名已存在
- `500` - 数据库错误

#### POST /api/login

用户登录。

**请求体：**
```json
{
    "username": "example",
    "password": "123456"
}
```

**成功响应 (200)：**
```json
{
    "success": true,
    "message": "登录成功",
    "user": {
        "username": "example",
        "nickname": "示例用户",
        "avatar": ""
    }
}
```

**错误响应：** `401` - 用户名或密码错误

### 6.2 文章管理

#### GET /api/posts?username=xxx

获取用户文章列表（省略 username 参数则返回全部文章）。

**响应：**
```json
{
    "posts": [
        {
            "id": 1,
            "title": "文章标题",
            "date": "2026-05-26",
            "category": "技术",
            "tags": ["C++", "Linux"],
            "excerpt": "这是摘要...",
            "content": "完整内容...",
            "author": "example"
        }
    ]
}
```

#### POST /api/posts

发布新文章。

**请求体：**
```json
{
    "username": "example",
    "title": "文章标题",
    "category": "技术",
    "tags": ["C++", "Linux"],
    "content": "Markdown 内容..."
}
```

**响应：**
```json
{
    "success": true,
    "post": { "id": 1, "title": "...", ... }
}
```

#### DELETE /api/posts?username=xxx&id=123

删除文章。

**响应：**
```json
{ "success": true, "message": "删除成功" }
```

### 6.3 竞赛经历

#### GET /api/awards?username=xxx

获取竞赛经历列表。

#### POST /api/awards?username=xxx

批量保存竞赛经历（先删除原数据，再批量插入）。

**请求体：**
```json
[
    {
        "id": 0,
        "title": "全国大学生程序设计竞赛",
        "rank": "一等奖",
        "org": "教育部",
        "date": "2025-12",
        "image": "",
        "desc": "比赛描述"
    }
]
```

### 6.4 项目经历

#### GET /api/projects?username=xxx

#### POST /api/projects?username=xxx

批量保存项目经历，格式同上。

### 6.5 工作经历

#### GET /api/work?username=xxx

#### POST /api/work?username=xxx

批量保存工作经历，格式同上。

### 6.6 页面设置

#### GET /api/settings?username=xxx

```json
{
    "settings": {
        "home": true,
        "write": true,
        "archives": true,
        "awards": true,
        "projects": true,
        "work": true,
        "about": true,
        "settings": true,
        "theme": "default"
    }
}
```

#### POST /api/settings?username=xxx

保存页面设置。

```json
{
    "home": true,
    "write": false,
    "theme": "dark"
}
```

---

## 7. 主题系统

### 7.1 主题列表

| 主题名称 | CSS 类名 | 风格描述 |
|----------|----------|----------|
| 默认 | `.theme-default` (无类名) | 蓝色主调，白色背景 |
| 暗黑 | `.theme-dark` | 深色背景，蓝色强调 |
| 森林 | `.theme-forest` | 绿色主调，自然柔和 |
| 日落 | `.theme-sunset` | 橙色主调，温暖 |
| 海洋 | `.theme-ocean` | 青色主调，清新 |

### 7.2 实现原理

通过 CSS 自定义属性（变量）实现：

```css
/* 默认主题 (style.css) */
:root {
    --primary: #5b7fff;
    --bg: #f4f6fa;
    --text: #1a1a2e;
    /* ... */
}

/* 暗黑主题 (themes.css) */
html.theme-dark {
    --primary: #7c9aff;
    --bg: #0f1117;
    --text: #e4e6f0;
    /* ... */
}
```

切换方式：`document.documentElement.className = 'theme-dark'`。

主题选择器在设置页面中，以 5 个彩色圆点展示，点击即时切换，设置保存在 localStorage 和服务器端。

---

## 8. 部署指南

### 8.1 Ubuntu 16.04 部署

```bash
# 1. 安装依赖
sudo apt-get update
sudo apt-get install -y libmysqlclient-dev libssl-dev cmake g++-7 mysql-server

# 2. 设置 g++-7 为默认
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 100 \
    --slave /usr/bin/g++ g++ /usr/bin/g++-7

# 3. 初始化数据库
mysql -u root < server/sql/init.sql

# 4. 编译服务器
cd server
mkdir -p build && cd build
cmake .. && make -j$(nproc)

# 5. 运行服务器
./blog_server 8080 127.0.0.1 3306 root "" blogdb

# 6. 浏览器访问
# http://<VM_IP>:8080
```

### 8.2 系统要求

- **操作系统**：Linux (推荐 Ubuntu 16.04+ / CentOS 7+)
- **编译器**：g++ 7+ (需要 C++17 支持)
- **CMake**：3.10+
- **MySQL**：5.7+ (text 字段不支持 DEFAULT 值)
- **依赖库**：libmysqlclient-dev, libssl-dev

### 8.3 生产部署建议

- 使用 `nohup` 或 `systemd` 保持后台运行
- 如需对外访问，将 MySQL 绑定地址改为 `0.0.0.0`
- 建议配置防火墙（iptables）限制访问
- 前端可通过 Nginx 反向代理，实现域名访问和 HTTPS

---

## 9. 开发指南

### 9.1 本地开发环境（Windows）

项目最初在 Windows 上开发，服务器部分使用了 MSVC 编译器和 Windows IOCP。当前版本已迁移至 Linux epoll，若需在 Windows 本地开发前端：

```bash
# 使用任意 HTTP 服务器托管前端文件
python3 -m http.server 8080
# 或
npx serve .
```

### 9.2 添加新页面

1. 在 `index.html` 中添加新的 `page-xxx` 容器
2. 在 `app.js` 的 `renderPage()` 中添加新页面路由
3. 在 `style.css` 中添加样式
4. 在 `profile-data.js` 或 `online-integration.js` 中添加数据逻辑
5. 在 `page_settings` 表中添加可见性控制字段

### 9.3 添加新主题

1. 在 `themes.css` 中添加 `html.theme-xxx { ... }` 定义 CSS 变量覆盖
2. 在 `index.html` 设置页面的主题选择器中添加新的 `.theme-option`
3. 在 `profile-data.js` 的 `applyTheme()` 中确认兼容

### 9.4 添加新 API

1. 在 `blog_server.cpp` 中编写处理函数 `HttpResponse handleXxx(const HttpRequest&)`
2. 在 `main()` 中注册路由：`server.get("/api/xxx", handleXxx);`
3. 在 `blogdb.h/cpp` 中添加对应的数据库操作方法
4. 在 `api-client.js` 中添加封装函数
5. 在 `online-integration.js` 中添加在线模式调用
