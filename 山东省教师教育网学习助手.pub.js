// ==UserScript==
// @name         【效率版】山东省教师教育网学习助手（免费体验3分钟学完全部）
// @namespace    https://yxjc.qlteacher.com/
// @version      1.4
// @author       柠檬真酸
// @icon         https://huaweicloudobs.ahjxjy.cn/895789f9086469785b846d30c0ed95f9.png
// @description  山东省教师教育网（*.qlteacher.com）学习助手：勾选课程自动学习，免费1门课 / Pro30天
// @antifeature  payment  免费体验1门课，升级Pro不限
// @antifeature  membership  需云端授权
// @match        *://*.qlteacher.com/*
// @match        *://qlteacher.com/*
// @connect      *.qlteacher.com
// @connect      qlteacher.com
// @connect      *.ahzsksw.cn
// @connect      ahzsksw.cn
// @connect      card.wlxy.live
// @connect      oa48.ahzsksw.cn
// @connect      huaweicloudobs.ahjxjy.cn
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @tag          山东省教师教育网
// @tag          齐鲁教师
// @tag          教师培训
// @tag          学习辅助
// @license      All Rights Reserved
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_VERSION = (() => {
    try {
      return String(GM_info?.script?.version || "1.4");
    } catch (_) {
      return "1.4";
    }
  })();

  if (window.__qltYxjcHelper) return;
  window.__qltYxjcHelper = true;

  const PRODUCT_NAME = "\u5c71\u4e1c\u7701\u6559\u5e08\u6559\u80b2\u7f51\u5b66\u4e60\u52a9\u624b";
  const PRO_DAYS = 30;
  const PANEL_POS_KEY = "qlt_panel_pos_v1";
  const PANEL_COLLAPSED_KEY = "qlt_panel_collapsed_v1";
  const LOG_KEY = "qlt_run_log_v1";
  const QUEUE_KEY = "qlt_lesson_queue_v1";
  const CLOUD_TOKEN_KEY = "qlt_cloud_token_v1";
  const CLOUD_LEASE_CACHE_KEY = "qlt_cloud_lease_cache_v1";
  const CLOUD_LAST_STATE_KEY = "qlt_cloud_last_state_v1";
  const SPEED_KEY = "qlt_speed_mode_v1";
  const AUTH_TOKEN_KEY = "qlt_captured_bearer_v1";
  const PANEL_LOGO_URL =
    "https://huaweicloudobs.ahjxjy.cn/895789f9086469785b846d30c0ed95f9.png";
  const QQ_GROUP_NUMBER = "903117129";
  const QQ_GROUP_LINK =
    "https://qun.qq.com/universal-share/share?ac=1&authKey=rxdL6YIJ0%2FxOEemjLqTGULvl5aAfJIVQcIvkvnwvmL%2FAmpFZnSafajYHgSXMUXvx&busi_data=eyJncm91cENvZGUiOiI5MDMxMTcxMjkiLCJ0b2tlbiI6IlB2dkFGSm5XRXBrSEhtQVFTUGQzdVNZakhNWDNMbW1kODA2enpoMi9obDh4SWp0YzBDODNFaGtwRU44Z0hyU0siLCJ1aW4iOiIxMjU0MzE1MTQifQ%3D%3D&data=9oyJixSPcigCQW-saV5eXlcMwV9C6J36XySx-rDHwVwNlofvRmd2ze5sLwFtHTbYbG4nAWIUrI0qftC6aTX9xg&svctype=4&tempid=h5_group_info";
  const DEFAULT_CLOUD_API_BASE = "https://oa48.ahzsksw.cn";
  const PRO_BUY_URL = "https://card.wlxy.live/details/0D25E97D";
  const PANEL_NOTICE_FALLBACK = "\u5c71\u4e1c\u7701\u6559\u5e08\u6559\u80b2\u7f51\u5b66\u4e60\u52a9\u624b\uff1a\u52fe\u9009\u8bfe\u7a0b\u540e\u5f00\u59cb\u5b66\u4e60";
  const FREE_CHAPTER_LIMIT_DEFAULT = 1;
  const FREE_STUDIED_KEY = "qlt_free_studied_lessons_v1";

  const ACCOUNT_API = "https://account.qlteacher.com";
  const YXJC_API = "https://yxjc.qlteacher.com";
  const PLAYER_API = "https://player.qlteacher.com";

  const SPEED_MODES = {
    sec: { id: "sec", label: "\u8d85\u901f\u6a21\u5f0f(\u79d2)" },
    eff: { id: "eff", label: "\u6548\u7387\u6a21\u5f0f" },
    oneone: { id: "oneone", label: "1:1\u5e38\u901f\u6a21\u5f0f" },
  };

  const state = {
    user: null,
    projectId: "",
    projectName: "",
    projects: [],
    lessons: [],
    selectedIds: loadQueue(),
    running: false,
    stopFlag: false,
    lastAction: "\u5c31\u7eea",
    currentLessonName: "-",
    currentTitle: "-",
    progressPct: 0,
    queueDone: 0,
    queueTotal: 0,
    logs: [],
    bearer: String(GM_getValue?.(AUTH_TOKEN_KEY, "") || localStorage.getItem(AUTH_TOKEN_KEY) || "").trim(),
    cloudApiBase: DEFAULT_CLOUD_API_BASE,
    cloudToken: String(localStorage.getItem(CLOUD_TOKEN_KEY) || "").trim(),
    cloudTier: String(localStorage.getItem(CLOUD_TOKEN_KEY) || "").trim() ? "unknown" : "free",
    cloudLease: "",
    cloudLeaseExp: 0,
    cloudLeaseLuid: "",
    cloudProExpireAt: 0,
    cloudRevoked: false,
    freeVideoLimit: FREE_CHAPTER_LIMIT_DEFAULT,
    freeUsedVideos: 0,
    freeAllowExam: true,
    panelNoticePath: "/api/qlt/panel-notice",
    remotePanelNotice: "",
    proBuyUrl: PRO_BUY_URL,
    speedMode: (() => {
      const raw = String(localStorage.getItem(SPEED_KEY) || "sec").trim();
      if (raw === "normal" || raw === "fine" || raw === "platform" || raw === "oneone")
        return "oneone";
      if (raw === "soft" || raw === "eff") return "eff";
      if (
        raw === "sec" ||
        raw === "turbo" ||
        raw === "hyper" ||
        raw === "burst" ||
        /^(x2|x3|x5)$/.test(raw)
      ) {
        return "sec";
      }
      return SPEED_MODES[raw] ? raw : "sec";
    })(),
    authReady: false,
    lastLoggedPctBucket: -1,
    previewByLesson: {},
    _previewLoadSeq: 0,
  };

  try {
    state.logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]") || [];
  } catch (_) {
    state.logs = [];
  }

  const lastState = readCloudLastState();
  if (lastState) {
    const t = String(lastState.tier || "").toLowerCase();
    if (t && t !== "offline" && t !== "unknown") state.cloudTier = lastState.tier;
    if (t !== "offline" && lastState.freeUsedVideos >= 0) {
      state.freeUsedVideos = Number(lastState.freeUsedVideos) || 0;
    }
  }
  if (String(state.cloudTier || "").toLowerCase() === "offline") {
    state.cloudTier = "free";
  }
  state.freeVideoLimit = FREE_CHAPTER_LIMIT_DEFAULT;
  try {
    localStorage.removeItem(CLOUD_LEASE_CACHE_KEY);
  } catch (_) {}

  function loadQueue() {
    try {
      const arr = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch (_) {
      return [];
    }
  }

  function saveQueue(ids) {
    state.selectedIds = [...new Set((ids || []).map(String))];
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(state.selectedIds));
    } catch (_) {}
  }

  function pruneSelectedIds() {
    if (!state.lessons.length) return false;
    const valid = new Set(state.lessons.map((l) => String(l.id)));
    const next = state.selectedIds.map(String).filter((id) => valid.has(id));
    if (next.length === state.selectedIds.length) return false;
    saveQueue(next);
    return true;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function log(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    state.logs.unshift(line);
    if (state.logs.length > 50) state.logs.length = 50;
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(state.logs.slice(0, 30)));
    } catch (_) {}
    state.lastAction = msg;
    const el = document.getElementById("qlt-run-log");
    if (el) {
      el.innerHTML = state.logs
        .slice(0, 30)
        .map((s) => `<div class="qlt-log-row">${escapeHtml(s)}</div>`)
        .join("");
    }
  }

  function clearRunLog() {
    state.logs = [];
    try {
      localStorage.removeItem(LOG_KEY);
    } catch (_) {}
    const el = document.getElementById("qlt-run-log");
    if (el) el.innerHTML = "";
  }

  function logProgress(_title, pct) {
    updateProgressUi(pct);
  }

  function shouldLogCloudLine(line) {
    const s = String(line || "").trim();
    if (!s) return false;
    const ban =
      /\u95f4\u9694|\u6b65\u957f|\u6548\u7387|\u8d85\u901f|\u5feb\u5237|\u964d\u901f|\u9884\u70ed|\u5c3e\u6bb5|PUT|-1|actToken|duration|\u8865\u9f50|\u8fd8\u503a|\u4e00\u6b21\u8865\u9f50|\u8d85\u6807|\u5f15\u64ce|tick|burst|report|resync|token\u6821\u9a8c|\u540c\u6b65\u5b66\u4e60\u8fdb\u5ea6|\u5f00\u59cb\u6d4b\u8bc4|\u5b66\u4e60\u4e2d/i;
    if (ban.test(s)) return false;
    if (/^\u5df2\u5b8c\u6210|^\u6d4b\u8bd5\u5b8c\u6210|^\u8003\u8bd5\u5b8c\u6210/.test(s)) return false;
    if (/^\u5f00\u59cb\u8003\u8bd5|^\u6682\u65e0\u5f85\u8003|^\u5f85\u8003\s|\u8bfe\u65f6\u5df2\u8bb0\u5f55/.test(s)) return false;
    if (/^\u8fdb\u5165\u8bfe\u7a0b|^\u961f\u5217|^\u6388\u6743|^\u514d\u8d39\u4f53\u9a8c|^\u5df2\u505c\u6b62|^\u4e91\u7aef/.test(s)) return true;
    return false;
  }

  function logSessionDoneOnce(title) {
    const key = String(title || "").trim();
    if (!key) return;
    if (!state._doneLogKeys) state._doneLogKeys = Object.create(null);
    if (state._doneLogKeys[key]) return;
    state._doneLogKeys[key] = 1;
    log(`\u5df2\u5b8c\u6210\uff1a${key}`);
  }

  function currentSpeedMode() {
    return SPEED_MODES[state.speedMode] || SPEED_MODES.sec;
  }

  function sessionGapMs() {
    const id = currentSpeedMode().id;
    if (id === "sec") return 800;
    if (id === "eff") return 2000;
    return 5000;
  }

  function resolveWaitMs(rawMs) {
    let ms = Math.max(150, Number(rawMs) || 1000);
    const id = currentSpeedMode().id;
    if (id === "sec") ms = Math.min(ms, 500);
    else if (id === "eff") ms = Math.min(ms, 2500);
    return ms;
  }

  function isTimeMismatchError(err) {
    const msg = String(err?.message || err || "");
    return /\u65f6\u95f4\u4e0d\u7b26|\u4e0d\u8981\u5411\u540e\u62d6\u52a8|\u8fdb\u5ea6\u4fdd\u5b58\u5931\u8d25|\u5b9e\u9645\u7ecf\u8fc7\u65f6\u95f4/i.test(msg);
  }

  function isNeedFinishSignalError(err) {
    const msg = String(err?.message || err || "");
    return /\u8d85\u8fc7\u5b66\u4e60\u6807\u51c6|\u72b6\u6001\u6ca1\u6709\u5b8c\u6210|\u6ca1\u6709\u5b8c\u6210/i.test(msg);
  }

  function readCookie(name) {
    const m = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
    );
    return m ? decodeURIComponent(m[1]) : "";
  }

  function clearCloudLeaseLocal(reason) {
    state.cloudLease = "";
    state.cloudLeaseExp = 0;
    state.cloudLeaseLuid = "";
    writeCloudLeaseCache("", 0);
    if (reason) console.debug("[\u9f50\u9c81\u7814\u4fee] clear lease", reason);
  }

  function getLearningUserId() {
    const uid = readCookie("qlt_uid") || state.user?.id || "";
    const luid = String(uid || "").trim();
    if (luid && state.cloudLeaseLuid && state.cloudLeaseLuid !== luid) {
      clearCloudLeaseLocal("account_switched");
    }
    return luid;
  }

  function detectProjectId() {
    const path = String(location.pathname || "");
    let m = path.match(/\/(?:project|learning)\/([^/]+)/i);
    if (m) return m[1];
    m = String(location.href).match(/[?&]projectId=([^&]+)/i);
    if (m) return decodeURIComponent(m[1]);
    const sel = document.getElementById("qlt-project-select");
    if (sel && sel.value) return String(sel.value);
    if (state.projectId) return state.projectId;
    try {
      const cached = localStorage.getItem("qlt_last_project_id");
      if (cached) return cached;
    } catch (_) {}
    return "";
  }

  function rememberProjectId(pid, name) {
    const id = String(pid || "").trim();
    if (!id) return;
    state.projectId = id;
    if (name) state.projectName = String(name);
    else {
      const hit = (state.projects || []).find((p) => String(p.id) === id);
      if (hit?.name) state.projectName = String(hit.name);
    }
    try {
      localStorage.setItem("qlt_last_project_id", id);
    } catch (_) {}
    syncProjectSelect();
  }

  function syncProjectSelect() {
    const sel = document.getElementById("qlt-project-select");
    if (!sel) return;
    const cur = state.projectId || "";
    const opts = (state.projects || [])
      .map((p) => {
        const id = String(p.id || "");
        const name = String(p.name || id);
        return `<option value="${escapeHtml(id)}"${
          id === cur ? " selected" : ""
        }>${escapeHtml(name)}</option>`;
      })
      .join("");
    sel.innerHTML =
      `<option value="">${
        state.projects.length ? "\u8bf7\u9009\u62e9\u7814\u4fee\u9879\u76ee" : "\u6682\u65e0\u9879\u76ee\uff0c\u5148\u70b9\u5237\u65b0"
      }</option>` + opts;
    if (cur) sel.value = cur;
  }

  function rememberBearer(token) {
    const t = String(token || "").replace(/^Bearer\s+/i, "").trim();
    if (!t || t.length < 20) return;
    if (state.bearer === t) return;
    const prev = state.bearer;
    state.bearer = t;
    state.authReady = true;
    if (prev && prev !== t) clearCloudLeaseLocal("bearer_changed");
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, t);
      if (typeof GM_setValue === "function") GM_setValue(AUTH_TOKEN_KEY, t);
    } catch (_) {}
  }

  function extractBearerFromHeaders(headers) {
    if (!headers) return "";
    try {
      if (typeof headers.get === "function") {
        return String(headers.get("Authorization") || headers.get("authorization") || "");
      }
      if (Array.isArray(headers)) {
        for (const pair of headers) {
          if (String(pair?.[0] || "").toLowerCase() === "authorization") {
            return String(pair[1] || "");
          }
        }
      }
      if (typeof headers === "object") {
        for (const k of Object.keys(headers)) {
          if (k.toLowerCase() === "authorization") return String(headers[k] || "");
        }
      }
    } catch (_) {}
    return "";
  }

  function hookAuthCapture() {
    try {
      const ofetch = window.fetch;
      if (typeof ofetch === "function" && !ofetch.__qltHooked) {
        const wrapped = function (input, init) {
          try {
            const h = init?.headers || (input && input.headers);
            const auth = extractBearerFromHeaders(h);
            if (/^Bearer\s+/i.test(auth)) rememberBearer(auth);
          } catch (_) {}
          return ofetch.apply(this, arguments);
        };
        wrapped.__qltHooked = true;
        window.fetch = wrapped;
      }
    } catch (_) {}

    try {
      const XO = XMLHttpRequest.prototype.open;
      const XS = XMLHttpRequest.prototype.setRequestHeader;
      if (!XO.__qltHooked) {
        XMLHttpRequest.prototype.open = function () {
          this.__qltHeaders = {};
          return XO.apply(this, arguments);
        };
        XMLHttpRequest.prototype.open.__qltHooked = true;
        XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
          try {
            this.__qltHeaders[String(k).toLowerCase()] = String(v);
            if (String(k).toLowerCase() === "authorization" && /^Bearer\s+/i.test(String(v))) {
              rememberBearer(v);
            }
          } catch (_) {}
          return XS.apply(this, arguments);
        };
      }
    } catch (_) {}

    try {
      for (const store of [localStorage, sessionStorage]) {
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          const val = String(store.getItem(key) || "");
          if (/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./.test(val)) {
            const m = val.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
            if (m) rememberBearer(m[0]);
          }
        }
      }
    } catch (_) {}
  }

  hookAuthCapture();

  function gmRequest(method, url, body, headers) {
    return new Promise((resolve, reject) => {
      const g =
        typeof GM_xmlhttpRequest === "function"
          ? GM_xmlhttpRequest
          : typeof GM !== "undefined" && GM.xmlHttpRequest
            ? GM.xmlHttpRequest.bind(GM)
            : null;
      if (!g) {
        fetch(url, {
          method,
          headers: headers || {},
          body: body == null ? undefined : body,
          credentials: "include",
        })
          .then(async (r) => {
            const text = await r.text();
            resolve({ status: r.status, text, headers: {} });
          })
          .catch(reject);
        return;
      }
      g({
        method,
        url,
        headers: headers || {},
        data: body == null ? undefined : body,
        anonymous: false,
        onload: (res) =>
          resolve({
            status: Number(res.status || 0),
            text: String(res.responseText || ""),
            headers: res.responseHeaders || "",
          }),
        onerror: () => reject(new Error("network_error")),
        ontimeout: () => reject(new Error("timeout")),
      });
    });
  }

  async function apiJson(base, path, method, bodyObj) {
    const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    };
    if (state.bearer) headers.Authorization = `Bearer ${state.bearer}`;
    const body =
      method === "GET" || method === "HEAD"
        ? null
        : bodyObj === undefined
          ? "{}"
          : JSON.stringify(bodyObj == null ? {} : bodyObj);
    const res = await gmRequest(method || "GET", url, body, headers);
    let data = null;
    const text = String(res.text || "").trim();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = { raw: text };
      }
    }
    return { status: res.status, data, text };
  }

  function assertOk(payload, tip) {
    const code = Number(payload?.data?.code);
    if (payload.status < 200 || payload.status >= 300) {
      throw new Error(tip || `http_${payload.status}`);
    }
    if (payload?.data && code && code !== 200) {
      throw new Error(String(payload.data.msg || payload.data.message || `code_${code}`));
    }
    return payload?.data?.data;
  }

  function getCloudApiBase() {
    return String(state.cloudApiBase || DEFAULT_CLOUD_API_BASE).replace(/\/$/, "");
  }

  function readCloudLeaseCache() {
    try {
      const raw = localStorage.getItem(CLOUD_LEASE_CACHE_KEY);
      const j = raw ? JSON.parse(raw) : null;
      if (!j || !j.lease) return null;
      return j;
    } catch (_) {
      return null;
    }
  }

  function writeCloudLeaseCache(lease, exp, extra) {
    try {
      if (!lease) {
        localStorage.removeItem(CLOUD_LEASE_CACHE_KEY);
        return;
      }
      localStorage.setItem(
        CLOUD_LEASE_CACHE_KEY,
        JSON.stringify(Object.assign({ lease, exp: Number(exp) || 0 }, extra || {}))
      );
    } catch (_) {}
  }

  function readCloudLastState() {
    try {
      const raw = localStorage.getItem(CLOUD_LAST_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeCloudLastState(partial) {
    try {
      const prev = readCloudLastState() || {};
      localStorage.setItem(
        CLOUD_LAST_STATE_KEY,
        JSON.stringify(Object.assign({}, prev, partial || {}, { at: Date.now() }))
      );
    } catch (_) {}
  }

  function formatLeaseExpireText(expSec) {
    const n = Number(expSec) || 0;
    if (!n) return "-";
    try {
      return new Date(n * 1000).toLocaleString();
    } catch (_) {
      return String(n);
    }
  }

  function formatCloudTierText(tier) {
    if (state.cloudRevoked) return "\u5df2\u7981\u7528";
    const t = String(tier || "").toLowerCase();
    if (t === "pro") return "Pro \u4f1a\u5458";
    if (t === "free") return "\u514d\u8d39\u4f53\u9a8c";
    if (t === "offline") return "\u672a\u8fde\u4e91\u7aef";
    if (t === "revoked") return "\u5df2\u7981\u7528";
    if (t === "unknown") return "\u672a\u6821\u9a8c";
    return tier ? String(tier) : "\u672a\u6821\u9a8c";
  }

  function updateCloudPanelUI() {
    const tierEl = document.querySelector("#qlt-cloud-tier");
    const freeEl = document.querySelector("#qlt-cloud-free");
    const freeLabelEl = document.querySelector("#qlt-cloud-free-label");
    const tokenInput = document.querySelector("#qlt-cloud-token");
    if (tierEl) {
      tierEl.textContent = formatCloudTierText(state.cloudTier);
      tierEl.style.color =
        state.cloudRevoked || String(state.cloudTier || "").toLowerCase() === "revoked"
          ? "#dc2626"
          : "#0f172a";
    }
    if (state.cloudRevoked) {
      if (freeLabelEl) freeLabelEl.textContent = "\u6388\u6743\u72b6\u6001";
      if (freeEl) freeEl.textContent = "Token \u5df2\u7981\u7528";
    } else if (String(state.cloudTier || "").toLowerCase() === "pro") {
      if (freeLabelEl) freeLabelEl.textContent = "Pro \u5230\u671f";
      if (freeEl)
        freeEl.textContent = formatLeaseExpireText(
          state.cloudProExpireAt || state.cloudLeaseExp
        );
    } else {
      if (freeLabelEl) freeLabelEl.textContent = "\u514d\u8d39\u4f53\u9a8c\u8bfe\u7a0b";
      if (freeEl)
        freeEl.textContent = `${state.freeUsedVideos}/${state.freeVideoLimit}`;
    }
    if (tokenInput && tokenInput !== document.activeElement) {
      tokenInput.value = state.cloudToken || "";
    }
  }

  async function cloudRq(path, method, payload) {
    const base = getCloudApiBase();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const luid = getLearningUserId();
    if (luid) headers["x-learning-user-id"] = luid;
    if (state.cloudToken) headers.Authorization = `Bearer ${state.cloudToken}`;
    let reqPayload = payload;
    if (reqPayload && typeof reqPayload === "object") {
      reqPayload = Object.assign({}, reqPayload);
      if (path !== "/api/qlt/lease" && state.cloudLease && reqPayload.lease == null) {
        reqPayload.lease = state.cloudLease;
      }
    }
    const body = reqPayload == null ? null : JSON.stringify(reqPayload);
    const res = await gmRequest(method || "POST", url, body, headers);
    const text = String(res.text || "").trim();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = { raw: text };
      }
    }
    if (res.status < 200 || res.status >= 300) {
      const err = new Error(
        String(data.detail || data.message || data.code || `http_${res.status}`)
      );
      err.status = res.status;
      err.data = data;
      if (data && typeof data === "object") syncCloudQuotaFromResponse(data);
      throw err;
    }
    return data;
  }

  async function ensureLease(forceRefresh) {
    const luid = getLearningUserId();
    if (!luid) throw new Error("\u8bf7\u5148\u767b\u5f55\u9f50\u9c81\u6559\u5e08\u8d26\u53f7");
    const now = Math.floor(Date.now() / 1000);

    if (
      !forceRefresh &&
      state.cloudLease &&
      state.cloudLeaseLuid === luid &&
      state.cloudLeaseExp - now > 60
    ) {
      return true;
    }

    if (!forceRefresh) {
      const cached = readCloudLeaseCache();
      if (cached && cached.luid === luid && cached.exp - now > 60) {
        state.cloudLease = cached.lease;
        state.cloudLeaseExp = cached.exp;
        state.cloudLeaseLuid = luid;
        state.cloudProExpireAt = Number(cached.proExpireAt || 0);
        if (cached.tier) state.cloudTier = cached.tier;
        if (cached.freeVideoLimit > 0) state.freeVideoLimit = cached.freeVideoLimit;
        if (cached.freeUsedVideos >= 0) {
          state.freeUsedVideos = Math.max(state.freeUsedVideos, cached.freeUsedVideos);
        }
        updateCloudPanelUI();
        return true;
      }
    }

    try {
      const data = await cloudRq("/api/qlt/lease", "POST", {
        learning_user_id: luid,
        name: state.user?.name || "",
      });
      state.cloudRevoked = false;
      const lease = String(data.lease || "");
      const exp = Number(data.lease_expires_at || data.exp || now + 3600);
      const tier =
        String(data.tier || "").trim() || (state.cloudToken ? "pro" : "free");
      const proExpireAt = Number(data.pro_expires_at || data.proExpireAt || 0);
      state.cloudLease = lease;
      state.cloudLeaseExp = exp;
      state.cloudLeaseLuid = luid;
      state.cloudProExpireAt = proExpireAt;
      state.cloudTier = tier;
      state.freeVideoLimit =
        Number(
          data.free_chapter_limit ??
            data.free_video_limit ??
            data.freeVideoLimit ??
            state.freeVideoLimit ??
            FREE_CHAPTER_LIMIT_DEFAULT
        ) || FREE_CHAPTER_LIMIT_DEFAULT;
      state.freeUsedVideos = Number(
        data.free_used_chapters ?? data.free_used_videos ?? data.freeUsedVideos ?? 0
      );
      writeCloudLeaseCache(lease, exp, {
        luid,
        tier,
        freeVideoLimit: state.freeVideoLimit,
        freeUsedVideos: state.freeUsedVideos,
        proExpireAt,
      });
      writeCloudLastState({
        luid,
        tier,
        freeVideoLimit: state.freeVideoLimit,
        freeUsedVideos: state.freeUsedVideos,
      });
      updateCloudPanelUI();
      return !!lease;
    } catch (e) {
      const em = String(e?.message || e);
      if (/(revoked|invalid token|expired)/i.test(em)) {
        state.cloudRevoked = true;
        state.cloudTier = "revoked";
        updateCloudPanelUI();
        throw e;
      }
      if (!state.cloudToken) {
        log("\u4e91\u7aef\u4e0d\u53ef\u7528");
      }
      throw e;
    }
  }

  function syncCloudQuotaFromResponse(data) {
    if (!data || typeof data !== "object") return;
    if (data.tier) state.cloudTier = String(data.tier);
    const lim =
      data.free_chapter_limit ?? data.free_video_limit ?? data.freeVideoLimit ?? data.limit;
    const used =
      data.free_used_chapters ?? data.free_used_videos ?? data.freeUsedVideos ?? data.used;
    if (lim != null) state.freeVideoLimit = Number(lim) || FREE_CHAPTER_LIMIT_DEFAULT;
    if (used != null) state.freeUsedVideos = Number(used);
    const fa =
      data.freeAllowExam ?? data.free_allow_exam ?? data.freeCanExam ?? data.free_can_exam;
    if (fa != null) state.freeAllowExam = fa === true || fa === 1 || fa === "1";
    writeCloudLastState({
      tier: state.cloudTier,
      freeVideoLimit: state.freeVideoLimit,
      freeUsedVideos: state.freeUsedVideos,
    });
    updateCloudPanelUI();
  }

  function notifyQuotaExhausted(msg) {
    log(String(msg || "\u514d\u8d39\u4f53\u9a8c\u5df2\u7528\u5b8c\uff0c\u8bf7\u5347\u7ea7 Pro"));
    try {
      switchPanelTab("settings");
    } catch (_) {}
    openProModal();
  }

  function markProgressComplete() {
    state.progressPct = 100;
    updateProgressUi(100);
  }

  async function cloudVerifyToken() {
    if (!state.cloudToken) return true;
    const url = `${getCloudApiBase()}/api/license/verify`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${state.cloudToken}`,
    };
    const luid = getLearningUserId();
    if (luid) headers["x-learning-user-id"] = luid;
    const res = await gmRequest("GET", url, null, headers);
    const text = String(res.text || "").trim();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_) {}
    }
    if (res.status < 200 || res.status >= 300 || data.ok === false) {
      throw new Error(String(data.message || data.detail || "\u6388\u6743\u65e0\u6548\u8bf7\u68c0\u67e5 Token"));
    }
    return true;
  }

  async function ensureCloudReady() {
    if (!state.user) {
      log("\u8bf7\u5148\u767b\u5f55");
      return false;
    }
    try {
      if (state.cloudToken) await cloudVerifyToken();
      await ensureLease(false);
    } catch (err) {
      const msg = String(err?.message || err);
      if (/token|\u6388\u6743|invalid|expired|revoked/i.test(msg)) {
        log("\u6388\u6743\u65e0\u6548\u8bf7\u68c0\u67e5 Token");
      } else {
        log("\u4e91\u7aef\u4e0d\u53ef\u7528");
      }
      console.debug("[\u9f50\u9c81\u7814\u4fee] cloud", err);
      return false;
    }
    const tier = String(state.cloudTier || "").toLowerCase();
    if (tier === "pro") return true;
    if (tier === "free" || tier === "unknown") {
      if (Number(state.freeUsedVideos) >= Number(state.freeVideoLimit)) {
        notifyQuotaExhausted();
        return false;
      }
      return true;
    }
    log("\u6388\u6743\u65e0\u6548\u8bf7\u68c0\u67e5 Token");
    return false;
  }

  function canStudyNextFreeLesson() {
    if (state.cloudRevoked) return false;
    const tier = String(state.cloudTier || "").toLowerCase();
    if (tier === "pro") return true;
    return Number(state.freeUsedVideos) < Number(state.freeVideoLimit);
  }

  function loadFreeStudiedMap() {
    try {
      return JSON.parse(localStorage.getItem(FREE_STUDIED_KEY) || "{}") || {};
    } catch (_) {
      return {};
    }
  }

  function rememberFreeStudiedLesson(lessonId) {
    const id = String(lessonId || "").trim();
    const luid = String(getLearningUserId() || "").trim() || "_";
    if (!id) return;
    const map = loadFreeStudiedMap();
    const arr = Array.isArray(map[luid]) ? map[luid].map(String) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      map[luid] = arr;
      try {
        localStorage.setItem(FREE_STUDIED_KEY, JSON.stringify(map));
      } catch (_) {}
    }
  }

  function listRememberedFreeLessons() {
    const luid = String(getLearningUserId() || "").trim() || "_";
    const map = loadFreeStudiedMap();
    return Array.isArray(map[luid]) ? map[luid].map(String).filter(Boolean) : [];
  }

  async function consumeFreeLesson(lesson, opts) {
    const tier = String(state.cloudTier || "").toLowerCase();
    if (tier === "pro") return { ok: true, skipped: true };
    const quiet = !!(opts && opts.quiet);
    const lessonId = String(lesson?.id || "").trim();
    const before = Number(state.freeUsedVideos || 0);
    try {
      await ensureLease(false);
      const data = await cloudRq("/api/qlt/lesson/consume", "POST", {
        lease: state.cloudLease,
        lesson_id: lessonId,
        course_id: String(lesson?.courseId || ""),
      });
      syncCloudQuotaFromResponse(data);
      if (lessonId) rememberFreeStudiedLesson(lessonId);
      const after = Number(state.freeUsedVideos || 0);
      if (!quiet && after > before) {
        log(`\u514d\u8d39\u4f53\u9a8c\u5df2\u8ba1\u5165 ${after}/${state.freeVideoLimit}`);
      }
      updateCloudPanelUI();
      return { ok: true, used: after };
    } catch (e) {
      const msg = String(e?.message || e);
      if (/quota|exhausted|403/i.test(msg)) {
        syncCloudQuotaFromResponse(e?.data || e?.payload || {});
        if (Number(state.freeUsedVideos) < Number(state.freeVideoLimit)) {
          state.freeUsedVideos = Number(state.freeVideoLimit) || 1;
          updateCloudPanelUI();
        }
        return { ok: false, quota: true, msg };
      }
      console.debug("[\u9f50\u9c81\u7814\u4fee] consume", e);
      if (!quiet) log(`\u514d\u8d39\u989d\u5ea6\u540c\u6b65\u5931\u8d25\uff1a${msg.slice(0, 80)}`);
      return { ok: false, msg };
    }
  }

  async function backfillFreeConsumes() {
    if (String(state.cloudTier || "").toLowerCase() === "pro") return;
    const ids = listRememberedFreeLessons();
    for (const id of ids) {
      const les =
        state.lessons.find((l) => String(l.id) === String(id)) || { id };
      const r = await consumeFreeLesson(les, { quiet: true });
      if (r.quota) break;
    }
    updateCloudPanelUI();
  }

  async function fetchPanelNotice() {
    try {
      const url = `${getCloudApiBase()}${state.panelNoticePath}`;
      const res = await gmRequest("GET", url, null, {});
      if (res.status >= 200 && res.status < 300) {
        state.remotePanelNotice =
          String(res.text || "").trim() || PANEL_NOTICE_FALLBACK;
        const el = document.querySelector("#qlt-ann-text");
        if (el) el.textContent = state.remotePanelNotice;
      }
    } catch (_) {}
  }

  async function waitForBearer(timeoutMs) {
    const deadline = Date.now() + (timeoutMs || 8000);
    while (Date.now() < deadline) {
      if (state.bearer) return state.bearer;
      hookAuthCapture();
      await sleep(300);
    }
    return state.bearer;
  }

  async function refreshUser() {
    await waitForBearer(5000);
    if (!state.bearer) throw new Error("\u672a\u6355\u83b7\u5230\u767b\u5f55 Token\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u6216\u70b9\u5f00\u4efb\u610f\u8bfe\u7a0b\u540e\u518d\u8bd5");
    const payload = await apiJson(ACCOUNT_API, "/api/me", "GET");
    const data = assertOk(payload, "\u83b7\u53d6\u7528\u6237\u4fe1\u606f\u5931\u8d25");
    state.user = data || null;
    updateUserUI();
    return state.user;
  }

  function flattenLessons(topicList) {
    const out = [];
    const seen = new Set();
    for (const topic of topicList || []) {
      const topicName = String(topic?.name || "\u4e13\u9898");
      const lessons = Array.isArray(topic?.lessons) ? topic.lessons : [];
      for (const les of lessons) {
        const id = String(les?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const st = les?.lessonLearnStatus || {};
        out.push({
          id,
          name: String(les?.name || id),
          topicName,
          topicId: String(topic?.id || ""),
          courseId: String(les?.courseId || ""),
          mustLearn: !!les?.mustLearn,
          learnHour: Number(les?.learnHour || 0),
          allowLearn: les?.allowLearn !== false,
          status: st.status == null || st.status === "" ? -1 : Number(st.status),
          lastLearnActId: st.lastLearnActId || null,
          raw: les,
        });
      }
    }
    return out;
  }

  function setLessonStatusLocal(lessonId, status) {
    const id = String(lessonId || "");
    if (!id) return;
    const les = state.lessons.find((l) => String(l.id) === id);
    if (!les) return;
    const next = Number(status);
    if (Number(les.status) === next) {
      renderLessonList();
      return;
    }
    les.status = next;
    renderLessonList();
    updateQueueSummary();
  }

  async function loadProjects() {
    await waitForBearer(5000);
    if (!state.bearer) throw new Error("\u672a\u6355\u83b7\u5230\u767b\u5f55 Token\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u540e\u518d\u8bd5");
    const payload = await apiJson(
      YXJC_API,
      "/api/training-project/training-projects/progress/my?clean=0",
      "GET"
    );
    let list = payload?.data;
    if (list && !Array.isArray(list) && Array.isArray(list.data)) list = list.data;
    if (!Array.isArray(list)) {
      if (payload?.data?.code === 200 && Array.isArray(payload.data.data)) {
        list = payload.data.data;
      } else if (Array.isArray(payload?.data?.data)) {
        list = payload.data.data;
      } else {
        list = [];
      }
    }
    if (!list.length && Array.isArray(payload?.data) === false) {
      try {
        const raw = JSON.parse(payload.text || "null");
        if (Array.isArray(raw)) list = raw;
      } catch (_) {}
    }
    state.projects = (list || [])
      .map((p) => ({
        id: String(p?.id || ""),
        name: String(p?.name || p?.id || ""),
        status: Number(p?.status || 0),
        raw: p,
      }))
      .filter((p) => p.id);
    syncProjectSelect();
    return state.projects;
  }

  async function resolveProjectId() {
    let pid = detectProjectId();
    if (!state.projects.length) {
      try {
        await loadProjects();
      } catch (_) {}
    }
    if (!pid && state.projects.length === 1) {
      pid = state.projects[0].id;
    }
    if (!pid && state.projects.length > 1) {
      try {
        const cached = localStorage.getItem("qlt_last_project_id");
        if (cached && state.projects.some((p) => p.id === cached)) pid = cached;
      } catch (_) {}
    }
    return String(pid || "").trim();
  }

  async function loadLessons(opts) {
    const quiet = !!(opts && opts.quiet);
    await refreshUser();
    const projects = await loadProjects();
    const pid = await resolveProjectId();
    if (!pid) {
      syncProjectSelect();
      state.lessons = [];
      renderLessonList();
      if (!projects.length) {
        throw new Error("\u672a\u627e\u5230\u7814\u4fee\u9879\u76ee\uff0c\u8bf7\u786e\u8ba4\u5df2\u62a5\u540d\u5e76\u767b\u5f55");
      }
      throw new Error("\u8bf7\u5148\u5728\u9762\u677f\u4e2d\u9009\u62e9\u7814\u4fee\u9879\u76ee\uff08\u9996\u9875\u4e5f\u53ef\u9009\uff0c\u4e0d\u5fc5\u8fdb\u9879\u76ee\u9875\uff09");
    }
    rememberProjectId(pid);

    try {
      const proj = await apiJson(
        YXJC_API,
        `/api/training-project/training-projects/${encodeURIComponent(pid)}`,
        "GET"
      );
      const pdata = proj?.data?.data;
      if (pdata?.name) state.projectName = String(pdata.name);
    } catch (_) {}

    let payload = await apiJson(
      YXJC_API,
      `/api/lesson/lessons/my?projectId=${encodeURIComponent(pid)}`,
      "GET"
    );
    if (Number(payload?.data?.code) !== 200) {
      payload = await apiJson(
        YXJC_API,
        `/api//lesson/lessons/my?projectId=${encodeURIComponent(pid)}`,
        "GET"
      );
    }
    const list = assertOk(payload, "\u83b7\u53d6\u8bfe\u7a0b\u5217\u8868\u5931\u8d25");
    state.lessons = flattenLessons(Array.isArray(list) ? list : []);
    pruneSelectedIds();
    for (const k of Object.keys(state.previewByLesson || {})) {
      if (!state.selectedIds.map(String).includes(String(k))) {
        delete state.previewByLesson[k];
      }
    }
    renderLessonList();
    updateQueueSummary();
    renderChapterPreview();
    if (!quiet) {
      log(`\u5df2\u52a0\u8f7d ${state.lessons.length} \u95e8\u8bfe · ${state.projectName || pid}`);
    }
    return state.lessons;
  }

  async function refreshLessonListAfterStudy(preserveDoneIds) {
    const keep = new Set(
      (preserveDoneIds || []).map((x) => String(x || "")).filter(Boolean)
    );
    for (const les of state.lessons || []) {
      if (Number(les.status) === 1) keep.add(String(les.id));
    }
    try {
      await sleep(500);
      await loadLessons({ quiet: true });
    } catch (e) {
      console.debug("[\u9f50\u9c81\u7814\u4fee] refresh lessons", e);
    }
    let dirty = false;
    for (const id of keep) {
      const les = state.lessons.find((l) => String(l.id) === id);
      if (les && Number(les.status) !== 1) {
        les.status = 1;
        dirty = true;
      }
    }
    if (dirty) renderLessonList();
    updateQueueSummary();
    try {
      void refreshChapterPreview();
    } catch (_) {}
  }

  async function resolveLearningId(lessonId) {
    let payload = await apiJson(
      YXJC_API,
      `/api/lesson/learning/url?projectId=${encodeURIComponent(state.projectId)}&lessonId=${encodeURIComponent(lessonId)}`,
      "GET"
    );
    if (Number(payload?.data?.code) !== 200) {
      payload = await apiJson(
        YXJC_API,
        `/api//lesson/learning/url?projectId=${encodeURIComponent(state.projectId)}&lessonId=${encodeURIComponent(lessonId)}`,
        "GET"
      );
    }
    const url = assertOk(payload, "\u83b7\u53d6\u5b66\u4e60\u5730\u5740\u5931\u8d25");
    const m = String(url || "").match(/\/learning\/([A-Za-z0-9]+)/);
    if (!m) throw new Error("\u5b66\u4e60\u5730\u5740\u65e0\u6cd5\u89e3\u6790 learningId");
    return m[1];
  }

  async function fetchCourse(learningId) {
    const payload = await apiJson(
      PLAYER_API,
      `/api/learning/${encodeURIComponent(learningId)}/course`,
      "GET"
    );
    return assertOk(payload, "\u83b7\u53d6\u8bfe\u4ef6\u76ee\u5f55\u5931\u8d25");
  }

  async function fetchActivity(learningId, activityId) {
    const payload = await apiJson(
      PLAYER_API,
      `/api/learning/${encodeURIComponent(learningId)}/activity/${encodeURIComponent(activityId)}`,
      "GET"
    );
    return assertOk(payload, "\u83b7\u53d6\u6d3b\u52a8\u8be6\u60c5\u5931\u8d25");
  }

  async function putDuration(learningId, sessionType, activityId, actToken, seconds) {
    const type = String(sessionType || "video").toLowerCase();
    const path = `/api/learning/${encodeURIComponent(learningId)}/duration/${encodeURIComponent(type)}/${encodeURIComponent(activityId)}/${encodeURIComponent(actToken)}/${encodeURIComponent(String(seconds))}?_ignore_error=true`;
    const payload = await apiJson(PLAYER_API, path, "PUT", {});
    const code = Number(payload?.data?.code);
    if (code && code !== 200) {
      const err = new Error(String(payload?.data?.msg || `code_${code}`));
      err.code = code;
      throw err;
    }
    return payload?.data?.data;
  }

  function isVideoSessionType(t) {
    return String(t || "").toLowerCase() === "video";
  }

  function isExamSessionType(t) {
    const s = String(t || "").toLowerCase();
    return s === "exam" || s === "test" || s === "question" || s === "quiz";
  }

  function isTeletextSessionType(t) {
    const s = String(t || "").toLowerCase();
    return (
      s === "teletext" ||
      s === "text" ||
      s === "html" ||
      s === "article" ||
      s === "richtext" ||
      s === "guide"
    );
  }

  function isDocLikeSessionType(t) {
    const s = String(t || "").toLowerCase();
    return (
      ["doc", "document", "pdf", "file", "audio"].includes(s) ||
      isTeletextSessionType(s)
    );
  }

  function isStudySessionType(t) {
    const s = String(t || "").toLowerCase();
    return (
      isVideoSessionType(s) ||
      isExamSessionType(s) ||
      isDocLikeSessionType(s) ||
      s === "resource"
    );
  }

  function isExamSession(sess) {
    if (!sess) return false;
    return isExamSessionType(sess.sessionType);
  }

  function isMustStudySession(s) {
    if (!s) return false;
    if (!s.mustLearn) return false;
    return (
      isVideoSessionType(s.sessionType) ||
      isExamSession(s) ||
      isDocLikeSessionType(s.sessionType)
    );
  }

  async function submitLearningTest(learningId, activityId, answers, tokenOverride) {
    const payload = await apiJson(
      PLAYER_API,
      `/api/learning/${encodeURIComponent(learningId)}/test`,
      "POST",
      {
        token: String(tokenOverride || learningId),
        activityId: String(activityId),
        answers: answers || [],
      }
    );
    const code = Number(payload?.data?.code);
    if (code && code !== 200) {
      const err = new Error(String(payload?.data?.msg || `code_${code}`));
      err.code = code;
      throw err;
    }
    return payload?.data?.data || {};
  }

  async function cloudExamAnswers(examItems, reviewMap, fallbackAnswers) {
    await ensureLease(false);
    const payload = { exam_items: examItems || [] };
    if (reviewMap) {
      payload.review_map = reviewMap;
      payload.fallback_answers = fallbackAnswers || [];
    }
    const data = await cloudRq("/api/qlt/study/exam/answers", "POST", payload);
    return Array.isArray(data?.answers) ? data.answers : [];
  }

  function isActFinishedInCourse(courseData, actId) {
    const id = String(actId || "");
    if (!id || !courseData) return false;
    const finished = courseData.finishedActs || {};
    if (Object.prototype.hasOwnProperty.call(finished, id)) return true;
    if (finished[id] != null && finished[id] !== false && finished[id] !== 0) {
      return true;
    }
    if (Array.isArray(finished) && finished.map(String).includes(id)) return true;
    return false;
  }

  function listSessions(courseData, lessonOpt) {
    const sections = courseData?.sections || [];
    const actDuration = courseData?.actDuration || {};
    const previewInherit = !!lessonOpt?.previewInherit;
    const lessonDone = Number(lessonOpt?.status) === 1;
    const courseDone = Number(courseData?.status) === 1;
    const out = [];
    for (const sec of sections) {
      if (sec?.extendedResource) continue;
      for (const sess of sec?.courseSessions || []) {
        const id = String(sess.id || "");
        if (!id) continue;
        const must = Number(sess.mustLearn) === 1 || !!sess.mustLearn;
        const ext = sess.ext || {};
        const title = String(sess.title || id);
        const alias = String(sess.sessionAlias || "");
        const tags = Array.isArray(sess.tags) ? sess.tags.map(String).join(" ") : "";
        let sessionType = String(sess.sessionType || "").toLowerCase();
        if (!sessionType) {
          const looksExam =
            /\u6d4b\u8bd5\u9898|\u6d4b\u9a8c/.test(alias) ||
            /\u6d4b\u8bd5\u9898|\u6d4b\u9a8c/.test(tags) ||
            /^(\u5728\u7ebf)?\u6d4b\u8bd5$|\u6d4b\u8bd5\u9898|\u6d4b\u9a8c/.test(title.trim());
          sessionType = looksExam ? "exam" : "video";
        }
        const isExam = isExamSessionType(sessionType);
        const knownTarget = Number(
          ext.studyTime || ext.duration || sess.studyTime || 0
        );
        const targetSec = Math.max(
          1,
          knownTarget || (isExam ? 60 : 600)
        );
        const learnedSec = Math.max(
          0,
          Number(actDuration[id] || sess.learnedSec || sess.duration || 0)
        );
        const statusDone =
          Number(sess.status) === 1 ||
          sess.status === "1" ||
          Number(sess.learnStatus) === 1;
        const inFinished = isActFinishedInCourse(courseData, id);
        const inheritLessonDone =
          previewInherit && (lessonDone || courseDone) && must;
        out.push({
          id,
          title,
          sessionType,
          mustLearn: must,
          finished: !!(statusDone || inFinished || inheritLessonDone),
          learnedSec,
          targetSec,
          knownTarget: knownTarget > 0 ? knownTarget : 0,
          chapterTitle: String(sec.title || ""),
          extended: false,
          raw: sess,
        });
      }
    }
    return out;
  }

  function resolveTargetSec(activityData, fallbackType) {
    const act = activityData?.activity || {};
    const ext = act.ext || {};
    const studyTime = Number(ext.studyTime || 0);
    const videoDur = Math.ceil(Number(ext.duration || 0));
    const current =
      activityData?.duration == null || activityData?.duration === ""
        ? 0
        : Number(activityData.duration);
    const stype = String(act.sessionType || fallbackType || "video");
    let target = studyTime > 0 ? studyTime : videoDur > 0 ? videoDur : 0;
    if (!target) {
      if (isVideoSessionType(stype)) target = 600;
      else if (isTeletextSessionType(stype)) target = 30;
      else target = 60;
    }
    if (current > target) target = current;
    const actToken = String(
      activityData?.actToken ||
        act.actToken ||
        activityData?.token ||
        act.token ||
        ""
    );
    return {
      target: Math.max(10, Math.floor(target)),
      current: Math.max(0, Math.floor(current)),
      interval: Math.max(30, Number(activityData?.updateDurationInterval || 180)),
      actToken,
      sessionType: stype,
      status: Number(activityData?.status || act.status || 0),
    };
  }

  async function tryPutDuration(learningId, sessionType, activityId, actToken, seconds) {
    const types = [];
    const t = String(sessionType || "video").toLowerCase();
    types.push(t);
    if (t !== "video") types.push("video");
    if (t === "doc" || t === "document" || t === "pdf") {
      types.push("doc", "document", "file", "pdf");
    }
    if (isTeletextSessionType(t)) {
      types.push("teletext", "text", "html", "article", "doc", "document");
    }
    if (t === "resource") types.push("resource", "doc", "file", "teletext");
    const uniq = [...new Set(types)];
    let lastErr = null;
    for (const typ of uniq) {
      try {
        return await putDuration(learningId, typ, activityId, actToken, seconds);
      } catch (e) {
        lastErr = e;
        if (Number(e?.code) === 20110) throw e;
      }
    }
    throw lastErr || new Error("duration_failed");
  }

  function engineConfig() {
    const id = currentSpeedMode().id;
    return {
      speed_mode: id,
      mode: id,
      speedMode: id,
    };
  }

  async function ensureCloudAuthForStudy() {
    const luid = getLearningUserId();
    if (!luid) throw new Error("\u8bf7\u5148\u767b\u5f55");
    if (state.cloudLeaseLuid && state.cloudLeaseLuid !== luid) {
      clearCloudLeaseLocal("pre_study_switch");
    }
    await ensureLease(false);
  }

  async function qltEngineStart(kind, context, cfg) {
    await ensureCloudAuthForStudy();
    const data = await cloudRq("/api/qlt/study/engine/start", "POST", {
      kind: String(kind || "video"),
      context: context || {},
      config: cfg || engineConfig(),
    });
    syncCloudQuotaFromResponse(data);
    return data;
  }

  async function qltEngineStep(sessionId, event, lastResult, contextPatch) {
    await ensureCloudAuthForStudy();
    const data = await cloudRq("/api/qlt/study/engine/step", "POST", {
      session_id: String(sessionId || ""),
      event: String(event || "tick"),
      last_result: lastResult == null ? null : lastResult,
      context_patch: contextPatch == null ? null : contextPatch,
    });
    syncCloudQuotaFromResponse(data);
    return data;
  }

  async function qltEngineComplete(sessionId, result) {
    await ensureCloudAuthForStudy();
    const data = await cloudRq("/api/qlt/study/engine/complete", "POST", {
      session_id: String(sessionId || ""),
      success: !!(result && (result.ok || result.done || result.success)),
      skipped: !!(result && result.skipped),
    });
    syncCloudQuotaFromResponse(data);
    return data;
  }

  async function performExamSubmit(learningId, session, courseData) {
    if (session.finished) return { skipped: true, done: true, ok: true };
    const activity = await fetchActivity(learningId, session.id);
    const topStatus = activity?.status;
    const actStatus0 = activity?.activity?.status;
    const already =
      topStatus === 1 ||
      topStatus === "1" ||
      actStatus0 === 1 ||
      actStatus0 === "1" ||
      !!(courseData?.finishedActs && courseData.finishedActs[session.id]);
    if (already) return { skipped: true, done: true, ok: true };

    const items = activity?.activity?.ext?.examItems || [];
    if (!items.length) return { skipped: true, done: false, ok: false, softSkip: true };

    const actToken = String(activity?.actToken || "");
    let answers = await cloudExamAnswers(items);

    const trySubmit = async (ans, token) => {
      try {
        return await submitLearningTest(learningId, session.id, ans, token);
      } catch (e) {
        if (token !== learningId) throw e;
        if (!actToken || actToken === learningId) throw e;
        return submitLearningTest(learningId, session.id, ans, actToken);
      }
    };

    let result = await trySubmit(answers, learningId);
    let rightCount = Number(result?.rightCount || 0);
    let actStatus = Number(result?.actStatus);

    if (actStatus !== 1 || rightCount < items.length) {
      const fixed = await cloudExamAnswers(items, result?.answers || {}, answers);
      const useful = fixed.some((a, i) => a.answer && a.answer !== answers[i]?.answer);
      if (useful || rightCount < items.length) {
        await sleep(500);
        result = await trySubmit(fixed, learningId);
        rightCount = Number(result?.rightCount || 0);
        actStatus = Number(result?.actStatus);
      }
    }

    await sleep(400);
    const course2 = await fetchCourse(learningId);
    const finished =
      actStatus === 1 ||
      !!(course2?.finishedActs && course2.finishedActs[session.id]);
    return {
      ok: finished,
      done: finished,
      skipped: false,
      actStatus,
      rightCount,
      total: items.length,
    };
  }

  async function resyncSessionCtx(learningId, session, ctx) {
    await sleep(1200);
    const activity = await fetchActivity(learningId, session.id);
    ctx.meta = resolveTargetSec(activity, session.sessionType);
    const course = await fetchCourse(learningId);
    const finished = !!(
      course?.finishedActs && course.finishedActs[session.id]
    );
    ctx.cur = ctx.meta.current;
    return {
      current_sec: ctx.meta.current,
      target_sec: ctx.meta.target,
      act_token: ctx.meta.actToken,
      finished: finished || ctx.meta.status === 1,
    };
  }

  async function executeQltCommand(cmd, ctx) {
    const c = cmd || {};
    const t = String(c.type || "");
    const learningId = ctx.learningId;
    const session = ctx.session;
    const meta = ctx.meta || {};

    if (t === "wait") {
      await sleep(resolveWaitMs(c.ms));
      return { event: "tick", lastResult: null };
    }

    if (t === "report_duration") {
      const seconds = Math.max(0, Math.floor(Number(c.seconds || 0)));
      const sessionType = c.session_type || meta.sessionType || session.sessionType;
      const activityId = c.activity_id || session.id;
      const actToken = c.act_token || meta.actToken;
      const target = Math.max(1, meta.target || 600);
      let afterSec = seconds;
      let ok = true;
      let timeMismatch = false;
      let actStatus = 0;
      try {
        const putRes = await tryPutDuration(
          learningId,
          sessionType,
          activityId,
          actToken,
          seconds
        );
        if (putRes && putRes.duration != null && putRes.duration !== "") {
          afterSec = Math.floor(Number(putRes.duration));
        }
        actStatus = Number(putRes?.actStatus);
      } catch (e) {
        ok = false;
        if (Number(e?.code) === 20110) {
          const lr = await resyncSessionCtx(learningId, session, ctx);
          return { event: "resync_result", lastResult: lr };
        }
        if (isTimeMismatchError(e)) {
          timeMismatch = true;
          afterSec = Math.max(ctx.cur || 0, meta.current || 0);
        } else if (isNeedFinishSignalError(e)) {
          return executeQltCommand(
            {
              type: "finish_duration",
              session_type: sessionType,
              activity_id: activityId,
              act_token: actToken,
            },
            ctx
          );
        } else {
          return {
            event: "duration_report_result",
            lastResult: { ok: false, seconds: afterSec, current_sec: afterSec },
          };
        }
      }
      if (actStatus === 1) {
        return executeQltCommand(
          {
            type: "finish_duration",
            session_type: sessionType,
            activity_id: activityId,
            act_token: actToken,
          },
          ctx
        );
      }
      ctx.cur = Math.max(ctx.cur || 0, afterSec, meta.current || 0);
      ctx.meta = Object.assign({}, meta, { current: ctx.cur });
      const pct = Math.min(100, (ctx.cur / target) * 100);
      state.progressPct = pct;
      updateProgressUi(pct);
      logProgress(session.title, pct);
      touchPreviewSession(learningId, session.id, ctx.cur, target, false);
      return {
        event: "duration_report_result",
        lastResult: {
          ok,
          seconds: afterSec,
          current_sec: ctx.cur,
          after_sec: afterSec,
          time_mismatch: timeMismatch,
        },
      };
    }

    if (t === "finish_duration") {
      const sessionType = c.session_type || meta.sessionType || session.sessionType;
      const activityId = c.activity_id || session.id;
      const actToken = c.act_token || meta.actToken;
      const target = Math.max(1, meta.target || 600);
      let done = false;
      let actStatus = 0;
      try {
        const putRes = await tryPutDuration(
          learningId,
          sessionType,
          activityId,
          actToken,
          -1
        );
        actStatus = Number(putRes?.actStatus);
        done = actStatus === 1;
      } catch (e) {
        if (Number(e?.code) === 20110) {
          const lr = await resyncSessionCtx(learningId, session, ctx);
          return { event: "resync_result", lastResult: lr };
        }
        if (isTimeMismatchError(e)) {
          return {
            event: "finish_duration_result",
            lastResult: {
              ok: false,
              done: false,
              finished: false,
              time_mismatch: true,
            },
          };
        }
        return {
          event: "finish_duration_result",
          lastResult: { ok: false, done: false, finished: false },
        };
      }
      await sleep(200);
      const course = await fetchCourse(learningId);
      const best = Math.max(
        ctx.cur || 0,
        Number((course?.actDuration || {})[session.id] || 0)
      );
      done =
        done ||
        isActFinishedInCourse(course, session.id) ||
        best >= target - 1;
      ctx.cur = done ? Math.max(best, target) : best;
      if (done) {
        markProgressComplete();
        logSessionDoneOnce(session.title);
        touchPreviewSession(learningId, session.id, target, target, true);
        return {
          terminal: true,
          ok: true,
          done: true,
          finished: true,
          event: "finish_duration_result",
          lastResult: {
            ok: true,
            done: true,
            finished: true,
            success: true,
            actStatus,
            current_sec: ctx.cur,
          },
        };
      }
      return {
        event: "finish_duration_result",
        lastResult: {
          ok: false,
          done: false,
          finished: false,
          success: false,
          actStatus,
          current_sec: ctx.cur,
        },
      };
    }

    if (t === "resync") {
      const lr = await resyncSessionCtx(learningId, session, ctx);
      return { event: "resync_result", lastResult: lr };
    }

    if (t === "exam_submit") {
      state.currentTitle = session.title;
      syncCurrentUi();
      const r = await performExamSubmit(learningId, session, ctx.courseData);
      if (r.done) {
        markProgressComplete();
        logSessionDoneOnce(session.title);
        return {
          terminal: true,
          ok: true,
          done: true,
          event: "exam_submit_result",
          lastResult: {
            ok: true,
            success: true,
            done: true,
            skipped: !!r.skipped,
          },
        };
      }
      if (r.softSkip) {
        log(`\u6d4b\u8bd5\u8df3\u8fc7\uff1a${session.title}\uff08\u65e0\u8bd5\u9898\uff09`);
      }
      return {
        event: "exam_submit_result",
        lastResult: {
          ok: !!r.done,
          success: !!r.done,
          done: !!r.done,
          skipped: !!r.skipped,
        },
      };
    }

    if (t === "done") {
      if (c.success && !c.skipped && session?.title) {
        markProgressComplete();
        logSessionDoneOnce(session.title);
      }
      return {
        terminal: true,
        ok: !!c.success,
        skipped: !!c.skipped,
        done: !!c.success,
        msg: c.message || "",
      };
    }

    if (t === "failed" || t === "quota") {
      return {
        terminal: true,
        ok: false,
        quota: t === "quota",
        msg: c.message || "",
      };
    }

    await sleep(400);
    return { event: "tick", lastResult: null };
  }

  function trimLeadingWaits(plan) {
    const cmds = (plan || []).filter((c) => c && typeof c === "object");
    while (cmds.length && String(cmds[0].type || "") === "wait") cmds.shift();
    return cmds;
  }

  function adaptPlanForSpeed(plan) {
    const cmds = trimLeadingWaits(plan);
    const mode = currentSpeedMode().id;
    if (mode === "oneone") return cmds;
    const out = [];
    for (let i = 0; i < cmds.length; i++) {
      const c = cmds[i];
      const t = String(c.type || "");
      if (t === "wait") {
        const next = cmds[i + 1];
        if (next && String(next.type || "") === "finish_duration") {
          out.push(Object.assign({}, c, { ms: resolveWaitMs(c.ms) }));
          continue;
        }
        out.push(Object.assign({}, c, { ms: resolveWaitMs(c.ms) }));
        continue;
      }
      out.push(c);
    }
    return out;
  }

  function isEarlySessionDone(out) {
    if (!out) return false;
    if (out.terminal && (out.done || out.ok) && !out.quota && !out.stopped) {
      return true;
    }
    const lr = out.lastResult || {};
    if (
      out.event === "finish_duration_result" &&
      (lr.done || lr.finished || lr.success)
    ) {
      return true;
    }
    if (out.event === "exam_submit_result" && lr.done) return true;
    return false;
  }

  async function runCachedPlan(sessionId, plan, logLine, ctx, reportComplete) {
    if (shouldLogCloudLine(logLine)) log(String(logLine).trim());
    const cmds = adaptPlanForSpeed(plan);
    if (cmds.length) await ensureCloudAuthForStudy();
    for (let i = 0; i < cmds.length && !state.stopFlag; i++) {
      const out = await executeQltCommand(cmds[i], ctx);
      if (out.lastResult && out.lastResult.time_mismatch) {
        try {
          const next = await qltEngineStep(
            sessionId,
            out.event || "duration_report_result",
            out.lastResult,
            null
          );
          if (shouldLogCloudLine(next.log)) log(String(next.log).trim());
          const nextPlan = adaptPlanForSpeed(
            Array.isArray(next.plan) ? next.plan : []
          );
          if (nextPlan.length) {
            return runCachedPlan(
              String(next.session_id || sessionId),
              nextPlan,
              null,
              ctx,
              reportComplete
            );
          }
          if (next.command) {
            return runCachedPlan(
              String(next.session_id || sessionId),
              [next.command],
              null,
              ctx,
              reportComplete
            );
          }
        } catch (_) {}
        return {
          terminal: true,
          ok: false,
          done: false,
          lastResult: out.lastResult,
        };
      }
      if (out.terminal !== undefined || isEarlySessionDone(out)) {
        const doneOut =
          out.terminal !== undefined
            ? out
            : {
                terminal: true,
                ok: true,
                done: true,
                skipped: false,
                lastResult: out.lastResult,
              };
        if (
          reportComplete &&
          (doneOut.ok || doneOut.done) &&
          !doneOut.skipped &&
          !doneOut.quota &&
          !doneOut.stopped
        ) {
          try {
            await qltEngineComplete(sessionId, doneOut);
          } catch (_) {}
        }
        return doneOut;
      }
      if (i === cmds.length - 1 && out.event) {
        const next = await qltEngineStep(
          sessionId,
          out.event,
          out.lastResult,
          null
        );
        if (shouldLogCloudLine(next.log)) log(String(next.log).trim());
        const nextPlan = adaptPlanForSpeed(
          Array.isArray(next.plan) ? next.plan : []
        );
        if (nextPlan.length) {
          return runCachedPlan(
            String(next.session_id || sessionId),
            nextPlan,
            null,
            ctx,
            reportComplete
          );
        }
        if (next.command && String(next.command.type || "") !== "wait") {
          return runCachedPlan(
            String(next.session_id || sessionId),
            [next.command],
            null,
            ctx,
            reportComplete
          );
        }
      }
    }
    if (state.stopFlag) return { terminal: true, ok: false, stopped: true };
    return { terminal: true, ok: false, msg: "\u5b66\u4e60\u672a\u5b8c\u6210" };
  }

  async function runQltEngineLoop(startRes, ctx) {
    const sessionId = String(startRes.session_id || "");
    const plan = adaptPlanForSpeed(
      Array.isArray(startRes.plan) ? startRes.plan : []
    );
    const reportComplete = String(ctx?.kind || "") !== "exam";
    state.lastLoggedPctBucket = -1;
    if (plan.length) {
      return runCachedPlan(sessionId, plan, startRes.log, ctx, reportComplete);
    }
    let cmd = startRes.command;
    if (shouldLogCloudLine(startRes.log)) log(String(startRes.log).trim());
    if (cmd && String(cmd.type || "") === "wait") {
      try {
        const next = await qltEngineStep(sessionId, "tick", null, null);
        if (shouldLogCloudLine(next.log)) log(String(next.log).trim());
        const nextPlan = adaptPlanForSpeed(
          Array.isArray(next.plan) ? next.plan : []
        );
        if (nextPlan.length) {
          return runCachedPlan(
            String(next.session_id || sessionId),
            nextPlan,
            null,
            ctx,
            reportComplete
          );
        }
        cmd = next.command;
        if (cmd && String(cmd.type || "") === "wait") {
          cmd = Object.assign({}, cmd, { ms: resolveWaitMs(cmd.ms) });
        }
      } catch (_) {}
    }
    const maxSteps = 120;
    for (let i = 0; i < maxSteps && cmd && !state.stopFlag; i++) {
      const out = await executeQltCommand(cmd, ctx);
      if (out.terminal !== undefined) {
        if (
          reportComplete &&
          (out.ok || out.done) &&
          !out.skipped &&
          !out.quota
        ) {
          try {
            await qltEngineComplete(sessionId, out);
          } catch (_) {}
        }
        return out;
      }
      const next = await qltEngineStep(
        sessionId,
        out.event,
        out.lastResult,
        null
      );
      if (shouldLogCloudLine(next.log)) log(String(next.log).trim());
      const nextPlan = Array.isArray(next.plan)
        ? next.plan.filter((c) => c && typeof c === "object")
        : [];
      if (nextPlan.length) {
        return runCachedPlan(
          String(next.session_id || sessionId),
          nextPlan,
          null,
          ctx,
          reportComplete
        );
      }
      cmd = next.command;
    }
    if (state.stopFlag) return { terminal: true, ok: false, stopped: true };
    return { terminal: true, ok: false, msg: "\u5b66\u4e60\u672a\u5b8c\u6210" };
  }

  async function forceFinishDuration(learningId, session, meta, courseData) {
    const ctx = {
      learningId,
      session,
      courseData,
      kind: isVideoSessionType(meta.sessionType || session.sessionType)
        ? "video"
        : "doc",
      meta,
      cur: meta.current || 0,
    };
    const out = await executeQltCommand(
      {
        type: "finish_duration",
        session_type: meta.sessionType || session.sessionType,
        activity_id: session.id,
        act_token: meta.actToken || session.id,
      },
      ctx
    );
    const ok = !!(out.terminal || out.done || out.lastResult?.done);
    return { done: ok, skipped: false, out };
  }

  async function studyOneSession(learningId, session, courseData) {
    if (
      session.finished &&
      isActFinishedInCourse(courseData, session.id)
    ) {
      markProgressComplete();
      return { skipped: true, done: true };
    }

    if (isExamSession(session)) {
      state.currentTitle = session.title;
      state.progressPct = 0;
      syncCurrentUi();
      updateProgressUi(0);
      const startRes = await qltEngineStart(
        "exam",
        {
          learning_id: learningId,
          activity_id: session.id,
          title: session.title,
          learning_user_id: getLearningUserId(),
        },
        engineConfig()
      );
      const startCmd = startRes.command || {};
      if (String(startCmd.type || "") === "quota") {
        return {
          skipped: false,
          done: false,
          quota: true,
          msg: startCmd.message || startRes.log || "",
        };
      }
      const loop = await runQltEngineLoop(startRes, {
        learningId,
        session,
        courseData,
        kind: "exam",
        meta: {},
        cur: 0,
      });
      if (loop.quota) return { quota: true, msg: loop.msg || "" };
      if (loop.stopped) return { stopped: true };
      if (loop.ok || loop.done) markProgressComplete();
      return { done: !!(loop.ok || loop.done), skipped: !!loop.skipped };
    }

    state.currentTitle = session.title;
    syncCurrentUi();

    let activity = await fetchActivity(learningId, session.id);
    let meta = resolveTargetSec(activity, session.sessionType);

    if (
      meta.status === 1 ||
      isActFinishedInCourse(courseData, session.id)
    ) {
      markProgressComplete();
      logSessionDoneOnce(session.title);
      touchPreviewSession(learningId, session.id, meta.target, meta.target, true);
      return { skipped: true, done: true };
    }

    const isVideo = isVideoSessionType(meta.sessionType || session.sessionType);
    if (!meta.actToken) {
      meta.actToken = String(session.id || "");
      if (!meta.actToken) return { skipped: false, done: false };
    }

    const ctx = {
      learningId,
      session,
      courseData,
      kind: isVideo ? "video" : "doc",
      meta,
      cur: meta.current,
    };

    const platformFinished = isActFinishedInCourse(courseData, session.id);
    if (
      !platformFinished &&
      meta.current >= Math.max(1, meta.target - 1)
    ) {
      const fr = await forceFinishDuration(learningId, session, meta, courseData);
      return { done: !!fr.done, skipped: false };
    }

    const speedCfg = engineConfig();
    const startRes = await qltEngineStart(
      "video",
      {
        learning_id: learningId,
        activity_id: session.id,
        title: session.title,
        session_type: meta.sessionType,
        act_token: meta.actToken,
        target_sec: meta.target,
        current_sec: meta.current,
        progress: Math.min(100, (meta.current / meta.target) * 100),
        learning_user_id: getLearningUserId(),
        speed_mode: speedCfg.speed_mode,
        speedMode: speedCfg.speed_mode,
        platform_finished: false,
        finished: false,
      },
      speedCfg
    );

    const startCmd = startRes.command || {};
    if (String(startCmd.type || "") === "done" && startCmd.skipped) {
      const fr = await forceFinishDuration(learningId, session, meta, courseData);
      return { done: !!fr.done, skipped: false };
    }
    if (String(startCmd.type || "") === "quota") {
      return { skipped: false, done: false, quota: true };
    }

    const loop = await runQltEngineLoop(startRes, ctx);
    if (loop.stopped) return { stopped: true };
    if (loop.quota) return { quota: true };
    if (loop.skipped) {
      if (!isActFinishedInCourse(courseData, session.id)) {
        const fr = await forceFinishDuration(learningId, session, meta, courseData);
        return { done: !!fr.done, skipped: false };
      }
      return { skipped: true, done: true };
    }
    return { done: !!(loop.ok || loop.done), skipped: false };
  }

  function markActFinishedLocal(courseData, actId) {
    const id = String(actId || "");
    if (!id || !courseData) return;
    if (!courseData.finishedActs || typeof courseData.finishedActs !== "object") {
      courseData.finishedActs = {};
    }
    if (Array.isArray(courseData.finishedActs)) {
      if (!courseData.finishedActs.map(String).includes(id)) {
        courseData.finishedActs.push(id);
      }
    } else {
      courseData.finishedActs[id] = true;
    }
  }

  async function studyOneLesson(lesson) {
    state.currentLessonName = lesson.name;
    state.currentTitle = "-";
    state.lastLoggedPctBucket = -1;
    syncCurrentUi();

    if (String(state.cloudTier || "").toLowerCase() !== "pro") {
      const cr0 = await consumeFreeLesson(lesson);
      if (cr0.quota) return { quota: true, done: !!isLessonFinished(lesson), msg: cr0.msg || "" };
    }

    if (isLessonFinished(lesson)) {
      setLessonStatusLocal(lesson.id, 1);
      rememberFreeStudiedLesson(lesson.id);
      return { done: true, skipped: true };
    }
    if (!canStudyNextFreeLesson()) {
      return { quota: true };
    }
    log(`\u8fdb\u5165\u8bfe\u7a0b\uff1a${lesson.name}`);

    const learningId = await resolveLearningId(lesson.id);
    let courseData = await fetchCourse(learningId);
    updatePreviewFromCourse(lesson, courseData);
    const finishedInRun = new Set();

    const noteSessionResult = (sess, r) => {
      if (!sess?.id) return;
      if (!r || r.quota || r.softSkip) return;
      if (r.done && !r.skipped) {
        finishedInRun.add(String(sess.id));
        markActFinishedLocal(courseData, sess.id);
      } else if (r.skipped && r.done && isActFinishedInCourse(courseData, sess.id)) {
        finishedInRun.add(String(sess.id));
      }
    };
    const stillPendingExam = (s) =>
      isExamSession(s) && !s.finished && !finishedInRun.has(String(s.id));

    let sessions = listSessions(courseData).filter(
      (s) => isStudySessionType(s.sessionType) || isExamSession(s)
    );

    const allVideosDone = sessions
      .filter((s) => isVideoSessionType(s.sessionType))
      .every((s) => s.finished || finishedInRun.has(String(s.id)));
    if (allVideosDone) {
      sessions = [
        ...sessions.filter((s) => stillPendingExam(s)),
        ...sessions.filter((s) => !stillPendingExam(s)),
      ];
    }

    const pending = sessions.filter(
      (s) => !s.finished && !finishedInRun.has(String(s.id))
    );
    if (!pending.length) {
      setLessonStatusLocal(lesson.id, 1);
      rememberFreeStudiedLesson(lesson.id);
      const cr = await consumeFreeLesson(lesson, { quiet: true });
      if (cr.quota) return { quota: true, done: true, msg: cr.msg || "" };
      return { done: true };
    }

    for (let pi = 0; pi < pending.length; pi++) {
      const sess = pending[pi];
      if (state.stopFlag) return { stopped: true };
      try {
        const r = await studyOneSession(learningId, sess, courseData);
        noteSessionResult(sess, r);
        if (r.quota) return { quota: true, msg: r.msg || "" };
        if (r.stopped) return { stopped: true };
      } catch (e) {
        if (Number(e?.code) === 20110) {
          await sleep(1200);
          continue;
        }
        console.debug("[\u9f50\u9c81\u7814\u4fee] session", sess.title, e);
      }
      const hasMore = pending
        .slice(pi + 1)
        .some((s) => !finishedInRun.has(String(s.id)));
      if (hasMore && !state.stopFlag) {
        await sleep(sessionGapMs());
      }
      courseData = await fetchCourse(learningId);
      for (const id of finishedInRun) markActFinishedLocal(courseData, id);
      updatePreviewFromCourse(lesson, courseData);
    }

    courseData = await fetchCourse(learningId);
    for (const id of finishedInRun) markActFinishedLocal(courseData, id);
    updatePreviewFromCourse(lesson, courseData);
    let examLeft = listSessions(courseData).filter((s) => stillPendingExam(s));
    for (const sess of examLeft) {
      if (state.stopFlag) return { stopped: true };
      try {
        const r = await studyOneSession(learningId, sess, courseData);
        noteSessionResult(sess, r);
        if (r.quota) return { quota: true, msg: r.msg || "" };
        if (r.stopped) return { stopped: true };
      } catch (e) {
        console.debug("[\u9f50\u9c81\u7814\u4fee] exam", sess.title, e);
        log(`\u6d4b\u8bd5\u5931\u8d25\uff1a${sess.title}`);
      }
      courseData = await fetchCourse(learningId);
      for (const id of finishedInRun) markActFinishedLocal(courseData, id);
      updatePreviewFromCourse(lesson, courseData);
    }

    examLeft = listSessions(courseData).filter((s) => stillPendingExam(s));
    if (examLeft.length) {
      await sleep(800);
      courseData = await fetchCourse(learningId);
      for (const id of finishedInRun) markActFinishedLocal(courseData, id);
      examLeft = listSessions(courseData).filter((s) => stillPendingExam(s));
    }
    if (examLeft.length) {
      log(`\u4ecd\u6709\u672a\u5b8c\u6210\u6d4b\u8bd5\uff1a${examLeft.map((s) => s.title).join("\u3001")}`);
    }

    const left = listSessions(courseData).filter(
      (s) =>
        !s.finished &&
        !finishedInRun.has(String(s.id)) &&
        isMustStudySession(s)
    );
    const done = left.length === 0;
    if (done) {
      setLessonStatusLocal(lesson.id, 1);
      rememberFreeStudiedLesson(lesson.id);
      const cr = await consumeFreeLesson(lesson, { quiet: true });
      if (cr.quota) return { quota: true, done: true, msg: cr.msg || "" };
    }
    return { done };
  }

  async function runStudy() {
    if (state.running) return;
    state.running = true;
    state.stopFlag = false;
    state._doneLogKeys = Object.create(null);
    const completedIds = [];
    setStatus("\u8fd0\u884c\u4e2d");
    syncRunButtons();
    try {
      if (!state.lessons.length) await loadLessons();
      if (!(await ensureCloudReady())) return;
      try {
        await backfillFreeConsumes();
      } catch (_) {}

      let queue = state.lessons.filter((l) => state.selectedIds.includes(l.id));
      if (!queue.length) {
        log("\u8bf7\u5148\u52fe\u9009\u8bfe\u7a0b");
        return;
      }
      if (String(state.cloudTier || "").toLowerCase() !== "pro") {
        queue = [
          ...queue.filter((l) => isLessonFinished(l)),
          ...queue.filter((l) => !isLessonFinished(l)),
        ];
      }
      state.queueTotal = queue.length;
      state.queueDone = 0;
      updateQueueSummary();

      for (const lesson of queue) {
        if (state.stopFlag) break;
        if (!canStudyNextFreeLesson()) {
          notifyQuotaExhausted();
          break;
        }
        const r = await studyOneLesson(lesson);
        state.queueDone += 1;
        updateQueueSummary();
        if (r?.done) {
          completedIds.push(lesson.id);
          setLessonStatusLocal(lesson.id, 1);
          rememberFreeStudiedLesson(lesson.id);
        }
        if (r?.quota) {
          notifyQuotaExhausted(r.msg);
          break;
        }
        if (r?.stopped) break;
      }
      log(state.stopFlag ? "\u5df2\u505c\u6b62" : "\u961f\u5217\u7ed3\u675f");
      await refreshLessonListAfterStudy(completedIds);
    } catch (e) {
      log(`\u8fd0\u884c\u51fa\u9519\uff1a${String(e?.message || e).slice(0, 140)}`);
      console.debug("[\u9f50\u9c81\u7814\u4fee] run", e);
      try {
        await refreshLessonListAfterStudy(completedIds);
      } catch (_) {}
    } finally {
      state.running = false;
      setStatus("\u5df2\u505c\u6b62");
      syncRunButtons();
    }
  }

  function stopStudy() {
    state.stopFlag = true;
    setStatus("\u6b63\u5728\u505c\u6b62…");
    syncRunButtons();
  }

  function updatePreviewFromCourse(lesson, courseData) {
    const lid = String(lesson?.id || "");
    if (!lid) return;
    const sessions = listSessions(courseData || {}, {
      status: lesson?.status,
      previewInherit: true,
    });
    state.previewByLesson[lid] = {
      name: String(lesson.name || lid),
      sessions: sessions.map((s) => {
        const target = Math.max(1, s.targetSec || 600);
        let tag = "\u672a\u5b66";
        if (s.finished) tag = "\u5df2\u5b8c\u6210";
        else if (s.learnedSec > 0) {
          tag = `${Math.min(99, Math.floor((s.learnedSec / target) * 100))}%`;
        }
        return {
          id: s.id,
          title: s.title,
          finished: !!s.finished,
          tag,
          chapterTitle: s.chapterTitle,
        };
      }),
    };
    renderChapterPreview();
  }

  function touchPreviewSession(learningId, actId, cur, target, finished) {
    for (const lid of Object.keys(state.previewByLesson)) {
      const row = state.previewByLesson[lid];
      if (!row?.sessions) continue;
      for (const s of row.sessions) {
        if (String(s.id) === String(actId)) {
          if (finished) {
            s.finished = true;
            s.tag = "\u5df2\u5b8c\u6210";
          } else {
            const pct = Math.min(99, Math.floor((cur / Math.max(target, 1)) * 100));
            s.tag = `${pct}%`;
          }
        }
      }
    }
    renderChapterPreview();
  }

  function renderChapterPreview() {
    const box = document.getElementById("qlt-chapter-preview");
    if (!box) return;
    pruneSelectedIds();
    const ids = state.selectedIds;
    if (!ids.length) {
      box.innerHTML = `<div class="qlt-empty-state">\u8bf7\u52fe\u9009\u8bfe\u7a0b</div>`;
      return;
    }
    const parts = [];
    for (const id of ids) {
      const les = state.lessons.find((l) => String(l.id) === String(id));
      if (!les && state.lessons.length) continue; // \u65e0\u6548\u52fe\u9009\u4e0d\u5c55\u793a
      const prev = state.previewByLesson[id];
      const title = prev?.name || les?.name || "\u8bfe\u7a0b\u52a0\u8f7d\u4e2d…";
      parts.push(
        `<div class="qlt-chapter-course"><div class="qlt-chapter-title">${escapeHtml(
          title
        )}</div>`
      );
      if (!prev || !prev.sessions?.length) {
        parts.push(`<div class="qlt-chapter-item"><span>\u52a0\u8f7d\u4e2d…</span></div>`);
      } else {
        for (const s of prev.sessions) {
          const tag = s.finished || s.tag === "\u5df2\u5b8c\u6210" ? "\u5df2\u5b8c\u6210" : s.tag || "\u672a\u5b66";
          parts.push(
            `<div class="qlt-chapter-item"><span>${escapeHtml(
              s.title
            )}</span><em>${escapeHtml(tag)}</em></div>`
          );
        }
      }
      parts.push(`</div>`);
    }
    box.innerHTML = parts.join("");
  }

  async function refreshChapterPreview() {
    const seq = ++state._previewLoadSeq;
    try {
      await waitForBearer(4000);
    } catch (_) {}
    for (const id of state.selectedIds) {
      if (seq !== state._previewLoadSeq) break;
      const les = state.lessons.find((l) => String(l.id) === String(id));
      if (!les) continue;
      try {
        if (!state.bearer) {
          if (Number(les.status) === 1) {
            state.previewByLesson[id] = {
              name: String(les.name || id),
              sessions: [
                {
                  id: "_lesson_done",
                  title: les.name || "\u672c\u8bfe",
                  finished: true,
                  tag: "\u5df2\u5b8c\u6210",
                },
              ],
            };
          }
          continue;
        }
        const learningId = await resolveLearningId(les.id);
        const course = await fetchCourse(learningId);
        if (seq !== state._previewLoadSeq) break;
        updatePreviewFromCourse(les, course);
      } catch (e) {
        console.debug("[\u9f50\u9c81\u7814\u4fee] preview", id, e);
        if (Number(les.status) === 1) {
          state.previewByLesson[id] = {
            name: String(les.name || id),
            sessions: [
              {
                id: "_lesson_done",
                title: les.name || "\u672c\u8bfe",
                finished: true,
                tag: "\u5df2\u5b8c\u6210",
              },
            ],
          };
        }
      }
    }
    renderChapterPreview();
  }

  function setStatus(text) {
    const el = document.getElementById("qlt-auto-status");
    if (el) el.textContent = text;
  }

  function updateProgressUi(pct) {
    state.progressPct = Math.max(0, Math.min(100, Number(pct) || 0));
    const num = document.getElementById("qlt-progress-num");
    if (num) num.innerHTML = `${Math.floor(state.progressPct)}<small>%</small>`;
  }

  function syncCurrentUi() {
    const a = document.getElementById("qlt-cur-course");
    const b = document.getElementById("qlt-cur-doc");
    if (a) a.textContent = state.currentLessonName || "-";
    if (b) b.textContent = state.currentTitle || "-";
  }

  function updateUserUI() {}

  function syncRunButtons() {
    const start = document.getElementById("qlt-btn-start");
    const stop = document.getElementById("qlt-btn-stop");
    if (start) {
      start.disabled = state.running;
      start.classList.toggle("qlt-btn-off", state.running);
    }
    if (stop) {
      stop.disabled = !state.running;
      stop.classList.toggle("qlt-btn-off", !state.running);
    }
  }

  function switchPanelTab(name) {
    document.querySelectorAll(".qlt-tab-btn").forEach((el) => {
      el.classList.toggle("active", el.dataset.tab === name);
    });
    document.querySelectorAll(".qlt-pane").forEach((el) => {
      el.classList.toggle("active", el.dataset.pane === name);
    });
    if (name === "chapter") void refreshChapterPreview();
  }

  function updateQueueSummary() {
    const q = state.selectedIds.length;
    const doneEl = document.getElementById("qlt-queue-done");
    const totalEl = document.getElementById("qlt-queue-total");
    const textEl = document.getElementById("qlt-queue-text");
    const barEl = document.getElementById("qlt-queue-progress");
    const pctEl = document.getElementById("qlt-queue-percent");
    const done = state.queueDone;
    const total = state.queueTotal || q;
    if (doneEl) doneEl.textContent = String(done);
    if (totalEl) totalEl.textContent = String(total);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (textEl) {
      textEl.textContent = q ? `\u5df2\u9009 ${q} \u95e8 · \u961f\u5217 ${done}/${total || q}` : "\u672a\u9009\u62e9";
    }
    const sel = document.getElementById("qlt-sel-count");
    if (sel) sel.textContent = String(q);
  }

  function renderLessonList() {
    const box = document.getElementById("qlt-course-list");
    if (!box) return;
    box.innerHTML = "";
    if (!state.lessons.length) {
      box.innerHTML = `<div class="qlt-empty-state">\u6682\u65e0\u8bfe\u7a0b\uff0c\u8bf7\u9009\u62e9\u9879\u76ee\u540e\u70b9\u5237\u65b0</div>`;
      return;
    }
    const selected = new Set(state.selectedIds);
    for (const les of state.lessons) {
      const row = document.createElement("label");
      row.className = "qlt-course-item";
      const checked = selected.has(les.id) ? "checked" : "";
      const tag = les.mustLearn ? "\u5fc5\u4fee" : "\u9009\u4fee";
      const st = formatLessonStatus(les.status);
      row.innerHTML = `
        <input type="checkbox" data-id="${escapeHtml(les.id)}" ${checked}/>
        <div class="qlt-course-main">
          <div class="qlt-course-name">${escapeHtml(les.name)}</div>
          <div class="qlt-course-meta">${escapeHtml(les.topicName)} · ${tag} · ${escapeHtml(st)} · ${les.learnHour || 0}\u5b66\u65f6</div>
        </div>`;
      const input = row.querySelector("input");
      input.addEventListener("change", () => {
        const ids = new Set(state.selectedIds);
        if (input.checked) ids.add(les.id);
        else ids.delete(les.id);
        saveQueue([...ids]);
        updateQueueSummary();
        renderChapterPreview();
        void refreshChapterPreview();
      });
      box.appendChild(row);
    }
  }

  function formatLessonStatus(status) {
    const s = Number(status);
    if (s === 1) return "\u5df2\u5b8c\u6210";
    if (s === 0) return "\u5b66\u4e60\u4e2d";
    if (s === -1) return "\u672a\u5b66";
    return "\u672a\u77e5";
  }

  function isLessonFinished(les) {
    return Number(les?.status) === 1;
  }

  function isLessonPending(les) {
    return !isLessonFinished(les);
  }

  function selectByFilter(fn) {
    const ids = state.lessons.filter(fn).map((l) => l.id);
    saveQueue(ids);
    renderLessonList();
    updateQueueSummary();
  }

  function openProModal() {
    const m = document.getElementById("qlt-pro-modal");
    if (m) m.style.display = "flex";
  }

  function closeProModal() {
    const m = document.getElementById("qlt-pro-modal");
    if (m) m.style.display = "none";
  }

  function openProBuyPage() {
    const url = state.proBuyUrl || PRO_BUY_URL;
    try {
      if (typeof GM_openInTab === "function") GM_openInTab(url, { active: true });
      else window.open(url, "_blank");
    } catch (_) {
      window.open(url, "_blank");
    }
  }

  function createProModal() {
    const old = document.getElementById("qlt-pro-modal");
    if (old) old.remove();
    const modal = document.createElement("div");
    modal.id = "qlt-pro-modal";
    modal.innerHTML = `
      <div class="qlt-pro-card">
        <div class="qlt-pro-title">\u5f00\u901a Pro</div>
        <div class="qlt-pro-sub">Pro \u6fc0\u6d3b\u540e ${PRO_DAYS} \u5929\u6709\u6548\uff0c\u8bfe\u7a0b\u4e0e\u8003\u8bd5\u4e0d\u9650</div>
        <div class="qlt-pro-sec">
          <h4>Pro \u6743\u76ca</h4>
          <ul>
            <li>\u4e0d\u9650\u8bfe\u7a0b\u5b66\u4e60\uff08\u514d\u8d39\u4f53\u9a8c\u4ec5 ${FREE_CHAPTER_LIMIT_DEFAULT} \u95e8\u8bfe\uff09</li>
            <li>\u652f\u6301\u81ea\u52a8\u6d4b\u8bd5\uff08\u514d\u8d39\u4f53\u9a8c\u542b\u8bfe\u5185\u6d4b\u8bd5\uff09</li>
            <li>\u6fc0\u6d3b\u540e ${PRO_DAYS} \u5929\u6709\u6548\uff0c\u7ed1\u5b9a\u5f53\u524d\u767b\u5f55\u8d26\u53f7</li>
          </ul>
        </div>
        <div class="qlt-pro-sec">
          <h4>\u5f00\u901a\u65b9\u5f0f</h4>
          <p>1) \u52a0\u5165 QQ \u7fa4 ${QQ_GROUP_NUMBER}\uff0c\u8054\u7cfb\u7ba1\u7406\u5458\u83b7\u53d6 Token</p>
          <div class="qlt-pro-buy">
            <div>
              <p style="margin:0 0 6px 0;">2) \u524d\u5f80\u8d2d\u4e70\u9875\u83b7\u53d6 Token</p>
              <div class="qlt-pro-muted">\u8d2d\u5f97\u540e\uff1a\u5728\u8bbe\u7f6e\u9875\u7c98\u8d34 Token\uff0c\u70b9\u51fb\u300c\u4fdd\u5b58\u5e76\u6821\u9a8c\u300d\u3002</div>
            </div>
            <button id="qlt-pro-buy-link" class="qlt-pro-buy-btn" type="button">\u524d\u5f80\u8d2d\u4e70\u9875\u5f00\u901a Pro</button>
          </div>
        </div>
        <div class="qlt-pro-actions">
          <button id="qlt-pro-close" class="qlt-pro-close" type="button">\u6211\u77e5\u9053\u4e86</button>
        </div>
      </div>`;
    document.documentElement.appendChild(modal);
    modal.querySelector("#qlt-pro-close")?.addEventListener("click", closeProModal);
    modal.querySelector("#qlt-pro-buy-link")?.addEventListener("click", openProBuyPage);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProModal();
    });
  }

    function injectPanelStyles() {
    if (document.getElementById("qlt-panel-style")) return;
    const st = document.createElement("style");
    st.id = "qlt-panel-style";
    st.textContent = `

      #qlt-auto-panel{position:fixed;right:20px;top:80px;z-index:999999;width:412px;display:flex;flex-direction:column;background:#f4f7fb;border:1px solid #dbe4f0;border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,.17);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;font-size:12px;color:#0f172a;overflow:hidden;max-height:min(92vh,780px);}
      #qlt-auto-panel.qlt-min #qlt-panel-body,#qlt-auto-panel.qlt-min #qlt-panel-footer,#qlt-auto-panel.qlt-min .qlt-footer-extra{display:none !important;}
      #qlt-panel-header{padding:8px 11px;background:linear-gradient(180deg,#f8ecd5,#f4e8cf);border-bottom:1px solid #e5dbc6;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none;}
      #qlt-panel-brand{display:flex;align-items:center;gap:9px;min-width:0;flex:1;}
      #qlt-panel-logo{width:30px;height:30px;border-radius:9px;object-fit:cover;border:1px solid rgba(148,163,184,.45);background:#fff;}
      #qlt-panel-title{font-size:13px;font-weight:900;color:#9a3412;line-height:1.26;display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
      .qlt-panel-version{font-size:11px;font-weight:900;color:#64748b;padding:2px 7px;border-radius:999px;background:#f1f5f9;border:1px solid #e2e8f0;}
      #qlt-panel-sub{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;}
      .qlt-sub-chip{font-size:11px;color:#7c2d12;background:rgba(255,255,255,.62);padding:2px 7px;border-radius:999px;border:1px solid rgba(180,83,9,.18);font-weight:700;}
      .qlt-sub-chip-em{color:#9a3412;border-color:rgba(154,52,18,.28);background:rgba(255,247,237,.9);}
      .qlt-ctl{border:none;background:#fff;color:#64748b;width:28px;height:28px;border-radius:999px;cursor:pointer;box-shadow:0 1px 2px rgba(15,23,42,.1);font-weight:900;}
      #qlt-panel-body{flex:1;overflow-y:auto;padding:8px;min-height:0;}
      .qlt-card{background:#fff;border:1px solid #d9e2ee;border-radius:12px;padding:7px 9px;margin-bottom:7px;}
      .qlt-status-row{display:flex;justify-content:space-between;align-items:center;gap:7px;}
      .qlt-status-label{font-size:11px;color:#64748b;font-weight:700;}
      #qlt-auto-status{padding:2px 7px;border-radius:999px;font-weight:900;font-size:11px;background:#fff;border:1px solid #cbd5e1;}
      .qlt-status-metrics{display:flex;align-items:center;gap:5px;font-size:12px;color:#475569;flex:1;margin-top:4px;}
      .qlt-status-metrics em{font-style:normal;font-weight:900;color:#0f172a;}
      .qlt-progress-pct{font-size:14px;font-weight:900;color:#0369a1;}
      .qlt-progress-bar{height:5px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin-top:4px;}
      .qlt-progress-bar>span{display:block;height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#2563eb);transition:width .2s;}
      .qlt-tabbar{display:flex;gap:6px;margin-bottom:7px;}
      .qlt-tab-btn{flex:1;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;padding:4px;border-radius:9px;cursor:pointer;font-weight:700;font-size:11px;}
      .qlt-tab-btn.active{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;border-color:transparent;}
      .qlt-pane{display:none;}.qlt-pane.active{display:block;}
      .qlt-list-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:6px;}
      .qlt-list-head-actions{display:flex;align-items:center;gap:5px;flex-shrink:0;}
      .qlt-list-title{font-size:12px;color:#64748b;font-weight:700;}
      .qlt-list-tag{font-size:11px;color:#92400e;background:#ffedd5;border:1px solid #fdba74;border-radius:999px;padding:2px 7px;}
      .qlt-log-clear-btn{border:1px solid #cbd5e1;background:#fff;color:#64748b;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:700;cursor:pointer;}
      #qlt-course-list,#qlt-chapter-preview,#qlt-run-log{max-height:188px;overflow-y:auto;background:#f8fafc;border:1px solid #dbe4f0;border-radius:11px;padding:5px;}
      .qlt-course-item{display:flex;gap:7px;align-items:flex-start;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:7px;margin-bottom:6px;cursor:pointer;}
      .qlt-course-name{display:block;font-size:12px;color:#0f172a;line-height:1.38;}
      .qlt-course-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
      .qlt-course-tag{font-style:normal;font-size:10px;font-weight:800;padding:1px 6px;border-radius:999px;border:1px solid transparent;line-height:1.5;}
      .qlt-tag-required{color:#9a3412;background:#ffedd5;border-color:#fdba74;}
      .qlt-tag-elective{color:#1d4ed8;background:#dbeafe;border-color:#93c5fd;}
      .qlt-tag-other{color:#334155;background:#e2e8f0;border-color:#cbd5e1;}
      .qlt-tag-period{color:#065f46;background:#d1fae5;border-color:#6ee7b7;}
      .qlt-tag-done{color:#64748b;background:#f1f5f9;border-color:#cbd5e1;}
      .qlt-course-item.qlt-course-done{opacity:.72;cursor:default;background:#f8fafc;}
      .qlt-course-item input:disabled{cursor:not-allowed;}
      .qlt-course-meta{display:block;font-size:11px;color:#64748b;margin-top:2px;}
      .qlt-chapter-course{margin-bottom:7px;border:1px solid #dbe4f0;border-radius:9px;background:#fff;}
      .qlt-chapter-title{padding:5px 8px;background:#eaf1ff;border-bottom:1px solid #dbe4f0;color:#1d4ed8;font-size:11px;font-weight:700;}
      .qlt-chapter-item{padding:4px 8px;font-size:11px;line-height:1.35;display:flex;justify-content:space-between;gap:6px;}
      .qlt-chapter-item span:first-child{flex:1;min-width:0;word-break:break-all;}
      .qlt-chapter-item em{font-style:normal;color:#0369a1;font-weight:800;font-size:10px;flex-shrink:0;}
      .qlt-log-row{padding:4px 6px;border-bottom:1px dashed #d4deea;font-size:12px;line-height:1.42;}
      .qlt-empty-state{padding:12px 7px;text-align:center;color:#94a3b8;font-size:12px;font-weight:900;}
      .qlt-meta-row{display:flex;justify-content:space-between;gap:7px;font-size:12px;margin-bottom:5px;align-items:center;}
      .qlt-meta-label{color:#64748b;}.qlt-meta-value{font-weight:700;text-align:right;word-break:break-all;}
      .qlt-auth-badge{padding:2px 7px;border-radius:999px;border:1px solid #cbd5e1;font-size:11px;font-weight:900;}
      .qlt-btn-row{display:flex;gap:7px;}
      .qlt-btn{flex:1;border:none;color:#fff;padding:7px 9px;border-radius:10px;cursor:pointer;font-weight:800;font-size:12px;}
      .qlt-btn-start{background:#16a34a;}.qlt-btn-stop{background:#ef4444;}.qlt-btn-ghost{border:1px solid #cbd5e1;background:#fff;color:#0f172a;flex:0 0 auto;}
      .qlt-btn-off,.qlt-btn:disabled{background:#cbd5e1 !important;color:#64748b !important;cursor:not-allowed;}
      .qlt-btn-pro{flex:0 0 auto;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border:none;padding:4px 8px;font-size:12px;border-radius:10px;cursor:pointer;font-weight:800;}
      .qlt-hidden{display:none !important;}
      .qlt-footer-extra{padding:6px 9px;background:#f8fafc;border-top:1px solid #e2e8f0;}
      .qlt-ann{position:relative;font-size:12px;color:#334155;line-height:1.42;background:linear-gradient(180deg,#fffdf5,#fff7e6);border:1px solid #fcd34d;border-radius:11px;padding:8px 9px 8px 11px;}
      .qlt-ann::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#f59e0b,#ef4444);border-radius:11px 0 0 11px;}
      .qlt-qq-row{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-top:5px;}
      .qlt-qq-text{font-size:12px;color:#475569;}
      .qlt-qq-title{font-size:13px;font-weight:800;color:#0f172a;}
      .qlt-qq-btn{border:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;}
      #qlt-panel-footer{padding:7px 11px;background:#eef2f7;border-top:1px solid #dbe4f0;font-size:12px;color:#64748b;}
      #qlt-pro-modal{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:1000001;display:none;align-items:center;justify-content:center;padding:20px;}
      .qlt-pro-card{width:min(560px,92vw);max-height:88vh;overflow:auto;background:#fff;border-radius:18px;border:1px solid #dbe4f0;box-shadow:0 18px 46px rgba(15,23,42,.25);padding:16px;}
      .qlt-pro-title{font-size:24px;font-weight:900;}.qlt-pro-sub{font-size:13px;color:#64748b;margin-top:4px;}
      .qlt-pro-sec{margin-top:12px;border:1px solid #dbe4f0;border-radius:12px;padding:12px;background:#f8fafc;}
      .qlt-pro-sec h4{margin:0 0 8px;font-size:15px;}.qlt-pro-sec p,.qlt-pro-sec li{font-size:13px;color:#334155;line-height:1.5;}
      .qlt-pro-buy{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
      .qlt-pro-muted{color:#64748b;font-size:12px;}
      .qlt-pro-buy-btn{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;font-weight:800;border:none;cursor:pointer;align-self:flex-start;}
      .qlt-pro-actions{margin-top:14px;display:flex;justify-content:flex-end;}
      .qlt-pro-close{border:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;}
      .qlt-progress-num{font-size:18px;font-weight:900;}
      .qlt-progress-num small{font-size:12px;color:#64748b;}

      select.qlt-input{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:4px 7px;font-size:12px;background:#fff;}`;
    (document.head || document.documentElement).appendChild(st);
  }

function enableDrag(panel) {
    const header = panel.querySelector("#qlt-panel-header");
    if (!header) return;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let dragging = false;
    header.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      const rect = panel.getBoundingClientRect();
      ox = rect.left;
      oy = rect.top;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const nx = Math.max(0, ox + e.clientX - sx);
      const ny = Math.max(0, oy + e.clientY - sy);
      panel.style.left = nx + "px";
      panel.style.top = ny + "px";
      panel.style.right = "auto";
    });
    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      try {
        localStorage.setItem(
          PANEL_POS_KEY,
          JSON.stringify({ left: panel.style.left, top: panel.style.top })
        );
      } catch (_) {}
    });
    try {
      const pos = JSON.parse(localStorage.getItem(PANEL_POS_KEY) || "null");
      if (pos?.left && pos?.top) {
        panel.style.left = pos.left;
        panel.style.top = pos.top;
        panel.style.right = "auto";
      }
    } catch (_) {}
  }

  function createPanel() {
    if (document.getElementById("qlt-auto-panel")) return;
    injectPanelStyles();
    createProModal();
    const panel = document.createElement("div");
    panel.id = "qlt-auto-panel";
    panel.innerHTML = `
      <div id="qlt-panel-header">
        <div id="qlt-panel-brand">
          <img id="qlt-panel-logo" src="${PANEL_LOGO_URL}" alt="logo" referrerpolicy="no-referrer"/>
          <div>
            <div id="qlt-panel-title">
              <span>${PRODUCT_NAME}</span>
              <span class="qlt-panel-version">v${escapeHtml(SCRIPT_VERSION)}</span>
            </div>
            <div id="qlt-panel-sub">
              <span class="qlt-sub-chip">\u52fe\u9009\u8bfe\u7a0b\u5b66\u4e60</span>
              <span class="qlt-sub-chip">\u5b66\u5b8c\u81ea\u52a8\u7ee7\u7eed</span>
              <span class="qlt-sub-chip qlt-sub-chip-em">\u7701\u65f6\u7701\u5fc3</span>
            </div>
          </div>
        </div>
        <div><button class="qlt-ctl" id="qlt-btn-min" type="button" title="\u6298\u53e0">–</button></div>
      </div>
      <div id="qlt-panel-body">
        <div class="qlt-card">
          <div class="qlt-status-row">
            <span class="qlt-status-label">\u8fd0\u884c\u72b6\u6001</span>
            <span id="qlt-auto-status">\u5df2\u505c\u6b62</span>
          </div>
          <div class="qlt-status-row">
            <div class="qlt-status-metrics">
              <span><em id="qlt-queue-done">0</em>/<span id="qlt-queue-total">0</span> \u8bfe\u7a0b\u5df2\u5b66\u4e60</span>
            </div>
            <span class="qlt-progress-pct" id="qlt-queue-percent">0%</span>
          </div>
          <div class="qlt-progress-bar"><span id="qlt-queue-progress"></span></div>
        </div>
        <div class="qlt-card">
          <div class="qlt-tabbar">
            <button class="qlt-tab-btn active" data-tab="course" type="button">\u8bfe\u7a0b\u5217\u8868</button>
            <button class="qlt-tab-btn" data-tab="chapter" type="button">\u7ae0\u8282\u9884\u89c8</button>
            <button class="qlt-tab-btn" data-tab="log" type="button">\u8fd0\u884c\u65e5\u5fd7</button>
            <button class="qlt-tab-btn" data-tab="settings" type="button">\u8bbe\u7f6e</button>
          </div>
          <div class="qlt-pane active" data-pane="course">
            <div class="qlt-list-head">
              <span class="qlt-list-title">\u8bfe\u7a0b\u9009\u62e9</span>
              <div class="qlt-list-head-actions">
                <button class="qlt-btn qlt-btn-ghost" id="qlt-btn-select-pending" type="button" style="padding:2px 8px;font-size:11px;">\u52fe\u9009\u672a\u5b8c\u6210</button>
                <button class="qlt-btn qlt-btn-ghost" id="qlt-btn-refresh" type="button" style="padding:2px 8px;font-size:11px;">\u5237\u65b0</button>
              </div>
            </div>
            <select class="qlt-input" id="qlt-project-select" style="margin-bottom:6px;"><option value="">\u767b\u5f55\u540e\u70b9\u5237\u65b0\u52a0\u8f7d\u9879\u76ee</option></select>
            <div id="qlt-course-list"><div class="qlt-empty-state">\u767b\u5f55\u540e\u5c06\u81ea\u52a8\u52a0\u8f7d\u8bfe\u7a0b</div></div>
          </div>
          <div class="qlt-pane" data-pane="chapter">
            <div class="qlt-list-head">
              <span class="qlt-list-title">\u7ae0\u8282\u9884\u89c8</span>
              <span class="qlt-list-tag">\u5b9e\u65f6\u8fdb\u5ea6</span>
            </div>
            <div id="qlt-chapter-preview"><div class="qlt-empty-state">\u8bf7\u52fe\u9009\u8bfe\u7a0b</div></div>
          </div>
          <div class="qlt-pane" data-pane="log">
            <div class="qlt-list-head">
              <span class="qlt-list-title">\u8fd0\u884c\u65e5\u5fd7</span>
              <button id="qlt-clear-log" class="qlt-log-clear-btn" type="button">\u6e05\u7a7a</button>
            </div>
            <div id="qlt-run-log"></div>
          </div>
          <div class="qlt-pane" data-pane="settings">
            <div class="qlt-list-head">
              <span class="qlt-list-title">\u6388\u6743\u4e0e\u9009\u9879</span>
              <span class="qlt-list-tag">\u8bbe\u7f6e</span>
            </div>
            <div class="qlt-meta-row">
              <span class="qlt-meta-label">\u7528\u6237\u7c7b\u578b</span>
              <span class="qlt-meta-value qlt-auth-badge" id="qlt-cloud-tier">\u672a\u6821\u9a8c</span>
            </div>
            <div class="qlt-meta-row">
              <span class="qlt-meta-label" id="qlt-cloud-free-label">\u514d\u8d39\u4f53\u9a8c\u8bfe\u7a0b</span>
              <span class="qlt-meta-value" id="qlt-cloud-free">0/${FREE_CHAPTER_LIMIT_DEFAULT}</span>
            </div>
            <div class="qlt-meta-row" style="flex-wrap:wrap;gap:6px;">
              <span class="qlt-meta-label">Token</span>
              <input id="qlt-cloud-token" type="text" placeholder="\u5347\u7ea7Pro\u7c98\u8d34Token\uff08\u53ef\u9009\uff09" style="flex:1;min-width:100px;border:1px solid #cbd5e1;border-radius:8px;padding:4px 7px;font-size:12px"/>
              <button id="qlt-cloud-save" class="qlt-btn qlt-btn-ghost" type="button" style="padding:4px 7px;font-size:12px;">\u4fdd\u5b58\u5e76\u6821\u9a8c</button>
              <button id="qlt-open-pro" class="qlt-btn-pro" type="button">\u5347\u7ea7Pro</button>
            </div>
            <div class="qlt-meta-row qlt-hidden">
              <span class="qlt-meta-label">\u4e91\u7aef\u670d\u52a1</span>
              <span class="qlt-meta-value" id="qlt-cloud-base">${escapeHtml(DEFAULT_CLOUD_API_BASE)}</span>
            </div>
          </div>
        </div>
        <div class="qlt-card">
          <div class="qlt-meta-row"><span class="qlt-meta-label">\u5f53\u524d\u8bfe\u7a0b</span><span class="qlt-meta-value" id="qlt-cur-course">-</span></div>
          <div class="qlt-meta-row"><span class="qlt-meta-label">\u5f53\u524d\u8bfe\u4ef6</span><span class="qlt-meta-value" id="qlt-cur-doc">-</span></div>
          <div class="qlt-meta-row"><span class="qlt-meta-label">\u8bfe\u4ef6\u8fdb\u5ea6</span><span class="qlt-progress-num" id="qlt-progress-num">0<small>%</small></span></div>
        </div>
        <div class="qlt-card">
          <div class="qlt-meta-row" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <span class="qlt-meta-label">\u5b66\u4e60\u6a21\u5f0f</span>
            <select id="qlt-speed" class="qlt-input" style="flex:1;min-width:140px;">
              ${Object.values(SPEED_MODES)
                .map(
                  (m) =>
                    `<option value="${escapeHtml(m.id)}"${
                      m.id === state.speedMode ? " selected" : ""
                    }>${escapeHtml(m.label)}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="qlt-btn-row">
            <button class="qlt-btn qlt-btn-start" id="qlt-btn-start" type="button">\u5f00\u59cb</button>
            <button class="qlt-btn qlt-btn-stop qlt-btn-off" id="qlt-btn-stop" type="button" disabled>\u505c\u6b62</button>
          </div>
        </div>
      </div>
      <div class="qlt-footer-extra">
        <div class="qlt-ann"><span id="qlt-ann-text">${PANEL_NOTICE_FALLBACK}</span></div>
        <div class="qlt-qq-row">
          <div>
            <div class="qlt-qq-text">\u52a0\u5165QQ\u7fa4\uff1a${QQ_GROUP_NUMBER}</div>
            <div class="qlt-qq-title">\u5c71\u4e1c\u7701\u6559\u5e08\u6559\u80b2\u7f51\u5b66\u4e60\u52a9\u624b · \u4ea4\u6d41\u7fa4</div>
          </div>
          <button id="qlt-join-qq" class="qlt-qq-btn" type="button">\u52a0\u5165</button>
        </div>
      </div>
      <div id="qlt-panel-footer">\u961f\u5217\u72b6\u6001\uff1a<span id="qlt-queue-text">\u672a\u9009\u62e9</span></div>
    `;

    document.documentElement.appendChild(panel);
    enableDrag(panel);

    if (localStorage.getItem(PANEL_COLLAPSED_KEY) === "1") {
      panel.classList.add("qlt-min");
    }

    panel.querySelector("#qlt-btn-min")?.addEventListener("click", () => {
      panel.classList.toggle("qlt-min");
      localStorage.setItem(
        PANEL_COLLAPSED_KEY,
        panel.classList.contains("qlt-min") ? "1" : "0"
      );
    });

    panel.querySelectorAll(".qlt-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchPanelTab(btn.dataset.tab));
    });

    panel.querySelector("#qlt-project-select")?.addEventListener("change", async (e) => {
      const pid = String(e.target.value || "").trim();
      if (!pid) return;
      rememberProjectId(pid);
      try {
        setStatus("\u5237\u65b0\u4e2d");
        await loadLessons();
        setStatus("\u5df2\u505c\u6b62");
      } catch (err) {
        log(String(err?.message || err));
        setStatus("\u5df2\u505c\u6b62");
      }
    });
    panel.querySelector("#qlt-btn-refresh")?.addEventListener("click", async () => {
      try {
        setStatus("\u5237\u65b0\u4e2d");
        await loadLessons();
        setStatus("\u5df2\u505c\u6b62");
        void refreshChapterPreview();
      } catch (e) {
        log(String(e?.message || e));
        setStatus("\u5df2\u505c\u6b62");
      }
    });
    panel.querySelector("#qlt-btn-select-pending")?.addEventListener("click", () => {
      selectByFilter(isLessonPending);
    });
    panel.querySelector("#qlt-btn-start")?.addEventListener("click", () => runStudy());
    panel.querySelector("#qlt-btn-stop")?.addEventListener("click", () => stopStudy());
    panel.querySelector("#qlt-clear-log")?.addEventListener("click", () => clearRunLog());
    panel.querySelector("#qlt-open-pro")?.addEventListener("click", () => openProModal());
    panel.querySelector("#qlt-join-qq")?.addEventListener("click", () => {
      try {
        GM_openInTab(QQ_GROUP_LINK, { active: true, insert: true, setParent: true });
      } catch (_) {
        window.open(QQ_GROUP_LINK, "_blank");
      }
    });
    panel.querySelector("#qlt-speed")?.addEventListener("change", (e) => {
      const v = String(e.target.value || "sec");
      state.speedMode = SPEED_MODES[v] ? v : "sec";
      localStorage.setItem(SPEED_KEY, state.speedMode);
    });
    panel.querySelector("#qlt-cloud-save")?.addEventListener("click", async () => {
      const input = panel.querySelector("#qlt-cloud-token");
      state.cloudToken = String(input?.value || "").trim();
      state.cloudRevoked = false;
      localStorage.setItem(CLOUD_TOKEN_KEY, state.cloudToken);
      writeCloudLeaseCache("", 0);
      state.cloudLease = "";
      state.cloudLeaseExp = 0;
      try {
        if (state.user || (await refreshUser().catch(() => null))) {
          if (state.cloudToken) await cloudVerifyToken();
          await ensureLease(true);
          log("\u6388\u6743\u5df2\u66f4\u65b0");
        } else {
          log("\u8bf7\u5148\u767b\u5f55");
        }
      } catch (e) {
        log("\u6388\u6743\u65e0\u6548\u8bf7\u68c0\u67e5 Token");
        console.debug(e);
      }
      updateCloudPanelUI();
    });

    const logEl = panel.querySelector("#qlt-run-log");
    if (logEl) {
      logEl.innerHTML = state.logs
        .slice(0, 30)
        .map((s) => `<div class="qlt-log-row">${escapeHtml(s)}</div>`)
        .join("");
    }
    updateCloudPanelUI();
    updateQueueSummary();
    syncRunButtons();
  }

  function isPlayerHost(host) {
    const h = String(host || location.hostname || "").toLowerCase();
    return h === "player.qlteacher.com" || h.endsWith(".player.qlteacher.com");
  }

  function showPlayerPageTip() {
    if (document.getElementById("qlt-player-tip")) return;
    const tip = document.createElement("div");
    tip.id = "qlt-player-tip";
    tip.innerHTML = `
      <div class="qlt-player-tip-card">
        <div class="qlt-player-tip-title">${escapeHtml(PRODUCT_NAME)}</div>
        <div class="qlt-player-tip-text">\u5f53\u524d\u662f\u64ad\u653e\u5668\u9875\u9762\uff0c\u8bf7\u5230<strong>\u8bfe\u7a0b\u76ee\u5f55\u9875</strong>\u8fd0\u884c\u52a9\u624b\uff08\u9996\u9875 / \u7814\u4fee\u7ad9\u9009\u8bfe\u540e\u518d\u5f00\u59cb\uff09\u3002</div>
        <div class="qlt-player-tip-actions">
          <a class="qlt-player-tip-btn" href="https://zone.qlteacher.com/" target="_blank" rel="noopener">\u6253\u5f00\u9996\u9875</a>
          <a class="qlt-player-tip-btn qlt-player-tip-btn2" href="https://yxjc.qlteacher.com/" target="_blank" rel="noopener">\u6253\u5f00\u7814\u4fee\u7ad9</a>
          <button type="button" class="qlt-player-tip-close" id="qlt-player-tip-close">\u77e5\u9053\u4e86</button>
        </div>
      </div>`;
    const st = document.createElement("style");
    st.textContent = `
      #qlt-player-tip{position:fixed;right:18px;bottom:18px;z-index:999999;max-width:360px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;}
      .qlt-player-tip-card{background:#fff;border:1px solid #dbe4f0;border-radius:14px;box-shadow:0 14px 36px rgba(15,23,42,.18);padding:12px 14px;color:#0f172a;}
      .qlt-player-tip-title{font-size:13px;font-weight:900;color:#9a3412;margin-bottom:6px;}
      .qlt-player-tip-text{font-size:12px;line-height:1.5;color:#334155;}
      .qlt-player-tip-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
      .qlt-player-tip-btn{display:inline-block;text-decoration:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:800;}
      .qlt-player-tip-btn2{background:linear-gradient(135deg,#059669,#10b981);}
      .qlt-player-tip-close{border:1px solid #cbd5e1;background:#f8fafc;color:#475569;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;}
    `;
    (document.head || document.documentElement).appendChild(st);
    document.documentElement.appendChild(tip);
    tip.querySelector("#qlt-player-tip-close")?.addEventListener("click", () => tip.remove());
  }

  async function boot() {
    const host = String(location.hostname || "");
    if (!/\.?qlteacher\.com$/i.test(host) && host !== "qlteacher.com") return;

    if (isPlayerHost(host)) {
      const show = () => {
        if (!document.documentElement) return false;
        showPlayerPageTip();
        return true;
      };
      if (!show()) {
        const t = setInterval(() => {
          if (show()) clearInterval(t);
        }, 300);
      }
      return;
    }

    const mount = () => {
      if (!document.documentElement) return false;
      createPanel();
      return true;
    };
    if (!mount()) {
      const t = setInterval(() => {
        if (mount()) clearInterval(t);
      }, 300);
    }

    setTimeout(async () => {
      try {
        await waitForBearer(10000);
        if (state.bearer) {
          try {
            await refreshUser();
          } catch (_) {}
        }
        try {
          await loadProjects();
          const pid = await resolveProjectId();
          if (pid) {
            rememberProjectId(pid);
            await loadLessons();
          } else if (state.projects.length) {
            log(`\u5df2\u627e\u5230 ${state.projects.length} \u4e2a\u9879\u76ee\uff0c\u8bf7\u5728\u9762\u677f\u4e0b\u62c9\u6846\u4e2d\u9009\u62e9`);
          }
        } catch (e) {
          log(String(e?.message || e).slice(0, 120));
        }
        ensureLease(false).catch(() => {});
        fetchPanelNotice();
      } catch (_) {}
    }, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
