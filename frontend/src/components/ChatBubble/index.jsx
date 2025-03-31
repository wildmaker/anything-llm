import React from "react";
import UserIcon from "../UserIcon";
import { userFromStorage } from "@/utils/request";
import renderMarkdown from "@/utils/chat/markdown";
import DOMPurify from "@/utils/chat/purify";

export default function ChatBubble({ message, type, popMsg }) {
  const isUser = type === "user";

  return (
    <div
      className={`flex justify-center items-end w-full ${
        isUser ? "justify-end" : "bg-theme-bg-secondary"
      }`}
    >
      <div className={`py-6 px-4 w-full flex gap-x-5 flex-col`}>
        <div className={`flex gap-x-5 ${isUser ? "flex-row-reverse" : ""}`}>
          <UserIcon
            user={{ uid: isUser ? userFromStorage()?.username : "system" }}
            role={type}
          />

          <div
            className={`markdown whitespace-pre-line font-normal text-sm md:text-sm flex flex-col gap-y-1 mt-2 ${
              isUser
                ? "bg-theme-message-bubble-user text-white light:text-theme-text-primary px-4 py-3 rounded-2xl rounded-tr-sm border border-transparent transition-all duration-300"
                : "bg-theme-bg-chat text-white light:text-theme-text-primary px-4 py-3 rounded-2xl rounded-tl-sm border border-transparent transition-all duration-300"
            }`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(renderMarkdown(message)),
            }}
          />
        </div>
      </div>
    </div>
  );
}
