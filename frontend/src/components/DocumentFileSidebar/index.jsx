import React, { useState, useEffect } from "react";
import { MagnifyingGlass, CaretDown, FileText, Export, ShareNetwork, FolderOpen, UploadSimple, 
  File, FileCode, FilePdf, FileXls, FileDoc, FileImage, FileZip, User } from "@phosphor-icons/react";
import System from "@/models/system";
import Workspace from "@/models/workspace";
import ManageWorkspace, { useManageWorkspaceModal } from "../Modals/ManageWorkspace";
import useUser from "@/hooks/useUser";

// 定义侧边栏宽度常量 - 匹配LobeChat样式
export const DOCUMENT_SIDEBAR_WIDTH = "320px";
// 定义中等屏幕尺寸下的侧边栏宽度
export const DOCUMENT_SIDEBAR_WIDTH_MEDIUM = "280px";

// 自定义钩子用于检测中等屏幕尺寸
function useMediumScreen() {
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMediumScreen(width >= 900 && width <= 1300);
    };
    
    // 初始检查
    checkScreenSize();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkScreenSize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  return isMediumScreen;
}

function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return 'FILE';
  return filename.split(".").pop().toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function getRandomColor(id) {
  const colors = [
    "bg-purple-500", // 调整顺序以匹配Instant-AI的颜色
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  return colors[parseInt(id) % colors.length];
}

function parseMetadata(metadataString) {
  if (!metadataString) return {};
  
  if (typeof metadataString === 'object' && metadataString !== null) {
    return metadataString;
  }
  
  try {
    return JSON.parse(metadataString);
  } catch (e) {
    console.error("Error parsing document metadata:", e);
    return {};
  }
}

// 根据文件类型获取对应的图标组件
function getFileTypeIcon(fileType) {
  const type = fileType.toLowerCase();
  
  // 根据不同的文件类型返回对应的图标
  switch (type) {
    case 'pdf':
      return <FilePdf weight="fill" />;
    case 'doc':
    case 'docx':
    case 'rtf':
      return <FileDoc weight="fill" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileXls weight="fill" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'bmp':
    case 'webp':
      return <FileImage weight="fill" />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FileZip weight="fill" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'go':
    case 'php':
    case 'rb':
    case 'swift':
    case 'kotlin':
    case 'rust':
      return <FileCode weight="fill" />;
    case 'txt':
    case 'md':
      return <FileText weight="fill" />;
    default:
      return <File weight="fill" />;
  }
}

// 根据文件类型获取对应的颜色
function getFileTypeColor(fileType) {
  const type = fileType.toLowerCase();
  
  // 根据文件类型分组设置颜色
  if (['pdf'].includes(type)) {
    return 'text-red-500';
  } else if (['doc', 'docx', 'rtf'].includes(type)) {
    return 'text-blue-500';
  } else if (['xls', 'xlsx', 'csv'].includes(type)) {
    return 'text-green-500';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(type)) {
    return 'text-purple-500';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
    return 'text-yellow-500';
  } else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'go', 'php', 'rb', 'swift', 'kotlin', 'rust'].includes(type)) {
    return 'text-indigo-500';
  } else {
    return 'text-gray-500';
  }
}

// 文档项组件
function DocumentItem({ document }) {
  if (!document) return null;
  
  const metadata = document.metadata ? parseMetadata(document.metadata) : {};
  const fileName = document.name || document.filename || 'Unknown File';
  const fileType = getFileExtension(fileName);
  const date = document.createdAt ? formatDate(document.createdAt) : '';
  const fileIcon = getFileTypeIcon(fileType);
  const fileColor = getFileTypeColor(fileType);
  
  return (
    <div className="mx-2 my-2.5 p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer">
      <div className="flex items-start">
        {/* 文件封面/图标容器 - 56x56px，圆角6px，只显示图标不显示文件类型文字 */}
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
          <div className={`${fileColor}`}>
            <span className="text-3xl">{fileIcon}</span>
          </div>
        </div>
        {/* 文字内容区域 - 高度与左侧图标容器一致，文字上下分布两端对齐 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-14">
          <h4 className="text-sm font-medium text-theme-text truncate">{fileName}</h4>
          <div className="flex items-center">
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs mr-2">{fileType}</span>
            {date && <span className="text-xs text-theme-text-secondary">{date}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentFileSidebar({ workspace, onClose }) {
  const [filesListOpen, setFilesListOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const { user } = useUser();
  const isMediumScreen = useMediumScreen();

  // 根据屏幕尺寸计算侧边栏宽度
  const sidebarWidth = isMediumScreen ? DOCUMENT_SIDEBAR_WIDTH_MEDIUM : DOCUMENT_SIDEBAR_WIDTH;

  // 加载文档
  useEffect(() => {
    async function fetchDocuments() {
      if (!workspace?.slug) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        if (workspace.documents && workspace.documents.length > 0) {
          const validDocs = workspace.documents.filter(doc => doc && typeof doc === 'object');
          setDocuments(validDocs);
        } else {
          try {
            const workspaceData = await Workspace.bySlug(workspace.slug);
            if (workspaceData?.documents?.length > 0) {
              const validDocs = workspaceData.documents.filter(doc => doc && typeof doc === 'object');
              setDocuments(validDocs);
            } else {
              setDocuments([]);
            }
          } catch (apiError) {
            console.error("API获取文档失败:", apiError);
            setDocuments([]);
          }
        }
      } catch (error) {
        console.error("获取文档失败:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDocuments();
  }, [workspace?.slug]);

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    if (!doc) return false;
    
    const docName = doc.name || doc.filename || '';
    const docType = getFileExtension(docName);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      docName.toLowerCase().includes(searchLower) ||
      docType.toLowerCase().includes(searchLower) ||
      (doc.metadata && Object.values(parseMetadata(doc.metadata || '{}')).some(value => 
        value !== null && value !== undefined && String(value).toLowerCase().includes(searchLower)
      ))
    );
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-theme-bg-sidebar dark:bg-theme-bg-tertiary transition-all duration-300 ease-in-out" 
      style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme-sidebar-border">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded mr-2 bg-[#1877F2] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6.5L12 11L21 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="px-1 h-14 flex flex-col justify-between">
            <h2 className="text-lg font-bold text-theme-text pt-0.5">{workspace?.name || "Knowledge Base"}</h2>
            {/* 创建人信息 */}
            <div className="flex items-center pb-0.5">
              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-1.5">
                {user?.username?.charAt(0)?.toUpperCase() || <User size={12} />}
              </div>
              <span className="text-xs text-theme-text-secondary">
                {user?.username || "System User"} 创建
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlass className="h-4 w-4 text-theme-text-secondary" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`
              block w-full rounded-md border-0 py-2 pl-10 pr-3 
              text-theme-text bg-theme-bg-tertiary 
              ring-1 ring-inset ring-theme-sidebar-border 
              placeholder:text-theme-text-secondary 
              focus:ring-2 focus:ring-inset focus:ring-blue-600 
              sm:text-sm sm:leading-6
              ${isMediumScreen ? 'text-xs py-1.5' : ''} 
            `}
            placeholder="搜索文档..."
          />
        </div>
      </div>

      {/* 主内容区 - 剩余空间 */}
      <div className="flex-grow overflow-y-auto">
        {/* 在此保持原有的渲染逻辑，只需要压缩中等屏幕下的文本和间距 */}
        {loading ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="animate-pulse h-16 bg-theme-bg-tertiary rounded"></div>
            <div className="animate-pulse h-16 bg-theme-bg-tertiary rounded"></div>
            <div className="animate-pulse h-16 bg-theme-bg-tertiary rounded"></div>
          </div>
        ) : documents.length > 0 ? (
          <div>
            <div className="flex flex-col">
              {/* 文档分组标题栏 */}
              <div 
                className={`
                  flex items-center justify-between px-4 py-2 text-sm text-theme-text-secondary
                  ${isMediumScreen ? 'py-1.5 text-xs' : ''}
                `}
              >
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setFilesListOpen(!filesListOpen)}
                >
                  <CaretDown 
                    className={`transition-transform duration-150 ${filesListOpen ? '' : '-rotate-90'}`} 
                    size={isMediumScreen ? 14 : 16} 
                  />
                  <span>全部文件</span>
                </div>
                <button 
                  className="p-1.5 rounded-md bg-theme-button-primary text-[color:var(--theme-button-text)] hover:bg-theme-button-primary-hover transition-colors"
                  onClick={showModal}
                  title="上传文档"
                >
                  <UploadSimple className={`text-theme-text-secondary ${isMediumScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} weight="bold" />
                </button>
              </div>

              {/* 文档列表 */}
              {filesListOpen && (
                <div className="animate-fadeIn">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc, index) => (
                      <DocumentItem key={doc.id || index} document={doc} />
                    ))
                  ) : (
                    <div className={`text-center py-4 ${isMediumScreen ? 'text-xs py-3' : 'text-sm'} text-theme-text-subtle`}>
                      {searchTerm ? "没有找到匹配的文档" : "没有文档"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-3">
              <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" weight="duotone" />
            </div>
            <h3 className={`mb-1 font-medium text-theme-text ${isMediumScreen ? 'text-sm' : 'text-base'}`}>没有文档</h3>
            <p className={`mb-4 ${isMediumScreen ? 'text-xs' : 'text-sm'} text-theme-text-secondary`}>上传文档以开始对话</p>
            <button
              onClick={showModal}
              className={`
                inline-flex items-center rounded-md bg-blue-600 px-3 py-2 
                text-sm font-semibold text-[color:var(--theme-button-text)] shadow-sm 
                hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 
                focus-visible:outline-offset-2 focus-visible:outline-blue-600
                ${isMediumScreen ? 'px-2.5 py-1.5 text-xs' : ''}
              `}
            >
              <UploadSimple className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              上传文档
            </button>
          </div>
        )}
      </div>

      {/* 管理工作区模态窗口 */}
      {showing && (
        <ManageWorkspace
          showing={showing}
          hide={hideModal}
          workspaceSlug={workspace?.slug}
        />
      )}
    </div>
  );
} 