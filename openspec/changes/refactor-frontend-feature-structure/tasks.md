# Tasks

## 1. 路徑別名

- [x] 1.1 在 `tsconfig.app.json` 加 `@/*` paths、`vite.config.ts` 加 `resolve.alias`，確認 `npm run build` 通過

## 2. 共用層

- [x] 2.1 建立 `config/`：搬入 `paths.ts`、`theme.ts`，從 `lib/rules.ts` 抽出三個常數到 `limits.ts`，確認 `npm run build` 通過
- [x] 2.2 建立 `components/layouts/` 並搬入 `MobileLayout`、`Page`（含 CSS），確認 `npm run build` 通過
- [x] 2.3 搬移流程狀態到 `stores/guardian-flow/`，`addItem` 改為直接比較 `MAX_EVIDENCE_ITEMS`，確認 `npm run build` 通過

## 3. 功能層

- [x] 3.1 建立 `features/transfer/`（入口卡片、主動提醒彈窗、`shouldShowProactiveAlert`），確認 `npm run build` 通過
- [x] 3.2 建立 `features/evidence/`（三個新增彈窗、清單、`evidenceFactory`、規則、`useSubmitEvidence`），確認 `npm run build` 通過
- [x] 3.3 建立 `features/analysis/`（四個畫面、`riskLevels`、`contacts`、`mockAnalysis`、`useAnalysisView`、`useReportDecision`、`useDecide`），確認 `npm run build` 通過，且 `lib/` 只剩 `guardianApi`、`cognitoAuth`、`imageCompressor`

## 4. 應用層

- [x] 4.1 建立 `app/` 並搬入 `App`、`AppRoutes`、`RequireGuardianFlow` 與 `pages/`（改為 `app/routes/`），確認 `npm run build` 通過、`src/` 根目錄只剩 design 第 1 節列出的項目
- [x] 4.2 跨資料夾匯入全部改為 `@/`、整理匯入順序（`./index.css` 維持在 `App` 之前），確認 `grep -rn "from '\.\./" frontend/src` 無結果

## 5. 依賴方向與文件

- [x] 5.1 在 `.oxlintrc.json` 加入依賴方向規則；以刻意違規的匯入確認 `npm run lint` 會報錯，移除後 lint 通過
- [x] 5.2 更新 `frontend/README.md` 目錄表與串接接點路徑、`docs/API-SPEC.md` 第 1.2、7 節路徑，確認文件中每個 `frontend/src/` 路徑都存在

## 6. 整體確認

- [x] 6.1 `npm run build`、`npm run lint` 無錯誤；以重構前（`HEAD`）與重構後的開發伺服器跑同一套瀏覽器流程（登入、轉帳、主動提醒、三種證據、各 `?mock=` 情境、離開確認、直接開啟守門員頁面），確認每一步的畫面文字相同且沒有 JS 錯誤
