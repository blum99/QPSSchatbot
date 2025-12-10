import { useState } from "react";
import { Upload, FileText, X, User, Mail, Phone, Plus, Trash2, Download } from "lucide-react";

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  type: string;
  category: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  addedAt: Date;
}

interface DocumentsContactsProps {
  theme: "light" | "dark";
}

export function DocumentsContacts({ theme }: DocumentsContactsProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "contacts">("documents");
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "ILO Health - User Manual.pdf",
      size: "2.4 MB",
      uploadedAt: new Date(Date.now() - 86400000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "2",
      name: "ILO Health - Technical Guide.pdf",
      size: "1.8 MB",
      uploadedAt: new Date(Date.now() - 172800000),
      type: "application/pdf",
      category: "Guide",
    },
    {
      id: "3",
      name: "ILO Pensions - User Manual.pdf",
      size: "3.1 MB",
      uploadedAt: new Date(Date.now() - 259200000),
      type: "application/pdf",
      category: "Manual",
    },
    {
      id: "4",
      name: "ILO Pensions - Technical Guide.pdf",
      size: "2.7 MB",
      uploadedAt: new Date(Date.now() - 345600000),
      type: "application/pdf",
      category: "Guide",
    },
    {
      id: "5",
      name: "Quick Reference Guide.pdf",
      size: "0.8 MB",
      uploadedAt: new Date(Date.now() - 432000000),
      type: "application/pdf",
      category: "Reference",
    },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      addedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 987-6543",
      addedAt: new Date(Date.now() - 172800000),
    },
  ]);

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  const handleDownloadDocument = (doc: Document) => {
    // Simulate download - in production, this would download the actual file
    console.log(`Downloading: ${doc.name}`);
    alert(`Downloading ${doc.name}`);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
        addedAt: new Date(),
      };
      setContacts((prev) => [contact, ...prev]);
      setNewContact({ name: "", email: "", phone: "" });
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="px-6 py-4">
          <h2 className="text-gray-900 dark:text-gray-100">Resources</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your PDF documents and contact information
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 transition-colors ${
              activeTab === "documents"
                ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 transition-colors ${
              activeTab === "contacts"
                ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "documents" ? (
          <div className="p-6">
            {/* Documents List */}
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No documents available
                </div>
              ) : (
                documents.map((doc) => (
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
        ) : (
          <div className="p-6">
            {/* Add Contact Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-gray-700"
              >
                <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Add New Contact</span>
              </button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-gray-900 dark:text-gray-100">New Contact</h3>
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  />
                  <button
                    onClick={handleAddContact}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Add Contact
                  </button>
                </div>
              </div>
            )}

            {/* Contacts List */}
            <div className="space-y-2">
              {contacts.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No contacts added yet
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">{contact.name}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Added {formatDate(contact.addedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}