import React from "react";
import { SettingIcons } from "@/components/Icons";
import { useTranslation } from "react-i18next";
import { X } from "@phosphor-icons/react";

export default function WorkspaceSettingsModal({ workspace, settings, open, setOpen, refetchWorkspace }) {
  const { t } = useTranslation();
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-theme-bg-secondary rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b border-theme-border flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <SettingIcons.Chat className="mr-2" size={24} />
            {t("workspaceSettings.title", "工作区设置")}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-theme-hover p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-theme-text/70">
            {t("workspaceSettings.description", "工作区设置已移至新页面，点击下方按钮前往设置页面。")}
          </p>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => window.location.href = `/workspace/${workspace?.slug}/settings/general-appearance`}
              className="bg-theme-button hover:bg-theme-button-hover text-white px-4 py-2 rounded"
            >
              {t("workspaceSettings.openSettings", "打开设置页面")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}