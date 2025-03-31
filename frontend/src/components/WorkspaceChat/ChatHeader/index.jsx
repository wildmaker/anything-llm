import React, { useState, useEffect, useRef } from "react";
import { FileText, Gear, Share, Note, Clock, DotsThree, CaretDown, Plus, PencilSimple, Trash, CircleNotch, UploadSimple, GearSix, SidebarSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import HistoryDialog from "../HistoryDialog";
import { useParams } from "react-router-dom";
import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import truncate from "truncate";
import { Link } from "react-router-dom";
import ManageWorkspace, { useManageWorkspaceModal } from "../../Modals/ManageWorkspace";
import useUser from "@/hooks/useUser";

// 定义线程重命名事件常量
export const THREAD_RENAME_EVENT = "renameThread";

// 顶部工具按钮组件
function ActionIcon({ icon: Icon, onClick, title, active }) {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    if (active) {
      if (theme === 'light') {
        return "bg-[rgba(0,0,0,0.03)]";
      }
      return "bg-[rgba(255,255,255,0.1)]";
    }
    return "";
  };

  return (
    <button
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${getBackgroundColor()} hover:bg-theme-hover`}
      onClick={onClick}
      title={title}
    >
      {React.createElement(Icon, { size: 20, weight: "regular" })}
    </button>
  );
}

function ChatHeader({ workspace, showSidebar, toggleSidebar, chatHistory = [] }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { threadSlug = null } = useParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentDialogHistory, setCurrentDialogHistory] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [showThreadDropdown, setShowThreadDropdown] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [editingThread, setEditingThread] = useState(null);
  const [editThreadName, setEditThreadName] = useState("");
  const threadDropdownRef = useRef(null);
  const editNameInputRef = useRef(null);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const { user } = useUser();
  const isInWorkspaceSettings = window.location.pathname.includes(`/workspace/${workspace?.slug}/settings/`);

  // 切换历史对话框状态并更新历史记录
  const toggleHistoryDialog = () => {
    if (!isHistoryOpen) {
      setCurrentDialogHistory(chatHistory);
    }
    setIsHistoryOpen(!isHistoryOpen);
  };

  // 监听线程重命名事件
  useEffect(() => {
    const renameHandler = (event) => {
      const { threadSlug, newName } = event.detail;
      setThreads((prevThreads) =>
        prevThreads.map((thread) => {
          if (thread.slug === threadSlug) {
            return { ...thread, name: newName };
          }
          return thread;
        })
      );
    };

    window.addEventListener(THREAD_RENAME_EVENT, renameHandler);
    return () => {
      window.removeEventListener(THREAD_RENAME_EVENT, renameHandler);
    };
  }, []);

  // 当编辑状态改变时，聚焦输入框
  useEffect(() => {
    if (editingThread && editNameInputRef.current) {
      editNameInputRef.current.focus();
    }
  }, [editingThread]);

  // 加载当前工作区的线程列表
  useEffect(() => {
    async function fetchThreads() {
      if (!workspace?.slug) return;
      setLoadingThreads(true);
      const { threads } = await Workspace.threads.all(workspace.slug);
      setThreads(threads);
      setLoadingThreads(false);
    }
    fetchThreads();
  }, [workspace?.slug]);

  // 点击外部区域关闭线程下拉菜单和编辑状态
  useEffect(() => {
    function handleClickOutside(event) {
      if (threadDropdownRef.current && !threadDropdownRef.current.contains(event.target)) {
        setShowThreadDropdown(false);
        setEditingThread(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 当chatHistory或workspace改变时更新currentDialogHistory
  useEffect(() => {
    if (isHistoryOpen) {
      setCurrentDialogHistory(chatHistory);
    }
  }, [chatHistory, workspace, isHistoryOpen]);

  const getBackgroundColor = () => {
    if (theme === 'light') {
      return "bg-white";
    }
    return "bg-theme-bg-secondary";
  };

  // 创建新线程
  const createNewThread = async () => {
    setCreatingThread(true);
    const { thread, error } = await Workspace.threads.new(workspace.slug);
    if (!!error) {
      showToast(`无法创建线程 - ${error}`, "error", { clear: true });
      setCreatingThread(false);
      return;
    }
    window.location.replace(
      paths.workspace.thread(workspace.slug, thread.slug)
    );
  };

  // 删除线程
  const deleteThread = async (threadToDelete) => {
    if (
      !window.confirm(
        "确定要删除此线程吗？其所有聊天记录将被删除，且无法恢复。"
      )
    ) return;
    
    const success = await Workspace.threads.delete(workspace.slug, threadToDelete.slug);
    if (!success) {
      showToast("线程无法删除！", "error", { clear: true });
      return;
    }
    
    showToast("线程已成功删除！", "success", { clear: true });
    setThreads(prevThreads => prevThreads.filter(t => t.id !== threadToDelete.id));
    
    // 如果删除的是当前线程，则重定向到默认聊天
    if (threadSlug === threadToDelete.slug) {
      window.location.href = paths.workspace.chat(workspace.slug);
    }
  };

  // 开始编辑线程名称
  const startThreadRename = (thread) => {
    setEditingThread(thread.id);
    setEditThreadName(thread.name);
  };

  // 完成线程重命名
  const finishThreadRename = async (threadToRename) => {
    const name = editThreadName.trim();
    setEditingThread(null);
    
    if (!name || name === threadToRename.name || name.length === 0) {
      return; // 名称未改变或为空，不执行更新
    }

    const { message } = await Workspace.threads.update(
      workspace.slug,
      threadToRename.slug,
      { name }
    );
    
    if (!!message) {
      showToast(`线程无法更新！${message}`, "error", {
        clear: true,
      });
      return;
    }

    // 更新本地线程列表
    setThreads(prevThreads => 
      prevThreads.map(t => 
        t.id === threadToRename.id ? { ...t, name } : t
      )
    );

    // 触发线程重命名事件，以便其他组件可以更新
    window.dispatchEvent(
      new CustomEvent(THREAD_RENAME_EVENT, {
        detail: { threadSlug: threadToRename.slug, newName: name },
      })
    );

    showToast("线程已成功重命名！", "success", { clear: true });
  };

  // 获取当前线程名称
  const getCurrentThreadName = () => {
    if (!threadSlug) return "默认对话";
    
    const currentThread = threads.find(t => t.slug === threadSlug);
    return currentThread ? truncate(currentThread.name, 15) : "加载中...";
  };

  // 处理输入框按键事件
  const handleKeyDown = (e, thread) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishThreadRename(thread);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingThread(null);
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-between px-4 py-2 ${getBackgroundColor()} border-b border-theme-sidebar-border`}
        style={{ height: 57, minHeight: 57, zIndex: 10 }}
      >
        <div className="flex items-center">
          {/* 工作区名称 */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Note className="h-4 w-4 text-theme-text" />
            <span className="text-sm font-medium truncate max-w-[120px]">
              {workspace?.name || "工作区聊天"}
            </span>
          </div>

          {/* 线程选择器下拉框 */}
          <div className="relative mx-2" ref={threadDropdownRef}>
            <button 
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all"
              onClick={() => setShowThreadDropdown(!showThreadDropdown)}
            >
              <span className="text-sm text-theme-text truncate max-w-[100px]">
                {getCurrentThreadName()}
              </span>
              <CaretDown className="h-3 w-3 text-theme-text" />
            </button>
            
            {/* 线程下拉菜单 */}
            {showThreadDropdown && (
              <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 z-20 max-h-80 overflow-y-auto">
                {/* 默认线程选项 */}
                <a 
                  href={paths.workspace.chat(workspace.slug)}
                  className={`block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${!threadSlug ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                  onClick={() => setShowThreadDropdown(false)}
                >
                  默认对话
                </a>
                
                {/* 线程列表 */}
                {loadingThreads ? (
                  <div className="flex items-center justify-center py-4">
                    <CircleNotch className="h-5 w-5 text-theme-text animate-spin" />
                    <span className="ml-2 text-sm text-theme-text">加载线程...</span>
                  </div>
                ) : threads.length > 0 && (
                  <>
                    {threads.map(thread => (
                      <div key={thread.id} className="group">
                        <div className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${threadSlug === thread.slug ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                          {editingThread === thread.id ? (
                            <input
                              ref={editNameInputRef}
                              type="text"
                              className="text-sm bg-transparent border-b border-blue-500 focus:outline-none w-full py-0.5 px-0"
                              value={editThreadName}
                              onChange={(e) => setEditThreadName(e.target.value)}
                              onBlur={() => finishThreadRename(thread)}
                              onKeyDown={(e) => handleKeyDown(e, thread)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <a 
                              href={paths.workspace.thread(workspace.slug, thread.slug)}
                              className="text-sm text-theme-text truncate flex-grow"
                              onClick={() => setShowThreadDropdown(false)}
                            >
                              {truncate(thread.name, 25)}
                            </a>
                          )}
                          {!editingThread && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startThreadRename(thread);
                                }}
                                title="重命名线程"
                              >
                                <PencilSimple className="h-3.5 w-3.5 text-theme-text" />
                              </button>
                              <button
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteThread(thread);
                                }}
                                title="删除线程"
                              >
                                <Trash className="h-3.5 w-3.5 text-theme-text" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {/* 新建线程按钮 - 移出条件逻辑，始终显示 */}
                <button
                  className="w-full flex items-center px-4 py-2 text-sm text-theme-text hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                  onClick={createNewThread}
                  disabled={creatingThread}
                >
                  {creatingThread ? (
                    <>
                      <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                      创建线程中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      新建线程
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* 从工作区卡片移动过来的上传和设置按钮 */}
          {user?.role !== "default" && workspace?.slug && (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to={
                  isInWorkspaceSettings
                    ? paths.workspace.chat(workspace.slug)
                    : paths.workspace.settings.generalAppearance(
                        workspace.slug
                      )
                }
                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="工作区设置"
                title="工作区设置"
              >
                <GearSix
                  color={
                    isInWorkspaceSettings ? "#46C8FF" : undefined
                  }
                  size={18}
                  weight="bold"
                />
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ActionIcon
            icon={Share}
            onClick={() => alert("分享功能暂未实现")}
            title={t("share") || "分享"}
          />
          <ActionIcon
            icon={SidebarSimple}
            onClick={toggleSidebar}
            title={t("documentSidebar.toggle") || "切换文档侧边栏"}
            active={showSidebar}
          />
          <ActionIcon
            icon={Gear}
            onClick={() => window.location.href = "/settings"}
            title={t("settings") || "设置"}
          />
        </div>
      </div>
      
      {/* 历史对话弹窗 */}
      <HistoryDialog 
        open={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen} 
        workspace={workspace}
        chatHistory={currentDialogHistory}
      />
      
      {/* 上传文档模态框 */}
      {showing && (
        <ManageWorkspace
          hideModal={hideModal}
          providedSlug={workspace?.slug || null}
        />
      )}
    </>
  );
}

export default ChatHeader;