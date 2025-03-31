import React, { useState, useEffect } from "react";
import { X, MagnifyingGlass, Person } from "@phosphor-icons/react";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";

export function HistoryDialog({ open, onOpenChange, workspace = {}, chatHistory = [] }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(workspace?.id);

  // 当工作区发生变化时，重置状态
  useEffect(() => {
    if (workspace?.id !== currentWorkspaceId) {
      // 工作区已变更，重置状态
      setHistoryItems([]);
      setSelectedItem(null);
      setSearchQuery("");
      setCurrentWorkspaceId(workspace?.id);
    }
  }, [workspace?.id, currentWorkspaceId]);
  
  // 当传入的聊天历史改变时，更新对话列表
  useEffect(() => {
    console.log("HistoryDialog: chatHistory changed", { length: chatHistory?.length, workspaceId: workspace?.id });
    
    // 注意：chatHistory 已经是通过 workspace.slug API接口过滤的，只包含当前工作区的聊天记录
    // 因此我们不需要额外过滤，只需确保正确处理数据即可
    if (chatHistory && chatHistory.length > 0) {
      // 将聊天历史处理成历史对话项目
      const processedHistory = processHistoryItems(chatHistory);
      setHistoryItems(processedHistory);
      
      // 默认选中第一个对话
      if (processedHistory.length > 0 && !selectedItem) {
        setSelectedItem(processedHistory[0].id);
      }
    } else {
      // 如果没有聊天历史，清空历史项
      setHistoryItems([]);
      setSelectedItem(null);
    }
  }, [chatHistory, workspace?.id]);

  // 处理聊天历史为对话项目
  const processHistoryItems = (history) => {
    // 这里可以根据实际数据结构进行调整
    // 为了演示，我们将每组用户和助手的对话作为一个历史项
    return history.map((item, index) => {
      return {
        id: item.id || item.chatId || `history-${index}`,
        title: getMessageTitle(item),
        timestamp: formatTimestamp(item.sentAt ? new Date(item.sentAt * 1000) : null),
        isActive: index === 0, // 第一项默认为活跃
        messages: Array.isArray(item.messages) ? item.messages : [item],
        workspaceId: workspace?.id, // 添加workspaceId以便将来可能的过滤需求
      };
    });
  };

  // 从消息中提取标题
  const getMessageTitle = (item) => {
    // 尝试从用户消息中获取标题
    if (item.role === 'user') {
      // 截取前20个字符作为标题
      return item.content.slice(0, 20) + (item.content.length > 20 ? '...' : '');
    } else if (item.messages && item.messages.length > 0) {
      const userMessage = item.messages.find(msg => msg.role === 'user');
      if (userMessage) {
        return userMessage.content.slice(0, 20) + (userMessage.content.length > 20 ? '...' : '');
      }
    }
    return `对话 ${item.id || item.chatId || ''}`;
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '未知时间';
    
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else if (diffMinutes < 24 * 60) {
        return `${Math.floor(diffMinutes / 60)}小时前`;
      } else {
        return date.toLocaleString();
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return '未知时间';
    }
  };

  // 背景样式
  const getBackgroundColor = () => {
    return theme === 'light' ? "bg-white" : "bg-theme-bg-secondary";
  };

  // 左侧选择项样式
  const getItemStyle = (isSelected) => {
    if (isSelected) {
      return theme === 'light' 
        ? "bg-blue-50 border border-blue-100" 
        : "bg-blue-900/20 border border-blue-900/30";
    }
    return theme === 'light'
      ? "hover:bg-gray-50 border border-transparent" 
      : "hover:bg-theme-hover border border-transparent";
  };

  // 消息气泡样式
  const getMessageStyle = (isUser) => {
    if (isUser) {
      return "bg-blue-500 text-white";
    }
    return theme === 'light' 
      ? "bg-white border border-gray-200" 
      : "bg-theme-bg-secondary border border-theme-sidebar-border";
  };

  // 过滤历史记录
  const filteredHistory = historyItems.filter((item) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200">
      {/* 背景遮罩层 */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      {/* 模态框 */}
      <div
        className="relative z-10 w-full max-w-[90vw] md:w-4/5 lg:w-5/6 transition-all duration-200 transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-dialog-title"
      >
        <div 
          className={`flex flex-col ${getBackgroundColor()} border-0 rounded-lg overflow-hidden h-[85vh] max-h-[calc(100vh-100px)]`}
          style={{
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-theme-sidebar-border p-4">
            <h2 id="history-dialog-title" className="text-lg font-semibold text-theme-text">
              {t("historyDialog.title") || "历史记录"}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="hover:bg-theme-hover rounded-full p-1.5"
            >
              <X className="h-5 w-5 text-theme-text" />
              <span className="sr-only">关闭</span>
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="p-4 border-b border-theme-sidebar-border">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text opacity-60" />
              <input
                type="text"
                placeholder={t("historyDialog.search") || "搜索..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm ${theme === 'light' ? 'bg-gray-50' : 'bg-theme-bg-dark'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-theme-text`}
              />
            </div>
          </div>

          <div className="grid h-full relative grid-cols-1 md:grid-cols-2 lg:grid-cols-5 overflow-hidden">
            {/* 左侧历史记录列表 */}
            <div className="col-span-1 lg:col-span-2 border-r border-theme-sidebar-border h-full overflow-y-auto">
              <div className="p-4 space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`mb-3 cursor-pointer rounded-md p-3 transition-colors ${getItemStyle(selectedItem === item.id)}`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium leading-tight text-theme-text">{item.title}</span>
                        <span className="text-xs text-theme-text opacity-60 mt-1">{item.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-theme-text opacity-60">
                    {searchQuery ? '没有找到匹配的记录' : '暂无历史对话记录'}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧预览内容 - 聊天记录 */}
            <div className="col-span-1 lg:col-span-3 h-full overflow-y-auto">
              <div className="p-4">
                {selectedItem && filteredHistory.find((item) => item.id === selectedItem) ? (
                  <div className="space-y-6">
                    {filteredHistory
                      .find((item) => item.id === selectedItem)
                      ?.messages.map((message, idx) => (
                        <div
                          key={message.id || `msg-${idx}`}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span role="img" aria-label="Assistant">🤖</span>
                              </div>
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${getMessageStyle(message.role === "user")}`}
                          >
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                          {message.role === "user" && (
                            <div className="flex-shrink-0 ml-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <Person className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-theme-text opacity-60">
                      {t("historyDialog.noSelection") || "请选择一个对话查看详情"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryDialog;