# 项目概述

Instant-AI 企业版是一款面向中小企业的智能文档分析工具，专注于提供安全可靠的本地化部署方案，帮助企业高效处理和分析内部文档资料。通过自然语言交互和 AI 技术，实现快速部署和使用体验，为中小企业提供高效、安全、低门槛的文档管理解决方案。

## 核心价值

- **效率提升**：显著缩短文档查询和分析时间，助力业务决策
- **数据安全**：本地部署方案，满足企业隐私需求
- **易用性**：低成本、高性价比的智能工具，适合中小企业数字化转型

## 主要特性

- 🧠 **智能文档分析**：支持PDF、Word、Excel、TXT等多种格式文档
- 🔒 **安全私有部署**：基于Docker的本地部署，数据不出企业内网
- 👥 **多用户权限**：支持团队协作与权限分级管理
- 💬 **自然语言交互**：通过对话方式查询和分析文档内容
- 🌐 **多语言支持**：原生支持中文和英文交互界面
- 🚀 **低门槛使用**：简洁直观的Web界面，无需编程经验
- ⚡ **高效向量检索**：优化大规模文档的查询效率
- 🔄 **批量导入导出**：支持批量处理文档和结果导出

## 典型使用场景

### 销售团队快速查询
销售代表可以直接询问"最新X型号设备报价是多少？"，系统立即返回准确信息，无需翻阅大量文件。

### 商务人员分析合同
导入合同后，通过简单提问"付款条款是什么？"，快速获取关键信息，提高工作效率。

### 技术支持查询参数
工程师输入"X设备参数有哪些？"，系统自动提取相关技术参数，加快问题解决速度。

## 技术架构

Instant-AI 企业版采用现代化技术栈：

- **前端**：React + TypeScript + Tailwind CSS，提供直观的用户界面
- **后端**：Node.js + Express，处理业务逻辑和API请求
- **AI核心**：支持多种LLM模型（如OpenAI, xAI等）和本地模型
- **数据存储**：SQLite（默认），可扩展至PostgreSQL
- **向量检索**：LanceDB（默认），支持多种向量数据库选项
- **部署**：Docker容器化，确保一键部署和环境一致性

## 部署要求

- **最低配置**：2GB RAM，10GB+ 存储空间
- **环境**：支持私有云或本地服务器
- **网络**：可选择完全离线部署或API连接模式

## 项目文档目录

| 文档名称 | 文件路径 | 描述 |
|---------|---------|------|
| 产品需求 | [prompt/01-prd.md](prompt/01-prd.md) | 产品需求、目标用户和核心功能 |
| 应用流程 | [prompt/02-app-flow.md](prompt/02-app-flow.md) | 应用主要流程图和交互模型 |
| 技术栈 | [prompt/03-tech-stack.md](prompt/03-tech-stack.md) | 前后端技术栈、框架和工具 |
| 前端指南 | [prompt/04-frontend-guidelines.md](prompt/04-frontend-guidelines.md) | 前端开发规范和UI设计原则 |
| 后端结构 | [prompt/05-backend-structure.md](prompt/05-backend-structure.md) | 后端架构、数据库模型和API设计 |
| 实施计划 | [prompt/06-implementation-plan.md](prompt/06-implementation-plan.md) | Docker私有化部署、开发环境启动与LLM API连接步骤 |
| 开发方法论 | [prompt/07-development-methodology.md](prompt/07-development-methodology.md) | TDD红绿测试和敏捷开发协作流程 |
| 功能清单 | [prompt/08-feature-todos.md](prompt/08-feature-todos.md) | 功能开发进度追踪和任务列表 |
| 项目索引 | [prompt/00-index.md](prompt/00-index.md) | 文档索引和导航 |

### 文档使用方法

- **项目启动**: 先阅读产品需求(01)和应用流程(02)
- **技术开发**: 参考技术栈(03)、前端指南(04)和后端结构(05)
- **部署实施**: 按照实施计划(06)进行系统部署或开发环境搭建
- **协作开发**: 遵循开发方法论(07)的TDD和敏捷实践
- **功能开发**: 根据功能清单(08)检查开发进度并更新状态

## 快速开始

### Docker部署

```bash
# 拉取最新镜像
docker pull wildmaker/instant-ai:latest

# 启动容器
docker run -d -p 3001:3001 \
  -v ./instant-ai-data:/app/server/storage \
  -e "STORAGE_DIR=/app/server/storage" \
  wildmaker/instant-ai:latest
```

### 访问应用

浏览器访问 `http://localhost:3001` 开始使用。

## 开发环境启动指南

如果您需要进行二次开发或调试，可以按照以下步骤设置开发环境。

### 环境要求
- NodeJS v18或更高版本
- Yarn包管理器
- 最低2GB RAM，推荐4GB以上
- 最少10GB磁盘空间

### 初次设置

1. **克隆代码仓库**
   ```bash
   git clone git@github.com:wildmaker/Instant-AI.git
   cd Instant-AI
   ```

2. **安装依赖**
   ```bash
   yarn setup
   ```
   这将安装所有必要的依赖项，用于运行和调试应用程序。

3. **配置环境变量**
   ```bash
   cp server/.env.example server/.env
   ```
   确保在`server/.env`文件中至少设置以下关键项：
   ```
   STORAGE_DIR="/your/absolute/path/to/server/storage"
   ```

4. **配置前端API地址**
   编辑`frontend/.env`文件，设置API地址：
   ```
   # 本地开发使用
   VITE_API_BASE='http://localhost:3001/api'
   ```

5. **数据库初始化**
   ```bash
   cd server
   npx prisma generate --schema=./prisma/schema.prisma
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

### 开发模式启动

在开发环境中，Instant-AI使用Vite构建工具，支持热更新功能，无需每次修改代码后都重新构建前端。

1. **启动前端开发服务器**
   ```bash
   cd frontend
   yarn dev
   ```
   前端开发服务器通常会在`http://localhost:5173`运行，支持热模块替换(HMR)。

2. **启动后端开发服务器**
   ```bash
   cd server
   yarn dev
   ```
   后端API服务会在`http://localhost:3001`运行。

3. **启动收集器开发服务器**
   ```bash
   cd collector
   yarn dev
   ```
   文档收集器服务通常在`http://localhost:3005`运行。

### 重启和更新流程

1. **停止所有Node进程**
   ```bash
   pkill node
   ```

2. **更新代码库**
   ```bash
   git pull origin master
   ```

3. **重新安装依赖（如有必要）**
   ```bash
   cd frontend && yarn
   cd ../server && yarn
   cd ../collector && yarn
   ```

4. **重新启动服务**
   按照上述"开发模式启动"的步骤重新启动各个服务

### 开发模式自动化脚本示例

可以创建以下脚本`dev-start.sh`来自动启动所有开发服务：

```bash
#!/bin/bash

# 启动前端
cd frontend
yarn dev &

# 启动后端
cd ../server
yarn dev &

# 启动收集器
cd ../collector
yarn dev &

echo "所有服务已启动，请访问 http://localhost:5173"
```

确保通过`chmod +x dev-start.sh`赋予脚本执行权限。

## 支持的LLM和向量数据库

### 大语言模型支持
- OpenAI (GPT系列)
- Azure OpenAI
- Anthropic Claude
- Google Gemini Pro
- Mistral AI
- 以及多种开源模型

### 向量数据库支持
- LanceDB (默认)
- Pinecone
- Chroma
- Weaviate
- Qdrant
- Milvus
- Zilliz
- Astra DB

## 差异化优势

- **场景化设计**：专为中小企业文档管理需求优化
- **低使用门槛**：无需专业知识，快速部署上手
- **高性价比**：一次投入，长期受益，降低运营成本
- **安全可控**：数据本地存储，符合隐私合规要求

## 未来规划

- 支持OCR图像识别
- 本地AI模型集成
- 企业系统深度集成
- CAD图纸解析与查询

## 自托管方式

支持多种部署方法和模板，您可以选择适合的方式运行Instant-AI：

| Docker | AWS | GCP | 
|----------------------------------------|----|-----|
| ![Docker部署](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) | ![AWS部署](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) | ![GCP部署](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white) |

| Digital Ocean | Railway  |  Render |
|---------------|----------|---------|
| ![DigitalOcean部署](https://img.shields.io/badge/DigitalOcean-%230167ff.svg?style=for-the-badge&logo=digitalOcean&logoColor=white) | ![Railway部署](https://img.shields.io/badge/Railway-%23131415.svg?style=for-the-badge&logo=railway&logoColor=white) | ![Render部署](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white) |

## 社区与支持

- 问题反馈：[GitHub Issues](https://github.com/wildmaker/Instant-AI/issues)
- 技术交流：[GitHub Discussions](https://github.com/wildmaker/Instant-AI/discussions)
- 商务咨询：<support@example.com>

## 关于Telemetry与隐私

如果您希望退出遥测数据收集，可以在服务器或Docker .env设置中将`DISABLE_TELEMETRY`设置为"true"，或者在应用中通过侧边栏 > `隐私`禁用遥测。收集的数据仅用于帮助我们了解使用情况，并优先考虑新功能和错误修复。我们保证不会收集任何文档内容或个人识别信息。

---

Copyright © 2024 Wild Maker. 项目基于 [MIT](./LICENSE) 许可证开源。

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-返回顶部-222628?style=flat-square
[docker-btn]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[docker-deploy]: ./docker/
[aws-btn]: https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white
[aws-deploy]: ./docs/aws/ec2.md
[gcp-btn]: https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white
[gcp-deploy]: ./docs/gcp/compute.md
[do-btn]: https://img.shields.io/badge/DigitalOcean-%230167ff.svg?style=for-the-badge&logo=digitalOcean&logoColor=white
[do-deploy]: ./docs/digital-ocean/droplet.md
[render-btn]: https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white
[render-deploy]: ./docs/render/render.md
[railway-btn]: https://img.shields.io/badge/Railway-%23131415.svg?style=for-the-badge&logo=railway&logoColor=white
[railway-deploy]: https://railway.app/template/ZMWVqH
[repocloud-btn]: https://img.shields.io/badge/RepoCloud-%2300BFFF.svg?style=for-the-badge&logo=cloud&logoColor=white
[repocloud-deploy]: ./docs/deploy-with-repocloud.md
[elestio-btn]: https://img.shields.io/badge/Elestio-%234B0082.svg?style=for-the-badge&logo=elestio&logoColor=white
[elestio-deploy]: ./docs/elestio/readme.md
