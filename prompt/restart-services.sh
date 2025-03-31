#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # 无颜色

# 项目根目录
PROJECT_DIR="/Users/wildmaker/Documents/Projects/anything-llm"

# 前端端口(默认值，将尝试从输出中检测)
FRONTEND_PORT=3000

# 打印带颜色的消息函数
print_message() {
  echo -e "${2}${1}${NC}"
}

# 进入项目目录
cd "$PROJECT_DIR" || {
  print_message "错误: 无法进入项目目录 $PROJECT_DIR" "$RED"
  exit 1
}

print_message "=== AnythingLLM 服务重启脚本 ===" "$BLUE"
print_message "正在检查并关闭现有服务..." "$YELLOW"

# 关闭现有的Node.js进程
# 查找包含前端、服务器和收集器相关的进程
FRONTEND_PIDS=$(pgrep -f "node.*frontend")
SERVER_PIDS=$(pgrep -f "node.*server")
COLLECTOR_PIDS=$(pgrep -f "node.*collector")

# 关闭前端进程
if [ -n "$FRONTEND_PIDS" ]; then
  print_message "正在关闭前端服务 (PID: $FRONTEND_PIDS)..." "$YELLOW"
  kill $FRONTEND_PIDS
fi

# 关闭服务器进程
if [ -n "$SERVER_PIDS" ]; then
  print_message "正在关闭后端服务 (PID: $SERVER_PIDS)..." "$YELLOW"
  kill $SERVER_PIDS
fi

# 关闭收集器进程
if [ -n "$COLLECTOR_PIDS" ]; then
  print_message "正在关闭收集器服务 (PID: $COLLECTOR_PIDS)..." "$YELLOW"
  kill $COLLECTOR_PIDS
fi

# 确保所有进程都已关闭，等待1秒
sleep 1
print_message "所有服务已关闭" "$GREEN"

# 创建日志目录
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

# 启动所有服务
print_message "正在启动所有服务..." "$BLUE"

# 使用screen启动服务，便于之后分离和查看
if ! command -v screen &> /dev/null; then
  print_message "警告: 未安装screen，使用后台模式启动服务" "$YELLOW"
  
  # 在后台启动服务
  print_message "启动后端服务..." "$BLUE"
  npm run dev:server > "$LOG_DIR/server.log" 2>&1 &
  SERVER_PID=$!
  
  print_message "启动收集器服务..." "$BLUE"
  npm run dev:collector > "$LOG_DIR/collector.log" 2>&1 &
  COLLECTOR_PID=$!
  
  print_message "启动前端服务..." "$BLUE"
  npm run dev:frontend > "$LOG_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  
  print_message "所有服务已在后台启动" "$GREEN"
  print_message "服务日志文件:" "$BLUE"
  print_message "- 后端服务: $LOG_DIR/server.log" "$BLUE"
  print_message "- 收集器服务: $LOG_DIR/collector.log" "$BLUE"
  print_message "- 前端服务: $LOG_DIR/frontend.log" "$BLUE"
  
  # 文件描述符位置
  FRONTEND_LOG="$LOG_DIR/frontend.log"
else
  # 使用screen启动各个服务
  print_message "使用screen启动服务..." "$BLUE"
  
  # 先检查是否已存在相应的screen会话，如果存在则杀掉
  screen -ls | grep -q "anything-llm-server" && screen -S anything-llm-server -X quit
  screen -ls | grep -q "anything-llm-collector" && screen -S anything-llm-collector -X quit
  screen -ls | grep -q "anything-llm-frontend" && screen -S anything-llm-frontend -X quit
  
  # 创建日志文件
  > "$LOG_DIR/frontend.log"
  > "$LOG_DIR/server.log"
  > "$LOG_DIR/collector.log"
  
  # 启动服务并将输出重定向到日志文件
  screen -dmS anything-llm-server bash -c "cd $PROJECT_DIR && npm run dev:server | tee $LOG_DIR/server.log; exec bash"
  screen -dmS anything-llm-collector bash -c "cd $PROJECT_DIR && npm run dev:collector | tee $LOG_DIR/collector.log; exec bash"
  screen -dmS anything-llm-frontend bash -c "cd $PROJECT_DIR && npm run dev:frontend | tee $LOG_DIR/frontend.log; exec bash"
  
  print_message "所有服务已在screen会话中启动" "$GREEN"
  print_message "要查看服务运行情况，可以使用以下命令:" "$BLUE"
  print_message "- 后端服务: screen -r anything-llm-server" "$BLUE"
  print_message "- 收集器服务: screen -r anything-llm-collector" "$BLUE"
  print_message "- 前端服务: screen -r anything-llm-frontend" "$BLUE"
  
  # 文件描述符位置
  FRONTEND_LOG="$LOG_DIR/frontend.log"
fi

print_message "服务已成功重启!" "$GREEN"

# 等待前端服务启动并提取访问URL
print_message "正在等待前端服务启动..." "$YELLOW"

# 最多等待30秒
MAX_WAIT=30
count=0
frontend_url=""

while [ $count -lt $MAX_WAIT ]; do
  # 尝试从日志中提取本地URL
  if grep -q "Local:" "$FRONTEND_LOG" 2>/dev/null; then
    # 使用grep和sed提取URL
    frontend_url=$(grep "Local:" "$FRONTEND_LOG" | head -1 | sed -E 's/.*Local:[[:space:]]*([^ ]*).*/\1/')
    break
  fi
  
  # 如果找不到Local，尝试其他可能的URL格式
  if grep -q "http://localhost:" "$FRONTEND_LOG" 2>/dev/null; then
    frontend_url=$(grep -o "http://localhost:[0-9]*" "$FRONTEND_LOG" | head -1)
    break
  fi
  
  # 检查是否有Vite或其他构建工具的URL模式
  if grep -q "localhost:[0-9]" "$FRONTEND_LOG" 2>/dev/null; then
    frontend_url=$(grep -o "localhost:[0-9]*" "$FRONTEND_LOG" | head -1)
    frontend_url="http://$frontend_url"
    break
  fi
  
  # 增加计数并等待
  count=$((count + 1))
  sleep 1
  
  # 每5秒显示一次等待消息
  if [ $((count % 5)) -eq 0 ]; then
    print_message "仍在等待前端服务启动... ($count 秒)" "$YELLOW"
  fi
done

# 显示访问地址
if [ -n "$frontend_url" ]; then
  print_message "\n🚀 前端服务已启动!" "$GREEN"
  print_message "📱 访问地址: ${BOLD}${CYAN}$frontend_url${NC}" 
  print_message "🌐 您也可以通过本机IP地址从其他设备访问\n" "$GREEN"
else
  # 如果无法从日志中检测URL，则显示默认URL
  print_message "\n🚀 前端服务可能已启动，但无法检测到确切地址" "$YELLOW"
  print_message "📱 尝试访问: ${BOLD}${CYAN}http://localhost:$FRONTEND_PORT${NC}" 
  print_message "🛠️ 您可以在日志文件中查看实际地址: $FRONTEND_LOG\n" "$YELLOW"
fi

print_message "服务日志位置:" "$BLUE"
print_message "- 前端服务: $LOG_DIR/frontend.log" "$BLUE"
print_message "- 后端服务: $LOG_DIR/server.log" "$BLUE"
print_message "- 收集器服务: $LOG_DIR/collector.log" "$BLUE"