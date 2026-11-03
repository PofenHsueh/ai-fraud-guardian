# Proposal

## Why

防詐安全守門員的 API 規格尚未定案，但前端畫面可先以假資料完成，讓串接（角色 ③）開始時已有可接的元件。本 change 建立前端專案，並完成「送出前」的所有畫面。

## What Changes

- 建立 React + Vite + TypeScript 前端專案，採 Ant Design（`antd`）元件庫，以手機瀏覽器為主要顯示環境
- 模擬 CUBE 登入頁與轉帳／匯款頁（僅畫面，不驗證身分）
- 轉帳頁提供「防詐安全守門員：先查證再確認」入口，不影響一般轉帳流程
- 主動提醒彈窗，暫以假觸發條件（例如金額門檻）顯示
- 查證說明頁
- 上傳清單：可重複新增截圖／網址／文字、顯示「已新增 N 筆」、逐筆刪除
- 三種底部新增彈窗（截圖、網址、文字）
- 同意勾選；未勾選或 0 筆時停用「開始分析」
- 畫面元件只接收外部傳入的資料，不直接呼叫 API

## 不在範圍內

- Cognito 登入與 Token 處理、截圖壓縮、實際上傳與 API 呼叫（由串接 change 負責）
- 查證中、結果頁、決策與錯誤畫面（`add-analysis-result-ui`）
- 主動提醒的真實觸發條件
- 部署與 AWS 資源設定

## Capabilities

### New Capabilities
- `guardian-entry`: 模擬登入、轉帳頁的守門員入口、主動提醒彈窗與查證說明頁
- `evidence-submission`: 證據清單的新增、預覽、刪除，以及送出前的同意確認

### Modified Capabilities

（無）

## Impact

- 新增前端專案目錄與相依套件（React、Vite、TypeScript、antd、react-router）
- 後續 `add-analysis-result-ui` 與前端串接 change 皆建立在此專案上
