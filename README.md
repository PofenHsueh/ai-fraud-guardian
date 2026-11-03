# ai-fraud-guardian
AI Fraud Guardian – Upload suspicious screenshots, links, or messages before a transfer and get an instant AI-powered fraud risk assessment.

## 啟動專案

目前只有前端，程式放在 `frontend/`。需要 Node 22 以上。

```bash
cd frontend
npm install
npm run dev
```

啟動後用瀏覽器開啟 http://localhost:5173/ 。

### 用手機開啟

手機與電腦連同一個網路，改用下面的指令啟動，再用手機開啟終端機顯示的 `Network` 網址：

```bash
npm run dev -- --host
```

### 示範流程

1. 登入頁輸入任意帳號與密碼（不會驗證）
2. 轉帳頁：
   - 點「防詐安全守門員」卡片 → 被動模式
   - 金額填 50,000 以上再按「確認轉帳」→ 跳出主動提醒，選「先查證」→ 主動模式
3. 新增截圖、網址或文字，勾選同意後按「開始分析」

流程狀態不會保存，在守門員的頁面重新整理會回到轉帳頁。

### 其他指令

在 `frontend/` 目錄下執行：

```bash
npm run lint    # 程式碼檢查
npm run build   # 型別檢查並建置到 dist/
```

目錄結構與串接說明見 [`frontend/README.md`](frontend/README.md)，系統設計見 [`docs/fraud-guardian-design.md`](docs/fraud-guardian-design.md)。
