// 导入React库是因为:
// 1. 这是一个JSX文件，需要React来解析JSX语法
// 2. 即使不直接使用React对象，也需要它来创建虚拟DOM
// 3. 这是React项目的基本要求
import React, { useState } from "react";
import { Plus, PlusCircle, CircleNotch } from "@phosphor-icons/react";

// export default 的使用原因:
// 1. export 用于将组件暴露给其他文件使用
// 2. default 表示这是文件的默认导出项
//    - 使用 export default 时，其他文件在导入时可以使用任意名称
//    - 一个文件只能有一个 default 导出
//    - 导入时可以使用任意名称，例如: import MyBanner from './AdBanner' 或 import Banner from './AdBanner' 都是有效的
//    - 适用于模块只需要导出一个主要内容的情况
export default function SurveyBanner() {
    // 添加状态变量
    const surveyLink = "https://www.baidu.com";
    return (
        // 这里使用了JSX语法
        // className - 用于添加CSS类名，等同于HTML的class属性
        // p-3 - Tailwind CSS类，表示padding: 0.75rem (12px)
        // border-t - Tailwind CSS类，表示上边框
        // border-theme-sidebar-border - 自定义主题边框颜色类
        <div className="p-3 bg-theme-bg-sidebar flex flex-col gap-3 rounded-lg">
            <a href="#" className="block rounded-md overflow-hidden flex flex-col text-center items-center justify-center gap-3">
                <p>帮助我们改进产品！点击提交您的反馈和建议。</p>
                <button
                    className="flex items-center justify-center w-full r py-2 rounded-lg bg-neutral-100 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-theme-primary dark:text-theme-primary"
                    onClick={() => window.open(surveyLink, '_blank')}
                >
                    <span className="text-sm font-medium">提交反馈</span>
                </button>
            </a>
        </div>
    )
}