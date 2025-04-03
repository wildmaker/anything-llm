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

export default function WorkspaceChat({ loading: externalLoading, workspace: externalWorkspace }) {
  const { threadSlug = null } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(true); // 保留
  const [isDefaultWorkspace, setIsDefaultWorkspace] = useState(false); // 保留
  const [fadeIn, setFadeIn] = useState(false); // 保留

  useEffect(() => {
    // 当外部传入了工作区数据时，直接使用它
    if (externalWorkspace) {
      console.log("WorkspaceChat: Using externally provided workspace data", externalWorkspace.name);
      setWorkspace(externalWorkspace);
      setIsDefaultWorkspace(Workspace.isDefaultWorkspace(externalWorkspace.id));
      setFadeIn(false); // 重置淡入状态
      
      // 短暂延迟后激活淡入效果
      setTimeout(() => setFadeIn(true), 50);
    }
  }, [externalWorkspace]);

  // 监控外部加载状态
  useEffect(() => {
    if (externalLoading !== undefined) {
      console.log("WorkspaceChat: External loading state changed:", externalLoading);
      setLoading(externalLoading);
    }
  }, [externalLoading]);
  
  // 加载聊天历史
  useEffect(() => {
    let isMounted = true;
    async function loadChatHistory() {
      if (!externalWorkspace?.slug) return;
      
      console.log("WorkspaceChat: Loading chat history for", { 
        workspace: externalWorkspace.slug, 
        threadSlug 
      });
      
      try {
        const chatHistory = threadSlug
          ? await Workspace.threads.chatHistory(externalWorkspace.slug, threadSlug)
          : await Workspace.chatHistory(externalWorkspace.slug);
          
        if (!isMounted) return;
        setHistory(chatHistory);
        console.log("WorkspaceChat: Chat history loaded", { 
          count: chatHistory.length, 
          workspace: externalWorkspace.slug 
        });
      } catch (error) {
        console.error("WorkspaceChat: Error loading chat history:", error);
        if (isMounted) setHistory([]);
      }
    }
    
    loadChatHistory();
    
    return () => {
      isMounted = false;
      console.log("ChatHistory effect cleanup");
    };
  }, [externalWorkspace?.slug, threadSlug]);

  const toggleDocumentSidebar = () => {
    setShowDocumentSidebar(prevState => !prevState);
  };

  if (!loading && !workspace && externalWorkspace?.slug) {
     return (
       <>
         <ModalWrapper isOpen={true}>
           <div className="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
             <div className="flex flex-col gap-y-4 w-full p-6 text-center">
               <p className="font-semibold text-red-500 text-xl">
                 Workspace not found!
               </p>
               <p className="text-sm mt-4 text-white">
                 Could not find a workspace with slug "{externalWorkspace?.slug}".
               </p>
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
         <SkeletonChat />
       </>
     );
  }

  setEventDelegatorForCodeSnippets();
  return loading ? (
    <SkeletonChat />
  ) : (
    workspace && (
      <DnDFileUploaderProvider workspace={workspace}>
        <div className={`flex h-screen w-full relative transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex w-full h-full flex-col">
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
            <div className="flex flex-grow h-[calc(100%-57px)] overflow-hidden">
              <div className="flex-grow h-full" style={{ backgroundColor: "var(--theme-bg-chat)" }}>
                <ChatContainer
                  workspace={workspace}
                  knownHistory={history}
                  showSidebar={showDocumentSidebar}
                  toggleSidebar={toggleDocumentSidebar}
                />
              </div>
              {showDocumentSidebar && (
                <div className="h-full border-l border-theme-sidebar-border w-[320px]" style={{ backgroundColor: "var(--theme-file-row-even)" }}>
                  <DocumentFileSidebar workspace={workspace} onClose={toggleDocumentSidebar} />
                </div>
              )}
            </div>
          </div>
        </div>
      </DnDFileUploaderProvider>
    )
  );
}

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

export function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
