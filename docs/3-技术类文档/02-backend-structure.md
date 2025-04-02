# Backend Structure Documentation

## Database Schema
AnythingLLM 使用 Prisma ORM 来管理数据库结构，默认使用 SQLite，但也支持 PostgreSQL。

### 主要数据表及关系

#### 用户和认证相关
- **users**: 存储用户信息
  - `id`: 主键
  - `username`: 用户名
  - `password`: 加密后的密码
  - `role`: 用户角色 (admin/user)
  - `createdAt`: 创建时间

- **api_keys**: API 密钥管理
  - `id`: 主键
  - `secret`: 唯一的 API 密钥
  - `createdBy`: 外键，关联到创建者
  - `createdAt`: 创建时间

- **invites**: 邀请码系统
  - `code`: 唯一邀请码
  - `status`: 状态 (pending/claimed)
  - `claimedBy`: 被认领用户 ID
  - `workspaceIds`: 可访问的工作区 ID 列表

#### 工作区和文档相关
- **workspaces**: 工作区配置
  - `id`: 主键
  - `name`: 工作区名称
  - `slug`: 唯一标识符
  - `vectorTag`: 向量标签
  - `chatProvider`, `chatModel`: LLM 提供商和模型设置
  - `similarityThreshold`: 相似度阈值
  - `topN`: 检索文档数量

- **workspace_documents**: 文档管理
  - `id`: 主键
  - `docId`: 文档唯一 ID
  - `filename`: 文件名
  - `docpath`: 文档路径
  - `workspaceId`: 外键，关联到工作区
  - `pinned`, `watched`: 文档状态标记

- **document_vectors**: 文档向量存储
  - `docId`: 文档 ID
  - `vectorId`: 向量 ID

#### 聊天和设置相关
- **workspace_threads**: 工作区中的对话线程
- **chat_messages**: 聊天消息记录
- **system_settings**: 系统设置
  - `label`: 设置名称
  - `value`: 设置值

#### 其他功能表
- **event_logs**: 事件日志记录
- **embed_configs**: 嵌入式应用配置
- **document_sync_queues**: 文档同步队列

### 索引和优化
- 使用唯一索引确保关键字段唯一性 (如 `slug`, `docId`)
- 在查询频繁的字段上建立索引（如 `event_logs` 表的 `event` 字段）
- 使用外键关系维护数据完整性

### 迁移策略
- 使用 Prisma 迁移管理数据库架构变更
- 迁移脚本位于 `server/prisma/migrations` 目录
- 支持从 SQLite 迁移到 PostgreSQL 的能力

## 认证逻辑

### 用户认证流程
1. **注册流程**
   - 多用户模式下支持用户注册
   - 可配置邀请码系统限制注册
   - 支持密码复杂度验证（通过环境变量配置）

2. **登录流程**
   - 使用用户名/密码认证
   - 生成 JWT 令牌用于会话管理
   - JWT 使用 `JWT_SECRET` 环境变量进行签名

3. **API 认证**
   - 支持 Bearer Token 认证
   - API 密钥认证用于程序化访问
   - 通过 `validApiKey` 中间件验证 API 请求

4. **会话管理**
   - JWT 令牌用于维护用户会话
   - 令牌过期机制增强安全性
   - 请求头中提供令牌进行身份验证

5. **访问控制**
   - 基于角色的访问控制（admin/user）
   - 工作区级别的权限管理
   - 通过中间件实现权限验证

6. **安全措施**
   - 密码哈希存储
   - 防止 CSRF 攻击
   - 可配置的密码复杂度要求
   - 可选的 HTTPS 支持

### 身份验证实现
- 使用 `SIG_KEY` 和 `SIG_SALT` 环境变量加强安全性
- 支持简单 SSO 透传认证（可通过环境变量启用）
- 可配置双重认证

## 存储规则

### 文件存储结构
1. **基本存储目录**
   - 默认存储路径: `server/storage/`
   - 可通过 `STORAGE_DIR` 环境变量自定义

2. **文档存储**
   - 上传文档存储在 `documents/` 子目录
   - 每个文档赋予唯一 ID 防止冲突
   - 使用 JSON 格式存储处理后的文档内容和元数据

3. **向量数据库存储**
   - 默认使用 LanceDB 作为向量数据库
   - 向量数据存储在 `vectordb/` 子目录
   - 支持多种向量数据库（Chroma, Pinecone, Weaviate, Qdrant, Milvus等）

4. **模型存储**
   - 本地模型存储在 `models/` 子目录
   - 支持 GGUF 格式的 LLM 模型
   - Whisper 语音识别模型本地缓存

### 访问控制规则
- 文件访问权限基于用户身份和工作区权限
- API 端点通过中间件实现访问控制
- 文档级别的权限控制

### 文件限制
- 支持的文档类型：PDF, TXT, DOC(X), HTML, MD 等
- 音频/视频格式：MP3, MP4, WAV 等（通过 Whisper 转录）
- 支持图像处理：PNG, JPG/JPEG（通过 OCR 处理）

### 数据保留和清理
- 文档历史版本管理
- 基于时间的数据清理策略
- 可配置的数据备份机制

## 边缘情况处理

### 错误处理
- 统一的错误处理机制
- API 响应中包含详细错误信息
- 日志记录系统捕获异常（event_logs 表）

### 限流策略
- API 请求限流保护
- LLM API 调用限流
- 可配置的用户级别使用限制

### 并发访问
- 数据库事务确保数据一致性
- 锁机制防止资源竞争
- 异步处理大型文档和向量化任务

### 性能优化
- 向量数据库查询优化
- 缓存机制减少 LLM API 调用
- 文档分块策略优化检索效率

### 系统恢复
- 数据库备份和恢复策略
- 环境变量管理关键配置
- Docker 容器化部署简化恢复流程

## 参考资源和实现指南

### 参考项目源码
- **AnythingLLM 原始项目**：[https://github.com/Mintplex-Labs/anything-llm](https://github.com/Mintplex-Labs/anything-llm)
- 关键模块：
  - 认证和中间件: `server/utils/middleware/`
  - API 端点定义: `server/endpoints/api/`
  - 数据库模型: `server/models/`
  - Prisma Schema: `server/prisma/schema.prisma`

### 实现原则
1. **遵循现有代码结构**
   - 保持与原始项目一致的目录结构和命名规范
   - 使用相同的代码风格和注释风格

2. **优先考虑兼容性**
   - 新功能应兼容现有数据结构和 API
   - 考虑向后兼容的数据库迁移策略

3. **代码审查参考**
   - 通过分析原始项目的 PR 记录了解代码质量标准
   - 学习错误处理和日志记录的最佳实践

4. **模块化设计**
   - 遵循项目的模块化结构，避免创建过度耦合的代码
   - 复用现有的工具类和辅助函数

5. **高质量重现**
   - 确保准确实现原有功能，不仅是接口一致，而且行为一致
   - 对边缘情况进行充分测试，确保稳定性

### 开发工作流程
1. 先理解数据库模型和关系
2. 掌握认证机制和安全策略
3. 了解存储规则和文件处理流程
4. 实现 API 端点和业务逻辑
5. 添加错误处理和边缘情况管理