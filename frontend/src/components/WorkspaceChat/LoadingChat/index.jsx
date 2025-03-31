import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "@/hooks/useTheme";

export default function LoadingChat() {
  const { theme } = useTheme();
  const highlightColor = "var(--theme-bg-primary)";
  const baseColor = "var(--theme-bg-secondary)";
  
  // 根据当前主题动态设置背景颜色
  const bgColors = {
    light: {
      container: 'bg-white',
      chat: 'bg-gray-50'
    },
    dark: {
      container: 'bg-[#141414]',
      chat: 'bg-[#0f0f0f]'
    }
  };
  
  // 使用主题相关的背景色
  const containerBg = theme === 'light' ? bgColors.light.container : bgColors.dark.container;
  const chatBg = theme === 'light' ? bgColors.light.chat : bgColors.dark.chat;
  
  return (
    <div className={`w-full h-full flex flex-col ${containerBg}`}>
      {/* 模拟顶部ChatHeader */}
      <div className={`flex-shrink-0 border-b border-gray-100 dark:border-gray-800 ${containerBg}`} style={{ height: '57px', minHeight: '57px' }}>
        <Skeleton.default
          height="57px"
          width="100%"
          highlightColor={highlightColor}
          baseColor={baseColor}
          count={1}
        />
      </div>
      
      {/* 模拟聊天历史 */}
      <div
        className={`transition-all duration-300 flex-grow ${chatBg} overflow-y-hidden p-4`}
      >
        <Skeleton.default
          height="100px"
          width="100%"
          highlightColor={highlightColor}
          baseColor={baseColor}
          count={1}
          className="max-w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
          containerClassName="flex justify-start"
        />
        <Skeleton.default
          height="100px"
          width={isMobile ? "70%" : "45%"}
          baseColor={baseColor}
          highlightColor={highlightColor}
          count={1}
          className="max-w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
          containerClassName="flex justify-end"
        />
        <Skeleton.default
          height="100px"
          width={isMobile ? "55%" : "30%"}
          baseColor={baseColor}
          highlightColor={highlightColor}
          count={1}
          className="max-w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
          containerClassName="flex justify-start"
        />
        <Skeleton.default
          height="100px"
          width={isMobile ? "88%" : "25%"}
          baseColor={baseColor}
          highlightColor={highlightColor}
          count={1}
          className="max-w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
          containerClassName="flex justify-end"
        />
        <Skeleton.default
          height="160px"
          width="100%"
          baseColor={baseColor}
          highlightColor={highlightColor}
          count={1}
          className="max-w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
          containerClassName="flex justify-start"
        />
      </div>
      
      {/* 模拟输入框 */}
      <div className={`flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 ${containerBg}`} style={{ height: '170px' }}>
        <Skeleton.default
          height="140px"
          width="100%"
          highlightColor={highlightColor}
          baseColor={baseColor}
          count={1}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
