# Frontend Guidelines

## Fonts

### 主要字体系统
- **主要字体族**: Plus Jakarta Sans
- **备用字体**: UI Sans Serif, System UI, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif
- **图标文本字体**: Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji

### 字体粗细
- **常规文本**: 400 (regular)
- **强调文本**: 500 (medium)
- **标题和按钮**: 600 (semibold)
- **重点标题**: 700 (bold)

### 字体大小
- **基础大小**: 16px (1rem)
- **小型文本**: 0.875rem (14px)
- **超小文本**: 0.75rem (12px)
- **微型文本**: 0.625rem (10px)
- **大型文本**: 1.125rem (18px)
- **标题文本**: 1.25rem-2rem (20px-32px)

### 行高和字间距
- **正文行高**: 1.5
- **标题行高**: 1.2
- **紧凑型文本行高**: 1.25
- **字间距**: 正常 (0)，标题可能使用 -0.02em 的更紧凑间距

### 使用规则
- 所有界面文本使用主要字体族
- 代码片段和终端输出使用等宽字体
- 保持字体一致性，避免在同一界面使用多种字体
- 移动设备上文本大小可能需要调整以保证可读性

## Color Palette

### 主题颜色系统
项目采用深色主题为默认设置，也支持浅色主题切换。

### 深色主题 (默认)
- **背景色**: 
  - 主要背景: `#0e0f0f` (--theme-bg-primary)
  - 次要背景: `#1b1b1e` (--theme-bg-secondary)
  - 侧边栏背景: `#0e0f0f` (--theme-bg-sidebar)
  - 聊天区域背景: `#1b1b1e` (--theme-bg-chat)
  - 输入框背景: `#27282a` (--theme-bg-chat-input)

- **文本色**:
  - 主要文本: `#ffffff` (--theme-text-primary)
  - 次要文本: `rgba(255, 255, 255, 0.6)` (--theme-text-secondary)

- **强调色**:
  - 主要按钮: `#46c8ff` (--theme-button-primary)
  - 主要按钮悬停: `#434343` (--theme-button-primary-hover)
  - CTA按钮: `#7cd4fd` (--theme-button-cta)

- **边框色**:
  - 侧边栏边框: `rgba(255, 255, 255, 0.1)` (--theme-sidebar-border)
  - 输入框边框: `#525355` (--theme-chat-input-border)
  - 模态框边框: `#3f3f42` (--theme-modal-border)

- **状态色**:
  - 成功: `#05603A`
  - 警告: `#854708`
  - 错误: `#B42318`
  - 危险: `#F04438`

### 浅色主题 (更新后)
- **背景色**: 
  - 主要背景: `#ffffff` (--theme-bg-primary)
  - 次要背景: `#ffffff` (--theme-bg-secondary)
  - 侧边栏背景: `#ffffff` (--theme-bg-sidebar)
  - 聊天区域背景: `#f8f8f8` (--theme-bg-chat)
  - 输入框背景: `#f2f5fa` (--theme-bg-chat-input)

- **文本色**:
  - 主要文本: `#1f2937` (--theme-text-primary)
  - 次要文本: `#4b5563` (--theme-text-secondary)

- **强调色**:
  - 主要按钮: `#1e40af` (--theme-button-primary)
  - 主要按钮悬停: `#2563eb` (--theme-button-primary-hover)
  - CTA按钮: `#2563eb` (--theme-button-cta)

- **边框色**:
  - 侧边栏边框: `#e5e7eb` (--theme-sidebar-border)
  - 输入框边框: `#dce0e8` (--theme-chat-input-border)
  - 模态框边框: `#e5e7eb` (--theme-modal-border)

- **交互元素**:
  - 侧边栏项目默认: `#f3f4f6` (--theme-sidebar-item-default)
  - 侧边栏项目悬停: `#e5e7eb` (--theme-sidebar-item-hover)
  - 侧边栏项目选中: `#dbeafe` (--theme-sidebar-item-selected)
  - 侧边栏线程选中: `#bfdbfe` (--theme-sidebar-thread-selected)
  - 侧边栏子项目悬停: `#eff6ff` (--theme-sidebar-subitem-hover)

- **其他UI元素**:
  - 设置输入背景: `#f9fafb` (--theme-settings-input-bg)
  - 文件行偶数行: `#f8f8f8` (--theme-file-row-even)
  - 文件行奇数行: `#f8f8f8` (--theme-file-row-odd)
  - 文件行选中状态: `rgba(37, 99, 235, 0.1)` (--theme-file-row-selected-even)

### 渐变色
项目使用多种线性渐变效果:
- **主要渐变**: `linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)`
- **侧边栏渐变**: `linear-gradient(90deg, #5B616A 0%, #3F434B 100%)`
- **选中项渐变**: `linear-gradient(90deg, #5B616A 0%, #3F434B 100%)`

### 主题色设计原则

1. **统一的色彩系统**：使用蓝色作为主要强调色，不同深浅的蓝色表示不同的交互状态。

2. **增强对比度**：提高文本与背景的对比度，改善可读性和可访问性。

3. **现代化界面**：采用更加柔和、现代的颜色，告别过于鲜艳或老旧的色调。

4. **一致性**：确保所有UI元素采用一致的色彩语言，提升整体用户体验。

5. **层次感**：通过不同的色彩深浅，创造清晰的视觉层次。

### 主题色应用效果

新的主题色系统在以下方面带来明显改善：

- **专业感**：更加沉稳、专业的色彩系统，适合企业用户使用。
- **可用性**：更好的对比度和更清晰的视觉提示，提高用户操作效率。
- **一致性**：整个应用程序保持一致的设计语言，减少用户认知负担。
- **易于上手**：符合现代用户界面设计惯例，用户可以更快上手。

### 后续优化方向

- **暗色主题优化**：基于同样的设计原则，优化暗色主题的颜色系统。
- **添加更多颜色主题**：考虑添加更多可选的颜色主题，满足不同用户的偏好。
- **提升配色一致性**：继续检查所有UI组件，确保颜色应用的一致性。
- **用户测试反馈**：收集用户反馈，进一步优化色彩系统，提升用户体验。

## Spacing & Layout Rules

### 间距系统
项目使用 Tailwind CSS 的间距系统，基于 4px 的倍数:
- **超小间距 (xs)**: 0.25rem (4px)
- **小间距 (sm)**: 0.5rem (8px)
- **中间距 (md)**: 1rem (16px)
- **大间距 (lg)**: 1.5rem (24px)
- **超大间距 (xl)**: 2rem (32px)
- **特大间距 (2xl)**: 3rem (48px)

### 布局规则
- **容器最大宽度**: 1280px
- **内容区域边距**: 左右使用 1rem-2rem 的边距
- **组件间距**: 组件之间通常使用 1rem-1.5rem 的间距
- **卡片内边距**: 通常使用 1rem 的内边距

### 响应式断点
项目遵循 Tailwind CSS 的断点设置:
- **sm**: 640px (小型设备，如手机)
- **md**: 768px (中型设备，如平板)
- **lg**: 1024px (大型设备，如笔记本)
- **xl**: 1280px (超大型设备，如桌面电脑)
- **2xl**: 1536px (特大型设备)

### 垂直节奏
- 页面元素遵循垂直节奏，使用一致的间距和对齐
- 标题与内容之间通常使用 0.5rem-1rem 的间距
- 段落之间使用 1rem 的间距
- 区块之间使用 2rem-3rem 的间距

## Preferred UI Library or Framework

### 核心框架
- **前端框架**: React 18
- **构建工具**: Vite
- **样式系统**: Tailwind CSS

### 主要UI组件库
- **基础组件**: 项目使用自定义组件库
- **图表组件**: Tremor (`@tremor/react`)
- **工具提示**: React Tooltip
- **通知系统**: React Toastify
- **加载状态**: React Loading Skeleton

### 主题配置
- 使用 CSS 变量实现主题切换
- 深色主题作为默认主题
- 通过 `data-theme="light"` 属性切换到浅色主题

### 组件开发规范
- 组件应当自包含，具有明确的责任边界
- 优先使用函数式组件和 React Hooks
- 复杂状态管理通过 Context API 实现
- 使用自定义钩子抽象常用逻辑

### 性能考虑
- 使用 React.memo 减少不必要的重渲染
- 大型列表使用虚拟化技术
- 延迟加载非关键组件
- 避免不必要的状态更新

## Icon Set

### 图标库
- 项目使用 Phosphor Icons (`@phosphor-icons/react`)
- 提供一致的图标风格和多种变体

### 图标大小
- **小型图标**: 16px × 16px
- **标准图标**: 20px × 20px
- **大型图标**: 24px × 24px
- **特大图标**: 32px × 32px

### 图标颜色
- 通常使用当前文本颜色 (`currentColor`)
- 可以使用特定颜色以表示状态或强调
- 浅色主题下图标颜色通常较深
- 深色主题下图标颜色通常较浅

### 常用图标
项目使用以下常见图标:
- `<BookOpen />`: 文档和帮助
- `<DiscordLogo />`: Discord社区链接
- `<GithubLogo />`: GitHub仓库链接
- `<Envelope />`: 电子邮件联系
- `<LinkSimple />`: 外部链接
- `<HouseLine />`: 主页导航
- `<Globe />`: 网站链接
- `<Briefcase />`: 企业/工作相关
- `<Info />`: 信息提示
- `<Plus />`: 添加操作
- `<X />`: 关闭/删除操作

### 图标使用指南
- 保持项目内图标风格一致
- 为图标添加适当的 aria 标签以增强可访问性
- 交互式图标应有悬停状态反馈
- 同一区域内的图标大小应统一

## 参考资源和实现指南

### 参考项目源码
- **AnythingLLM 原始项目**: `/Users/wildmaker/Documents/Projects/anything-llm-original`
- **Lobe Chat 项目**: `/Users/wildmaker/Documents/Projects/lobe-chat`

### 官方文档与资源
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 官方文档](https://reactjs.org/docs/getting-started.html)
- [Vite 构建工具文档](https://vitejs.dev/guide/)
- [Phosphor Icons 图标库](https://phosphoricons.com/)
- [Tremor 组件库文档](https://www.tremor.so/docs/getting-started/installation)

### 实现原则与工作流程

#### 优先学习与复用开源项目
- **保持学习心态**：本项目大量参考开源项目，实现功能时应优先检查参考项目是否已有相关实现
- **高精度复刻**：参考已验证过的开源代码比从头实现效率更高

#### 前端开发指南
- 实现每个前端功能时，优先检查 Lobe Chat 是否已有相关实现
- 分析其代码结构、组件设计和实现逻辑
- 适当调整以符合 AnythingLLM 的设计规范
- 保持视觉和交互一致性

#### 设计元素参考位置
- 颜色系统：参考 `anything-llm/frontend/src/index.css` 中的 CSS 变量
- 字体设置：参考 `anything-llm/frontend/tailwind.config.js` 中的 fontFamily 配置
- 组件样式：参考 `anything-llm/frontend/src/components` 目录下的组件实现
- 响应式布局：参考 Tailwind 类名和媒体查询使用方式

#### 代码实现标准
- 遵循 ESLint 和 Prettier 配置的代码风格
- 保持组件命名一致性和文件组织结构
- 确保新增功能与已有代码风格和架构保持一致