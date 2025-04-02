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
import { useUser } from "@/contexts/UserContext";

export default function WorkspaceChatComponent() {
  const { slug, threadSlug = null } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const { user } = useUser();
  const isMounted = useRef(true);

  const isDefaultWorkspace = workspace ? Workspace.isDefaultWorkspace(workspace.id) : false;

  useEffect(() => {
    isMounted.current = true;
    async function loadWorkspaceAndHistory() {
      if (!slug) {
        console.log("[WorkspaceChat Effect] No slug provided, skipping load.");
        setLoading(false);
        setError("No workspace slug provided.");
        return;
      }

      setLoading(true);
      setFadeIn(false);
      console.log("WorkspaceChat: Loading data for slug:", slug);

      try {
        console.log("[ChatComponent Effect] TRY block START");
        const _workspace = await Workspace.bySlug(slug);
        if (!isMounted.current) return;
        if (!_workspace) {
          console.error("WorkspaceChat: Workspace not found for slug:", slug);
          setWorkspace(null);
          setHistory([]);
          return;
        }

        const [suggestedMessages, pfpUrl] = await Promise.all([
          Workspace.getSuggestedMessages(slug),
          Workspace.fetchPfp(slug)
        ]);
         if (!isMounted.current) return;
        const workspaceData = { ..._workspace, suggestedMessages, pfpUrl };
        setWorkspace(workspaceData);

        console.log("WorkspaceChat: Loading chat history for", { slug, threadSlug });
        const chatHistory = threadSlug
          ? await Workspace.threads.chatHistory(slug, threadSlug)
          : await Workspace.chatHistory(slug);
         if (!isMounted.current) return;
        setHistory(chatHistory);
        console.log("WorkspaceChat: Chat history loaded", { count: chatHistory.length, slug });
        console.log("[ChatComponent Effect] TRY block END - Before finally");

      } catch (error) {
        console.error("[ChatComponent Effect] CATCH block START", error);
        if (isMounted.current) {
          setWorkspace(null);
          setHistory([]);
        }
         console.error("[ChatComponent Effect] CATCH block END - Before finally");
      } finally {
        console.log("[ChatComponent Effect] FINALLY block START");
        if (isMounted.current) {
            setLoading(false);
            console.log("[ChatComponent Effect] FINALLY block - setLoading(false) called");
            setTimeout(() => { if(isMounted.current) setFadeIn(true) }, 50);
        }
      }
    }

    loadWorkspaceAndHistory();

     return () => {
        isMounted.current = false;
        console.log("[ChatComponent Effect] Cleanup - component unmounted or dependencies changed.");
    }
  }, [slug, threadSlug]);

  const toggleDocumentSidebar = () => {
    setShowDocumentSidebar(prevState => !prevState);
  };

  if (loading) {
    console.log("[WorkspaceChat Render] Showing loader");
    return <SkeletonChat />;
  }

  if (!workspace) {
    console.log("[WorkspaceChat Render] No workspace found, showing error/empty state");
    return (
      <div className="flex w-full h-full items-center justify-center">
        <p className="text-gray-500 text-center">Workspace not found.</p>
      </div>
    );
  }

  console.log("[WorkspaceChat Render] Rendering main chat interface");
  return (
    <div className={`flex h-full w-full relative transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {showDocumentSidebar && (
        <div className="h-full border-r border-theme-sidebar-border flex-shrink-0" style={{ backgroundColor: "var(--theme-file-row-even)" }}>
          <DocumentFileSidebar workspace={workspace} onClose={toggleDocumentSidebar} />
        </div>
      )}

      <DnDFileUploaderProvider workspace={workspace}>
        <div className="flex flex-col flex-grow h-full overflow-hidden">
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
          <div className="flex-grow h-[calc(100%-57px)] overflow-hidden" style={{ backgroundColor: "var(--theme-bg-chat)" }}>
            <ChatContainer
              workspace={workspace}
              knownHistory={history}
              showSidebar={showDocumentSidebar}
              toggleSidebar={toggleDocumentSidebar}
            />
          </div>
        </div>
      </DnDFileUploaderProvider>
    </div>
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
