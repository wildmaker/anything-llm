import React, { useState, useEffect } from "react";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Workspace from "@/models/workspace";
import NewWorkspaceModal, { useNewWorkspaceModal } from "../../Modals/NewWorkspace";
import ManageWorkspace, { useManageWorkspaceModal } from "../../Modals/ManageWorkspace";
import paths from "@/utils/paths";
import { useParams, useNavigate } from "react-router-dom";
import {
  GearSix,
  MagnifyingGlass,
  UploadSimple,
  DotsThree,
  CaretDown,
  Robot,
  PlusCircle,
  CircleNotch
} from "@phosphor-icons/react";
import useUser from "@/hooks/useUser";
import { Link, useMatch } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import showToast from "@/utils/toast";
import { useTheme } from "@/hooks/useTheme";
import { useWorkspaceTransition } from "@/components/WorkspaceTransition";

// 将样式直接应用于组件根元素
const sidebarStyle = (theme) => {
  return {
    backgroundColor: theme === 'light' ? '#ffffff' : '',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };
};

export default function ActiveWorkspaces() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultExpanded, setDefaultExpanded] = useState(true);
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const { user } = useUser();
  const { theme } = useTheme();
  const { startTransition } = useWorkspaceTransition();
  const isInWorkspaceSettings = !!useMatch("/workspace/:slug/settings/:tab");
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();

  useEffect(() => {
    // 应用全局样式以确保侧边栏为白色（light模式）
    if (theme === 'light') {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.style.backgroundColor = '#ffffff';
      }
    }

    async function getWorkspaces() {
      const workspaces = await Workspace.all();
      setLoading(false);
      const orderedWorkspaces = Workspace.orderWorkspaces(workspaces);
      setWorkspaces(orderedWorkspaces);
      setFilteredWorkspaces(orderedWorkspaces);
    }
    getWorkspaces();
  }, [theme]);

  // 搜索筛选工作区
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWorkspaces(workspaces);
      return;
    }

    const filtered = workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWorkspaces(filtered);
  }, [searchQuery, workspaces]);

  // 检查工作区是否为默认工作区
  const isDefaultWorkspace = (workspaceId) => {
    return Workspace.isDefaultWorkspace(workspaceId);
  };

  // 模拟日期标记的格式，与LobeChat保持一致
  const getDateMark = (id) => {
    const hash = Math.abs(id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const today = new Date();

    // 根据hash值决定日期是今天、最近的日期或者是固定格式的旧日期
    if (hash % 10 === 0) {
      return "今天";
    } else if (hash % 5 === 0) {
      const daysBefore = hash % 7 + 1;
      const date = new Date(today);
      date.setDate(today.getDate() - daysBefore);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    } else {
      // 固定格式如"03-18"
      const month = (hash % 12) + 1;
      const day = (hash % 28) + 1;
      return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  };

  if (loading) {
    return (
      <div style={sidebarStyle(theme)} className="p-3">
        <div className="flex items-center h-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 mb-2">
          <MagnifyingGlass className="text-gray-400" size={14} />
          <Skeleton.default
            height={16}
            width="100%"
            baseColor={theme === 'light' ? "red" : "var(--theme-sidebar-item-default)"}
            highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
            enableAnimation={true}
          />
        </div>
        <div className="mb-2">
          <Skeleton.default
            height={18}
            width="100%"
            baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
            highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
            enableAnimation={true}
            className="mb-1"
          />
          {[1, 2, 3].map((i) => (
            <Skeleton.default
              key={i}
              height={70}
              width="100%"
              baseColor={theme === 'light' ? "#f3f4f6" : "var(--theme-sidebar-item-default)"}
              highlightColor={theme === 'light' ? "#e5e7eb" : "var(--theme-sidebar-item-hover)"}
              enableAnimation={true}
              className="mb-1"
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Reorders workspaces in the UI via localstorage on client side.
   * @param {number} startIndex - the index of the workspace to move
   * @param {number} endIndex - the index to move the workspace to
   */
  function reorderWorkspaces(startIndex, endIndex) {
    const reorderedWorkspaces = Array.from(workspaces);
    const [removed] = reorderedWorkspaces.splice(startIndex, 1);
    reorderedWorkspaces.splice(endIndex, 0, removed);
    setWorkspaces(reorderedWorkspaces);

    if (searchQuery) {
      const newFilteredWorkspaces = reorderedWorkspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWorkspaces(newFilteredWorkspaces);
    } else {
      setFilteredWorkspaces(reorderedWorkspaces);
    }

    const success = Workspace.storeWorkspaceOrder(
      reorderedWorkspaces.map((w) => w.id)
    );
    if (!success) {
      showToast("工作区排序失败", "error");
      Workspace.all().then((workspaces) => {
        setWorkspaces(workspaces);
        setFilteredWorkspaces(
          searchQuery ?
            workspaces.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase())) :
            workspaces
        );
      });
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderWorkspaces(result.source.index, result.destination.index);
  };

  const createNewWorkspace = async () => {
    setCreatingWorkspace(true);
    setSelectedWs(null);
    showModal();
    setCreatingWorkspace(false);
  };

  // 获取随机图标颜色
  const getIconGradient = (id) => {
    const colorSets = [
      'from-blue-400 to-indigo-500',
      'from-green-400 to-teal-500',
      'from-purple-400 to-pink-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-purple-500'
    ];
    const hash = Math.abs(id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    return colorSets[hash % colorSets.length];
  };

  const handleWorkspaceClick = (e, workspace) => {
    e.preventDefault();
    if (!isActive && workspace.slug) {
      // 先启动过渡动画
      startTransition();
      
      // 延迟导航，让过渡效果有时间显示
      setTimeout(() => {
        navigate(paths.workspace.chat(workspace.slug));
      }, 100);
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme === 'light' ? 'bg-white' : ''}`}>
      {/* 搜索框 */}
      <div className="flex items-center px-3 pt-2 pb-1">
        <div className="relative flex-grow">
          <div className="flex items-center h-9 bg-gray-50 dark:bg-gray-800/40 rounded-lg px-2.5 focus-within:ring-1 focus-within:ring-blue-400">
            <MagnifyingGlass className="text-gray-400" size={15} />
            <input
              type="text"
              placeholder="搜索助手..."
              className="w-full bg-transparent border-none text-sm ml-1.5 focus:outline-none text-theme-text-primary h-7"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[10px] text-gray-400 opacity-60">
            ⌘ K
          </div>
        </div>
      </div>

      {/* 侧边栏内容 */}
      <div className="flex-grow overflow-y-auto px-3">
        {/* 默认对话区 */}
        <div className="flex flex-col mt-3 mb-4">
          <div
            className="flex items-center justify-between pb-1 mb-1 cursor-pointer"
            onClick={() => setDefaultExpanded(!defaultExpanded)}
          >
            <h3 className="text-sm text-gray-800 dark:text-gray-300 font-medium tracking-tight leading-[16.8px]">
              默认对话
            </h3>
            <CaretDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ease-in-out ${defaultExpanded ? '' : '-rotate-90'}`}
              weight="bold"
            />
          </div>

          <div
            className={`transition-all duration-300 ease-in-out ${defaultExpanded ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
          >
            <div
              className="flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer transition-colors group h-[70px]"
              onClick={(e) => {
                // 默认对话点击逻辑
                if (slug) {
                  navigate(paths.home());
                }
              }}
            >
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-500/10 text-blue-500 mr-3">
                  <Robot size={18} weight="fill" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-[16.8px]">智能助手</span>
              </div>
              <div className="flex items-center opacity-60">
                <div className="text-xs text-gray-400 mr-1">今天</div>
              </div>
            </div>
          </div>
        </div>

        {/* 工作区列表 */}
        <div className="flex flex-col mb-4">
          <div
            className="flex items-center justify-between pb-1 mb-1 cursor-pointer"
            onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
          >
            <h3 className="text-sm text-gray-800 dark:text-gray-300 font-medium tracking-tight leading-[16.8px]">
              默认列表
            </h3>
            <CaretDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ease-in-out ${workspacesExpanded ? '' : '-rotate-90'}`}
              weight="bold"
            />
          </div>

          <div
            className={`transition-all duration-300 ease-in-out ${workspacesExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="workspaces">
                {(provided) => (
                  <div
                    role="list"
                    aria-label="Workspaces"
                    className="flex flex-col"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {filteredWorkspaces.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        未找到工作区
                      </div>
                    ) : (
                      filteredWorkspaces.map((workspace, index) => {
                        const isActive = workspace.slug === slug;
                        const dateMark = getDateMark(workspace.id);
                        const gradient = getIconGradient(workspace.id);

                        return (
                          <Draggable
                            key={workspace.id}
                            draggableId={workspace.id.toString()}
                            index={index}
                            isDragDisabled={user?.role === "default" || isDefaultWorkspace(workspace.id)}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-2 ${snapshot.isDragging ? "opacity-70" : ""
                                  }`}
                                role="listitem"
                              >
                                <div
                                  onClick={(e) => handleWorkspaceClick(e, workspace)}
                                  className={`flex items-center justify-between px-4 py-4 rounded-lg transition-colors group h-[70px]
                                    ${isActive
                                      ? 'bg-blue-50 dark:bg-blue-900/20'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                                >
                                  <div className="flex items-center min-w-0">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br ${gradient} mr-3`}>
                                      <Robot size={18} weight="fill" className="text-white" />
                                    </div>

                                    <div className="flex-grow min-w-0">
                                      <div className="flex items-center">
                                        <span className={`text-sm truncate text-gray-800 dark:text-gray-100 ${isActive ? 'font-medium' : ''} leading-[16.8px]`}>
                                          {workspace.name}
                                        </span>
                                        {isDefaultWorkspace(workspace.id) && (
                                          <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                            默认
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center">
                                    <div className="text-xs text-gray-400 mr-2 opacity-60">{dateMark}</div>

                                    {!isDefaultWorkspace(workspace.id) && user?.role !== "default" && (
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-1"
                                      >
                                        <DotsThree
                                          size={16}
                                          className="text-gray-800 dark:text-gray-100 rotate-90"
                                          weight="bold"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* 底部新建按钮 */}
      <div className="px-3 pb-3">
        <button
          onClick={showNewWsModal}
          // 通过 disabled 属性控制按钮状态，当 creatingWorkspace 为 true 时禁用按钮
          // 防止用户在创建工作区过程中重复点击，避免并发创建多个工作区
          // 同时配合 UI 中的 loading 状态（旋转图标）提供视觉反馈
          disabled={showing}
          className="flex items-center justify-center w-full py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        >
          {creatingWorkspace ? (
            <CircleNotch size={16} className="animate-spin mr-1" />
          ) : (
            <PlusCircle size={16} className="mr-1" />
          )}
          <span className="text-sm font-medium">新建工作区</span>
        </button>
      </div>
      {/* 当 showingNewWsModal 为 true 时，渲染新建工作区模态框组件 */}
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
    </div>
  );
}
