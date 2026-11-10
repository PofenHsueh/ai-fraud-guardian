# ai-fraud-guardian
AI Fraud Guardian – Upload suspicious screenshots, links, or messages before a transfer and get an instant AI-powered fraud risk assessment.

AI 防詐安全守門員：客戶在模擬的 CUBE App 轉帳前，上傳可疑的截圖、網址或文字，取得 AI 詐騙風險研判，並記錄「暫停」或「繼續」的決策。

- 前端：React 19 + Vite + TypeScript、Ant Design（`antd`）、react-router，行動優先網頁
- 後端：API Gateway 直接整合 AWS 服務（不寫 Lambda）、DynamoDB、S3、Cognito
- AI 研判（Step Functions、Bedrock）由 Bedrock 團隊負責，不在本 repo

## 目錄

- [專案結構](#專案結構)
- [啟動方式](#啟動方式)
- [示範流程](#示範流程)
- [前端架構與分層](#前端架構與分層)
- [串接後端 API](#串接後端-api)
- [已知限制](#已知限制)
- [相關文件](#相關文件)

## 專案結構

```
ai-fraud-guardian/
  frontend/        前端程式
  docs/            系統設計、API 規格、OpenAPI 匯入檔、mock 狀態機、工作日報
  openspec/        OpenSpec 變更規劃（proposal、design、specs、tasks）
```

## 啟動方式

### 1. 環境需求

- Node.js 22 以上（確認：`node --version`）
- npm（隨 Node.js 安裝）

### 2. 安裝與啟動

```bash
cd frontend
npm install
npm run dev
```

看到下列訊息即啟動成功，用瀏覽器開啟 http://localhost:5173/ ：

```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

停止伺服器：在終端機按 `Ctrl + C`。

### 3. 用手機開啟

手機與電腦連同一個 Wi-Fi，改用下面的指令啟動，再用手機開啟終端機顯示的 `Network` 網址（例如 `http://192.168.x.x:5173/`）：

```bash
npm run dev -- --host
```

若手機打不開，請確認電腦防火牆允許 Node.js 的連入連線。

### 4. 示範模式與串接模式

前端依 `frontend/.env.local` 的設定自動切換，**不需要改程式**。登入與分析是兩個獨立的開關：

| 開關 | 留空（預設，示範模式） | 有填（串接模式） |
|---|---|---|
| `VITE_COGNITO_CLIENT_ID` | 登入頁不驗證，帳號密碼非空即可登入 | 以 Cognito 驗證帳號密碼 |
| `VITE_API_BASE_URL` | 分析結果使用內建假資料，可用 `?mock=` 切換情境 | 呼叫真實 API；網址帶 `?mock=` 時仍改用假資料 |

沒有 `.env.local` 時兩者都留空，也就是完整的示範模式。要使用串接模式：

```bash
cd frontend
cp .env.example .env.local   # 再依下表填入數值
npm run dev                  # 修改 .env.local 後必須重新啟動
```

| 變數 | 說明 | 由誰提供 |
|---|---|---|
| `VITE_API_BASE_URL` | API Gateway Stage 的 Invoke URL，例如 `https://xxxx.execute-api.ap-northeast-1.amazonaws.com/dev` | 角色 ② |
| `VITE_COGNITO_REGION` | Cognito 所在區域，預設 `ap-northeast-1` | 角色 ④ |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID；需啟用 `ALLOW_USER_PASSWORD_AUTH` | 角色 ④ |
| `VITE_COGNITO_TOKEN` | 選填，本機測試用的固定 ID Token；**不可**設定在正式部署環境 | — |

`.env.local` 已被 `.gitignore` 排除，請勿把金鑰或 Token 提交到 GitHub。

### 5. 示範用假資料（`?mock=`）

示範模式下，分析頁依網址參數 `?mock=` 顯示不同情境，未指定時為 `medium-high`。串接模式下帶 `?mock=` 也會改用假資料。

| `?mock=` | 情境 |
|---|---|
| `high` | 高風險 |
| `medium-high` | 中高風險（訊號含 HTML 標籤、建議含網址，用來確認純文字顯示） |
| `medium` | 中風險 |
| `low` | 低風險 |
| `low-empty` | 低風險、沒有風險訊號 |
| `failed` | 分析失敗或逾時，顯示 165 與客服備援管道 |
| `blocked` | 請求被拒絕（403） |
| `retrying` | 先顯示重試提示（429），再出現中高風險結果 |

守門員頁面重新整理會回到轉帳頁，所以請在**第一次開啟網站時**帶上參數，例如 http://localhost:5173/login?mock=failed ，再照常走完流程。

### 6. 其他指令

在 `frontend/` 目錄下執行：

| 指令 | 用途 |
|---|---|
| `npm run dev` | 啟動開發伺服器（存檔後畫面自動更新） |
| `npm run lint` | 程式碼檢查（oxlint），包含分層依賴方向檢查 |
| `npm run build` | 型別檢查並建置到 `frontend/dist/` |
| `npm run preview` | 在本機預覽 `build` 的結果 |

## 示範流程

1. **登入**（`/login`）：示範模式輸入任意帳號與密碼
2. **轉帳**（`/transfer`）：填寫收款人與金額，有兩種進入守門員的方式
   - 被動模式：點「防詐安全守門員：先查證再確認」卡片
   - 主動模式：金額 50,000 以上按「確認轉帳」，在提醒視窗選「先查證」
3. **守門員介紹**（`/guardian/intro`）：按「繼續」
4. **上傳證據**（`/guardian/evidence`）：新增截圖、網址或文字（最多 10 筆，可混合），勾選同意後按「開始分析」
5. **分析**（`/guardian/analysis`）：顯示查證中，接著顯示下列其中一種畫面
   - 結果：依風險等級選擇暫停或繼續（高、中高、中風險為「暫停並離開／我了解風險，仍要繼續轉帳」，低風險為「繼續轉帳／取消這筆轉帳」），之後回到轉帳頁
   - 分析失敗或逾時：提供 165 與銀行客服，同樣可選擇暫停或繼續
   - 被拒絕：可「返回上傳清單」重新送出，或「回到轉帳頁」

轉帳、守門員介紹、上傳證據三頁右上角有「登出」，登出會清除轉帳資料與查證內容並回到登入頁。查證中與結果等分析畫面刻意不提供返回與登出，客戶需透過下方按鈕做出決策。

## 前端架構與分層

採功能導向（feature-based）結構：同一功能的畫面、規則與 API 接點放在同一個資料夾。跨資料夾一律以 `@/` 匯入（`@/` 指向 `frontend/src/`），同資料夾內才用 `./`。

### 目錄總覽

```
frontend/src/
  main.tsx                  進入點：掛載 React、路由器與全域樣式
  index.css                 全域樣式
  app/                      應用層：組裝整個 App
    App.tsx                   全域 Provider（antd 主題、語系、流程狀態）與版型
    AppRoutes.tsx             路由表
    RequireGuardianFlow.tsx   守門員頁面的進入檢查
    AccountBar.tsx            頁首右側的使用者名稱與登出
    routes/                   各頁面
  features/                 功能層：依業務功能分組
    transfer/                 轉帳
    evidence/                 上傳證據
    analysis/                 分析與結果
  components/               共用畫面元件
  config/                   共用設定
  lib/                      共用基礎模組（與畫面無關）
  stores/                   共用狀態
  types/                    共用型別
```

### 依賴方向

```
  types   config   lib   components   stores      共用層
     \       \      |       /          /
      +-------+-----+------+----------+
                    |
                    v
               features/                          功能層
        transfer   evidence   analysis
        （三者之間不互相匯入）
                    |
                    v
                  app/                            應用層
```

- 箭頭代表「可以被誰匯入」：共用層可被功能層與應用層使用，功能層只能被應用層使用
- 共用層不可匯入 `features/` 或 `app/`
- 功能之間不互相匯入；需要組合多個功能時，在 `app/routes/` 的頁面中組合
- 這些規則寫在 `frontend/.oxlintrc.json`，違反時 `npm run lint` 會報錯

### 應用層 `app/`

負責把各功能組成完整的 App，是唯一可以同時使用所有功能的地方。

| 檔案 | 說明 |
|---|---|
| `App.tsx` | 設定 antd 主題、繁體中文語系、灰底輸入框樣式，提供流程狀態與手機版型 |
| `AppRoutes.tsx` | 路由表；守門員頁面套用 `RequireGuardianFlow`，未知路徑導回登入頁 |
| `RequireGuardianFlow.tsx` | 沒有進行中的守門員流程時（例如重新整理），導回轉帳頁 |
| `AccountBar.tsx` | 顯示使用者名稱（手機寬度自動隱藏）與登出；登出前確認，並清除 Token 與流程狀態 |
| `routes/LoginPage.tsx` | 登入頁 |
| `routes/TransferPage.tsx` | 轉帳頁，含主動提醒 |
| `routes/GuardianIntroPage.tsx` | 守門員介紹 |
| `routes/GuardianEvidencePage.tsx` | 上傳證據清單，離開時若有資料會先確認 |
| `routes/GuardianAnalysisPage.tsx` | 依分析狀態切換查證中、結果、備援、被拒絕畫面 |

頁面負責讀寫流程狀態、處理導頁，並把資料以 props 交給功能層的元件。

### 功能層 `features/`

每個功能內依用途分子資料夾：

| 子資料夾 | 放什麼 |
|---|---|
| `components/` | 畫面元件，只接收 props，不讀流程狀態、不呼叫 API |
| `api/` | 與後端溝通的接點（串接層要替換或維護的地方） |
| `hooks/` | 功能內的流程邏輯 |
| `utils/` | 驗證規則、資料建立等純函式 |
| `config/` | 功能專用的對照表與常數 |
| `mocks/` | 示範用假資料 |

**`features/transfer/`：轉帳**

| 檔案 | 說明 |
|---|---|
| `components/GuardianEntryCard.tsx` | 轉帳頁的「防詐安全守門員」入口卡片（被動模式） |
| `components/ProactiveAlertModal.tsx` | 大額轉帳的主動提醒視窗 |
| `utils/rules.ts` | 是否顯示主動提醒（`shouldShowProactiveAlert`） |

**`features/evidence/`：上傳證據**

| 檔案 | 說明 |
|---|---|
| `components/AddImageSheet.tsx`、`AddUrlSheet.tsx`、`AddTextSheet.tsx` | 新增截圖、網址、文字的底部彈窗 |
| `components/EvidenceList.tsx` | 已新增的證據清單，可預覽、刪除；內容一律以純文字顯示 |
| `utils/rules.ts` | 網址格式、文字字數、筆數上限、能否開始分析、檔案大小格式化 |
| `utils/evidenceFactory.ts` | 建立證據項目（含截圖預覽網址） |
| `api/useSubmitEvidence.ts` | 「開始分析」的送出點：存入送出資料並導向分析頁 |

**`features/analysis/`：分析與結果**

| 檔案 | 說明 |
|---|---|
| `components/AnalyzingView.tsx` | 查證中（含 429 重試提示） |
| `components/ResultView.tsx` | 結果：風險框、風險訊號、建議與決策按鈕，顏色依風險等級變化 |
| `components/FallbackView.tsx` | 分析失敗或逾時：提供 165 與銀行客服 |
| `components/BlockedView.tsx` | 請求被拒絕（403） |
| `config/riskLevels.ts` | 四種風險等級的名稱、顏色與決策按鈕文字 |
| `config/contacts.ts` | 165 與銀行客服電話（銀行客服號碼待確認） |
| `mocks/mockAnalysis.ts` | `?mock=` 各情境的假資料 |
| `api/useAnalysisView.ts` | 分析流程：串接模式下壓縮截圖、建立案件、上傳、啟動分析並輪詢結果；示範模式下回傳假資料 |
| `api/useReportDecision.ts` | 回報客戶決策（`POST /cases/{id}/decision`），失敗不擋使用者 |
| `hooks/useDecide.ts` | 決策後清理流程狀態並回到轉帳頁 |

### 共用層

可被任何功能或頁面使用，但本身不能依賴功能層或應用層。

| 資料夾 | 檔案 | 說明 |
|---|---|---|
| `components/` | `layouts/MobileLayout.tsx` | 最大寬度 480px 的手機版型，桌面瀏覽器也維持手機寬度 |
| | `layouts/Page.tsx` | 頁面骨架：頁首（返回、`CUBE｜標題`、右側內容）、內容區、固定在底部的按鈕區 |
| | `BottomSheet.tsx` | 從底部彈出的視窗 |
| `config/` | `paths.ts` | 所有路由路徑 |
| | `limits.ts` | 證據上限 10 筆、文字 1,000 字、主動提醒門檻 50,000 元 |
| | `theme.ts` | 品牌色、手機字級與控制項高度、版型寬度 |
| `lib/` | `guardianApi.ts` | 5 支 API 的呼叫，自動帶 Cognito Token，401 時換發後重試一次 |
| | `cognitoAuth.ts` | Cognito 登入、Token 換發與清除、取得顯示名稱 |
| | `imageCompressor.ts` | 截圖壓縮，確保單張不超過 10 MB |
| `stores/guardian-flow/` | `GuardianFlowProvider.tsx`、`guardianFlowContext.ts` | 守門員流程狀態：模式、證據、同意、轉帳草稿、送出資料、案件編號、決策；以 `useGuardianFlow()` 取用 |
| `types/` | `evidence.ts`、`analysis.ts`、`transfer.ts` | 畫面與串接層共用的資料型別，也是與 API 的資料契約 |

### 新增程式時放哪裡

| 要新增的東西 | 放在 |
|---|---|
| 新頁面 | `app/routes/`，並在 `config/paths.ts`、`app/AppRoutes.tsx` 加上路徑 |
| 只屬於某個功能的元件、規則或 API 接點 | 該功能的 `components/`、`utils/`、`api/` |
| 多個功能都會用到的畫面元件 | `components/` |
| 與畫面無關、多處共用的模組（API、驗證、檔案處理） | `lib/` |
| 數字門檻或可調整的設定 | `config/` |

## 串接後端 API

串接模式下，「開始分析」後的流程：

```
  useAnalysisView
     |
     | 1. 壓縮截圖（lib/imageCompressor）
     | 2. POST /cases                  建立案件
     | 3. PUT  /cases/{id}/files/{n}   上傳截圖到 S3
     | 4. POST /cases/{id}/analyze     啟動 Bedrock 分析
     | 5. GET  /cases/{id}             每 2.5 秒輪詢，30 秒逾時
     v
  AnalysisView（analyzing / result / failed / blocked）
     |
     | 客戶選擇暫停或繼續
     v
  useReportDecision -> POST /cases/{id}/decision
```

- 401：先自動換發 Token，失敗則導回登入頁
- 403：顯示「被拒絕」畫面
- 429：顯示重試提示並自動重試
- 其他錯誤、`FAILED` 或逾時：顯示 165 與客服備援管道

API 規格、VTL 範本與 AWS 主控台設定步驟見 [`docs/API-SPEC.md`](docs/API-SPEC.md)；可直接匯入 API Gateway 的設定檔為 [`docs/openapi-apigw.yaml`](docs/openapi-apigw.yaml)。在 Bedrock 團隊完成前，可匯入 [`docs/mock-state-machine.asl.json`](docs/mock-state-machine.asl.json) 作為假的分析流程，先測通整條路徑。

## 已知限制

- 流程狀態不保存，重新整理或直接開啟 `/guardian/*` 頁面會回到轉帳頁
- 頁面沒有登入檢查，登出後按瀏覽器的上一頁仍可回到轉帳頁
- 上傳證據頁的「離開時確認」只攔截畫面上的返回按鈕；瀏覽器返回鍵或 iOS 滑動返回不會跳出確認
- 銀行客服電話號碼尚待確認，目前顯示為「號碼待確認」

## 相關文件

| 文件 | 內容 |
|---|---|
| [`docs/fraud-guardian-design.md`](docs/fraud-guardian-design.md) | 系統設計：操作流程、畫面規格、API 設計、與 Bedrock 團隊的交接點、分工與時程 |
| [`docs/API-SPEC.md`](docs/API-SPEC.md) | 後端 API 規格與 AWS API Gateway 設定教學 |
| `openspec/changes/` | 各項變更的規劃文件 |
