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
import { useWorkspaceTransition } from "@/components/WorkspaceTransition";

export default function WorkspaceChat() {
  const { loading, requiresAuth, mode } = usePasswordModal();

  if (loading) return <FullScreenLoader />;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return <ShowWorkspaceChat />;
}

function ShowWorkspaceChat() {
  const { slug } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { showSidebar } = useSidebarToggle();
  const prevSlugRef = useRef(null);
  const prevWorkspaceRef = useRef(null);
  const { endTransition } = useWorkspaceTransition();

  useEffect(() => {
    // 如果slug变化，标记为过渡状态
    if (prevSlugRef.current && prevSlugRef.current !== slug) {
      setIsTransitioning(true);
      setLoading(true);
      // 保留上一个workspace数据，直到新数据加载完成
      prevWorkspaceRef.current = workspace;
    }
    prevSlugRef.current = slug;
    
    async function getWorkspace() {
      if (!slug) return;

      try {
        const _workspace = await Workspace.bySlug(slug);  
        if (!_workspace) {
          setLoading(false);
          // 延迟关闭过渡状态，以便进行平滑过渡
          setTimeout(() => {
            setIsTransitioning(false);
            endTransition(); // 结束全局过渡状态
          }, 300);
          return;
        }
        
        const [suggestedMessages, pfpUrl] = await Promise.all([
          Workspace.getSuggestedMessages(slug),
          Workspace.fetchPfp(slug)
        ]);
        
        const workspaceData = {
          ..._workspace,
          suggestedMessages,
          pfpUrl,
        };
        
        setWorkspace(workspaceData);
      } catch (error) {
        console.error("Error fetching workspace:", error);
      } finally {
        // 确保加载状态最后才结束
        setLoading(false);
        // 延长过渡时间以确保更平滑的过渡
        setTimeout(() => {
          setIsTransitioning(false);
          endTransition(); // 结束全局过渡状态
        }, 300);
      }
    }
    
    getWorkspace();
  }, [slug, endTransition]);

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
            loading={loading} 
            workspace={isTransitioning && prevWorkspaceRef.current ? prevWorkspaceRef.current : workspace} 
          />
        </div>
      </div>
    </>
  );
}