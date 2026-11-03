# Proposal

## Why

客戶送出證據後，需要清楚看到 AI 研判結果並做出決策，決策紀錄也是攔阻率指標的來源。結果 JSON 已有草案（設計文件 6.2），可先以假資料完成「送出後」的所有畫面，等 API 定案再接上。

## What Changes

- 「AI 正在為您查證」等待畫面
- 結果頁：風險等級（LOW／MEDIUM／MEDIUM_HIGH／HIGH 各對應一種顏色）、詐騙類型、風險訊號清單、建議
- 所有 AI 回傳內容一律以純文字顯示，不以 HTML 渲染
- 決策按鈕：「暫停並離開」／「我了解風險，仍要繼續轉帳」
- 分析失敗或逾時的備援畫面，顯示 165 反詐騙專線與客服管道
- 403（稍後再試）與 429（重試中）的提示狀態
- 定義結果頁使用的資料型別，並提供依 6.2 欄位撰寫的假資料

## 不在範圍內

- 輪詢、逾時判斷、API 錯誤處理與決策回報的實際呼叫（由串接 change 負責）
- 結果 JSON 的最終定案（由 API 契約 change 與 Bedrock 團隊決定）
- AI 研判邏輯
- 送出前的畫面（`add-evidence-upload-ui`）

## Capabilities

### New Capabilities
- `analysis-result-display`: 查證中、結果、決策、備援與錯誤提示畫面，以及畫面所需的結果資料型別

### Modified Capabilities

（無）

## Impact

- 依賴 `add-evidence-upload-ui` 建立的前端專案與路由
- 結果資料型別將成為前端串接層的對接介面
