import { Plus, MessageSquare, Trash2, Moon, Sun, X, FolderPlus, Folder as FolderIcon, ChevronDown, ChevronRight, Edit2, Check, Settings, Globe, ChevronLeft } from "lucide-react";
import { Conversation, Folder } from "../shared/types";
import { useState, useRef, useEffect } from "react";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: "English" | "Français" | "Español" | "Português";
  onLanguageChange: (language: "English" | "Français" | "Español" | "Português") => void;
  onToggleSidebar?: () => void;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onRenameFolder: (id: string, newName: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  onToggleSidebar,
  folders,
  onCreateFolder,
  onDeleteFolder,
  onToggleFolder,
  onMoveToFolder,
  onRenameFolder,
}: ConversationSidebarProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedConversation, setDraggedConversation] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    };

    if (settingsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsMenuOpen]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (editingFolderName.trim()) {
      onRenameFolder(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const ungroupedConversations = conversations.filter(c => !c.folderId);
  
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Close Sidebar Button */}
      {onToggleSidebar && (
        <div className="border-b border-gray-200 p-2 dark:border-gray-700">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* New Chat Button */}
      <div className="p-2">
        <button
          onClick={onNewConversation}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New chat</span>
        </button>
      </div>

      {/* Create Folder Button */}
      <div className="px-2 pb-2">
        {!isCreatingFolder ? (
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="text-sm">New folder</span>
          </button>
        ) : (
          <div className="flex gap-1">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name"
              autoFocus
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={handleCreateFolder}
              className="rounded-lg bg-blue-600 px-2 py-1.5 text-white hover:bg-blue-700 dark:bg-blue-500"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }}
              className="rounded-lg bg-gray-200 px-2 py-1.5 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Folders */}
            {folders.map((folder) => {
              const folderConversations = conversations.filter(c => c.folderId === folder.id);
              return (
                <div key={folder.id} className="space-y-1">
                  <div
                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
                      if (draggedConversation) {
                        onMoveToFolder(draggedConversation, folder.id);
                        setDraggedConversation(null);
                      }
                    }}
                  >
                    <button
                      onClick={() => onToggleFolder(folder.id)}
                      className="flex items-center"
                    >
                      {folder.isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <FolderIcon className="h-4 w-4" />
                    {editingFolderId === folder.id ? (
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameFolder(folder.id);
                          if (e.key === "Escape") {
                            setEditingFolderId(null);
                            setEditingFolderName("");
                          }
                        }}
                        onBlur={() => handleRenameFolder(folder.id)}
                        autoFocus
                        className="flex-1 rounded border border-gray-300 px-1 py-0.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                      />
                    ) : (
                      <span className="flex-1 text-sm font-medium">{folder.name}</span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {folderConversations.length}
                    </span>
                    <button
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    </button>
                  </div>
                  
                  {folder.isExpanded && (
                    <div className="ml-4 space-y-1">
                      {folderConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          draggable
                          onDragStart={() => setDraggedConversation(conversation.id)}
                          onDragEnd={() => setDraggedConversation(null)}
                          className={`group relative flex cursor-pointer flex-col gap-1 rounded-lg p-2.5 transition-colors ${
                            activeConversationId === conversation.id
                              ? "bg-gray-100 dark:bg-gray-800"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-1 flex-1 text-sm text-gray-900 dark:text-gray-100">
                              {conversation.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
                              }}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                            </button>
                          </div>
                          <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped Conversations */}
            {ungroupedConversations.map((conversation) => (
              <div
                key={conversation.id}
                draggable
                onDragStart={() => setDraggedConversation(conversation.id)}
                onDragEnd={() => setDraggedConversation(null)}
                className={`group relative flex cursor-pointer flex-col gap-1 rounded-lg p-2.5 transition-colors ${
                  activeConversationId === conversation.id
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 flex-1 text-sm text-gray-900 dark:text-gray-100">
                    {conversation.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                </div>
                <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                  {conversation.lastMessage}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="relative border-t border-gray-200 p-2 dark:border-gray-700" ref={settingsMenuRef}>
        <button
          onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
          className="flex w-full items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        {settingsMenuOpen && (
          <div className="absolute bottom-14 left-2 right-2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-2">
              <button
                onClick={() => {
                  onThemeChange(theme === "light" ? "dark" : "light");
                  setSettingsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm">{theme === "light" ? "Dark mode" : "Light mode"}</span>
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <div className="relative">
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Language</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{language}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {languageDropdownOpen && (
                  <div className="absolute left-full top-0 ml-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-1">
                      {(["English", "Français", "Español", "Português"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            onLanguageChange(lang);
                            setLanguageDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-sm transition-colors ${
                            language === lang
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>{lang}</span>
                          {language === lang && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}