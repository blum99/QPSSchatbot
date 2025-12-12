"use client";

import { Moon, Sun, Globe, Check, Settings as SettingsIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SettingsMenuProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
];

export function SettingsMenu({ theme, onThemeChange, language, onLanguageChange }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguages(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
        aria-label="Settings"
      >
        <SettingsIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Dark mode toggle */}
          <div className="p-2">
            <button
              onClick={() => {
                onThemeChange(theme === "light" ? "dark" : "light");
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
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

          {/* Language selection with nested dropdown */}
          <div className="relative border-t border-gray-200 p-2 dark:border-gray-700">
            <button
              onMouseEnter={() => setShowLanguages(true)}
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Globe className="h-4 w-4" />
                <span>Language</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{currentLanguage?.name}</span>
            </button>

            {/* Language dropdown - appears on the side */}
            {showLanguages && (
              <div className="absolute left-full top-0 ml-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="p-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLanguages(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        language === lang.code
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{lang.name}</span>
                      {language === lang.code && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}