import React, { useEffect, useState, useRef } from "react";
import { default as WorkspaceChatContainer } from "@/components/WorkspaceChat";
import Sidebar from "@/components/Sidebar";
import LobeNavBar from "@/components/LobeNavBar";
import { useParams } from "react-router-dom";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { isMobile } from "react-device-detect";
import { FullScreenLoader } from "@/components/Preloader";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";

export default function WorkspaceChat() {
  console.log("FLAG-WorkspaceChat: loading");
  const { loading: passwordLoading, requiresAuth, mode } = usePasswordModal();

  if (passwordLoading) return <FullScreenLoader />;
  // 如果需要认证且认证状态不为空，显示密码模态框
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return <ShowWorkspaceChat />;
}

function ShowWorkspaceChat() {
  const { slug } = useParams();
  const { showSidebar } = useSidebarToggle();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-theme-bg-primary">
      <div className="flex w-full h-full overflow-hidden">
        {!isMobile && (
          <>
            <LobeNavBar />
            {showSidebar && <Sidebar />}
          </>
        )}
        <div 
          className={`flex-1 ${!isMobile && showSidebar ? 'ml-[352px]' : !isMobile ? 'ml-[60px]' : ''} transition-all duration-300 ease-in-out overflow-y-hidden overflow-x-auto`}
        >
          <WorkspaceChatContainer 
            workspaceSlug={slug}
          />
        </div>
      </div>
    </div>
  );
}