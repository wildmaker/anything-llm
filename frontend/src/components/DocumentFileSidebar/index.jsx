import React, { useState, useEffect } from "react";
import { MagnifyingGlass, CaretDown, FileText, Export, ShareNetwork, FolderOpen, UploadSimple, 
  File, FileCode, FilePdf, FileXls, FileDoc, FileImage, FileZip, User } from "@phosphor-icons/react";
import System from "@/models/system";
import Workspace from "@/models/workspace";
import ManageWorkspace, { useManageWorkspaceModal } from "../Modals/ManageWorkspace";
import useUser from "@/hooks/useUser";

// 定义侧边栏宽度常量 - 匹配LobeChat样式
export const DOCUMENT_SIDEBAR_WIDTH = "320px";

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
    <div className="h-full flex flex-col overflow-hidden bg-theme-bg-sidebar dark:bg-theme-bg-tertiary" style={{ width: DOCUMENT_SIDEBAR_WIDTH, minWidth: DOCUMENT_SIDEBAR_WIDTH }}>
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

      {/* 搜索栏 - 调整与标题和文档列表的间距 */}
      <div className="px-4 py-5 mt-3">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-subtle" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文档..."
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-theme-bg-secondary text-theme-text text-sm placeholder:text-theme-text-subtle focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 文档列表 - 调整与搜索框的间距 */}
      <div className="flex-1 overflow-y-auto mt-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-sm text-theme-text-subtle">加载中...</p>
            </div>
          </div>
        ) : documents.length > 0 ? (
          <div>
            <div className="flex flex-col">
              {/* 文档分组标题栏 */}
              <div 
                className="flex items-center justify-between px-4 py-2 text-sm text-theme-text-secondary"
              >
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setFilesListOpen(!filesListOpen)}
                >
                  <CaretDown 
                    className={`transition-transform duration-150 ${filesListOpen ? '' : '-rotate-90'}`} 
                    size={16} 
                  />
                  <span>全部文件</span>
                </div>
                <button 
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={showModal}
                  title="上传文档"
                >
                  <UploadSimple className="h-4 w-4 text-theme-text-secondary" weight="bold" />
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
                    <div className="text-center py-4 text-sm text-theme-text-subtle">
                      {searchTerm ? "没有找到匹配的文档" : "没有文档"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <FileText size={32} className="mx-auto text-theme-text-subtle mb-2" />
              <p className="text-theme-text-subtle mb-1">该工作区中没有文档</p>
              <p className="text-xs text-theme-text-subtle opacity-70">
                上传文档后可在这里查看和管理
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 上传文档模态框 */}
      {showing && (
        <ManageWorkspace
          hideModal={hideModal}
          providedSlug={workspace?.slug || null}
        />
      )}
    </div>
  );
} 