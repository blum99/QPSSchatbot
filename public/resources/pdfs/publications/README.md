# Resources Folder

Place additional resource PDFs here (not guidebooks).

## Examples:
- Training materials
- Quick reference guides
- Policy documents
- Case studies
- Technical documentation

## Naming Convention:
Use descriptive names for your PDFs, for example:
- Training_Guide_Health_en.pdf
- Quick_Reference_Pension_sp.pdf
- Policy_Document_SSI_fr.pdf

These will appear in the Resources page under the "Resources" tab.

## Metadata
After adding a PDF, update the code in:
`src/app/components/chat/DocumentsContacts.tsx`

Add an entry to the `resourceDocuments` array with:
- id: unique identifier
- name: display name
- size: file size
- uploadedAt: date
- type: "application/pdf"
- category: "Resource" (or specific category)
- model: "health" | "pension" | "ssi" | "rap" | "general"
