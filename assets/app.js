import { I18N } from "./i18n.js";
import { IDIOMS, TAGS } from "./content.js";

const STORAGE_KEY_LANG = "handan_lang";
const state = { lang: "en" };

function $(sel, root = document) {
  return root.querySelector(sel);
}

function setHeaderElevate() {
  const header = document.querySelector("[data-elevate]");
  if (!header) return;
  const elevated = window.scrollY > 4;
  header.setAttribute("data-elevate", elevated ? "true" : "false");
}

function getInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY_LANG);
  if (stored === "en" || stored === "zh") return stored;
  const navLang = (navigator.language || "en").toLowerCase();
  return navLang.startsWith("zh") ? "zh" : "en";
}

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = dict[key];
    if (typeof value === "string") el.textContent = value;
  });

  const searchInput = $("#searchInput");
  if (searchInput) {
    searchInput.placeholder =
      lang === "zh" ? "搜索（例如：走路 / 和氏璧 / 赵国）…" : "Search (e.g., walk / jade / Zhao)…";
  }

  const toggleLabel = $("#langToggleLabel");
  if (toggleLabel) toggleLabel.textContent = lang === "zh" ? "English" : "中文";
}

function formatTag(lang, key) {
  const found = TAGS.find((t) => t.key === key);
  if (!found) return key;
  return lang === "zh" ? found.zh : found.en;
}

function renderTagOptions(lang) {
  const select = $("#tagSelect");
  if (!select) return;

  const current = select.value || "all";
  const options = [
    { value: "all", label: I18N[lang]["idioms.filterAll"] || "All themes" },
    ...TAGS.map((t) => ({ value: t.key, label: lang === "zh" ? t.zh : t.en })),
  ];

  select.innerHTML = "";
  for (const opt of options) {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = opt.label;
    if (opt.value === current) el.selected = true;
    select.appendChild(el);
  }
}

function normalizeText(s) {
  return (s || "").toLowerCase().trim();
}

function idiomMatches(idiom, query, tag) {
  if (tag && tag !== "all" && !(idiom.tags || []).includes(tag)) return false;
  if (!query) return true;
  const q = normalizeText(query);
  const hay = [
    idiom.hanzi,
    idiom.pinyin,
    idiom.meaningEn,
    idiom.meaningZh,
    idiom.storyEn,
    idiom.storyZh,
    idiom.usageEn,
    idiom.usageZh,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function renderIdiomCards(lang) {
  const grid = $("#idiomGrid");
  if (!grid) return;

  const q = $("#searchInput")?.value || "";
  const tag = $("#tagSelect")?.value || "all";

  const items = IDIOMS.filter((idiom) => idiomMatches(idiom, q, tag));
  grid.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "fineprint";
    empty.textContent = lang === "zh" ? "没有匹配结果。试试更短的关键词。" : "No matches. Try a shorter keyword.";
    grid.appendChild(empty);
    return;
  }

  for (const idiom of items) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("aria-label", `${idiom.hanzi} details`);

    const meaning = lang === "zh" ? idiom.meaningZh : idiom.meaningEn;
    const tagNodes = (idiom.tags || []).slice(0, 3).map((t) => `<span class="tag">${formatTag(lang, t)}</span>`);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-hanzi">${idiom.hanzi}</div>
        <div class="card-pinyin">${idiom.pinyin}</div>
      </div>
      <p class="card-meaning">${escapeHtml(meaning)}</p>
      <div class="tags">${tagNodes.join("")}</div>
    `;

    card.addEventListener("click", () => openIdiomDialog(lang, idiom));
    grid.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openIdiomDialog(lang, idiom) {
  const dialog = $("#idiomDialog");
  const content = $("#dialogContent");
  if (!dialog || !content) return;

  const kv = [
    {
      k: lang === "zh" ? "现代含义" : "Modern meaning",
      v: lang === "zh" ? idiom.meaningZh : idiom.meaningEn,
    },
    {
      k: lang === "zh" ? "典故" : "Story",
      v: lang === "zh" ? idiom.storyZh : idiom.storyEn,
    },
    {
      k: lang === "zh" ? "怎么用" : "How to use it",
      v: lang === "zh" ? idiom.usageZh : idiom.usageEn,
    },
    {
      k: lang === "zh" ? "补充" : "Note",
      v: lang === "zh" ? idiom.noteZh : idiom.noteEn,
    },
  ];

  const tagList = (idiom.tags || []).map((t) => `<span class="tag">${formatTag(lang, t)}</span>`).join("");

  content.innerHTML = `
    <h3>${idiom.hanzi} <span class="card-pinyin">(${idiom.pinyin})</span></h3>
    <div class="tags" style="margin-top:0.65rem">${tagList}</div>
    <div class="kv">
      ${kv
        .map(
          (row) => `
        <div class="kv-row">
          <div class="kv-key">${escapeHtml(row.k)}</div>
          <div class="kv-val">${escapeHtml(row.v)}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  const listenBtn = $("#dialogListenBtn");
  const copyBtn = $("#dialogCopyBtn");
  if (listenBtn) {
    listenBtn.onclick = () => speakChinese(idiom.hanzi);
  }
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const text =
        lang === "zh"
          ? `${idiom.hanzi}（${idiom.pinyin}）\n含义：${idiom.meaningZh}\n典故：${idiom.storyZh}`
          : `${idiom.hanzi} (${idiom.pinyin})\nMeaning: ${idiom.meaningEn}\nStory: ${idiom.storyEn}`;
      await copyToClipboard(text);
      toast(lang === "zh" ? "已复制" : "Copied");
    };
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    window.location.hash = `#${idiom.id}`;
  }
}

function speakChinese(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.9;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {
    // no-op
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

let toastTimer = null;
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "0.75rem 0.95rem";
    el.style.borderRadius = "999px";
    el.style.border = "1px solid var(--border)";
    el.style.background = "var(--bg-elev)";
    el.style.color = "var(--text)";
    el.style.fontWeight = "650";
    el.style.boxShadow = "var(--shadow)";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.display = "none";
  }, 1800);
}

function setupShare(lang) {
  const btn = $("#shareBtn");
  if (!btn) return;
  btn.onclick = async () => {
    const title = "Handan Idioms • 邯郸成语之都";
    const text =
      state.lang === "zh"
        ? "邯郸成语之都：中英文成语故事导览"
        : "Handan idioms: a bilingual story-based guide";
    const url = window.location.href.split("#")[0];

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // fall back to clipboard
      }
    }
    await copyToClipboard(url);
    toast(state.lang === "zh" ? "链接已复制" : "Link copied");
  };
}

function setupMap(lang) {
  const handanQuery = "Handan, Hebei, China";
  const link = $("#mapLink");
  const meta = $("#mapMeta");
  const copyBtn = $("#copyLocationBtn");
  if (!link) return;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(handanQuery)}`;
  link.href = url;
  if (meta) {
    meta.textContent = lang === "zh" ? `地图关键词：${handanQuery}` : `Map query: ${handanQuery}`;
  }
  if (copyBtn) {
    copyBtn.onclick = async () => {
      await copyToClipboard(handanQuery);
      toast(lang === "zh" ? "地点已复制" : "Location copied");
    };
  }
}

function setupBackToTop() {
  const btn = $("#backToTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

const quizState = { current: null, options: [] };

function quizRender() {
  const panel = $("#quizPanel");
  const result = $("#quizResult");
  if (!panel || !result || !quizState.current) return;

  const lang = state.lang;
  const prompt = lang === "zh" ? "这条成语最贴近哪种含义？" : "Which meaning fits best?";
  const title = `${quizState.current.hanzi} (${quizState.current.pinyin})`;

  panel.innerHTML = `
    <div style="display:grid;gap:0.65rem">
      <div style="font-weight:800;font-size:1.15rem">${escapeHtml(title)}</div>
      <div style="color:var(--muted)">${escapeHtml(prompt)}</div>
      <div style="display:grid;gap:0.55rem;margin-top:0.35rem">
        ${quizState.options
          .map(
            (opt, i) => `
            <button class="btn btn-ghost" type="button" data-quiz-option="${i}" style="justify-content:flex-start;border-radius:14px">
              ${escapeHtml(opt)}
            </button>
          `,
          )
          .join("")}
      </div>
    </div>
  `;

  panel.querySelectorAll("[data-quiz-option]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.getAttribute("data-quiz-option"));
      const chosen = quizState.options[idx];
      const correct = state.lang === "zh" ? quizState.current.meaningZh : quizState.current.meaningEn;
      if (chosen === correct) {
        result.textContent = state.lang === "zh" ? "正确！" : "Correct!";
      } else {
        result.textContent = state.lang === "zh" ? "再试一次～" : "Try again.";
      }
    });
  });
}

function quizNewQuestion() {
  const result = $("#quizResult");
  quizState.current = IDIOMS[randomInt(IDIOMS.length)];
  const correct = state.lang === "zh" ? quizState.current.meaningZh : quizState.current.meaningEn;
  const pool = IDIOMS.filter((i) => i.id !== quizState.current.id);
  const wrongs = [];
  while (wrongs.length < 2 && pool.length) {
    const pick = pool.splice(randomInt(pool.length), 1)[0];
    wrongs.push(state.lang === "zh" ? pick.meaningZh : pick.meaningEn);
  }
  quizState.options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  if (result) result.textContent = "";
  quizRender();
}

function quizReveal() {
  const result = $("#quizResult");
  if (!result || !quizState.current) return;
  result.textContent =
    (state.lang === "zh" ? "答案：" : "Answer: ") +
    (state.lang === "zh" ? quizState.current.meaningZh : quizState.current.meaningEn);
}

function setupQuiz() {
  const newBtn = $("#quizNewBtn");
  const revealBtn = $("#quizRevealBtn");
  if (!newBtn || !revealBtn) return;
  newBtn.onclick = quizNewQuestion;
  revealBtn.onclick = quizReveal;
  quizNewQuestion();
}

function init() {
  setHeaderElevate();
  window.addEventListener("scroll", setHeaderElevate, { passive: true });

  state.lang = getInitialLang();
  applyLang(state.lang);
  renderTagOptions(state.lang);
  renderIdiomCards(state.lang);
  setupShare(state.lang);
  setupMap(state.lang);
  setupBackToTop();
  setupQuiz();

  $("#searchInput")?.addEventListener("input", () => renderIdiomCards(state.lang));
  $("#tagSelect")?.addEventListener("change", () => renderIdiomCards(state.lang));

  $("#langToggle")?.addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem(STORAGE_KEY_LANG, state.lang);
    applyLang(state.lang);
    renderTagOptions(state.lang);
    renderIdiomCards(state.lang);
    setupMap(state.lang);
    quizNewQuestion();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const dialog = $("#idiomDialog");
      if (dialog?.open) dialog.close();
    }
  });
}

init();
