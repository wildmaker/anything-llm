import React, { useState, useRef, useEffect } from "react";
import SlashCommandsButton, {
  SlashCommands,
  useSlashCommands,
} from "./SlashCommands";
import debounce from "lodash.debounce";
import { PaperPlaneRight, ArrowsVertical } from "@phosphor-icons/react";
import StopGenerationButton from "./StopGenerationButton";
import AvailableAgentsButton, {
  AvailableAgents,
  useAvailableAgents,
} from "./AgentMenu";
import TextSizeButton from "./TextSizeMenu";
import SpeechToText from "./SpeechToText";
import { Tooltip } from "react-tooltip";
import AttachmentManager from "./Attachments";
import AttachItem from "./AttachItem";
import { PASTE_ATTACHMENT_EVENT } from "../DnDWrapper";
import useTextSize from "@/hooks/useTextSize";
import { useTranslation } from "react-i18next";

export const PROMPT_INPUT_EVENT = "set_prompt_input";
const MAX_EDIT_STACK_SIZE = 100;
const MIN_INPUT_HEIGHT = 170; // 最小高度保持为170px
const DEFAULT_INPUT_HEIGHT = 170; // 默认高度设置为170px
const STORAGE_KEY = "anything-llm-input-height"; // localStorage存储键名

export default function PromptInput({
  submit,
  onChange,
  isStreaming,
  sendCommand,
  attachments = [],
}) {
  const { t } = useTranslation();
  const [promptInput, setPromptInput] = useState("");
  const { showAgents, setShowAgents } = useAvailableAgents();
  const { showSlashCommand, setShowSlashCommand } = useSlashCommands();
  const formRef = useRef(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [_, setFocused] = useState(false);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const { textSizeClass } = useTextSize();
  
  // 设置初始高度和拖拽相关状态
  const [inputHeight, setInputHeight] = useState(() => {
    // 首次访问时强制使用默认高度
    if (!localStorage.getItem(STORAGE_KEY)) {
      return DEFAULT_INPUT_HEIGHT;
    }
    const savedHeight = localStorage.getItem(STORAGE_KEY);
    return savedHeight ? Math.max(parseInt(savedHeight), MIN_INPUT_HEIGHT) : DEFAULT_INPUT_HEIGHT;
  });
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  /**
   * To prevent too many re-renders we remotely listen for updates from the parent
   * via an event cycle. Otherwise, using message as a prop leads to a re-render every
   * change on the input.
   * @param {Event} e
   */
  function handlePromptUpdate(e) {
    setPromptInput(e?.detail ?? "");
  }

  useEffect(() => {
    if (!!window)
      window.addEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate);
    return () =>
      window?.removeEventListener(PROMPT_INPUT_EVENT, handlePromptUpdate);
  }, []);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) textareaRef.current.focus();
    resetTextAreaHeight();
  }, [isStreaming]);

  // 保存高度到localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, inputHeight.toString());
  }, [inputHeight]);

  // 添加拖拽相关事件监听
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.max(MIN_INPUT_HEIGHT, dragStartHeight.current - deltaY);
      
      // 设置最大高度为窗口高度的50%
      const maxHeight = window.innerHeight * 0.5;
      const limitedHeight = Math.min(newHeight, maxHeight);
      
      setInputHeight(limitedHeight);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none'; // 防止拖动过程中选择文本
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 开始拖拽
  const handleDragStart = (e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartHeight.current = inputHeight;
    setIsDragging(true);
  };

  /**
   * Save the current state before changes
   * @param {number} adjustment
   */
  function saveCurrentState(adjustment = 0) {
    if (undoStack.current.length >= MAX_EDIT_STACK_SIZE)
      undoStack.current.shift();
    undoStack.current.push({
      value: promptInput,
      cursorPositionStart: textareaRef.current.selectionStart + adjustment,
      cursorPositionEnd: textareaRef.current.selectionEnd + adjustment,
    });
  }
  const debouncedSaveState = debounce(saveCurrentState, 250);

  function handleSubmit(e) {
    setFocused(false);
    submit(e);
  }

  function resetTextAreaHeight() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
  }

  function checkForSlash(e) {
    const input = e.target.value;
    if (input === "/") setShowSlashCommand(true);
    if (showSlashCommand) setShowSlashCommand(false);
    return;
  }
  const watchForSlash = debounce(checkForSlash, 300);

  function checkForAt(e) {
    const input = e.target.value;
    if (input === "@") return setShowAgents(true);
    if (showAgents) return setShowAgents(false);
  }
  const watchForAt = debounce(checkForAt, 300);

  /**
   * Capture enter key press to handle submission, redo, or undo
   * via keyboard shortcuts
   * @param {KeyboardEvent} event
   */
  function captureEnterOrUndo(event) {
    // Is simple enter key press w/o shift key
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      if (isStreaming) return;
      return submit(event);
    }

    // Is undo with Ctrl+Z or Cmd+Z + Shift key = Redo
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "z" &&
      event.shiftKey
    ) {
      event.preventDefault();
      if (redoStack.current.length === 0) return;

      const nextState = redoStack.current.pop();
      if (!nextState) return;

      undoStack.current.push({
        value: promptInput,
        cursorPositionStart: textareaRef.current.selectionStart,
        cursorPositionEnd: textareaRef.current.selectionEnd,
      });
      setPromptInput(nextState.value);
      setTimeout(() => {
        textareaRef.current.setSelectionRange(
          nextState.cursorPositionStart,
          nextState.cursorPositionEnd
        );
      }, 0);
    }

    // Undo with Ctrl+Z or Cmd+Z
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "z" &&
      !event.shiftKey
    ) {
      if (undoStack.current.length === 0) return;
      const lastState = undoStack.current.pop();
      if (!lastState) return;

      redoStack.current.push({
        value: promptInput,
        cursorPositionStart: textareaRef.current.selectionStart,
        cursorPositionEnd: textareaRef.current.selectionEnd,
      });
      setPromptInput(lastState.value);
      setTimeout(() => {
        textareaRef.current.setSelectionRange(
          lastState.cursorPositionStart,
          lastState.cursorPositionEnd
        );
      }, 0);
    }
  }

  function adjustTextArea(event) {
    const element = event.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  function handlePasteEvent(e) {
    e.preventDefault();
    if (e.clipboardData.items.length === 0) return false;

    // paste any clipboard items that are images.
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        window.dispatchEvent(
          new CustomEvent(PASTE_ATTACHMENT_EVENT, {
            detail: { files: [file] },
          })
        );
        continue;
      }

      // handle files specifically that are not images as uploads
      if (item.kind === "file") {
        const file = item.getAsFile();
        window.dispatchEvent(
          new CustomEvent(PASTE_ATTACHMENT_EVENT, {
            detail: { files: [file] },
          })
        );
        continue;
      }
    }

    const pasteText = e.clipboardData.getData("text/plain");
    if (pasteText) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newPromptInput =
        promptInput.substring(0, start) +
        pasteText +
        promptInput.substring(end);
      setPromptInput(newPromptInput);
      onChange({ target: { value: newPromptInput } });

      // Set the cursor position after the pasted text
      // we need to use setTimeout to prevent the cursor from being set to the end of the text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + pasteText.length;
      }, 0);
    }
    return;
  }

  function handleChange(e) {
    debouncedSaveState(-1);
    onChange(e);
    watchForSlash(e);
    watchForAt(e);
    adjustTextArea(e);
    setPromptInput(e.target.value);
  }

  // 确保在初始渲染和文本变化时调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      const event = { target: textareaRef.current };
      adjustTextArea(event);
    }
  }, [promptInput]);

  return (
    <div 
      className="flex flex-col w-full h-full"
      ref={containerRef}
      style={{ height: `${inputHeight}px` }}
    >
      <SlashCommands
        showing={showSlashCommand}
        setShowing={setShowSlashCommand}
        sendCommand={sendCommand}
      />
      <AvailableAgents
        showing={showAgents}
        setShowing={setShowAgents}
        sendCommand={sendCommand}
        promptRef={textareaRef}
      />
      <form
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col"
      >
        <div 
          className="w-full h-full relative"
        >
          {/* 拖拽按钮 */}
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-ns-resize ${isHovered || isDragging ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-sm">
              <ArrowsVertical size={16} weight="bold" className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* 输入框容器 */}
          <div 
            className={`w-full h-full shadow-sm flex flex-col px-3 relative border-t-transparent ${
              isHovered || isDragging
                ? 'light:!border-t-gray-700 dark:!border-t-gray-300' 
                : 'light:border-theme-chat-input-border dark:border-t-theme-chat-input-border'
            } transition-all duration-200 light:border-solid light:border-t-[1px]`}
            style={{ backgroundColor: 'var(--theme-bg-chat-input)' }}
          >
            {/* 可拖拽上边框区域 - 仅在顶部10px区域触发hover效果和拖拽 */}
            <div 
              className={`absolute top-0 left-0 w-full h-[10px] cursor-ns-resize z-10`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseDown={handleDragStart}
            ></div>
            
            <AttachmentManager attachments={attachments} />
            
            {/* 工具栏 - 移到输入区域上方 */}
            <div className="flex justify-between py-2 border-b border-theme-chat-input-border">
              <div className="flex gap-x-2">
                <SpeechToText sendCommand={sendCommand} />
                <AttachItem />
                <SlashCommandsButton
                  showing={showSlashCommand}
                  setShowSlashCommand={setShowSlashCommand}
                />
                <AvailableAgentsButton
                  showing={showAgents}
                  setShowAgents={setShowAgents}
                />
                <TextSizeButton />
              </div>
              <div className="flex gap-x-2">
              </div>
            </div>
            
            {/* 输入区域 */}
            <div className="flex items-start w-full flex-grow h-full">
              <textarea
                ref={textareaRef}
                onChange={handleChange}
                onKeyDown={captureEnterOrUndo}
                onPaste={(e) => {
                  saveCurrentState();
                  handlePasteEvent(e);
                }}
                required={true}
                onFocus={(e) => {
                  setFocused(true);
                  adjustTextArea(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  adjustTextArea(e);
                }}
                value={promptInput}
                className={`border-none cursor-text w-full leading-5 md:text-md text-white bg-transparent placeholder:text-white/60 light:placeholder:text-theme-text-primary resize-none active:outline-none focus:outline-none flex-grow py-3 px-2 ${textSizeClass}`}
                placeholder={t("chat_window.send_message")}
                style={{ 
                  minHeight: "calc(100% - 60px)", 
                  height: "auto", 
                  maxHeight: "calc(100% - 60px)", 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                  paddingBottom: "40px", // 添加底部安全区
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--theme-chat-input-border) transparent'
                }}
              />
              {isStreaming ? (
                <StopGenerationButton />
              ) : (
                <>
                  <button
                    ref={formRef}
                    type="submit"
                    className="border-none inline-flex justify-center rounded-2xl cursor-pointer opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 ml-2 mt-3"
                    data-tooltip-id="send-prompt"
                    data-tooltip-content={t("chat_window.send")}
                    aria-label={t("chat_window.send")}
                  >
                    <PaperPlaneRight
                      color="var(--theme-sidebar-footer-icon-fill)"
                      className="w-[22px] h-[22px] pointer-events-none text-theme-text-primary"
                      weight="fill"
                    />
                    <span className="sr-only">发送消息</span>
                  </button>
                  <Tooltip
                    id="send-prompt"
                    place="bottom"
                    delayShow={300}
                    className="tooltip !text-xs z-99"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
