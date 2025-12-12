"use client";

import { Mail, FileText, Settings as SettingsIcon, Plus } from "lucide-react";
import { SettingsMenu } from "./SettingsMenu";

interface SupportProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function Support({ theme, onThemeChange, language, onLanguageChange }: SupportProps) {
  const handleEmailSupport = () => {
    window.location.href = "mailto:helpdesk@ilo.org";
  };

  const handleSubmitTicket = () => {
    alert("Support ticket submission form would open here");
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#1A1F2E]">
      {/* Header */}
      <div className="bg-white px-6 py-6 dark:bg-[#1A1F2E]">
        <h2 className="text-2xl text-gray-900 dark:text-gray-100">Support</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Get help and contact our support team
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-8 dark:bg-[#1A1F2E]">
        <div className="mx-auto max-w-2xl">
          {/* Help Desk Title */}
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl text-gray-900 dark:text-gray-100">Help Desk</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need assistance? Contact our help desk team or submit a support ticket.
            </p>
          </div>

          {/* Support Options */}
          <div className="space-y-4">
            {/* Email Support Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-[#1E2838]">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="mb-2 text-gray-900 dark:text-gray-100">Email Support</h4>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Send us an email and we'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={handleEmailSupport}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    📧 helpdesk@ilo.org
                  </button>
                </div>
              </div>
            </div>

            {/* Submit a Ticket Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-[#1E2838]">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="mb-2 text-gray-900 dark:text-gray-100">Submit a Ticket</h4>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Create a support ticket to track your request and get updates.
                  </p>
                  <button
                    onClick={handleSubmitTicket}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Submit New Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Button - Fixed at bottom left */}
      <div className="absolute bottom-6 left-6">
        <SettingsMenu
          language={language}
          onLanguageChange={onLanguageChange}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>
    </div>
  );
}