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
| `src/state/` | 守門員流程狀態（`GuardianFlowProvider`）與送出點（`useSubmitEvidence`） |
| `src/types/` | 畫面與串接層共用的資料型別 |
| `src/lib/` | 驗證規則、上限與門檻常數 |

## 給串接層（角色 ③）

- **送出點**：`src/state/useSubmitEvidence.ts`。目前只把資料存起來並導向分析頁；在這裡換成截圖壓縮、上傳與呼叫 API。
- **送出資料**：型別是 `src/types/evidence.ts` 的 `EvidenceSubmission`。`url`、`text` 欄位與設計文件 6.1 的 `evidence` 相同；`image` 帶原始 `File`，上傳後換成 `s3Key`。
- **上限與門檻**：清單上限、文字字數、主動提醒門檻都在 `src/lib/rules.ts`。API 規格定案後若數字不同，改這裡即可。

## 已知限制

- 流程狀態不保存，重新整理或直接開啟 `/guardian/*` 頁面會回到轉帳頁。
- 上傳清單頁的「離開時確認」只攔截畫面上的返回按鈕；瀏覽器的返回鍵或 iOS 滑動返回不會跳出確認。
