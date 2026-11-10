# AI 防詐安全守門員｜操作流程與系統設計（API Gateway 版，含 Bedrock 整合）

> 來源：AI防詐安全守門員_操作流程_API_Gateway版_含Bedrock整合.pptx
> 國泰金控．第六屆雲世代計畫．A 組｜AI FRAUD GUARDIAN

## 1. 專案概述

- 被動查證入口 ＋ 主動風險提醒，兩種模式共用同一套上傳流程
- 範圍：從登入 App 到完成資料上傳、取回 AI 研判結果、記錄客戶決策
- AI 研判由另一個「Bedrock 團隊」負責；我方（四人小組）負責前端與 API Gateway，**不寫 Lambda**

## 2. 操作流程（7 步驟）

被動模式與主動模式在「進入查證頁面」後走同一套流程。

| 步驟 | 名稱 | 說明 |
|---|---|---|
| 1 | 開啟 App 並登入 | Cognito 身份驗證，取得操作權限 |
| 2 | 觸發防詐安全守門員 | 被動：客戶自行點選；主動：風險訊號跳出提醒 |
| 3 | 進入查證頁面 | 顯示「把可疑內容傳給我們」說明畫面 |
| 4 | 選擇資料類型 | 截圖／網址／自行輸入文字摘要 |
| 5 | 上傳並預覽內容 | 顯示檔名與大小，可預覽、可刪除重選 |
| 6 | 再次確認同意 | 送出前再次取得同意，不讀取手機內容 |
| 7 | 送出並完成上傳 | WAF / API Gateway 驗證，建立 Case ID |

步驟 7 完成後，案件經 API Gateway 交由 Bedrock 團隊進行 AI 風險研判。

## 3. 畫面規格

### 3.1 被動模式（送出前）

1. 開啟 App 並登入：CUBE App 登入頁（身分證字號／會員帳號、密碼、生物辨識登入）
2. 點選守門員入口：在轉帳／匯款頁（收款人／金額、備註）提供「防詐安全守門員：先查證再確認」入口；客戶自行點選，不影響一般轉帳流程
3. 上傳查證資料：
   - 可同時新增多筆截圖／網址／文字，逐一附加後一併送出（可重複新增，不限單一類型）
   - 清單顯示「已新增 N 筆」，每筆可 ✕ 刪除（例：`投資群組對話截圖.png｜截圖．1.8 MB`、`reurl.cc/abc123｜網址連結`）
   - 按鈕：＋ 截圖、＋ 網址、＋ 文字
   - 同意勾選：「我同意提供以上內容供查證分析，系統不會自動讀取手機內容」
   - 「開始分析」按鈕

### 3.2 新增資料彈窗

點選 ＋截圖／＋網址／＋文字後，由畫面底部彈出對應視窗：

| 按鈕 | 彈窗 | 內容 |
|---|---|---|
| ＋ 截圖 | 新增截圖 | 單一「上傳照片」選項、取消 |
| ＋ 網址 | 貼上可疑網址 | 輸入框「貼上網站或連結網址」、新增、取消 |
| ＋ 文字 | 輸入文字摘要 | 多行輸入（例：對方自稱投資顧問，保證每月穩賺 10%…）、新增、取消 |

### 3.3 查證結果（送出後）

4. AI 查證中：「AI 正在為您查證｜比對防詐知識庫與外部情資中，預計數秒內完成」
5. 分析結果（同一頁顯示）：
   - 風險等級與詐騙類型（例：中高風險．疑似假投資詐騙）
   - 辨識到的風險訊號（例：保證獲利話術、要求私下加 LINE 匯款、連結非平台認證合作機構）
   - 建議（例：暫緩匯款，並向 165 反詐騙專線查證）
   - 決策按鈕：「暫停並離開」／「我了解風險，仍要繼續轉帳」

## 4. API 設計

全部採 API Gateway 直接整合 AWS 服務，不撰寫 Lambda；按下「開始分析」才開始呼叫 API。

| # | 動作 | Method | Path | 後端整合 | 說明 |
|---|---|---|---|---|---|
| 1 | 建立 Case | POST | `/cases` | DynamoDB PutItem | 回傳 caseId，並存入網址與文字內容 |
| 2 | 上傳截圖 | PUT | `/cases/{id}/files/{n}` | S3 PutObject | 逐筆上傳，單檔須壓縮至 10 MB 以內 |
| 3 | 啟動分析 | POST | `/cases/{id}/analyze` | Step Functions StartExecution（Bedrock 團隊） | 全部上傳成功後呼叫（交接點 A） |
| 4 | 取回結果 | GET | `/cases/{id}` | DynamoDB GetItem | 每 2–3 秒輪詢，顯示「AI 正在為您查證」，逾時改顯示備援管道 |
| 5 | 回報決策 | POST | `/cases/{id}/decision` | DynamoDB UpdateItem | 記錄「暫停並離開」或「仍要繼續轉帳」，作為攔阻率指標 |

分析結果不會主動推送：Bedrock 團隊將結果寫回 DynamoDB（交接點 C），前端透過 API 4 取回。

### 4.1 前端串接原則

- 每次呼叫都在 Header 帶入 Cognito Token
- 截圖先在手機端壓縮，超過 10 MB 會被 API Gateway 拒絕
- 多筆資料可同時上傳，全部成功才進入步驟 3（啟動分析）
- AI 回傳內容一律以純文字顯示，不用 innerHTML 渲染

### 4.2 錯誤狀態對應

| 狀態 | 處理 |
|---|---|
| 401 | Token 失效 → 自動更新，失敗則引導重新登入 |
| 403 | 被 WAF 阻擋 → 提示稍後再試 |
| 429 | 請求過於頻繁 → 延遲後自動重試 |
| 逾時 | 分析未完成 → 顯示 165 與客服聯絡管道 |

## 5. 與 Bedrock 團隊整合

### 5.1 分工邊界

- 我方（前端與 API Gateway）：CUBE App（模擬）、Cognito 登入、上傳截圖、輪詢結果；API Gateway（WAF＋Cognito 授權，直接整合 AWS 服務）；S3 Evidence／DynamoDB Cases（存放截圖、案件狀態與分析結果）
- Bedrock 團隊（AI 研判流程）：Step Functions 狀態機（由交接點 A 啟動，一案一次執行）；Textract → 正規化 → 情資檢索（截圖 OCR、整理文字、查 Knowledge Base）；Bedrock 研判＋Guardrails（產出風險等級與建議；高風險送 SQS）
- Bedrock 團隊內部實作（模型、Prompt、Knowledge Base、Guardrails）由對方決定；雙方只約定輸入、輸出與權限

### 5.2 三個交接點

| 交接點 | 方向 | 內容 |
|---|---|---|
| A 啟動分析 | 我方 → Bedrock 團隊 | API Gateway 呼叫 StartExecution，傳入 caseId 與證據清單 |
| B 讀取證據 | Bedrock 團隊 → 我方 S3 | 對方執行角色只能讀取 `evidence/` 路徑下的截圖 |
| C 寫回結果 | Bedrock 團隊 → 我方 DynamoDB | 更新 status 與 result，前端透過 `GET /cases/{id}` 取回 |

雙方需約定 4 件事：輸入 JSON、輸出 JSON、IAM 權限、時效與錯誤處理。

### 5.3 整合清單

| 項目 | 約定內容 | 我方提供 | Bedrock 團隊提供 | 時間點 |
|---|---|---|---|---|
| 觸發方式 | API Gateway 直接呼叫對方狀態機（StartExecution） | API Gateway 執行角色 | 狀態機 ARN、區域 | 第 1 階段 |
| 輸入格式 | caseId、模式、截圖 S3 位置、網址與文字 | 輸入 JSON 規格 | 確認欄位是否足夠 | 第 1 階段 |
| 輸出格式 | 風險等級、詐騙類型、風險訊號、建議 | 結果頁需要的欄位 | 輸出 JSON 規格 | 第 1 階段 |
| 結果回寫 | 寫入 DynamoDB Cases 表的 status 與 result | 資料表名稱與欄位 | 寫回時機與狀態值 | 第 1 階段 |
| 存取權限 | 對方可讀 S3 `evidence/`、可更新 Cases 表 | IAM 政策、KMS 授權 | 執行角色 ARN、帳號 ID | 第 1 階段 |
| 時效與錯誤 | 30 秒內完成；失敗寫入 FAILED 與錯誤代碼 | 逾時與備援畫面 | 錯誤代碼清單 | 第 2 階段 |
| Mock 與測試 | 先串固定回傳的 mock 狀態機，再換真實流程 | 測試截圖素材 | Mock 狀態機 | 第 2 階段 |
| 個資與保存 | 截圖 30 天後自動刪除；不傳身分證字號給模型 | S3 生命週期設定 | Prompt 去識別化 | 第 2 階段 |
| 版本控管 | JSON 帶 schemaVersion，欄位變更需事先通知 | — | 變更通知 | 持續 |

## 6. 介面契約（JSON）

### 6.1 交接點 A：StartExecution 輸入（我方 → Bedrock 團隊）

```json
{
  "schemaVersion": "1.0",
  "caseId": "c-7f3a",
  "userId": "sub-雜湊值",
  "mode": "passive",
  "submittedAt": "2026-11-03T10:15+08:00",
  "evidence": [
    { "type": "image", "s3Key": "evidence/u123/c-7f3a/01.png" },
    { "type": "url", "value": "reurl.cc/abc123" },
    { "type": "text", "value": "保證每月穩賺 10%" }
  ]
}
```

### 6.2 交接點 C：寫回 DynamoDB Cases 表（Bedrock 團隊 → 我方）

```json
{
  "caseId": "c-7f3a",
  "status": "COMPLETED",
  "result": {
    "schemaVersion": "1.0",
    "riskLevel": "MEDIUM_HIGH",
    "fraudType": "疑似假投資詐騙",
    "signals": [
      "對話中出現保證獲利話術",
      "要求私下加 LINE 匯款"
    ],
    "suggestion": "暫緩匯款，向 165 查證",
    "errorCode": null
  }
}
```

- status：`SUBMITTED → PROCESSING → COMPLETED / FAILED`
- riskLevel：`LOW / MEDIUM / MEDIUM_HIGH / HIGH`，對應結果頁顏色
- 前端只讀 result 內的欄位並以純文字顯示；status 為 FAILED 或輪詢逾時時，改顯示 165 與客服聯絡管道

## 7. 四人分工

| 角色 | 範圍 | 主要工作 | 交付物 |
|---|---|---|---|
| ① 前端畫面開發 | 對應第 3 節畫面 | 模擬 CUBE 轉帳頁與主動提醒彈窗；查證說明頁、上傳清單與底部新增彈窗；同意頁、「AI 查證中」頁與結果頁 | 畫面元件與狀態清單 |
| ② API 設定與對接 | API Gateway 整合、Bedrock 窗口 | 5 支 API 的直接整合設定；Mapping template（VTL）撰寫與測試；Cases 資料表欄位與狀態設計；與 Bedrock 團隊定案輸入／輸出 JSON | API 規格與介面契約 |
| ③ API 串接 | 前端邏輯，對應第 4 節 | Cognito 登入與 Token 處理；截圖壓縮後經 API Gateway 上傳；輪詢結果、逾時處理與決策回報；401／403／429 等錯誤處理 | 可運作的前端串接層 |
| ④ 雲端基礎建設與部署 | 原「部署」角色擴大 | Amplify、Cognito、WAF、API Gateway；S3、DynamoDB、IAM 與 KMS；跨團隊 IAM 權限；CloudWatch 監控、dev／demo 分離與成本告警 | 環境設定值與部署網址 |

① 與 ③ 共用同一個前端專案：開工前先約定畫面與邏輯的切分方式（例如結果頁資料由 ③ 解析、① 只負責呈現）。

## 8. 協作方式與時程

### 8.1 交接內容

| 交接內容 | 提供者 | 使用者 | 時間點 |
|---|---|---|---|
| API 規格（路徑、參數、回傳 JSON 格式） | ② | ①③ | 第 1 階段定案（最優先） |
| 分析結果 JSON（與 Bedrock 團隊共同定案） | ② | ①③ | 第 1 階段，與 API 規格一起 |
| Cognito 設定值、API 網址、S3 bucket 名稱 | ④ | ②③ | 第 1 階段，環境建好即提供 |
| 畫面元件與狀態清單（載入中、錯誤、成功） | ① | ③ | 第 1 階段末，串接開始前 |

### 8.2 四個階段

| 階段 | 主題 | 工作項目 |
|---|---|---|
| 第 1 階段 | 定規格、建環境 | ② API 規格與介面契約；④ 建立 AWS 資源與部署管線；① 開始製作畫面；③ 先串好 Cognito 登入 |
| 第 2 階段 | 各自開發 | ① 用假資料完成全部畫面；② API Gateway 直接整合設定；③ 以 mock API 完成串接；④ 跨團隊 IAM 權限設定 |
| 第 3 階段 | 整合 | ③ 換成 ② 的真實 API；④ 部署至 demo 環境；④ iOS／Android 實機測試；全員共同修正問題 |
| 第 4 階段 | Demo 準備 | 全員演練主動與被動情境；① 備妥 Demo 測試素材；④ 確認監控與成本告警；② 與 Bedrock 團隊驗證結果 |