import React from "react";
import DefaultChatContainer from "@/components/DefaultChat";
import Sidebar from "@/components/Sidebar";
import LobeNavBar from "@/components/LobeNavBar";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { isMobile } from "react-device-detect";
import { FullScreenLoader } from "@/components/Preloader";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";

export default function Main() {
  const { loading, requiresAuth, mode } = usePasswordModal();
  const { showSidebar } = useSidebarToggle();

  if (loading) return <FullScreenLoader />;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return (
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
        <DefaultChatContainer />
      </div>
    </div>
  );
}
