import React, { useEffect, useState, useRef } from "react";
import Workspace from "@/models/workspace";
import LoadingChat from "./LoadingChat";
import SkeletonChat from "./SkeletonChat";
import ChatContainer from "./ChatContainer";
import ChatHeader from "./ChatHeader";
import DocumentFileSidebar from "@/components/DocumentFileSidebar";
import paths from "@/utils/paths";
import ModalWrapper from "../ModalWrapper";
import { useParams } from "react-router-dom";
import { DnDFileUploaderProvider } from "./ChatContainer/DnDWrapper";

export default function WorkspaceChat({ loading, workspace }) {

  const { threadSlug = null } = useParams();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(true); // 默认显示侧边栏
  const [isDefaultWorkspace, setIsDefaultWorkspace] = useState(false);
  const [currentWorkspaceSlug, setCurrentWorkspaceSlug] = useState(null); // 修改为null而不是workspace?.slug
  const [fadeIn, setFadeIn] = useState(false);
  const prevWorkspaceRef = useRef(workspace); // 保存先前的workspace引用

  console.log("组件渲染 - 状态值:", { 
    loadingHistory, 
    workspaceSlug: workspace?.slug, 
    currentWorkspaceSlug 
  });

  // 当数据加载完成时，触发淡入效果
  useEffect(() => {
    if (!loadingHistory && workspace) {
      // 短暂延迟以确保DOM已更新
      setTimeout(() => {
        setFadeIn(true);
      }, 150); // 增加延迟时间以确保过渡更平滑
    } else if (loading) {
      // 不要立即淡出，保持当前显示状态直到新内容准备好
      setTimeout(() => {
        setFadeIn(false);
      }, 50);
    }
  }, [loadingHistory, workspace, loading]);

  const toggleDocumentSidebar = () => {
    setShowDocumentSidebar(prevState => !prevState);
  };

  // 当工作区变化时，更新currentWorkspaceSlug以触发重新加载
  useEffect(() => {
    console.log("工作区变化检查:", { 
      condition: workspace?.slug !== currentWorkspaceSlug,
      workspaceSlug: workspace?.slug, 
      currentWorkspaceSlug 
    });
    
    // 如果是首次加载有效的工作区，只更新currentWorkspaceSlug不触发加载状态
    if (workspace?.slug && !currentWorkspaceSlug) {
      setCurrentWorkspaceSlug(workspace?.slug);
      return; // 重要：直接返回，不触发加载状态
    }
    
    // 正常的工作区切换逻辑，仅在明确切换不同工作区时执行
    if (workspace?.slug && currentWorkspaceSlug && workspace.slug !== currentWorkspaceSlug) {
      // 重要：使用渐变效果处理过渡
      setFadeIn(false);
      
      // 使用setTimeout确保状态更新在不同的渲染周期，并给足够的时间进行视觉过渡
      setTimeout(() => {
        // 先保存上一个工作区的状态
        prevWorkspaceRef.current = workspace;
        
        // 重要：先设置加载状态，然后才清除历史记录
        setLoadingHistory(true);
        console.log("FLAG-WorkspaceChat: loadingHistory-2", loadingHistory);
        setHistory([]);
        setCurrentWorkspaceSlug(workspace?.slug);
      }, 200);
    }
  }, [workspace?.slug, currentWorkspaceSlug]);

  // 根据工作区和线程加载聊天历史
  useEffect(() => {
    async function getHistory() {
      if (loading) return;
      if (!workspace?.slug) {
        setLoadingHistory(false);
        return false;
      }

      console.log("WorkspaceChat: loading chat history for", { 
        workspaceSlug: workspace.slug,
        threadSlug
      });

      try {
        const chatHistory = threadSlug
          ? await Workspace.threads.chatHistory(workspace.slug, threadSlug)
          : await Workspace.chatHistory(workspace.slug);

        console.log("WorkspaceChat: chat history loaded", { 
          count: chatHistory.length,
          workspaceSlug: workspace.slug
        });

        setHistory(chatHistory);
        setLoadingHistory(false);
      } catch (error) {
        console.error("WorkspaceChat: failed to load chat history", error);
        setHistory([]);
        setLoadingHistory(false);
      }
    }
    getHistory();
  }, [workspace?.slug, threadSlug, loading]);

  // Check if current workspace is the default one
  useEffect(() => {
    if (workspace?.id) {
      const isDefault = Workspace.isDefaultWorkspace(workspace.id);
      setIsDefaultWorkspace(isDefault);
    }
  }, [workspace]);
  if (loadingHistory) return <SkeletonChat />;

  // 如果不在加载状态且没有找到工作区，显示错误提示
  if (!loading && !loadingHistory && !workspace) {
    return (
      <>
        {/* 当确认加载完成且工作区不存在时显示模态框 */}
        {loading === false && !workspace && (
          <ModalWrapper isOpen={true}>
            <div className="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
              <div className="flex flex-col gap-y-4 w-full p-6 text-center">
                {/* 错误标题 */}
                <p className="font-semibold text-red-500 text-xl">
                  Workspace not found!
                </p>
                {/* 错误说明 */}
                <p className="text-sm mt-4 text-white">
                  It looks like a workspace by this name is not available.
                </p>

                {/* 返回首页按钮 */}
                <div className="flex w-full justify-center items-center mt-4">
                  <a
                    href={paths.home()}
                    className="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm flex items-center gap-x-2"
                  >
                    Go back to homepage
                  </a>
                </div>
              </div>
            </div>
          </ModalWrapper>
        )}
        {/* 显示加载骨架屏 */}
        <SkeletonChat />
      </>
    );
  }

  setEventDelegatorForCodeSnippets();
  return (
    <DnDFileUploaderProvider workspace={workspace}>
      <div className={`flex h-screen w-full relative transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* 主要内容区域 - 包含聊天容器和文档侧边栏 */}
        <div className="flex w-full h-full flex-col">
          {/* 顶部导航条 */}
          <div className="flex-shrink-0 z-10">
            <ChatHeader 
              workspace={{
                ...workspace,
                defaultWorkspace: isDefaultWorkspace
              }} 
              showSidebar={showDocumentSidebar} 
              toggleSidebar={toggleDocumentSidebar}
              chatHistory={history}
            />
          </div>
          
          {/* 聊天区域和文档侧边栏 */}
          <div className="flex flex-grow h-[calc(100%-57px)] overflow-hidden">
            {/* 聊天容器 */}
            <div className="flex-grow h-full" style={{ backgroundColor: "var(--theme-bg-chat)" }}>
              <ChatContainer 
                workspace={workspace} 
                knownHistory={history} 
                showSidebar={showDocumentSidebar}
                toggleSidebar={toggleDocumentSidebar}
              />
            </div>
            
            {/* 文档侧边栏 - 只在显示时占用空间 */}
            {showDocumentSidebar && (
              <div className="h-full border-l border-theme-sidebar-border w-[320px]" style={{ backgroundColor: "var(--theme-file-row-even)" }}>
                <DocumentFileSidebar workspace={workspace} onClose={toggleDocumentSidebar} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DnDFileUploaderProvider>
  );
}

// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;
  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);
  target.classList.add("text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
export function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
