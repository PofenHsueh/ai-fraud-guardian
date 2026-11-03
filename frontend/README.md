# 防詐安全守門員 前端

模擬 CUBE App 的轉帳流程與防詐安全守門員畫面。技術：React + Vite + TypeScript、Ant Design（`antd`）、react-router。

需求與設計見 `openspec/changes/add-evidence-upload-ui/`，系統整體設計見 `docs/fraud-guardian-design.md`。

## 指令

需要 Node 22 以上。

```bash
npm install
npm run dev            # 本機開發，http://localhost:5173/
npm run dev -- --host  # 讓同網段的手機也能開啟（使用終端機顯示的 Network 網址）
npm run lint           # oxlint
npm run build          # 型別檢查並建置到 dist/
```

## 目錄

| 路徑 | 內容 |
|---|---|
| `src/pages/` | 各頁面，讀寫流程狀態並處理導頁 |
| `src/components/` | 只接收 props 的畫面元件，不讀流程狀態、不呼叫 API |
| `src/state/` | 守門員流程狀態（`GuardianFlowProvider`）與串接層的替換接點（`useSubmitEvidence`、`useAnalysisView`、`useReportDecision`） |
| `src/types/` | 畫面與串接層共用的資料型別 |
| `src/lib/` | 驗證規則、上限與門檻常數、風險等級對照、聯絡電話、示範用假資料 |

## 給串接層（角色 ③）

- **送出點**：`src/state/useSubmitEvidence.ts`。目前只把資料存起來並導向分析頁；在這裡換成截圖壓縮、上傳與呼叫 API。
- **送出資料**：型別是 `src/types/evidence.ts` 的 `EvidenceSubmission`。`url`、`text` 欄位與設計文件 6.1 的 `evidence` 相同；`image` 帶原始 `File`，上傳後換成 `s3Key`。
- **分析狀態**：`src/state/useAnalysisView.ts`。目前依 `?mock=` 情境回傳假資料；在這裡換成輪詢 `GET /cases/{id}`。畫面只吃 `src/types/analysis.ts` 的 `AnalysisView`，請把 6.2 的回傳、403、429 與逾時轉成對應的 `phase`（`analyzing`／`result`／`failed`／`blocked`，429 重試中為 `analyzing` 且 `retrying: true`）。未知的風險等級請轉成 `failed`。
- **回報決策**：`src/state/useReportDecision.ts`。目前只把決策（`paused`／`continued`）存進流程狀態；在這裡換成呼叫 `POST /cases/{id}/decision`。決策後的清理與導頁在 `src/state/useDecide.ts`，不需要改。
- **上限與門檻**：清單上限、文字字數、主動提醒門檻都在 `src/lib/rules.ts`。API 規格定案後若數字不同，改這裡即可。

## 示範用假資料

接上 API 之前，分析頁依網址參數 `?mock=` 顯示不同情境，未指定時為 `medium-high`：

| `?mock=` | 情境 |
|---|---|
| `high` | 高風險 |
| `medium-high` | 中高風險（訊號含 HTML 標籤、建議含網址，用來確認純文字顯示） |
| `medium` | 中風險 |
| `low` | 低風險 |
| `low-empty` | 低風險、沒有風險訊號 |
| `failed` | 分析失敗或逾時，顯示備援管道 |
| `blocked` | 請求被拒絕（403） |
| `retrying` | 先顯示重試提示（429），再出現中高風險結果 |

守門員頁面重新整理會回到轉帳頁，所以請在**第一次開啟網站時**帶上參數，例如 `http://localhost:5173/login?mock=failed`，再照常走完流程。

## 已知限制

- 流程狀態不保存，重新整理或直接開啟 `/guardian/*` 頁面會回到轉帳頁。
- 上傳清單頁的「離開時確認」只攔截畫面上的返回按鈕；瀏覽器的返回鍵或 iOS 滑動返回不會跳出確認。
