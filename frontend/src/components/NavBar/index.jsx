import React from "react";
import { ChatCircleDots, Folder, BookOpen, User, Gear, Plus, Robot } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import paths from "@/utils/paths";
import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";

// 导航项定义
const NAV_ITEMS = [
  { 
    key: 'chat',
    icon: ChatCircleDots,
    path: paths.home(),
    label: '对话'
  },
  { 
    key: 'files',
    icon: Folder,
    path: '/files',
    label: '文件'
  },
  { 
    key: 'knowledge',
    icon: BookOpen,
    path: '/knowledge',
    label: '知识库'
  },
  {
    key: 'profile',
    icon: User,
    path: '/profile',
    label: '个人资料'
  }
];

// 导航项组件
function NavItem({ icon: Icon, active, onClick, label }) {
  return (
    <div className="relative flex items-center justify-center my-3">
      <button
        onClick={onClick}
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${active ? 'bg-blue-500 shadow-md text-white' : 'text-theme-text-subtle hover:bg-theme-hover hover:text-theme-text'}`}
        title={label}
      >
        <Icon size={22} weight={active ? "fill" : "regular"} />
      </button>
      {active && <div className="absolute -left-3 w-1.5 h-5 bg-blue-500 rounded-r-md"></div>}
    </div>
  );
}

export default function NavBar() {
  const { user } = useUser();
  const location = useLocation();
  const { t } = useTranslation();

  // 检查当前路径是否匹配导航项
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div
      style={{ width: "60px" }}
      className="h-screen fixed left-0 top-0 z-20 bg-theme-bg-sidebar flex flex-col border-r border-theme-sidebar-border"
    >
      <div className="flex flex-col h-full">
        {/* Logo部分 */}
        <div className="flex justify-center items-center h-16 border-b border-theme-sidebar-border">
          <Link to={paths.home()} aria-label="Home">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-xl text-white">
              <Robot size={24} weight="fill" />
            </div>
          </Link>
        </div>
        
        {/* 导航菜单 */}
        <div className="flex-grow flex flex-col items-center py-3">
          {NAV_ITEMS.map((item) => (
            <NavItem 
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => window.location.href = item.path}
            />
          ))}

          {/* 新建会话按钮 */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => window.location.href = paths.newWorkspace()}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500 text-white shadow-md hover:bg-blue-600 transition-colors"
              title={t("new-workspace.title")}
            >
              <Plus size={2} weight="bold" />
            </button>
          </div>
        </div>
        
        {/* 底部设置按钮 */}
        <div className="flex flex-col items-center pb-6">
          <NavItem 
            icon={Gear}
            label="设置"
            active={isActive('/settings')}
            onClick={() => window.location.href = '/settings'}
          />
          <div className="w-10 h-10 rounded-full overflow-hidden mt-3 border-2 border-theme-sidebar-border cursor-pointer">
            <img 
              src={user?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=anythingllm'} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}