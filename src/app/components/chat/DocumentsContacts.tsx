"use client";

import { useState } from "react";
import { Download, FileText, Book } from "lucide-react";
import { SettingsMenu } from "./SettingsMenu";

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  description: string;
  publisher: string;
  year: number;
  isbn: string;
  size: string;
  model: string;
  filename: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  model: string;
  filename: string;
}

interface DocumentsContactsProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  language: string;
  onLanguageChange: (language: string) => void;
  selectedGuidebookModel?: ModelType;
  onSelectedGuidebookModelChange?: (model: ModelType) => void;
}

type ResourceTab = "Guidebooks" | "Publications" | "Trainings";
type ModelType = "ILO/HEALTH" | "ILO/PENSIONS" | "ILO/SSI" | "ILO/RAP";

export function DocumentsContacts({ theme, onThemeChange, language, onLanguageChange, selectedGuidebookModel: propSelectedModel, onSelectedGuidebookModelChange }: DocumentsContactsProps) {
  const [activeTab, setActiveTab] = useState<ResourceTab>("Guidebooks");
  const [localSelectedModel, setLocalSelectedModel] = useState<ModelType>("ILO/HEALTH");

  const selectedGuidebookModel = propSelectedModel || localSelectedModel;
  const setSelectedGuidebookModel = onSelectedGuidebookModelChange || setLocalSelectedModel;

  const documents: Document[] = [
    {
      id: "1",
      name: "ILO/HEALTH Manual (English)",
      size: "11",
      type: "Manual",
      model: "ILO/HEALTH",
      filename: "ILO_Health_en.pdf",
    },
    {
      id: "2",
      name: "ILO/HEALTH Manual (French)",
      size: "12",
      type: "Manual",
      model: "ILO/HEALTH",
      filename: "ILO_Health_fr.pdf",
    },
    {
      id: "3",
      name: "ILO/HEALTH Manual (Spanish)",
      size: "11",
      type: "Manual",
      model: "ILO/HEALTH",
      filename: "ILO_Health_sp.pdf",
    },
    {
      id: "4",
      name: "ILO/PENSIONS Manual (English)",
      size: "11",
      type: "Manual",
      model: "ILO/PENSIONS",
      filename: "ILO_Pension_en.pdf",
    },
    {
      id: "5",
      name: "ILO/PENSIONS Manual (French)",
      size: "9",
      type: "Manual",
      model: "ILO/PENSIONS",
      filename: "ILO_Pension_sp.pdf",
    },
    {
      id: "6",
      name: "ILO/SSI User Guide (English)",
      size: "8",
      type: "Guide",
      model: "ILO/SSI",
      filename: "ILO_SSI_en.pdf",
    },
    {
      id: "7",
      name: "ILO/RAP Technical Documentation",
      size: "22",
      type: "Documentation",
      model: "ILO/RAP",
      filename: "ILO_RAP_en.pdf",
    },
  ];

  const publications: Publication[] = [
    {
      id: "1",
      title: "Financing Social Protection",
      authors: ["Michael Cichon", "Wolfgang Scholz", "Arthur van de Meerendonk", "Krzysztof Hagemejer", "Fabio Bertranou", "Pierre Plamondon"],
      description: "Comprehensive reference on financing social protection systems.",
      publisher: "ILO / IEA",
      year: 2004,
      isbn: "92-2-113582-0",
      size: "157 MB",
      model: "ILO/HEALTH",
      filename: "Financing_Social_Protection.pdf",
    },
    {
      id: "2",
      title: "Actuarial Mathematics of Social Security Pensions",
      authors: ["Subramanian Iyer"],
      description: "Actuarial theory and methods for pension scheme valuation.",
      publisher: "ILO / IEA",
      year: 1999,
      isbn: "92-2-110649-X",
      size: "28 MB",
      model: "ILO/PENSIONS",
      filename: "Actuarial_mathematics_of_social_security_pensions_en.pdf",
    },
    {
      id: "3",
      title: "Actuarial Practice in Social Security",
      authors: ["Pierre Plamondon", "Anne Drouin", "Gylles Binet", "Michael Cichon", "Warren R. McGillivray", "Michel Bedard", "Hernando Perez-Montas"],
      description: "Practical guide to actuarial valuation and modelling in social security.",
      publisher: "ILO / IEA",
      year: 2002,
      isbn: "92-2-110851-3",
      size: "112 MB",
      model: "ILO/PENSIONS",
      filename: "Actuarial_practice_in_Social_Security_en.pdf",
    },
    {
      id: "4",
      title: "Modelling in Health Care Finance",
      authors: ["Michael Cichon", "William Newbrander", "Hiroshi Yamabana", "Axel Weber", "Charles Normand"],
      description: "Quantitative models for health care financing and planning.",
      publisher: "ILO / IEA",
      year: 1999,
      isbn: "92-2-111330-1",
      size: "94 MB",
      model: "ILO/HEALTH",
      filename: "Modelling_in_health_care_ finance_en.pdf",
    },
    {
      id: "5",
      title: "Social Health Protection: An ILO Strategy Towards Universal Access to Health Care",
      authors: ["Xenia Scheil-Adlung"],
      description: "Strategy framework for achieving universal health coverage through social health protection.",
      publisher: "ILO / IEA",
      year: 2014,
      isbn: "92-2-128376-4",
      size: "45 MB",
      model: "ILO/HEALTH",
      filename: "Social_Health_Protection_en.pdf",
    },
    {
      id: "6",
      title: "Health Microinsurance Schemes: Monitoring and Evaluation Guide",
      authors: ["David M. Dror", "Alexander S. Preker"],
      description: "Practical guide for monitoring and evaluating health microinsurance schemes in developing countries.",
      publisher: "ILO / IEA",
      year: 2002,
      isbn: "92-2-113117-5",
      size: "38 MB",
      model: "ILO/HEALTH",
      filename: "Health_Microinsurance_en.pdf",
    },
  ];

  const handleDownloadDocument = (pub: Publication) => {
    const link = document.createElement('a');
    link.href = `/resources/pdfs/publications/${pub.filename}`;
    link.download = pub.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGuidebook = (doc: Document) => {
    const link = document.createElement('a');
    link.href = `/resources/pdfs/guidebooks/${doc.filename}`;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocuments = documents.filter((doc) => doc.model === selectedGuidebookModel);

  const tabs: ResourceTab[] = ["Guidebooks", "Publications", "Trainings"];
  const models: ModelType[] = ["ILO/HEALTH", "ILO/PENSIONS", "ILO/SSI", "ILO/RAP"];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#1A1F2E]">
      {/* Header */}
      <div className="bg-white px-6 py-6 dark:bg-[#1A1F2E]">
        <h2 className="text-2xl text-gray-900 dark:text-gray-100">Resources</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Access guidebooks, publications and training opportunities
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-[#1A1F2E]">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector - Only show for Guidebooks tab */}
      {activeTab === "Guidebooks" && (
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-[#1A1F2E]">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tool:</span>
            <div className="flex gap-2">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedGuidebookModel(model)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    selectedGuidebookModel === model
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-6 dark:bg-[#1A1F2E]">
        {activeTab === "Publications" && (
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="mb-6">
              <h3 className="text-xl text-gray-900 dark:text-gray-100">Publications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Training materials, quick reference guides, and other helpful documents
              </p>
            </div>

            {/* Publications List */}
            <div className="space-y-4">
              {publications.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No publications available for this model
                </div>
              ) : (
                publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:shadow-md dark:border-gray-700 dark:bg-[#1E2838] dark:hover:bg-[#252E3E]"
                  >
                    {/* Document Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Publication Info */}
                    <div className="flex-1">
                      <h4 className="mb-1 text-gray-900 dark:text-gray-100">{pub.title}</h4>
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        Authors: {pub.authors.join("; ")}
                      </p>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{pub.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span>Publisher: {pub.publisher}</span>
                        <span>•</span>
                        <span>Year: {pub.year}</span>
                        <span>•</span>
                        <span>ISBN: {pub.isbn}</span>
                        <span>•</span>
                        <span>Size: {pub.size}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadDocument(pub)}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download as PDF</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "Trainings" && (
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="mb-6">
              <h3 className="text-xl text-gray-900 dark:text-gray-100">Training Materials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Video tutorials, presentations, and training resources
              </p>
            </div>

            {/* Empty State */}
            <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center dark:border-gray-700 dark:bg-[#1E2838]">
              <p className="mb-2 text-gray-700 dark:text-gray-300">No training materials available yet.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Training resources will be added soon.</p>
            </div>
          </div>
        )}

        {activeTab === "Guidebooks" && (
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="mb-6">
              <h3 className="text-xl text-gray-900 dark:text-gray-100">Guidebooks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive guides and documentation
              </p>
            </div>

            {/* Guidebooks List */}
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No guidebooks available for this model
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:shadow-md dark:border-gray-700 dark:bg-[#1E2838] dark:hover:bg-[#252E3E]"
                  >
                    {/* Document Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1">
                      <h4 className="mb-1 text-gray-900 dark:text-gray-100">{doc.name}</h4>
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        Type: {doc.type}
                      </p>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Size: {doc.size} MB</p>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadGuidebook(doc)}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download as PDF</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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