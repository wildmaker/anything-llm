# 功能开发清单

## 左侧侧边栏
- 🟢 访问根目录http://127.0.0.1:3000/时，左侧侧边栏应该正常显示
- 🟢 访问根路径http://127.0.0.1:3000/时应自动重定向到默认工作区
- 🟢 LobeNavBar 按钮 hover 状态应该有背景色
  > hover 状态背景色：
  > - light 主题：rgba(0, 0, 0, 0.03)
  > - dark 主题：rgba(255, 255, 255, 0.1)
- 🟢 LobeNavBar 聊天按钮选中状态应该有背景色（只要路由中是～/workspace/[slug]格式的都应该保持）LobeNavBar 中的chat按钮是选中状态
  > 选中状态背景色：
  > - light 主题：rgba(0, 0, 0, 0.03)
  > - dark 主题：rgba(255, 255, 255, 0.1)
  > 
  > 选中状态时背景的尺寸参考：
  > - border-radius: 8px
  > - height: 44px
  > - width: 44px
- 🟢 LobeNavBar 顶部不是 link，是一个用户头像，参考 lobe chat 项目的 avatar 样式。底部没有边框分割线
  - 🟢 UserAvatar 组件和下方的NavItem 之间没有边框或者分割线
  - 🟢 头像应该是圆形框
- 🟢 LobeNavBar 不应包含files、profile、plus按钮
- 🟢 侧边栏（frontend/src/components/Sidebar）的顶部工具栏高度需要与 chatheader 组件的高度对齐
- 🔴 侧边栏的 workspace 卡片列表样式
  - 🟢 workspace 卡片下方不应该有 thread 列表
  - 🟢 history dialog 里切换 thread 记录
    - 🟢 history dialog 里只应该暂时当前这个workspace的聊天记录
    - 🟢 每个 thread 下拉列表中应该默认包含新建thread 按钮
    - 🟢 只有一个默认线程时，不显示"暂无线程"空状态位置
  - 🔴 卡片样式不一致
    - 🟢 light 模式下侧边栏背景色应为白色
      - 🟢 所有会话界面的背景色已调整为rgb(248, 248, 248)
      - 🟢 最右侧文件列表的背景色已调整为rgb(248, 248, 248)
    - 🟢 卡片高度最低 70px，应该适当调整内边距
    - 🟢 标题文字的样式参考：
      ```css
      .order-box {
        color: rgb(8, 8, 8);
        color-scheme: light;
        cursor: pointer;
        display: inline;
        font-family: "HarmonyOS Sans", "Segoe UI", "SF Pro Display", -apple-system, "system-ui", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif, "HarmonyOS Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "Source Han Sans CN", sans-serif, "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji";
        font-feature-settings: "cv01", "tnum", "kern";
        font-size: 14px;
        font-variation-settings: normal;
        font-weight: 500;
        height: auto;
        line-height: 16.8px;
        list-style-image: none;
        list-style-position: outside;
        list-style-type: none;
        overflow-wrap: break-word;
        scrollbar-color: rgba(0, 0, 0, 0.12) rgba(0, 0, 0, 0);
        scrollbar-width: thin;
        text-rendering: optimizelegibility;
        text-size-adjust: 100%;
      }
      ```
    - 🟢 工作区列表标题右侧仅保留折叠收起按钮，不显示编辑或新建按钮
    - 🟢 每个工作区卡片左侧显示工作区 avatar
    - 🟢 每个工作区卡片的设置和上传按钮应该移动到 chatheader 内，放在 thread 下拉列表旁边。
    - 🔴 每个工作区卡片的 dotsthree 组件移动到卡片内最右侧，与右边框保持一定边距。
## 聊天窗口
- 🔴 聊天输入框样式优化
  - 🟢 输入框和聊天记录中间有空白区域 
  - 🟢 整个输入框上下左右填充chatcontainer 下方所有区域，不再保留哪边距
  - 🟢 鼠标 hover 在输入框时，在上边框显示拖拽按钮
  - 🟢 鼠标 hover 在输入框上边框时，上边框调整为黑色，暗示可以拖拽
    - 🟢 边框宽度应保持1px，避免过粗影响视觉效果
    - 🟢 hover触发区域应限制在上边框附近10px范围内，避免误触发
    - 🟢 应该是hover时原本的边框变色，而不是新增新的边框
  - 🟢 在输入框上边框按住鼠标可以将输入框上边框向上或者向下拖拽，从而调整输入框整体容器的高度。
    - 🟢 拖拽时鼠标指针应变为上下箭头样式 (cursor: ns-resize)
    - 🟢 拖拽时边框颜色应保持高亮状态，提供视觉反馈
    - 🟢 输入框高度应有最小值（105px）和最大值（窗口高度的50%）限制
    - 🟢 拖拽过程中应实时更新输入框高度，确保平滑过渡
    - 🟢 调整后的高度应当保存在localStorage中，下次打开应用时恢复上次设置
  - 🟢 拖拽调整输入框高度时，最小高度 170px
  - 🟢 输入框的工具栏和输入组件上下位置互换
  - 🟢 输入框默认高度 170px
  - 🟢 输入框的输入区域一直在输入框的顶部,textarea 充满输入框下方空间
  - 🟢 Bug：输入较多时，文本被截断了。（查看html代码 textarea 元素有一个 64px 高度）
  - 🟢 内容超出区域时，显示滚动条（浅灰色）。并支持输入区域滚动，
  - 🟢 文本过长时，下方文字过于靠近屏幕下边框，因此需要在输入框预留一个安全区，大概 40px
  -  🟢 输入框文本输入区域默认不展示滚动条，只有内容溢出时才暂时
  - 🟢 输入框工具栏的 SpeechToText 按钮需要移动到工具栏左侧
  - 🟢 输入框与聊天记录界面的背景色相同
  - 🟢 最右侧文件列表组件的背景色与左侧侧边栏背景色相同
  - 🔴 添加更多格式化工具按钮（粗体、斜体、代码等）
  - 🔴 发送按钮需要添加下拉菜单选项
  - 🔴 输入框底部需要调整为浅灰色背景，与输入区域有明显分隔
  - 🔴 表情符号按钮需要添加到输入框中
  - 🟢 输入框在hover和focus状态应有不同的视觉反馈
- 🔴 消息列表组件
  - 🟢 消息列表宽度有点小
  - 🟢 参考 lobechat 的用户侧的气泡样式，优化本项目的用户侧的气泡样式（但还是尽可能继承前端原框架）
  - 🟢 用户侧的消息气泡样式已实现
    - 实现样式：
      ```css
      background-color: rgb(255, 255, 255);
      border-radius: 8px;
      max-width: 100%;
      overflow-wrap: break-word;
      overflow: hidden;
      padding: 8px 12px;
      ```
- 🔴 AI 响应流式显示
- 🔴 对话历史记录 
- 🔴 上下文管理

## 文档侧边栏组件 DocumentFileSidebar
- ✅ 增加右侧栏布局，能在聊天界面中查看到右侧栏
  - 测试2 🟢：新建聊天会话后右侧栏可见
  - 测试3 🟢：右侧栏与聊天窗口平级布局
  - 测试4 🟢：右侧栏正确显示关联知识库内容
  - 测试5 🔴：侧边栏样式和组件样式与 Instant-AI 的右侧栏样式一致
- ✅ 创建基础文件结构
- ✅ 实现侧边栏布局和样式
- ✅ 实现关闭按钮功能
- ✅ 实现搜索文件功能
- ✅ 实现文件列表折叠/展开功能
- ✅ 实现文件卡片显示逻辑
- 🟢 当文件列表为空时，DocumentFileSidebar 宽度应该保持不变
- 🟢 文件列表标题栏的默认封面是facebook 蓝色背景，中间 icon 绘制一个 3D cube 的icon SVG，体现智能化
- 🟢 文件列表标题栏标题下方增加创建人姓名和头像
- 🟢 文件列表标题栏移除最右侧的分享按钮
- 🟢 文档列表项卡片样式优化
  - 🟢 封面图：56x56px，圆角6px；
  - 🟢 如果没有获取到文件的封面，就按文件类型展示 icon，背景浅灰色
    - 🟢 按文件类型展示时，封面中不展示类型文字，只有icon
  - 🟢 卡片hover 的时候封面背景色太浅了，尝试加深一点
  - 🟢 统一文件类型标签为系统现有的浅灰色标签样式
  - 🟢 字体和间距参考下述要求修改（但尽可能继承现有前端规范）：
      - 标题：18px，粗体
      - 用户名：14px
      - 描述：12px
      - 文档标题：14px
      - 类型标签：12px
      - 用户信息内间距：5-10px
      - 用户信息与搜索框间距：20px
      - 搜索框与文档列表间距：10px
      - 文档项之间间距：10px
      - 文档项内间距：5-10px
  - 🟢 文档列表项右侧的第二行文字下边框应该与左侧封面下边框对齐。也就是两行文字上下分布两端\

## 顶部导航栏 chatheader
- 🟢 隐藏最右侧的 action icon Clock 组件
- 🟢 action icon 的 FileText 组件调整 icon，表达的意思是折叠/收起侧边栏的意思
- 🟢 去掉默认workspace的 chatheader 中 thread 下拉列表左侧的"默认"标记
- 🟢 将chatheader左侧的 upload 按钮移动到DocumentFileSidebar上方标题栏内，替换ShareNetwork 按钮

### ChatHeader 组件改进
- 🟢 测试1：显示聊天会话的工作区名称
- 🔴 测试4：添加历史对话按钮
- 🔴 测试5：知识库切换功能

## 开发原则
1. **参考优先原则**
   - 前端开发时优先参考 lobe-chat 项目实现
   - 后端开发时优先参考 anything-llm 原版实现
   - 保持高精度复刻，利用已验证的解决方案

2. **测试驱动原则**
   - 🔴 表示未通过测试
   - 🟢 表示测试通过
   - ✅ 表示功能已完成

3. **协作流程**
   - 开发人员实现后提交给产品设计师测试
   - 产品设计师验收通过后标记为已完成
   - 每个功能都必须经过测试验证才进入下一步

*最后更新: 2024-03-26*