# Proposal

## Why

`frontend/src` 依檔案種類分層（`components/`、`lib/`、`state/`、`pages/`），同一功能的畫面、規則與串接接點散在多處，`lib/rules.ts` 也混放證據、轉帳與格式化規則。PR #1 加入 API 串接層後檔案更多，趁串接層還沒部署前改成 React 常見的功能導向（feature-based）結構。

## What Changes

- 改為 `app/`（進入點、路由、頁面）、`features/`（transfer、evidence、analysis）與共用層（`components/`、`config/`、`lib/`、`stores/`、`types/`）
- `lib/` 只保留共用基礎模組：API client（`guardianApi`）、Cognito 驗證（`cognitoAuth`）、截圖壓縮（`imageCompressor`）
- 拆分 `lib/rules.ts`：上限與門檻常數移到 `config/limits.ts`，驗證規則移到各自功能
- 加入 `@/` 路徑別名，以 oxlint 限制依賴方向
- 更新 `frontend/README.md` 與 `docs/API-SPEC.md` 中的檔案路徑

## 不在範圍內

- 不改變任何畫面、文字、流程、API 呼叫或行為
- 不拆分或改寫 PR #1 的串接邏輯（送出流程仍在 `useAnalysisView`）
- 不改檔名慣例、不改狀態管理方式、不引入新套件
- 不修正 PR #1 審查發現的問題
- 不更新 `docs/Daily/` 的工作日報（保留當時路徑）
- 不撰寫自動化測試

## Capabilities

### New Capabilities

（無，純結構重構，設定 `skip_specs: true`）

### Modified Capabilities

（無）

## Impact

- `frontend/src/` 下所有檔案的位置與匯入路徑
- `frontend/tsconfig.app.json`、`frontend/vite.config.ts`、`frontend/.oxlintrc.json`
- `frontend/README.md`、`docs/API-SPEC.md`（第 1.2、7 節的路徑）
