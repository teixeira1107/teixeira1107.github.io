const STORAGE = {
  date: "cargo-ledger-date",
  view: "cargo-ledger-view",
  raw: "cargo-ledger-raw",
  ocrProvider: "cargo-ledger-ocr-provider",
  ocrApiKey: "cargo-ledger-ocr-apikey",
  ocrStrictMode: "cargo-ledger-ocr-strict",
  ocrDoubleCheck: "cargo-ledger-ocr-double-check",
  specs: "cargo-ledger-specs",
  templateVersion: "cargo-ledger-template-version",
  templateCsv: "cargo-ledger-template-csv",
  otherText: "cargo-ledger-other-text",
  otherEntries: "cargo-ledger-other-entries",
  entries: "cargo-ledger-entries",
  rules: "cargo-ledger-rules",
};

const DEFAULT_RULES = [
  { standard: "矿泉水", aliases: ["水", "饮用水", "农夫山泉", "怡宝"] },
  { standard: "鸡蛋", aliases: ["蛋", "土鸡蛋", "鸡蛋板"] },
  { standard: "土豆", aliases: ["马铃薯", "洋芋"] },
  { standard: "番茄", aliases: ["西红柿", "西红柿子"] },
  { standard: "白菜", aliases: ["大白菜", "包菜"] },
  { standard: "苹果", aliases: ["红富士", "富士苹果"] },
  { standard: "【剁块】通排【去尾骨】（热鲜）", aliases: ["剁块通排去尾骨", "通排去尾骨", "剁块 通排 去尾骨"] },
  { standard: "带皮五花肉（热鲜）", aliases: ["带皮五花肉"] },
  { standard: "掉渣饼馅料", aliases: ["掉渣饼馅料"] },
  { standard: "精肉（热鲜）", aliases: ["精肉"] },
  { standard: "去皮后腿混合肉（热鲜）", aliases: ["去皮后腿混合肉", "后腿混合肉"] },
  { standard: "去皮前腿混合肉（热鲜）", aliases: ["去皮前腿混合肉", "前腿混合肉"] },
  { standard: "去皮五花肉（热鲜）", aliases: ["去皮五花肉"] },
  { standard: "去皮腿混合肉（热鲜）", aliases: ["去皮腿混合肉"] },
];

const SAMPLE_TEXT = `张三：苹果20箱，农夫山泉15件
李四 09:30 王老板要鸡蛋30板
赵五：洋芋 50斤
小陈：马铃薯25斤，西红柿10箱
老刘：怡宝 8 件
王姐：土鸡蛋 12板`;

const UNITS = [
  "公斤",
  "千克",
  "kg",
  "KG",
  "箱",
  "件",
  "包",
  "袋",
  "斤",
  "吨",
  "瓶",
  "桶",
  "盒",
  "板",
  "个",
  "只",
  "条",
  "支",
  "台",
  "套",
  "米",
  "卷",
  "盘",
  "罐",
  "提",
  "捆",
  "打",
  "颗",
  "片",
];

const UNIT_PATTERN = UNITS.sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");
const NUMBER_PATTERN = "\\d+(?:\\.\\d+)?|[零一二两三四五六七八九十百千万]+";
const PRODUCT_PATTERN = "[\\u4e00-\\u9fa5A-Za-z0-9（）()【】\\[\\]·\\-\\s]{1,60}?";
const STANDARD_NAME_STOP_WORDS = [
  "产品名称",
  "单价",
  "副产",
  "公司",
  "出厂价格",
  "合计",
  "总计",
  "公斤",
  "斤",
];
const MOJIBAKE_TOKENS = [
  "鍘",
  "甯",
  "鑶",
  "绮",
  "纰",
  "楠",
  "闅",
  "缁",
  "绋",
  "榛",
  "璐",
  "姹",
  "诲",
  "彴",
  "璇",
  "嗗",
  "埆",
  "鎬",
  "昏",
];

const BUILTIN_TEMPLATE_VERSION = "2026-04-24-template-v1";
const BUILTIN_TEMPLATE_CSV_BASE64 =
  "serXvMP7s8Ysw7+8/rmrve8ov8m/1SkssLS8/rWlzrsov8m/1SkssfDD+yi/yb/Vo6y24Lj208O2urrFKQ0KMji088asLDE1LLz+LA0KMjjL6b6ryOIsMTUsvP4sIrb+sMvL6b6ryOIstv6wy8vpyOIiDQozN8vpyOKjqMvEwfmxyMD9o6ksMTUsvP4sIsj9xt/L6cjiLMj9xt8sMzciDQqw5bnHLDEwLLz+LA0KsOXTzSwxMCy8/iwNCrLmzrK5xywxNSy8/izOsrnHDQq087OmLDEwLLz+LCKzptfTLNbts6bX0yINCrTzv+nGpEEsMTAsvP4sItbtxqQstPO/6cakIg0KtPi8ubnHzajFxSwss63C6yzNqMXFDQq0+Ovs19PI4lO5xywxMCy8/iwNCrT4xqSx7Lb+LDE1LLz+LCK0+Makx7DNyCy0+Makx7DNyMjiIg0KtPjGpLHsy8QsMTUsvP4sIsilxqS6883ILMilxqS6883IyOIiDQrSu7y2tPjGpLTzzuW7qCwss63C6ywNCtPFvLa0+MaktPPO5buoLCyzrcLrLCK0+MakzuW7qCzO5buoyOIs0ru8trT4xqTO5buoyOIs0ru8trT4xqTO5buoIg0K09C97szjLDEwLLz+LA0K09C97szjo6hBQqOpLDEwLLz+LCLM49fTLNbtzOPX0yzW7czjLMzjIg0Ks6TOsrnHLDEwLLz+LA0K1tDFxSwss63C6ywNCtbQzrK5xywxMCy8/iwNCtbtt84sLEtHLLfODQrW7bjOLCxLRywNCtbtuM5BLCxLRywiuM4s1u24ziINCtbt0MQsMTAsvP4s0MQNCtbt0fwsLCwNCg==";
let builtinTemplateRowsCache = null;

let state = {
  workDate: "",
  view: "main",
  dayAutoReset: false,
  rawText: "",
  otherText: "",
  templateVersion: "",
  templateCsv: "",
  rules: structuredClone(DEFAULT_RULES),
  specs: [],
  entries: [],
  otherEntries: [],
  ocrImages: [],
  ocrText: "",
  ocrProvider: "online",
  ocrApiKey: "",
  ocrStrictMode: true,
  ocrDoubleCheck: true,
  ocrIssues: [],
};

function init() {
  try {
    bindElements();
    loadState();
    renderAll();
    if (state.dayAutoReset) {
      showToast("已切换到新日期，今日数据已自动清空并重新累计");
    }
  } catch (error) {
    console.error("初始化失败，已重置本地缓存", error);
    Object.values(STORAGE).forEach((key) => localStorage.removeItem(key));
    loadState();
    renderAll();
    showToast("检测到异常缓存，已自动重置");
  }
}

function bindElements() {
  byId("viewMainBtn").addEventListener("click", () => {
    setView("main");
  });

  byId("viewManageBtn").addEventListener("click", () => {
    setView("manage");
  });

  byId("workDate").addEventListener("change", (event) => {
    state.workDate = event.target.value;
    saveState();
    renderSummary();
  });

  byId("rawText").addEventListener("input", (event) => {
    state.rawText = event.target.value;
    saveState();
  });

  byId("otherText").addEventListener("input", (event) => {
    state.otherText = event.target.value;
    saveState();
  });

  byId("sampleBtn").addEventListener("click", () => {
    state.rawText = SAMPLE_TEXT;
    byId("rawText").value = state.rawText;
    saveState();
    showToast("已放入示例消息");
  });

  byId("clearBtn").addEventListener("click", () => {
    state.rawText = "";
    state.entries = [];
    state.ocrText = "";
    state.ocrIssues = [];
    saveState();
    renderAll();
    showToast("已清空");
  });

  byId("parseBtn").addEventListener("click", () => {
    const entries = parseMessages(state.rawText, state.rules);
    const added = appendDailyEntries(entries);
    saveState();
    renderAll();
    showToast(added ? `新增 ${added} 条，今日累计 ${state.entries.length} 条` : "没有新增明细（可能已在今日累计中）");
  });

  byId("addRowBtn").addEventListener("click", () => {
    state.entries.push(createEmptyEntry());
    saveState();
    renderAll();
  });

  byId("chooseImageBtn").addEventListener("click", () => {
    byId("imageInput").click();
  });

  byId("imageInput").addEventListener("change", (event) => {
    handleImageFiles(event.target.files);
    event.target.value = "";
  });

  byId("dropZone").addEventListener("dragover", (event) => {
    event.preventDefault();
    byId("dropZone").classList.add("dragging");
  });

  byId("dropZone").addEventListener("dragleave", () => {
    byId("dropZone").classList.remove("dragging");
  });

  byId("dropZone").addEventListener("drop", (event) => {
    event.preventDefault();
    byId("dropZone").classList.remove("dragging");
    handleImageFiles(event.dataTransfer.files);
  });

  byId("ocrBtn").addEventListener("click", () => {
    recognizeImages();
  });

  byId("importStandardsBtn").addEventListener("click", () => {
    importStandardsFromImages();
  });

  byId("ocrText").addEventListener("input", (event) => {
    state.ocrText = event.target.value;
  });

  byId("ocrProvider").addEventListener("change", (event) => {
    state.ocrProvider = event.target.value;
    saveState();
  });

  byId("ocrApiKey").addEventListener("input", (event) => {
    state.ocrApiKey = event.target.value.trim();
    saveState();
  });

  byId("ocrStrictMode").addEventListener("change", (event) => {
    state.ocrStrictMode = event.target.checked;
    saveState();
  });

  byId("ocrDoubleCheck").addEventListener("change", (event) => {
    state.ocrDoubleCheck = event.target.checked;
    saveState();
  });

  byId("appendOcrBtn").addEventListener("click", () => {
    moveOcrTextToRaw("append");
  });

  byId("replaceOcrBtn").addEventListener("click", () => {
    moveOcrTextToRaw("replace");
  });

  byId("applyRulesBtn").addEventListener("click", () => {
    state.entries = state.entries.map((entry) => ({
      ...entry,
      standardName: standardizeName(entry.originalName, state.rules),
    }));
    saveState();
    renderAll();
    showToast("已重新应用别名规则");
  });

  byId("exportDetailsBtn").addEventListener("click", () => {
    exportDetails();
  });

  byId("exportSummaryBtn").addEventListener("click", () => {
    exportSummary();
  });

  byId("copyDailyBtn").addEventListener("click", () => {
    copyDailyReport();
  });

  byId("parseOtherBtn").addEventListener("click", () => {
    state.otherEntries = parseMessages(state.otherText, state.rules);
    saveState();
    renderCompare();
    showToast(state.otherEntries.length ? `对方汇总识别出 ${state.otherEntries.length} 条` : "对方汇总没有识别到货物数量");
  });

  byId("copyCompareBtn").addEventListener("click", () => {
    copyCompareReport();
  });

  byId("exportCompareBtn").addEventListener("click", () => {
    exportCompare();
  });

  byId("addRuleBtn").addEventListener("click", () => {
    addAliasRule();
  });

  byId("importRulesBtn").addEventListener("click", () => {
    importRulesBulk();
  });

  byId("importTemplateCsvBtn").addEventListener("click", () => {
    byId("templateCsvInput").click();
  });

  byId("templateCsvInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) importTemplateCsv(file);
    event.target.value = "";
  });

  byId("addSpecBtn").addEventListener("click", () => {
    addSpecRule();
  });

  byId("importSpecsBtn").addEventListener("click", () => {
    importSpecsBulk();
  });

  byId("sanitizeDataBtn").addEventListener("click", () => {
    const result = keepOnlyTemplateData();
    saveState();
    renderAll();
    showToast(`已按模板清理：规则 ${result.ruleCount}，规格 ${result.specCount}`);
  });

  byId("resetRulesBtn").addEventListener("click", () => {
    state.templateCsv = "";
    const result = applyTemplateRowsStrict(getBuiltinTemplateRows(), { templateVersion: BUILTIN_TEMPLATE_VERSION });
    restandardizeEntries();
    saveState();
    renderAll();
    showToast(`已重置为内置模板（${result.rowCount} 条）`);
  });

  byId("detailsBody").addEventListener("input", onDetailsInput);
  byId("detailsBody").addEventListener("click", onDetailsClick);
  byId("rulesBody").addEventListener("input", onRulesInput);
  byId("rulesBody").addEventListener("click", onRulesClick);
  byId("specBody").addEventListener("click", onSpecClick);
}

function loadState() {
  const today = todayISO();
  const savedDate = localStorage.getItem(STORAGE.date) || "";
  state.workDate = savedDate || today;
  state.view = localStorage.getItem(STORAGE.view) || "main";
  if (!["main", "manage"].includes(state.view)) state.view = "main";
  state.rawText = localStorage.getItem(STORAGE.raw) || "";
  state.templateVersion = localStorage.getItem(STORAGE.templateVersion) || "";
  state.templateCsv = localStorage.getItem(STORAGE.templateCsv) || "";
  state.ocrProvider = localStorage.getItem(STORAGE.ocrProvider) || "online";
  state.ocrApiKey = localStorage.getItem(STORAGE.ocrApiKey) || "";
  state.ocrStrictMode = localStorage.getItem(STORAGE.ocrStrictMode) !== "0";
  state.ocrDoubleCheck = localStorage.getItem(STORAGE.ocrDoubleCheck) !== "0";
  state.otherText = localStorage.getItem(STORAGE.otherText) || "";
  state.entries = normalizeEntries(safeParse(localStorage.getItem(STORAGE.entries), []));
  state.otherEntries = normalizeEntries(safeParse(localStorage.getItem(STORAGE.otherEntries), []));
  state.dayAutoReset = false;
  if (savedDate && savedDate !== today) {
    resetDailyWorkingData(today);
    state.dayAutoReset = true;
  }
  state.rules = normalizeRules(safeParse(localStorage.getItem(STORAGE.rules), []));
  state.specs = normalizeSpecs(safeParse(localStorage.getItem(STORAGE.specs), []));
  const template = getActiveTemplateContext();
  const strictResult = applyTemplateRowsStrict(template.rows, { templateVersion: template.version });
  const sanitizeResult = sanitizeMasterData();
  if (strictResult.changed || sanitizeResult.changed) {
    restandardizeEntries();
    saveState();
  }
  state.ocrIssues = [];
}

function resetDailyWorkingData(nextDate) {
  state.workDate = nextDate || todayISO();
  state.rawText = "";
  state.otherText = "";
  state.entries = [];
  state.otherEntries = [];
  state.ocrImages = [];
  state.ocrText = "";
  state.ocrIssues = [];
}

function saveState() {
  localStorage.setItem(STORAGE.date, state.workDate);
  localStorage.setItem(STORAGE.view, state.view || "main");
  localStorage.setItem(STORAGE.raw, state.rawText);
  localStorage.setItem(STORAGE.templateVersion, state.templateVersion || "");
  localStorage.setItem(STORAGE.templateCsv, state.templateCsv || "");
  localStorage.setItem(STORAGE.ocrProvider, state.ocrProvider);
  localStorage.setItem(STORAGE.ocrApiKey, state.ocrApiKey);
  localStorage.setItem(STORAGE.ocrStrictMode, state.ocrStrictMode ? "1" : "0");
  localStorage.setItem(STORAGE.ocrDoubleCheck, state.ocrDoubleCheck ? "1" : "0");
  localStorage.setItem(STORAGE.otherText, state.otherText);
  localStorage.setItem(STORAGE.entries, JSON.stringify(state.entries));
  localStorage.setItem(STORAGE.otherEntries, JSON.stringify(state.otherEntries));
  localStorage.setItem(STORAGE.rules, JSON.stringify(state.rules));
  localStorage.setItem(STORAGE.specs, JSON.stringify(state.specs));
}

function setView(nextView) {
  const view = nextView === "manage" ? "manage" : "main";
  if (state.view === view) return;
  state.view = view;
  saveState();
  renderView();
}

function renderView() {
  const isManage = state.view === "manage";
  document.querySelectorAll("[data-view]").forEach((node) => {
    const mode = node.getAttribute("data-view");
    const shouldShow = mode === (isManage ? "manage" : "main");
    node.classList.toggle("is-hidden", !shouldShow);
  });

  byId("viewMainBtn").classList.toggle("active", !isManage);
  byId("viewManageBtn").classList.toggle("active", isManage);
}

function renderAll() {
  renderView();
  byId("workDate").value = state.workDate;
  byId("rawText").value = state.rawText;
  byId("otherText").value = state.otherText;
  byId("ocrText").value = state.ocrText;
  byId("ocrProvider").value = state.ocrProvider;
  byId("ocrApiKey").value = state.ocrApiKey;
  byId("ocrStrictMode").checked = state.ocrStrictMode;
  byId("ocrDoubleCheck").checked = state.ocrDoubleCheck;
  renderImagePreview();
  renderOcrIssues();
  renderDetails();
  renderRules();
  renderSpecs();
  renderTemplateStatus();
  renderSummary();
  renderCompare();
}

function renderDetails() {
  const tbody = byId("detailsBody");
  if (!state.entries.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="7">暂无明细</td></tr>`;
    return;
  }

  tbody.innerHTML = state.entries
    .map(
      (entry) => `
      <tr data-id="${escapeHtml(entry.id)}">
        <td><input data-field="sender" value="${escapeAttr(entry.sender)}" /></td>
        <td><input data-field="originalName" value="${escapeAttr(entry.originalName)}" /></td>
        <td><input data-field="standardName" value="${escapeAttr(entry.standardName)}" /></td>
        <td class="num"><input data-field="quantity" inputmode="decimal" value="${escapeAttr(formatNumber(entry.quantity))}" /></td>
        <td><input data-field="unit" value="${escapeAttr(entry.unit)}" /></td>
        <td><input data-field="note" value="${escapeAttr(entry.note || "")}" /></td>
        <td><button class="delete-btn" data-action="delete-entry" type="button" title="删除">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function renderRules() {
  const tbody = byId("rulesBody");
  byId("statRules").textContent = state.rules.length;

  if (!state.rules.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="3">暂无别名规则</td></tr>`;
    return;
  }

  tbody.innerHTML = state.rules
    .map(
      (rule, index) => `
      <tr data-index="${index}">
        <td><input data-rule-field="standard" value="${escapeAttr(rule.standard)}" /></td>
        <td><input data-rule-field="aliases" value="${escapeAttr(rule.aliases.join(", "))}" /></td>
        <td><button class="delete-btn" data-action="delete-rule" type="button" title="删除">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function renderSpecs() {
  const tbody = byId("specBody");
  if (!state.specs.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="4">暂无标准重量规则</td></tr>`;
    return;
  }

  tbody.innerHTML = state.specs
    .map(
      (spec, index) => `
      <tr data-index="${index}">
        <td>${escapeHtml(spec.standard)}</td>
        <td class="num">${escapeHtml(formatOptionalNumber(spec.pieceWeightKg))}</td>
        <td>${escapeHtml((spec.pieceUnits || []).join("、"))}</td>
        <td><button class="delete-btn" data-action="delete-spec" type="button" title="删除">×</button></td>
      </tr>
    `,
    )
    .join("");
}

function renderTemplateStatus() {
  const el = byId("templateStatus");
  if (!el) return;
  const template = getActiveTemplateContext();
  const rowCount = template.rows.length;
  const aliasCount = state.rules.length;
  const specCount = state.specs.length;
  const sourceText = template.source === "custom" ? "自定义模板" : "内置模板";
  el.textContent = `${sourceText} ${rowCount} 条，当前规则 ${aliasCount}，规格 ${specCount}`;
}

function renderSummary() {
  const summary = summarizeEntries(state.entries, state.specs);
  byId("statItems").textContent = state.entries.length;
  byId("statProducts").textContent = summary.length;

  const tbody = byId("summaryBody");
  if (!summary.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="5">暂无汇总</td></tr>`;
    return;
  }

  tbody.innerHTML = summary
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(formatNumber(row.quantity))}</td>
        <td>${escapeHtml(row.unit)}</td>
        <td class="num">${escapeHtml(formatOptionalNumber(row.kgEquivalent))}</td>
        <td class="num">${row.count}</td>
      </tr>
    `,
    )
    .join("");
}

function renderCompare() {
  const rows = compareEntries(state.entries, state.otherEntries);
  const counts = rows.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    { matched: 0, different: 0, missingMine: 0, missingOther: 0 },
  );

  byId("compareMatched").textContent = `一致 ${counts.matched || 0}`;
  byId("compareDiff").textContent = `差异 ${counts.different || 0}`;
  byId("compareMissingMine").textContent = `我方缺少 ${counts.missingMine || 0}`;
  byId("compareMissingOther").textContent = `对方缺少 ${counts.missingOther || 0}`;

  const tbody = byId("compareBody");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="6">粘贴对方汇总后点击“开始核对”</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (row) => `
      <tr class="${escapeAttr(row.status)}">
        <td><span class="status-pill ${escapeAttr(row.status)}">${escapeHtml(statusLabel(row.status))}</span></td>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${escapeHtml(formatOptionalNumber(row.mineQuantity))}</td>
        <td class="num">${escapeHtml(formatOptionalNumber(row.otherQuantity))}</td>
        <td>${escapeHtml(row.unit)}</td>
        <td class="num">${escapeHtml(formatOptionalNumber(row.diff))}</td>
      </tr>
    `,
    )
    .join("");
}

function renderImagePreview() {
  const preview = byId("imagePreview");

  if (!state.ocrImages.length) {
    preview.innerHTML = `<div class="empty-preview">还没有选择截图</div>`;
    byId("ocrStatus").textContent = "未选择图片";
    return;
  }

  preview.innerHTML = state.ocrImages
    .map(
      (item) => `
      <figure>
        <img src="${escapeAttr(item.url)}" alt="${escapeAttr(item.name)}" />
        <figcaption>${escapeHtml(item.name)}</figcaption>
      </figure>
    `,
    )
    .join("");
  byId("ocrStatus").textContent = `${state.ocrImages.length} 张图片待识别`;
}

function renderOcrIssues() {
  const container = byId("ocrIssues");
  if (!container) return;

  if (!state.ocrIssues.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.ocrIssues
    .map(
      (issue) => `
      <div class="issue-item ${issue.level === "error" ? "error" : ""}">
        ${escapeHtml(issue.text)}
      </div>
    `,
    )
    .join("");
}

function parseMessages(text, rules) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = [];

  lines.forEach((line, lineIndex) => {
    const meta = parseLineMeta(line);
    const chunks = splitMessage(meta.message);

    chunks.forEach((chunk, chunkIndex) => {
      extractItems(chunk, line, meta, rules).forEach((entry, itemIndex) => {
        entries.push({
          ...entry,
          id: makeId(lineIndex, chunkIndex, itemIndex),
        });
      });
    });
  });

  return entries;
}

function parseLineMeta(line) {
  let sender = "";
  let time = "";
  let message = normalizeMessageLine(line);

  const timeSenderMatch = message.match(/^(.{1,18})\s+(\d{1,2}[:：]\d{2})\s+(.+)$/);
  if (timeSenderMatch && !startsWithQuantity(timeSenderMatch[3])) {
    sender = timeSenderMatch[1].trim();
    time = timeSenderMatch[2].replace("：", ":");
    message = timeSenderMatch[3].trim();
    return { sender, time, message };
  }

  const colonMatch = message.match(/^(.{1,18})[：:]\s*(.+)$/);
  if (colonMatch) {
    if (startsWithQuantity(colonMatch[2])) {
      message = `${colonMatch[1].trim()} ${colonMatch[2].trim()}`;
    } else {
      sender = colonMatch[1].trim();
      message = colonMatch[2].trim();
    }
  }

  return { sender, time, message };
}

function normalizeMessageLine(line) {
  return line
    .replace(/[|｜]/g, " ")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/^\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?\s+\d{1,2}[:：]\d{2}\s*/, "")
    .replace(/^\d{1,2}[:：]\d{2}\s*/, "")
    .replace(/\d{1,2}月\d{1,2}日/g, "")
    .trim();
}

function splitMessage(message) {
  return message
    .replace(/\s+和\s+/g, "，")
    .split(/[，,；;、\n]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function extractItems(chunk, sourceLine, meta, rules) {
  const entries = [];
  const usedRanges = [];
  const afterRegex = new RegExp(`(${PRODUCT_PATTERN})\\s*(${NUMBER_PATTERN})\\s*(${UNIT_PATTERN})`, "g");
  const beforeRegex = new RegExp(`(${NUMBER_PATTERN})\\s*(${UNIT_PATTERN})\\s*(${PRODUCT_PATTERN})`, "g");

  collectMatches(afterRegex, chunk, usedRanges).forEach((match) => {
    const resolved = resolveAfterPatternNameQuantity(match[1], match[2], match[3], rules);
    const originalName = resolved.originalName;
    const quantity = resolved.quantity;
    const unit = normalizeUnit(match[3]);
    if (isValidItem(originalName, quantity, unit)) {
      entries.push(makeEntry(sourceLine, meta, originalName, quantity, unit));
    }
  });

  collectMatches(beforeRegex, chunk, usedRanges).forEach((match) => {
    const originalName = cleanupName(match[3]);
    const quantity = parseNumber(match[1]);
    const unit = normalizeUnit(match[2]);
    if (isValidItem(originalName, quantity, unit)) {
      entries.push(makeEntry(sourceLine, meta, originalName, quantity, unit));
    }
  });

  if (!entries.length) {
    extractKnownUnitlessItems(chunk, sourceLine, meta, rules).forEach((entry) => entries.push(entry));
  }

  return entries.map((entry) => ({
    ...entry,
    standardName: standardizeName(entry.originalName, rules),
  }));
}

function resolveAfterPatternNameQuantity(rawName, rawQuantity, rawUnit, rules) {
  const originalName = cleanupName(rawName);
  const quantityText = String(rawQuantity || "").trim();
  const quantity = parseNumber(quantityText);
  const unit = normalizeUnit(rawUnit || "");
  const best = chooseAmbiguousQuantitySplit(originalName, quantityText, unit, rules);
  if (best) return best;
  return { originalName, quantity };
}

function chooseAmbiguousQuantitySplit(name, quantityText, unit, rules) {
  if (!name || !quantityText || !unit) return null;
  if (!/^[零一二两三四五六七八九]{2,}$/.test(quantityText)) return null;

  const pieceLikeUnits = new Set(["件", "箱", "包", "袋", "板", "个", "只", "条", "支", "台", "套", "提", "捆", "打", "颗", "片"]);
  if (!pieceLikeUnits.has(unit)) return null;

  const baseScore = getRuleMatchScore(name, rules);
  const candidates = [];
  for (let splitIndex = 1; splitIndex < quantityText.length; splitIndex += 1) {
    const nameSuffix = quantityText.slice(0, splitIndex);
    const qtyPart = quantityText.slice(splitIndex);
    const candidateName = cleanupName(`${name}${nameSuffix}`);
    const candidateQty = parseNumber(qtyPart);
    if (!isValidItem(candidateName, candidateQty, unit)) continue;

    const matchScore = getRuleMatchScore(candidateName, rules);
    candidates.push({
      originalName: candidateName,
      quantity: candidateQty,
      score: matchScore,
      qtyLen: qtyPart.length,
    });
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => b.score - a.score || a.qtyLen - b.qtyLen || a.quantity - b.quantity);
  const best = candidates[0];
  if (best.score > baseScore) return { originalName: best.originalName, quantity: best.quantity };

  const fallbackAllowed = /(?:膘|级|号|排|骨|肉|腿|肘|肋|花|块|条)$/.test(name);
  if (fallbackAllowed) return { originalName: best.originalName, quantity: best.quantity };
  return null;
}

function getRuleMatchScore(name, rules) {
  const target = normalizeText(name);
  if (!target) return 0;

  let best = 0;
  rules.forEach((rule) => {
    [rule.standard, ...(rule.aliases || [])].forEach((alias) => {
      const key = normalizeText(alias);
      if (!key) return;
      if (target === key) {
        best = Math.max(best, key.length + 100);
      } else if (target.includes(key) || key.includes(target)) {
        best = Math.max(best, Math.min(target.length, key.length));
      }
    });
  });
  return best;
}

function extractKnownUnitlessItems(chunk, sourceLine, meta, rules) {
  const line = normalizeOcrNumberText(chunk);
  const product = findBestKnownProduct(line, rules);
  if (!product) return [];

  const numbers = findQuantities(line);
  if (!numbers.length) return [];

  const quantity = chooseQuantityForProduct(line, product, numbers);
  if (!quantity || !Number.isFinite(quantity.value) || quantity.value <= 0) return [];

  return [
    {
      ...makeEntry(sourceLine, meta, product.standard, quantity.value, quantity.unit || ""),
      standardName: product.standard,
    },
  ];
}

function collectMatches(regex, text, usedRanges) {
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const overlaps = usedRanges.some((range) => start < range.end && end > range.start);
    if (!overlaps) {
      usedRanges.push({ start, end });
      matches.push(match);
    }
  }

  return matches;
}

function makeEntry(sourceLine, meta, originalName, quantity, unit) {
  return {
    id: makeId(Date.now(), Math.random(), quantity),
    sender: meta.sender,
    time: meta.time,
    source: sourceLine,
    originalName,
    standardName: originalName,
    quantity,
    unit,
    note: "",
  };
}

function createEmptyEntry() {
  return {
    id: makeId(Date.now(), "manual", state.entries.length),
    sender: "",
    time: "",
    source: "",
    originalName: "",
    standardName: "",
    quantity: 0,
    unit: "",
    note: "",
  };
}

function entrySignature(entry) {
  return [
    normalizeText(entry.sender),
    normalizeText(entry.time),
    normalizeText(entry.source),
    normalizeText(entry.originalName),
    roundNumber(entry.quantity),
    normalizeText(normalizeUnit(entry.unit)),
  ].join("|");
}

function appendDailyEntries(newEntries) {
  if (!Array.isArray(newEntries) || !newEntries.length) return 0;
  const seen = new Set(state.entries.map((item) => entrySignature(item)));
  let added = 0;
  newEntries.forEach((entry) => {
    const sign = entrySignature(entry);
    if (!sign || seen.has(sign)) return;
    seen.add(sign);
    state.entries.push(entry);
    added += 1;
  });
  return added;
}

function cleanupName(name) {
  let cleaned = String(name || "")
    .replace(/[：:]/g, "")
    .replace(/^[\s\-—_]+|[\s\-—_]+$/g, "")
    .trim();

  const verbs = ["下单", "需要", "采购", "补货", "帮我", "给我", "麻烦", "请", "要", "订", "定", "来", "拿", "发", "补", "加", "买"];
  verbs.forEach((verb) => {
    const index = cleaned.lastIndexOf(verb);
    if (index >= 0 && index + verb.length < cleaned.length) {
      cleaned = cleaned.slice(index + verb.length);
    }
  });

  cleaned = cleaned
    .replace(/^(今天|明天|后天|上午|下午|晚上|中午|早上|客户|老板|老板娘|帮|给|请)+/g, "")
    .replace(/(今天|明天|后天|上午|下午|晚上|中午|早上|送|配送|到货|发货|急|谢谢|左右|大概|备注).*$/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9（）()·\-]/g, "")
    .trim();

  return cleaned;
}

function standardizeName(name, rules) {
  const normalizedName = normalizeText(name);
  if (!normalizedName) return "";

  const candidates = [];

  rules.forEach((rule) => {
    const standard = normalizeText(rule.standard);
    const aliases = [rule.standard, ...(rule.aliases || [])];
    aliases.forEach((alias) => {
      const normalizedAlias = normalizeText(alias);
      if (!normalizedAlias) return;
      const exact = normalizedName === normalizedAlias;
      const contains = normalizedAlias.length >= 2 && normalizedName.includes(normalizedAlias);
      if (exact || contains) {
        candidates.push({
          standardName: rule.standard.trim(),
          score: exact ? normalizedAlias.length + 100 : normalizedAlias.length,
        });
      }
    });
    if (standard && normalizedName === standard) {
      candidates.push({ standardName: rule.standard.trim(), score: standard.length + 100 });
    }
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.standardName || name;
}

function findBestKnownProduct(line, rules) {
  const normalizedLine = normalizeText(line);
  const products = getKnownProducts(rules)
    .filter((item) => item.aliasKey && normalizedLine.includes(item.aliasKey))
    .sort((a, b) => b.aliasKey.length - a.aliasKey.length);

  return products[0] || null;
}

function getKnownProducts(rules) {
  const items = [];
  rules.forEach((rule) => {
    [rule.standard, ...(rule.aliases || [])].forEach((alias) => {
      const aliasKey = normalizeText(alias);
      if (aliasKey) {
        items.push({
          standard: rule.standard.trim(),
          alias: String(alias).trim(),
          aliasKey,
        });
      }
    });
  });
  return items;
}

function findQuantities(line) {
  const regex = new RegExp(`(${NUMBER_PATTERN})\\s*(${UNIT_PATTERN})?`, "g");
  const quantities = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    const value = parseNumber(match[1]);
    const unit = normalizeUnit(match[2] || "");
    if (!Number.isFinite(value) || value <= 0) continue;
    if (looksLikeDateOrTime(line, match.index, regex.lastIndex)) continue;
    quantities.push({
      value,
      unit,
      index: match.index,
    });
  }

  return quantities;
}

function chooseQuantityForProduct(line, product, quantities) {
  const aliasIndex = normalizeText(line).indexOf(product.aliasKey);
  if (aliasIndex < 0) return quantities[0];

  const rawAliasIndex = findLooseAliasIndex(line, product.alias);
  const compareIndex = rawAliasIndex >= 0 ? rawAliasIndex : aliasIndex;
  return quantities
    .map((item) => ({
      ...item,
      distance: Math.abs(item.index - compareIndex),
      afterProduct: item.index >= compareIndex ? 0 : 1,
    }))
    .sort((a, b) => a.afterProduct - b.afterProduct || a.distance - b.distance)[0];
}

function findLooseAliasIndex(line, alias) {
  const compactLine = normalizeText(line);
  const compactAlias = normalizeText(alias);
  const compactIndex = compactLine.indexOf(compactAlias);
  if (compactIndex < 0) return -1;

  let compactCount = 0;
  for (let index = 0; index < line.length; index += 1) {
    if (normalizeText(line[index])) {
      if (compactCount === compactIndex) return index;
      compactCount += 1;
    }
  }
  return -1;
}

function looksLikeDateOrTime(line, start, end) {
  const before = line.slice(Math.max(0, start - 2), start);
  const after = line.slice(end, Math.min(line.length, end + 2));
  const token = line.slice(start, end);
  if (/[:：]/.test(before + after)) return true;
  if (/[年月日/-]/.test(before + after)) return true;
  if (/^20\d{2}$/.test(token)) return true;
  return false;
}

function summarizeEntries(entries, specs = []) {
  const groups = new Map();

  entries.forEach((entry) => {
    const name = String(entry.standardName || entry.originalName || "").trim();
    const quantity = Number(entry.quantity);
    const normalizedMeasure = normalizeSummaryMeasure(name, quantity, entry.unit, specs);
    if (!name || !normalizedMeasure) return;

    const unit = normalizedMeasure.unit;
    const normalizedQuantity = normalizedMeasure.quantity;

    const key = `${normalizeText(name)}__${unit}`;
    const current = groups.get(key) || {
      name,
      unit,
      quantity: 0,
      count: 0,
      originals: new Set(),
    };

    current.quantity += normalizedQuantity;
    current.count += 1;
    if (entry.originalName) current.originals.add(entry.originalName);
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((row) => ({
      ...row,
      quantity: roundNumber(row.quantity),
      kgEquivalent: toKilograms(row.name, row.quantity, row.unit, specs),
      originals: Array.from(row.originals),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function normalizeSummaryMeasure(name, quantity, unit, specs) {
  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) return null;

  const normalizedUnit = normalizeUnit(unit);
  const directFactor = getUnitKgFactor(normalizeText(normalizedUnit));
  if (directFactor !== null) {
    return {
      quantity: roundNumber(q * directFactor),
      unit: "公斤",
    };
  }

  return {
    quantity: q,
    unit: normalizedUnit,
  };
}

function compareEntries(mineEntries, otherEntries) {
  const mineMap = summaryMap(summarizeEntries(mineEntries));
  const otherMap = summaryMap(summarizeEntries(otherEntries));
  const keys = unique([...mineMap.keys(), ...otherMap.keys()]);

  return keys
    .map((key) => {
      const mine = mineMap.get(key);
      const other = otherMap.get(key);
      const name = mine?.name || other?.name || "";
      const unit = mine?.unit || other?.unit || "";
      const mineQuantity = mine ? mine.quantity : null;
      const otherQuantity = other ? other.quantity : null;
      const diff =
        mineQuantity !== null && otherQuantity !== null ? roundNumber(mineQuantity - otherQuantity) : null;

      let status = "matched";
      if (!mine && other) status = "missingMine";
      else if (mine && !other) status = "missingOther";
      else if (!sameQuantity(mineQuantity, otherQuantity)) status = "different";

      return {
        key,
        status,
        name,
        unit,
        mineQuantity,
        otherQuantity,
        diff,
      };
    })
    .sort(compareRows);
}

function toKilograms(name, quantity, unit, specs) {
  const q = Number(quantity);
  const u = normalizeText(unit);
  if (!Number.isFinite(q)) return null;

  const directFactor = getUnitKgFactor(u);
  if (directFactor !== null) {
    return roundNumber(q * directFactor);
  }

  const spec = findSpecByName(name, specs);
  if (!spec || !Number.isFinite(spec.pieceWeightKg)) return null;
  const allowedUnits = (spec.pieceUnits || []).map((item) => normalizeText(item));
  if (!allowedUnits.length || allowedUnits.includes(u)) {
    return roundNumber(q * spec.pieceWeightKg);
  }

  return null;
}

function findSpecByName(name, specs) {
  const key = normalizeText(name);
  return specs.find((item) => normalizeText(item.standard) === key);
}

function getUnitKgFactor(normalizedUnit) {
  if (!normalizedUnit) return null;
  if (["kg", "公斤", "千克"].includes(normalizedUnit)) return 1;
  if (["斤"].includes(normalizedUnit)) return 0.5;
  if (["g", "克"].includes(normalizedUnit)) return 0.001;
  if (["吨"].includes(normalizedUnit)) return 1000;
  return null;
}

function summaryMap(summary) {
  return new Map(summary.map((row) => [summaryKey(row.name, row.unit), row]));
}

function summaryKey(name, unit) {
  return `${normalizeText(name)}__${normalizeText(normalizeUnit(unit))}`;
}

function sameQuantity(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.0001;
}

function compareRows(a, b) {
  const order = {
    different: 0,
    missingMine: 1,
    missingOther: 2,
    matched: 3,
  };
  return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.name.localeCompare(b.name, "zh-Hans-CN");
}

function statusLabel(status) {
  const labels = {
    matched: "一致",
    different: "数量不一致",
    missingMine: "我方缺少",
    missingOther: "对方缺少",
  };
  return labels[status] || status;
}

function handleImageFiles(fileList) {
  const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
  if (!files.length) {
    showToast("请选择图片文件");
    return;
  }

  clearOcrImages();
  state.ocrImages = files.map((file) => ({
    file,
    name: file.name || "截图",
    url: URL.createObjectURL(file),
  }));
  state.ocrText = "";
  state.ocrIssues = [];
  renderAll();
  showToast(`已选择 ${files.length} 张截图`);
}

function clearOcrImages() {
  state.ocrImages.forEach((item) => URL.revokeObjectURL(item.url));
  state.ocrImages = [];
}


async function recognizeImages() {
  if (!state.ocrImages.length) {
    showToast("请先选择截图");
    return;
  }

  if (state.ocrProvider === "local" && !window.Tesseract?.recognize) {
    showToast("本地 OCR 引擎未加载，请检查网络后重试");
    byId("ocrStatus").textContent = "本地 OCR 引擎加载失败";
    return;
  }

  setOcrBusy(true);
  const texts = [];
  const issues = [];

  try {
    for (let index = 0; index < state.ocrImages.length; index += 1) {
      const item = state.ocrImages[index];
      const total = state.ocrImages.length;
      byId("ocrStatus").textContent = `正在识别第 ${index + 1}/${total} 张`;

      const primary = await recognizeByProvider(state.ocrProvider, item.file, state.rules, index, total);
      let finalText = primary.text;
      issues.push(...tagIssues(primary.issues, item.name, "warn"));

      if (state.ocrDoubleCheck) {
        const verifyProvider = state.ocrProvider === "online" ? "local" : "online";
        const verify = await recognizeByProvider(verifyProvider, item.file, state.rules, index, total, true);
        issues.push(...tagIssues(verify.issues, item.name, "warn"));

        const merged = reconcileRecognitionTexts(finalText, verify.text, state.rules, state.ocrStrictMode);
        finalText = merged.text;
        issues.push(...tagIssues(merged.issues, item.name, "error"));
      }

      if (finalText) texts.push(finalText);
    }

    state.ocrText = unique(
      texts
        .filter(Boolean)
        .join("\n")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    ).join("\n");
    state.ocrIssues = issues;
    byId("ocrText").value = state.ocrText;
    renderOcrIssues();

    byId("ocrStatus").textContent = state.ocrText
      ? `提取完成，共 ${state.ocrImages.length} 张`
      : "没有提取到货物数量";
    showToast(state.ocrText ? "已提取货物和数量" : "未识别到有效货物，请补充别名或换清晰截图");
  } catch (error) {
    console.error(error);
    byId("ocrStatus").textContent = "识别失败";
    showToast("识别失败，请重试");
  } finally {
    setOcrBusy(false);
  }
}

async function importStandardsFromImages() {
  if (!state.ocrImages.length) {
    showToast("请先选择截图");
    return;
  }

  if (state.ocrProvider === "local" && !window.Tesseract?.recognize) {
    showToast("本地 OCR 引擎未加载，请检查网络后重试");
    byId("ocrStatus").textContent = "本地 OCR 引擎加载失败";
    return;
  }

  setOcrBusy(true);
  const names = [];
  const issues = [];

  try {
    for (let index = 0; index < state.ocrImages.length; index += 1) {
      const item = state.ocrImages[index];
      const total = state.ocrImages.length;
      byId("ocrStatus").textContent = `正在提取标准名称第 ${index + 1}/${total} 张`;

      const primary = await recognizeRawTextByProvider(state.ocrProvider, item.file, index, total);
      issues.push(...tagIssues(primary.issues, item.name, "warn"));
      let found = extractStandardNamesFromOcr(primary.text);

      if (!found.length && state.ocrDoubleCheck) {
        const verifyProvider = state.ocrProvider === "online" ? "local" : "online";
        const verify = await recognizeRawTextByProvider(verifyProvider, item.file, index, total, true);
        issues.push(...tagIssues(verify.issues, item.name, "warn"));
        found = unique([...found, ...extractStandardNamesFromOcr(verify.text)]);
      }

      if (!found.length) {
        issues.push({
          level: "error",
          text: `${item.name}: 没有提取到可导入的标准名称`,
        });
      }

      names.push(...found);
    }

    const imported = importStandardNames(names);
    state.ocrText = imported.names.join("\n");
    state.ocrIssues = issues;
    byId("ocrText").value = state.ocrText;
    renderOcrIssues();

    if (!imported.names.length) {
      byId("ocrStatus").textContent = "没有提取到标准名称";
      showToast("未识别到标准名称，请换更清晰截图");
      return;
    }

    saveState();
    renderAll();
    byId("ocrStatus").textContent = `标准名称已导入，共 ${imported.names.length} 个`;
    showToast(`识别 ${imported.names.length} 个标准名，新增 ${imported.addedRules} 条规则 / ${imported.addedSpecs} 条重量项`);
  } catch (error) {
    console.error(error);
    byId("ocrStatus").textContent = "导入失败";
    showToast("导入标准名称失败，请重试");
  } finally {
    setOcrBusy(false);
  }
}

async function recognizeRawTextByProvider(provider, file, index, total, silentFallback = false) {
  if (provider === "local" && !window.Tesseract?.recognize) {
    return {
      text: "",
      issues: ["本地 OCR 不可用"],
    };
  }

  if (provider === "online") {
    try {
      const text = await requestOcrSpaceText(file, index, total);
      return { text, issues: [] };
    } catch (error) {
      if (!silentFallback) {
        console.warn("在线 OCR 失败，自动回退到本地 OCR", error);
      }
      if (!window.Tesseract?.recognize) {
        return {
          text: "",
          issues: ["在线 OCR 失败，且本地 OCR 不可用"],
        };
      }
      const local = await recognizeLocalRawText(file, index, total);
      return {
        ...local,
        issues: [...local.issues, "在线 OCR 请求失败，已回退到本地 OCR"],
      };
    }
  }

  return recognizeLocalRawText(file, index, total);
}

async function recognizeLocalRawText(file, index, total) {
  const text = await recognizeWholeImageRawText(file, index, total);
  return {
    text,
    issues: text ? [] : ["本地 OCR 未识别到文字"],
  };
}

async function recognizeByProvider(provider, file, rules, index, total, silentFallback = false) {
  if (provider === "local" && !window.Tesseract?.recognize) {
    return {
      text: "",
      issues: ["本地 OCR 不可用"],
    };
  }

  if (provider === "online") {
    try {
      const rawText = await requestOcrSpaceText(file, index, total);
      return buildCargoRecognitionResult(rawText, rules, "online");
    } catch (error) {
      if (!silentFallback) {
        console.warn("在线 OCR 失败，自动回退到本地 OCR", error);
      }
      if (!window.Tesseract?.recognize) {
        return {
          text: "",
          issues: ["在线 OCR 失败，且本地 OCR 不可用"],
        };
      }
      const local = await recognizeLocalCargo(file, rules, index, total);
      return {
        ...local,
        issues: [...local.issues, "在线 OCR 请求失败，已回退到本地 OCR"],
      };
    }
  }

  return recognizeLocalCargo(file, rules, index, total);
}

async function recognizeLocalCargo(file, rules, index, total) {
  const localText =
    (await recognizeStructuredCargoTable(file, rules, index, total)) ||
    (await recognizeWholeImageCargo(file, rules, index, total));
  return buildCargoRecognitionResult(localText, rules, "local");
}

function buildCargoRecognitionResult(rawText, rules, source) {
  const text = extractCargoTextFromOcr(rawText, rules);
  const issues = analyzeRecognitionQuality(rawText, text, source);
  return { text, issues };
}

function analyzeRecognitionQuality(rawText, cargoText, source) {
  const issues = [];
  const parsed = parseMessages(cargoText, state.rules);
  if (!parsed.length) {
    issues.push(source === "online" ? "在线 OCR 未识别到货物行" : "本地 OCR 未识别到货物行");
    return issues;
  }

  const normalizedRaw = normalizeOcrText(rawText || "");
  const rawTotal = extractTotalNumber(normalizedRaw);
  if (rawTotal !== null) {
    const unitGroups = summarizeEntries(parsed).reduce((acc, row) => {
      const key = row.unit || "(无单位)";
      acc.set(key, (acc.get(key) || 0) + Number(row.quantity));
      return acc;
    }, new Map());
    const bestActual = Math.max(...Array.from(unitGroups.values()));
    if (Math.abs(bestActual - rawTotal) > 0.0001) {
      issues.push(`检测到总计 ${rawTotal}，但识别行合计为 ${formatNumber(bestActual)}`);
    }
  }

  return issues;
}

function extractTotalNumber(rawText) {
  const regex = /(?:\u5408\u8ba1|\u603b\u8ba1)[^\d]{0,10}(\d+(?:\.\d+)?)/g;
  let match;
  let last = null;
  while ((match = regex.exec(rawText)) !== null) {
    last = Number(match[1]);
  }
  return Number.isFinite(last) ? last : null;
}

async function requestOcrSpaceText(file, index, total) {
  byId("ocrStatus").textContent = `在线 OCR 第 ${index + 1}/${total} 张`;
  const endpoint = "https://api.ocr.space/parse/image";
  const formData = new FormData();
  formData.append("apikey", state.ocrApiKey || "helloworld");
  formData.append("isOverlayRequired", "false");
  formData.append("language", "chs");
  formData.append("isTable", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");
  formData.append("file", file, file.name || "upload.jpg");

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join("; ") : data.ErrorMessage || "Unknown";
    throw new Error(message);
  }

  const parsedText = (data.ParsedResults || []).map((item) => item.ParsedText || "").join("\n");
  if (!parsedText.trim()) {
    throw new Error("在线 OCR 返回空结果");
  }
  return parsedText;
}

function reconcileRecognitionTexts(primaryText, verifyText, rules, strictMode) {
  if (!verifyText) {
    return { text: primaryText, issues: [] };
  }

  const primarySummary = summarizeEntries(parseMessages(primaryText, rules));
  const verifySummary = summarizeEntries(parseMessages(verifyText, rules));
  const verifyMap = summaryMap(verifySummary);
  const rows = [];
  const issues = [];

  primarySummary.forEach((row) => {
    const key = summaryKey(row.name, row.unit);
    const verifyRow = verifyMap.get(key);
    if (!verifyRow) {
      issues.push(`交叉校验缺项：${row.name} ${formatNumber(row.quantity)}${row.unit}`);
      if (!strictMode) rows.push(row);
      return;
    }

    if (!sameQuantity(row.quantity, verifyRow.quantity)) {
      issues.push(
        `交叉校验数量冲突：${row.name} 本次 ${formatNumber(row.quantity)}${row.unit} / 复核 ${formatNumber(verifyRow.quantity)}${verifyRow.unit}`,
      );
      if (!strictMode) rows.push(row);
      return;
    }

    rows.push(row);
  });

  const text = rows.map((row) => `${row.name} ${formatNumber(row.quantity)}${row.unit}`.trim()).join("\n");
  return { text, issues };
}

function mergeRecognizedCargoTexts(cellText, tableText, rules) {
  const cellSummary = summarizeEntries(parseMessages(cellText || "", rules));
  const tableSummary = summarizeEntries(parseMessages(tableText || "", rules));
  const merged = new Map();

  cellSummary.forEach((row) => {
    merged.set(summaryKey(row.name, row.unit), row);
  });

  tableSummary.forEach((row) => {
    const key = summaryKey(row.name, row.unit);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, row);
      return;
    }
    const existingScore = `${existing.name}${existing.unit}`.length + existing.count;
    const tableScore = `${row.name}${row.unit}`.length + row.count;
    if (tableScore > existingScore) {
      merged.set(key, row);
    }
  });

  return Array.from(merged.values())
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"))
    .map((row) => `${row.name} ${formatNumber(row.quantity)}${row.unit}`.trim())
    .join("\n");
}

function tagIssues(issues, imageName, level) {
  return (issues || []).map((text) => ({
    level,
    text: `${imageName}: ${text}`,
  }));
}

async function recognizeWholeImageRawText(file, index, total) {
  byId("ocrStatus").textContent = `正在识别标准名称第 ${index + 1}/${total} 张`;
  const imageData = await preprocessImage(file);
  const result = await window.Tesseract.recognize(imageData, "chi_sim+eng", {
    logger: (message) => updateOcrProgress(message, index, total),
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: "6",
    user_defined_dpi: "300",
  });
  return normalizeOcrText(result.data.text);
}

async function recognizeWholeImageCargo(file, rules, index, total) {
  byId("ocrStatus").textContent = `正在整图识别第 ${index + 1}/${total} 张`;
  const imageData = await preprocessImage(file);
  const result = await window.Tesseract.recognize(imageData, "chi_sim+eng", {
    logger: (message) => updateOcrProgress(message, index, total),
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: "6",
    user_defined_dpi: "300",
  });
  return extractCargoTextFromOcr(result.data.text, rules);
}

async function recognizeStructuredCargoTable(file, rules, index, total) {
  let worker = null;
  try {
    if (!window.Tesseract?.createWorker) return "";

    const canvas = await loadImageCanvas(file);
    const table = detectSpreadsheetTable(canvas);
    if (!table || table.rows.length < 2) return "";

    byId("ocrStatus").textContent = `?????????? ${index + 1}/${total} ?`;
    worker = await window.Tesseract.createWorker("chi_sim+eng", 1, {
      logger: (message) => updateOcrProgress(message, index, total),
    });

    const rows = [];
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
      const row = table.rows[rowIndex];
      byId("ocrStatus").textContent = `? ${index + 1}/${total} ????? ${rowIndex + 1}/${table.rows.length} ?`;

      const productText = await recognizeCell(worker, makeCellDataUrl(canvas, row.product, "product"), "product");
      const quantityText = await recognizeCell(worker, makeCellDataUrl(canvas, row.quantity, "quantity"), "quantity");
      const unitText = row.unit ? await recognizeCell(worker, makeCellDataUrl(canvas, row.unit, "unit"), "unit") : "";

      const product = normalizeTableProductName(productText, rules);
      const normalizedQuantityText = normalizeOcrNumberText(quantityText);
      const quantity = parseNumber((normalizedQuantityText.match(/\d+(?:\.\d+)?/) || [""])[0]);
      const unit = normalizeUnitFromOcr(unitText);

      if (product && Number.isFinite(quantity) && quantity > 0) {
        rows.push(`${product} ${formatNumber(quantity)}${unit}`);
      }
    }

    let tableWideText = "";
    if (table.summaryBounds) {
      const tableText = await recognizeCell(
        worker,
        makeCellDataUrl(canvas, table.summaryBounds, "table"),
        "table",
      );
      tableWideText = extractCargoTextFromOcr(tableText, rules);
    }

    await worker.terminate();
    worker = null;
    return mergeRecognizedCargoTexts(unique(rows).join("\n"), tableWideText, rules);
  } catch (error) {
    console.warn("?????????????", error);
    if (worker) await worker.terminate();
    return "";
  }
}

async function recognizeCell(worker, imageData, kind) {
  const baseParameters = {
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: kind === "unit" ? "10" : kind === "table" ? "6" : "7",
    user_defined_dpi: "300",
    tessedit_char_whitelist: "",
  };

  if (kind === "quantity") {
    baseParameters.tessedit_char_whitelist = "0123456789.";
  }

  await worker.setParameters(baseParameters);
  const result = await worker.recognize(imageData);
  return normalizeOcrText(result.data.text);
}

function updateOcrProgress(message, index, total) {
  if (!message) return;
  const percent = Number.isFinite(message.progress) ? `${Math.round(message.progress * 100)}%` : "";
  const status = message.status ? `${message.status} ${percent}`.trim() : percent;
  byId("ocrStatus").textContent = `第 ${index + 1}/${total} 张：${status}`;
}

function setOcrBusy(isBusy) {
  byId("ocrBtn").disabled = isBusy;
  byId("importStandardsBtn").disabled = isBusy;
  byId("chooseImageBtn").disabled = isBusy;
  byId("ocrProvider").disabled = isBusy;
  byId("ocrApiKey").disabled = isBusy;
  byId("ocrStrictMode").disabled = isBusy;
  byId("ocrDoubleCheck").disabled = isBusy;
  byId("ocrBtn").textContent = isBusy ? "识别中..." : "识别图片";
}

function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const maxWidth = 2400;
      const minReadableWidth = 1400;
      const upscale = image.width < minReadableWidth ? minReadableWidth / image.width : 1;
      const scale = Math.min(upscale, maxWidth / image.width, 2);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let index = 0; index < data.length; index += 4) {
        const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
        const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.25 + 128));
        data[index] = boosted;
        data[index + 1] = boosted;
        data[index + 2] = boosted;
      }
      context.putImageData(imageData, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };

    image.src = url;
  });
}

function loadImageCanvas(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };

    image.src = url;
  });
}

function detectSpreadsheetTable(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const redBands = detectRedBands(imageData, canvas.width, canvas.height);
  if (redBands.length < 2) return null;

  const pair = chooseTableRedPair(redBands, canvas.width);
  if (!pair) return null;

  const [header, total] = pair;
  const xMin = Math.max(0, Math.min(header.xMin, total.xMin));
  const xMax = Math.min(canvas.width - 1, Math.max(header.xMax, total.xMax));
  const bodyTop = Math.min(canvas.height - 1, header.end + 1);
  const bodyBottom = Math.max(bodyTop, total.start - 1);
  const verticalLines = detectDarkVerticalLines(imageData, canvas.width, xMin, xMax, bodyTop, bodyBottom);
  const horizontalLines = detectDarkHorizontalLines(imageData, canvas.width, xMin, xMax, bodyTop, bodyBottom);

  const columnBounds = buildTableColumnBounds(xMin, xMax, verticalLines);
  if (!columnBounds) return null;

  const rowBounds = buildTableRowBounds(header.end, total.start, horizontalLines);
  const rows = rowBounds.map((bounds) => ({
    product: {
      x0: columnBounds.product.x0,
      y0: bounds.y0,
      x1: columnBounds.product.x1,
      y1: bounds.y1,
    },
    unit: columnBounds.unit
      ? {
          x0: columnBounds.unit.x0,
          y0: bounds.y0,
          x1: columnBounds.unit.x1,
          y1: bounds.y1,
        }
      : null,
    quantity: {
      x0: columnBounds.quantity.x0,
      y0: bounds.y0,
      x1: columnBounds.quantity.x1,
      y1: bounds.y1,
    },
  }));

  return {
    rows,
    summaryBounds: {
      x0: xMin,
      y0: bodyTop,
      x1: xMax,
      y1: bodyBottom,
    },
  };
}

function detectRedBands(imageData, width, height) {
  const bands = [];
  let inBand = false;
  let start = 0;
  let xMin = width - 1;
  let xMax = 0;

  for (let y = 0; y < height; y += 1) {
    let redCount = 0;
    let rowXMin = width - 1;
    let rowXMax = 0;

    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = imageData.data[index] > 180 && imageData.data[index + 1] < 90 && imageData.data[index + 2] < 90;
      if (red) {
        redCount += 1;
        rowXMin = Math.min(rowXMin, x);
        rowXMax = Math.max(rowXMax, x);
      }
    }

    const isRedBand = redCount / width > 0.15;
    if (isRedBand && !inBand) {
      start = y;
      xMin = rowXMin;
      xMax = rowXMax;
      inBand = true;
    } else if (isRedBand && inBand) {
      xMin = Math.min(xMin, rowXMin);
      xMax = Math.max(xMax, rowXMax);
    } else if (!isRedBand && inBand) {
      if (y - start >= 5) bands.push({ start, end: y - 1, xMin, xMax });
      inBand = false;
    }
  }

  if (inBand && height - start >= 5) bands.push({ start, end: height - 1, xMin, xMax });
  return bands;
}

function chooseTableRedPair(redBands, width) {
  const pairs = [];
  for (let index = 0; index < redBands.length - 1; index += 1) {
    const header = redBands[index];
    const total = redBands[index + 1];
    const height = total.end - header.start;
    if (height < 60) continue;
    pairs.push([header, total]);
  }

  if (!pairs.length) return null;

  const summaryPair = pairs
    .filter(([header]) => header.xMin > width * 0.12)
    .sort((a, b) => b[0].start - a[0].start)[0];

  return summaryPair || pairs[pairs.length - 1];
}

function detectDarkVerticalLines(imageData, width, xMin, xMax, yMin, yMax) {
  const lines = [];
  const height = Math.max(1, yMax - yMin + 1);

  for (let x = xMin; x <= xMax; x += 1) {
    let darkCount = 0;
    for (let y = yMin; y <= yMax; y += 1) {
      if (isDarkPixel(imageData, width, x, y)) darkCount += 1;
    }
    if (darkCount / height > 0.6) lines.push(x);
  }

  return groupLineCenters(lines);
}

function detectDarkHorizontalLines(imageData, width, xMin, xMax, yMin, yMax) {
  const lines = [];
  const tableWidth = Math.max(1, xMax - xMin + 1);

  for (let y = yMin; y <= yMax; y += 1) {
    let darkCount = 0;
    for (let x = xMin; x <= xMax; x += 1) {
      if (isDarkPixel(imageData, width, x, y)) darkCount += 1;
    }
    if (darkCount / tableWidth > 0.6) lines.push(y);
  }

  return groupLineCenters(lines);
}

function groupLineCenters(values) {
  if (!values.length) return [];
  const groups = [[values[0]]];

  values.slice(1).forEach((value) => {
    const group = groups[groups.length - 1];
    if (value > group[group.length - 1] + 1) groups.push([value]);
    else group.push(value);
  });

  return groups.map((group) => Math.round((group[0] + group[group.length - 1]) / 2));
}

function isDarkPixel(imageData, width, x, y) {
  const index = (y * width + x) * 4;
  return imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2] < 200;
}

function buildTableColumnBounds(xMin, xMax, verticalLines) {
  const lines = verticalLines.filter((line) => line > xMin + 10 && line < xMax - 10).sort((a, b) => a - b);
  if (lines.length >= 3) {
    return {
      product: { x0: lines[0] + 3, x1: lines[1] - 3 },
      unit: { x0: lines[1] + 3, x1: lines[2] - 3 },
      quantity: { x0: lines[2] + 3, x1: xMax - 3 },
    };
  }

  if (lines.length >= 2) {
    return {
      product: { x0: xMin + 3, x1: lines[0] - 3 },
      unit: { x0: lines[0] + 3, x1: lines[1] - 3 },
      quantity: { x0: lines[1] + 3, x1: xMax - 3 },
    };
  }

  return null;
}

function buildTableRowBounds(headerEnd, totalStart, horizontalLines) {
  const lines = uniqueNumbers([headerEnd, ...horizontalLines, totalStart])
    .filter((line) => line >= headerEnd && line <= totalStart)
    .sort((a, b) => a - b);

  const rows = [];
  for (let index = 0; index < lines.length - 1; index += 1) {
    const y0 = lines[index] + 2;
    const y1 = lines[index + 1] - 2;
    if (y1 - y0 >= 12) rows.push({ y0, y1 });
  }

  return rows;
}

function makeCellDataUrl(sourceCanvas, bounds, kind) {
  const scale = kind === "quantity" ? 7 : 5;
  const padding = kind === "product" ? 14 : 10;
  const sourceWidth = Math.max(1, bounds.x1 - bounds.x0 + 1);
  const sourceHeight = Math.max(1, bounds.y1 - bounds.y0 + 1);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = Math.round(sourceWidth * scale + padding * 2);
  canvas.height = Math.round(sourceHeight * scale + padding * 2);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    sourceCanvas,
    bounds.x0,
    bounds.y0,
    sourceWidth,
    sourceHeight,
    padding,
    padding,
    sourceWidth * scale,
    sourceHeight * scale,
  );

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const threshold = kind === "product" ? 185 : 170;
    const value = gray < threshold ? 0 : 255;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }
  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}

function normalizeOcrText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[|｜]/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeTableProductName(text, rules) {
  const cleaned = String(text || "")
    .replace(/商品名称|规格名称|汇总|购买数量|数量|合计|总计/g, "")
    .replace(/[|｜]/g, " ")
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9（）()【】\[\]·\-]/g, "")
    .replace(/\[/g, "【")
    .replace(/\]/g, "】")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .trim();

  if (!cleaned || /^\d+$/.test(cleaned)) return "";

  const direct = standardizeName(cleaned, rules);
  if (direct && normalizeText(direct) !== normalizeText(cleaned)) return direct;

  const fuzzy = findClosestKnownProduct(cleaned, rules);
  return fuzzy || cleaned;
}

function normalizeUnitFromOcr(text) {
  const normalized = String(text || "")
    .replace(/\s+/g, "")
    .replace(/[干千]/g, "斤")
    .trim();

  const match = UNITS.find((unit) => normalized.includes(unit));
  if (match) return normalizeUnit(match);
  if (/斤|厂/.test(normalized)) return "斤";
  if (/箱/.test(normalized)) return "箱";
  if (/件/.test(normalized)) return "件";
  return "";
}

function extractStandardNamesFromOcr(rawText) {
  const lines = String(rawText || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const names = [];

  lines.forEach((line) => {
    const cells = splitOcrNameLine(line);
    cells.forEach((cell) => {
      const name = normalizeStandardNameCell(cell);
      if (name) names.push(name);
    });
  });

  return unique(names);
}

function splitOcrNameLine(line) {
  const fromTabs = String(line || "")
    .split(/\t+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (fromTabs.length > 1) return fromTabs;

  const fromSpaces = String(line || "")
    .split(/\s{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (fromSpaces.length > 1) return fromSpaces;

  const packed = String(line || "").match(/[A-Za-z\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5（）()【】\[\]·\-]{0,40}(?=\s*\d)/g);
  if (packed?.length) return packed;

  return [String(line || "").trim()].filter(Boolean);
}

function normalizeStandardNameCell(cell) {
  let text = String(cell || "")
    .replace(/[|｜]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[（(]{2,}/g, "（")
    .replace(/[）)]{2,}/g, "）")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .replace(/[_]/g, "")
    .trim();

  if (!text) return "";
  if (looksLikeNameHeader(text)) return "";
  if (!/[\u4e00-\u9fa5A-Za-z]/.test(text)) return "";

  text = text
    .replace(/^[-—_]+(?=[\u4e00-\u9fa5A-Za-z])/g, "")
    .replace(/^(\d+)\s*[-—]\s*(\d+)\s*(kg|KG|斤|公斤|千克)/, "劈半猪头（$1-$2$3）")
    .replace(/^\s*\d+[.)、]\s*/, "")
    .replace(/（?今日特价）?/g, "")
    .replace(/(\d+(?:\.\d+)?)\s*元.*$/i, "")
    .replace(/\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?)*\s*$/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9（）【】\[\]·\-]/g, "")
    .replace(/豬/g, "猪")
    .replace(/嘌/g, "膘")
    .replace(/^号肉$/, "一号肉")
    .trim();

  if (!text) return "";
  if (looksLikeNameHeader(text)) return "";
  if (/^(kg|KG|斤|公斤|千克|元|价格|单价)$/i.test(text)) return "";
  if (/^\d+(?:\.\d+)?$/.test(text)) return "";
  if (text.length < 2 && !/^[A-Za-z][\u4e00-\u9fa5]$/.test(text)) return "";

  return text;
}

function looksLikeNameHeader(text) {
  const normalized = normalizeText(text);
  if (!normalized) return true;
  if (/^0+$/.test(normalized)) return true;
  return STANDARD_NAME_STOP_WORDS.some((word) => normalized.includes(normalizeText(word)));
}

function importStandardNames(names) {
  const cleaned = unique(
    (names || [])
      .map((name) => normalizeStandardNameCell(name))
      .filter(Boolean),
  );

  let addedRules = 0;
  let addedSpecs = 0;

  cleaned.forEach((standard) => {
    const existingRule = state.rules.find((rule) => normalizeText(rule.standard) === normalizeText(standard));
    if (!existingRule) {
      state.rules.push({ standard, aliases: [] });
      addedRules += 1;
    }

    const existingSpec = state.specs.find((spec) => normalizeText(spec.standard) === normalizeText(standard));
    if (!existingSpec) {
      state.specs.push({
        standard,
        pieceWeightKg: null,
        pieceUnits: ["件"],
      });
      addedSpecs += 1;
    }
  });

  state.rules.sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));
  state.specs.sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));

  return {
    names: cleaned,
    addedRules,
    addedSpecs,
  };
}

function extractCargoTextFromOcr(text, rules) {
  const normalized = normalizeOcrText(normalizeOcrNumberText(text));
  const parsed = parseMessages(normalized, rules).filter((entry) =>
    isKnownProductName(entry.originalName, entry.standardName, rules),
  );
  const rows = parsed.map((entry) => cargoEntryToLine(entry));

  return unique(rows).join("\n");
}

function isKnownProductName(originalName, standardName, rules) {
  const original = normalizeText(originalName);
  const standard = normalizeText(standardName);

  return getKnownProducts(rules).some((item) => {
    if (!item.aliasKey) return false;
    return (
      original === item.aliasKey ||
      standard === normalizeText(item.standard) ||
      original.includes(item.aliasKey)
    );
  });
}

function cargoEntryToLine(entry) {
  const unit = entry.unit ? entry.unit : "";
  return `${entry.standardName || entry.originalName} ${formatNumber(entry.quantity)}${unit}`.trim();
}

function findClosestKnownProduct(name, rules) {
  const target = normalizeText(name);
  if (target.length < 3) return "";

  let best = { score: 0, standard: "" };
  getKnownProducts(rules).forEach((item) => {
    if (!item.aliasKey) return;
    const score = textSimilarity(target, item.aliasKey);
    if (score > best.score) best = { score, standard: item.standard };
  });

  return best.score >= 0.66 ? best.standard : "";
}

function textSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) {
    return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  }

  const distance = levenshteinDistance(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function levenshteinDistance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
}

function moveOcrTextToRaw(mode) {
  const text = state.ocrText.trim();
  if (!text) {
    showToast("还没有图片文字");
    return;
  }

  if (mode === "replace") {
    state.rawText = text;
  } else {
    state.rawText = [state.rawText.trim(), text].filter(Boolean).join("\n");
  }

  byId("rawText").value = state.rawText;
  saveState();
  showToast(mode === "replace" ? "已替换到消息框" : "已追加到消息框");
}

function onDetailsInput(event) {
  const input = event.target.closest("input[data-field]");
  if (!input) return;

  const row = input.closest("tr[data-id]");
  const entry = state.entries.find((item) => item.id === row.dataset.id);
  if (!entry) return;

  const field = input.dataset.field;
  if (field === "quantity") {
    entry.quantity = parseNumber(input.value);
  } else {
    entry[field] = input.value.trim();
    if (field === "originalName" && !entry.standardName) {
      entry.standardName = standardizeName(entry.originalName, state.rules);
    }
  }

  saveState();
  renderSummary();
  renderCompare();
}

function onDetailsClick(event) {
  const button = event.target.closest("button[data-action='delete-entry']");
  if (!button) return;

  const row = button.closest("tr[data-id]");
  state.entries = state.entries.filter((entry) => entry.id !== row.dataset.id);
  saveState();
  renderAll();
}

function onRulesInput(event) {
  const input = event.target.closest("input[data-rule-field]");
  if (!input) return;

  const row = input.closest("tr[data-index]");
  const rule = state.rules[Number(row.dataset.index)];
  if (!rule) return;

  if (input.dataset.ruleField === "standard") {
    rule.standard = input.value.trim();
  } else {
    rule.aliases = splitAliases(input.value);
  }

  saveState();
  renderSummary();
  renderCompare();
}

function onRulesClick(event) {
  const button = event.target.closest("button[data-action='delete-rule']");
  if (!button) return;

  const row = button.closest("tr[data-index]");
  state.rules.splice(Number(row.dataset.index), 1);
  saveState();
  renderAll();
}

function onSpecClick(event) {
  const button = event.target.closest("button[data-action='delete-spec']");
  if (!button) return;

  const row = button.closest("tr[data-index]");
  state.specs.splice(Number(row.dataset.index), 1);
  saveState();
  renderAll();
}

function addAliasRule() {
  const standardInput = byId("newStandard");
  const aliasesInput = byId("newAliases");
  const standard = standardInput.value.trim();
  const aliases = splitAliases(aliasesInput.value);

  if (!standard) {
    showToast("请填写最终汇总名");
    return;
  }

  const existing = state.rules.find((rule) => normalizeText(rule.standard) === normalizeText(standard));
  if (existing) {
    existing.aliases = unique([...existing.aliases, ...aliases]);
  } else {
    state.rules.push({ standard, aliases });
  }

  standardInput.value = "";
  aliasesInput.value = "";
  saveState();
  renderAll();
  showToast("已添加别名规则");
}

function importRulesBulk() {
  const input = byId("bulkRules");
  const text = String(input?.value || "").trim();
  if (!text) {
    showToast("请先粘贴批量规则");
    return;
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let imported = 0;

  lines.forEach((line) => {
    const parts = line.split(/\s*(?:\||=>|->|=|：|:)\s*/);
    if (parts.length < 2) return;

    const standard = String(parts[0] || "").trim();
    const aliases = splitAliases(parts.slice(1).join(","));
    if (!standard) return;

    const existing = state.rules.find((rule) => normalizeText(rule.standard) === normalizeText(standard));
    if (existing) {
      existing.aliases = unique([...(existing.aliases || []), ...aliases]);
    } else {
      state.rules.push({ standard, aliases });
    }
    imported += 1;
  });

  saveState();
  renderAll();
  showToast(imported ? `已导入 ${imported} 条规则` : "没有识别到可导入规则");
}

function looksLikeTemplateText(text) {
  const value = String(text || "");
  return value.includes("标准名称") || value.includes("std,kg,unit,aliases");
}

function decodeBase64TemplateText(base64) {
  const cleaned = String(base64 || "").replace(/\s+/g, "");
  if (!cleaned) return "";

  if (typeof atob === "function") {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (looksLikeTemplateText(utf8)) return utf8;

    try {
      const gb = new TextDecoder("gb18030", { fatal: false }).decode(bytes);
      if (looksLikeTemplateText(gb)) return gb;
      return gb || utf8;
    } catch {
      return utf8;
    }
  }

  if (typeof Buffer !== "undefined") {
    const utf8 = Buffer.from(cleaned, "base64").toString("utf8");
    return utf8;
  }

  return "";
}

function getBuiltinTemplateRows() {
  if (builtinTemplateRowsCache) return builtinTemplateRowsCache;
  const csvText = decodeBase64TemplateText(BUILTIN_TEMPLATE_CSV_BASE64);
  builtinTemplateRowsCache = parseTemplateCsvRows(csvText);
  return builtinTemplateRowsCache;
}

function getActiveTemplateContext() {
  const customRows = parseTemplateCsvRows(state.templateCsv || "");
  if (customRows.length) {
    return {
      rows: customRows,
      source: "custom",
      version: state.templateVersion || `custom-template-v1`,
    };
  }
  return {
    rows: getBuiltinTemplateRows(),
    source: "builtin",
    version: BUILTIN_TEMPLATE_VERSION,
  };
}

function applyTemplateRowsStrict(rows, options = {}) {
  const ruleMap = new Map();
  const specMap = new Map();
  const prevRuleCount = state.rules.length;
  const prevSpecCount = state.specs.length;

  rows.forEach((row) => {
    const standard = canonicalizeStandardName(row.standard);
    if (!standard || isLikelyMojibakeText(standard)) return;
    const key = normalizeText(standard);
    if (!key) return;

    const aliases = splitAliases(row.aliases)
      .map((item) => canonicalizeStandardName(item))
      .filter((item) => item && !isLikelyMojibakeText(item))
      .filter((item) => normalizeText(item) !== key);

    const existingRule = ruleMap.get(key);
    if (existingRule) {
      existingRule.aliases = unique([...(existingRule.aliases || []), ...aliases]);
    } else {
      ruleMap.set(key, { standard, aliases: unique(aliases) });
    }

    const pieceWeightKg =
      Number.isFinite(Number(row.kg)) && Number(row.kg) > 0 ? roundNumber(Number(row.kg)) : null;
    const pieceUnits = splitUnits(row.unit)
      .map((item) => normalizeUnit(item))
      .filter((item) => item);

    const existingSpec = specMap.get(key);
    if (existingSpec) {
      if (Number.isFinite(pieceWeightKg)) {
        existingSpec.pieceWeightKg = pieceWeightKg;
      }
      existingSpec.pieceUnits = unique([...(existingSpec.pieceUnits || []), ...pieceUnits]);
    } else {
      specMap.set(key, {
        standard,
        pieceWeightKg,
        pieceUnits: pieceUnits.length ? unique(pieceUnits) : ["件"],
      });
    }
  });

  const nextRules = Array.from(ruleMap.values()).sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));
  const nextSpecs = Array.from(specMap.values()).sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));

  const changed =
    JSON.stringify(state.rules) !== JSON.stringify(nextRules) ||
    JSON.stringify(state.specs) !== JSON.stringify(nextSpecs);

  state.rules = nextRules;
  state.specs = nextSpecs;

  if (options.templateVersion) {
    state.templateVersion = options.templateVersion;
  }

  return {
    changed,
    rowCount: rows.length,
    ruleCount: nextRules.length,
    specCount: nextSpecs.length,
    removedRuleCount: Math.max(prevRuleCount - nextRules.length, 0),
    removedSpecCount: Math.max(prevSpecCount - nextSpecs.length, 0),
  };
}

function restandardizeEntries() {
  state.entries = state.entries.map((entry) => ({
    ...entry,
    standardName: standardizeName(entry.originalName, state.rules),
  }));
  state.otherEntries = state.otherEntries.map((entry) => ({
    ...entry,
    standardName: standardizeName(entry.originalName, state.rules),
  }));
}

function keepOnlyTemplateData() {
  const template = getActiveTemplateContext();
  const strictResult = applyTemplateRowsStrict(template.rows, { templateVersion: template.version });
  const sanitizeResult = sanitizeMasterData();
  restandardizeEntries();
  return {
    changed: strictResult.changed || sanitizeResult.changed,
    rowCount: strictResult.rowCount,
    ruleCount: state.rules.length,
    specCount: state.specs.length,
    mergedRules: sanitizeResult.mergedRules,
    mergedSpecs: sanitizeResult.mergedSpecs,
    removedRuleGarbled: sanitizeResult.removedRuleGarbled,
    removedSpecGarbled: sanitizeResult.removedSpecGarbled,
  };
}

function applyTemplateRows(rows) {
  let addedRules = 0;
  let mergedAliases = 0;
  let addedSpecs = 0;
  let updatedSpecs = 0;

  rows.forEach((row) => {
    const standard = String(row.standard || "").trim();
    if (!standard) return;

    const aliases = splitAliases(row.aliases);
    const existingRule = state.rules.find((rule) => normalizeText(rule.standard) === normalizeText(standard));
    if (existingRule) {
      const before = existingRule.aliases.length;
      existingRule.aliases = unique([...(existingRule.aliases || []), ...aliases]);
      if (existingRule.aliases.length > before) mergedAliases += 1;
    } else {
      state.rules.push({ standard, aliases });
      addedRules += 1;
    }

    const changed = mergeSpecFromTemplate(standard, row.kg, row.unit);
    if (changed === "added") addedSpecs += 1;
    if (changed === "updated") updatedSpecs += 1;
  });

  const changed = addedRules > 0 || mergedAliases > 0 || addedSpecs > 0 || updatedSpecs > 0;
  return {
    changed,
    rowCount: rows.length,
    addedRules,
    mergedAliases,
    addedSpecs,
    updatedSpecs,
  };
}

function applyBuiltinTemplateData(force = false) {
  const alreadyApplied = state.templateVersion === BUILTIN_TEMPLATE_VERSION;
  if (alreadyApplied && !force) {
    return { changed: false, rowCount: getBuiltinTemplateRows().length, addedRules: 0, mergedAliases: 0, addedSpecs: 0, updatedSpecs: 0 };
  }

  const rows = getBuiltinTemplateRows();
  if (!rows.length) {
    return { changed: false, rowCount: 0, addedRules: 0, mergedAliases: 0, addedSpecs: 0, updatedSpecs: 0 };
  }

  const result = applyTemplateRows(rows);
  const versionChanged = state.templateVersion !== BUILTIN_TEMPLATE_VERSION;
  state.templateVersion = BUILTIN_TEMPLATE_VERSION;
  return {
    ...result,
    changed: result.changed || versionChanged,
  };
}

async function importTemplateCsv(file) {
  if (!file) return;

  try {
    const text = await decodeCsvFile(file);
    const rows = parseTemplateCsvRows(text);
    if (!rows.length) {
      showToast("模板里没有识别到可导入内容");
      return;
    }

    state.templateCsv = text;
    const result = applyTemplateRowsStrict(rows, { templateVersion: `custom-template-${Date.now()}` });
    restandardizeEntries();
    saveState();
    renderAll();
    showToast(`模板已全量替换：规则 ${result.ruleCount}，规格 ${result.specCount}`);
  } catch (error) {
    console.error(error);
    showToast("模板 CSV 解析失败，请检查文件格式");
  }
}

async function decodeCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (utf8.includes("标准名称") || utf8.includes("std,kg,unit,aliases")) return utf8;

  try {
    const gb18030 = new TextDecoder("gb18030", { fatal: false }).decode(buffer);
    if (gb18030.includes("标准名称") || gb18030.includes("std,kg,unit,aliases")) return gb18030;
    return gb18030;
  } catch {
    return utf8;
  }
}

function parseTemplateCsvRows(text) {
  const rows = parseCsvTable(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((item) => normalizeText(item));
  const standardIndex = pickHeaderIndex(header, ["标准名称", "std"]);
  if (standardIndex < 0) return [];

  const kgIndex = pickHeaderIndex(header, ["每件公斤", "公斤", "kg"]);
  const unitIndex = pickHeaderIndex(header, ["按件单位", "单位", "unit"]);
  const aliasIndex = pickHeaderIndex(header, ["别名", "aliases", "alias"]);

  return rows
    .slice(1)
    .map((cols) => ({
      standard: cols[standardIndex] || "",
      kg: parseTemplateKg(kgIndex >= 0 ? cols[kgIndex] : ""),
      unit: String(unitIndex >= 0 ? cols[unitIndex] || "" : "").trim(),
      aliases: String(aliasIndex >= 0 ? cols[aliasIndex] || "" : "").trim(),
    }))
    .filter((row) => row.standard.trim());
}

function parseCsvTable(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  const source = String(text || "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"') {
      if (inQuotes && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows
    .map((cols) => cols.map((item) => String(item || "").trim()))
    .filter((cols) => cols.some((item) => item));
}

function pickHeaderIndex(normalizedHeader, candidates) {
  const keys = candidates.map((item) => normalizeText(item));
  return normalizedHeader.findIndex((cell) => keys.some((key) => cell.includes(key)));
}

function parseTemplateKg(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) return null;
  return roundNumber(number);
}

function mergeSpecFromTemplate(standard, kg, unitText) {
  const key = normalizeText(standard);
  const units = splitUnits(unitText);
  const hasKg = Number.isFinite(kg) && kg > 0;

  const existing = state.specs.find((spec) => normalizeText(spec.standard) === key);
  if (!existing) {
    state.specs.push({
      standard,
      pieceWeightKg: hasKg ? kg : null,
      pieceUnits: units.length ? units : ["件"],
    });
    return "added";
  }

  let changed = false;
  if (hasKg && existing.pieceWeightKg !== kg) {
    existing.pieceWeightKg = kg;
    changed = true;
  }

  if (units.length) {
    const merged = unique([...(existing.pieceUnits || []), ...units]);
    const before = JSON.stringify(existing.pieceUnits || []);
    const after = JSON.stringify(merged);
    if (before !== after) {
      existing.pieceUnits = merged;
      changed = true;
    }
  }

  return changed ? "updated" : "none";
}

function addSpecRule() {
  const standard = String(byId("specStandard").value || "").trim();
  const pieceWeightKg = Number(byId("specWeightKg").value);
  const pieceUnits = splitUnits(byId("specUnits").value);

  if (!standard) {
    showToast("请填写标准名");
    return;
  }

  const spec = {
    standard,
    pieceWeightKg: Number.isFinite(pieceWeightKg) && pieceWeightKg > 0 ? roundNumber(pieceWeightKg) : null,
    pieceUnits: pieceUnits.length ? pieceUnits : ["件"],
  };
  upsertSpec(spec);
  byId("specStandard").value = "";
  byId("specWeightKg").value = "";
  byId("specUnits").value = "";
  saveState();
  renderAll();
  showToast("已添加标准重量");
}

function importSpecsBulk() {
  const text = String(byId("bulkSpecs").value || "").trim();
  if (!text) {
    showToast("请先粘贴批量规格");
    return;
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let imported = 0;

  lines.forEach((line) => {
    const parts = line.split(/\s*(?:\||=>|->|=|：|:)\s*/);
    if (!parts.length) return;

    const standard = String(parts[0] || "").trim();
    if (!standard) return;

    let pieceWeightKg = null;
    let units = [];
    if (parts.length >= 2) {
      const second = String(parts[1] || "").trim();
      const maybeWeight = Number(second);
      if (Number.isFinite(maybeWeight) && maybeWeight > 0) {
        pieceWeightKg = roundNumber(maybeWeight);
        units = parts.length >= 3 ? splitUnits(parts[2]) : [];
      } else if (/^重量$|公斤|kg|斤/i.test(second)) {
        pieceWeightKg = null;
        units = splitUnits(parts.slice(2).join(","));
      } else {
        units = splitUnits(parts.slice(1).join(","));
      }
    }

    upsertSpec({
      standard,
      pieceWeightKg,
      pieceUnits: units.length ? units : ["件"],
    });
    imported += 1;
  });

  saveState();
  renderAll();
  showToast(imported ? `已导入 ${imported} 条规格` : "没有识别到可导入规格");
}

function upsertSpec(spec) {
  const existing = state.specs.find((item) => normalizeText(item.standard) === normalizeText(spec.standard));
  if (existing) {
    existing.pieceWeightKg = spec.pieceWeightKg;
    existing.pieceUnits = unique(spec.pieceUnits || []);
  } else {
    state.specs.push({
      standard: spec.standard,
      pieceWeightKg: spec.pieceWeightKg,
      pieceUnits: unique(spec.pieceUnits || ["件"]),
    });
  }
}

function mergeDefaultRules(savedRules) {
  const merged = Array.isArray(savedRules) && savedRules.length ? structuredClone(savedRules) : [];

  DEFAULT_RULES.forEach((defaultRule) => {
    const existing = merged.find((rule) => normalizeText(rule.standard) === normalizeText(defaultRule.standard));
    if (existing) {
      existing.aliases = unique([...(existing.aliases || []), ...(defaultRule.aliases || [])]);
    } else {
      merged.push(structuredClone(defaultRule));
    }
  });

  return merged;
}

function exportDetails() {
  const rows = state.entries.map((entry) => ({
    日期: state.workDate,
    发送人: entry.sender,
    原始消息: entry.source,
    货物原称: entry.originalName,
    汇总货物名: entry.standardName,
    数量: formatNumber(entry.quantity),
    单位: entry.unit,
    备注: entry.note || "",
  }));

  downloadCSV(`货物明细-${state.workDate}.csv`, rows);
}

function exportSummary() {
  const rows = summarizeEntries(state.entries, state.specs).map((row) => ({
    日期: state.workDate,
    汇总货物名: row.name,
    数量: formatNumber(row.quantity),
    单位: row.unit,
    折算公斤: formatOptionalNumber(row.kgEquivalent),
    明细条数: row.count,
    原称列表: row.originals.join("、"),
  }));

  downloadCSV(`货物汇总-${state.workDate}.csv`, rows);
}

function exportCompare() {
  const rows = compareEntries(state.entries, state.otherEntries).map((row) => ({
    日期: state.workDate,
    状态: statusLabel(row.status),
    货物: row.name,
    我方数量: formatOptionalNumber(row.mineQuantity),
    对方数量: formatOptionalNumber(row.otherQuantity),
    单位: row.unit,
    差额: formatOptionalNumber(row.diff),
  }));

  downloadCSV(`货物核对-${state.workDate}.csv`, rows);
}

async function copyDailyReport() {
  const rows = summarizeEntries(state.entries);
  if (!rows.length) {
    showToast("暂无可复制的汇总");
    return;
  }

  const text = [`${state.workDate} 货物汇总`, ...rows.map((row) => `${row.name}：${formatNumber(row.quantity)}${row.unit}`)].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showToast("日报已复制");
  } catch {
    showToast("复制失败，可导出汇总");
  }
}

async function copyCompareReport() {
  const rows = compareEntries(state.entries, state.otherEntries);
  const problemRows = rows.filter((row) => row.status !== "matched");

  if (!rows.length) {
    showToast("暂无核对结果");
    return;
  }

  const reportRows = problemRows.length ? problemRows : rows;
  const header = problemRows.length ? `${state.workDate} 货物核对差异` : `${state.workDate} 货物核对全部一致`;
  const text = [
    header,
    ...reportRows.map(
      (row) =>
        `${statusLabel(row.status)}｜${row.name}｜我方 ${formatOptionalNumber(row.mineQuantity)}${row.unit}｜对方 ${formatOptionalNumber(row.otherQuantity)}${row.unit}｜差额 ${formatOptionalNumber(row.diff)}${row.unit}`,
    ),
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showToast(problemRows.length ? "差异已复制" : "一致结果已复制");
  } catch {
    showToast("复制失败，可导出核对");
  }
}

function downloadCSV(filename, rows) {
  if (!rows.length) {
    showToast("暂无可导出的数据");
    return;
  }

  const headers = Object.keys(rows[0]);
  const body = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((line) => line.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\ufeff", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function splitAliases(value) {
  return unique(
    String(value || "")
      .split(/[,，、;；\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function splitUnits(value) {
  return unique(
    String(value || "")
      .split(/[,，、;；\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function canonicalizeStandardName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .replace(/\[/g, "【")
    .replace(/\]/g, "】");
}

function isLikelyMojibakeText(value) {
  const text = String(value || "");
  if (!text) return false;
  if (text.includes("�")) return true;

  const hit = MOJIBAKE_TOKENS.reduce((count, token) => count + (text.includes(token) ? 1 : 0), 0);
  if (hit >= 2) return true;

  if (hit >= 1) {
    const hasCommonWords = /[猪牛羊鸡鸭鹅肉骨肠肚心肝腰肺脊肘排花腿皮头尾蹄肋筋板腱棒条肋碎油脑胃]/.test(text);
    if (!hasCommonWords) return true;
  }

  return false;
}

function sanitizeMasterData() {
  const ruleMap = new Map();
  let removedRuleGarbled = 0;
  let mergedRules = 0;

  state.rules.forEach((rule) => {
    const standard = canonicalizeStandardName(rule.standard);
    if (!standard) return;
    if (isLikelyMojibakeText(standard)) {
      removedRuleGarbled += 1;
      return;
    }

    const aliases = splitAliases(Array.isArray(rule.aliases) ? rule.aliases.join(",") : String(rule.aliases || ""))
      .map((item) => canonicalizeStandardName(item))
      .filter((item) => item && !isLikelyMojibakeText(item))
      .filter((item) => normalizeText(item) !== normalizeText(standard));
    const key = normalizeText(standard);
    const existing = ruleMap.get(key);

    if (existing) {
      existing.aliases = unique([...(existing.aliases || []), ...aliases]);
      mergedRules += 1;
    } else {
      ruleMap.set(key, { standard, aliases: unique(aliases) });
    }
  });

  const specMap = new Map();
  let removedSpecGarbled = 0;
  let mergedSpecs = 0;

  state.specs.forEach((spec) => {
    const standard = canonicalizeStandardName(spec.standard);
    if (!standard) return;
    if (isLikelyMojibakeText(standard)) {
      removedSpecGarbled += 1;
      return;
    }

    const pieceWeightKg =
      Number.isFinite(Number(spec.pieceWeightKg)) && Number(spec.pieceWeightKg) > 0
        ? roundNumber(Number(spec.pieceWeightKg))
        : null;
    const pieceUnits = splitUnits(Array.isArray(spec.pieceUnits) ? spec.pieceUnits.join(",") : String(spec.pieceUnits || ""))
      .map((unit) => normalizeUnit(unit))
      .filter((unit) => unit);
    const key = normalizeText(standard);
    const existing = specMap.get(key);

    if (existing) {
      if (!Number.isFinite(existing.pieceWeightKg) && Number.isFinite(pieceWeightKg)) {
        existing.pieceWeightKg = pieceWeightKg;
      }
      existing.pieceUnits = unique([...(existing.pieceUnits || []), ...pieceUnits]);
      mergedSpecs += 1;
    } else {
      specMap.set(key, {
        standard,
        pieceWeightKg,
        pieceUnits: pieceUnits.length ? unique(pieceUnits) : ["件"],
      });
    }
  });

  const nextRules = Array.from(ruleMap.values()).sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));
  const nextSpecs = Array.from(specMap.values()).sort((a, b) => a.standard.localeCompare(b.standard, "zh-Hans-CN"));

  const changed =
    JSON.stringify(state.rules) !== JSON.stringify(nextRules) ||
    JSON.stringify(state.specs) !== JSON.stringify(nextSpecs);

  state.rules = nextRules;
  state.specs = nextSpecs;

  return {
    changed,
    removedRuleGarbled,
    removedSpecGarbled,
    mergedRules,
    mergedSpecs,
  };
}

function startsWithQuantity(value) {
  const regex = new RegExp(`^\\s*(?:${NUMBER_PATTERN})\\s*(?:${UNIT_PATTERN})`);
  return regex.test(value);
}

function isValidItem(name, quantity, unit) {
  const normalizedName = normalizeText(name);
  return Boolean(
    name &&
      unit &&
      normalizedName &&
      !/^\d+$/.test(normalizedName) &&
      !/^\d/.test(String(name).trim()) &&
      Number.isFinite(quantity) &&
      quantity > 0,
  );
}

function normalizeUnit(unit) {
  const value = String(unit || "")
    .replace(/\s+/g, "")
    .trim();
  if (/^(kg|kgs?|KG|KGS|千克|公斤)$/.test(value)) return "公斤";
  if (/^(g|G|克)$/.test(value)) return "克";
  if (/^(市斤|斤)$/.test(value)) return "斤";
  if (/^(個|个|只)$/.test(value)) return "件";
  return value;
}

function normalizeOcrNumberText(value) {
  return String(value || "")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[〇○]/g, "零")
    .replace(/(?<=\d)[oO](?=\d|$)/g, "0")
    .replace(/(?<=\d)[lI丨|｜](?=\d|$)/g, "1")
    .replace(/[﹒．]/g, ".")
    .replace(/[，,](?=\d{3}\b)/g, "");
}

function parseNumber(value) {
  const text = normalizeOcrNumberText(value).trim();
  if (/^\d/.test(text)) return Number(text);
  return parseChineseNumber(text);
}

function parseChineseNumber(text) {
  const digits = {
    零: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  const units = { 十: 10, 百: 100, 千: 1000, 万: 10000 };
  let total = 0;
  let section = 0;
  let number = 0;

  for (const char of text) {
    if (Object.prototype.hasOwnProperty.call(digits, char)) {
      number = digits[char];
    } else if (char === "万") {
      section = (section + number) * units[char];
      total += section;
      section = 0;
      number = 0;
    } else if (Object.prototype.hasOwnProperty.call(units, char)) {
      section += (number || 1) * units[char];
      number = 0;
    }
  }

  return total + section + number;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, "");
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalizeText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueNumbers(values) {
  return Array.from(new Set(values.filter((value) => Number.isFinite(value))));
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(roundNumber(number));
}

function formatOptionalNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  return formatNumber(value);
}

function roundNumber(value) {
  return Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeEntries(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id: item.id ? String(item.id) : makeId(Date.now(), "entry", index),
      sender: String(item.sender || ""),
      time: String(item.time || ""),
      source: String(item.source || ""),
      originalName: String(item.originalName || ""),
      standardName: String(item.standardName || item.originalName || ""),
      quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0,
      unit: String(item.unit || ""),
      note: String(item.note || ""),
    }));
}

function normalizeRules(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      standard: String(item.standard || "").trim(),
      aliases: splitAliases(Array.isArray(item.aliases) ? item.aliases.join(",") : String(item.aliases || "")),
    }))
    .filter((rule) => rule.standard);
}

function normalizeSpecs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      standard: String(item.standard || "").trim(),
      pieceWeightKg:
        Number.isFinite(Number(item.pieceWeightKg)) && Number(item.pieceWeightKg) > 0
          ? roundNumber(Number(item.pieceWeightKg))
          : null,
      pieceUnits: splitUnits(Array.isArray(item.pieceUnits) ? item.pieceUnits.join(",") : String(item.pieceUnits || "")),
    }))
    .map((spec) => ({
      ...spec,
      pieceUnits: spec.pieceUnits.length ? spec.pieceUnits : ["件"],
    }))
    .filter((spec) => spec.standard);
}

function todayISO() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function byId(id) {
  return document.getElementById(id);
}

function makeId(...parts) {
  return parts.join("-").replace(/[^a-zA-Z0-9_.-]/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

let toastTimer;
function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}

if (typeof module !== "undefined") {
  module.exports = {
    DEFAULT_RULES,
    parseMessages,
    summarizeEntries,
    compareEntries,
    standardizeName,
    normalizeTableProductName,
    normalizeStandardNameCell,
    extractStandardNamesFromOcr,
    extractCargoTextFromOcr,
    parseChineseNumber,
  };
}
