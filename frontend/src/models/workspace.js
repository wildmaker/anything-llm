import { API_BASE } from "@/utils/constants";
import { baseHeaders, safeJsonParse } from "@/utils/request";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import WorkspaceThread from "@/models/workspaceThread";
import { v4 } from "uuid";
import { ABORT_STREAM_EVENT } from "@/utils/chat";

// 默认工作区的存储键
const DEFAULT_WORKSPACE_KEY = "anythingllm-default-workspace-id";

const Workspace = {
  workspaceOrderStorageKey: "anythingllm-workspace-order",

  new: async function (data = {}) {
    const { workspace, message } = await fetch(`${API_BASE}/workspace/new`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => {
        return { workspace: null, message: e.message };
      });

    return { workspace, message };
  },
  update: async function (slug, data = {}) {
    const { workspace, message } = await fetch(
      `${API_BASE}/workspace/${slug}/update`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return { workspace: null, message: e.message };
      });

    return { workspace, message };
  },
  modifyEmbeddings: async function (slug, changes = {}) {
    const { workspace, message } = await fetch(
      `${API_BASE}/workspace/${slug}/update-embeddings`,
      {
        method: "POST",
        body: JSON.stringify(changes), // contains 'adds' and 'removes' keys that are arrays of filepaths
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return { workspace: null, message: e.message };
      });

    return { workspace, message };
  },
  chatHistory: async function (slug) {
    const history = await fetch(`${API_BASE}/workspace/${slug}/chats`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.history || [])
      .catch(() => []);
    return history;
  },
  updateChatFeedback: async function (chatId, slug, feedback) {
    const result = await fetch(
      `${API_BASE}/workspace/${slug}/chat-feedback/${chatId}`,
      {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ feedback }),
      }
    )
      .then((res) => res.ok)
      .catch(() => false);
    return result;
  },

  deleteChats: async function (slug = "", chatIds = []) {
    return await fetch(`${API_BASE}/workspace/${slug}/delete-chats`, {
      method: "DELETE",
      headers: baseHeaders(),
      body: JSON.stringify({ chatIds }),
    })
      .then((res) => {
        if (res.ok) return true;
        throw new Error("Failed to delete chats.");
      })
      .catch((e) => {
        console.log(e);
        return false;
      });
  },
  deleteEditedChats: async function (slug = "", threadSlug = "", startingId) {
    if (!!threadSlug)
      return this.threads._deleteEditedChats(slug, threadSlug, startingId);
    return this._deleteEditedChats(slug, startingId);
  },
  updateChatResponse: async function (
    slug = "",
    threadSlug = "",
    chatId,
    newText
  ) {
    if (!!threadSlug)
      return this.threads._updateChatResponse(
        slug,
        threadSlug,
        chatId,
        newText
      );
    return this._updateChatResponse(slug, chatId, newText);
  },
  multiplexStream: async function ({
    workspaceSlug,
    threadSlug = null,
    prompt,
    chatHandler,
    attachments = [],
  }) {
    if (!!threadSlug)
      return this.threads.streamChat(
        { workspaceSlug, threadSlug },
        prompt,
        chatHandler,
        attachments
      );
    return this.streamChat(
      { slug: workspaceSlug },
      prompt,
      chatHandler,
      attachments
    );
  },
  streamChat: async function ({ slug }, message, handleChat, attachments = []) {
    const ctrl = new AbortController();

    // Listen for the ABORT_STREAM_EVENT key to be emitted by the client
    // to early abort the streaming response. On abort we send a special `stopGeneration`
    // event to be handled which resets the UI for us to be able to send another message.
    // The backend response abort handling is done in each LLM's handleStreamResponse.
    window.addEventListener(ABORT_STREAM_EVENT, () => {
      ctrl.abort();
      handleChat({ id: v4(), type: "stopGeneration" });
    });

    await fetchEventSource(`${API_BASE}/workspace/${slug}/stream-chat`, {
      method: "POST",
      body: JSON.stringify({ message, attachments }),
      headers: baseHeaders(),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          return; // everything's good
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. Code ${response.status}`,
          });
          ctrl.abort();
          throw new Error("Invalid Status code response.");
        } else {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. Unknown Error.`,
          });
          ctrl.abort();
          throw new Error("Unknown error");
        }
      },
      async onmessage(msg) {
        try {
          const chatResult = JSON.parse(msg.data);
          handleChat(chatResult);
        } catch {}
      },
      onerror(err) {
        handleChat({
          id: v4(),
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error: `An error occurred while streaming response. ${err.message}`,
        });
        ctrl.abort();
        throw new Error();
      },
    });
  },
  all: async function () {
    const workspaces = await fetch(`${API_BASE}/workspaces`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.workspaces || [])
      .catch(() => []);

    return workspaces;
  },
  bySlug: async function (slug = "") {
    console.log(`Workspace.bySlug: Fetching workspace with slug "${slug}"`);
    try {
      const response = await fetch(`${API_BASE}/workspace/${slug}`, {
        headers: baseHeaders(),
      });
      console.log("Workspace.bySlug: Response status:", response.status);
      if (!response.ok) {
        console.error("Workspace.bySlug: Error response", response);
        return null;
      }
      
      const data = await response.json();
      console.log("Workspace.bySlug: Response data:", data);
      return data.workspace;
    } catch (error) {
      console.error("Workspace.bySlug: Error:", error);
      return null;
    }
  },
  delete: async function (slug) {
    const result = await fetch(`${API_BASE}/workspace/${slug}`, {
      method: "DELETE",
      headers: baseHeaders(),
    })
      .then((res) => res.ok)
      .catch(() => false);

    return result;
  },
  wipeVectorDb: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/reset-vector-db`, {
      method: "DELETE",
      headers: baseHeaders(),
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  uploadFile: async function (slug, formData) {
    const response = await fetch(`${API_BASE}/workspace/${slug}/upload`, {
      method: "POST",
      body: formData,
      headers: baseHeaders(),
    });

    const data = await response.json();
    return { response, data };
  },
  uploadLink: async function (slug, link) {
    const response = await fetch(`${API_BASE}/workspace/${slug}/upload-link`, {
      method: "POST",
      body: JSON.stringify({ link }),
      headers: baseHeaders(),
    });

    const data = await response.json();
    return { response, data };
  },

  getSuggestedMessages: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/suggested-messages`, {
      method: "GET",
      cache: "no-cache",
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch suggested messages.");
        return res.json();
      })
      .then((res) => res.suggestedMessages)
      .catch((e) => {
        console.error(e);
        return null;
      });
  },
  setSuggestedMessages: async function (slug, messages) {
    return fetch(`${API_BASE}/workspace/${slug}/suggested-messages`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ messages }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.statusText || "Error setting suggested messages."
          );
        }
        return { success: true, ...res.json() };
      })
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  setPinForDocument: async function (slug, docPath, pinStatus) {
    return fetch(`${API_BASE}/workspace/${slug}/update-pin`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ docPath, pinStatus }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.statusText || "Error setting pin status for document."
          );
        }
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  },
  ttsMessage: async function (slug, chatId) {
    return await fetch(`${API_BASE}/workspace/${slug}/tts/${chatId}`, {
      method: "GET",
      cache: "no-cache",
      headers: baseHeaders(),
    })
      .then((res) => {
        if (res.ok && res.status !== 204) return res.blob();
        throw new Error("Failed to fetch TTS.");
      })
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch((e) => {
        return null;
      });
  },
  uploadPfp: async function (formData, slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/upload-pfp`, {
      method: "POST",
      body: formData,
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error uploading pfp.");
        return { success: true, error: null };
      })
      .catch((e) => {
        console.log(e);
        return { success: false, error: e.message };
      });
  },

  fetchPfp: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/pfp`, {
      method: "GET",
      cache: "no-cache",
      headers: baseHeaders(),
    })
      .then((res) => {
        if (res.ok && res.status !== 204) return res.blob();
        throw new Error("Failed to fetch pfp.");
      })
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch((e) => {
        // console.log(e);
        return null;
      });
  },

  removePfp: async function (slug) {
    return await fetch(`${API_BASE}/workspace/${slug}/remove-pfp`, {
      method: "DELETE",
      headers: baseHeaders(),
    })
      .then((res) => {
        if (res.ok) return { success: true, error: null };
        throw new Error("Failed to remove pfp.");
      })
      .catch((e) => {
        console.log(e);
        return { success: false, error: e.message };
      });
  },
  _updateChatResponse: async function (slug = "", chatId, newText) {
    return await fetch(`${API_BASE}/workspace/${slug}/update-chat`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ chatId, newText }),
    })
      .then((res) => {
        if (res.ok) return true;
        throw new Error("Failed to update chat.");
      })
      .catch((e) => {
        console.log(e);
        return false;
      });
  },
  _deleteEditedChats: async function (slug = "", startingId) {
    return await fetch(`${API_BASE}/workspace/${slug}/delete-edited-chats`, {
      method: "DELETE",
      headers: baseHeaders(),
      body: JSON.stringify({ startingId }),
    })
      .then((res) => {
        if (res.ok) return true;
        throw new Error("Failed to delete chats.");
      })
      .catch((e) => {
        console.log(e);
        return false;
      });
  },
  deleteChat: async (chatId) => {
    return await fetch(`${API_BASE}/workspace/workspace-chats/${chatId}`, {
      method: "PUT",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  forkThread: async function (slug = "", threadSlug = null, chatId = null) {
    return await fetch(`${API_BASE}/workspace/${slug}/thread/fork`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ threadSlug, chatId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fork thread.");
        return res.json();
      })
      .then((data) => data.newThreadSlug)
      .catch((e) => {
        console.error("Error forking thread:", e);
        return null;
      });
  },
  /**
   * Uploads and embeds a single file in a single call into a workspace
   * @param {string} slug - workspace slug
   * @param {FormData} formData
   * @returns {Promise<{response: {ok: boolean}, data: {success: boolean, error: string|null, document: {id: string, location:string}|null}}>}
   */
  uploadAndEmbedFile: async function (slug, formData) {
    const response = await fetch(
      `${API_BASE}/workspace/${slug}/upload-and-embed`,
      {
        method: "POST",
        body: formData,
        headers: baseHeaders(),
      }
    );

    const data = await response.json();
    return { response, data };
  },

  /**
   * Deletes and un-embeds a single file in a single call from a workspace
   * @param {string} slug - workspace slug
   * @param {string} documentLocation - location of file eg: custom-documents/my-file-uuid.json
   * @returns {Promise<boolean>}
   */
  deleteAndUnembedFile: async function (slug, documentLocation) {
    const response = await fetch(
      `${API_BASE}/workspace/${slug}/remove-and-unembed`,
      {
        method: "DELETE",
        body: JSON.stringify({ documentLocation }),
        headers: baseHeaders(),
      }
    );
    return response.ok;
  },

  /**
   * Reorders workspaces in the UI via localstorage on client side.
   * @param {string[]} workspaceIds - array of workspace ids to reorder
   * @returns {boolean}
   */
  storeWorkspaceOrder: function (workspaceIds = []) {
    try {
      localStorage.setItem(
        this.workspaceOrderStorageKey,
        JSON.stringify(workspaceIds)
      );
      return true;
    } catch (error) {
      console.error("Error reordering workspaces:", error);
      return false;
    }
  },

  /**
   * Orders workspaces based on the order preference stored in localstorage
   * @param {Array} workspaces - array of workspace JSON objects
   * @returns {Array} - ordered workspaces
   */
  orderWorkspaces: function (workspaces = []) {
    // 获取默认工作区ID
    const defaultWorkspaceId = localStorage.getItem(DEFAULT_WORKSPACE_KEY);
    
    // 获取工作区排序顺序
    const workspaceOrderPreference =
      safeJsonParse(localStorage.getItem(this.workspaceOrderStorageKey)) || [];
    
    // 如果没有自定义排序，直接使用默认排序
    if (workspaceOrderPreference.length === 0 && !defaultWorkspaceId) return workspaces;
    
    const orderedWorkspaces = Array.from(workspaces);
    
    // 对工作区进行排序，但默认工作区始终位于顶部
    orderedWorkspaces.sort((a, b) => {
      // 如果a是默认工作区，它应该排在前面
      if (a.id.toString() === defaultWorkspaceId) return -1;
      // 如果b是默认工作区，它应该排在前面
      if (b.id.toString() === defaultWorkspaceId) return 1;
      
      // 否则按照正常顺序排序
      return (
        workspaceOrderPreference.indexOf(a.id) -
        workspaceOrderPreference.indexOf(b.id)
      );
    });
    
    return orderedWorkspaces;
  },
  
  // 获取默认工作区
  getDefaultWorkspace: async function () {
    const workspaces = await this.all();
    if (!workspaces || workspaces.length === 0) return null;
    
    // 获取本地存储的默认工作区ID
    const defaultWorkspaceId = localStorage.getItem(DEFAULT_WORKSPACE_KEY);
    
    // 如果有默认工作区ID，尝试找到对应的工作区
    if (defaultWorkspaceId) {
      const defaultWorkspace = workspaces.find(w => w.id.toString() === defaultWorkspaceId);
      if (defaultWorkspace) return defaultWorkspace;
    }
    
    // 如果没有默认工作区或找不到匹配的，使用第一个作为默认
    const firstWorkspace = workspaces[0];
    
    // 将第一个工作区设置为默认工作区
    localStorage.setItem(DEFAULT_WORKSPACE_KEY, firstWorkspace.id.toString());
    
    return firstWorkspace;
  },
  
  // 设置默认工作区
  setDefaultWorkspace: function (workspaceId) {
    localStorage.setItem(DEFAULT_WORKSPACE_KEY, workspaceId.toString());
    return true;
  },
  
  // 检查是否为默认工作区
  isDefaultWorkspace: function (workspaceId) {
    const defaultWorkspaceId = localStorage.getItem(DEFAULT_WORKSPACE_KEY);
    return defaultWorkspaceId === workspaceId.toString();
  },

  threads: WorkspaceThread,
};

export default Workspace;
