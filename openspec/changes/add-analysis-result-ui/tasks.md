# Tasks

## 1. 型別與規則

- [x] 1.1 在 `src/types/analysis.ts` 定義 `RiskLevel`、`AnalysisResult`、`AnalysisView`、`Decision`（design 第 1 節），確認 `tsc -b` 通過
- [ ] 1.2 在 `src/lib/riskLevels.ts` 建立四種等級的名稱、顏色與決策按鈕文字對照（design 第 4 節），在 `src/lib/contacts.ts` 放 165 與銀行客服電話（銀行客服號碼依計畫方提供的值），確認 `tsc -b` 通過

## 2. 狀態與替換接點

- [x] 2.1 實作 `useAnalysisView` 預設版本：先 `analyzing` 約 2 秒，再依 `?mock=` 情境切換（含 `retrying` 先顯示重試提示），確認在瀏覽器以各個 `?mock=` 值走到 `/guardian/analysis` 都會進入對應狀態
- [x] 2.2 在 `GuardianFlow` 新增 `finishGuardian(decision)` 與 `useReportDecision` 預設版本（存入 Context、不呼叫 API），依 design 第 5 節處理轉帳草稿、證據、模式的清理與導頁，確認 `tsc -b` 通過
- [x] 2.3 在 `frontend/README.md` 的「給串接層」補上 `useAnalysisView`、`useReportDecision` 的位置與 `?mock=` 情境清單，確認文件中的檔案路徑都存在

## 3. 畫面

- [x] 3.1 實作 `AnalyzingView`（查證中文字、沒有返回按鈕、`retrying` 時多一行重試提示），並在瀏覽器確認 `?mock=retrying` 先出現提示、取得結果後提示消失
- [x] 3.2 實作 `ResultView` 的風險區塊（等級名稱與顏色、詐騙類型），並在瀏覽器確認四種等級的名稱與顏色正確
- [x] 3.3 實作 `ResultView` 的風險訊號清單與建議（純文字、空清單提示），並在瀏覽器確認多筆訊號依序顯示、`?mock=low-empty` 顯示「未辨識到明顯的風險訊號」、含 `<b>` 的假資料原樣顯示角括號、建議中的網址不是 `<a>`
- [x] 3.4 實作 `ResultView` 的決策按鈕（中風險以上與 LOW 的不同文字、沒有返回按鈕），並在瀏覽器確認兩組按鈕文字
- [ ] 3.5 實作 `FallbackView`（說明文字、165 與銀行客服 `tel:` 連結、兩個決策按鈕），並在瀏覽器確認 `?mock=failed` 的連結 `href` 為 `tel:` 開頭、決策按鈕可用
- [x] 3.6 實作 `BlockedView`（提示文字、返回上傳清單、回到轉帳頁、沒有決策按鈕），並在瀏覽器確認返回上傳清單後證據、模式與同意勾選都保留
- [x] 3.7 將 `GuardianAnalysisPage` 改為依 `phase` 切換四種畫面，確認 `npm run lint`、`npm run build` 通過

## 4. 整合檢查

- [x] 4.1 在瀏覽器分別以主動、被動模式走到結果頁，確認「暫停」清空表單回轉帳頁、主動「繼續」顯示轉帳完成、被動「繼續」回轉帳頁且表單保留，並確認交出的決策值正確
- [ ] 4.2 在手機瀏覽器開啟各個 `?mock=` 情境，確認畫面不超出版型、165 連結可開啟撥號畫面

## Workflow follow-up

- 實作與審查完成後，以 `/opsx:archive` 封存本 change，將 `analysis-result-display` 併入主 spec。
