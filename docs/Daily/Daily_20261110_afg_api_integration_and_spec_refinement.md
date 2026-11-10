---
title: "工作日報 - 2026-11-10"
description: "AI 防詐安全守門員（ai-fraud-guardian）對齊前端 Feature-Based 架構之 API 串接強化、API Gateway VTL 防呆更新與前端跨角色優化建議書"
date: 2026-11-10
tags: ["Daily Report", "AI-Fraud-Guardian", "API-Gateway", "VTL", "React", "AWS", "SA-PM"]
author: "Eddie"
category: "Daily Report"
---

# 工作日報

## 目錄

- [基本資訊](#基本資訊)
- [今日簡要](#-今日簡要)
- [今日完成事項](#-今日完成事項)
- [進行中](#-進行中)
- [待處理問題](#-待處理問題)
- [工作日記](#-工作日記)
- [明日計畫](#-明日計畫)
- [程式碼修改](#-程式碼修改)

## 基本資訊

| 項目 | 內容 |
|------|------|
| 日期 | 2026-11-10（星期二） |
| 人員 | Eddie |
| 環境 | dev / demo |

---

## 📊 今日簡要

| 項目 | 內容 |
|------|------|
| 主要工作 | 對齊隊友（角色 ①）重構後的 Feature-Based 前端結構，強化純 API 串接層（角色 ③）與 API Gateway VTL 範本（角色 ②），並產出跨角色前端優化建議書 |
| 關鍵產出 | 更新 `docs/API-SPEC.md`、`docs/openapi-apigw.yaml` 與 `frontend/src/` 下 4 支 API 接點檔案；新增 `docs/FRONTEND-RECOMMENDATIONS.md` |

---

## ✅ 今日完成事項

### 🔒 安全修補

- **[ai-fraud-guardian API Gateway VTL]** 強化交接點 A 路徑防偽造、JSON 單引號跳脫與 DynamoDB 條件驗證
  - 於 [`docs/API-SPEC.md`](../API-SPEC.md) 與 [`docs/openapi-apigw.yaml`](../openapi-apigw.yaml) 所有 VTL 字串跳脫補上 `.replaceAll("\\'", "'")`，防止輸入含單引號 `'` 時產生非法 JSON 跳脫序列 `\'`。
  - 修正 API 3（`POST /cases/{id}/analyze`）Request VTL，直接在模板本體組裝 `StartExecution` 的 `input` 字串並由伺服器端強制生成圖片 `s3Key`（`evidence/${safeUserId}/${safeCaseId}/${safeFile}`），避免文字含 `$`（如 `NT$50,000`）觸發 VTL 變數解析錯誤，同時防止客戶端偽造跨案件 S3 路徑。
  - 強化 API 4（`GET /cases/{id}`）Response VTL 對 `FAILED` 狀態下 `result` 子欄位的 null-safe 檢查，以及 API 5（`POST /cases/{id}/decision`）的 `ConditionExpression: "attribute_exists(caseId) AND userId = :uid"`。

### 💻 功能開發

- **[ai-fraud-guardian Frontend（角色 ③ 純 API 串接層）]** 強化 API 1~5 錯誤捕捉、重試狀態復原與輪詢計時
  - 更新 [`frontend/src/lib/guardianApi.ts`](../../frontend/src/lib/guardianApi.ts)：`AnalyzeEvidencePayload` 圖片項目補上 `fileName` 欄位，供後端 API Gateway VTL 組合 `s3Key`。
  - 更新 [`frontend/src/features/evidence/api/useSubmitEvidence.ts`](../../frontend/src/features/evidence/api/useSubmitEvidence.ts)：送出新案件前先執行 `setCaseId(null)` 重置前次案件編號。
  - 更新 [`frontend/src/features/analysis/api/useAnalysisView.ts`](../../frontend/src/features/analysis/api/useAnalysisView.ts)：將截圖壓縮納入 `try / catch`（失敗時轉為 `{ phase: 'failed' }` 避免卡在查證中畫面）、`429` 退避重試成功後自動復原 `retrying: false`、補上 `isCancelled()` 檢查，並將 30 秒輪詢逾時（`pollStartedAt`）改自 `startCaseAnalysis` 完成後獨立起算。
  - 更新 [`frontend/src/features/analysis/api/useReportDecision.ts`](../../frontend/src/features/analysis/api/useReportDecision.ts)：加入 `explicitMock === null` 判斷，確保網址帶 `?mock=` 時不呼叫真實 `POST /cases/{id}/decision`。

### 📄 文件規範

- **[ai-fraud-guardian Docs（角色 ② / SA-PM）]** 補齊 API 防呆規格表與跨角色前端建議書
  - 更新 [`docs/API-SPEC.md`](../API-SPEC.md)：新增 §2.4「使用者異常操作防呆規格表（Defensive Design Table）」與 §8「版本與功能補充紀錄（2026-11-10）」。
  - 新增 [`docs/FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md)：在不直接修改角色 ① 畫面與共用顯示檔案的前提下，盤點 6 項跨角色優化建議（小於 2 MB 非標準圖片轉碼、Cognito `NEW_PASSWORD_REQUIRED` 提示、401 狀態清理、頁首 `AccountBar` PII 遮罩與 Base64 padding、AI 空字串防呆、客服專線常數）。

---

## 🔄 進行中

| 項目 | 狀態 | 預計完成 |
|------|------|----------|
| 在 AWS Console 匯入 `docs/openapi-apigw.yaml` 並與 Bedrock 團隊進行交接點 A/C 端對端聯調 | 進行中 | 待 AWS 環境與狀態機 ARN 就緒後完成 |

---

## ⚠️ 待處理問題

| 問題 | 優先級 | 負責人 |
|------|--------|--------|
| 需與前端（角色 ①）確認 `docs/FRONTEND-RECOMMENDATIONS.md` 所列之 6 項畫面與驗證防呆建議是否納入修改 | Medium | 角色 ① / 角色 ③ |
| 需向角色 ④ 取得 Cognito User Pool ID / Client ID、S3 Bucket 名稱與 API Gateway Role ARN | High | 角色 ② / 角色 ④ |

---

## 🗒️ 工作日記

- **偏離**：17:30 依使用者明確指示「只改 API 的部分，因為畫面不歸我管」，將原本在 `cognitoAuth.ts`（供頁首 `AccountBar` 顯示名稱之 `getSignedInName`）與 `imageCompressor.ts` 的修改完全還原，嚴格限制異動範圍於純 API 串接檔（`guardianApi.ts`、`useSubmitEvidence.ts`、`useAnalysisView.ts`、`useReportDecision.ts`）與 API 規格文件，並將畫面／驗證相關建議改以獨立文件 [`docs/FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md) 交付。

---

## 📅 明日計畫

1. 在 AWS Console 匯入更新後的 [`docs/openapi-apigw.yaml`](../openapi-apigw.yaml) 並測試 VTL Mapping Templates。
2. 與團隊討論 [`docs/FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md) 中的跨角色優化項目。

---

## 💻 程式碼修改

### Docs / Spec（角色 ②）

- **[ai-fraud-guardian]** 更新 API 規格書、OpenAPI VTL 範本並新增前端跨角色優化建議書
  - 檔案：`docs/API-SPEC.md`
  - 檔案：`docs/openapi-apigw.yaml`
  - 檔案：`docs/FRONTEND-RECOMMENDATIONS.md`
  - 檔案：`docs/Daily/Daily_20261110_afg_api_integration_and_spec_refinement.md`
  - 改動：補齊 SA/PM 防呆規格表、強化 VTL 單引號跳脫與交接點 A `s3Key` 組裝防呆，並新增前端跨角色整合建議書

### Frontend（角色 ③ 純 API 接點）

- **[ai-fraud-guardian]** 強化 API 1~5 串接防呆、重試狀態復原與輪詢計時
  - 檔案：`frontend/src/lib/guardianApi.ts`
  - 檔案：`frontend/src/features/evidence/api/useSubmitEvidence.ts`
  - 檔案：`frontend/src/features/analysis/api/useAnalysisView.ts`
  - 檔案：`frontend/src/features/analysis/api/useReportDecision.ts`
  - 改動：補上 `AnalyzeEvidencePayload` 的 `fileName`、送出前重置 `caseId`、捕捉截圖壓縮異常轉 `failed`、`429` 重試成功復原 `retrying: false`、輪詢 30 秒逾時自 `startCaseAnalysis` 後獨立起算、以及 `?mock=` 模式下略過真實決策 API 呼叫；通過 `npm run lint`（oxlint 0 warnings/0 errors）與 `npm run build`

