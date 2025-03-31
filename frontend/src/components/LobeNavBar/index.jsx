import React from "react";
import { ChatCircleDots, BookOpen, Gear } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import paths from "@/utils/paths";
import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";
import { useTheme } from "@/hooks/useTheme";

// 导航项定义
const NAV_ITEMS = [
  { 
    key: 'chat',
    icon: ChatCircleDots,
    path: paths.home(),
    label: '对话'
  },
  { 
    key: 'knowledge',
    icon: BookOpen,
    path: '/knowledge',
    label: '知识库'
  }
];

// 用户头像组件
function UserAvatar({ onClick }) {
  const { user } = useUser();
  const { theme } = useTheme();
  
  return (
    <div 
      onClick={onClick}
      className={`w-11 h-11 rounded-full overflow-hidden cursor-pointer border-2 ${theme === 'light' ? 'border-gray-100 hover:border-gray-200' : 'border-theme-sidebar-border hover:border-theme-hover'} transition-all`}
    >
      <img 
        src={user?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=anythingllm'} 
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// 导航项组件
function NavItem({ icon: Icon, active, onClick, label }) {
  const { theme } = useTheme();
  
  // 根据主题选择背景色
  const getBackgroundColor = () => {
    if (active) {
      if (theme === 'light') {
        return "bg-[rgba(0,0,0,0.03)] text-gray-900";
      }
      return "bg-[rgba(255,255,255,0.1)] text-white";
    }
    
    if (theme === 'light') {
      return "text-gray-700 hover:bg-gray-100 hover:text-gray-900";
    }
    
    return "text-theme-text-subtle hover:bg-theme-hover hover:text-theme-text";
  };

  // 根据主题选择选中状态指示器的背景色
  const getActiveIndicatorStyle = () => {
    if (active) {
      return "absolute -left-3 w-1.5 h-5 bg-blue-500 rounded-r-md";
    }
    return "";
  };

  return (
    <div className="relative flex items-center justify-center my-3">
      <button
        onClick={onClick}
        className={`flex items-center justify-center w-11 h-11 rounded-lg transition-all ${getBackgroundColor()}`}
        title={label}
      >
        <Icon size={22} weight={active ? "fill" : "regular"} />
      </button>
      {active && <div className={getActiveIndicatorStyle()}></div>}
    </div>
  );
}

export default function LobeNavBar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // 检查当前路径是否匹配导航项
  const isActive = (path) => {
    // 特殊处理聊天按钮：当路径是工作区路径时，聊天按钮也应该显示为选中状态
    if (path === paths.home() && location.pathname.includes('/workspace/')) {
      return true;
    }
    
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  // 根据主题设置背景色
  const getNavBarBackground = () => {
    if (theme === 'light') {
      return "bg-white";
    }
    return "bg-theme-bg-sidebar";
  };

  return (
    <div
      style={{ width: "60px" }}
      className={`h-screen fixed left-0 top-0 z-20 ${getNavBarBackground()} flex flex-col border-r border-theme-sidebar-border`}
    >
      <div className="flex flex-col h-full">
        {/* 顶部用户头像 - 仅显示头像，不带链接功能 */}
        <div className="flex justify-center items-center" style={{ height: 57, minHeight: 57 }}>
          <UserAvatar />
        </div>
        
        {/* 导航菜单 */}
        <div className="flex-grow flex flex-col items-center py-3">
          {NAV_ITEMS.map((item) => (
            <NavItem 
              key={item.key}
              icon={item.icon}
              label={t(`sidebar.${item.key}`) || item.label}
              active={isActive(item.path)}
              onClick={() => window.location.href = item.path}
            />
          ))}
        </div>
        
        {/* 底部设置按钮 */}
        <div className="flex flex-col items-center pb-6">
          <NavItem 
            icon={Gear}
            label={t("settings") || "设置"}
            active={isActive('/settings')}
            onClick={() => window.location.href = '/settings/appearance'}
          />
        </div>
      </div>
    </div>
  );
}