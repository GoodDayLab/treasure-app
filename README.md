# Treasure — Next.js 專案

卡牌收藏管理 App。資料庫 schema 對應 Step 4 ER 設計,design tokens 與元件對應 Step 6-7 Design System。

## 資料夾結構

```
.
├── app/
│   ├── layout.tsx           # Root layout,含頂部導覽 + 載入 tokens.css / globals.css
│   ├── page.tsx              # 收藏列表(Dashboard):MetricCard 總覽 + CardThumbnail 卡片牆
│   ├── cards/[id]/
│   │   ├── page.tsx           # Server Component,依 id 從資料庫取資料、找不到就 404
│   │   └── CardDetail.tsx      # Client Component,單卡詳情頁:標籤/編輯/照片上傳/分享都是真的能動
│   ├── share/[id]/page.tsx     # 公開分享頁,任何人拿到連結都能看,只顯示安全欄位
│   ├── api/upload/route.ts     # 照片上傳 API,存進 Vercel Blob 再寫一筆 Photo 記錄
│   └── globals.css             # 引入 styles/tokens.css + 基礎樣式
├── components/ui/
│   ├── Button.tsx              # primary / secondary / ghost
│   ├── TagPill.tsx              # 多維度標籤,含 AddTagPill
│   ├── PhotoFrame.tsx            # 5:7 博物館畫框風照片容器
│   ├── PriceTag.tsx               # 漲跌幅 + Dashboard 用的 MetricCard
│   ├── CardThumbnail.tsx           # 收藏列表用的卡片縮圖(連到詳情頁)
│   ├── SectionCard.tsx              # 詳情頁分區容器(收藏故事/時間軸共用)
│   └── TimelineItem.tsx              # 時間軸單一事件節點
├── lib/
│   ├── prisma.ts                # PrismaClient singleton(避免 dev hot reload 重複建立連線)
│   └── data.ts                   # 所有 Prisma 查詢(Dashboard / 詳情頁 / 分享頁三種資料形狀)
├── prisma/
│   ├── schema.prisma              # 資料庫 schema
│   └── seed.ts                     # 種子資料(1 個使用者 + 5 張卡),`npm run db:seed` 執行
├── styles/
│   └── tokens.css                 # 色彩/字體/圓角 design tokens
└── .env.example                     # DATABASE_URL / BLOB_READ_WRITE_TOKEN 範例
```

## 技術選型

- **框架**:Next.js 15(App Router)+ TypeScript + React 19
- **資料庫**:PostgreSQL + Prisma ORM
- **圖片儲存**:Vercel Blob(`@vercel/blob`)
- **樣式**:CSS variables(見 `styles/tokens.css`),純 CSS(未套用 Tailwind,可自行加上)
- **部署**:Vercel

## 跟原始 schema 的一個差異

`prisma/schema.prisma` 的 `Card` model 多加了一個 `name` 欄位(例如「工藤新一」「皮卡丘」)。原本的 schema 只有 `game`/`series`/`cardNumber`,沒有卡片本身的顯示名稱,前端沒辦法顯示「這是哪一張卡」,所以補上了這個欄位。如果你們原本對這塊有別的規劃,之後可以再調整。

## 本機開發

1. 安裝依賴:`npm install`
2. 設定 `.env`(見下方部署章節,建議直接用 `vercel env pull` 拿正式資料庫的連線字串,不用自己在本機另外裝 Postgres)
3. `npx prisma generate`
4. `npm run dev`,開 http://localhost:3000

## 部署上線(這樣手機才能直接連網址用)

以下帳號申請、登入、在 Vercel 網站上點的步驟都需要你自己操作——這些是「建立帳號」「輸入密碼登入」類的動作,我沒辦法代替你做。程式碼跟設定我已經準備好了,照著做應該不會卡。

### A. 建立 Vercel 專案

```bash
npx vercel login
# 會印出一個網址,用瀏覽器打開、用 GitHub 帳號登入/授權即可,不用手動打密碼

npx vercel link
# 依提示建立這個資料夾對應的 Vercel 專案(直接按預設值即可)
```

### B. 建立資料庫 + 圖片儲存空間(在 vercel.com 網站上點,不是指令)

1. 打開 https://vercel.com/dashboard,點進剛剛建立的專案
2. 上方分頁選 **Storage** → **Create Database** → 選 **Postgres** → 建立後按 **Connect to Project** 接到這個專案
3. 同一個分頁 → **Create** → 選 **Blob** → 建立後一樣 **Connect to Project**

做完這兩步,`DATABASE_URL` 和 `BLOB_READ_WRITE_TOKEN` 會自動出現在這個 Vercel 專案的環境變數裡,不用自己複製貼上。

### C. 把環境變數拉回本機、建表、灌資料

```bash
npx vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

`db:seed` 會建立 1 個示範使用者和 5 張示範卡片(柯南/寶可夢/遊戲王/航海王/運動卡),讓你部署後馬上有內容可以看,不是空的。

### D. 正式部署

```bash
npx vercel --prod
```

跑完會給你一個 `https://xxx.vercel.app` 的網址,手機瀏覽器直接貼上這個網址就能操作,不需要另外裝 App。

> 之後如果想要每次改完程式碼就自動重新部署,可以在 Vercel 專案設定裡連結 GitHub repo(現在這個資料夾還不是 git repository,要的話跟我說,我可以幫你 `git init` + 建第一個 commit)。

## 分享功能的設計

- 詳情頁的「分享」按鈕會呼叫手機瀏覽器原生的分享選單(`navigator.share`),分享出去的是 `/share/[id]` 這個公開頁面連結,不支援原生分享的瀏覽器則會改成複製連結到剪貼簿。
- `/share/[id]` 只用 `getShareableCard()`(見 `lib/data.ts`)查資料,刻意排除 `privateStory`(只有自己看得到的收藏故事)和 `acquiredPrice`(實際買入價),只帶出 `shareCaption` 和目前市價,對應 schema 註解裡「匯出展覽圖」的原始設計理念。

## 還沒做的事(下一步建議)

1. 照片上傳/分享頁/真實資料庫查詢都已經接上了 ✅
2. 「加入收藏」「標籤選取」「編輯收藏故事」目前是前端 local state,重新整理就會回到資料庫原本的值——要做到真的能存檔,需要再加對應的 API route(PATCH `collection_items`、`item_tags`)
3. 「+ 新增標籤」目前只是靜態按鈕,還沒接建立新標籤的邏輯
4. 接 PriceCharting API,定期寫入 `price_history`,取代種子資料裡手動填的價格
5. 目前整個 App 只有一個寫死的示範使用者、沒有登入機制——如果要多人使用,需要加 Auth(例如 NextAuth / Clerk)並把 `getCollectionSummary()` 等查詢改成依登入者的 `userId` 過濾
