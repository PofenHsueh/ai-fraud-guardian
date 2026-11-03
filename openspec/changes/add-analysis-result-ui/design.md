# Design

## Context

- 本 change 建立在 `add-evidence-upload-ui` 的前端專案上：路由 `/guardian/analysis` 目前只是佔位頁；流程狀態放在 `GuardianFlow` Context（模式、證據清單、轉帳草稿、送出資料）；「開始分析」透過 `useSubmitEvidence` 送出，串接層（③）之後替換它。
- 頁面與元件分層沿用前一個 change：`pages/` 讀寫 Context 並處理導頁，`components/` 只吃 props。
- 結果 JSON 只有草案（`docs/fraud-guardian-design.md` 6.2），403／429／逾時等狀態不在這份 JSON 裡，由 ③ 從 HTTP 狀態與輪詢時間判斷。
- 系統設計第 7 節約定「結果頁資料由 ③ 解析、① 只負責呈現」。

## Goals / Non-Goals

**Goals:**
- 畫面只依賴一個畫面專用型別，6.2 JSON 定案或變動時不需要改畫面
- 不接 API 也能展示每一種狀態（四種風險等級、失敗、被拒絕、重試中）
- ③ 只需替換兩個接點（取得狀態、回報決策）即可接上真實 API

**Non-Goals:**
- 輪詢間隔、逾時秒數、重試策略（③ 決定）
- 6.2 JSON 轉成畫面型別的轉換程式（③ 撰寫）

## Decisions

### 1. 畫面專用型別 `AnalysisView`
```ts
type RiskLevel = 'LOW' | 'MEDIUM' | 'MEDIUM_HIGH' | 'HIGH';

type AnalysisResult = {
  riskLevel: RiskLevel;
  fraudType: string;
  signals: string[];
  suggestion: string;
};

type AnalysisView =
  | { phase: 'analyzing'; retrying: boolean }
  | { phase: 'result'; result: AnalysisResult }
  | { phase: 'failed' }      // FAILED 或逾時
  | { phase: 'blocked' };    // 403

type Decision = 'paused' | 'continued';
```
型別放在 `src/types/analysis.ts`。`AnalysisResult` 欄位與 6.2 `result` 同名，③ 的轉換大多是直接搬值。
- 替代方案：畫面直接讀 6.2 JSON。少一層轉換，但 403／429／逾時不在 JSON 裡，畫面仍需另外接收；JSON 變動時畫面要跟著改。

### 2. 兩個替換接點，比照 `useSubmitEvidence`
- `useAnalysisView(): AnalysisView`：分析頁取得目前狀態
- `useReportDecision(): (decision: Decision) => void`：回報決策

本 change 的預設實作：
- `useAnalysisView` 先回傳 `analyzing` 約 2 秒，再依假資料情境切換；情境由網址參數 `?mock=` 指定（`high`、`medium-high`、`medium`、`low`、`low-empty`、`failed`、`blocked`、`retrying`），未指定時為 `medium-high`。`retrying` 情境先顯示重試提示再出結果
- 守門員頁面重新整理會回到轉帳頁，所以除了分析頁本身的 `?mock=`，也記住第一次開啟網站時網址上的 `?mock=`（例如開啟 `/login?mock=failed` 後照常走完流程）
- `useReportDecision` 只把決策存進 Context 並輸出到 console，不呼叫 API
- 決策後的清理與導頁集中在 `useDecide`（呼叫 `useReportDecision` 與 `finishGuardian`），③ 不需修改

③ 替換這兩個 hook 即可接上輪詢與 `POST /cases/{id}/decision`，頁面不需修改。
- 替代方案：用環境變數切換假資料。Demo 時要切情境必須重新建置，網址參數可以直接在手機上帶入。

### 3. 單一路由，依 `phase` 切換畫面
`/guardian/analysis` 一頁，依 `phase` 顯示四種畫面元件：`AnalyzingView`、`ResultView`、`FallbackView`、`BlockedView`。
- 替代方案：每種狀態一個路由。狀態由輪詢驅動，不是客戶操作，拆成路由會讓瀏覽器返回鍵回到已過期的狀態。

### 4. 風險等級對照集中一處
`src/lib/riskLevels.ts` 定義每個等級的名稱、顏色與決策按鈕文字：

| 等級 | 名稱 | 顏色 | 主要按鈕 | 次要按鈕 |
|---|---|---|---|---|
| `HIGH` | 高風險 | 紅（antd `red`） | 暫停並離開 | 我了解風險，仍要繼續轉帳 |
| `MEDIUM_HIGH` | 中高風險 | 橘（`orange`） | 暫停並離開 | 我了解風險，仍要繼續轉帳 |
| `MEDIUM` | 中風險 | 金黃（`gold`） | 暫停並離開 | 我了解風險，仍要繼續轉帳 |
| `LOW` | 低風險 | 綠（`green`） | 繼續轉帳 | 取消這筆轉帳 |

主要按鈕都是實心按鈕，次要按鈕為外框按鈕。按鈕文字只是呈現，交出的決策仍只有 `paused`／`continued`，攔阻率計算不受影響。

### 5. 決策後的導頁
在 `GuardianFlow` 新增 `finishGuardian(decision)`，統一處理決策後的清理：

| 決策 | 模式 | 轉帳草稿 | 證據與模式 | 導向 |
|---|---|---|---|---|
| `paused` | 任一 | 清空 | 清空 | `/transfer` |
| `continued` | `active` | 清空 | 清空 | `/transfer`，顯示「轉帳完成（模擬）」 |
| `continued` | `passive` | 保留 | 清空 | `/transfer` |

主動模式的「繼續」沿用轉帳頁「略過，繼續轉帳」的完成訊息，兩條路徑結果一致。

### 6. 撥號連結與「網址不可點擊」的區別
備援畫面的 165 與銀行客服用 `<a href="tel:...">`。「網址不可點擊」只針對客戶上傳與 AI 回傳的內容；撥號連結是系統提供的固定資訊，不受該規則限制。電話號碼集中在 `src/lib/contacts.ts`。

### 7. 被拒絕時回到上傳清單
`blocked` 畫面的「返回上傳清單」導向 `/guardian/evidence`，Context 中的證據與模式不清空，同意勾選也保留，客戶稍後可直接再按開始分析。不提供決策按鈕，因為請求已被擋下，決策也送不出去。

### 8. 查證中與結果畫面不提供返回
查證中離開會留下進行中的案件；結果畫面離開則沒有決策紀錄。兩者都只能透過畫面上的按鈕離開。瀏覽器返回鍵不攔截，與上傳清單頁的已知限制相同。

## Risks / Trade-offs

- [6.2 JSON 定案後欄位與 `AnalysisResult` 不同] → 只影響 ③ 的轉換，畫面不變
- [AI 回傳的風險等級不在四種之內] → 由 ③ 轉成 `failed`，畫面不處理未知等級
- [`?mock=` 參數在正式環境仍可使用] → ③ 替換 `useAnalysisView` 後參數不再生效；Demo 前確認已替換
- [瀏覽器返回鍵可離開查證中或結果畫面] → 示範環境可接受；回到上傳清單頁時清單仍在，不會遺失資料
- [風險顏色只靠色彩區分，色弱者不易辨識] → 等級名稱一律以文字同時顯示

## Open Questions

- 銀行客服的電話號碼與顯示名稱，需向計畫方確認後填入 `src/lib/contacts.ts`；只影響常數，不影響畫面結構
