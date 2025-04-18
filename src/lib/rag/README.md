# Google Docs Integration for Scholarship RAG System

This guide explains how to set up Google Docs integration for your scholarship RAG system.

## Prerequisites

1. A Google Cloud account
2. Scholarship information stored in Google Docs

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your Project ID

### 2. Enable the Google Docs API

1. In your Google Cloud project, navigate to "APIs & Services" > "Library"
2. Search for "Google Docs API" and enable it

### 3. Create a Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Fill in the service account details:
   - Name: `scholarship-helper`
   - ID: `scholarship-helper`
   - Description: `Service account for accessing scholarship docs`
4. Click "Create and Continue"
5. Grant this service account the "Service Account User" role
6. Click "Continue" and "Done"

### 4. Create and Download Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" and click "Create"
5. The key file will be downloaded to your computer
6. Store this file securely and never commit it to your repository

### 5. Format Your Environment Variables

Open your `.env.local` file and add the following variables:

```
GOOGLE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
SCHOLARSHIP_DOC_IDS=doc_id_1,doc_id_2,doc_id_3
```

**Important**: The `GOOGLE_PRIVATE_KEY` must be enclosed in quotes and all newlines must be represented as `\n`.

### 6. Share Your Google Docs with the Service Account

For each Google Doc containing scholarship information:

1. Open the Google Doc
2. Click "Share"
3. Add the service account email (found in your key file as `client_email`)
4. Grant it "Viewer" access
5. Copy the document ID from the URL - it's the long string between `/d/` and `/edit` in the URL:
   `https://docs.google.com/document/d/YOUR_DOC_ID_HERE/edit`
6. Add this ID to your `SCHOLARSHIP_DOC_IDS` environment variable

### 7. Format Your Google Docs

For best results, structure your Google Docs with clear headings and sections:

- Use headings for scholarship names
- Use bullet points for requirements
- Include separate sections for eligibility, application process, and deadlines

## Troubleshooting

### Common Issues:

1. **Permission errors**: Make sure you've shared your docs with the service account
2. **Invalid private key**: Ensure the private key includes newlines as `\n` and is enclosed in quotes
3. **API not enabled**: Verify the Google Docs API is enabled for your project
4. **Document IDs**: Check that document IDs are correct and separated by commas without spaces

## Testing

After setup, restart your application and test your RAG system with a scholarship-related query. The system should now retrieve information from your Google Docs.
