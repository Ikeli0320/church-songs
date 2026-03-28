// ─────────────────────────────────────────────────────────────
// 南勢角禮拜堂詩歌庫  —  Cloudflare Worker
//   GET  /          → 網站
//   POST /webhook   → LINE Bot webhook
// ─────────────────────────────────────────────────────────────

// ── Author nickname map ────────────────────────────────────
const AUTHOR_MAP = {
  '讚美之泉 Stream Of Praise Music Ministries': '讚美之泉',
  'Joshua Band 約書亞樂團': '約書亞',
  '生命河 ROLCC Media': '生命河',
  'KUA GLOBAL 跨越': '跨越',
  '泥土音樂Clay Music': '泥土音樂',
  '天韻合唱團 Heavenly Melody': '天韻',
  'MIshajun東俊': '東俊',
  'Truth Church 真道教會': '真道教會',
  '基督教中壢新榮耀堂': '新榮耀堂',
  '詠生敬拜 LifeSong Worship': '詠生敬拜',
};

// ── Category metadata ──────────────────────────────────────
const CATS = {
  outer:    { emoji: '🌿', label: '外院',  desc: '領 — 帶領會眾一起來讚美神',   cls: 'outer',    color: '#38a169,#68d391' },
  inner:    { emoji: '🔥', label: '內院',  desc: '跟 — 跟著聖靈進入敬拜',      cls: 'inner',    color: '#3182ce,#63b3ed' },
  holy:     { emoji: '✨', label: '至聖所', desc: '退 — 向後退，讓神來做事',    cls: 'holy',     color: '#805ad5,#b794f4' },
  breaking: { emoji: '🍞', label: '擘餅',  desc: '聖餐敬拜詩歌',              cls: 'breaking', color: '#b7791f,#ed8936' },
};

// ── Seed data (initial songs) ──────────────────────────────
const SEED = {
  outer: [
    {name:'不動搖的信心',    vid:'H9OdfU5I9yQ', short:false, src:'讚美之泉'},
    {name:'神真是我的力量',   vid:'Vg_bojnCnkM', short:false, src:'東俊'},
    {name:'我的救贖者活著＋以利亞的日子', vid:'1AsluAkq6qo', short:false, src:'跨越'},
    {name:'前來敬拜',        vid:'LESo18TfBPQ', short:false, src:'讚美之泉'},
    {name:'新的事將要成就',   vid:'kszbPoctPbo', short:false, src:'讚美之泉'},
    {name:'幸福',            vid:'Q3m-in8i6FU', short:true,  src:'泥土音樂'},
    {name:'將天敞開',        vid:'OVUPLFLdmpE', short:false, src:'讚美之泉'},
    {name:'來向耶和華歌唱',   vid:'TvRHFJ4xEuw', short:false, src:'讚美之泉'},
    {name:'這裡有榮耀',       vid:'V7MIkQD7fvg', short:false, src:'讚美之泉'},
    {name:'永恆唯一的盼望',   vid:'0JjM9JBIjmg', short:false, src:'讚美之泉'},
    {name:'恩典已降臨',       vid:'TBwsaNRtS-Y', short:false, src:'生命河'},
    {name:'來歡呼來讚美',     vid:'F_sbLMN6g2I', short:false, src:'讚美之泉'},
    {name:'眾城門抬起頭',     vid:'37HEh6sSiWU', short:true,  src:'生命河'},
    {name:'祂又真又活',       vid:'-rGBNmvteHI', short:false, src:'泥土音樂'},
    {name:'尊貴全能神',       vid:'qHiQf_D-OMc', short:false, src:'讚美之泉'},
    {name:'歡然獻祭',         vid:'MfcsP54EcXM', short:false, src:'天韻'},
    {name:'在這裡',           vid:'nJBLeMrhu9w', short:false, src:'讚美之泉'},
    {name:'叫我抬起頭的神',   vid:'ouG12IsjTNU', short:false, src:'讚美之泉'},
    {name:'主我跟你走',       vid:'u9o2q1NfE6c', short:false, src:'讚美之泉'},
    {name:'耶和華是我牧者',   vid:'Pvt6OLIaM30', short:true,  src:'讚美之泉'},
  ],
  inner: [
    {name:'敬拜耶穌',        vid:'fchrOQRH0UY', short:false, src:'讚美之泉'},
    {name:'世界之光',         vid:'OI93he8cv4U', short:false, src:'讚美之泉'},
    {name:'主我神',           vid:'X_YNVJqV_s8', short:false, src:'約書亞'},
    {name:'單單只為你',       vid:'OrqtK5h9VEw', short:false, src:'讚美之泉'},
    {name:'榮耀至高神',       vid:'R5Lt-cVIG_c', short:false, src:'讚美之泉'},
    {name:'耶和華作王',       vid:'YrcWk_8LXlg', short:false, src:'讚美之泉'},
    {name:'榮美的救主',       vid:'ZPVChPb5J7Q', short:false, src:'約書亞'},
    {name:'我們歡迎君王降臨', vid:'kp0nbIAnhn0', short:false, src:'讚美之泉'},
    {name:'我們愛戴的王',     vid:'t9AVyCkcD3A', short:false, src:'讚美之泉'},
    {name:'新的異象，新的方向',vid:'mHSSuQA3LQo', short:false, src:'讚美之泉'},
    {name:'從這代到那代',     vid:'kNnZXzsNYPo', short:false, src:'讚美之泉'},
    {name:'和散那',           vid:'hyjcNF1dxzM', short:false, src:'讚美之泉'},
    {name:'我們的神',         vid:'kvrRtRe9AoU', short:false, src:'讚美之泉'},
    {name:'從早晨到夜晚',     vid:'QvfB1-FpfWk', short:false, src:'讚美之泉'},
    {name:'唯有耶穌',         vid:'4j8abyGAmj0', short:false, src:'讚美之泉'},
    {name:'在至高之處',       vid:'azxcXb-7TfA', short:false, src:'讚美之泉'},
    {name:'我們獻上',         vid:'ET6roW3Ad8U', short:false, src:'約書亞'},
    {name:'日日夜夜',         vid:'TaHTuEZmQ60', short:false, src:'讚美之泉'},
    {name:'耶穌你已得勝',     vid:'cwURDf2TJj4', short:false, src:'天韻'},
    {name:'我神我王',         vid:'x4FdBKcqEBY', short:false, src:'跨越'},
    {name:'以馬內利',         vid:'hWSaYRD6118', short:false, src:'讚美之泉'},
    {name:'榮耀的呼召',       vid:'v5wnpajW6jo', short:false, src:'讚美之泉'},
    {name:'有一位神',         vid:'b3oivk4W7EY', short:false, src:'讚美之泉'},
    {name:'坐在寶座上聖潔羔羊',vid:'A3DwAka37uw', short:false, src:'chinglianglee'},
    {name:'只為祢國祢名',     vid:'HDnHB-aY1ZA', short:false, src:'真道教會'},
  ],
  holy: [
    {name:'安靜',             vid:'jIg4jptBArY', short:true,  src:'讚美之泉'},
    {name:'我要看見',         vid:'kYHmfN8tXPM', short:false, src:'讚美之泉'},
    {name:'在呼招我之處',     vid:'uVwc1UeIpfo', short:false, src:'beLoved144'},
    {name:'在耶穌的腳前',     vid:'shCA1uIfKPY', short:false, src:'讚美之泉'},
    {name:'神羔羊',           vid:'byWidixIwBE', short:false, src:'讚美之泉'},
    {name:'十字架',           vid:'CNL-CyDEpPo', short:false, src:'讚美之泉'},
    {name:'耶穌裡面',         vid:'c2eQQ6jO2Uk', short:true,  src:'詠生敬拜'},
    {name:'何等恩典',         vid:'u2M-zzt1Whc', short:false, src:'讚美之泉'},
    {name:'愛的彰顯',         vid:'xVd5gf-gJOw', short:false, src:'讚美之泉'},
    {name:'十架的愛',         vid:'dfVQ2nbrPnM', short:false, src:'讚美之泉'},
    {name:'十架的愛',         vid:'dACk-PK8Jqk', short:false, src:'新榮耀堂'},
    {name:'數不盡',           vid:'_svIQ4gpPeY', short:false, src:'讚美之泉'},
    {name:'神羔羊配得',       vid:'eVGtl90Siy8', short:false, src:'約書亞'},
    {name:'每一天我需要你',   vid:'IBeDhW5uET0', short:false, src:'讚美之泉'},
    {name:'我安然居住',       vid:'kNOuWvdPgiA', short:false, src:'約書亞'},
    {name:'如鷹展翅上騰',     vid:'qF3RADPSlDs', short:false, src:'生命河'},
    {name:'寶貴十架',         vid:'0YJZUyVOQVY', short:false, src:'讚美之泉'},
    {name:'我心堅定於你',     vid:'MAorTjzpVw0', short:false, src:'讚美之泉'},
    {name:'你的恩典夠我用',   vid:'v76-wz1mv8w', short:false, src:'讚美之泉'},
    {name:'注目看耶穌',       vid:'Wmb_HtayZV4', short:false, src:'讚美之泉'},
    {name:'愛中相遇',         vid:'Muq6RNaLjgU', short:false, src:'讚美之泉'},
    {name:'主我獻上生命給你', vid:'F21ahAdONW0', short:false, src:'約書亞'},
    {name:'你真偉大',         vid:'GfuxNBXREck', short:false, src:'chinglianglee'},
    {name:'祢真偉大',         vid:'FJFfJ5Zztpc', short:false, src:'Roni Songbook'},
    {name:'我的幫助從何而來', vid:'RBEDtcoyp04', short:false, src:'joehuang90'},
  ],
  breaking: [
    {name:'耶穌在我裡面',       vid:'Gycdf4-z2nI', short:false, src:'joehuang90'},
    {name:'十架的愛',            vid:'dfVQ2nbrPnM', short:false, src:'讚美之泉'},
    {name:'無價至寶',            vid:'foIAGgs8wOU', short:false, src:'約書亞'},
    {name:'我是被主重價買回的人', vid:'AiGFDnmibUY', short:false, src:'讚美之泉'},
    {name:'我的生命獻給祢',      vid:'l8QtshEeAmk', short:false, src:'讚美之泉'},
    {name:'十字架',              vid:'CNL-CyDEpPo', short:false, src:'讚美之泉'},
    {name:'十架為我榮耀',        vid:'-8JkUNPbAyM', short:false, src:'Rick詩歌庫'},
    {name:'深觸我心',            vid:'ZE4jUfVSQgQ', short:false, src:'讚美之泉'},
    {name:'祢永遠如此深愛著我',  vid:'yqIvw4KH0yY', short:false, src:'讚美之泉'},
    {name:'你所愛的',            vid:'ECuGVcj_BjM', short:false, src:'約書亞'},
  ],
};

// ── Classification keywords ────────────────────────────────
const CAT_KEYWORDS = {
  breaking: ['十架', '十字架', '寶血', '救贖', '釘', '聖餐', '受難', '羔羊配', '無價至寶', '架'],
  outer:    ['讚美', '歡呼', '歡慶', '前來', '高聲', '歡然', '抬起頭', '抬起', '進入', '頌揚', '呼召'],
  inner:    ['尊貴', '榮耀', '君王', '聖潔', '得勝', '全能', '寶座', '萬王', '萬主', '宣告', '作王'],
  holy:     ['安靜', '降服', '信靠', '恩典', '牧者', '面前', '委身', '禱告', '親近', '倚靠', '同在'],
};

// ─────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleLineWebhook(request, env);
    }

    // Serve the site
    const songs = await getSongs(env);
    const html = generateHTML(songs);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8',
                 'Cache-Control': 'no-cache' }
    });
  }
};

// ─────────────────────────────────────────────────────────────
// KV helpers
// ─────────────────────────────────────────────────────────────
async function getSongs(env) {
  try {
    const data = await env.SONGS_KV.get('songs');
    return data ? JSON.parse(data) : SEED;
  } catch { return SEED; }
}

async function saveSongs(songs, env) {
  await env.SONGS_KV.put('songs', JSON.stringify(songs));
}

// ─────────────────────────────────────────────────────────────
// LINE Webhook handler
// ─────────────────────────────────────────────────────────────
async function handleLineWebhook(request, env) {
  const body = await request.text();

  // Verify signature
  const sig = request.headers.get('X-Line-Signature') || '';
  const valid = await verifyLineSignature(body, sig, env.LINE_CHANNEL_SECRET);
  if (!valid) return new Response('Unauthorized', { status: 401 });

  let data;
  try { data = JSON.parse(body); } catch { return new Response('Bad JSON', { status: 400 }); }

  // Process each event (don't await — LINE needs fast 200 OK)
  const tasks = (data.events || []).map(event => processEvent(event, env));
  await Promise.all(tasks);

  return new Response('OK');
}

async function processEvent(event, env) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const text = event.message.text.trim();
  const replyToken = event.replyToken;

  // ── Command: 更改分類 <vid> <category> ──────────────────
  const changeCatMatch = text.match(/^更改分類\s+(\S+)\s+(.+)$/);
  if (changeCatMatch) {
    await handleChangeCategory(changeCatMatch[1], changeCatMatch[2].trim(), replyToken, env);
    return;
  }

  // ── Command: 更名 <vid> <new_name> ──────────────────────
  const renameMatch = text.match(/^更名\s+(\S+)\s+(.+)$/);
  if (renameMatch) {
    await handleRename(renameMatch[1], renameMatch[2].trim(), replyToken, env);
    return;
  }

  // ── Command: 刪除 <vid> ──────────────────────────────────
  const deleteMatch = text.match(/^刪除\s+(\S+)$/);
  if (deleteMatch) {
    await handleDelete(deleteMatch[1], replyToken, env);
    return;
  }

  // ── YouTube link → add song ──────────────────────────────
  const vid = extractYouTubeId(text);
  if (!vid) return; // Not a YouTube link or command → ignore

  try {
    const oembedResp = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`
    );
    if (!oembedResp.ok) {
      await replyLine(replyToken, '❌ 找不到這部影片，請確認連結是否正確', env);
      return;
    }
    const oembed = await oembedResp.json();

    const rawTitle = oembed.title || '';
    const rawAuthor = oembed.author_name || '';
    const songName = cleanTitle(rawTitle);
    const source = normalizeAuthor(rawAuthor);

    let category = extractCategoryFromText(text);
    if (!category) category = await classifySong(songName, env);

    const songs = await getSongs(env);
    if (!songs[category]) songs[category] = [];

    const isDup = songs[category].some(s => s.vid === vid);
    if (isDup) {
      const c = CATS[category];
      await replyLine(replyToken,
        `⚠️ 《${songName}》已在 ${c.emoji} ${c.label} 了，沒有重複新增`, env);
      return;
    }

    songs[category].push({ name: songName, vid, short: false, src: source });
    await saveSongs(songs, env);

    const c = CATS[category];
    const catNames = '外院／內院／至聖所／擘餅';
    await replyLine(replyToken,
      `✅ 已新增《${songName}》\n` +
      `📺 原始標題：${rawTitle}\n` +
      `分類：${c.emoji} ${c.label}　上傳者：${source}\n` +
      `\n名字辨識錯？\n更名 ${vid} 正確歌名\n` +
      `分類不對？\n更改分類 ${vid} ${catNames}\n` +
      `要刪除？\n刪除 ${vid}`, env);

  } catch (err) {
    await replyLine(replyToken, `❌ 處理時發生錯誤：${err.message}`, env);
  }
}

// ── Change category by video ID ───────────────────────────
async function handleChangeCategory(vidOrName, catText, replyToken, env) {
  const catMap = { '外院': 'outer', '內院': 'inner', '至聖所': 'holy', '擘餅': 'breaking', '聖餐': 'breaking' };
  const newCat = catMap[catText];
  if (!newCat) {
    await replyLine(replyToken, `❌ 分類名稱不對，請用：外院／內院／至聖所／擘餅`, env);
    return;
  }
  const songs = await getSongs(env);
  let found = null, oldCat = null;
  for (const [cat, list] of Object.entries(songs)) {
    const idx = list.findIndex(s => s.vid === vidOrName || s.name === vidOrName);
    if (idx !== -1) { found = list.splice(idx, 1)[0]; oldCat = cat; break; }
  }
  if (!found) {
    await replyLine(replyToken, `❌ 找不到這首歌，請確認影片 ID 或歌名`, env);
    return;
  }
  if (!songs[newCat]) songs[newCat] = [];
  songs[newCat].push(found);
  await saveSongs(songs, env);
  const c = CATS[newCat];
  await replyLine(replyToken, `✅ 《${found.name}》已移至 ${c.emoji} ${c.label}`, env);
}

// ── Rename song by video ID ───────────────────────────────
async function handleRename(vid, newName, replyToken, env) {
  const songs = await getSongs(env);
  let found = false;
  for (const list of Object.values(songs)) {
    const s = list.find(s => s.vid === vid);
    if (s) { s.name = newName; found = true; break; }
  }
  if (!found) {
    await replyLine(replyToken, `❌ 找不到影片 ID「${vid}」，請確認`, env);
    return;
  }
  await saveSongs(songs, env);
  await replyLine(replyToken, `✅ 已更名為《${newName}》`, env);
}

// ── Delete song by video ID ───────────────────────────────
async function handleDelete(vid, replyToken, env) {
  const songs = await getSongs(env);
  let deleted = null;
  for (const [cat, list] of Object.entries(songs)) {
    const idx = list.findIndex(s => s.vid === vid);
    if (idx !== -1) {
      deleted = { name: list[idx].name, cat };
      list.splice(idx, 1);
      break;
    }
  }
  if (!deleted) {
    await replyLine(replyToken, `❌ 找不到影片 ID「${vid}」，請確認`, env);
    return;
  }
  await saveSongs(songs, env);
  const c = CATS[deleted.cat];
  await replyLine(replyToken, `🗑️ 已刪除《${deleted.name}》（${c.emoji} ${c.label}）`, env);
}

// ── Extract YouTube ID from text ───────────────────────────
function extractYouTubeId(text) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Extract explicit category prefix ─────────────────────
function extractCategoryFromText(text) {
  if (/^(外院|領)/.test(text)) return 'outer';
  if (/^(內院|跟)/.test(text)) return 'inner';
  if (/^(至聖所|退)/.test(text)) return 'holy';
  if (/^(擘餅|聖餐)/.test(text)) return 'breaking';
  return null;
}

// ── Clean YouTube title → song name ──────────────────────
function cleanTitle(title) {
  // Step 0: strip parenthetical suffixes like （動態PPT）（伴奏）（Live）
  title = title.replace(/[（(][^）)]{0,20}[）)]/g, '').trim();

  // Priority 1: After full-width colon "：" e.g. "主日詩歌庫：坐在寶座上聖潔羔羊"
  let colonIdx = title.indexOf('：');
  if (colonIdx > 0) {
    let after = title.substring(colonIdx + 1).trim();
    let mAfter = after.match(/^([\u4e00-\u9fff\u3000-\u303f＋，。？！「」『』…—－+\s]+)/);
    if (mAfter && mAfter[1].trim().length >= 2) return mAfter[1].trim();
  }

  // Priority 2: Chinese text BEFORE 【】 bracket (e.g. 祢是榮耀的君王【字幕版】)
  let m = title.match(/^([\u4e00-\u9fff\u3000-\u303f＋，。？！「」『』…—－·\s]+)(?=【)/);
  if (m && m[1].trim()) return m[1].trim();
  // Priority 3: Extract CHINESE content from 【】 brackets (e.g. 【十架的愛 Great Is Your Love】)
  m = title.match(/【([^】]+)】/);
  if (m && /[\u4e00-\u9fff]/.test(m[1])) return m[1].replace(/[【】]/g, '').trim();
  // Priority 4: Extract Chinese-only before English or dashes
  m = title.match(/^([\u4e00-\u9fff\u3000-\u303f＋，。？！「」『』…—－\s]+)/);
  if (m) return m[1].replace(/[-—－＋\s]+$/, '').trim();
  // Fallback: first 15 chars
  return title.substring(0, 15).trim();
}

// ── Normalize author name ────────────────────────────────
function normalizeAuthor(raw) {
  for (const [full, nick] of Object.entries(AUTHOR_MAP)) {
    if (raw.includes(full) || full.includes(raw)) return nick;
  }
  // Trim common suffixes
  return raw
    .replace(/\s*(Official|official|Channel|channel|Music|music)\s*/g, '')
    .trim() || raw;
}

// ── Classify by keyword matching ─────────────────────────
async function classifySong(songName, env) {
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    if (keywords.some(k => songName.includes(k))) return cat;
  }

  // Fallback: try Workers AI
  try {
    const prompt =
      `你是教會詩歌分類助理。請根據歌名判斷這首詩歌屬於哪個敬拜階段：\n` +
      `outer（外院）：開場帶動，節奏活潑，呼召讚美\n` +
      `inner（內院）：深入敬拜，宣告神的屬性、君王、榮耀\n` +
      `holy（至聖所）：安靜降服，個人委身、恩典、信靠\n` +
      `breaking（擘餅）：聖餐主題，十字架、救贖、寶血\n\n` +
      `歌名：《${songName}》\n` +
      `請只回答：outer、inner、holy 或 breaking，不要解釋。`;

    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt, max_tokens: 10
    });
    const ans = (result.response || '').trim().toLowerCase();
    if (['outer', 'inner', 'holy', 'breaking'].includes(ans)) return ans;
  } catch {}

  return 'holy'; // default
}

// ── LINE reply ────────────────────────────────────────────
async function replyLine(replyToken, text, env) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  });
}

// ── LINE signature verification ───────────────────────────
async function verifyLineSignature(body, signature, secret) {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return expected === signature;
  } catch { return false; }
}

// ─────────────────────────────────────────────────────────────
// HTML Generation
// ─────────────────────────────────────────────────────────────
function makeUrl(vid, isShort) {
  return isShort ? `https://youtu.be/${vid}` : `https://www.youtube.com/watch?v=${vid}`;
}

function isChinese(str) {
  return /[\u4e00-\u9fff]/.test(str);
}

function sortSongs(list) {
  return [...list].filter(s => isChinese(s.name)).sort((a, b) => {
    if (a.name.length !== b.name.length) return a.name.length - b.name.length;
    return a.name[0].localeCompare(b.name[0], 'zh-TW');
  });
}

function songLi(s) {
  const url = makeUrl(s.vid, s.short);
  const shortUrl = `https://youtu.be/${s.vid}`;
  const srcTag = s.src ? `<span class="source">${s.src}</span>` : '';
  return `      <li>` +
    `<label class="check-wrap" onclick="toggleSel(event,this)"><input type="checkbox" class="sel-chk" data-url="${shortUrl}" data-name="${s.name}"></label>` +
    `<a href="${url}" target="_blank" class="song-link" data-name="${s.name}" data-source="${s.src||''}" data-vid="${s.vid}" onclick="openYT(event,this)">${s.name}${srcTag}</a>` +
    `<button class="copy-btn" data-url="${shortUrl}" onclick="copyLink(event,this)" title="複製連結">複製</button>` +
    `</li>`;
}

function generateHTML(songs) {
  const cats = {};
  for (const key of Object.keys(CATS)) {
    cats[key] = sortSongs(songs[key] || []);
  }

  const colHtml = Object.entries(CATS).map(([key, meta]) => {
    const list = cats[key];
    const rows = list.map(s => songLi(s)).join('\n');
    return `
    <div class="col col-${meta.cls}" data-cat="${key}">
      <div class="col-header">
        <div class="stage">${meta.emoji} ${meta.label}</div>
        <div class="desc">${meta.desc}</div>
      </div>
      <ul id="list-${key}">
${rows}
      </ul>
      <div class="no-results" id="no-${key}">找不到符合的詩歌</div>
      <div class="count" id="count-${key}">${list.length} 首</div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>南勢角禮拜堂詩歌庫</title>
  <meta property="og:title" content="南勢角禮拜堂詩歌庫">
  <meta property="og:description" content="教會領會詩歌分類列表，僅供內部敬拜使用">
  <meta property="og:url" content="https://church-songs.pages.dev">
  <meta property="og:type" content="website">
  <meta name="description" content="教會領會詩歌分類列表，僅供內部敬拜使用">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif;
      background: #f0f4f8; color: #1a202c; min-height: 100vh; font-size: 18px;
    }
    header {
      background: linear-gradient(135deg, #2c5282, #4299e1);
      color: white; text-align: center; padding: 1.8rem 1rem 1.4rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    header h1 { font-size: clamp(1.1rem, 6vw, 2rem); font-weight: 700; letter-spacing: 0.05em; white-space: nowrap; }
    header p { margin-top: 0.4rem; opacity: 0.85; font-size: 1rem; }
    .filter-bar {
      max-width: 1300px; margin: 1.25rem auto 0; padding: 0 1rem;
      display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
    }
    .search-wrap { position: relative; flex: 1; min-width: 180px; }
    .search-wrap input {
      width: 100%; padding: 0.65rem 2.4rem 0.65rem 1rem; font-size: 1rem;
      border: 1.5px solid #cbd5e0; border-radius: 8px; background: white;
      outline: none; transition: border-color 0.15s;
    }
    .search-wrap input:focus { border-color: #4299e1; }
    .clear-btn {
      position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #a0aec0;
      font-size: 1.1rem; padding: 0.2rem; display: none;
    }
    .search-wrap input:not(:placeholder-shown) ~ .clear-btn { display: block; }
    .cat-btns { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .cat-btn {
      padding: 0.55rem 1rem; font-size: 0.95rem; border: 1.5px solid #cbd5e0;
      border-radius: 8px; background: white; cursor: pointer; color: #4a5568;
      transition: all 0.15s; white-space: nowrap;
    }
    .cat-btn:hover { border-color: #4299e1; color: #2b6cb0; }
    .cat-btn.active      { background: #2b6cb0; border-color: #2b6cb0; color: white; }
    .cat-btn.act-outer   { background: #38a169; border-color: #38a169; color: white; }
    .cat-btn.act-inner   { background: #3182ce; border-color: #3182ce; color: white; }
    .cat-btn.act-holy    { background: #805ad5; border-color: #805ad5; color: white; }
    .cat-btn.act-breaking{ background: #b7791f; border-color: #b7791f; color: white; }
    .grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem; max-width: 1600px; margin: 1.25rem auto 5rem; padding: 0 1rem;
    }
    .grid.single { grid-template-columns: 1fr; max-width: 600px; }
    @media (max-width: 1200px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 700px)  { .grid { grid-template-columns: 1fr; } body { font-size: 17px; } }
    .col { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
    .col.hidden { display: none; }
    .col-header { padding: 1rem 1.2rem 0.75rem; color: white; font-weight: 700; }
    .col-header .stage { font-size: 1.25rem; }
    .col-header .desc { font-size: 0.9rem; opacity: 0.9; margin-top: 0.2rem; }
    .col-outer    .col-header { background: linear-gradient(135deg, #38a169, #68d391); }
    .col-inner    .col-header { background: linear-gradient(135deg, #3182ce, #63b3ed); }
    .col-holy     .col-header { background: linear-gradient(135deg, #805ad5, #b794f4); }
    .col-breaking .col-header { background: linear-gradient(135deg, #b7791f, #ed8936); }
    .col ul { list-style: none; padding: 0.5rem 0; }
    .col li { border-bottom: 1px solid #f7fafc; transition: background 0.15s; display: flex; align-items: stretch; }
    .col li:last-child { border-bottom: none; }
    .col li.hidden { display: none; }
    .col li:hover { background: #f0f4f8; }
    .col li a.song-link {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.2rem; text-decoration: none; color: #2d3748;
      font-size: 1.05rem; line-height: 1.5; flex: 1; min-width: 0;
    }
    .col li a.song-link:hover { color: #3182ce; }
    .source {
      font-size: 0.72rem; color: #a0aec0; background: #f7fafc;
      border: 1px solid #e2e8f0; border-radius: 4px; padding: 0.1em 0.45em;
      white-space: nowrap; flex-shrink: 0; margin-left: auto;
    }
    .col li a:hover .source { color: #90cdf4; border-color: #bee3f8; background: #ebf8ff; }
    .copy-btn {
      flex-shrink: 0; background: none; border: none;
      border-left: 1px solid #edf2f7; color: #a0aec0; font-size: 0.78rem;
      padding: 0 0.75rem; cursor: pointer; white-space: nowrap;
      transition: all 0.15s; min-width: 48px;
    }
    .copy-btn:hover { color: #3182ce; background: #ebf8ff; }
    .copy-btn.copied { color: #38a169; }
    .check-wrap {
      display: flex; align-items: center; justify-content: center;
      padding: 0 0.55rem; cursor: pointer; flex-shrink: 0;
    }
    .check-wrap input[type=checkbox] { width: 16px; height: 16px; accent-color: #3182ce; cursor: pointer; }
    .col li.selected { background: #ebf8ff; }
    .col li.selected a.song-link { color: #2b6cb0; }
    .sel-bar {
      display: none; position: fixed; bottom: 1.2rem; left: 50%;
      transform: translateX(-50%); background: #2d3748; color: white;
      padding: 0.7rem 1.2rem; border-radius: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35); gap: 0.75rem;
      align-items: center; z-index: 100; white-space: nowrap; font-size: 0.95rem;
    }
    .sel-bar.visible { display: flex; }
    .sel-bar-count { opacity: 0.8; }
    .sel-bar-copy {
      background: #3182ce; border: none; color: white; padding: 0.4rem 1rem;
      border-radius: 20px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    }
    .sel-bar-copy:hover { background: #2b6cb0; }
    .sel-bar-copy.copied { background: #38a169; }
    .sel-bar-clear {
      background: none; border: 1px solid rgba(255,255,255,0.3); color: white;
      padding: 0.4rem 0.8rem; border-radius: 20px; cursor: pointer; font-size: 0.85rem;
    }
    .sel-bar-clear:hover { background: rgba(255,255,255,0.1); }
    .count { text-align: center; font-size: 0.9rem; color: #a0aec0; padding: 0.7rem; border-top: 1px solid #f0f4f8; }
    .no-results { text-align: center; color: #a0aec0; font-size: 0.95rem; padding: 1.5rem; display: none; }
    footer { text-align: center; padding: 2rem 1rem; color: #a0aec0; font-size: 0.9rem; }
    mark { background: #fef08a; border-radius: 2px; padding: 0 1px; }
  </style>
</head>
<body>
  <header>
    <h1>南勢角禮拜堂詩歌庫</h1>
    <p>點擊歌名即可開啟 YouTube 連結</p>
  </header>

  <div class="filter-bar">
    <div class="search-wrap">
      <input type="text" id="search" placeholder="搜尋詩歌名稱或上傳者…" autocomplete="off">
      <button class="clear-btn" id="clearBtn" title="清除">✕</button>
    </div>
    <div class="cat-btns">
      <button class="cat-btn active" data-cat="all">全部</button>
      <button class="cat-btn" data-cat="outer">🌿 外院</button>
      <button class="cat-btn" data-cat="inner">🔥 內院</button>
      <button class="cat-btn" data-cat="holy">✨ 至聖所</button>
      <button class="cat-btn" data-cat="breaking">🍞 擘餅</button>
    </div>
  </div>

  <div class="grid" id="grid">
${colHtml}
  </div>

  <div class="sel-bar" id="selBar">
    <span class="sel-bar-count" id="selCount">已選 0 首</span>
    <button class="sel-bar-copy" id="selCopyBtn" onclick="copySelected()">複製全部連結</button>
    <button class="sel-bar-clear" onclick="clearSelection()">取消</button>
  </div>

  <footer>參考北灣教會歌曲分類 · 僅供內部敬拜使用</footer>

  <script>
    const searchEl   = document.getElementById('search');
    const clearBtn   = document.getElementById('clearBtn');
    const grid       = document.getElementById('grid');
    const catBtns    = document.querySelectorAll('.cat-btn');
    const cols       = document.querySelectorAll('.col[data-cat]');
    const selBar     = document.getElementById('selBar');
    const selCount   = document.getElementById('selCount');
    const selCopyBtn = document.getElementById('selCopyBtn');
    const catCls     = {outer:'act-outer', inner:'act-inner', holy:'act-holy', breaking:'act-breaking'};
    let activeCat = 'all';

    function escRe(s) { return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'); }

    function applyFilters() {
      const q  = searchEl.value.trim();
      const re = q ? new RegExp(escRe(q), 'i') : null;
      clearBtn.style.display = q ? 'block' : 'none';
      cols.forEach(col => {
        const colVisible = activeCat === 'all' || activeCat === col.dataset.cat;
        col.classList.toggle('hidden', !colVisible);
        if (!colVisible) return;
        let visible = 0;
        col.querySelectorAll('li').forEach(li => {
          const a = li.querySelector('a');
          const show = !re || re.test(a.dataset.name) || re.test(a.dataset.source);
          li.classList.toggle('hidden', !show);
          if (show) {
            visible++;
            const fn = a.childNodes[0];
            if (re && fn) {
              const tag = fn.nodeName === '#text' ? fn : fn.firstChild;
              if (tag && tag.nodeType === 3) {
                const span = document.createElement('span');
                span.innerHTML = a.dataset.name.replace(re, m => '<mark>' + m + '</mark>');
                tag.replaceWith(span);
              }
            } else if (!re) {
              const span = a.querySelector('span:not(.source)');
              if (span) span.replaceWith(document.createTextNode(a.dataset.name));
            }
          }
        });
        col.querySelector('.count').textContent = visible + ' 首';
        col.querySelector('.no-results').style.display = visible ? 'none' : 'block';
        col.querySelector('ul').style.display = visible ? '' : 'none';
      });
      grid.classList.toggle('single', activeCat !== 'all');
    }

    searchEl.addEventListener('input', applyFilters);
    clearBtn.addEventListener('click', () => { searchEl.value = ''; applyFilters(); searchEl.focus(); });
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        catBtns.forEach(b => { b.className = 'cat-btn'; });
        btn.classList.add(activeCat === 'all' ? 'active' : catCls[activeCat]);
        applyFilters();
      });
    });

    function updateSelBar() {
      const n = document.querySelectorAll('.sel-chk:checked').length;
      if (n > 0) { selCount.textContent = '已選 ' + n + ' 首'; selBar.classList.add('visible'); }
      else selBar.classList.remove('visible');
    }
    function toggleSel(e, label) {
      e.stopPropagation();
      label.closest('li').classList.toggle('selected', label.querySelector('.sel-chk').checked);
      updateSelBar();
    }
    document.querySelectorAll('.col li').forEach(li => {
      li.addEventListener('click', e => {
        if (e.target.closest('a') || e.target.closest('.copy-btn') || e.target.closest('.check-wrap')) return;
        const chk = li.querySelector('.sel-chk');
        chk.checked = !chk.checked;
        li.classList.toggle('selected', chk.checked);
        updateSelBar();
      });
    });
    function copySelected() {
      const lines = [...document.querySelectorAll('.sel-chk:checked')].map(c => c.dataset.name + '  ' + c.dataset.url);
      navigator.clipboard.writeText(lines.join('\\n')).then(() => {
        selCopyBtn.textContent = '✓ 已複製'; selCopyBtn.classList.add('copied');
        setTimeout(() => { selCopyBtn.textContent = '複製全部連結'; selCopyBtn.classList.remove('copied'); }, 2000);
      });
    }
    function clearSelection() {
      document.querySelectorAll('.sel-chk:checked').forEach(c => { c.checked = false; c.closest('li').classList.remove('selected'); });
      selBar.classList.remove('visible');
    }
    function openYT(e, el) {
      const vid = el.dataset.vid, url = el.href, ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        e.preventDefault(); window.location = 'youtube://watch?v=' + vid;
        setTimeout(() => window.open(url, '_blank'), 500);
      } else if (/Android/i.test(ua)) {
        e.preventDefault();
        window.location = 'intent://www.youtube.com/watch?v=' + vid +
          '#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
      }
    }
    function copyLink(e, btn) {
      e.preventDefault(); e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.url).then(() => {
        btn.textContent = '✓'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '複製'; btn.classList.remove('copied'); }, 1800);
      });
    }
  </script>
</body>
</html>`;
}
