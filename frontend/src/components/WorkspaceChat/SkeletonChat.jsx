import React from 'react';
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "@/hooks/useTheme";

export default function SkeletonChat() {
  const { theme } = useTheme();
  
  // 根据当前主题动态设置背景颜色
  const bgColors = {
    light: {
      container: 'bg-white',
      chat: 'bg-gray-50',
      message: {
        user: 'bg-blue-50',
        system: 'bg-gray-100'
      }
    },
    dark: {
      container: 'bg-[#141414]',
      chat: 'bg-[#0f0f0f]',
      message: {
        user: 'bg-blue-900/20', 
        system: 'bg-gray-800/40'
      }
    }
  };
  
  // 使用主题相关的背景色
  const containerBg = theme === 'light' ? bgColors.light.container : bgColors.dark.container;
  const chatBg = theme === 'light' ? bgColors.light.chat : bgColors.dark.chat;
  const userMsgBg = theme === 'light' ? bgColors.light.message.user : bgColors.dark.message.user;
  const systemMsgBg = theme === 'light' ? bgColors.light.message.system : bgColors.dark.message.system;
  
  // 基础和高亮颜色
  const baseColor = theme === 'light' ? '#e2e8f0' : '#2d3748';
  const highlightColor = theme === 'light' ? '#edf2f7' : '#4a5568';
  
  // 模拟生成随机长度的消息
  const randomWidth = () => {
    const widths = ['60%', '75%', '85%', '90%', '100%'];
    return widths[Math.floor(Math.random() * widths.length)];
  };
  
  // 用户和系统消息组件
  const UserMessageSkeleton = () => (
    <div className="flex justify-end mb-4">
      <div className={`max-w-[80%] p-4 rounded-2xl rounded-tr-sm ${userMsgBg} shadow-sm`}>
        <div className="flex items-center mb-2">
          <Skeleton.default
            height={14}
            width={60}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
          />
        </div>
        {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
          <Skeleton.default
            key={i}
            height={14}
            width={randomWidth()}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="my-1"
          />
        ))}
        <div className="flex justify-end mt-2">
          <Skeleton.default
            height={10}
            width={40}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
          />
        </div>
      </div>
    </div>
  );
  
  const SystemMessageSkeleton = () => (
    <div className="flex justify-start mb-4">
      <div className={`max-w-[80%] p-4 rounded-2xl rounded-tl-sm ${systemMsgBg} shadow-sm`}>
        <div className="flex items-center mb-2">
          <Skeleton.default
            circle
            height={24}
            width={24}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="mr-2"
          />
          <Skeleton.default
            height={14}
            width={80}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
          />
        </div>
        {[...Array(Math.floor(Math.random() * 4) + 2)].map((_, i) => (
          <Skeleton.default
            key={i}
            height={14}
            width={randomWidth()}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="my-1"
          />
        ))}
        <div className="flex justify-end mt-2">
          <Skeleton.default
            height={10}
            width={40}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
          />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className={`w-full h-full flex flex-col ${containerBg}`}>
      {/* 标题栏 */}
      <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 ${containerBg}`}>
        <div className="flex items-center">
          <Skeleton.default
            circle
            height={32}
            width={32}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="mr-3"
          />
          <Skeleton.default
            height={18}
            width={120}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
          />
        </div>
        <div className="flex items-center">
          <Skeleton.default
            circle
            height={32}
            width={32}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="ml-2"
          />
          <Skeleton.default
            circle
            height={32}
            width={32}
            baseColor={baseColor}
            highlightColor={highlightColor}
            enableAnimation={true}
            className="ml-2"
          />
        </div>
      </div>
      
      {/* 消息区域 */}
      <div className={`flex-grow overflow-y-auto p-6 ${chatBg}`}>
        <SystemMessageSkeleton />
        <UserMessageSkeleton />
        <SystemMessageSkeleton />
        <UserMessageSkeleton />
        <SystemMessageSkeleton />
      </div>
      
      {/* 输入区域 */}
      <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${containerBg}`}>
        <div className={`rounded-lg border border-gray-200 dark:border-gray-700 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'} p-2`}>
          <div className="flex items-center">
            <Skeleton.default
              height={80}
              width="100%"
              baseColor={baseColor}
              highlightColor={highlightColor}
              enableAnimation={true}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <div className="flex">
              <Skeleton.default
                circle
                height={24}
                width={24}
                baseColor={baseColor}
                highlightColor={highlightColor}
                enableAnimation={true}
                className="mr-2"
              />
              <Skeleton.default
                circle
                height={24}
                width={24}
                baseColor={baseColor}
                highlightColor={highlightColor}
                enableAnimation={true}
                className="mr-2"
              />
            </div>
            <Skeleton.default
              height={32}
              width={60}
              baseColor={baseColor}
              highlightColor={highlightColor}
              enableAnimation={true}
              className="rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 