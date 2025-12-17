"use client";

import { Plus, MessageSquare, Trash2, Folder as FolderIcon, ChevronDown, ChevronRight, Edit2, Check, X as XIcon, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { SettingsMenu } from "./SettingsMenu";
import type { Conversation, Folder } from "../shared/types";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: string;
  onLanguageChange: (language: string) => void;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onMoveConversationToFolder: (conversationId: string, folderId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onToggleSidebar?: () => void;
}

interface DraggableConversationProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function DraggableConversation({ conversation, isActive, onSelect, onDelete }: DraggableConversationProps) {
  const [{ isDragging }, drag] = useDrag<{ id: string }, void, { isDragging: boolean }>(() => ({
    type: "conversation",
    item: { id: conversation.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => drag(node)}
      className={`group relative flex cursor-pointer flex-col gap-1 rounded-lg p-2.5 transition-colors ${
        isActive
          ? "bg-gray-100 dark:bg-gray-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 flex-1 text-sm text-gray-900 dark:text-gray-100">
          {conversation.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
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
  );
}

interface DroppableFolderProps {
  folder: Folder;
  onToggle: () => void;
  onDelete: () => void;
  onDrop: (conversationId: string) => void;
  onRename: (name: string) => void;
  children: React.ReactNode;
}

function DroppableFolder({ folder, onToggle, onDelete, onDrop, onRename, children }: DroppableFolderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const [{ isOver }, drop] = useDrop<{ id: string }, void, { isOver: boolean }>(() => ({
    accept: "conversation",
    drop: (item: { id: string }) => {
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim());
    } else {
      setEditName(folder.name);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div
        ref={(node) => drop(node)}
        className={`group flex items-center gap-2 rounded-lg p-2 transition-colors ${
          isOver ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <button onClick={onToggle} className="flex flex-1 items-center gap-2">
          {folder.isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
          <FolderIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setEditName(folder.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded border border-blue-500 bg-white px-2 py-0.5 text-sm text-gray-900 outline-none dark:bg-gray-700 dark:text-gray-100"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-left text-sm text-gray-900 dark:text-gray-100">
              {folder.name}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Edit2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
          </button>
        </div>
      </div>
      {folder.isExpanded && <div className="ml-4 mt-1 space-y-1">{children}</div>}
    </div>
  );
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
  folders,
  onCreateFolder,
  onDeleteFolder,
  onToggleFolder,
  onMoveConversationToFolder,
  onRenameFolder,
  onToggleSidebar,
}: ConversationSidebarProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  // Separate conversations into folders and uncategorized
  const conversationsByFolder = conversations.reduce((acc, conv) => {
    const key = conv.folderId || "uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const uncategorizedConversations = conversationsByFolder["uncategorized"] || [];

  // Drop zone for uncategorized area
  const [{ isOverUncategorized }, dropUncategorized] = useDrop<{ id: string }, void, { isOverUncategorized: boolean }>(() => ({
    accept: "conversation",
    drop: (item: { id: string }) => {
      onMoveConversationToFolder(item.id, null);
    },
    collect: (monitor) => ({
      isOverUncategorized: !!monitor.isOver(),
    }),
  }));

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1A1F2E]">
      {/* Collapse Button */}
      {onToggleSidebar && (
        <div className="border-b border-gray-200 p-3 dark:border-gray-700">
          <button
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Folders */}
            {folders.map((folder) => (
              <DroppableFolder
                key={folder.id}
                folder={folder}
                onToggle={() => onToggleFolder(folder.id)}
                onDelete={() => onDeleteFolder(folder.id)}
                onDrop={(conversationId) => onMoveConversationToFolder(conversationId, folder.id)}
                onRename={(name) => onRenameFolder(folder.id, name)}
              >
                {conversationsByFolder[folder.id]?.map((conversation) => (
                  <DraggableConversation
                    key={conversation.id}
                    conversation={conversation}
                    isActive={activeConversationId === conversation.id}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onDelete={() => onDeleteConversation(conversation.id)}
                  />
                ))}
              </DroppableFolder>
            ))}

            {/* Create Folder Button/Input */}
            {isCreatingFolder ? (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <FolderIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") {
                      setNewFolderName("");
                      setIsCreatingFolder(false);
                    }
                  }}
                  placeholder="Folder name..."
                  className="flex-1 rounded border border-blue-500 bg-white px-2 py-1 text-sm text-gray-900 outline-none dark:bg-gray-700 dark:text-gray-100"
                  autoFocus
                />
                <button
                  onClick={handleCreateFolder}
                  className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </button>
                <button
                  onClick={() => {
                    setNewFolderName("");
                    setIsCreatingFolder(false);
                  }}
                  className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <XIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">New folder</span>
              </button>
            )}

            {/* Uncategorized Conversations */}
            {uncategorizedConversations.length > 0 && (
              <div>
                <div
                  ref={(node) => dropUncategorized(node)}
                  className={`mb-1 rounded-lg p-2 text-xs text-gray-500 dark:text-gray-400 ${
                    isOverUncategorized ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  Uncategorized
                </div>
                <div className="space-y-1">
                  {uncategorizedConversations.map((conversation) => (
                    <DraggableConversation
                      key={conversation.id}
                      conversation={conversation}
                      isActive={activeConversationId === conversation.id}
                      onSelect={() => onSelectConversation(conversation.id)}
                      onDelete={() => onDeleteConversation(conversation.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="border-t border-gray-200 p-2 dark:border-gray-700">
        <SettingsMenu 
          theme={theme}
          onThemeChange={onThemeChange}
          language={language}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </div>
  );
}