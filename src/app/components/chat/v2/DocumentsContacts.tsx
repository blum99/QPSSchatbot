import { useState, useRef, useEffect } from "react";
import { FileText, Mail, Plus, Download, Moon, Sun, Settings, Globe, Check, Book, ChevronDown } from "lucide-react";

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  type: string;
  category: string;
  model?: "health" | "pension" | "ssi" | "rap" | "general";
  authors?: string;
  publisher?: string;
  year?: string;
  isbn?: string;
  description?: string;
}

interface DocumentsContactsProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: "English" | "Français" | "Español" | "Português";
  onLanguageChange: (language: "English" | "Français" | "Español" | "Português") => void;
  showDocumentsOnly?: boolean;
}

export function DocumentsContacts({ theme, onThemeChange, language, onLanguageChange, showDocumentsOnly = false }: DocumentsContactsProps) {
  const [activeTab, setActiveTab] = useState<"guidebooks" | "publications" | "training" | "contacts">(showDocumentsOnly ? "guidebooks" : "contacts");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"health" | "pension" | "ssi" | "rap">("health");
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "ILO Health Manual (English)",
      size: "11 MB",
      uploadedAt: new Date(Date.now() - 86400000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "2",
      name: "ILO Health Manual (French)",
      size: "12 MB",
      uploadedAt: new Date(Date.now() - 86400000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "3",
      name: "ILO Health Manual (Spanish)",
      size: "12 MB",
      uploadedAt: new Date(Date.now() - 86400000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "4",
      name: "ILO Pension Manual (English)",
      size: "6.1 MB",
      uploadedAt: new Date(Date.now() - 172800000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "5",
      name: "ILO Pension Manual (Spanish)",
      size: "6.6 MB",
      uploadedAt: new Date(Date.now() - 172800000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "6",
      name: "ILO SSI Manual (English)",
      size: "8.2 MB",
      uploadedAt: new Date(Date.now() - 259200000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "7",
      name: "ILO SSI Manual (French)",
      size: "8.5 MB",
      uploadedAt: new Date(Date.now() - 259200000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "8",
      name: "ILO RAP Manual (English)",
      size: "7.3 MB",
      uploadedAt: new Date(Date.now() - 345600000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "9",
      name: "ILO RAP Manual (Spanish)",
      size: "7.8 MB",
      uploadedAt: new Date(Date.now() - 345600000),
      type: "application/pdf",
      category: "Manual",
      model: "rap",
    },
  ]);

  const [resourceDocuments] = useState<Document[]>([
    {
      id: "r1",
      name: "Financing Social Protection",
      size: "5.8 MB",
      uploadedAt: new Date(),
      type: "application/pdf",
      category: "Publication",
      model: "general",
      authors: "Michael Cichon; Wolfgang Scholz; Arthur van de Meerendonk; Krzysztof Hagemejer; Fabio Bertranou; Pierre Plamondon",
      publisher: "ILO / ISSA",
      year: "2004",
      isbn: "92-2-115122-0",
      description: "Comprehensive reference on financing social protection systems.",
    },
    {
      id: "r2",
      name: "Actuarial Mathematics of Social Security Pensions",
      size: "2.0 MB",
      uploadedAt: new Date(),
      type: "application/pdf",
      category: "Publication",
      model: "general",
      authors: "Subramaniam Iyer",
      publisher: "ILO / ISSA",
      year: "1999",
      isbn: "92-2-110866-X",
      description: "Actuarial theory and methods for pension scheme valuation.",
    },
    {
      id: "r3",
      name: "Actuarial Practice in Social Security",
      size: "11.2 MB",
      uploadedAt: new Date(),
      type: "application/pdf",
      category: "Publication",
      model: "general",
      authors: "Pierre Plamondon; Anne Drouin; Gylles Binet; Michael Cichon; Warren R. McGillivray; Michel Bédard; Hernando Perez-Montas",
      publisher: "ILO / ISSA",
      year: "2002",
      isbn: "92-2-110863-5",
      description: "Practical guide to actuarial valuation and modelling in social security.",
    },
    {
      id: "r4",
      name: "Modelling in Health Care Finance",
      size: "11.4 MB",
      uploadedAt: new Date(),
      type: "application/pdf",
      category: "Publication",
      model: "general",
      authors: "Michael Cichon; William Newbrander; Hiroshi Yamabana; Axel Weber; Charles Normand; David Dror; Alexander Preker",
      publisher: "ILO / ISSA",
      year: "1999",
      isbn: "92-2-110862-7",
      description: "Quantitative modelling techniques for health care financing.",
    },
  ]);

  const handleDownloadDocument = (doc: Document, isResource: boolean = false) => {
    // Map display names to actual filenames for guidebooks
    const fileNameMap: Record<string, string> = {
      "ILO Health Manual (English)": "ILO_Health_en.pdf",
      "ILO Health Manual (French)": "ILO_Health_fr.pdf",
      "ILO Health Manual (Spanish)": "ILO_Health_sp.pdf",
      "ILO Pension Manual (English)": "ILO_Pension_en.pdf",
      "ILO Pension Manual (Spanish)": "ILO_Pension_sp.pdf",
      "ILO SSI Manual (English)": "ILO_SSI_en.pdf",
      "ILO SSI Manual (French)": "ILO_SSI_fr.pdf",
      "ILO RAP Manual (English)": "ILO_RAP_en.pdf",
      "ILO RAP Manual (Spanish)": "ILO_RAP_sp.pdf",
      // Publications
      "Financing Social Protection": "Financing_Social_Protection.pdf",
      "Actuarial mathematics of social security pensions": "Actuarial_mathematics_of_social_security_pensions_en.pdf",
      "Actuarial practice in Social Security": "Actuarial_practice_in_Social_Security_en.pdf",
      "Modelling in health care finance": "Modelling_in_health_care_ finance_en.pdf",
    };

    const fileName = fileNameMap[doc.name] || doc.name;
    const folder = isResource ? 'publications' : 'guidebooks';
    const link = document.createElement('a');
    link.href = `/resources/pdfs/${folder}/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter documents based on selected model
  const filteredDocuments = documents.filter((doc) => {
    if (selectedModel === "health") {
      return doc.name.toLowerCase().includes("health") || doc.model === "health";
    } else if (selectedModel === "pension") {
      return doc.name.toLowerCase().includes("pension") || doc.model === "pension";
    } else if (selectedModel === "ssi") {
      return doc.name.toLowerCase().includes("ssi") || doc.model === "ssi";
    } else if (selectedModel === "rap") {
      return doc.name.toLowerCase().includes("rap") || doc.model === "rap";
    }
    return false;
  });

  const filteredResourceDocuments = resourceDocuments.filter((doc) => {
    if (!doc.model || doc.model === "general") return true;
    return doc.model === selectedModel;
  });

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

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 relative">
      {/* Settings Menu - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-50" ref={settingsMenuRef}>
        <button
          onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
          className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-gray-800 shadow-lg transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        {settingsMenuOpen && (
          <div className="absolute bottom-14 left-0 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-2">
              <button
                onClick={() => {
                  onThemeChange(theme === "light" ? "dark" : "light");
                  setSettingsMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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

      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="px-6 py-4">
          <h2 className="text-gray-900 dark:text-gray-100">{showDocumentsOnly ? "Resources" : "Support"}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {showDocumentsOnly ? "Access guidebooks, publications, and trainings" : "Get help and contact our support team"}
          </p>
        </div>
        {/* Tabs - Only show for Resources view */}
        {showDocumentsOnly && (
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab("guidebooks")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "guidebooks"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Guidebooks
            </button>
            <button
              onClick={() => setActiveTab("publications")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "publications"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Publications
            </button>
            <button
              onClick={() => setActiveTab("training")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "training"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Trainings
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showDocumentsOnly ? (
          <div className="p-6">
            {/* Help Desk Contact Information - Support Page */}
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Help Desk</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Need assistance? Contact our help desk team or submit a support ticket.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Contact Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email Support</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Send us an email and we'll get back to you within 24 hours.
                      </p>
                      <a
                        href="mailto:helpdesk@ilo.org"
                        className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Mail className="h-4 w-4" />
                        <span>helpdesk@ilo.org</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Submit Ticket Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Submit a Ticket</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Create a support ticket to track your request and get updates.
                      </p>
                      <a
                        href="https://www.social-protection.org/gimi/ContactForm.action"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Submit New Ticket</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "guidebooks" ? (
          <div className="p-6">
            {/* Model Selector */}
            <div className="mb-6 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Model:
              </label>
              <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => setSelectedModel("health")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedModel === "health"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  }`}
                >
                  ILO/Health
                </button>
                <button
                  onClick={() => setSelectedModel("pension")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedModel === "pension"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  }`}
                >
                  ILO/Pension
                </button>
                <button
                  onClick={() => setSelectedModel("ssi")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedModel === "ssi"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  }`}
                >
                  ILO/SSI
                </button>
                <button
                  onClick={() => setSelectedModel("rap")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedModel === "rap"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  }`}
                >
                  ILO/RAP
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="mx-auto max-w-4xl">
              <div className="space-y-2">
                {filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No documents available
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.size} • {doc.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "publications" ? (
          <div className="p-6">
            {/* Publications Content */}
            <div className="mx-auto max-w-4xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Publications</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Training materials, quick reference guides, and other helpful documents
                </p>
              </div>

              <div className="space-y-2">
                {resourceDocuments.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400">
                      No publications available yet.
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                      Add PDFs to <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">/public/resources/pdfs/publications/</code>
                    </p>
                  </div>
                ) : (
                  resourceDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{doc.name}</h4>
                          {doc.authors && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Authors:</span> {doc.authors}
                            </p>
                          )}
                          {doc.description && (
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              {doc.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {doc.publisher && (
                              <span>
                                <span className="font-medium">Publisher:</span> {doc.publisher}
                              </span>
                            )}
                            {doc.year && (
                              <span>
                                <span className="font-medium">Year:</span> {doc.year}
                              </span>
                            )}
                            {doc.isbn && (
                              <span>
                                <span className="font-medium">ISBN:</span> {doc.isbn}
                              </span>
                            )}
                            <span>
                              <span className="font-medium">Size:</span> {doc.size}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(doc, true)}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          <Download className="h-4 w-4" />
                          <span className="text-sm">Download as PDF</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "training" ? (
          <div className="p-6">
            {/* Trainings Content */}
            <div className="mx-auto max-w-4xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Trainings</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Video tutorials, presentations, and other resources
                </p>
              </div>

              <div className="space-y-2">
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-gray-600 dark:text-gray-400">
                    No trainings available yet.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Trainings will be added soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Help Desk Contact Information */}
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Help Desk</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Need assistance? Contact our help desk team or submit a support ticket.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Contact Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email Support</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Send us an email and we'll get back to you within 24 hours.
                      </p>
                      <a
                        href="mailto:helpdesk@ilo.org"
                        className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Mail className="h-4 w-4" />
                        <span>helpdesk@ilo.org</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Submit Ticket Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Submit a Ticket</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Create a support ticket to track your request and get updates.
                      </p>
                      <a
                        href="https://www.social-protection.org/gimi/ContactForm.action"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Submit New Ticket</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}