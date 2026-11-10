# Design

## Context

動機見 proposal.md。現況：

- PR #1 新增 `lib/guardianApi.ts`（5 支 API 與 401 換發）、`lib/cognitoAuth.ts`（登入與 token）、`lib/imageCompressor.ts`（Canvas 壓縮）
- `guardianApi` 依賴 `cognitoAuth`；`LoginPage` 使用 `cognitoAuth`；`useAnalysisView` 使用 `guardianApi` 與 `imageCompressor`，並包含完整送出流程（壓縮、建立案件、上傳、啟動分析、輪詢）
- `theme.ts` 匯出的 `MOBILE_*` 寬度被 `BottomSheet` 與 `ProactiveAlertModal` 使用
- `GuardianFlowProvider` 保存轉帳草稿、證據、`caseId` 與決策，橫跨三個功能

## Goals / Non-Goals

**Goals:** 每個功能的程式集中；依賴方向單向且由 lint 檢查。

**Non-Goals:** 不調整 props、hook 簽章、Context 欄位；不加 barrel（`index.ts`）。

## Decisions

### 1. 目標結構

```
src/
  main.tsx, index.css
  app/
    App.tsx  AppRoutes.tsx  RequireGuardianFlow.tsx
    routes/        LoginPage  TransferPage  GuardianIntroPage  GuardianEvidencePage  GuardianAnalysisPage
  components/
    BottomSheet.tsx
    layouts/       MobileLayout  Page（含 CSS module）
  config/          paths.ts  limits.ts  theme.ts
  lib/             guardianApi.ts  cognitoAuth.ts  imageCompressor.ts
  stores/guardian-flow/   GuardianFlowProvider.tsx  guardianFlowContext.ts
  types/           analysis.ts  evidence.ts  transfer.ts
  features/
    transfer/   components/{GuardianEntryCard, ProactiveAlertModal}  utils/rules.ts
    evidence/   api/useSubmitEvidence.ts  components/{AddImageSheet, AddUrlSheet, AddTextSheet, EvidenceList}
                utils/{evidenceFactory.ts, rules.ts}
    analysis/   api/{useAnalysisView.ts, useReportDecision.ts}  hooks/useDecide.ts
                components/{AnalyzingView, BlockedView, FallbackView, ResultView}
                config/{riskLevels.ts, contacts.ts}  mocks/mockAnalysis.ts
```

### 2. PR #1 的三個模組留在 `lib/`

`imageCompressor` 概念上屬於證據，但呼叫者是 `analysis` 的 `useAnalysisView`；放進 `features/evidence` 會造成功能互相匯入。`cognitoAuth` 被 `guardianApi`（共用）與登入頁使用。三者都是與畫面無關的共用基礎，放在 `lib/`。替代方案是把送出流程搬回 `useSubmitEvidence`，屬於邏輯改寫，不在範圍內。

### 3. 依賴方向

`types`、`config`、`lib`、`components`、`stores` → `features` → `app`；功能之間不互相匯入。`GuardianFlowProvider` 的新增上限改為直接比較 `MAX_EVIDENCE_ITEMS`，不匯入證據功能的規則，行為不變。

### 4. 路徑別名與 lint

- `tsconfig.app.json` 加 `paths`，`vite.config.ts` 加 `resolve.alias`
- `.oxlintrc.json` 以 `overrides` ＋ `no-restricted-imports` 檢查方向；pattern 必須用 `**`（oxlint 的 `*` 只比對一層）；每個 override 都要重列禁止 `../**`，因為 override 會取代整條規則

### 5. 搬移方式

以 `git mv` 保留歷史，腳本依搬移對照改寫匯入；`main.tsx` 的 `./index.css` 必須維持在 `App` 之前匯入。

## Risks / Trade-offs

- [`lib/` 之後可能再變成雜物櫃] → README 寫明 `lib/` 只放與畫面無關的共用基礎模組
- [API-SPEC 與 README 路徑漏改] → 以 `ls` 逐一確認文件中的 `frontend/src/` 路徑存在
- [行為意外改變] → 以重構前後的瀏覽器流程比對確認

## Migration Plan

單一提交，無 API 或資料變動；回復方式為 revert。
