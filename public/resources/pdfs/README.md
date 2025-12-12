# PDF Resources

This folder contains downloadable PDF documents that appear in the Resources view.

## How to Add PDFs

1. **Upload your PDF files** to this folder (`public/resources/pdfs/`)

2. **Update the documents list** in `src/app/components/chat/DocumentsContacts.tsx`:
   - Find the `initialDocuments` array
   - Update the filename to match your PDF
   - Or add new document entries

## Example Structure

```
public/resources/pdfs/
├── user-guide.pdf
├── technical-manual.pdf
├── faq.pdf
└── quick-start.pdf
```

## Current Documents

The Resources view currently shows these documents (configured in DocumentsContacts.tsx):
- User Guide
- Technical Manual
- FAQ Document
- Quick Start Guide
- Release Notes

## How PDFs Are Accessed

When users click the download button in the Resources view, the PDF will be served from:
```
/resources/pdfs/filename.pdf
```

For example:
- `user-guide.pdf` → `/resources/pdfs/user-guide.pdf`
- `technical-manual.pdf` → `/resources/pdfs/technical-manual.pdf`

## Next Steps

1. Upload your actual PDF files to this folder
2. Update the filenames in `DocumentsContacts.tsx` to match
3. The download links will automatically work
