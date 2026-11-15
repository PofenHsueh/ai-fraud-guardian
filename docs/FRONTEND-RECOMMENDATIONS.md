---
title: "AI 防詐安全守門員 — 前端畫面與跨角色整合優化建議書"
description: "針對前端畫面（角色 ①）與驗證／壓縮模組（角色 ③）在不動到現有 UI 結構前提下的潛在問題盤點與修改建議"
date: 2026-11-10
tags: ["Frontend", "Recommendations", "UI", "Security", "SA-PM", "AI-Fraud-Guardian"]
author: "Eddie"
category: "Spec"
status: "Draft"
ticket: "AFG-FE-REC-001"
---

# AI 防詐安全守門員 — 前端畫面與跨角色整合優化建議書

> **目的**：本文件由角色 ②／③（API 設定與串接）角度出發，在不直接修改角色 ①（前端畫面）與共用顯示檔案的前提下，盤點目前前端在實際串接 AWS Cognito、S3、Step Functions 與 Bedrock 時可能遇到的邊界情境與資安／UX 優化建議，供團隊討論與後續迭代參考。

---

## 建議總覽（優先級排序）

| # | 項目 | 涉及檔案 | 影響層面 | 優先級 |
|---|---|---|---|---|
| 1 | [小於 2 MB 的非標準圖片格式（GIF/BMP/HEIC）未轉碼問題](#1-小於-2-mb-的非標準圖片格式未轉碼問題) | `src/lib/imageCompressor.ts`<br>`src/features/evidence/components/AddImageSheet.tsx` | S3 上傳與 Bedrock Textract 辨識成功率 | **High** |
| 2 | [Cognito 測試帳號 `NEW_PASSWORD_REQUIRED` 狀態提示](#2-cognito-測試帳號-new_password_required-狀態提示) | `src/lib/cognitoAuth.ts`<br>`src/app/routes/LoginPage.tsx` | 階段三實機聯調登入排障 | **High** |
| 3 | [401 Token 過期導回登入頁時的流程狀態清理](#3-401-token-過期導回登入頁時的流程狀態清理) | `src/features/analysis/api/useAnalysisView.ts`<br>`src/app/AccountBar.tsx` | 權限邊界與殘留轉帳草稿清理 | **Medium** |
| 4 | [頁首使用者名稱（`AccountBar`）PII 個資遮罩與 Base64 解碼防呆](#4-頁首使用者名稱-accountbar-pii-個資遮罩與-base64-解碼防呆) | `src/lib/cognitoAuth.ts`<br>`src/app/AccountBar.tsx` | 金融 App 個資保護規範（PII Masking） | **Medium** |
| 5 | [AI 回傳空字串與無 `submission` 進入分析頁的畫面防呆](#5-ai-回傳空字串與無-submission-進入分析頁的畫面防呆) | `src/features/analysis/components/ResultView.tsx`<br>`src/features/analysis/api/useAnalysisView.ts` | 異常回應與網址直連 UX | **Medium** |
| 6 | [備援畫面銀行客服電話常數補齊](#6-備援畫面銀行客服電話常數補齊) | `src/features/analysis/config/contacts.ts` | Demo 備援情境完整性 | **Low** |

---

## 1. 小於 2 MB 的非標準圖片格式未轉碼問題

- **涉及檔案**：
  - [`frontend/src/features/evidence/components/AddImageSheet.tsx`](../frontend/src/features/evidence/components/AddImageSheet.tsx)
  - [`frontend/src/lib/imageCompressor.ts`](../frontend/src/lib/imageCompressor.ts)
- **現況說明**：
  - `AddImageSheet.tsx` 的 `Upload` 設定為 `accept="image/*"`，僅檢查 `file.type.startsWith('image/')`。
  - `imageCompressor.ts` 在 `file.size <= 2 MB` 時會跳過 Canvas 轉碼直接回傳原檔，且 `normalizeMime()` 將非 `image/png`、`image/webp` 的所有格式一律標記為 `{ contentType: 'image/jpeg', ext: 'jpg' }`。
- **潛在風險**：
  - 若使用者在手機選擇 `<= 2 MB` 的 `image/heic`、`image/gif`、`image/bmp` 或 `image/avif`，前端會把原始二進位檔直接標上 `.jpg` 與 `image/jpeg` 上傳至 S3，導致 Bedrock 團隊的 Textract OCR 因圖片檔頭與副檔名不符而解析失敗（`FAILED`）。
- **建議修改方式**：
  - 在 `imageCompressor.ts` 中，**僅當 `file.size <= 2 MB` 且原生 `file.type` 為 `'image/png' | 'image/jpeg' | 'image/webp'` 時才直接回傳原檔**；其餘圖片格式無論大小一律經過 Canvas 轉碼為標準 `image/jpeg`。

---

## 2. Cognito 測試帳號 `NEW_PASSWORD_REQUIRED` 狀態提示

- **涉及檔案**：
  - [`frontend/src/lib/cognitoAuth.ts`](../frontend/src/lib/cognitoAuth.ts)
  - [`frontend/src/app/routes/LoginPage.tsx`](../frontend/src/app/routes/LoginPage.tsx)
- **現況說明**：
  - 當角色 ④ 在 AWS Cognito Console 建立測試使用者時，若未透過 CLI 將密碼設為 `--permanent`，首次呼叫 `InitiateAuth` (`USER_PASSWORD_AUTH`) 會回傳 HTTP `200`，但內容為 `{"ChallengeName": "NEW_PASSWORD_REQUIRED"}`（無 `AuthenticationResult.IdToken`，也無 `message`）。
  - 目前 `signInWithCognito()` 遇到無 `IdToken` 時統一拋出 `data.message ?? '帳號或密碼錯誤，請重新輸入'`。
- **潛在風險**：
  - 聯調測試時明明輸入正確密碼，畫面卻顯示「帳號或密碼錯誤」，容易耗費時間排查。
- **建議修改方式**：
  - 於 `signInWithCognito()` 判斷 `if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED')`，給出明確錯誤提示（例如：`此測試帳號尚處於臨時密碼狀態，請先於 Cognito 設定永久密碼`）。

---

## 3. 401 Token 過期導回登入頁時的流程狀態清理

- **涉及檔案**：
  - [`frontend/src/app/AccountBar.tsx`](../frontend/src/app/AccountBar.tsx)
  - [`frontend/src/features/analysis/api/useAnalysisView.ts`](../frontend/src/features/analysis/api/useAnalysisView.ts)
- **現況說明**：
  - `AccountBar.tsx` 登出時會依序執行 `clearAuthTokens()`、`navigate(paths.login, { replace: true })` 與 `startTransition(resetFlow)`。
  - 但 `useAnalysisView.ts` 在 API 回傳 `401`（且 Refresh Token 換發失敗）時，目前僅執行 `navigate(paths.login)`，未清除 `GuardianFlowContext` 中的轉帳草稿與已選證據。
- **建議修改方式**：
  - 比照 `AccountBar.tsx` 的做法，在 `useAnalysisView.ts` 的 `onUnauthorized` 回呼中同步執行 `clearAuthTokens()`、`navigate(paths.login, { replace: true })` 與 `startTransition(resetFlow)`。

---

## 4. 頁首使用者名稱（`AccountBar`）PII 個資遮罩與 Base64 解碼防呆

- **涉及檔案**：
  - [`frontend/src/lib/cognitoAuth.ts`](../frontend/src/lib/cognitoAuth.ts)
  - [`frontend/src/app/AccountBar.tsx`](../frontend/src/app/AccountBar.tsx)
- **現況說明**：
  - `getSignedInName()` 從 JWT Payload 解碼取出 `claims.name ?? claims['cognito:username'] ?? claims.email` 後直接回傳給 `AccountBar` 顯示。
  - 另外，`atob(base64)` 在未補齊 Base64 `=` padding（長度非 4 的倍數）時，部分行動裝置瀏覽器可能拋出 `DOMException` 而落入 `catch` 回傳 `null`（退回顯示「示範使用者」）。
- **建議修改方式**：
  1. 在 `atob()` 前補上 `base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')`，確保各家手機瀏覽器皆能穩定解析 JWT Payload。
  2. 若正式或 Demo 帳號使用身分證字號或完整 Email，建議在顯示前進行遮罩（如 `e***@cathay.com` 或 `A***9`），符合金融業前端不落明文個資原則。

---

## 5. AI 回傳空字串與無 `submission` 進入分析頁的畫面防呆

- **涉及檔案**：
  - [`frontend/src/features/analysis/components/ResultView.tsx`](../frontend/src/features/analysis/components/ResultView.tsx)
  - [`frontend/src/features/analysis/api/useAnalysisView.ts`](../frontend/src/features/analysis/api/useAnalysisView.ts)
- **現況說明**：
  1. `useAnalysisView.ts` 目前以 `typeof fraudType === 'string' && typeof suggestion === 'string'` 驗證結果；若後端或 Mock 回傳空字串 `""`，`ResultView.tsx` 會渲染出 `中高風險・`（標題缺後半）與 `建議：`（無內容）。
  2. 當使用者已進入守門員說明頁或上傳頁（此時 `mode` 非 `null`，會通過 `RequireGuardianFlow`），若尚未按「開始分析」（`submission === null`）就透過網址跳至 `/guardian/analysis`，在串接模式下 `if (!submission) return` 會讓畫面永遠停在 `AnalyzingView`（無返回按鈕）。
- **建議修改方式**：
  1. 將型別檢查改為驗證非空字串：`fraudType.trim().length > 0 && suggestion.trim().length > 0`。
  2. 當 `useRealApi && !submission` 時，執行 `navigate(paths.guardianEvidence, { replace: true })` 導回上傳清單頁。

---

## 6. 備援畫面銀行客服電話常數補齊

- **涉及檔案**：
  - [`frontend/src/features/analysis/config/contacts.ts`](../frontend/src/features/analysis/config/contacts.ts)
- **現況說明**：
  - `bankService.tel` 目前為 `null`，因此當觸發 `FallbackView`（分析失敗或 30 秒逾時）時，「銀行客服專線（號碼待確認）」按鈕為 `disabled` 狀態。
- **建議修改方式**：
  - Demo 前與團隊確認模擬顯示的客服號碼（例如國泰世華客服 `0223831000` 或 `0800818001`）填入 `contacts.ts`，讓備援畫面的兩顆撥號按鈕皆可實際點擊展示。

