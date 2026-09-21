# AISCU RAG 全雲端遷移計畫（僅計畫）

> 本文件不會建立任何雲端資源，也不會改變目前的本機部署。目標是讓目前的「前端 + API + RAG + 文件」架構能逐步、安全地遷移，且保留替換模型與向量資料庫的能力。

## 目標架構

建議以 GCP 作為初版目標平台，因為系統目前使用 Gemini；同一分層也可以等價地部署到 AWS 或 Azure。

```text
aiscu.xuyuzu.online       -> 靜態前端（Cloud Storage + CDN）
api.aiscu.xuyuzu.online   -> HTTPS Load Balancer / WAF -> Cloud Run API（Node.js）
                                                         -> Cloud Tasks / Worker（非同步匯入）
Cloud Storage（原始檔）   -> Ingestion adapter -> Embedding adapter -> PostgreSQL + pgvector
Cloud SQL PostgreSQL      -> 申請資料、文件中繼資料、對話／稽核紀錄
Secret Manager / KMS      -> Gemini 金鑰、加密金鑰、第三方憑證
OpenTelemetry             -> Langfuse 或 Phoenix、Cloud Logging、告警
```

向量層維持介面化：第一版可使用 `PostgreSQL + pgvector`，之後若檢索量、混合搜尋或獨立擴展需求提高，可將實作替換為受管 Qdrant；前端和 API 合約不變。

## 分階段執行

### Phase 0 — 盤點與安全基線

1. 列出現有文件、向量、申請資料及其敏感等級與保存期限。
2. 建立開發、staging、production 三組設定；所有金鑰移入 Secret Manager，禁止進入 Git、前端或映像檔。
3. 定義 API 合約與資料介面：`EmbeddingProvider`、`VectorStore`、`DocumentStore`、`JobQueue`。目前後端已將 Gemini 與 Chroma 從瀏覽器抽離，可作為此分層的起點。
4. 建立備份、刪除與事故處理規範，特別是含個資的入社申請資料。

### Phase 1 — 可重現的服務封裝與 CI/CD

1. 將 API、背景匯入 Worker 分別製作容器映像檔；API 不處理長時間的 OCR、切分或索引工作。
2. GitHub Actions：測試 -> 建置映像檔 -> 部署至 staging -> 健康檢查 -> 人工核准後 production。
3. 加入 liveness/readiness health check、結構化 JSON log、請求 ID、版本號與設定驗證。
4. 建立 staging 專用資料庫與測試文件，不與 production 共用任何金鑰或資料。

### Phase 2 — 雲端資料層與 RAG 工作流

1. 原始檔上傳至 Cloud Storage，PostgreSQL 保存文件、切分版本、嵌入模型版本與處理狀態。
2. 以 Cloud Tasks 或 Pub/Sub 將匯入工作排隊，Worker 執行 loader、chunker、embedding 與 upsert；工作必須可重試且具冪等性。
3. 將 Chroma 本機資料以「重新從原始檔索引」為優先遷移方式；若原始檔不足，再一次性匯出既有 chunks 與 metadata。
4. 實作引用來源、metadata filter、混合搜尋（keyword + vector）與 reranker，並針對無資料或低信心結果採取明確拒答策略。

### Phase 3 — 網域、安全與可觀測性

1. 新增 `api.aiscu.xuyuzu.online`，以 HTTPS Load Balancer 或 Cloud Run domain mapping 提供 API；前端 runtime config 改指向此 HTTPS 網域。
2. 在 API 前加入 WAF、rate limit、CORS allowlist、管理者登入與角色授權；匯入端點僅限管理者。
3. 申請資料與審計紀錄存入 Cloud SQL，啟用傳輸中 TLS、靜態加密、每日備份與 Point-in-Time Recovery。
4. 以 OpenTelemetry 串接 Langfuse/Phoenix，記錄延遲、token、檢索命中率、成本、失敗率與不安全輸出；避免送出完整個資。

### Phase 4 — 品質驗證與切換

1. 建立繁中校園問答評測集，使用人工審核加上 Ragas／檢索指標評估回答正確性、引用完整性與拒答品質。
2. 以 staging 壓力測試與資安檢查確認容量、費用上限、備份還原及失效情境。
3. 採藍綠或 canary 切換：先讓少量管理者使用雲端 API，通過觀測門檻後才更新公開 runtime config。
4. 保留本機環境一個觀察週期；設定 DNS / runtime config 可立即回切，確認資料一致性後再正式退役。

## 上線驗收條件

- 前端、API、Worker、向量庫與資料庫各自可獨立擴縮與部署。
- Gemini 金鑰與加密金鑰只存在 Secret Manager，且可輪替。
- 每個回答能提供資料來源；沒有足夠依據時會拒答。
- 文件匯入可重試、不會重複寫入，且有可追蹤的工作狀態。
- 已演練資料庫還原、金鑰輪替、API 回滾與模型／向量庫替換。
- 有每月成本預算、用量告警與 production SLO。
