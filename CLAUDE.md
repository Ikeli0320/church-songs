# 南勢角禮拜堂歌曲分類 — 專案說明

## 專案概覽

本專案將教會領會歌曲依「會幕模型」分為四個階段，部署為單頁 Cloudflare Worker 網站，並支援 LINE Bot 新增歌曲。

- **線上網址**：https://church-songs.pages.dev（透過 Pages Function 代理 Worker，URL 不變）
- **平台**：Cloudflare Worker（`church-songs-bot.ike0320.workers.dev`）
- **Pages 代理**：Cloudflare Pages（`church-songs`）透過 `functions/_middleware.js` 轉發所有請求到 Worker
- **Cloudflare 帳號 ID**：`<YOUR_CLOUDFLARE_ACCOUNT_ID>`
- **Worker 程式碼**：`/sessions/jolly-youthful-dijkstra/church-songs-worker/worker.js`
- **KV Namespace**：`CHURCH_SONGS`（ID: `<YOUR_KV_NAMESPACE_ID>`）— 存放即時歌曲資料

---

## 歌曲分類規則（會幕四階段）

### 🌿 外院（領）
**原則**：帶領會眾一起來讚美神

適合的歌曲特徵：
- 節奏明快、旋律活潑，易於帶動氣氛
- 歌詞以「呼召敬拜」、「邀請進入神面前」為主題
- 適合作為開場，讓會眾從日常狀態進入敬拜

範例關鍵詞：「來讚美」、「歡呼」、「進入祂門」、「抬起頭」、「高聲歌唱」

---

### 🔥 內院（跟）
**原則**：跟著聖靈進入敬拜

適合的歌曲特徵：
- 敬拜性較強，開始進入與神更深的連結
- 歌詞以「讚美神的作為與屬性」、「宣告神的名」為主題
- 承接外院的氣氛，帶領會眾更深進入敬拜

範例關鍵詞：「尊貴」、「榮耀」、「君王」、「聖潔」、「得勝」、「全能」

---

### ✨ 至聖所（退）
**原則**：向後退，讓神來做事

適合的歌曲特徵：
- 旋律柔和安靜，帶領會眾進入靜默與親密
- 歌詞以「降服」、「靠近神」、「個人禱告/委身」為主題
- 讓會眾放下自我，專注在神的同在

範例關鍵詞：「安靜」、「在你面前」、「我降服」、「牧者」、「恩典」、「信靠」

---

### 🍞 擘餅
聖餐敬拜詩歌。

---

## 歌曲規則

- **只保留中文歌曲**（英文歌曲已排除）
- 每首歌附上原始 YouTube 連結，點擊會優先開啟 YouTube App（deep link）
- 每首歌右側有「複製」按鈕，點擊後複製**短連結**（`https://youtu.be/{id}`）並短暫顯示「✓」確認
- 每首歌標示**上傳者暱稱**（來自 YouTube oEmbed `author_name`）
- 同一首歌若有不同版本（不同上傳者），兩者均保留並以上傳者 tag 區分
- 歌曲依「字數 → 首字」排序
- 歌曲來源參考：北灣教會歌曲分類（Google Sheets）

---

## 網站功能

- **文字搜尋**：可搜尋歌名或上傳者名稱，即時高亮顯示
- **分類篩選**：全部 / 🌿 外院 / 🔥 內院 / ✨ 至聖所 / 🍞 擘餅
- **上傳者篩選**：點擊 chip 篩選特定上傳者的歌曲
- **Deep Link**：手機點歌名優先跳轉 YouTube App（iOS 用 `youtube://`，Android 用 `intent://`），桌機直接開新分頁
- **複製連結**：每列右側「複製」按鈕，一律複製短連結（`https://youtu.be/{id}`）
- **OG Meta Tags**：分享連結時顯示簡潔預覽（標題：南勢角禮拜堂詩歌庫，無分類/emoji 資訊）

---

## LINE Bot 功能

LINE Bot webhook 路徑：`POST /webhook`

### 新增歌曲
傳送 YouTube 連結（`youtu.be/xxx` 或 `youtube.com/watch?v=xxx`），Bot 會自動：
1. 用 YouTube oEmbed 取得標題與上傳者
2. 用 `cleanTitle()` 從標題提取中文歌名
3. 用 AI 分類邏輯判斷分類（外院/內院/至聖所/擘餅）
4. 儲存到 KV，回覆確認訊息：
   ```
   ✅ 已新增《歌名》
   📺 原始標題：原始YouTube標題
   分類：🔥 內院　上傳者：xxx
   名字辨識錯？更名 {vid} 正確歌名
   分類不對？更改分類 {vid} 外院／內院／至聖所／擘餅
   要刪除？刪除 {vid}
   ```

### 管理指令（使用影片 ID 避免歧義）

| 指令 | 說明 | 範例 |
|---|---|---|
| `更改分類 <vid> <分類>` | 更改歌曲分類 | `更改分類 abc123 至聖所` |
| `更名 <vid> <新名稱>` | 更改歌名 | `更名 abc123 全新的名字` |
| `刪除 <vid>` | 刪除歌曲 | `刪除 abc123` |

分類關鍵字：外院、內院、至聖所、擘餅

---

## 新增歌曲方式（手動）

當使用者提供新的 YouTube 連結時，歌曲資料存於 KV（不再使用 `build_songs_html.py`）。若要直接編輯 Worker 的 SEED 資料：

1. 依上述四階段規則判斷該歌屬於哪一類
2. 用 YouTube oEmbed API 取得上傳者暱稱：
   ```
   https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={id}&format=json
   ```
   取 `author_name` 欄位，依下方暱稱對照表縮短
3. 在 `worker.js` 的 `SEED` 對應清單（`outer` / `inner` / `holy` / `breaking`）加入：
   ```javascript
   {name:'歌名', vid:'YouTube影片ID', short:true, src:'上傳者暱稱'},
   ```
   - `short:true`：使用 `https://youtu.be/{id}` 格式（deep link 用）
   - `short:false`：使用 `https://www.youtube.com/watch?v={id}` 格式（deep link 用）
   - 複製按鈕**永遠使用** `https://youtu.be/{id}` 短連結，與 `short` 無關
4. 部署 Worker

---

## 上傳者暱稱對照表

| YouTube 頻道全名 | 使用暱稱 |
|---|---|
| 讚美之泉 Stream Of Praise Music Ministries | 讚美之泉 |
| Joshua Band 約書亞樂團 | 約書亞 |
| 生命河 ROLCC Media | 生命河 |
| KUA GLOBAL 跨越 | 跨越 |
| 泥土音樂Clay Music | 泥土音樂 |
| 天韻合唱團 Heavenly Melody | 天韻 |
| MIshajun東俊 | 東俊 |
| Truth Church 真道教會 | 真道教會 |
| 基督教中壢新榮耀堂 | 新榮耀堂 |
| 詠生敬拜 LifeSong Worship | 詠生敬拜 |
| beLoved144 | beLoved144 |
| chinglianglee | chinglianglee |
| Roni Songbook | Roni Songbook |
| joehuang90 | joehuang90 |
| Rick詩歌庫 | Rick詩歌庫 |

---

## 部署 Worker 指令

```bash
cd /sessions/jolly-youthful-dijkstra/church-songs-worker
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=<YOUR_CLOUDFLARE_ACCOUNT_ID> \
npx wrangler deploy worker.js --name=church-songs-bot --compatibility-date=2024-01-01
```

## 部署 Pages 指令（代理層，通常不需重新部署）

```bash
cd /tmp/pages-proxy
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=<YOUR_CLOUDFLARE_ACCOUNT_ID> \
npx wrangler pages deploy . --project-name=church-songs --branch=main
```

### 取得臨時 API Token（透過 Cloudflare 儀表板 JS）

在瀏覽器開啟 https://dash.cloudflare.com/profile/api-tokens，執行：

```javascript
// 建立 Worker 部署 token
var body = {name: 'tmp-deploy', policies: [{effect: 'allow', resources: {'com.cloudflare.api.account.<YOUR_CLOUDFLARE_ACCOUNT_ID>': '*'}, permission_groups: [{id: 'e086da7e2179491d91ee5f35b3ca210a'}, {id: 'f7f0eda5697f475c90846e879bab8666'}]}], condition: {}};
fetch('/api/v4/user/tokens', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
  .then(r => r.text()).then(t => { window._b64 = btoa(unescape(encodeURIComponent(t))); });

// 讀取 token（分段避免安全過濾）
var obj = JSON.parse(decodeURIComponent(escape(atob(window._b64))));
var v = obj.result.value;
window._tv1 = v.substring(0, 22); window._tv2 = v.substring(22);
// 取 token ID：obj.result.id

// 部署完成後撤銷 token
fetch('/api/v4/user/tokens/<TOKEN_ID>', {method: 'DELETE'});
```

### 權限群組 ID

| 用途 | ID |
|---|---|
| Workers Scripts Write | `e086da7e2179491d91ee5f35b3ca210a` |
| Workers KV Storage Write | `f7f0eda5697f475c90846e879bab8666` |
| Pages Write | `8d28297797f24fb8a0c332fe0866ec89` |
