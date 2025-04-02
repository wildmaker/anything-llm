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

export default function WorkspaceChat({ workspaceSlug }) {
  const { threadSlug = null } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(true); // 保留
  const [isDefaultWorkspace, setIsDefaultWorkspace] = useState(false); // 保留
  const [fadeIn, setFadeIn] = useState(false); // 保留

  useEffect(() => {
    let isMounted = true; // Add isMounted flag for cleanup
    async function loadWorkspaceAndHistory() {
      if (!workspaceSlug) {
        setLoading(false);
        setWorkspace(null);
        setHistory([]);
        return;
      }

      setLoading(true);
      setFadeIn(false); // 开始加载时淡出
      console.log("WorkspaceChat: Loading data for slug:", workspaceSlug);

      try {
        console.log("[ChatComponent Effect] TRY block START"); // <--- 日志 A
        // 加载工作区数据
        const _workspace = await Workspace.bySlug(workspaceSlug);
        if (!isMounted) return; // Check after await
        if (!_workspace) {
          console.error("WorkspaceChat: Workspace not found for slug:", workspaceSlug);
          setWorkspace(null);
          setHistory([]);
          // setLoading(false); // Moved to finally
          return;
        }

        // 加载附加信息
        const [suggestedMessages, pfpUrl] = await Promise.all([
          Workspace.getSuggestedMessages(workspaceSlug),
          Workspace.fetchPfp(workspaceSlug)
        ]);
         if (!isMounted) return; // Check after await
        const workspaceData = { ..._workspace, suggestedMessages, pfpUrl };
        setWorkspace(workspaceData);
        setIsDefaultWorkspace(Workspace.isDefaultWorkspace(workspaceData.id)); // 更新默认状态

        // 加载聊天历史
        console.log("WorkspaceChat: Loading chat history for", { workspaceSlug, threadSlug });
        const chatHistory = threadSlug
          ? await Workspace.threads.chatHistory(workspaceSlug, threadSlug)
          : await Workspace.chatHistory(workspaceSlug);
         if (!isMounted) return; // Check after await
        setHistory(chatHistory);
        console.log("WorkspaceChat: Chat history loaded", { count: chatHistory.length, workspaceSlug });
        console.log("[ChatComponent Effect] TRY block END - Before finally"); // <--- 日志 B

      } catch (error) {
        console.error("[ChatComponent Effect] CATCH block START", error); // <--- 日志 C
        if (isMounted) {
          setWorkspace(null); // 出错时重置
          setHistory([]);
        }
         console.error("[ChatComponent Effect] CATCH block END - Before finally"); // <--- 日志 D
      } finally {
        console.log("[ChatComponent Effect] FINALLY block START"); // <--- 日志 E
        if (isMounted) {
            setLoading(false);
            console.log("[ChatComponent Effect] FINALLY block - setLoading(false) called"); // <--- 日志 F
            // 数据加载完成后淡入
            setTimeout(() => { if(isMounted) setFadeIn(true) }, 50); // 短暂延迟以确保渲染
        }
      }
    }

    loadWorkspaceAndHistory();

     return () => {
        isMounted = false; // Cleanup on unmount
        console.log("[ChatComponent Effect] Cleanup - component unmounted or dependencies changed.");
    }
    // 依赖 workspaceSlug 和 threadSlug
  }, [workspaceSlug, threadSlug]);

  const toggleDocumentSidebar = () => {
    setShowDocumentSidebar(prevState => !prevState);
  };

  if (!loading && !workspace && workspaceSlug) {
     return (
       <>
         <ModalWrapper isOpen={true}>
           <div className="relative w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border">
             <div className="flex flex-col gap-y-4 w-full p-6 text-center">
               <p className="font-semibold text-red-500 text-xl">
                 Workspace not found!
               </p>
               <p className="text-sm mt-4 text-white">
                 Could not find a workspace with slug "{workspaceSlug}".
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
