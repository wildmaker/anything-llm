# Implementation Plan

## Phase 1: 初始环境设置
*Docker私有化部署的项目初始化步骤*

### 1. 准备基础环境
- 确保目标服务器已安装Docker (>=v20.10) 和 Docker Compose
- 设置服务器防火墙规则，开放必要端口 (3001)
- 准备数据持久化存储卷的目录结构

### 2. 项目代码获取与结构设置
- 从GitHub克隆AnythingLLM仓库或下载发布版本
- 创建项目部署目录结构
  ```
  /opt/anythingllm/
  ├── docker/
  │   ├── docker-compose.yml
  │   └── .env
  └── storage/  # 数据持久化目录
      ├── vectordb/  # 向量数据库存储
      ├── documents/ # 文档存储
      └── models/    # 本地模型存储
  ```

### 3. 安全配置
- 生成并配置安全密钥 (JWT_SECRET, SIG_KEY, SIG_SALT)
- 设置管理员密码和多用户模式
- 配置HTTPS (如需)，准备SSL证书及密钥

### 4. 创建自定义Docker Compose配置
- 基于项目提供的docker-compose.yml创建自定义配置
- 配置数据卷挂载和网络设置
- 优化容器资源限制 (CPU, 内存)

## Phase 2: LLM API 集成配置

### 1. 选择并配置LLM提供商
- 选择合适的LLM提供商（OpenAI, Anthropic, Gemini等）
- 获取API密钥
- 配置模型参数（温度、历史记录、Token限制等）

### 2. 配置向量数据库
- 配置默认的LanceDB或选择替代方案
  - 支持LanceDB, Chroma, Pinecone, Weaviate等
- 设置向量数据库连接参数
- 配置嵌入模型 (openai, azure, ollama等)

### 3. 高级功能配置
- 配置音频/视频处理功能 (Whisper)
- 配置TTS功能 (如需)
- 设置密码复杂度规则
- 配置代理或搜索引擎集成 (如需)
- 配置自定义提示词和系统设置

### 4. 网络集成
- 配置与其他服务的网络连接
  - 使用`host.docker.internal`连接主机服务
  - 为本地LLM服务配置访问路径
- 设置反向代理 (nginx/traefik)，提供HTTPS访问
- 确保API端点安全暴露

## Phase 3: 部署测试与调优

### 1. 初始部署
- 部署Docker容器
  ```bash
  cd /opt/anythingllm/docker
  docker compose up -d
  ```
- 检查容器日志，确保启动无错误
- 验证服务可访问性 (http://服务器IP:3001)

### 2. 功能测试
- 测试用户认证与管理
- 验证LLM API连接
  - 测试对话功能
  - 验证文档处理能力
- 验证向量数据库功能
- 测试文件上传和处理

### 3. 性能调优
- 调整容器资源限制
- 优化向量数据库配置
- 调整LLM参数配置
- 优化缓存策略
- 设置并测试高并发访问

### 4. 安全审计
- 检查API密钥和敏感信息存储
- 验证认证机制
- 确认权限控制有效性
- 检查网络安全设置
- 进行基本安全渗透测试

## Phase 4: 正式部署与维护

### 1. 产品环境部署
- 创建生产环境配置
  ```
  # docker-compose.prod.yml
  version: '3'
  services:
    anything-llm:
      image: mintplexlabs/anythingllm:latest
      container_name: anythingllm
      cap_add:
        - SYS_ADMIN
      volumes:
        - ./config/.env:/app/server/.env
        - ./storage:/app/server/storage
      ports:
        - "3001:3001"
      restart: unless-stopped
      # 对接自有LLM服务如需要
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```
- 配置自动重启策略
- 设置数据卷备份策略
- 部署监控工具

### 2. 备份与恢复策略
- 设置定时备份任务
  ```bash
  # 备份脚本示例
  #!/bin/bash
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  tar -czf /backup/anythingllm-${TIMESTAMP}.tar.gz /opt/anythingllm/storage
  ```
- 文档数据备份
- 向量数据库备份
- 测试恢复流程

### 3. 监控与日志
- 设置日志轮转策略
- 配置监控告警
- 集成现有监控系统
- 设置资源使用率监控
- 建立API调用监控

### 4. 更新与维护计划
- 制定版本更新策略
  ```bash
  # 更新脚本示例
  docker pull mintplexlabs/anythingllm:latest
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d
  ```
- 设置自动更新(可选)
- 建立回滚机制
- 制定维护窗口计划
- 建立问题响应流程

## 部署配置示例

### 基础docker-compose.yml
```yaml
name: anythingllm

networks:
  anything-llm:
    driver: bridge

services:
  anything-llm:
    container_name: anythingllm
    image: mintplexlabs/anythingllm:latest
    cap_add:
      - SYS_ADMIN
    volumes:
      - "./config/.env:/app/server/.env"
      - "./storage:/app/server/storage"
    ports:
      - "3001:3001"
    env_file:
      - ./config/.env
    networks:
      - anything-llm
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
```

### LLM API配置示例 (.env)
```
SERVER_PORT=3001
STORAGE_DIR="/app/server/storage"
JWT_SECRET="请生成随机字符串至少12字符"
SIG_KEY="请生成随机字符串至少32字符" 
SIG_SALT="请生成随机字符串至少32字符"

# LLM提供商配置
LLM_PROVIDER='openai'         # 可选: openai, anthropic, gemini, azure等
OPEN_AI_KEY='sk-xxxxxxxxxxxxxxxx'
OPEN_MODEL_PREF='gpt-4o'

# 向量数据库配置
VECTOR_DB="lancedb"           # 默认使用LanceDB，也可选其他

# 嵌入配置 (如果LLM不支持嵌入)
EMBEDDING_ENGINE='openai'
EMBEDDING_MODEL_PREF='text-embedding-3-large'

# 多用户模式与安全
AUTH_TOKEN="your-admin-password"  # 单用户模式下的密码
MULTI_USER_MODE=true              # 启用多用户模式

# 可选高级配置
DISABLE_TELEMETRY=true
ENABLE_HTTPS=false
#HTTPS_CERT_PATH="./certs/cert.pem"
#HTTPS_KEY_PATH="./certs/key.pem"
```

### 私有化部署注意事项

1. **LLM API访问配置**
   - 确保服务器能够访问外部LLM API
   - 如使用内部LLM服务，确保网络可达且正确配置

2. **数据安全**
   - 所有上传文档和向量数据存储在持久化卷中
   - 敏感配置（API密钥等）存储在.env文件中
   - 考虑加密敏感数据

3. **资源需求**
   - 最低配置：2GB RAM，10GB存储
   - 推荐配置：4GB RAM，30GB+存储
   - CPU需求取决于并发用户数和处理任务

4. **扩展性考虑**
   - 对于高负载场景，考虑使用PostgreSQL替代SQLite
   - 考虑使用专用向量数据库服务
   - 考虑分离前端和API服务

## 开发环境启动指南

本部分提供了不使用Docker，在开发环境中启动AnythingLLM的详细步骤，适用于本地开发和调试。

### 环境要求
- NodeJS v18或更高版本
- Yarn包管理器
- 最低2GB RAM，推荐4GB以上
- 最少10GB磁盘空间

### 初次设置

1. **克隆代码仓库**
   ```bash
   git clone git@github.com:Mintplex-Labs/anything-llm.git
   cd anything-llm
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
   编辑`frontend/.env`文件，根据部署环境设置`VITE_BASE_API`：
   ```
   # 本地开发使用
   VITE_API_BASE='http://localhost:3001/api'
   
   # 部署到非本地地址或Docker中使用
   # VITE_API_BASE='/api'
   ```

5. **数据库初始化**
   ```bash
   cd server
   npx prisma generate --schema=./prisma/schema.prisma
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

### 每次启动步骤

**生产环境启动**

1. **构建前端应用** (仅生产环境需要)
   ```bash
   cd frontend
   yarn build
   ```
   这将在`frontend/dist`目录中生成生产就绪的前端代码。

2. **复制前端构建到服务器** (仅生产环境需要)
   ```bash
   cp -R frontend/dist server/public
   ```
   这会创建`server/public`目录，包含`index.html`文件和其他前端资源。

3. **启动后端服务**
   ```bash
   cd server
   NODE_ENV=production node index.js &
   ```

4. **启动文档收集服务**
   ```bash
   cd collector
   NODE_ENV=production node index.js &
   ```

5. **访问应用**
   应用现在应该运行在`http://localhost:3001`

### 开发模式启动

在开发环境中，AnythingLLM使用Vite构建工具，支持热更新功能，无需每次修改代码后都重新构建前端。

1. **启动前端开发服务器**
   ```bash
   cd frontend
   yarn dev
   ```
   Vite将启动开发服务器，支持热模块替换(HMR)。当您修改前端代码时，更改会自动反映在浏览器中，无需手动刷新。

2. **启动后端开发服务器**
   ```bash
   cd server
   yarn dev
   ```

3. **启动收集器开发服务器**
   ```bash
   cd collector
   yarn dev
   ```

4. **配置前端API地址**
   确保`frontend/.env`文件中`VITE_API_BASE`设置正确:
   ```
   VITE_API_BASE='http://localhost:3001/api' # 开发模式使用
   ```

当您以开发模式启动服务时，前端会在`http://localhost:5173`或其他Vite分配的端口上运行，后端API在`http://localhost:3001`上运行。前端会通过`VITE_API_BASE`环境变量找到后端API。

> **注意**: 开发模式下不需要构建前端代码或复制到server/public目录，Vite会自动处理开发服务器和热更新。

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

4. **重新启动应用**
   - 对于开发环境：按照上述"开发模式启动"的步骤重新启动
   - 对于生产环境：按照"每次启动步骤"中的生产环境步骤重新启动

### 开发环境自动化脚本示例

以下是一个自动化脚本，可用于简化AnythingLLM的更新和重启过程：

```bash
#!/bin/bash

# 进入项目目录
cd $HOME/anything-llm

# 获取最新代码
git checkout .
git pull origin master
echo "HEAD pulled to commit $(git log -1 --pretty=format:"%h" | tail -n 1)"

# 保存当前环境变量
echo "Freezing current ENVs"
curl -I "http://localhost:3001/api/env-dump" | head -n 1|cut -d$' ' -f2

# 重建前端
echo "Rebuilding Frontend"
cd $HOME/anything-llm/frontend && yarn && yarn build
cd $HOME/anything-llm

# 复制到服务器目录
echo "Copying to Server Public"
rm -rf server/public
cp -r frontend/dist server/public

# 停止现有服务
echo "Killing node processes"
pkill node

# 更新依赖
echo "Installing collector dependencies"
cd $HOME/anything-llm/collector && yarn

echo "Installing server dependencies & running migrations"
cd $HOME/anything-llm/server && yarn
cd $HOME/anything-llm/server && npx prisma migrate deploy --schema=./prisma/schema.prisma
cd $HOME/anything-llm/server && npx prisma generate

# 启动服务
echo "Booting up services."
truncate -s 0 /logs/server.log # 或其他日志文件位置
truncate -s 0 /logs/collector.log

cd $HOME/anything-llm/server
(NODE_ENV=production node index.js) &> /logs/server.log &

cd $HOME/anything-llm/collector
(NODE_ENV=production node index.js) &> /logs/collector.log &
```

保存此脚本为`update.sh`，并通过`chmod +x update.sh`赋予执行权限，可实现一键更新和重启。