# AISCU Backend

This is the backend API for the AISCU website, handling application forms and RAG (Retrieval-Augmented Generation) features.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Create a `.env` file in the root directory with the following variables:
    ```env
    PORT=3001
    CHROMA_API_KEY=your_chroma_api_key
    CHROMA_TENANT=your_tenant
    CHROMA_HOST=your_host
    CHROMA_DATABASE=your_database
    ```

3.  Start the server:
    ```bash
    npm start
    ```
