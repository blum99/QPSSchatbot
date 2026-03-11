"use client";

import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SettingsMenuProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function SettingsMenu({ theme, onThemeChange, language: _language, onLanguageChange: _onLanguageChange }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-700 dark:bg-neutral-700 dark:hover:bg-gray-600"
        aria-label="Settings"
      >
        <SettingsIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {/* Dark mode toggle */}
          <div className="p-2">
            <button
              onClick={() => {
                onThemeChange(theme === "light" ? "dark" : "light");
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
              </div>
            </button>
          </div>

          {/* Language selection temporarily removed */}
        </div>
      )}
    </div>
  );
}