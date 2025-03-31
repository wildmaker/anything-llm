# Tech Stack Documentation

## Packages & Dependencies

### 前端技术栈
- **基础框架**: React (如 package.json 中所示)
- **类型系统**: TypeScript (从 devDependencies 中的 @types 依赖可见)
- **UI组件**: 使用 Tremor (@tremor/react) 和自定义组件
- **状态管理**: 主要使用 React 内置状态管理
- **路由**: React Router (react-router-dom)
- **构建工具**: Vite (基于 vite.config.js)
- **样式**: Tailwind CSS (基于 tailwind.config.js)
- **国际化**: i18next 和 react-i18next

### 后端技术栈
- **运行时环境**: Node.js (>=18.12.1，基于 package.json)
- **Web框架**: Express.js
- **API**: RESTful API + WebSocket (@mintplex-labs/express-ws)
- **数据库**: 
  - SQLite (默认)
  - 支持 PostgreSQL (可选配置)
- **向量数据库**: 
  - LanceDB (默认)
  - 支持多种向量数据库选项 (Chroma, Pinecone, Weaviate, Qdrant, Milvus, Zilliz, Astra DB)
- **身份验证**: JWT (jsonwebtoken)
- **后台作业管理**: Bree (@mintplex-labs/bree)

### AI 核心
- **LLM集成**: 
  - 支持多种外部大模型 API (OpenAI, Anthropic, Azure, Gemini, Mistral等)
  - 支持本地部署的大模型 (Ollama, LocalAI, LMStudio等)
- **嵌入模型**:
  - 支持多种嵌入模型 API
  - 本地嵌入支持 (通过 @xenova/transformers)
- **音频处理**:
  - 本地 Whisper 模型 (通过 @xenova/transformers)
  - 支持 OpenAI Whisper API

### 部署与服务
- **容器化**: Docker 支持
- **最低要求**:
  - RAM: 2GB+
  - 存储: 10GB+ (取决于文档量)
- **支持架构**: amd64 和 arm64

## Links to API Documentation

| 组件 | 文档链接 |
|------|----------|
| Langchain | [Langchain 文档](https://js.langchain.com/docs/) |
| LanceDB | [LanceDB 文档](https://lancedb.github.io/lancedb/) |
| OpenAI API | [OpenAI API 文档](https://platform.openai.com/docs/api-reference) |
| Pinecone | [Pinecone 文档](https://docs.pinecone.io/docs/overview) |
| Weaviate | [Weaviate 文档](https://weaviate.io/developers/weaviate) |
| Ollama | [Ollama 文档](https://ollama.ai/library) |
| Prisma | [Prisma 文档](https://www.prisma.io/docs) |

## Preferred Libraries or Tools

### 数据处理工具
- **向量检索**: LanceDB (默认)
- **文档处理**: Langchain
- **ORM**: Prisma
- **文本分割**: @langchain/textsplitters
- **音频处理**: Whisper 模型

### 开发工具
- **构建**: Vite, Node.js
- **部署**: Docker
- **类型检查**: TypeScript, Flow
- **代码质量**: ESLint, Prettier

### API 集成
- **默认 LLM**: 支持通过 API 调用外部模型（OpenAI、xAI 等）
- **向量嵌入**: 本地支持和外部 API 支持
- **数据库**: SQLite (默认)，支持 PostgreSQL

### 部署选项
- **本地部署**: Docker 容器
- **云部署**: 支持各种云环境 (AWS/GCP/Azure)