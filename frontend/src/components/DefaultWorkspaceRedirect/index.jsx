import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import { FullScreenLoader } from "@/components/Preloader";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import Sidebar from "@/components/Sidebar";
import LobeNavBar from "@/components/LobeNavBar";
import { isMobile } from "react-device-detect";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";

export default function DefaultWorkspaceRedirect() {
  const [loading, setLoading] = useState(true);
  const [defaultWorkspace, setDefaultWorkspace] = useState(null);
  const { loading: passwordLoading, requiresAuth, mode } = usePasswordModal();
  const { showSidebar } = useSidebarToggle();

  useEffect(() => {
    async function fetchDefaultWorkspace() {
      try {
        // 使用新的getDefaultWorkspace方法获取默认工作区
        const workspace = await Workspace.getDefaultWorkspace();
        console.log("Default workspace:", workspace);
        setDefaultWorkspace(workspace);
      } catch (error) {
        console.error("获取默认工作区失败:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDefaultWorkspace();
  }, []);

  if (passwordLoading || loading) return <FullScreenLoader />;
  
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  // 如果没有找到工作区，仍显示侧边栏
  if (!defaultWorkspace) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        {!isMobile && (
          <>
            <LobeNavBar />
            {showSidebar && <Sidebar />}
          </>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <h2 className="text-xl font-medium mb-2">没有可用的工作区</h2>
            <p className="text-sm text-theme-text-subtle mb-4">请创建一个新的工作区开始使用</p>
            <a
              href={paths.newWorkspace()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              创建工作区
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 重定向到默认工作区
  return <Navigate to={`/workspace/${defaultWorkspace.slug}`} replace />;
}