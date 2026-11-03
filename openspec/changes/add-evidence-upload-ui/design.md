# Design

## Context

- Repo 目前只有文件與 OpenSpec 設定，沒有任何前端程式碼；本 change 從零建立前端專案（動機見 proposal.md）。
- 系統整體設計見 `docs/fraud-guardian-design.md`：前端部署在 Amplify，於 iOS／Android 手機瀏覽器實機測試，因此是行動優先的網頁，不是原生 App。
- 同一個前端專案由角色 ①（畫面）與 ③（串接）共用。設計文件第 7 節約定「資料由 ③ 解析、① 只負責呈現」，本設計要讓這條邊界在程式結構上成立。
- 團隊已決定使用 React + Vite + TypeScript 與 `antd`（桌面版 Ant Design）。
- 本機環境為 Node 22。

## Goals / Non-Goals

**Goals:**
- 建立可直接延伸的前端骨架（路由、共用版型、主題），讓 `add-analysis-result-ui` 與串接 change 只需新增頁面或替換資料來源
- 讓 `antd` 在手機螢幕上有適合觸控的尺寸與底部彈窗體驗
- 證據清單的資料型別能直接對應設計文件 6.1 的 `evidence` 欄位，③ 不需要重新整理資料結構
- 每個 spec scenario 都能在瀏覽器手動走過確認

**Non-Goals:**
- 不還原 CUBE App 的品牌視覺，只求版面與流程相似
- 不保存流程狀態到瀏覽器儲存空間（重新整理即清空）
- 不支援桌面版排版

## Decisions

### 1. 前端專案放在 `frontend/`
Repo 之後還會放基礎建設設定（角色 ④）與 API 規格（角色 ②），前端獨立在子目錄，避免根目錄混雜。
- 替代方案：放在 repo 根目錄。較簡單，但之後加入其他角色的檔案時要再搬移。

### 2. 路由使用 react-router，以頁面為單位切分
| 路徑 | 頁面 |
|---|---|
| `/login` | 模擬登入 |
| `/transfer` | 轉帳／匯款 |
| `/guardian/intro` | 查證說明 |
| `/guardian/evidence` | 上傳清單 |
| `/guardian/analysis` | 分析流程（本 change 只放佔位頁，由 `add-analysis-result-ui` 實作） |

主動提醒是轉帳頁上的彈窗，不是獨立路由。
- 替代方案：單一頁面用 state 切換畫面。省掉路由，但瀏覽器返回鍵無法對應「返回」行為，而 spec 有多個返回情境。

### 3. 流程狀態放在 React Context（`GuardianFlow`）
Context 保存：查證模式（`passive`／`active`）、證據清單、同意狀態、轉帳表單草稿。轉帳草稿放在這裡，才能滿足「從守門員返回轉帳頁仍保留輸入」。
- 替代方案：Redux／Zustand。目前狀態只有一個流程、少量欄位，額外套件不划算；之後若串接層變複雜可再引入。
- 替代方案：把模式放在 URL query。重新整理後能保留，但 Non-Goals 已排除保存狀態，且容易被手動改掉。

### 4. 證據資料型別採 discriminated union
```ts
type EvidenceItem =
  | { id: string; type: 'image'; file: File; fileName: string; sizeBytes: number; previewUrl: string }
  | { id: string; type: 'url'; value: string }
  | { id: string; type: 'text'; value: string };

type EvidenceSubmission = { mode: 'passive' | 'active'; items: EvidenceItem[]; consentedAt: string };
```
`url` 與 `text` 已與 6.1 的 `evidence` 欄位相同；`image` 保留原始 `File`，由 ③ 壓縮、上傳後換成 `s3Key`。型別放在 `src/types/`，作為 ① 與 ③ 的共同介面。

### 5. 頁面與元件分層：頁面接 Context，元件只吃 props
- `pages/` 讀寫 Context、處理導頁
- `components/` 只接收 props 與 callback，不讀 Context、不呼叫 API
- 「開始分析」由頁面呼叫一個 `submitEvidence(submission)` 函式。本 change 的實作只把資料存進 Context 並導向 `/guardian/analysis`；③ 之後替換這個函式即可接上真實上傳。

### 6. `antd` 的行動版調整
- 用 `ConfigProvider` 設定主題：控制項高度 44px、字級 16px（iOS 輸入框字級小於 16px 會自動放大畫面）
- 版面最大寬度 480px 置中，桌面瀏覽器開啟時看起來仍像手機
- 彈窗與底部彈窗的寬度不得超過 480px 版型：antd 的 `Modal`、`Drawer` 掛在 `body` 下，不受版型限制，預設寬度分別為 520px 與整個視窗寬，在桌面瀏覽器會超出版型。因此彈窗限制寬度、底部彈窗限制最大寬度並置中；遮罩維持全螢幕
- 底部彈窗用 `Drawer placement="bottom"`、高度自動、上方圓角
- 三種底部彈窗的主要按鈕（「上傳照片」「新增」）一律放在底部操作區、置於「取消」上方，讓按鈕寬度與排列一致；新增截圖彈窗的內容區只放一行說明「選擇對話、群組或轉帳要求的截圖」
- 截圖用 `Upload`，`accept="image/*"`，`beforeUpload` 回傳 `false` 阻止 antd 自動送出請求；預覽用 `Image` 的全螢幕預覽
- 替代方案：`antd-mobile`。元件更貼近手機，但團隊已選 `antd`。

### 7. 純文字顯示與網址不可點擊
- 所有使用者輸入與日後的 AI 回傳一律以 React 文字節點輸出；lint（oxlint，Vite 範本預設）開啟 `react/no-danger` 禁止 `dangerouslySetInnerHTML`
- 網址用 `Typography.Text` 顯示，不用 `<a>`

### 8. 驗證規則寫成純函式
網址格式、文字字數、清單上限、主動提醒門檻（預設 50,000）集中在 `src/lib/` 的純函式與常數，方便之後跟 API 規格對齊時只改一處。

### 9. 不寫自動化測試
本專案不寫單元測試與元件測試；以 `npm run lint`、`npm run build` 與手機瀏覽器手動走過 spec scenario 來驗證。

### 10. 守門員入口以淺色卡片呈現
轉帳頁的守門員入口做成淺綠色卡片：淺綠底、綠色邊框與盾牌圖示，標題「防詐安全守門員：先查證再確認」，下方一行說明「轉帳前不確定對方身分？讓 AI 幫您查證」，右側箭頭。整張卡片可點，仍以按鈕元素呈現，讓螢幕報讀軟體能辨識。
- 綠色帶有「安全」的意涵，也與主色（藍）的「確認轉帳」區隔
- 替代方案：實心主色或實心綠色按鈕。最醒目，但畫面會有兩顆實心按鈕，與「確認轉帳」搶主要動作
- 替代方案：主色外框按鈕。改動最小，但醒目程度不足
- 替代方案：橘黃警示色卡片。提醒感最強，但容易讓客戶覺得每筆轉帳都有風險

## Risks / Trade-offs

- [`antd` 預設偏桌面風格，在手機上按鈕與間距偏小] → 以主題 token 統一放大；第一個任務就完成主題設定，之後的畫面都套用
- [iPhone 照片可能是 HEIC，部分 Android 瀏覽器無法預覽] → 預覽失敗時顯示圖片圖示與檔名；格式轉換由串接 change 的壓縮步驟處理
- [多張原始照片放在記憶體與 object URL] → 清單上限 10 筆；刪除證據或離開流程時呼叫 `URL.revokeObjectURL`
- [清單上限 10 筆、文字 1,000 字是本 change 的假設，API 規格尚未定案] → 規則集中在 `src/lib/`，API 契約定案後若數字不同只需改常數與對應 spec
- [重新整理頁面會清空清單] → 示範情境可接受；若之後需要，可在串接 change 評估以 sessionStorage 保存非檔案欄位
- [`antd` 套件體積較大，影響手機首次載入] → 依賴 ES module tree-shaking；示範環境可接受，必要時再做路由層級的 code splitting

## Migration Plan

全新專案，無既有資料或行為需要遷移。部署由基礎建設 change 負責；本 change 完成時只需能在本機以 `npm run dev` 執行並用手機瀏覽器（同網段）開啟。

## Open Questions

- CUBE 風格的主色與 logo 是否要比照？只影響主題 token，可在畫面完成後再調整。
