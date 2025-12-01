# AISCU Web Portal & ClubTerminal (社團小幫手)

這是一個為東吳大學人工智慧應用社 (AISCU) 設計的現代化社團網站與智慧終端系統。整合了 RAG (Retrieval-Augmented Generation) 技術，提供即時的社團資訊查詢服務。

## ✨ 特色功能

-   **ClubTerminal 智慧終端**:
    -   **Arknights 風格 UI**: 充滿科技感與沈浸式的視覺設計。
    -   **RAG 智慧問答**: 結合 Google Gemini 與 ChromaDB，根據社團資料庫回答問題。
    -   **嵌入式通知系統**: 現代化的操作回饋體驗。
-   **後台管理系統**:
    -   **資料庫 GUI**: 可視化管理社團知識庫 (Knowledge Base)。
    -   **多模態匯入**: 支援上傳 PDF、圖片、音訊或網頁連結，自動提取資訊入庫。
-   **現代化前端**: 基於 React + Vite 開發，效能優異。

## 🛠️ 技術棧

-   **Frontend**: React, Vite, TailwindCSS, Lucide Icons
-   **Backend**: Node.js, Express (API & RAG Middleware)
-   **AI / LLM**: Google Gemini API (`gemini-2.5-flash`, `text-embedding-004`)
-   **Vector DB**: ChromaDB (Docker)

---

## 🚀 快速開始 (Quick Start)

### 1. 環境準備 (Prerequisites)

請確保您的系統已安裝：
-   [Node.js](https://nodejs.org/) (v18+)
-   [Docker Desktop](https://www.docker.com/) (用於運行 ChromaDB)
-   Google Gemini API Key

### 2. 安裝依賴 (Installation)

```bash
# 複製專案
git clone <repository-url>
cd aiscu_web

# 安裝前端與後端依賴
npm install
```

### 3. 環境變數設定 (Configuration)

在專案根目錄建立 `.env.local` 檔案，並填入您的 API Key：

```env
# .env.local
VITE_API_KEY=your_google_gemini_api_key_here
```

### 4. 啟動向量資料庫 (Start Vector DB)

使用 Docker 啟動 ChromaDB 服務：

```bash
docker run -p 8000:8000 -e CHROMA_SERVER_CORS_ALLOW_ORIGINS='["http://localhost:5173","http://localhost:3001"]' chromadb/chroma
```

> **注意**: 必須設定 CORS 允許前端 (5173) 與後端 (3001) 存取。

### 5. 啟動應用程式 (Run Application)

本專案包含前端頁面與後端 API Server，建議開啟兩個終端機分別執行：

**Terminal 1: 啟動後端 Server (RAG API)**
```bash
npm run server
```
> Server 將運行於 `http://localhost:3001`

**Terminal 2: 啟動前端 Dev Server**
```bash
npm run dev
```
> Frontend 將運行於 `http://localhost:5173`

---

## 📦 部屬指南 (Deployment)

### 建置前端 (Build Frontend)

將 React 專案編譯為靜態檔案：

```bash
npm run build
```

編譯後的檔案將位於 `dist/` 目錄。

### Production 運行方式

在生產環境中，您通常會使用 Nginx 或類似的 Web Server 來服務 `dist/` 資料夾，並使用 PM2 來管理後端 Node.js Server。

1.  **Backend**: 使用 PM2 啟動
    ```bash
    npm install -g pm2
    pm2 start server.js --name "aiscu-backend"
    ```

2.  **Frontend**: 設定 Nginx 指向 `dist/` 目錄，並設定 Reverse Proxy 將 `/api` 請求轉發至 `localhost:3001`。

### Docker Compose (Optional)

若希望一鍵啟動所有服務，可參考以下 `docker-compose.yml` 範例（需自行建立）：

```yaml
version: '3'
services:
  chroma:
    image: chromadb/chroma
    ports:
      - "8000:8000"
    environment:
      - CHROMA_SERVER_CORS_ALLOW_ORIGINS=["*"]

  backend:
    build: .
    command: node server.js
    ports:
      - "3001:3001"
    depends_on:
      - chroma

  frontend:
    build: .
    command: npm run dev -- --host
    ports:
      - "5173:5173"
    environment:
      - VITE_API_KEY=${VITE_API_KEY}
```

---

## 📂 專案結構

```
aiscu_web/
├── src/
│   ├── components/   # React Components (ClubTerminal, etc.)
│   ├── services/     # API Services (Gemini, Chroma, RAG Engine)
│   ├── assets/       # Images & Static Assets
│   └── types/        # TypeScript Definitions
├── server.js         # Express Backend Server
├── applications/     # 儲存申請表單資料的目錄
├── public/           # Public Assets
└── ...
```

## 📝 注意事項

-   **API Key 安全**: `VITE_API_KEY` 暴露在前端程式碼中僅適用於 Demo 或內部使用。生產環境建議將 Gemini API 呼叫移至後端 `server.js` 透過 Proxy 處理，以保護 Key 不外洩。
-   **ChromaDB 資料持久化**: 目前 Docker 指令未掛載 Volume，重啟 Container 後向量資料會遺失。若需持久化請加入 `-v ./chroma-data:/chroma/chroma`。

---

© 2025 AISCU Team.
