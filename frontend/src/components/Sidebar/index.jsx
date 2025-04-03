import React, { useEffect, useRef, useState } from "react";
import { Plus, List, ChatCircleDots, Folder, Gear, Robot, User, BookOpen } from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import useLogo from "@/hooks/useLogo";
import useUser from "@/hooks/useUser";
import Footer from "../Footer";
import SettingsButton from "../SettingsButton";
import { Link, useLocation } from "react-router-dom";
import paths from "@/utils/paths";
import { useTranslation } from "react-i18next";
import { useSidebarToggle, ToggleSidebarButton } from "./SidebarToggle";
import SurveyBanner from "./surveyBanner";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "@/hooks/useTheme";

// 工作区列表项组件
function WorkspaceItem({ name, active, onClick }) {
  return (
    <div className="relative py-1.5 flex">
      <button
        onClick={onClick}
        className={`flex items-center rounded-md px-3 py-2 transition-all w-full ${active ? 'bg-theme-sidebar-item-selected' : 'hover:bg-theme-sidebar-item-hover'}`}
        title={name}
      >
        <div className="mr-3 w-6 h-6 rounded-md bg-blue-500/80 flex items-center justify-center text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm truncate">{name}</span>
      </button>
      {active && <div className="absolute left-0 w-1 h-6 top-1/2 -translate-y-1/2 bg-blue-500 rounded-r-md"></div>}
    </div>
  );
}

// 骨架屏组件
function SidebarSkeleton() {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* 工作区标题骨架 */}
      <div className="flex justify-between items-center px-4 border-b border-theme-sidebar-border"
           style={{ height: 57, minHeight: 57 }}>
        <Skeleton.default
          height={20}
          width={120}
          baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
          highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
          enableAnimation={true}
        />
        <Skeleton.default
          circle
          height={32}
          width={32}
          baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
          highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
          enableAnimation={true}
        />
      </div>
      
      {/* 工作区列表骨架 */}
      <div className="flex-grow overflow-y-auto px-2 py-2">
        {/* ActiveWorkspaces 组件会处理自己的骨架屏 */}
      </div>
      
      {/* 底部设置骨架 */}
      <div className="p-3 border-t border-theme-sidebar-border">
        <Skeleton.default
          height={40}
          width="100%"
          baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
          highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
          enableAnimation={true}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}

// 移动端骨架屏组件
function SidebarMobileSkeleton() {
  const { theme } = useTheme();
  
  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
      {/* Header Information Skeleton */}
      <div className="flex w-full items-center justify-between gap-x-4">
        <div className="flex shrink-1 w-fit items-center justify-start">
          <Skeleton.default
            height={40}
            width={120}
            baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
            highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
            enableAnimation={true}
            className="rounded"
          />
        </div>
        <div className="flex gap-x-2 items-center shink-0">
          <Skeleton.default
            circle
            height={32}
            width={32}
            baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
            highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
            enableAnimation={true}
          />
        </div>
      </div>

      {/* Primary Body Skeleton */}
      <div className="h-full flex flex-col w-full justify-between pt-4">
        <div className="h-auto md:sidebar-items">
          <div className="flex flex-col gap-y-4 overflow-y-scroll no-scroll pb-[60px]">
            <div className="flex gap-x-2 items-center justify-between">
              <Skeleton.default
                height={44}
                width="75%"
                baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
                highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
                enableAnimation={true}
                className="rounded-lg"
              />
            </div>
            {/* Workspace Items Skeleton */}
            {[1, 2, 3].map((i) => (
              <Skeleton.default
                key={i}
                height={70}
                width="100%"
                baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
                highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
                enableAnimation={true}
                className="rounded-lg mb-2"
              />
            ))}
          </div>
        </div>
        {/* Footer Skeleton */}
        <div className="z-99 absolute bottom-0 left-0 right-0 pt-2 pb-6 rounded-br-[26px] bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md">
          <Skeleton.default
            height={30}
            width="100%"
            baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
            highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
            enableAnimation={true}
          />
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useUser();
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { showSidebar, setShowSidebar, canToggleSidebar } = useSidebarToggle();
  const [loading, setLoading] = useState(true);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const { t } = useTranslation();
  
  // 添加加载状态
  useEffect(() => {
    // 模拟加载延迟，实际情况下可能从某个API或状态获取
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 检查当前路径是否匹配工作区
  const getActiveWorkspace = (pathname) => {
    const match = pathname.match(/\/workspace\/([^\/]+)/);
    return match ? match[1] : null;
  };

  return (
    <>
      <div
        style={{
          width: showSidebar ? "292px" : "0px",
          transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s",
          left: "60px" // 调整位置，确保在LobeNavBar右侧
        }}
        className="h-screen fixed top-0 z-10 bg-theme-bg-sidebar flex flex-col border-r border-theme-sidebar-border overflow-hidden shadow-sm"
      >
        {loading ? (
          <SidebarSkeleton />
        ) : (
          <div className="flex flex-col h-full w-full">
            {/* 工作区标题 */}
            <div className="flex justify-between items-center px-4 border-b border-theme-sidebar-border"
                 style={{ height: 57, minHeight: 57 }}>
              <h2 className="font-medium text-theme-text">{t("Instant AI ✨")}</h2>
              <button
                onClick={showNewWsModal}
                className="p-1.5 rounded-md hover:bg-theme-sidebar-item-hover transition-colors"
                title={t("new-workspace.title")}
              >
                <Plus size={18} /> 
              </button>
            </div>
            
            {/* 工作区列表 */}
            <div className="flex-grow overflow-y-auto px-2 py-2">
              <ActiveWorkspaces 
                workspaceItemComponent={WorkspaceItem} 
                activeWorkspace={getActiveWorkspace(location.pathname)}
              />
            </div>
            
            {/* 底部设置 */}
            <div className="p-3 border-t border-theme-sidebar-border">
              <SurveyBanner />
            </div>
          </div>
        )}
        {/* 当 showingNewWsModal 为 true 时，渲染新建工作区模态框组件 */}
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
    </>
  );
}

export function SidebarMobileHeader() {
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const { user } = useUser();
  const { t } = useTranslation();

  // 添加加载状态
  useEffect(() => {
    // 模拟加载延迟，实际情况下可能从某个API或状态获取
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Darkens the rest of the screen
    // when sidebar is open.
    function handleBg() {
      if (showSidebar) {
        setTimeout(() => {
          setShowBgOverlay(true);
        }, 300);
      } else {
        setShowBgOverlay(false);
      }
    }
    handleBg();
  }, [showSidebar]);

  return (
    <>
      <div
        aria-label="Show sidebar"
        className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-theme-bg-sidebar light:bg-white text-slate-200 shadow-lg h-16"
      >
        <button
          onClick={() => setShowSidebar(true)}
          className="rounded-md p-2 flex items-center justify-center text-theme-text-secondary"
        >
          <List className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-center flex-grow">
          {loading ? (
            <Skeleton.default
              height={40}
              width={120}
              baseColor={"var(--theme-sidebar-item-default)"}
              highlightColor={"var(--theme-sidebar-item-hover)"}
              enableAnimation={true}
              className="rounded"
            />
          ) : (
            <img
              src={logo}
              alt="Logo"
              className="block mx-auto h-6 w-auto"
              style={{ maxHeight: "40px", objectFit: "contain" }}
            />
          )}
        </div>
        <div className="w-12"></div>
      </div>
      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`,
        }}
        className={`z-99 fixed top-0 left-0 transition-all duration-500 w-[100vw] h-[100vh]`}
      >
        <div
          className={`${
            showBgOverlay
              ? "transition-all opacity-1"
              : "transition-none opacity-0"
          }  duration-500 fixed top-0 left-0 bg-theme-bg-secondary bg-opacity-75 w-screen h-screen`}
          onClick={() => setShowSidebar(false)}
        />
        <div
          ref={sidebarRef}
          className="relative h-[100vh] fixed top-0 left-0  rounded-r-[26px] bg-theme-bg-sidebar w-[80%] p-[18px] "
        >
          {loading ? (
            <SidebarMobileSkeleton />
          ) : (
            <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
              {/* Header Information */}
              <div className="flex w-full items-center justify-between gap-x-4">
                <div className="flex shrink-1 w-fit items-center justify-start">
                  <img
                    src={logo}
                    alt="Logo"
                    className="rounded w-full max-h-[40px]"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                {(!user || user?.role !== "default") && (
                  <div className="flex gap-x-2 items-center text-slate-500 shink-0">
                    <SettingsButton />
                  </div>
                )}
              </div>

              {/* Primary Body */}
              <div className="h-full flex flex-col w-full justify-between pt-4 ">
                <div className="h-auto md:sidebar-items">
                  <div className=" flex flex-col gap-y-4 overflow-y-scroll no-scroll pb-[60px]">
                    <div className="flex gap-x-2 items-center justify-between">
                      {(!user || user?.role !== "default") && (
                        <button
                          onClick={showNewWsModal}
                          className="flex flex-grow w-[75%] h-[44px] gap-x-2 py-[5px] px-4 bg-white rounded-lg text-sidebar justify-center items-center hover:bg-opacity-80 transition-all duration-300"
                        >
                          <Plus className="h-5 w-5" />
                          <p className="text-sidebar text-sm font-semibold">
                            {t("new-workspace.title")}
                          </p>
                        </button>
                      )}
                    </div>
                    <ActiveWorkspaces />
                  </div>
                </div>
                <div className="z-99 absolute bottom-0 left-0 right-0 pt-2 pb-6 rounded-br-[26px] bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md">
                  <Footer />
                </div>
              </div>
            </div>
          )}
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
    </>
  );
}
