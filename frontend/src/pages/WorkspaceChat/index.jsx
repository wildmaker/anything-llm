import React, { useEffect, useState, useRef } from "react";
import { default as WorkspaceChatContainer } from "@/components/WorkspaceChat";
import Sidebar from "@/components/Sidebar";
import LobeNavBar from "@/components/LobeNavBar";
import { useParams } from "react-router-dom";
import Workspace from "@/models/workspace";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { isMobile } from "react-device-detect";
import { FullScreenLoader } from "@/components/Preloader";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";

export default function WorkspaceChat() {
  const { loading: passwordLoading, requiresAuth, mode } = usePasswordModal();
  console.log("FLAG-WorkspaceChat: I-RUN", passwordLoading);
  if (passwordLoading) return <FullScreenLoader />;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return <ShowWorkspaceChat />;
}

function ShowWorkspaceChat() {
  const { slug } = useParams();
  const { showSidebar } = useSidebarToggle();
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getWorkspace() {
      console.log(`[ShowWorkspaceChat] Loading workspace data for slug: ${slug}`);
      setLoading(true);
      if (!slug) {
        console.log(`[ShowWorkspaceChat] No slug provided, ending load`);
        setLoading(false);
        return;
      }
      
      try {
        const _workspace = await Workspace.bySlug(slug);
        if (!_workspace) {
          console.log(`[ShowWorkspaceChat] Workspace not found for slug: ${slug}`);
          setLoading(false);
          return;
        }

        // 获取额外的数据，以匹配原始仓库的实现
        console.log(`[ShowWorkspaceChat] Fetching additional data (suggestedMessages, pfpUrl)...`);
        const suggestedMessages = await Workspace.getSuggestedMessages(slug);
        const pfpUrl = await Workspace.fetchPfp(slug);
        
        console.log(`[ShowWorkspaceChat] Workspace data loaded for: ${_workspace.name}`);
        setWorkspace({
          ..._workspace,
          suggestedMessages,
          pfpUrl,
        });
      } catch (error) {
        console.error(`[ShowWorkspaceChat] Error loading workspace:`, error);
      } finally {
        console.log(`[ShowWorkspaceChat] Setting loading to false`);
        setLoading(false);
      }
    }
    getWorkspace();
  }, [slug]);

  return (
    <>
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        {!isMobile && (
          <>
            <LobeNavBar />
            {showSidebar && <Sidebar />}
          </>
        )}
        <div 
          className={`flex-1 ${!isMobile && showSidebar ? 'ml-[352px]' : !isMobile ? 'ml-[60px]' : ''} transition-all duration-300 ease-in-out`}
        >
          <WorkspaceChatContainer 
            key={slug}
            loading={loading}
            workspace={workspace}
          />
        </div>
      </div>
    </>
  );
}