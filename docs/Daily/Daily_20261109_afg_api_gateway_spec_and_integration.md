---
title: "工作日報 - 2026-11-09"
description: "AI 防詐安全守門員（ai-fraud-guardian）API 規格書制定、AWS API Gateway 無 Lambda 直接整合 VTL 範本與前端串接層開發"
date: 2026-11-09
tags: ["Daily Report", "AI-Fraud-Guardian", "API-Gateway", "VTL", "React", "AWS"]
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
| 日期 | 2026-11-09（星期一） |
| 人員 | Eddie |
| 環境 | dev / demo |

---

## 📊 今日簡要

| 項目 | 內容 |
|------|------|
| 主要工作 | 確立 `ai-fraud-guardian` 後端採用方案 1（AWS API Gateway 直接整合 AWS 服務，不寫 Lambda），完成 API 規格書、VTL 範本、AWS Console 設定教學與前端角色 ③ 串接層實作 |
| 關鍵產出 | 新增 `docs/API-SPEC.md`、`docs/openapi-apigw.yaml`，並完成 `frontend/src/` 下 5 支 API 串接、圖片壓縮與 Cognito 驗證模組 |

---

## ✅ 今日完成事項

### 🔒 安全修補

- **[ai-fraud-guardian API & Design Spec]** 修正 S3 證據路徑與強化跨案件防越權（IDOR 防護）
  - 修正 [`docs/fraud-guardian-design.md`](../fraud-guardian-design.md) §6.1 交接點 A 範例中的 `s3Key` 為 `"evidence/u123/c-7f3a/01.png"`，與 §5.2／§5.3 的 IAM `evidence/` 路徑限制對齊。
  - 在 API Gateway VTL Mapping Templates 中強制由 `$context.authorizer.claims.sub` 注入 `userId`，於 `GET /cases/{id}` 驗證案件擁有者、於 `POST /cases/{id}/decision` 加入 `ConditionExpression: "userId = :uid"`。

### 💻 功能開發

- **[ai-fraud-guardian Frontend（角色 ③ 串接層）]** 完成前端與 API Gateway 的雙模式（Mock / Real API）串接
  - 新增 Canvas 截圖壓縮工具 [`frontend/src/lib/imageCompressor.ts`](../../frontend/src/lib/imageCompressor.ts)，確保單張圖片上傳前壓縮至 `<= 10 MB`。
  - 新增 Cognito 驗證與 Token 自動更新模組 [`frontend/src/lib/cognitoAuth.ts`](../../frontend/src/lib/cognitoAuth.ts)，支援 `USER_PASSWORD_AUTH` 與 `401` 時 `REFRESH_TOKEN_AUTH` 自動換發。
  - 新增 API Client [`frontend/src/lib/guardianApi.ts`](../../frontend/src/lib/guardianApi.ts)，封裝 5 支 API（建立案件、上傳截圖、啟動分析、輪詢結果、回報決策）。
  - 更新 [`frontend/src/state/useAnalysisView.ts`](../../frontend/src/state/useAnalysisView.ts) 與 [`frontend/src/state/useReportDecision.ts`](../../frontend/src/state/useReportDecision.ts)，在未設定 `VITE_API_BASE_URL` 或網址帶 `?mock=` 時自動使用本地假資料，設定後自動切換為真實 AWS API Gateway 流程。

### 📄 文件規範

- **[ai-fraud-guardian Docs（角色 ② 規格與教學）]** 建立完整 API 規格書與 OpenAPI 匯入檔
  - 新增 [`docs/API-SPEC.md`](../API-SPEC.md)：定義 5 支 API 的 Request/Response JSON、DynamoDB `Cases` 表結構、S3 `evidence/` 路徑、VTL Mapping Templates 與 AWS Console Step 1 ~ Step 7 手把手設定教學。
  - 新增 [`docs/openapi-apigw.yaml`](../openapi-apigw.yaml)：包含 `x-amazon-apigateway-integration` 與 VTL 範本的 OpenAPI 3.0 定義檔，支援一鍵匯入 AWS API Gateway。

---

## 🔄 進行中

| 項目 | 狀態 | 預計完成 |
|------|------|----------|
| 在 AWS Console 實際建立 API Gateway、DynamoDB `Cases` 表與 S3 `Evidence` Bucket 並填入 `VITE_API_BASE_URL` | 進行中 | 待 AWS 環境（角色 ④）與 Bedrock 團隊狀態機 ARN 就緒後完成聯調 |

---

## ⚠️ 待處理問題

| 問題 | 優先級 | 負責人 |
|------|--------|--------|
| 需向角色 ④ 取得 Cognito User Pool ID / Client ID、S3 Bucket 名稱與 API Gateway Role ARN | High | 角色 ② / 角色 ④ |
| 需向 Bedrock 團隊確認交接點 A 的 Step Functions State Machine ARN | High | 角色 ② / Bedrock 團隊 |

---

## 🗒️ 工作日記

- **取捨**：16:10 評估過在 API Gateway 後方使用 Golang 或 Java 撰寫 Lambda，最終依設計書「不寫 Lambda」原則拍板採用 **方案 1（API Gateway AWS Service Direct Integration + VTL Mapping Template）**，零冷啟動且完全符合專案規範；同時在前端保留無後端時自動退回 `?mock=` 假資料的雙模式機制，確保未連上 AWS 前仍可本機展示完整畫面。

---

## 📅 明日計畫

1. 依 [`docs/API-SPEC.md` §5](../API-SPEC.md) 在 AWS Console 匯入 [`docs/openapi-apigw.yaml`](../openapi-apigw.yaml) 並完成 Stage Variables 設定。
2. 與 Bedrock 團隊進行交接點 A（`StartExecution`）與交接點 C（DynamoDB 寫回結果）端對端聯調。

---

## 💻 程式碼修改

### Docs / Spec（角色 ②）

- **[ai-fraud-guardian]** 新增 API 規格書、AWS Console 設定教學、OpenAPI 匯入檔與 Mock 狀態機
  - 檔案：`README.md`
  - 檔案：`frontend/README.md`
  - 檔案：`docs/API-SPEC.md`
  - 檔案：`docs/openapi-apigw.yaml`
  - 檔案：`docs/mock-state-machine.asl.json`
  - 檔案：`docs/fraud-guardian-design.md`
  - 改動：定義 5 支 API 契約與 VTL 範本，修正 `s3Key` 範例路徑為 `evidence/u123/c-7f3a/01.png`，並提供免等 Bedrock 團隊即可獨立驗證交接點 A/C 的 Step Functions Mock 狀態機定義檔

### Frontend（角色 ③）

- **[ai-fraud-guardian]** 新增 API 串接層、圖片壓縮、Cognito 登入整合與 GitHub 金鑰防洩漏 `.gitignore`
  - 檔案：`.gitignore`
  - 檔案：`frontend/.gitignore`
  - 檔案：`frontend/.env.example`
  - 檔案：`frontend/src/lib/cognitoAuth.ts`
  - 檔案：`frontend/src/lib/imageCompressor.ts`
  - 檔案：`frontend/src/lib/guardianApi.ts`
  - 檔案：`frontend/src/pages/LoginPage.tsx`
  - 檔案：`frontend/src/state/guardianFlowContext.ts`
  - 檔案：`frontend/src/state/GuardianFlowProvider.tsx`
  - 檔案：`frontend/src/state/useAnalysisView.ts`
  - 檔案：`frontend/src/state/useReportDecision.ts`
  - 改動：實作截圖壓縮（`<= 10 MB`）、Cognito 認證與 401 自動換發 Token、5 支 API 串接與輪詢，並設定 `.gitignore` 嚴格排除 `.env`、`.env.*`（僅保留 `.env.example`）與金鑰憑證檔，防止敏感資訊推上 GitHub；移除 `GuardianFlowProvider.tsx` 首行誤輸入之全形字元 `Ｇ` 並確認 Vite 正常啟動。
