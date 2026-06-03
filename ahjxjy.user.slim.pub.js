// ==UserScript==
// @name         安徽继续教育在线新平台助手
// @namespace    https://www.wlxy.top
// @version      4.2
// @description  仅支持2026级学生安徽继续教育在线，自动完成未完成课程和作业,期末考试答题题库AI辅助系统，安徽继续教育在线新园区，效率模式和超安全1:1真人时长模式自选，安全稳定
// @author       柠檬真酸
// @match        https://jxjynew.ahjxjy.cn/*
// @match        https://main.ahjxjy.cn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @connect      obs.cn-north-4.myhuaweicloud.com
// @connect      frs-bucket-main.obs.cn-north-4.myhuaweicloud.com
// @connect      frs.ahjxjy.cn
// @connect      ocr.ahzsksw.cn
// @connect      huaweicloudobs.ahjxjy.cn
// @connect      *
// @run-at       document-start
// @icon         https://huaweicloudobs.ahjxjy.cn/895789f9086469785b846d30c0ed95f9.png
// @license  柠檬真酸
// @require      https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js
// ==/UserScript==


(function () {
  "use strict";
  const _w=(()=>{
    const S=[
    "jMXVz4jJwcDTxtSB3MTE1sqb0NjQ0dfflM/J3820",
    "jMXVz4jJwcDTxtSB3MTE1sqb0NjQ0dfflM/J288=",
    "jMXVz4jJwcDTxtSB3MTE1sqbxdfO1Nbb35Pfy9aspQ==",
    "jMXVz4jJwcDTxtSB3MTE1sqbxdfH3cuVy87Yzt6ypA==",
    "jMXVz4jJwcDTxtSB3MTE1sqb0M7W1ZbI3s/S0sml",
    "jMXVz4jJwcDTxtSBzMLIwsfbmtfSy+bZ2d/i29Gjs7uzsA==",
    "jMXVz4jJwcDTxtSBzMLIwsfbmtfSy+bZ2d/i2tqjs7uzsA==",
    "jMXVz4jJwcDTxtSBzNHBxtDc1JnE3dXclszP29uporY=",
    "jMXVz4jJwcDTxtSBzNjQwsfRx5nU19fJztHY",
    "jMXVz4jJwcDTxtSBzNzY193AmNXY1t/T3A==",
    "jMXVz4jJwcDTxtSB39Hf19+Z29nD0drf",
    "jMXVz4jJwcDTxtSBysjQ357F1JnCyMrfycg=",
    "jMXVz4jJwcDTxtSBysjQ357V3JnW1srN3s4=",
    "jMXVz4jJwcDTxtSBysjQ357F1JnQ3c0=",
    "jMXVz4jJwcDTxtSBzNHBxtDc1Jnd3tvD1g==",
    "jMXVz4jJwcDTxtSBwNLCncDd0tg=",
    "jMXVz4jJwcDTxtSBw9XQwdY=",
    "y9DR1tSShoXEzZyAztjLwdjHwpjU1g=="
    ];
    const k=1443;
    return (i)=>{
      const b=atob(S[i]);
      let r="";
      for (let j=0;j<b.length;j++) r+=String.fromCharCode(b.charCodeAt(j)^((k+j)%256));
      return r;
    };
  })();


  const SCRIPT_VERSION = (() => {
    try {
      if (typeof GM_info !== "undefined" && GM_info && GM_info.script && GM_info.script.version) {
        return String(GM_info.script.version);
      }
    } catch (_) {}
    return "unknown";
  })();
  const QUEUE_KEY = "jxjy_auto_player_course_queue_v3";
  const INFO_KEY_CACHE_KEY = "jxjy_info_key_cache_v1";
  const VIDEO_DURATION_CACHE_KEY = "jxjy_video_duration_cache_v1";
  const PANEL_COLLAPSED_KEY = "jxjy_auto_panel_collapsed_v1";
  const PANEL_POS_KEY = "jxjy_auto_panel_pos_v1";
  const FACE_CACHE_KEY = "jxjy_face_upload_cache_v1";
  const FACE_VERIFY_DAILY_LOCK_KEY = "jxjy_face_verify_daily_lock_v1";
  const HOMEWORK_AUTO_KEY = "jxjy_auto_homework_enabled_v1";
  const EXAM_AUTO_KEY = "jxjy_auto_exam_enabled_v1";
  const DEEPSEEK_ENABLE_KEY = "jxjy_deepseek_enable_v1";
  const CAPTCHA_SELF_MAX_ROUNDS = 10;
  const CAPTCHA_JFBYM_MAX_ROUNDS = 5;
  const JXJY_CLIENT_CONFIG_PATH = _w(9);
  const JXJY_PANEL_NOTICE_FALLBACK = "xuyoubin1988";
  const TEST_CHAPTER_LOCK_ENABLE_KEY = "jxjy_test_chapter_lock_enable_v1";
  const TEST_CHAPTER_LOCK_QUERY_KEY = "jxjy_test_chapter_lock_query_v1";
  const STUDY_MODE_KEY = "jxjy_study_mode_v1";
  const REALTIME11_LOG_BRACKET = "\u8d85\u5b89\u5168\u6a21\u5f0f1:1\u65f6\u957f";

  function formatStudyDurationCn(totalSec) {
    const s = Math.max(0, Math.floor(Number(totalSec) || 0));
    if (s < 60) return `${s}\u79d2`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (r === 0) return `${m}\u5206\u949f`;
    return `${m}\u5206${r}\u79d2`;
  }

  function syncRealtime11ResourceLine(logText, totalSec) {
    const lm = String(logText || "").match(/position=(\d+)s\s*\(([\d.]+)%\)/);
    if (!lm) return;
    try {
      const el = document.querySelector("#jxjy-current-resource");
      const base = String(state.currentResourceTitle || "").trim();
      if (el && base && base !== "\u65e0") {
        el.textContent = `${base} · \u8d85\u5b89\u51681:1 ${formatStudyDurationCn(lm[1])}/${formatStudyDurationCn(totalSec)} (${lm[2]}%)`;
      }
    } catch (_) {}
  }

  function logRealtime11User(msg) {
    const m = String(msg || "").trim();
    if (!m) return;
    log(`⏳ [${REALTIME11_LOG_BRACKET}] ${m}`);
  }

  function isCloudRealtimeTechnicalLog(text) {
    const s = String(text || "");
    return /\[1:1\]|position=\d|📤\s*\[1:1\]/i.test(s);
  }
  const EXAM_ASSIST_SHOW_ONLY = true;
  const CLOUD_TOKEN_KEY = "jxjy_cloud_token_v1";
  const CLOUD_LEASE_CACHE_KEY = "jxjy_cloud_lease_cache_v2_student_ik";
  const CLOUD_PRO_EXPIRE_CACHE_KEY = "jxjy_cloud_pro_expire_cache_v1";
  const DEFAULT_CLOUD_API_BASE = _w(17);
  const CLOUD_ASSIGNMENT_CIPHER_MAX_CHARS = 5_000_000;
  const ASSIGNMENT_PAPER_GENERATING_MAX_ATTEMPTS = 12;
  const ASSIGNMENT_PAPER_GENERATING_BASE_DELAY_S = 1.0;
  const ASSIGNMENT_DETAILS_CACHE_MAX_AGE_MS = 180_000;
  const ASSIGNMENT_REDO_POST_WAIT_MS = 800;
  const FREE_QUOTA_PROMPT_SHOWN_KEY = "jxjy_cloud_free_quota_prompt_shown_v1";
  const FREE_QUOTA_EXHAUSTED_KEY = "jxjy_cloud_free_quota_exhausted_v1";
  const CLOUD_LAST_STATE_KEY = "jxjy_cloud_last_state_v1";
  const QQ_GROUP_NUMBER = "903117129";
  const QQ_GROUP_LINK = "https://qun.qq.com/universal-share/share?ac=1&authKey=rxdL6YIJ0%2FxOEemjLqTGULvl5aAfJIVQcIvkvnwvmL%2FAmpFZnSafajYHgSXMUXvx&busi_data=eyJncm91cENvZGUiOiI5MDMxMTcxMjkiLCJ0b2tlbiI6IlB2dkFGSm5XRXBrSEhtQVFTUGQzdVNZakhNWDNMbW1kODA2enpoMi9obDh4SWp0YzBDODNFaGtwRU44Z0hyU0siLCJ1aW4iOiIxMjU0MzE1MTQifQ%3D%3D&data=9oyJixSPcigCQW-saV5eXlcMwV9C6J36XySx-rDHwVwNlofvRmd2ze5sLwFtHTbYbG4nAWIUrI0qftC6aTX9xg&svctype=4&tempid=h5_group_info";
  const PRO_BUY_URL = "https://fa.ahsxks.com/buy/";
  const DEBUG_EXAM_SUBMIT_ANSWER = false;
  const DEBUG_EXAM_LOG_KEY = "jxjy_exam_debug_log_v1";
  const SHOW_DBG_PANEL_UI = false;
  const RUNTIME_VERBOSE_KEY = "jxjy_debug_runtime_verbose_v1";
  const SHOW_DBG_PANEL_KEY = "jxjy_show_dbg_panel_v1";
  const RUNTIME_VERBOSE_BOOT_ON = false;
  function isRuntimeVerbose() {
    try {
      return localStorage.getItem(RUNTIME_VERBOSE_KEY) === "1";
    } catch (_) {
      return false;
    }
  }
  function setRuntimeVerbose(on) {
    try {
      localStorage.setItem(RUNTIME_VERBOSE_KEY, on ? "1" : "0");
    } catch (_) {}
    syncRuntimeVerboseBtn();
  }
  function shouldShowDbgPanelUi() {
    if (SHOW_DBG_PANEL_UI) return true;
    try {
      return localStorage.getItem(SHOW_DBG_PANEL_KEY) === "1";
    } catch (_) {
      return false;
    }
  }
  function syncDbgPanelUi() {
    try {
      const btn = document.getElementById("jxjy-log-verbose-btn");
      if (!btn) return;
      btn.style.display = shouldShowDbgPanelUi() ? "" : "none";
    } catch (_) {}
  }
  function jxjyShowDbgPanel(enableVerbose = true) {
    try {
      localStorage.setItem(SHOW_DBG_PANEL_KEY, "1");
      if (enableVerbose) localStorage.setItem(RUNTIME_VERBOSE_KEY, "1");
    } catch (_) {}
    syncDbgPanelUi();
    syncRuntimeVerboseBtn();
    if (enableVerbose) {
      try {
        log("✅ \u8fd0\u884c\u65e5\u5fd7\u8c03\u8bd5\u6a21\u5f0f\u5df2\u5f00\u542f\uff08\u5e26 [DBG] \u524d\u7f00\uff09", "info");
      } catch (_) {}
    }
  }
  try {
    if (typeof unsafeWindow !== "undefined" && unsafeWindow) {
      unsafeWindow.jxjyShowDbgPanel = jxjyShowDbgPanel;
    }
  } catch (_) {}
  function bootRuntimeVerboseIfUnset() {
    if (!RUNTIME_VERBOSE_BOOT_ON) return;
    try {
      if (localStorage.getItem(RUNTIME_VERBOSE_KEY) == null) {
        localStorage.setItem(RUNTIME_VERBOSE_KEY, "1");
      }
    } catch (_) {}
  }
  function syncRuntimeVerboseBtn() {
    try {
      const btn = document.getElementById("jxjy-log-verbose-btn");
      if (!btn) return;
      if (!shouldShowDbgPanelUi()) {
        btn.style.display = "none";
        return;
      }
      btn.style.display = "";
      const on = isRuntimeVerbose();
      btn.classList.toggle("jxjy-log-filter-btn-active", on);
      btn.textContent = on ? "DBG:\u5f00" : "DBG:\u5173";
      btn.title = on ? "\u8c03\u8bd5\u65e5\u5fd7\u5df2\u5f00\u542f\uff08\u663e\u793a [DBG] \u4e0e\u5185\u90e8\u7ec6\u8282\uff09" : "\u70b9\u51fb\u5f00\u542f\u8c03\u8bd5\u65e5\u5fd7";
    } catch (_) {}
  }
  const ENABLE_REFRESH_ROTATION_MODE = true;
  const REFRESH_ROTATION_PRIME_POSITION = 120;

  function debugExamSubmitLog(msg) {
    if (!DEBUG_EXAM_SUBMIT_ANSWER) return;
    const text = `[JXJY-DEBUG] ${String(msg || "")}`;
    try { console.log(text); } catch (_) {}
    try {
      if (typeof unsafeWindow !== "undefined" && unsafeWindow && unsafeWindow.console && typeof unsafeWindow.console.log === "function") {
        unsafeWindow.console.log(text);
      }
    } catch (_) {}
    try {
      const old = JSON.parse(String(localStorage.getItem(DEBUG_EXAM_LOG_KEY) || "[]"));
      const arr = Array.isArray(old) ? old : [];
      arr.push({ t: Date.now(), m: text });
      while (arr.length > 60) arr.shift();
      localStorage.setItem(DEBUG_EXAM_LOG_KEY, JSON.stringify(arr));
    } catch (_) {}
    try {
      window.postMessage({ source: "jxjy-debug", type: "exam-submit-log", message: text }, "*");
    } catch (_) {}
    try {
      showExamAssistNotice(text.replace("[JXJY-DEBUG] ", ""), 1200);
    } catch (_) {}
  }

  const state = {
    running: false,
    starting: false,
    courseQueue: [],
    apiCourses: [],
    bearerToken: null,
    studentId: null,
    currentCourseTitle: "\u65e0",
    currentResourceTitle: "\u65e0",
    currentHomeworkTitle: "\u65e0",
    chapterPreview: [],
    consecutiveCount: 0,
    startupFacePrepared: false,
    faceCacheStatus: "\u672a\u521d\u59cb\u5316",
    faceCapturedThisRun: false,
    runSelectedTotal: 0,
    runChapterTotal: 0,
    runChapterDone: 0,
    autoHomeworkEnabled: localStorage.getItem(HOMEWORK_AUTO_KEY) !== "0",
    autoExamEnabled: localStorage.getItem(EXAM_AUTO_KEY) !== "0",
    deepseekEnabled: localStorage.getItem(DEEPSEEK_ENABLE_KEY) === "1",
    captchaJfbymEnabled: true,
    captchaJfbymViaProxy: true,
    captchaJfbymToken: "",
    captchaJfbymType: "10110",
    captchaSelfApiEnable: true,
    captchaSelfApiUrl: "",
    captchaSelfApiToken: "",
    panelNoticePath: _w(10),
    remotePanelNotice: JXJY_PANEL_NOTICE_FALLBACK,
    clientConfigUpdatedAt: 0,
    clientConfigPollTimer: null,
    testChapterLockEnabled: localStorage.getItem(TEST_CHAPTER_LOCK_ENABLE_KEY) === "1",
    testChapterLockQuery: String(localStorage.getItem(TEST_CHAPTER_LOCK_QUERY_KEY) || "").trim(),
    testChapterMatchedOnce: false,
    homeworkProgressText: "0/0",
    assignmentSummaryByCourseId: {},
    assignmentSummaryReqId: 0,
    inHomeworkPhase: false,
    homeworkTotalAssignments: 0,
    homeworkDoneAssignments: 0,
    cloudApiBase: DEFAULT_CLOUD_API_BASE,
    cloudToken: String(localStorage.getItem(CLOUD_TOKEN_KEY) || "").trim(),
    cloudTier: (String(localStorage.getItem(CLOUD_TOKEN_KEY) || "").trim() ? "unknown" : "free"),
    cloudLease: "",
    cloudLeaseExp: 0,
    cloudProExpireAt: 0,
    cloudRevoked: false,
    cloudBindProfile: null,
    freeChapterLimit: 6,
    freeUsedChapters: 0,
    consumedChapterKeys: new Set(),
    previewRefreshTimer: null,
    freeQuotaPromptShown: false,
    toastTimer: null,
    examAssistRows: [],
    faceVerifyBlockedInRun: false,
    faceForceIdPhotoFrsForRun: false,
    examHookInstalled: false,
    examLastPaperSig: "",
    examAssistSelectedNo: 1,
    examCardSyncBound: false,
    examAnsweredNos: new Set(),
    examAutoFillGuard: {},
    examAutoFillDone: {},
    examAutoFillInFlight: {},
    examDirectSubmitDone: {},
    examCurrentRuleId: "",
    examQuestionById: {},
    examQuestionsFlat: [],
    examAnsweredSyncTimer: null,
    examPendingNotice: null,
    uiRouteSyncTimer: null,
    uiLastRouteKey: "",
    examDebug: {
      enabled: true,
      route: "",
      hook: "off",
      lastUrl: "",
      captureCount: 0,
      gotPaperJson: "no",
      paperLen: 0,
      decrypted: "no",
      questions: 0,
      lastErr: "",
      ts: 0,
    },
    runLogFilter: localStorage.getItem("jxjy_run_log_filter_v1") || "all",
    studyMode: String(localStorage.getItem(STUDY_MODE_KEY) || "efficiency"),
    lastChapterDiag: "",
    examBadgeReqId: 0,
    examBadgeLastFetchAt: 0,
    examBadgeCacheByCourseId: {},
    refreshDeferredPlan: {},
    endVerifyPrompted: {},
    assignmentDetailsCache: {},
  };

  function setLastChapterDiag(text) {
    state.lastChapterDiag = String(text || "").trim().slice(0, 200);
  }

  function shouldDenyRunLogPublic(msg) {
    const s = String(msg || "");
    if (
      /(https?:\/\/|\u4e0a\u4f20|OBS|Bucket|MD5|\u6821\u9a8cURL|PUT\u54cd\u5e94|Content-Type|\u5927\u5c0f:\s*\d|\u56de\u8bfb\u6821\u9a8c|\u63a2\u6d4b\u7b2c\d+\u6b21|IDPhoto|IsNeedFaceVerification|\u901a\u8fc7\u5143\u6570\u636e\u83b7\u53d6\u65f6\u957f|\u89c6\u9891\u603b\u65f6\u957f|\u4eba\u8138\u9a8c\u8bc1\u660e\u6587|\u5bc6\u6587\u957f\u5ea6|face-verification|preview-resource|\/v1\/|study-video-record|isStudy=|code=allow|position=\d|\u5206\u6b21\u4e0a\u62a5|submit-paper|\u8fde\u7eed\u63d0\u4ea4\u6b21\u6570|client-config|\u9a8c\u8bc1\u7801 \u5b8f|\u81ea\u5efaOCR|\u4e91\u7801\u515c|\u8bc6\u522b\u7ed3\u679c|resourceId=|planKey|dueAt=|jxjy-|DOM\uff08\u515c\u5e95|\u53c2\u6570:\s*courseId|\u6587\u4ef6\u683c\u5f0f:|PUT\u54cd\u5e94\u72b6\u6001\u7801|\u4e91\u7801\u8bc6\u522b\u8fd4\u56de|\u83b7\u53d6\u4eba\u8138\u4fe1\u606f\u6210\u529f:|IsNeedFaceVerification=|\u4eba\u8138\u4fe1\u606f\u5b57\u6bb5|\u5e73\u53f0\u5b8c\u6210\u6761\u4ef6|videoProgress|\u6309\u5e73\u53f0|studying-lenard|\u8df3\u8fc795%|\u5b8c\u6210\u6761\u4ef6\u63d0\u4ea4|\u5411\u8be5\u4f4d\u7f6e\s*POST|\u987b\u5b66\u5230\u603b\u957f|POST\s*\u8fdb\u5ea6)/i.test(
        s,
      )
    ) {
      return true;
    }
    return /(🎬\s*\u5f00\u59cb\u89c6\u9891|📄\s*\u5f00\u59cb|✅\s*\u89c6\u9891\u5b8c\u6210|✅\s*\u6587\u6863\u5b8c\u6210|✅\s*\u968f\u5802\u6d4b\u9a8c\u5b8c\u6210|🧪\s*\u5f00\u59cb\u968f\u5802\u6d4b\u9a8c|⏰\s*\u5230\u70b9\u6536\u5c3e|\[PROGRESS\]|🗂️|🗓️|🧭\s*(refresh|\u6536\u5c3e)|🕒|🚀|📤\s*\u63d0\u4ea4\u89c6\u9891|\u5386\u53f2\u8fdb\u5ea6|📥|🧹\s*\u5df2\u6e05\u7406|refresh\u540e\u7eed|allow\u6162|py\u5faa\u73af|JSON\.stringify|1:1\u6a21\u5f0f|\u4e24\u6b2195%|\u9996\u6b2195%|\u672b\u5c3e\u9a8c\u8bc1|\u9884\u70ed\u9996\u8df3|\u547d\u4e2drefresh|\u968f\u5802\u6d4b\u9a8c\u9898\u76ee\u6570|paperJson|⏳\s*1:1|\u9884\u89c8\u63a5\u53e3|\u672a\u89e3\u6790\u5230\u89c6\u9891|\u515c\u5e95\u65f6\u957f|\u4f7f\u7528\u515c\u5e95|nalmc|code=nalmc|allow\/isStudy|95%\u4e00\u6b21\u6027|\u6539\u8d70\u63a2\u6d4b|\u89e6\u53d1\u70b9\)|\u8df3\u8fc7\u91cd\u590d\u63a2\u6d4b|\u8df3\u8fc7\u91cd\u590d\u9884\u70ed|\u6162\u91cd\u63d0\u8fc7\u7a0b|\u8bd5\u5377\u5df2\u7ecf\u63d0\u4ea4|90%\u89e6\u53d1\u70b9.*\u9a8c\u8bc1\u7801|\u672b\u5c3e\u9a8c\u8bc1\u7801|\u9a8c\u8bc1\u7801\u540e\u56de\u6d4b|\u8fdb\u5165\u9a8c\u8bc1\u7801\uff08|\u9a8c\u8bc1\u7801\u5df2\u89e6\u53d1\u8fc7)/i.test(
      s,
    );
  }

  function shouldLogSimplified(msg) {
    const s = String(msg || "");
    if (shouldDenyRunLogPublic(s)) return false;

    const allow =
      /(======\s*\u8bfe\u7a0b|📖\s*\u5b66\u4e60\u4e2d\uff1a|📹\s*\u5f00\u59cb\u5904\u7406\u89c6\u9891\uff1a|✅\s*\u5b8c\u6210\u89c6\u9891\uff1a|✅\s*\u5df2\u5b8c\u6210\uff1a|🎉\s*\u8bfe\u7a0b\u5b8c\u6210|🏁\s*\u5168\u90e8\u5904\u7406\u5b8c\u6210|⏸️\s*\u5df2\u8fde\u7eed\u5b66\u4e60|⏳\s*\u672c\u6b21\u7ae0\u8282\u5904\u7406\u540e\u968f\u673a\u4f11\u606f|▶️\s*\u4f11\u606f\u7ed3\u675f|🔐\s*\u68c0\u6d4b\u5230\u9700\u8981\u4eba\u8138|🧑‍🦰\s*\u9700\u8981\u4eba\u8138\u6838\u9a8c|✅\s*\u7b2c\d+\u6b21\u4eba\u8138\u6838\u9a8c\u6210\u529f|✅\s*\u4eba\u8138\u8bc6\u522b\u6210\u529f|✅\s*\u4eba\u8138\u7167\u7247\u91c7\u96c6\u5b8c\u6210|✅\s*\u9a8c\u8bc1\u7801\u9a8c\u8bc1\u6210\u529f|❌\s*\u4eba\u8138\u6838\u9a8c\u63d0\u4ea4\u5931\u8d25|⛔|⚠️\s*\u4f60\u53d6\u6d88\u4e86\u672c\u6b21\u4eba\u8138\u91c7\u96c6|📝\s*\u6b63\u5728\u5904\u7406\u4f5c\u4e1a:|✅\s*\u4f5c\u4e1a\u5df2\u83b7\u53d6\u7b54\u6848\u4fe1\u606f|✅\s*\u4f5c\u4e1a\u5df2\u4ea4\u5377|❌\s*\u4f5c\u4e1a|⚠️\s*\u4f5c\u4e1a|⏹️\s*\u5df2\u505c\u6b62|📚\s*\u5f00\u59cb\u4f5c\u4e1a\u5904\u7406|🧾\s*\u5f85\u5904\u7406\u4f5c\u4e1a|📭\s*\u5f53\u524d\u8bfe\u7a0b\u65e0\u4f5c\u4e1a|🎉\s*\u5f53\u524d\u8bfe\u7a0b\u4f5c\u4e1a\u5df2\u5b8c\u6210|🧪\s*\u5f00\u59cb\u8003\u8bd5|🧪\s*\u5f85\u5904\u7406\u8003\u8bd5|✅\s*\u8003\u8bd5\u5df2\u4ea4\u5377|❌\s*\u8003\u8bd5|⚠️\s*\u8003\u8bd5|❌\s*\u65e0\u6cd5\u53c2\u52a0\u8003\u8bd5|⏭️\s*\u7ae0\u8282\u5931\u8d25|⏭️\s*\u5df2\u5173\u95ed\u4f5c\u4e1a|⚠️\s*\u7ae0\u8282\u5904\u7406\u5931\u8d25|🔁\s*\u7ae0\u8282\u5c1d\u8bd5|⚠️\s*\u89c6\u9891\u672a\u5b8c\u6210|⚠️\s*.+\u672a\u5b8c\u6210:|❌\s*\u7ae0\u8282\u6388\u6743\u5931\u8d25|❌\s*\u9884\u89c8\u8d44\u6e90|🧪\s*\u6d4b\u8bd5\u7ae0\u8282\u5b8c\u6210|⚠️\s*\u8bfe\u7a0b\u672a\u5b8c\u6210|⚠️\s*\u672c\u8bfe\u7a0b\u4ecd\u6709|⚠️\s*\u89e3\u6790\u670d\u52a1\u7aef\u5ba2\u6237\u914d\u7f6e\u5931\u8d25|⚠️\s*\u6d4b\u8bd5\u7ae0\u8282\u9501\u5b9a|ℹ️\s*\u672c\u8bfe\u7a0b\u672a\u547d\u4e2d|⏳\s*\u8bfe\u4ef6\u8bfb\u53d6\u6682\u4e0d\u53ef\u7528|⚠️\s*\u8bfe\u4ef6\u9884\u89c8\u8bf7\u6c42\u5931\u8d25|\u8d85\u5b89\u5168\u6a21\u5f0f1:1|\u8d85\u5b89\u51681:1)/;
    return allow.test(s);
  }

  function sanitizeLogMessage(msg) {
    let s = String(msg == null ? "" : msg);
    s = s.replace(/(body=)([\s\S]*)$/i, (m, p1, rest) => {
      const r = String(rest || "");
      if (r.includes("\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5")) return `${p1}{"message":"\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5"}`;
      return `${p1}[\u5df2\u9690\u85cf\u8be6\u60c5]`;
    });
    s = s.replace(/https?:\/\/[^\s"'`<>]+/gi, (m) => {
      return "[\u5df2\u9690\u85cfURL]";
    });
    s = s.replace(/\/v1\/[a-z0-9\-\/._?=&%]+/gi, "/v1/[\u5df2\u9690\u85cf\u63a5\u53e3]");
    s = s.replace(/(HTTP\s*\d+\s*:\s*)([^\s].*)/gi, "$1[\u5df2\u9690\u85cf\u8be6\u60c5]");
    return s;
  }

  function logVideoUserStart(title) {
    log(`📹 \u5f00\u59cb\u5904\u7406\u89c6\u9891\uff1a${title}`);
  }

  function logVideoUserDone(title) {
    log(`✅ \u5b8c\u6210\u89c6\u9891\uff1a${title}`);
  }

  async function finishVideoChapterSuccess(cellId, title) {
    logVideoUserDone(title);
    try {
      const planKey = String(cellId || "");
      if (state.refreshDeferredPlan && state.refreshDeferredPlan[planKey]) {
        delete state.refreshDeferredPlan[planKey];
      }
    } catch (_) {}
    markResourceDoneRealtime(cellId);
    await rateLimitSubmit();
    return true;
  }

  function log(msg, level = false) {
    const verbose = isRuntimeVerbose();
    const safeMsg = sanitizeLogMessage(msg);
    const lv = typeof level === "string" ? String(level).toLowerCase() : "";
    const isDetailOnly = level === true;

    if (isDetailOnly && !verbose) return;

    if (!verbose) {
      if (shouldDenyRunLogPublic(safeMsg)) return;
      const forceUser = lv === "warn" || lv === "error";
      if (!forceUser && !shouldLogSimplified(safeMsg)) return;
    }

    const now = new Date();
    const t = now.toTimeString().slice(0, 8);
    const line = verbose ? `[${t}] [DBG] ${safeMsg}` : `[${t}] ${safeMsg}`;
    pushPanelLog(line);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function formatLeaseExpireText(expSec) {
    const sec = Number(expSec || 0);
    if (!Number.isFinite(sec) || sec <= 0) return "\u672a\u77e5";
    const d = new Date(sec * 1000);
    if (Number.isNaN(d.getTime())) return "\u672a\u77e5";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }

  function normalizeUnixSec(v) {
    const n = Number(v || 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (n > 1e12) return Math.floor(n / 1000);
    return Math.floor(n);
  }

  function parseLeaseExpireSecFromAny(raw) {
    if (raw == null || raw === "") return 0;
    const n = normalizeUnixSec(raw);
    if (n > 0) return n;
    const t = Date.parse(String(raw));
    if (!Number.isNaN(t) && t > 0) return Math.floor(t / 1000);
    return 0;
  }

  function resolveLeaseExpireSec(data) {
    return parseLeaseExpireSecFromAny(data && (data.exp ?? (data.data && data.data.exp)));
  }

  function resolveProExpireSec(data) {
    const nowSec = Math.floor(Date.now() / 1000);
    const minSec = nowSec - 86400;
    const maxSec = nowSec + 86400 * 3660;
    const hits = [];
    const visit = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object") {
          visit(v);
          continue;
        }
        const key = String(k || "").toLowerCase();
        if (!/(exp|expire|expired|end)/.test(key)) continue;
        const sec = parseLeaseExpireSecFromAny(v);
        if (sec > minSec && sec < maxSec) hits.push(sec);
      }
    };
    visit(data || {});
    if (!hits.length) return 0;
    return Math.max(...hits);
  }

  async function rateLimitSubmit() {
    state.consecutiveCount++;

    if (state.consecutiveCount >= 3) {
      log("⏸️ \u5df2\u8fde\u7eed\u5b66\u4e603\u7ae0\u8282\uff0c\u4f11\u606f60\u79d2...");
      await sleep(60000);
      state.consecutiveCount = 0;
      log("▶️ \u4f11\u606f\u7ed3\u675f\uff0c\u7ee7\u7eed\u5904\u7406");
    } else {
      const shortWait = 10000 + Math.random() * 20000;
      log(`⏳ \u672c\u6b21\u7ae0\u8282\u5904\u7406\u540e\u968f\u673a\u4f11\u606f ${(shortWait / 1000).toFixed(1)} \u79d2`);
      await sleep(shortWait);
    }
  }

  function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    state.courseQueue = queue;
  }

  function loadQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\s/g, "");
  }

  function md5ArrayBufferHex(arrayBuffer) {
    return SparkMD5.ArrayBuffer.hash(arrayBuffer);
  }

  function md5Uint8Hex(u8) {
    if (!u8) return "";
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    return md5ArrayBufferHex(buf);
  }

  async function convertToPngBytes(arrayBuffer) {
    const u8 = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer || []);
    if (!u8 || !u8.byteLength) throw new Error("empty_image");
    if (u8.byteLength >= 8 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) {
      return u8;
    }
    const blob = new Blob([u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)]);
    const toUint8 = async (pngBlob) => new Uint8Array(await pngBlob.arrayBuffer());
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(blob);
      const w = bmp.width || 640;
      const h = bmp.height || 480;
      let canvas;
      if (typeof OffscreenCanvas !== "undefined") {
        canvas = new OffscreenCanvas(w, h);
      } else {
        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0, w, h);
      const pngBlob = await (canvas.convertToBlob
        ? canvas.convertToBlob({ type: "image/png" })
        : new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png")));
      if (!pngBlob) throw new Error("toBlob_failed");
      return await toUint8(pngBlob);
    }
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error("image_decode_failed"));
        im.src = url;
      });
      const w = img.width || 640;
      const h = img.height || 480;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const pngBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
      if (!pngBlob) throw new Error("toBlob_failed");
      return await toUint8(pngBlob);
    } finally {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
  }

  function freeQuotaExhaustedStorageKey() {
    return `${FREE_QUOTA_EXHAUSTED_KEY}_${String(state.studentId || "unknown")}`;
  }

  async function precheckFaceFromCanvas(canvas) {
    try {
      const FD = (typeof window !== "undefined") ? window.FaceDetector : null;
      if (!FD) return { ok: true, skipped: true };
      if (!canvas || !canvas.width || !canvas.height) return { ok: false, reason: "\u753b\u9762\u4e3a\u7a7a\uff0c\u8bf7\u91cd\u62cd" };

      const detector = new FD({ fastMode: true, maxDetectedFaces: 2 });
      const faces = await detector.detect(canvas);
      const n = Array.isArray(faces) ? faces.length : 0;
      if (n <= 0) return { ok: false, reason: "\u672a\u68c0\u6d4b\u5230\u4eba\u8138\uff0c\u8bf7\u6b63\u5bf9\u955c\u5934\u91cd\u62cd" };
      if (n >= 2) return { ok: false, reason: "\u68c0\u6d4b\u5230\u591a\u5f20\u4eba\u8138\uff0c\u8bf7\u786e\u4fdd\u4ec5\u672c\u4eba\u5165\u955c\u540e\u91cd\u62cd" };

      const box = faces[0] && faces[0].boundingBox ? faces[0].boundingBox : null;
      if (!box) return { ok: true, skipped: true };

      const cw = Number(canvas.width) || 0;
      const ch = Number(canvas.height) || 0;
      const bw = Number(box.width) || 0;
      const bh = Number(box.height) || 0;
      const bx = Number(box.x) || 0;
      const by = Number(box.y) || 0;
      if (cw <= 0 || ch <= 0 || bw <= 0 || bh <= 0) return { ok: true, skipped: true };

      const areaRatio = (bw * bh) / (cw * ch);
      if (areaRatio < 0.06) return { ok: false, reason: "\u4eba\u8138\u592a\u5c0f\uff0c\u8bf7\u9760\u8fd1\u4e00\u70b9\u5e76\u4fdd\u6301\u6b63\u8138\u91cd\u62cd" };

      const cx = (bx + bw / 2) / cw;
      const cy = (by + bh / 2) / ch;
      if (cx < 0.22 || cx > 0.78 || cy < 0.18 || cy > 0.82) return { ok: false, reason: "\u4eba\u8138\u4f4d\u7f6e\u8fc7\u504f\uff0c\u8bf7\u5c06\u8138\u7f6e\u4e8e\u753b\u9762\u4e2d\u592e\u91cd\u62cd" };

      return { ok: true };
    } catch (_) {
      return { ok: true, skipped: true };
    }
  }

  function readCloudLeaseCache() {
    try {
      const raw = localStorage.getItem(CLOUD_LEASE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const lease = String(parsed.lease || "").trim();
      const exp = Number(parsed.exp || 0);
      if (!lease || !Number.isFinite(exp) || exp <= 0) return null;
      const tier = String(parsed.tier || "").trim();
      const freeChapterLimit = Number(parsed.freeChapterLimit ?? parsed.free_chapter_limit ?? parsed.free_limit ?? parsed.limit ?? 0);
      const freeUsedChapters = Number(parsed.freeUsedChapters ?? parsed.free_used_chapters ?? parsed.free_used ?? parsed.used ?? 0);
      const proExpireAt = Number(parsed.proExpireAt ?? parsed.pro_expire_at ?? parsed.proExpire ?? 0);
      return { lease, exp, tier, freeChapterLimit, freeUsedChapters, proExpireAt };
    } catch (_) {
      return null;
    }
  }

  function writeCloudLeaseCache(lease, exp, extra = null) {
    if (!lease || !exp) {
      localStorage.removeItem(CLOUD_LEASE_CACHE_KEY);
      return;
    }
    const payload = Object.assign({ lease, exp }, (extra && typeof extra === "object") ? extra : {});
    localStorage.setItem(CLOUD_LEASE_CACHE_KEY, JSON.stringify(payload));
  }

  function readCloudLastState() {
    try {
      const raw = localStorage.getItem(CLOUD_LAST_STATE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      const tier = String(p.tier || "").trim();
      const freeChapterLimit = Number(p.freeChapterLimit ?? p.free_chapter_limit ?? p.limit ?? 0);
      const freeUsedChapters = Number(p.freeUsedChapters ?? p.free_used_chapters ?? p.used ?? 0);
      const ts = Number(p.ts ?? 0);
      return { tier, freeChapterLimit, freeUsedChapters, ts };
    } catch (_) {
      return null;
    }
  }

  function writeCloudLastState(partial) {
    try {
      const prev = readCloudLastState() || {};
      const next = Object.assign({}, prev, partial || {}, { ts: Date.now() });
      localStorage.setItem(CLOUD_LAST_STATE_KEY, JSON.stringify(next));
    } catch (_) {}
  }

  function readCloudProExpireCache() {
    try {
      const raw = localStorage.getItem(CLOUD_PRO_EXPIRE_CACHE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      const token = String(p.token || "");
      const exp = Number(p.exp || 0);
      if (!token || !Number.isFinite(exp) || exp <= 0) return null;
      return { token, exp };
    } catch (_) {
      return null;
    }
  }

  function writeCloudProExpireCache(token, exp) {
    try {
      const tk = String(token || "").trim();
      const ex = Number(exp || 0);
      if (!tk || !Number.isFinite(ex) || ex <= 0) {
        localStorage.removeItem(CLOUD_PRO_EXPIRE_CACHE_KEY);
        return;
      }
      localStorage.setItem(CLOUD_PRO_EXPIRE_CACHE_KEY, JSON.stringify({ token: tk, exp: Math.floor(ex) }));
    } catch (_) {}
  }

  const AUTO_SUBMIT_FACE_VERIFICATION = false;

  function getPageLocalStorage() {
    try {
      if (typeof unsafeWindow !== "undefined" && unsafeWindow && unsafeWindow.localStorage) {
        return unsafeWindow.localStorage;
      }
    } catch (_) {}
    return null;
  }

  function resolveLearningUserId() {
    const sid = String(state.studentId || "").trim();
    if (sid) return sid;
    try {
      const v = localStorage.getItem("jxjy_student_id");
      if (v) return String(v).trim();
    } catch (_) {}
    try {
      const pls = getPageLocalStorage();
      if (pls) {
        const v = pls.getItem("jxjy_student_id");
        if (v) return String(v).trim();
      }
    } catch (_) {}
    return "";
  }

  function getFaceCacheStorageKey() {
    const sid = resolveLearningUserId() || "unknown";
    return `${FACE_CACHE_KEY}_${sid}`;
  }

  function getFaceVerifyDailyLockStorageKey() {
    const sid = resolveLearningUserId() || "unknown";
    return `${FACE_VERIFY_DAILY_LOCK_KEY}_${sid}`;
  }

  function todayYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function readFaceVerifyDailyLock() {
    try {
      const raw = localStorage.getItem(getFaceVerifyDailyLockStorageKey());
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      const ymd = String(p.ymd || "");
      const msg = String(p.msg || "");
      const ts = Number(p.ts || 0);
      if (!ymd) return null;
      return { ymd, msg, ts };
    } catch (_) {
      return null;
    }
  }

  function isFaceVerifyLockedToday() {
    const p = readFaceVerifyDailyLock();
    if (!p) return false;
    return p.ymd === todayYmd();
  }

  function setFaceVerifyLockedToday(message) {
    try {
      localStorage.setItem(
        getFaceVerifyDailyLockStorageKey(),
        JSON.stringify({ ymd: todayYmd(), ts: Date.now(), msg: String(message || "") })
      );
    } catch (_) {}
  }

  function readFaceCache() {
    const key = getFaceCacheStorageKey();
    let a = null;
    let b = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.cdnUrl && parsed.md5) a = parsed;
      }
    } catch (_) {
      a = null;
    }
    try {
      const pls = getPageLocalStorage();
      if (pls) {
        const raw = pls.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.cdnUrl && parsed.md5) b = parsed;
        }
      }
    } catch (_) {
      b = null;
    }
    if (!a && !b) return null;
    return pickBetterFaceCacheRecord(a, b);
  }

  function writeFaceCache(payload) {
    const key = getFaceCacheStorageKey();
    const s = JSON.stringify(payload);
    try {
      localStorage.setItem(key, s);
    } catch (_) {}
    try {
      const pls = getPageLocalStorage();
      if (pls) pls.setItem(key, s);
    } catch (_) {}
  }

  function isLivePreferredFaceCacheSource(src) {
    const s = String(src || "");
    return s === "camera" || s === "upload" || s === "manual_capture" || s === "manual_upload";
  }

  function faceCacheLiveTier(c) {
    if (!c || !c.cdnUrl || !c.md5) return 0;
    const lu = c.livePreferredCdnUrl;
    const lm = c.livePreferredMd5;
    const ls = c.livePreferredSource;
    if (lu && lm && isLivePreferredFaceCacheSource(ls)) return 3;
    if (isLivePreferredFaceCacheSource(c.source)) return 2;
    if (String(c.source || "") === "id_photo") return 1;
    return 0;
  }

  function pickBetterFaceCacheRecord(a, b) {
    if (!a) return b;
    if (!b) return a;
    const ta = faceCacheLiveTier(a);
    const tb = faceCacheLiveTier(b);
    if (ta !== tb) return ta > tb ? a : b;
    return Number(a.updatedAt || 0) >= Number(b.updatedAt || 0) ? a : b;
  }

  function withLivePreferredPinned(payload) {
    const p = payload && typeof payload === "object" ? { ...payload } : {};
    if (!isLivePreferredFaceCacheSource(p.source) || !p.cdnUrl || !p.md5) return p;
    p.livePreferredCdnUrl = p.cdnUrl;
    p.livePreferredMd5 = p.md5;
    p.livePreferredSource = p.source;
    return p;
  }

  function readLivePreferredFaceCacheForRun() {
    const c = readFaceCache();
    if (!c) return null;
    const sid = String(c.studentId || "").trim();
    const cur = resolveLearningUserId();
    if (sid && cur && sid !== cur) return null;
    const lu = c.livePreferredCdnUrl;
    const lm = c.livePreferredMd5;
    const ls = c.livePreferredSource;
    if (lu && lm && isLivePreferredFaceCacheSource(ls)) {
      return { cdnUrl: lu, md5: lm, source: ls, studentId: c.studentId };
    }
    if (c.cdnUrl && c.md5 && isLivePreferredFaceCacheSource(c.source)) return c;
    return null;
  }

  function explainLivePreferredCacheMiss() {
    const c = readFaceCache();
    if (!c) return "localStorage \u5c1a\u65e0\u4eba\u8138\u7f13\u5b58\uff08\u8bf7\u5148\u300c\u5237\u65b0\u4eba\u8138\u300d\u6216\u5f00\u59cb\u8fd0\u884c\u524d\u5b8c\u6210\u91c7\u96c6\uff09";
    const sid = String(c.studentId || "").trim();
    const cur = resolveLearningUserId();
    if (sid && cur && sid !== cur) {
      return `\u7f13\u5b58\u5b66\u5458\u4e0e\u5f53\u524d\u4e0d\u4e00\u81f4(\u7f13\u5b58 ${sid.slice(0, 10)}… / \u5f53\u524d ${cur.slice(0, 10)}…)\uff0c\u9700\u91cd\u65b0\u91c7\u96c6`;
    }
    const hasPin = !!(c.livePreferredCdnUrl && c.livePreferredMd5 && isLivePreferredFaceCacheSource(c.livePreferredSource));
    if (hasPin) return "";
    const src = String(c.source || "");
    if (src === "id_photo") {
      return "\u7f13\u5b58\u4e3b\u8bb0\u5f55\u4e3a\u8bc1\u4ef6\u7167 id_photo \u4e14\u672a\u9489\u624e livePreferred\uff08\u591a\u4e3a\u65e7\u7248\u7f13\u5b58\u6216\u4ec5\u7528\u8fc7\u8bc1\u4ef6\u7167\uff1b\u8bf7\u70b9\u9762\u677f\u300c\u5237\u65b0\u4eba\u8138\u300d\u7528\u62cd\u7167/\u4e0a\u4f20\u91cd\u5efa\uff09";
    }
    if (!isLivePreferredFaceCacheSource(src)) {
      return `\u7f13\u5b58 source=${src || "?"} \u975e\u6d3b\u4f53\u4f18\u5148\u7c7b\u578b`;
    }
    return "\u7f13\u5b58\u7ed3\u6784\u5f02\u5e38\uff08\u7f3a cdn/md5\uff09";
  }

  function setFaceCacheStatus(text) {
    state.faceCacheStatus = String(text || "\u672a\u77e5");
    const el = document.querySelector("#jxjy-face-cache-status");
    if (el) el.textContent = state.faceCacheStatus;
    const dot = document.querySelector("#jxjy-face-dot");
    if (dot) {
      const t = state.faceCacheStatus;
      dot.classList.remove("on", "wait", "off", "err");
      if (/\u5df2\u5c31\u7eea|\u5df2\u91c7\u96c6|\u6444\u50cf\u5934\u91c7\u96c6\u5b8c\u6210|\u7f13\u5b58/.test(t)) dot.classList.add("on");
      else if (/\u7b49\u5f85|\u91c7\u96c6\u4e2d/.test(t)) dot.classList.add("wait");
      else if (/\u5931\u8d25|\u5f02\u5e38|\u672a\u91c7\u96c6|\u4eca\u65e5\u9501\u5b9a|\u63d0\u4ea4\u5931\u8d25/.test(t)) dot.classList.add("err");
      else dot.classList.add("off");
    }
  }

  async function captureFacePngByCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u6444\u50cf\u5934\u91c7\u96c6");
    }
    const video = document.createElement("video");
    video.setAttribute("playsinline", "true");
    video.autoplay = true;
    video.muted = true;
    video.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:320px;height:240px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      video.srcObject = stream;
      await video.play();
      await sleep(700);
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) {
            reject(new Error("\u6444\u50cf\u5934\u622a\u56fe\u62cd\u7167\u5931\u8d25"));
            return;
          }
          resolve(b);
        }, "image/png");
      });
      const ab = await blob.arrayBuffer();
      return new Uint8Array(ab);
    } finally {
      try {
        if (stream) stream.getTracks().forEach((t) => t.stop());
      } catch (_) {}
      try {
        video.pause();
      } catch (_) {}
      if (video.parentNode) video.parentNode.removeChild(video);
    }
  }

  async function buildFaceImageForUpload(faceInfo) {
    try {

      const png = await captureFacePngByCamera();
      if (png && png.byteLength > 0) {

        return { bytes: png, source: "camera" };
      }
    } catch (_) {}
    const photo = await getUserPhotoData(faceInfo);
    if (!photo || !photo.data) {
      throw new Error("\u65e0\u6cd5\u83b7\u53d6\u53ef\u4e0a\u4f20\u7684\u4eba\u8138\u56fe\u7247\uff08\u6444\u50cf\u5934\u548c\u8bc1\u4ef6\u7167\u90fd\u5931\u8d25\uff09");
    }
    const pngBytes = await convertToPngBytes(photo.data);

    return { bytes: pngBytes, source: "id_photo" };
  }

  async function prepareFaceUploadAtStartup() {
    setFaceCacheStatus("\u91c7\u96c6\u4e2d...");
    const faceInfo = await getFaceRecognitionInfo(null, null, null);
    const image = await buildFaceImageForUpload(faceInfo);
    const md5 = md5Uint8Hex(image.bytes);
    const cfg = await getFaceRecognitionConfig();
    if (!cfg) {
      throw new Error("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25");
    }
    const uploaded = await uploadPhotoToOBS(image.bytes, md5, cfg, "image/png", "png");
    if (!uploaded || !uploaded.ok) {
      throw new Error("\u4e0a\u4f20OBS\u5931\u8d25");
    }
    const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
    if (!obsOk) {
      throw new Error("OBS\u6e90\u7ad9MD5\u6821\u9a8c\u5931\u8d25");
    }
    const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
    if (!ready) {
      throw new Error("CDN\u56fe\u7247\u672a\u5c31\u7eea");
    }
    const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
    if (!cdnOk) {
      throw new Error("CDN MD5\u6821\u9a8c\u5931\u8d25");
    }
    const cachePayload = withLivePreferredPinned({
      source: image.source,
      md5: md5,
      cdnUrl: uploaded.cdnUrl,
      obsUrl: uploaded.obsUrl,
      objectKey: uploaded.objectKey,
      studentId: resolveLearningUserId(),
      updatedAt: Date.now(),
    });
    writeFaceCache(cachePayload);
    state.startupFacePrepared = true;
    setFaceCacheStatus(`\u5df2\u5c31\u7eea(${image.source === "camera" ? "\u6444\u50cf\u5934" : "\u8bc1\u4ef6\u7167"})`);

    return cachePayload;
  }

  async function prepareFaceUploadFromIdPhoto() {
    setFaceCacheStatus("\u8bc1\u4ef6\u7167\u56de\u9000\u4e2d...");
    const faceInfo = await getFaceRecognitionInfo(null, null, null);
    const photo = await getUserPhotoData(faceInfo);
    if (!photo || !photo.data) throw new Error("\u672a\u83b7\u53d6\u5230\u8bc1\u4ef6\u7167URL");
    const pngBytes = await convertToPngBytes(photo.data);
    const md5 = md5Uint8Hex(pngBytes);
    const cfg = await getFaceRecognitionConfig();
    if (!cfg) throw new Error("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25");
    const uploaded = await uploadPhotoToOBS(pngBytes, md5, cfg, "image/png", "png");
    if (!uploaded || !uploaded.ok) throw new Error("\u8bc1\u4ef6\u7167\u4e0a\u4f20OBS\u5931\u8d25");

    const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
    if (!obsOk) throw new Error("\u8bc1\u4ef6\u7167OBS\u6e90\u7ad9MD5\u6821\u9a8c\u5931\u8d25");
    const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
    if (!ready) throw new Error("\u8bc1\u4ef6\u7167CDN\u672a\u5c31\u7eea");
    const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
    if (!cdnOk) throw new Error("\u8bc1\u4ef6\u7167CDN MD5\u6821\u9a8c\u5931\u8d25");
    const prev = readFaceCache() || {};
    const curSid = resolveLearningUserId();
    const sameStu =
      !String(prev.studentId || "").trim() || !curSid || String(prev.studentId).trim() === curSid;
    let keepLive = {};
    if (sameStu && prev.livePreferredCdnUrl && prev.livePreferredMd5 && isLivePreferredFaceCacheSource(prev.livePreferredSource)) {
      keepLive = {
        livePreferredCdnUrl: prev.livePreferredCdnUrl,
        livePreferredMd5: prev.livePreferredMd5,
        livePreferredSource: prev.livePreferredSource,
      };
    } else if (sameStu && isLivePreferredFaceCacheSource(prev.source) && prev.cdnUrl && prev.md5) {
      keepLive = {
        livePreferredCdnUrl: prev.cdnUrl,
        livePreferredMd5: prev.md5,
        livePreferredSource: prev.source,
      };
    }
    const cachePayload = {
      source: "id_photo",
      md5: md5,
      cdnUrl: uploaded.cdnUrl,
      obsUrl: uploaded.obsUrl,
      objectKey: uploaded.objectKey,
      studentId: curSid,
      updatedAt: Date.now(),
      ...keepLive,
    };
    writeFaceCache(cachePayload);
    state.startupFacePrepared = true;
    const keptLive =
      !!(cachePayload.livePreferredCdnUrl && isLivePreferredFaceCacheSource(cachePayload.livePreferredSource));
    setFaceCacheStatus(keptLive ? "\u8bc1\u4ef6\u7167\u5df2\u4e0a\u4f20\uff0c\u5f85\u4eba\u8138\u6bd4\u5bf9(\u6d3b\u4f53OBS\u4ecd\u4fdd\u7559)" : "\u8bc1\u4ef6\u7167\u5df2\u4e0a\u4f20\uff0c\u5f85\u4eba\u8138\u6bd4\u5bf9");
    return cachePayload;
  }

  async function prepareFaceUploadFromCameraOnly() {
    setFaceCacheStatus("\u6444\u50cf\u5934\u91c7\u96c6\u4e2d...");
    const pngBytes = await captureFacePngByCamera();
    if (!pngBytes || !pngBytes.byteLength) throw new Error("\u6444\u50cf\u5934\u91c7\u96c6\u5931\u8d25");
    const md5 = md5Uint8Hex(pngBytes);
    const cfg = await getFaceRecognitionConfig();
    if (!cfg) throw new Error("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25");
    const uploaded = await uploadPhotoToOBS(pngBytes, md5, cfg, "image/png", "png");
    if (!uploaded || !uploaded.ok) throw new Error("\u6444\u50cf\u5934\u56fe\u7247\u4e0a\u4f20OBS\u5931\u8d25");

    const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
    if (!obsOk) throw new Error("\u6444\u50cf\u5934OBS\u6e90\u7ad9MD5\u6821\u9a8c\u5931\u8d25");
    const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
    if (!ready) throw new Error("\u6444\u50cf\u5934CDN\u672a\u5c31\u7eea");
    const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
    if (!cdnOk) throw new Error("\u6444\u50cf\u5934CDN MD5\u6821\u9a8c\u5931\u8d25");
    const cachePayload = withLivePreferredPinned({
      source: "camera",
      md5: md5,
      cdnUrl: uploaded.cdnUrl,
      obsUrl: uploaded.obsUrl,
      objectKey: uploaded.objectKey,
      studentId: resolveLearningUserId(),
      updatedAt: Date.now(),
    });
    writeFaceCache(cachePayload);
    state.startupFacePrepared = true;
    setFaceCacheStatus("\u5df2\u5c31\u7eea(\u6444\u50cf\u5934)");
    return cachePayload;
  }

  async function prepareFaceUploadFromUserFilePick() {
    setFaceCacheStatus("\u7b49\u5f85\u9009\u62e9\u56fe\u7247…");
    return await new Promise((resolve, reject) => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.style.display = "none";
      const cleanup = () => {
        try {
          inp.remove();
        } catch (_) {}
      };
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("\u9009\u62e9\u56fe\u7247\u8d85\u65f6\uff08\u672a\u9009\u62e9\u6587\u4ef6\uff09"));
      }, 120000);
      inp.onchange = async () => {
        window.clearTimeout(timer);
        try {
          const f = inp.files && inp.files[0];
          if (!f) {
            cleanup();
            reject(new Error("\u672a\u9009\u62e9\u6587\u4ef6"));
            return;
          }
          const buf = new Uint8Array(await f.arrayBuffer());
          const pngBytes = await convertToPngBytes(buf);
          if (!pngBytes || !pngBytes.byteLength) throw new Error("\u56fe\u7247\u8f6cPNG\u5931\u8d25");
          const md5 = md5Uint8Hex(pngBytes);
          const cfg = await getFaceRecognitionConfig();
          if (!cfg) throw new Error("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25");
          const uploaded = await uploadPhotoToOBS(pngBytes, md5, cfg, "image/png", "png");
          if (!uploaded || !uploaded.ok) throw new Error("\u672c\u5730\u4e0a\u4f20OBS\u5931\u8d25");

          const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
          if (!obsOk) throw new Error("\u672c\u5730\u4e0a\u4f20OBS\u6e90\u7ad9MD5\u6821\u9a8c\u5931\u8d25");
          const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
          if (!ready) throw new Error("\u672c\u5730\u4e0a\u4f20CDN\u672a\u5c31\u7eea");
          const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
          if (!cdnOk) throw new Error("\u672c\u5730\u4e0a\u4f20CDN MD5\u6821\u9a8c\u5931\u8d25");
          const cachePayload = withLivePreferredPinned({
            source: "upload",
            md5: md5,
            cdnUrl: uploaded.cdnUrl,
            obsUrl: uploaded.obsUrl,
            objectKey: uploaded.objectKey,
            studentId: resolveLearningUserId(),
            updatedAt: Date.now(),
          });
          writeFaceCache(cachePayload);
          state.startupFacePrepared = true;
          setFaceCacheStatus("\u5df2\u5c31\u7eea(\u672c\u5730\u4e0a\u4f20)");
          cleanup();
          resolve(cachePayload);
        } catch (e) {
          cleanup();
          reject(e);
        }
      };
      document.body.appendChild(inp);
      inp.click();
    });
  }

  async function prepareFaceUploadLivePreferred() {
    try {
      return await prepareFaceUploadFromCameraOnly();
    } catch (_) {}

    return await prepareFaceUploadFromUserFilePick();
  }

  async function getOrPrepareFaceUpload() {
    if (state.startupFacePrepared) {
      const cached = readFaceCache();
      if (cached && cached.cdnUrl && cached.md5) return cached;
    }
    const cached = readFaceCache();
    if (cached && cached.cdnUrl && cached.md5) {

      state.startupFacePrepared = true;
      setFaceCacheStatus("\u5df2\u5c31\u7eea(\u7f13\u5b58)");
      return cached;
    }
    return await prepareFaceUploadAtStartup();
  }

  async function forceManualFaceCaptureAtStartup() {
    setFaceCacheStatus("\u7b49\u5f85\u624b\u52a8\u62cd\u7167");
    while (true) {
      const faceInfo = await getFaceRecognitionInfo(null, null, null);
      const done = await new Promise(async (resolve) => {
        try {
          const inj = await openInjectedFaceDialog(faceInfo, {
            manualCaptureOnly: true,
            onUploaded: () => resolve(true),
            onClosed: () => resolve(false),
          });
          if (!inj || !inj.ok) {
            resolve(false);
          }
        } catch (_) {
          resolve(false);
        }
      });
      if (done) return true;

      await sleep(500);
    }
  }

  async function convertJpegToPng(jpegData) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([jpegData], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          pngBlob.arrayBuffer().then((arrayBuffer) => {
            URL.revokeObjectURL(url);
            resolve(new Uint8Array(arrayBuffer));
          }).catch(reject);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("\u56fe\u7247\u52a0\u8f7d\u5931\u8d25"));
      };
      img.src = url;
    });
  }

  function gmRequest(url, method, headers, data, responseType = "text") {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: headers,
        data: data,
        timeout: 30000,
        withCredentials: true,
        responseType: responseType,
        onload: (res) => {
          if (res.status < 200 || res.status >= 300) {
            reject(new Error(`HTTP ${res.status}: ${url}`));
            return;
          }
          resolve(responseType === "arraybuffer" ? res.response : res.responseText);
        },
        onerror: () => reject(new Error(`\u7f51\u7edc\u9519\u8bef ${url}`)),
        ontimeout: () => reject(new Error(`\u8bf7\u6c42\u8d85\u65f6 ${url}`)),
      });
    });
  }

  function gmRequestText(url, method, headers, body) {
    return gmRequest(url, method, headers, body, "text");
  }

  function gmRequestJson(url, method, headers, body) {
    return gmRequestText(url, method, headers, body).then((text) => {
      try {
        return text ? JSON.parse(text) : null;
      } catch (_) {
        return null;
      }
    });
  }

  function gmRequestArrayBuffer(url, method, headers) {
    if (typeof url !== "string") url = String(url);
    if (!/^https?:\/\//i.test(url)) {
      return Promise.reject(new Error(`gmRequestArrayBuffer: invalid url=${url}`));
    }
    return gmRequest(url, method, headers, null, "arraybuffer").then((res) => {
      if (res instanceof ArrayBuffer) return res;
      if (res && res.buffer instanceof ArrayBuffer && typeof res.byteLength === "number") {
        return res.buffer.slice(res.byteOffset || 0, (res.byteOffset || 0) + res.byteLength);
      }
      if (typeof res === "string") {
        return new TextEncoder().encode(res).buffer;
      }
      return new TextEncoder().encode(String(res)).buffer;
    });
  }

  function gmRequestArrayBufferDirect(url, method, headers) {
    if (typeof url !== "string") url = String(url);
    if (!/^https?:\/\//i.test(url)) {
      return Promise.reject(new Error(`gmRequestArrayBufferDirect: invalid url=${url}`));
    }
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: method || "GET",
        url: url,
        headers: headers || {},
        timeout: 30000,
        withCredentials: false,
        responseType: "arraybuffer",
        onload: async (res) => {
          try {
            const ct = (res.responseHeaders || "").match(/content-type:\s*([^\r\n]+)/i);
            const contentType = ct ? ct[1].trim() : "";
            if (res.status < 200 || res.status >= 300) {
              reject(new Error(`HTTP ${res.status} ${url} ct=${contentType}`));
              return;
            }
            const r = res.response;
            if (r instanceof ArrayBuffer) {
              resolve({ status: res.status, contentType, arrayBuffer: r });
              return;
            }
            if (r && typeof Blob !== "undefined" && r instanceof Blob) {
              const ab = await r.arrayBuffer();
              resolve({ status: res.status, contentType, arrayBuffer: ab });
              return;
            }
            const text = res.responseText != null ? String(res.responseText) : String(r);
            resolve({ status: res.status, contentType, arrayBuffer: new TextEncoder().encode(text).buffer });
          } catch (e) {
            reject(e);
          }
        },
        onerror: () => reject(new Error(`\u7f51\u7edc\u9519\u8bef ${url}`)),
        ontimeout: () => reject(new Error(`\u8bf7\u6c42\u8d85\u65f6 ${url}`)),
      });
    });
  }

  function gmRequestWithStatus(url, method, headers, data) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: headers,
        data: data,
        timeout: 30000,
        withCredentials: true,
        responseType: "text",
        onload: (res) => resolve({ status: res.status, text: res.responseText || "" }),
        onerror: () => reject(new Error(`\u7f51\u7edc\u9519\u8bef ${url}`)),
        ontimeout: () => reject(new Error(`\u8bf7\u6c42\u8d85\u65f6 ${url}`)),
      });
    });
  }

  function fetchRequestText(url, method, headers, body) {
    const finalHeaders = Object.assign({}, headers);
    delete finalHeaders["User-Agent"];
    delete finalHeaders["sec-ch-ua"];
    delete finalHeaders["sec-ch-ua-mobile"];
    delete finalHeaders["sec-ch-ua-platform"];
    return fetch(url, {
      method: method,
      headers: finalHeaders,
      credentials: "include",
      body: body || undefined,
    }).then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return text;
    });
  }

  async function fetchRequestArrayBuffer(url, method, headers, body) {
    const finalHeaders = Object.assign({}, headers);
    delete finalHeaders["User-Agent"];
    delete finalHeaders["sec-ch-ua"];
    delete finalHeaders["sec-ch-ua-mobile"];
    delete finalHeaders["sec-ch-ua-platform"];
    const res = await fetch(url, {
      method: method,
      headers: finalHeaders,
      credentials: "omit",
      cache: "no-store",
      body: body || undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return await res.arrayBuffer();
  }

  async function fetchRequestArrayBufferWithMeta(url, method, headers, body) {
    const finalHeaders = Object.assign({}, headers);
    delete finalHeaders["User-Agent"];
    delete finalHeaders["sec-ch-ua"];
    delete finalHeaders["sec-ch-ua-mobile"];
    delete finalHeaders["sec-ch-ua-platform"];
    const res = await fetch(url, {
      method: method,
      headers: finalHeaders,
      credentials: "omit",
      cache: "no-store",
      body: body || undefined,
    });
    const contentType = res.headers.get("content-type") || "";
    const status = res.status;
    const ok = res.ok;
    const buf = await res.arrayBuffer();
    if (!ok) throw new Error(`HTTP ${status} ${url} ct=${contentType} len=${buf.byteLength}`);
    return { status, contentType, arrayBuffer: buf };
  }

  async function requestTextWithFallback(url, method, headers, body) {
    try {
      return await gmRequestText(url, method, headers, body);
    } catch (e) {
      const msg = String((e && e.message) || "");
      if (msg.includes("HTTP 403") || msg.includes("HTTP 401") || msg.includes("\u7f51\u7edc\u9519\u8bef")) {

        return fetchRequestText(url, method, headers, body);
      }
      throw e;
    }
  }

  async function apiRequest(url, method, data, isEncrypted) {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Origin: "https://jxjynew.ahjxjy.cn",
      Referer: "https://jxjynew.ahjxjy.cn/app/jxjy-student-space-web",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139.0.0.0",
    };

    if (state.bearerToken) headers.Authorization = `Bearer ${state.bearerToken}`;
    if (state.studentId) {
      headers.Student = state.studentId;
      headers["user-type"] = "4";
    }

    try {
      let body = null;
      if (data !== undefined && data !== null) {
        body = isEncrypted ? JSON.stringify({ data: data }) : JSON.stringify(data);
      }
      const text = await requestTextWithFallback(url, method, headers, body);
      if (text && text.trim().startsWith("{")) return JSON.parse(text);
      return { text: text };
    } catch (e) {

      return null;
    }
  }

  async function _rq(path, method, payload) {
    const base = String(state.cloudApiBase || DEFAULT_CLOUD_API_BASE).replace(/\/+$/, "");
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (state.studentId) headers["x-learning-user-id"] = String(state.studentId);
    if (state.cloudToken) headers.Authorization = `Bearer ${state.cloudToken}`;
    if (state.cloudLease) headers["x-lease"] = state.cloudLease;
    try {
      let reqPayload = payload;
      if (reqPayload && typeof reqPayload === "object") {
        reqPayload = Object.assign({}, reqPayload);
      }
      if (path !== _w(16) && state.cloudLease && reqPayload && typeof reqPayload === "object" && reqPayload.lease == null) {
        reqPayload.lease = state.cloudLease;
      }
      const body = reqPayload == null ? null : JSON.stringify(reqPayload);
      const res = await gmRequestWithStatus(url, method || "POST", headers, body);
      const text = String(res.text || "").trim();
      let data = null;
      if (text) data = JSON.parse(text);
      if (res.status < 200 || res.status >= 300) {
        const errCode =
          (data && (data.detail || data.message || data.code)) ? String(data.detail || data.message || data.code) : `http_${res.status}`;
        throw new Error(errCode);
      }
      return data || {};
    } catch (e) {
      const msg = String((e && e.message) || "");
      if (!msg.includes("\u7f51\u7edc\u9519\u8bef")) throw e;
      const finalHeaders = Object.assign({}, headers);
      delete finalHeaders["User-Agent"];
      let reqPayload = payload;
      if (reqPayload && typeof reqPayload === "object") {
        reqPayload = Object.assign({}, reqPayload);
      }
      if (path !== _w(16) && state.cloudLease && reqPayload && typeof reqPayload === "object" && reqPayload.lease == null) {
        reqPayload.lease = state.cloudLease;
      }
      const resp = await fetch(url, {
        method: method || "POST",
        headers: finalHeaders,
        body: reqPayload == null ? undefined : JSON.stringify(reqPayload),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const errCode =
          (json && (json.detail || json.message || json.code)) ? String(json.detail || json.message || json.code) : `http_${resp.status}`;
        throw new Error(errCode);
      }
      return json;
    }
  }

  async function _el(forceRefresh = false) {
    const now = Math.floor(Date.now() / 1000);
    if (!forceRefresh && state.cloudLease && state.cloudLeaseExp - now > 60) return true;
    if (!forceRefresh) {
      const cached = readCloudLeaseCache();
      if (cached && cached.exp - now > 60) {
        state.cloudLease = cached.lease;
        state.cloudLeaseExp = cached.exp;
        state.cloudProExpireAt = Number(cached.proExpireAt || 0);
        if (cached.tier) state.cloudTier = cached.tier;
        if (Number.isFinite(cached.freeChapterLimit) && cached.freeChapterLimit > 0) state.freeChapterLimit = cached.freeChapterLimit;
        if (Number.isFinite(cached.freeUsedChapters) && cached.freeUsedChapters >= 0) state.freeUsedChapters = cached.freeUsedChapters;
        updateCloudPanelUI();
        return true;
      }
    }
    let data;
    try {
      let bindProfile = state.cloudBindProfile;
      if (!bindProfile && state.bearerToken && state.studentId) {
        bindProfile = await fetchStudentProfile(state.bearerToken, state.studentId);
        if (bindProfile) state.cloudBindProfile = bindProfile;
      }
      const leasePayload = {
        learning_user_id: String(state.studentId || ""),
      };
      if (bindProfile && typeof bindProfile === "object") {
        const n = String(bindProfile.name || "");
        const u = String(bindProfile.userName || "");
        const p = String(bindProfile.phoneNum || "");
        const s = String(bindProfile.schoolName || "");
        if (n) {
          leasePayload.name = n;
          leasePayload.real_name = n;
          leasePayload.realName = n;
        }
        if (u) {
          leasePayload.userName = u;
          leasePayload.user_name = u;
          leasePayload.id_card = u;
          leasePayload.idCard = u;
          leasePayload.account = u;
        }
        if (p) {
          leasePayload.phoneNum = p;
          leasePayload.phone_num = p;
          leasePayload.phone = p;
          leasePayload.mobile = p;
        }
        if (s) {
          leasePayload.schoolName = s;
          leasePayload.school_name = s;
          leasePayload.school = s;
        }
      }
      data = await _rq(_w(16), "POST", leasePayload);
      state.cloudRevoked = false;
    } catch (e) {
      const em = String((e && e.message) || e);
      const isRevoked = /(revoked|token[_\s-]*revoked|\u5df2\u7981\u7528|\u88ab\u7981\u7528|\u505c\u7528)/i.test(em);
      if (isRevoked) {
        state.cloudRevoked = true;
        state.cloudTier = "revoked";
        state.cloudLease = "";
        state.cloudLeaseExp = 0;
        state.cloudProExpireAt = 0;
        writeCloudLeaseCache("", 0);
        updateCloudPanelUI();
        showPanelNotice("\u5f53\u524d Token \u5df2\u88ab\u7981\u7528\uff0c\u8bf7\u66f4\u6362\u53ef\u7528 Token\u3002", "error", true, 9000, document.querySelector("#jxjy-cloud-tier"));
        throw e;
      }
      const last = readCloudLastState();
      if (last) {
        if (last.tier) state.cloudTier = last.tier;
        if (Number.isFinite(last.freeChapterLimit) && last.freeChapterLimit > 0) state.freeChapterLimit = last.freeChapterLimit;
        if (Number.isFinite(last.freeUsedChapters) && last.freeUsedChapters >= 0) state.freeUsedChapters = last.freeUsedChapters;
      }
      if (!state.cloudToken) state.cloudTier = "free";
      updateCloudPanelUI();
      showPanelNotice(`\u6388\u6743\u83b7\u53d6\u5931\u8d25\uff1a${em}`, "error", false, 6000, document.querySelector("#jxjy-cloud-tier"));
      throw e;
    }
    const lease = String(data.lease || "");
    const exp = resolveLeaseExpireSec(data);
    const tierRaw =
      data.tier ??
      data.Tier ??
      data.level ??
      data.plan ??
      data.license_type ??
      data.licenseType ??
      (data.data && (data.data.tier || data.data.plan)) ??
      "";
    let tier = String(tierRaw || "").trim();
    if (!tier) {
      tier = state.cloudToken ? "pro" : "free";
      showPanelNotice("\u672a\u8fd4\u56de\u6388\u6743\u7c7b\u578b\u5b57\u6bb5\uff0c\u5df2\u6309\u672c\u5730\u72b6\u6001\u515c\u5e95\u663e\u793a\u3002", "info", false, 4500, document.querySelector("#jxjy-cloud-tier"));
    }
    const proExpireAt = resolveProExpireSec(data);
    const cache = readCloudProExpireCache();
    const sameToken = !!(cache && String(cache.token || "") === String(state.cloudToken || ""));
    state.cloudLease = lease;
    state.cloudLeaseExp = exp;
    state.cloudProExpireAt = Number(proExpireAt || 0) > 0 ? Number(proExpireAt || 0) : (sameToken ? Number(cache.exp || 0) : 0);
    if (String(tier || "").toLowerCase() === "pro" && state.cloudProExpireAt > 0) {
      writeCloudProExpireCache(state.cloudToken || "", state.cloudProExpireAt);
    }
    state.cloudTier = tier;
    state.freeChapterLimit = Number(
      data.free_chapter_limit ??
        data.freeChapterLimit ??
        data.free_limit ??
        data.limit ??
        data.freeLimit ??
        data.free ??
        6
    );
    state.freeUsedChapters = Number(
      data.free_used_chapters ??
        data.freeUsedChapters ??
        data.free_used ??
        data.used ??
        data.used_chapters ??
        data.usedChapters ??
        0
    );
    writeCloudLeaseCache(lease, exp, {
      tier: state.cloudTier,
      freeChapterLimit: state.freeChapterLimit,
      freeUsedChapters: state.freeUsedChapters,
      proExpireAt: state.cloudProExpireAt,
    });
    writeCloudLastState({
      tier: state.cloudTier,
      freeChapterLimit: state.freeChapterLimit,
      freeUsedChapters: state.freeUsedChapters,
    });

    try {
      if (String(state.cloudTier || "").toLowerCase() === "pro" && Number(state.cloudProExpireAt || 0) >= 0) {
        setAutoHomeworkEnabled(true);
        setAutoExamEnabled(true);
        setDeepseekEnabled(true);
      }
    } catch (_) {}

    updateCloudPanelUI();
    return !!lease;
  }

  async function _cc(courseId, chapterId) {
    await _el(false);
    const data = await _rq(_w(8), "POST", {
      course_id: String(courseId || ""),
      chapter_id: String(chapterId || ""),
    });
    state.cloudTier = String(data.tier || state.cloudTier || "unknown");
    state.freeChapterLimit = Number(data.free_chapter_limit || data.free_limit || data.limit || state.freeChapterLimit || 6);
    state.freeUsedChapters = Number(data.free_used_chapters || data.free_used || data.used || state.freeUsedChapters || 0);
    writeCloudLastState({
      tier: state.cloudTier,
      freeChapterLimit: state.freeChapterLimit,
      freeUsedChapters: state.freeUsedChapters,
    });
    updateCloudPanelUI();
    return data;
  }

  async function _ae(plainText, purpose) {
    await _el(false);
    const p = String(purpose || "");
    try {
      const data = await _rq(_w(5), "POST", {
        purpose: p,
        plaintext: String(plainText == null ? "" : plainText),
      });
      return String(data.encryptedBase64 || data.ciphertext || "");
    } catch (e) {
      const msg = String((e && e.message) || "");
      if (p === "document_payload" && msg.includes("invalid purpose")) {
        const data = await _rq(_w(5), "POST", {
          purpose: "video_payload",
          plaintext: String(plainText == null ? "" : plainText),
        });
        return String(data.encryptedBase64 || data.ciphertext || "");
      }
      throw e;
    }
  }

  async function _ad(cipherText, purpose) {
    await _el(false);
    const data = await _rq(_w(6), "POST", {
      purpose: String(purpose || ""),
      encryptedBase64: String(cipherText == null ? "" : cipherText),
    });
    return String(data.plaintext || "");
  }

  async function _os(obsConfigEncryptedBase64, objectKey, contentType) {
    await _el(false);
    const data = await _rq(_w(15), "POST", {
      obs_config_encrypted_base64: String(obsConfigEncryptedBase64 || ""),
      object_key: String(objectKey || ""),
      content_type: String(contentType || "image/png"),
    });
    const headers = data && data.headers ? data.headers : {};
    return {
      authorization: String(headers.Authorization || ""),
      headers,
      obsUrl: String(data.obsUrl || ""),
    };
  }

  async function _es(kind, context, cfg) {
    await _el(false);
    return _rq(_w(0), "POST", {
      lease: state.cloudLease,
      kind: String(kind || ""),
      context: context || {},
      config: cfg || {},
    });
  }

  async function _ep(sessionId, event, lastResult, contextPatch) {
    await _el(false);
    return _rq(_w(1), "POST", {
      lease: state.cloudLease,
      session_id: String(sessionId || ""),
      event: String(event || "tick"),
      last_result: lastResult == null ? null : lastResult,
      context_patch: contextPatch == null ? null : contextPatch,
    });
  }

  async function _bp(kind, data) {
    await _el(false);
    const res = await _rq(_w(2), "POST", {
      lease: state.cloudLease,
      kind: String(kind || ""),
      data: data || {},
    });
    return String(res.encrypted_data || res.encryptedBase64 || "");
  }

  async function _pp(paperJsonEnc, ruleId, opts = {}) {
    await _el(false);
    const body = {
      lease: state.cloudLease,
      paper_json_encrypted: String(paperJsonEnc || ""),
      rule_id: String(ruleId || ""),
      require_answers: opts.requireAnswers !== false,
    };
    const src = String(opts.answerSource || opts.answer_source || "").trim().toLowerCase();
    if (src) body.answer_source = src;
    return _rq(_w(3), "POST", body);
  }

  async function _ra(question, ruleId) {
    await _el(false);
    return _rq(_w(4), "POST", {
      lease: state.cloudLease,
      question: question || {},
      rule_id: String(ruleId || ""),
    });
  }

  async function submitVideoProgressEncrypted(encryptedData, courseId, cellId, position, retryCount, faceResourceId) {
    if (!encryptedData) return null;
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/study-video-record";
    const payloadBody = JSON.stringify({ data: encryptedData });
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.bearerToken}`,
      Student: state.studentId,
      "user-type": "4",
    };
    try {
      const result = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          url,
          headers,
          data: payloadBody,
          timeout: 30000,
          withCredentials: true,
          onload: (res) => {
            try {
              const responseText = res.responseText || "";

              if (res.status === 403) {
                let errorMsg = "";
                try {
                  const errorJson = JSON.parse(responseText);
                  errorMsg = errorJson.error?.message || "";
                } catch (_) {
                  errorMsg = responseText;
                }
                resolve({ status: 403, http_status: 403, error: errorMsg, data: { error: { message: errorMsg } } });
              } else if (res.status >= 200 && res.status < 300) {
                try {
                  const parsed = JSON.parse(responseText);
                  resolve({ status: res.status, http_status: res.status, data: parsed });
                } catch (_) {
                  resolve({ status: res.status, http_status: res.status, data: { code: "unknown_invalid_json", isStudy: false, raw: responseText } });
                }
              } else {
                resolve({ status: res.status, http_status: res.status, error: `HTTP ${res.status}`, raw: responseText, data: null });
              }
            } catch (e) {
              reject(e);
            }
          },
          onerror: (err) => reject(err),
          ontimeout: () => reject(new Error("\u8bf7\u6c42\u8d85\u65f6")),
        });
      });
      const isFaceVerifyErrorText = (text) => /\u672a\u901a\u8fc7\u4eba\u8138\u6838\u9a8c|\u4eba\u8138\u6838\u9a8c|\u4eba\u8138\u8bc6\u522b/.test(String(text || ""));
      if (result.status === 403 && isFaceVerifyErrorText(result.error)) {
        if (state.faceVerifyBlockedInRun) return { code: "face_failed", isStudy: false };
        if (retryCount < 2) {
          const faceSuccess = await performFaceRecognition(courseId, faceResourceId || cellId, 1, { force: true, reason: "403 \u6587\u6848\u63d0\u793a\u4eba\u8138\u6838\u9a8c" });
          if (faceSuccess) {
            const enc2 = await _bp("video", { cellId, courseId, position });
            return submitVideoProgressEncrypted(enc2, courseId, cellId, position, retryCount + 1, faceResourceId);
          }
          state.faceVerifyBlockedInRun = true;
          return { code: "face_failed", isStudy: false };
        }
      }
      if (result.data && result.data.code === "face" && retryCount < 2) {
        if (state.faceVerifyBlockedInRun) return { code: "face_failed", isStudy: false };
        const faceSuccess = await performFaceRecognition(courseId, faceResourceId || cellId, 1, { force: true, reason: "\u8fd4\u56de code=face" });
        if (faceSuccess) {
          const enc2 = await _bp("video", { cellId, courseId, position });
          return submitVideoProgressEncrypted(enc2, courseId, cellId, position, retryCount + 1, faceResourceId);
        }
        state.faceVerifyBlockedInRun = true;
        return { code: "face_failed", isStudy: false };
      }
      return result.data || { code: "unknown_empty", isStudy: false };
    } catch (e) {

      return null;
    }
  }

  function isChapterRealtimeFallback(cmd) {
    return !!(cmd && cmd.chapter_realtime_fallback);
  }

  async function executeCloudStudyCommand(cmd, execCtx) {
    const c = cmd || {};
    const t = String(c.type || "");
    const chapterRt = isChapterRealtimeFallback(c) || !!execCtx.chapterRealtimeFallback;
    if (chapterRt) execCtx.chapterRealtimeFallback = true;
    if (t === "wait") {
      const waitMs = Math.max(1000, Number(c.ms || 1000));
      await sleep(waitMs);
      return { event: "tick", lastResult: null };
    }
    if (t === "submit_video") {
      const pos = Number(c.position || 0);
      if (isRealtimeStudyMode() || chapterRt) {
        const total = Math.max(1, Number(execCtx.totalSec || 0));
        const pct = total > 0 ? ((pos / total) * 100).toFixed(1) : "0";
        const tag = chapterRt && !isRealtimeStudyMode() ? "\u672c\u7ae0\u82821:1\u515c\u5e95" : REALTIME11_LOG_BRACKET;
        logRealtime11User(
          `[${tag}] \u5df2\u5b66\u7ea6 ${formatStudyDurationCn(pos)} / \u603b\u65f6\u957f ${formatStudyDurationCn(total)}\uff08${pct}%\uff09`,
        );
        syncRealtime11ResourceLine(`position=${pos}s (${pct}%)`, total);
      }
      const enc = String(c.encrypted_data || "");
      const res = await submitVideoProgressEncrypted(
        enc,
        execCtx.courseId,
        execCtx.cellId,
        pos,
        0,
        c.face_resource_id || execCtx.relevantId,
      );
      return { event: "submit_result", lastResult: { data: res, http_status: 200, status: 200 } };
    }
    if (t === "face") {
      const ok = await performFaceRecognition(c.course_id, c.resource_id, Number(c.res_type || 1), { force: true, reason: "\u4e91\u7aef\u5f15\u64ce" });
      return { event: "face_done", lastResult: { ok: !!ok } };
    }
    if (t === "captcha") {
      if (isRealtimeStudyMode()) {
        logRealtime11User("\u8fdb\u5ea6\u8f83\u9ad8\u4ecd\u672a\u5b66\u5b8c\uff0c\u5c1d\u8bd5\u56fe\u5f62\u9a8c\u8bc1\u7801…");
      }
      const effManualFallback = !isRealtimeStudyMode() && Number(c.manual_fail_realtime_fallback || 0) > 0;
      const cap = await tryGraphicCaptchaAfterRollback(execCtx.courseId, execCtx.cellId, Number(c.position || 0), execCtx.relevantId, {
        maxTries: Number(c.max_tries || 6),
        cooldownMs: 5000,
        retryPosition: Number(c.retry_position || c.position || 0),
        finalPosition: Number(c.final_position || c.position || 0),
        manualFailRealtimeFallback: effManualFallback ? Number(c.manual_fail_realtime_fallback || 2) : 0,
      });
      const capOut = cap || { ok: false };
      if (capOut.fallback_realtime && !isRealtimeStudyMode()) {
        log("⚠️ \u9a8c\u8bc1\u7801\u624b\u52a8\u5931\u8d252\u6b21\uff0c\u672c\u7ae0\u8282\u5207\u63621:1\u65f6\u957f\u6a21\u5f0f\uff08\u5b8c\u6210\u540e\u4e0b\u4e00\u7ae0\u4ecd\u7528\u6548\u7387\u6a21\u5f0f\uff09", "info");
      }
      return {
        event: "captcha_done",
        lastResult: {
          ok: !!capOut.ok,
          manual_failures: Number(capOut.manual_failures || 0),
          fallback_realtime: !!capOut.fallback_realtime,
          reason: capOut.reason || "",
        },
      };
    }
    if (t === "defer") {
      const plan = c.plan || {};
      const planKey = String(execCtx.cellId || "");
      const dueSeconds = Math.max(30, Number(plan.due_seconds || 60));
      state.refreshDeferredPlan[planKey] = {
        courseId: String(plan.course_id || execCtx.courseId || ""),
        title: String(plan.title || execCtx.title || ""),
        dueAt: Date.now() / 1000 + dueSeconds,
        lastStagePos: 0,
        primePos: 60,
        createdAt: Date.now() / 1000,
      };
      return { terminal: "deferred" };
    }
    if (t === "done") {
      if (c.success) {
        await finishVideoChapterSuccess(execCtx.cellId, execCtx.title);
      }
      return { terminal: c.success ? true : false };
    }
    if (t === "failed") {
      setLastChapterDiag(String(c.diag || "\u4e91\u7aef\u5f15\u64ce\u5931\u8d25"));
      return { terminal: false };
    }
    if (t === "stop") {
      if (String(c.reason || "") === "nalmc") {
        showPanelNotice(String(c.message || "\u9700\u91cd\u65b0\u767b\u5f55"), "error", false, 8000, document.querySelector("#jxjy-current-resource"));
        state.running = false;
        updateStatus("\u9700\u91cd\u65b0\u767b\u5f55");
        syncRunButtons();
      }
      return { terminal: false };
    }
    return { event: "tick", lastResult: null };
  }

  async function _ve(courseId, cellId, relevantId, title, refreshForceFinalize) {
    const preview = await getPreviewResourceRaw(relevantId);
    if (preview && preview.__error403) {
      log("⏳ \u8bfe\u4ef6\u8bfb\u53d6\u6682\u4e0d\u53ef\u7528(403)\uff0c60\u79d2\u540e\u91cd\u8bd5…", "info");
      await sleep(60000);
      return _ve(courseId, cellId, relevantId, title, refreshForceFinalize);
    }
    if (!preview) {
      setLastChapterDiag("\u65e0\u6cd5\u62c9\u53d6\u8bfe\u4ef6\u9884\u89c8");
      return false;
    }
    const videoUrl = parsePreviewVideoUrl(preview);
    if (!videoUrl) {
      setLastChapterDiag("\u672a\u89e3\u6790\u5230\u6709\u6548\u89c6\u9891\u64ad\u653e\u5730\u5740");
      return false;
    }
    let totalSeconds = await getVideoDurationByHead(videoUrl);
    if (totalSeconds <= 0) totalSeconds = 3600;
    const init = await getInitialProgress(courseId, cellId);
    const saved = init && init.cells && init.cells.lastTime ? Number(init.cells.lastTime) : 0;
    await getVideoRecord(courseId, cellId);
    if (isRealtimeStudyMode()) {
      logRealtime11User(
        `\u603b\u65f6\u957f ${formatStudyDurationCn(totalSeconds)}\uff0c\u5f53\u524d\u5df2\u5b66\u7ea6 ${formatStudyDurationCn(saved)}\uff1b`,
      );
      logRealtime11User(
        `\u8d77\u59cb\u8fdb\u5ea6\uff1a\u5df2\u5b66\u7ea6 ${formatStudyDurationCn(saved)} / \u603b\u65f6\u957f ${formatStudyDurationCn(totalSeconds)}`,
      );
    }
    const startRes = await _es("video", {
      course_id: courseId,
      cell_id: cellId,
      relevant_id: relevantId,
      title,
      end_position: totalSeconds,
      saved,
      init_cells: init && init.cells ? init.cells : {},
      refresh_force_finalize: !!refreshForceFinalize,
    }, {
      study_mode: state.studyMode,
      enable_refresh_rotation: ENABLE_REFRESH_ROTATION_MODE,
    });
    let sessionId = String(startRes.session_id || "");
    let cmd = startRes.command;
    if (startRes.log && !(isRealtimeStudyMode() && isCloudRealtimeTechnicalLog(startRes.log))) {
      log(startRes.log, "info");
    }
    if (isRealtimeStudyMode() && startRes.log) {
      syncRealtime11ResourceLine(startRes.log, totalSeconds);
    }
    const execCtx = { courseId, cellId, relevantId, title, totalSec: totalSeconds, chapterRealtimeFallback: false };
    const maxSteps = 500;
    for (let i = 0; i < maxSteps && state.running && cmd; i++) {
      const stepOut = await executeCloudStudyCommand(cmd, execCtx);
      if (stepOut && stepOut.terminal !== undefined) {
        if (isRealtimeStudyMode() || execCtx.chapterRealtimeFallback) {
          try {
            const el = document.querySelector("#jxjy-current-resource");
            const base = String(state.currentResourceTitle || "").trim();
            if (el && base && base !== "\u65e0") el.textContent = base;
          } catch (_) {}
        }
        return stepOut.terminal;
      }
      const next = await _ep(sessionId, stepOut.event, stepOut.lastResult, null);
      sessionId = String(next.session_id || sessionId);
      if (next.log) {
        const chapterRt = execCtx.chapterRealtimeFallback || isChapterRealtimeFallback(next.command);
        if (!(isRealtimeStudyMode() && isCloudRealtimeTechnicalLog(next.log)) && !(chapterRt && isCloudRealtimeTechnicalLog(next.log))) {
          log(next.log, "info");
        }
        if (isRealtimeStudyMode() || chapterRt) syncRealtime11ResourceLine(next.log, totalSeconds);
      }
      cmd = next.command;
      if (!cmd) break;
    }
    setLastChapterDiag("\u4e91\u7aef\u89c6\u9891\u5f15\u64ce\u6b65\u6570\u8d85\u9650");
    return false;
  }

  function extractInfoKeyFromUrl() {
    const match = location.href.match(/[?&]infoKey=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async function fetchBearerToken(infoKey) {
    if (!infoKey) return null;
    const url = `https://jxjynew.ahjxjy.cn/v1/jxjy-system-service/api/user-info/login-info?key=${infoKey}`;
    try {
      const data = await gmRequestJson(url, "GET", {}, null);
      return data && data.encryptedAccessToken ? data.encryptedAccessToken : null;
    } catch (_) {
      return null;
    }
  }

  async function fetchStudentId(token) {
    if (!token) return null;
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-basic-data-service/api/common/current-user-type";
    try {
      const data = await gmRequestJson(url, "GET", { Authorization: `Bearer ${token}` }, null);
      if (!Array.isArray(data)) return null;
      for (const item of data) {
        if (item && item.userType === 4 && item.userIdentity && item.userIdentity.length > 0) {
          return item.userIdentity[0].id;
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  async function fetchStudentProfile(token, studentId) {
    if (!token || !studentId) return null;
    const sid = String(studentId || "").trim();
    if (!sid) return null;
    const url = `https://jxjynew.ahjxjy.cn/v1/jxjy-basic-data-service/api/base-student/${encodeURIComponent(sid)}`;
    try {
      const data = await gmRequestJson(
        url,
        "GET",
        {
          Authorization: `Bearer ${token}`,
          Student: sid,
          "user-type": "4",
        },
        null
      );
      if (!data || typeof data !== "object") return null;
      return {
        name: String(data.name || "").trim(),
        userName: String(data.userName || "").trim(),
        phoneNum: String(data.phoneNum || "").trim(),
        schoolName: String(data.schoolName || "").trim(),
      };
    } catch (_) {
      return null;
    }
  }

  async function initAuth() {
    const savedToken = localStorage.getItem("jxjy_bearer_token");
    const savedStudentId = localStorage.getItem("jxjy_student_id");
    if (savedToken && savedStudentId) {
      const sid = await fetchStudentId(savedToken);
      if (sid) {
        state.bearerToken = savedToken;
        state.studentId = sid;
        localStorage.setItem("jxjy_student_id", sid);
        state.cloudBindProfile = await fetchStudentProfile(savedToken, sid);
        return true;
      }
    }

    const infoKeyFromUrl = extractInfoKeyFromUrl();
    if (infoKeyFromUrl) localStorage.setItem(INFO_KEY_CACHE_KEY, infoKeyFromUrl);
    const infoKey = infoKeyFromUrl || localStorage.getItem(INFO_KEY_CACHE_KEY);
    if (!infoKey) return false;
    const token = await fetchBearerToken(infoKey);
    if (!token) return false;
    const studentId = await fetchStudentId(token);
    if (!studentId) return false;

    state.bearerToken = token;
    state.studentId = studentId;
    localStorage.setItem("jxjy_bearer_token", token);
    localStorage.setItem("jxjy_student_id", studentId);
    state.cloudBindProfile = await fetchStudentProfile(token, studentId);
    return true;
  }

  async function forceRefreshAuth() {
    state.bearerToken = null;
    state.studentId = null;
    state.cloudBindProfile = null;
    localStorage.removeItem("jxjy_bearer_token");
    localStorage.removeItem("jxjy_student_id");
    const ok = await initAuth();
    log(ok ? "🔐 \u8ba4\u8bc1\u5df2\u5237\u65b0" : "❌ \u8ba4\u8bc1\u5237\u65b0\u5931\u8d25");
    return ok;
  }

  function remindRelogin(reason = "") {
    const msg = "\u672a\u83b7\u53d6\u5230\u6709\u6548\u767b\u5f55\u4fe1\u606f\u3002\u8bf7\u5148\u9000\u51fa\u7ee7\u7eed\u6559\u80b2\u5728\u7ebf\u5e73\u53f0\u8d26\u53f7\uff0c\u518d\u91cd\u65b0\u767b\u5f55\u540e\u5237\u65b0\u9875\u9762\u518d\u4f7f\u7528\u3002";

    updateStatus("\u767b\u5f55\u4fe1\u606f\u5931\u6548");
    showGlobalReloginNotice(msg);
    const anchor = document.querySelector("#jxjy-auto-status");
    showPanelNotice(msg, "error", false, 10000, anchor);
  }

  function showGlobalReloginNotice(message) {
    try {
      const old = document.getElementById("jxjy-global-relogin-notice");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      const box = document.createElement("div");
      box.id = "jxjy-global-relogin-notice";
      box.style.cssText = [
        "position:fixed",
        "left:50%",
        "top:24px",
        "transform:translateX(-50%)",
        "width:min(760px,calc(100vw - 32px))",
        "z-index:2147483647",
        "background:linear-gradient(135deg,#b91c1c,#dc2626)",
        "color:#fff",
        "border:1px solid rgba(255,255,255,.25)",
        "border-radius:12px",
        "box-shadow:0 14px 34px rgba(127,29,29,.42)",
        "padding:14px 48px 14px 14px",
        "font-size:14px",
        "line-height:1.6",
        "font-weight:700"
      ].join(";");
      box.textContent = String(message || "");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "×";
      btn.title = "\u5173\u95ed";
      btn.style.cssText = [
        "position:absolute",
        "right:10px",
        "top:8px",
        "border:none",
        "background:transparent",
        "color:#fff",
        "font-size:22px",
        "line-height:1",
        "cursor:pointer",
        "opacity:.9"
      ].join(";");
      btn.addEventListener("click", () => {
        if (box && box.parentNode) box.parentNode.removeChild(box);
      });
      box.appendChild(btn);
      document.body.appendChild(box);
    } catch (_) {}
  }

  async function getFaceRecognitionConfig() {
    const url = "https://jxjynew.ahjxjy.cn/v1/face-recognition-service/api/h-wFace-recognition?frsType=1";
    const headers = {
        Accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${state.bearerToken}`,
        Student: state.studentId,
        "user-type": "4",
    };
    try {
        const text = await gmRequestText(url, "GET", headers, null);
        if (!text) return null;

        const decrypted = await _ad(text, "obs_config");
        if (!decrypted) return null;

        const cleanText = decrypted.replace(/[\x00-\x1f\x80-\x9f]+$/, '');
        const configData = JSON.parse(cleanText);

        return {
            urlBase: configData.Url || "https://frs.ahjxjy.cn",
            bucketName: configData.BucketName,
            endpoint: configData.Endpoint?.replace("https://", "").replace("http://", "") || "obs.cn-north-4.myhuaweicloud.com",
            ak: configData.AK,
            sk: configData.SK,
            encryptedConfig: text,
        };
    } catch (e) {

        return null;
    }
  }

  async function getFaceRecognitionInfo(courseId, resourceId, resType) {
    let url = `https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/face-recognition`;
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (resourceId) params.append("resourceId", resourceId);
    if (resType) params.append("resType", resType);
    if (params.toString()) url += `?${params.toString()}`;

    const headers = {
      Accept: "application/json, text/plain, */*",
      Authorization: `Bearer ${state.bearerToken}`,
      Student: state.studentId,
      "user-type": "4",
    };

    try {
      const text = await gmRequestText(url, "GET", headers, null);
      if (!text) return null;

      const decrypted = await _ad(text, "photo_payload");
      if (!decrypted) return null;

      const cleanText = decrypted.replace(/[\x00-\x1f\x80-\x9f]+$/, '');
      const data = JSON.parse(cleanText);

      return data;
    } catch (e) {

      return null;
    }
  }

  async function getUserPhotoData(faceInfo) {
    let info = faceInfo;
    if (!info) {
      info = await getFaceRecognitionInfo(null, null, null);
    }
    if (info && info.IDPhoto) {

        const photoData = await gmRequestArrayBuffer(info.IDPhoto, "GET", {});

        return { data: photoData, url: info.IDPhoto };
    }
    return null;
  }

  function buildNativeFaceUrl(courseId, resourceId, resType) {
    const base = `${location.origin}/app/jxjy-student-space-web`;
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (resourceId) params.set("resourceId", resourceId);
    if (resType) params.set("resType", String(resType));
    params.set("_from", "userscript");
    return `${base}?${params.toString()}`;
  }

  function queryAllDeep(selector, root = document) {
    const result = [];
    const visited = new Set();
    const walk = (node) => {
      if (!node || visited.has(node)) return;
      visited.add(node);
      try {
        if (typeof node.querySelectorAll === "function") {
          result.push(...Array.from(node.querySelectorAll(selector)));
        }
      } catch (_) {}
      const children = [];
      try {
        if (node.children) children.push(...Array.from(node.children));
      } catch (_) {}
      for (const c of children) {
        if (c && c.shadowRoot) walk(c.shadowRoot);
        if (c && c.tagName === "IFRAME") {
          try { if (c.contentDocument) walk(c.contentDocument); } catch (_) {}
        }
        walk(c);
      }
    };
    walk(root);
    return result;
  }

  async function waitForDomReady(part = "body", timeoutMs = 15000) {
    const start = Date.now();
    const has = () => {
      if (part === "head") return !!document.head;
      if (part === "documentElement") return !!document.documentElement;
      return !!document.body;
    };
    if (has()) return true;
    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        try { obs.disconnect(); } catch (_) {}
        resolve(has());
      }, timeoutMs);
      const obs = new MutationObserver(() => {
        if (has()) {
          clearTimeout(timer);
          try { obs.disconnect(); } catch (_) {}
          resolve(true);
        } else if (Date.now() - start > timeoutMs) {
          clearTimeout(timer);
          try { obs.disconnect(); } catch (_) {}
          resolve(false);
        }
      });
      try {
        obs.observe(document.documentElement || document, { childList: true, subtree: true });
      } catch (_) {
        clearTimeout(timer);
        resolve(false);
      }
    });
  }

  function findNativeFaceDialogWrapper() {
    const wrappers = queryAllDeep(".el-dialog__wrapper");
    if (!wrappers.length) return null;

    const byAria = wrappers.find((w) => {
      const dialog = w.querySelector("[role='dialog'][aria-label]");
      return dialog && String(dialog.getAttribute("aria-label") || "").includes("\u4eba\u8138\u8bc6\u522b");
    });
    if (byAria) return byAria;

    const byText = wrappers.find((w) => {
      const txt = String(w.textContent || "");
      return txt.includes("\u4eba\u8138\u8bc6\u522b") && (txt.includes("\u8bc1\u4ef6\u7167\u7247") || txt.includes("\u62cd\u6444\u7167\u7247"));
    });
    return byText || null;
  }

  function forceShowElementUiDialog(wrapper) {
    if (!wrapper) return false;

    const parents = [];
    let p = wrapper;
    for (let i = 0; i < 6 && p; i++) {
      parents.push(p);
      p = p.parentElement;
    }
    parents.forEach((el) => {
      if (!el || !el.style) return;
      if (el.style.display === "none") el.style.display = "";
      if (el.style.visibility === "hidden") el.style.visibility = "";
    });

    wrapper.style.display = "";
    wrapper.style.zIndex = wrapper.style.zIndex || "2001";

    const dialog = wrapper.querySelector(".el-dialog");
    if (dialog) dialog.style.zIndex = dialog.style.zIndex || "2002";

    let modal = document.querySelector(".v-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "v-modal";
      document.body.appendChild(modal);
    }
    modal.style.display = "";
    modal.style.zIndex = "2000";

    try {
      document.body.classList.add("el-popup-parent--hidden");
    } catch (_) {}

    window.dispatchEvent(new Event("resize"));
    return true;
  }

  function tryOpenVueDialogVisible(wrapper) {
    const nodes = [wrapper, wrapper.querySelector(".el-dialog"), wrapper.querySelector("[role='dialog']")].filter(Boolean);
    for (const node of nodes) {
      const vm = node && node.__vue__;
      if (!vm) continue;

      let cur = vm;
      for (let i = 0; i < 6 && cur; i++) {
        const data = cur.$data || {};
        for (const k of Object.keys(data)) {
          const v = data[k];
          if (typeof v === "boolean" && (k.toLowerCase().includes("visible") || k.includes("dialog") || k.includes("face"))) {
            try {
              cur.$data[k] = true;
              if (typeof cur.$forceUpdate === "function") cur.$forceUpdate();
              return true;
            } catch (_) {}
          }
        }
        cur = cur.$parent;
      }

      try {
        if (typeof vm.visible === "boolean") {
          vm.visible = true;
          if (typeof vm.$emit === "function") vm.$emit("update:visible", true);
          if (typeof vm.$forceUpdate === "function") vm.$forceUpdate();
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  function tryClickOpenNativeFaceDialog() {
    const candidates = queryAllDeep("button, a, [role='button'], .el-button, .cell-item, .resource-item");
    const match = candidates.find((el) => {
      const t = String(el.textContent || "").replace(/\s+/g, "");
      if (!t) return false;
      return (
        t.includes("\u4eba\u8138\u8bc6\u522b") ||
        t.includes("\u4eba\u8138\u6838\u9a8c") ||
        t.includes("\u53bb\u6838\u9a8c") ||
        t.includes("\u5f00\u59cb\u6838\u9a8c") ||
        t === "\u6838\u9a8c"
      );
    });
    if (!match) return false;
    try {
      match.click();
      return true;
    } catch (_) {
      return false;
    }
  }

  function tryClickResourceEntry(resourceId) {
    if (!resourceId) return false;
    const rid = String(resourceId);
    const selectors = [
      `[data-id="${rid}"]`,
      `[data-resource-id="${rid}"]`,
      `[data-cell-id="${rid}"]`,
      `[id*="${rid}"]`,
      `[href*="${rid}"]`,
      `[onclick*="${rid}"]`,
    ];
    for (const s of selectors) {
      const list = queryAllDeep(s);
      if (!list.length) continue;
      for (const el of list) {
        try {
          el.click();
          return true;
        } catch (_) {}
      }
    }
    return false;
  }

  function ensureInjectedFaceDialogStyles() {
    const id = "jxjy-injected-face-style";
    if (document.getElementById(id)) return;
    if (!document.head) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      #jxjy-injected-v-modal{
        position:fixed;left:0;top:0;right:0;bottom:0;
        background:rgba(2,6,23,.72);
        backdrop-filter: blur(3px);
      }
      .jxjy-face-injected .el-dialog__wrapper{position:fixed;left:0;top:0;right:0;bottom:0;overflow:auto;}
      .jxjy-face-injected .el-dialog{
        position:relative;
        margin:10vh auto 40px;
        width:min(920px, calc(100vw - 32px));
        background:linear-gradient(180deg,#0b1220 0%, #0f172a 100%);
        border:1px solid rgba(148,163,184,.22);
        border-radius:16px;
        box-shadow:0 24px 70px rgba(0,0,0,.55);
        color:#e2e8f0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
      }
      .jxjy-face-injected .el-dialog__header{
        padding:14px 16px;
        border-bottom:1px solid rgba(148,163,184,.18);
        display:flex;align-items:center;justify-content:space-between;
        background:linear-gradient(135deg, rgba(29,78,216,.32), rgba(14,165,233,.20));
        border-radius:16px 16px 0 0;
      }
      .jxjy-face-injected .el-dialog__title{line-height:22px;font-size:15px;color:#fff;font-weight:650;letter-spacing:.2px;}
      .jxjy-face-injected .el-dialog__headerbtn{
        width:34px;height:34px;border-radius:10px;
        display:flex;align-items:center;justify-content:center;
        background:rgba(15,23,42,.55);
        border:1px solid rgba(148,163,184,.22);
        cursor:pointer;color:#e2e8f0;font-size:18px;
      }
      .jxjy-face-injected .el-dialog__headerbtn:hover{background:rgba(30,41,59,.75);}
      .jxjy-face-injected .el-dialog__body{padding:14px;color:#cbd5e1;font-size:12px;}
      .jxjy-face-injected .face-grid{display:flex;gap:14px;flex-wrap:wrap;}
      .jxjy-face-injected .face-card{
        flex:1 1 320px;
        border:1px solid rgba(148,163,184,.16);
        border-radius:14px;
        padding:14px;
        background:rgba(2,6,23,.35);
      }
      .jxjy-face-injected .face-card h4{margin:0 0 10px;font-size:12px;color:#e2e8f0;font-weight:650;}
      .jxjy-face-injected .face-preview{
        display:flex;align-items:center;justify-content:center;
        height:220px;
        background:rgba(15,23,42,.55);
        border:1px dashed rgba(148,163,184,.28);
        border-radius:12px;
        overflow:hidden;
      }
      .jxjy-face-injected .face-preview img{max-width:100%;max-height:100%;object-fit:contain;}
      .jxjy-face-injected .face-actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;}
      .jxjy-face-injected .el-button{
        display:inline-flex;align-items:center;justify-content:center;gap:6px;
        line-height:1;
        border:1px solid rgba(148,163,184,.22);
        background:rgba(15,23,42,.55);
        color:#e2e8f0;
        border-radius:10px;
        padding:8px 10px;
        font-size:12px;
        cursor:pointer;user-select:none;
        transition: transform .08s ease, background .12s ease, border-color .12s ease;
      }
      .jxjy-face-injected .el-button:hover{background:rgba(30,41,59,.70);border-color:rgba(148,163,184,.35);}
      .jxjy-face-injected .el-button:active{transform: translateY(1px);}
      .jxjy-face-injected .el-button--primary{
        background:linear-gradient(135deg,#1d4ed8,#0ea5e9);
        border-color:transparent;
        color:#fff;
      }
      .jxjy-face-injected .el-button--primary:hover{filter:brightness(1.05);}
      .jxjy-face-injected .el-button:disabled{opacity:.55;cursor:not-allowed;transform:none;}
      .jxjy-face-injected .tip{margin-top:10px;color:#94a3b8;font-size:12px;line-height:1.6;}
      .jxjy-face-injected .jxjy-face-demo{
        margin-top:10px;
        padding:8px;
        border-radius:12px;
        background:rgba(15,23,42,.35);
        border:1px solid rgba(148,163,184,.16);
        display:flex;
        justify-content:center;
      }
      .jxjy-face-injected .jxjy-face-demo .demo-title{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:#e2e8f0;font-weight:650;}
      .jxjy-face-injected .jxjy-face-demo .demo-grid{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start;}
      .jxjy-face-injected .jxjy-face-demo img{display:block;max-width:min(420px,100%);border-radius:10px;border:1px solid rgba(148,163,184,.2);background:#0b1220;}
      .jxjy-face-injected .jxjy-face-demo .demo-tips{flex:1 1 220px;min-width:220px;color:#cbd5e1;font-size:12px;line-height:1.65;}
      .jxjy-face-injected .jxjy-face-demo .demo-tips ul{margin:0;padding-left:18px;}
      .jxjy-face-injected .jxjy-face-demo .demo-tips li{margin:4px 0;}
      .jxjy-face-confirm{
        position:fixed;inset:0;z-index:3002;
        background:rgba(2,6,23,.65);
        backdrop-filter: blur(2px);
        display:flex;align-items:center;justify-content:center;
        padding:16px;
      }
      .jxjy-face-confirm .box{
        width:min(720px, calc(100vw - 24px));
        background:#0f172a;
        border:1px solid rgba(148,163,184,.24);
        border-radius:14px;
        box-shadow:0 24px 64px rgba(0,0,0,.55);
        color:#e2e8f0;
        overflow:hidden;
      }
      .jxjy-face-confirm .hd{
        padding:10px 12px;
        border-bottom:1px solid rgba(148,163,184,.2);
        font-weight:650;
        background:linear-gradient(135deg,rgba(29,78,216,.28),rgba(14,165,233,.22));
      }
      .jxjy-face-confirm .bd{padding:12px;font-size:12px;line-height:1.65;color:#cbd5e1;}
      .jxjy-face-confirm .bd .grid{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;}
      .jxjy-face-confirm .bd img{max-width:min(520px,100%);border-radius:12px;border:1px solid rgba(148,163,184,.2);background:#0b1220;}
      .jxjy-face-confirm .ft{
        padding:10px 12px;
        display:flex;
        gap:10px;
        justify-content:flex-end;
        border-top:1px solid rgba(148,163,184,.18);
        background:rgba(2,6,23,.25);
      }
      .jxjy-face-injected .status{
        margin-top:12px;padding:10px 12px;border-radius:12px;
        background:rgba(15,23,42,.55);
        border:1px solid rgba(148,163,184,.16);
        color:#e2e8f0;font-size:12px;white-space:pre-wrap;word-break:break-word;
      }
      .jxjy-face-injected .badge{
        display:inline-flex;align-items:center;gap:6px;
        padding:4px 10px;border-radius:999px;
        background:rgba(2,6,23,.35);
        border:1px solid rgba(148,163,184,.22);
        color:#cbd5e1;font-size:12px;
      }
      .jxjy-face-injected .badge b{color:#fff;}
      .jxjy-face-injected .muted{color:#94a3b8;}
      @media (max-width: 520px){
        .jxjy-face-injected .face-preview{height:190px;}
        .jxjy-face-injected .el-dialog__body{padding:12px;}
      }
    `;
    document.head.appendChild(style);
  }

  function closeInjectedFaceDialog() {
    const wrap = document.getElementById("jxjy-injected-face-wrapper");
    const modal = document.getElementById("jxjy-injected-v-modal");
    if (wrap) wrap.remove();
    if (modal) modal.remove();
    try { document.body.classList.remove("el-popup-parent--hidden"); } catch (_) {}
  }

  function showFaceCollectPrompt() {
    return new Promise((resolve) => {
      const old = document.getElementById("jxjy-face-start-prompt");
      if (old) old.remove();

      const overlay = document.createElement("div");
      overlay.id = "jxjy-face-start-prompt";
      overlay.style.cssText = "position:fixed;inset:0;z-index:3000;background:rgba(2,6,23,.68);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px;";
      overlay.innerHTML = `
        <div style="width:min(460px,calc(100vw - 24px));background:#0f172a;border:1px solid rgba(148,163,184,.24);border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.45);color:#e2e8f0;">
          <div style="padding:12px 14px;border-bottom:1px solid rgba(148,163,184,.2);font-weight:650;background:linear-gradient(135deg,rgba(29,78,216,.28),rgba(14,165,233,.22));border-radius:14px 14px 0 0;">\u8fd0\u884c\u524d\u91c7\u96c6\u63d0\u9192</div>
          <div style="padding:14px;line-height:1.65;font-size:13px;color:#cbd5e1;">\u672c\u6b21\u8fd0\u884c\u5c1a\u672a\u91c7\u96c6\u4eba\u8138\u7167\u7247\u3002<br/>\u9700\u8981\u5148\u624b\u52a8\u91c7\u96c6\u5e76\u4e0a\u4f20\uff0c\u5b8c\u6210\u540e\u624d\u53ef\u5f00\u59cb\u8fd0\u884c\u3002</div>
          <div style="padding:0 14px 14px;display:flex;gap:10px;justify-content:flex-end;">
            <button id="jxjy-face-prompt-cancel" style="border:1px solid rgba(148,163,184,.3);background:#1e293b;color:#e2e8f0;padding:7px 14px;border-radius:10px;cursor:pointer;">\u53d6\u6d88</button>
            <button id="jxjy-face-prompt-ok" style="border:0;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:7px 14px;border-radius:10px;cursor:pointer;">\u53bb\u91c7\u96c6</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const cleanup = (result) => {
        try { overlay.remove(); } catch (_) {}
        resolve(result);
      };
      const okBtn = overlay.querySelector("#jxjy-face-prompt-ok");
      const cancelBtn = overlay.querySelector("#jxjy-face-prompt-cancel");
      if (okBtn) okBtn.addEventListener("click", () => cleanup(true));
      if (cancelBtn) cancelBtn.addEventListener("click", () => cleanup(false));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }

  function showFaceUploadConfirm(demoImgUrl, onOkClick) {
    return new Promise((resolve) => {
      const old = document.getElementById("jxjy-face-upload-confirm");
      if (old) old.remove();

      const overlay = document.createElement("div");
      overlay.id = "jxjy-face-upload-confirm";
      overlay.className = "jxjy-face-confirm";
      overlay.innerHTML = `
        <div class="box" role="dialog" aria-modal="true" aria-label="\u4e0a\u4f20\u4eba\u8138\u7167\u7247\u63d0\u793a">
          <div class="hd">\u4e0a\u4f20\u4eba\u8138\u7167\u7247</div>
          <div class="bd">
            <div style="margin-bottom:10px;color:#cbd5e1;">\u8bf7\u4e0a\u4f20\u3010\u672c\u4eba\u3011\u6b63\u8138\u6e05\u6670\u7167\uff08\u5355\u4eba\u3001\u65e0\u906e\u6321\uff09\u3002</div>
            <div class="grid" style="justify-content:center;">
              <img alt="\u6807\u51c6\u4eba\u8138\u8bc6\u522b\u6f14\u793a\u56fe" referrerpolicy="no-referrer" src="${String(demoImgUrl || "")}"/>
              <div style="flex:1 1 220px;min-width:220px;">
                <div style="font-weight:650;color:#e2e8f0;margin:0 0 6px;">\u8981\u70b9</div>
                <ul style="margin:0;padding-left:18px;">
                  <li>\u6b63\u8138\u5c45\u4e2d\u3001\u514d\u51a0</li>
                  <li>\u773c\u9f3b\u53e3\u6e05\u6670\uff0c\u4e0d\u906e\u6321</li>
                  <li>\u5149\u7ebf\u5747\u5300\uff0c\u522b\u5f3a\u53cd\u5149/\u9634\u5f71</li>
                  <li>\u80cc\u666f\u5c3d\u91cf\u767d/\u6d45\u8272</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="ft">
            <button class="el-button" id="jxjy-face-confirm-cancel">\u53d6\u6d88</button>
            <button class="el-button el-button--primary" id="jxjy-face-confirm-ok">\u7ee7\u7eed\u9009\u62e9\u56fe\u7247</button>
          </div>
        </div>
      `;

      const cleanup = (v) => {
        try { overlay.remove(); } catch (_) {}
        resolve(!!v);
      };

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(false);
      });

      document.body.appendChild(overlay);
      const okBtn = overlay.querySelector("#jxjy-face-confirm-ok");
      const cancelBtn = overlay.querySelector("#jxjy-face-confirm-cancel");
      if (okBtn) okBtn.addEventListener("click", () => {
        try { if (typeof onOkClick === "function") onOkClick(); } catch (_) {}
        cleanup(true);
      });
      if (cancelBtn) cancelBtn.addEventListener("click", () => cleanup(false));
    });
  }

  async function openInjectedFaceDialog(faceInfo, context = {}) {
    try { closeInjectedFaceDialog(); } catch (_) {}
    const okHead = await waitForDomReady("head", 15000);
    const okBody = await waitForDomReady("body", 15000);
    if (!okBody) {

      return { ok: false, method: "inject_no_body" };
    }
    ensureInjectedFaceDialogStyles();

    const modal = document.createElement("div");
    modal.id = "jxjy-injected-v-modal";
    modal.className = "v-modal";
    modal.style.zIndex = "2000";

    const wrapper = document.createElement("div");
    wrapper.id = "jxjy-injected-face-wrapper";
    wrapper.className = "el-dialog__wrapper jxjy-face-injected";
    wrapper.style.zIndex = "2001";
    wrapper.setAttribute("role", "dialog");
    wrapper.setAttribute("aria-modal", "true");
    wrapper.setAttribute("aria-label", "\u4eba\u8138\u8bc6\u522b");

    const idPhotoUrl = faceInfo && faceInfo.IDPhoto ? String(faceInfo.IDPhoto) : "";
    const courseId = context && context.courseId ? String(context.courseId) : "";
    const resourceId = context && context.resourceId ? String(context.resourceId) : "";
    const resType = context && context.resType != null ? Number(context.resType) : 1;
    const manualCaptureOnly = !!(context && context.manualCaptureOnly);
    const isPro = String(state.cloudTier || "").toLowerCase() === "pro";
    const onUploaded = context && typeof context.onUploaded === "function" ? context.onUploaded : null;
    const onClosed = context && typeof context.onClosed === "function" ? context.onClosed : null;
    let finished = false;

    wrapper.innerHTML = `
      <div class="el-dialog el-dialog--center">
        <div class="el-dialog__header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="el-dialog__title">\u4eba\u8138\u8bc6\u522b</span>
            <span class="badge"><b>\u63d0\u793a</b><span class="muted">${manualCaptureOnly ? "\u8bf7\u624b\u52a8\u5b8c\u6210\u4e00\u6b21\u62cd\u7167\u4e0a\u4f20" : "\u9700\u8981\u4f60\u5b8c\u6210\u4e00\u6b21\u5e73\u53f0\u6838\u9a8c"}</span></span>
          </div>
          <button type="button" aria-label="Close" class="el-dialog__headerbtn" id="jxjy-face-close">✕</button>
        </div>
        <div class="el-dialog__body">
          <div class="face-grid">
            <div class="face-card">
              <h4>\u8bc1\u4ef6\u7167\u7247</h4>
              <div class="face-preview">
                ${idPhotoUrl ? `<img alt="\u8bc1\u4ef6\u7167\u7247" referrerpolicy="no-referrer" src="${idPhotoUrl}"/>` : `<div style="color:#94a3b8;">\u672a\u83b7\u53d6\u5230\u8bc1\u4ef6\u7167</div>`}
              </div>
              <div class="tip">\u5982\u8bc1\u4ef6\u7167\u4e3a\u7a7a\uff0c\u8bf7\u7b49\u5f85\u9662\u6821\u4e0a\u4f20\u8bc1\u4ef6\u7167\u7247\u540e\u518d\u6838\u9a8c\u3002\u5982\u679c\u4e00\u76f4\u6bd4\u5bf9\u5931\u8d25\u53ef\u8054\u7cfb\u9662\u6821\u66ff\u6362\u5e73\u53f0\u7167\u7247\uff01</div>
            </div>
            <div class="face-card">
              <h4>\u62cd\u6444\u7167\u7247</h4>
              <div class="face-preview">
                <video id="jxjy-face-video" playsinline autoplay muted style="width:100%;height:100%;object-fit:cover;display:none;"></video>
                <canvas id="jxjy-face-canvas" style="display:none;"></canvas>
                <div id="jxjy-face-no-video" style="color:#94a3b8;">\u70b9\u51fb“\u68c0\u6d4b\u6444\u50cf\u5934”\u5f00\u59cb</div>
              </div>
              <div class="face-actions">
                <button class="el-button el-button--primary" id="jxjy-face-detect">\u68c0\u6d4b\u6444\u50cf\u5934</button>
                <button class="el-button" id="jxjy-face-capture" disabled>\u62cd\u7167</button>
                <button class="el-button" id="jxjy-face-stop" disabled>\u505c\u6b62\u6444\u50cf\u5934</button>
                ${isPro ? `<button class="el-button" id="jxjy-face-upload-btn">\u4e0a\u4f20\u4eba\u8138\u7167\u7247</button>
                <input id="jxjy-face-upload" type="file" accept="image/*" style="display:none;"/>` : ""}
              </div>
              <div class="status" id="jxjy-face-status">\u7b49\u5f85\u64cd\u4f5c…</div>
              <div class="tip">\u8be5\u4eba\u8138\u5f39\u7a97\u4e3a\u901a\u8fc7\u5e73\u53f0\u5bf9\u4e8e\u8bfe\u7a0b\u4f5c\u4e1a\u8003\u8bd5\u7b49\u9700\u8981\u4eba\u8138\u8bc6\u522b\u7684\u73af\u8282\uff0c\u6240\u6709\u4e0a\u4f20\u56fe\u7247\u5747\u5230\u5b66\u4e60\u5e73\u53f0\uff0c\u548c\u672c\u811a\u672c\u65e0\u5173\u3002</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.appendChild(wrapper);
    try { document.body.classList.add("el-popup-parent--hidden"); } catch (_) {}

    const closeWithReason = (reason) => {
      if (!finished && onClosed) {
        try { onClosed(reason || "closed"); } catch (_) {}
      }
      closeInjectedFaceDialog();
    };

    const setStatus = (t) => {
      const box = document.getElementById("jxjy-face-status");
      if (box) box.textContent = String(t || "");
    };

    const btnClose = wrapper.querySelector("#jxjy-face-close");
    if (btnClose) btnClose.addEventListener("click", () => closeWithReason("closed_by_button"));
    modal.addEventListener("click", () => closeWithReason("closed_by_mask"));
    wrapper.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeWithReason("closed_by_esc");
    });

    const btnDetect = wrapper.querySelector("#jxjy-face-detect");
    const btnCapture = wrapper.querySelector("#jxjy-face-capture");
    const btnStop = wrapper.querySelector("#jxjy-face-stop");
    const btnUpload = wrapper.querySelector("#jxjy-face-upload-btn");
    const fileInput = wrapper.querySelector("#jxjy-face-upload");
    const video = wrapper.querySelector("#jxjy-face-video");
    const canvas = wrapper.querySelector("#jxjy-face-canvas");
    const noVideo = wrapper.querySelector("#jxjy-face-no-video");

    let stream = null;
    const stopStream = () => {
      if (stream) {
        try { stream.getTracks().forEach((t) => t.stop()); } catch (_) {}
        stream = null;
      }
      if (video) {
        try { video.srcObject = null; } catch (_) {}
        video.style.display = "none";
      }
      if (noVideo) noVideo.style.display = "";
      if (btnCapture) btnCapture.disabled = true;
      if (btnStop) btnStop.disabled = true;
    };

    if (btnStop) {
      btnStop.addEventListener("click", () => {
        stopStream();
        setStatus("\u5df2\u505c\u6b62\u6444\u50cf\u5934");
      });
    }

    if (btnDetect) {
      btnDetect.addEventListener("click", async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus("\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301 getUserMedia");
            return;
          }
          setStatus("\u6b63\u5728\u8bf7\u6c42\u6444\u50cf\u5934\u6743\u9650…");
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
          if (video) {
            video.style.display = "";
            if (noVideo) noVideo.style.display = "none";
            video.srcObject = stream;
            await video.play();
          }
          if (btnCapture) btnCapture.disabled = false;
          if (btnStop) btnStop.disabled = false;
          setStatus("\u6444\u50cf\u5934\u5df2\u5f00\u542f\uff0c\u53ef\u4ee5\u62cd\u7167");
        } catch (e) {
          setStatus(`\u6444\u50cf\u5934\u6253\u5f00\u5931\u8d25: ${e && e.message ? e.message : e}`);
          stopStream();
        }
      });
    }

    if (btnCapture) {
      btnCapture.addEventListener("click", async () => {
        try {
          if (!video || !canvas) return;
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, w, h);

          setStatus("\u5df2\u62cd\u7167\uff0c\u6b63\u5728\u68c0\u6d4b\u662f\u5426\u4e3a\u5355\u4eba\u6b63\u8138…");
          const pre = await precheckFaceFromCanvas(canvas);
          if (pre && pre.ok === false) {
            setStatus(`\u8bf7\u91cd\u62cd\uff1a${pre.reason || "\u672a\u901a\u8fc7\u9884\u68c0"}`);
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const dataUrl = canvas.toDataURL("image/png");
          const img = new Image();
          img.src = dataUrl;
          const prev = wrapper.querySelector(".face-card:nth-child(2) .face-preview");
          if (prev) {
            prev.innerHTML = "";
            prev.appendChild(img);
          }

          setStatus("\u9884\u68c0\u901a\u8fc7\uff0c\u6b63\u5728\u4e0a\u4f20\u5230OBS\u5e76\u6821\u9a8c\u56fe\u7247\u53ef\u7528\u6027…");
          if (btnCapture) btnCapture.disabled = true;

          const pngBytes = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error("toBlob\u5931\u8d25")); return; }
              blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab))).catch(reject);
            }, "image/png");
          });

          const md5 = md5Uint8Hex(pngBytes);
          const cfg = await getFaceRecognitionConfig();
          if (!cfg) {
            setStatus("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25\uff0c\u65e0\u6cd5\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c");
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const uploaded = await uploadPhotoToOBS(pngBytes, md5, cfg, "image/png", "png");
          if (!uploaded || !uploaded.ok) {
            setStatus("\u4e0a\u4f20OBS\u5931\u8d25\uff0c\u65e0\u6cd5\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c");
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
          if (!obsOk) {
            setStatus(`❌ OBS\u6e90\u7ad9\u56de\u8bfbMD5\u4e0d\u4e00\u81f4\uff0c\u8bf4\u660e\u4e0a\u4f20\u5185\u5bb9\u672c\u8eab\u5c31\u4e0d\u5bf9\u3002\nOBS: ${uploaded.obsUrl}\nCDN: ${uploaded.cdnUrl}\n\u5df2\u6682\u505c\u540e\u53f0\u6838\u9a8c\u63d0\u4ea4\uff08\u907f\u514d\u6d88\u8017\u6b21\u6570\uff09\u3002`);
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
          if (!ready) {
            setStatus(`OBS\u6e90\u7ad9\u5df2\u4e00\u81f4\uff0c\u4f46CDN\u77ed\u65f6\u95f4\u5185\u4ecd\u4e0d\u53ef\u8bbf\u95ee/\u672a\u540c\u6b65\u3002\nCDN: ${uploaded.cdnUrl}\n\u53ef\u5148\u590d\u5236OBS\u6e90\u7ad9\u786e\u8ba4\u56fe\u7247\uff1a${uploaded.obsUrl}\n\u5df2\u6682\u505c\u540e\u53f0\u6838\u9a8c\u63d0\u4ea4\uff08\u907f\u514d\u6d88\u8017\u6b21\u6570\uff09\u3002`);
            if (btnCapture) btnCapture.disabled = false;
            return;
          }
          const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
          if (!cdnOk) {
            setStatus(`⚠️ OBS\u6e90\u7ad9\u4e00\u81f4\uff0c\u4f46CDN\u56de\u8bfbMD5\u4ecd\u4e0d\u4e00\u81f4\uff08\u7f13\u5b58/\u540c\u6b65\u5ef6\u8fdf\uff09\u3002\nCDN: ${uploaded.cdnUrl}\nOBS: ${uploaded.obsUrl}\n\u5efa\u8bae\u7a0d\u540e\u518d\u8bd5\uff08\u907f\u514d\u6d88\u8017\u6b21\u6570\uff09\u3002`);
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const cachePayload = withLivePreferredPinned({
            source: "manual_capture",
            md5: md5,
            cdnUrl: uploaded.cdnUrl,
            obsUrl: uploaded.obsUrl,
            objectKey: uploaded.objectKey,
            studentId: resolveLearningUserId(),
            updatedAt: Date.now(),
          });
          writeFaceCache(cachePayload);
          state.startupFacePrepared = true;
          state.faceCapturedThisRun = true;
          setFaceCacheStatus("\u5df2\u5c31\u7eea(\u624b\u52a8\u62cd\u7167)");
          if (onUploaded) {
            try { onUploaded(cachePayload); } catch (_) {}
          }
          finished = true;

          if (manualCaptureOnly || !AUTO_SUBMIT_FACE_VERIFICATION) {
            setStatus(`✅ \u4e0a\u4f20\u6210\u529f\u4e14MD5\u4e00\u81f4\uff0c\u56fe\u7247\u5df2\u7f13\u5b58\u3002\nCDN: ${uploaded.cdnUrl}\n\u53ef\u5173\u95ed\u5f39\u7a97\u7ee7\u7eed\u5b66\u4e60\u3002`);
            stopStream();
            closeInjectedFaceDialog();
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          if (!courseId || !resourceId) {
            setStatus("\u5df2\u62cd\u7167\u4e0a\u4f20\u5e76\u7f13\u5b58\u3002\u7f3a\u5c11 courseId/resourceId\uff0c\u6682\u4e0d\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c\u3002");
            if (btnCapture) btnCapture.disabled = false;
            return;
          }

          const ok = await submitFaceVerification(uploaded.cdnUrl, md5, courseId, resourceId, resType);
          if (ok) {
            setStatus("✅ \u540e\u53f0\u4eba\u8138\u6838\u9a8c\u63d0\u4ea4\u6210\u529f\uff08\u63a5\u53e3\u8fd4\u56detrue\uff09\u3002\u4f60\u53ef\u4ee5\u7ee7\u7eed\u81ea\u52a8\u5b66\u4e60\u3002");
          } else {
            setStatus("❌ \u540e\u53f0\u4eba\u8138\u6838\u9a8c\u672a\u901a\u8fc7\uff08\u63a5\u53e3\u8fd4\u56defalse/\u5f02\u5e38\uff09\u3002\u5efa\u8bae\u6539\u7528\u5e73\u53f0\u539f\u751f\u5f39\u7a97\u518d\u8bd5\u3002");
          }
          if (btnCapture) btnCapture.disabled = false;
        } catch (e) {
          setStatus(`\u62cd\u7167\u5931\u8d25: ${e && e.message ? e.message : e}`);
          if (btnCapture) btnCapture.disabled = false;
        }
      });
    }

    if (btnUpload && fileInput) {
      btnUpload.addEventListener("click", () => {
        showFaceUploadConfirm(
          "https://ncstatic.clewm.net/rsrc/2026/0427/17/79449e1a51a8437aa81163390401b5df.png",
          () => {
            try { fileInput.value = ""; } catch (_) {}
            try { fileInput.click(); } catch (_) {}
          }
        );
      });
      fileInput.addEventListener("change", async () => {
        try {
          const f = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
          if (!f) return;
          setStatus("\u5df2\u9009\u62e9\u56fe\u7247\uff0c\u6b63\u5728\u8f6cPNG\u5e76\u505a\u672c\u5730\u9884\u68c0…");
          btnUpload.disabled = true;
          const ab = await f.arrayBuffer();
          const pngBytes = await convertToPngBytes(ab);

          try {
            if (typeof createImageBitmap === "function") {
              const bmp = await createImageBitmap(new Blob([pngBytes], { type: "image/png" }));
              const w = bmp.width || 640;
              const h = bmp.height || 480;
              const c = document.createElement("canvas");
              c.width = w; c.height = h;
              const ctx = c.getContext("2d");
              ctx.drawImage(bmp, 0, 0, w, h);
              const pre = await precheckFaceFromCanvas(c);
              if (pre && pre.ok === false) {
                setStatus(`\u8bf7\u6362\u56fe\uff1a${pre.reason || "\u672a\u901a\u8fc7\u9884\u68c0"}`);
                return;
              }
            }
          } catch (_) {}

          try {
            const cards = wrapper.querySelectorAll(".face-grid .face-card");
            const prev = cards && cards.length >= 2 ? cards[1].querySelector(".face-preview") : null;
            if (prev) {
              const url = URL.createObjectURL(new Blob([pngBytes], { type: "image/png" }));
              const img = new Image();
              img.onload = () => { try { URL.revokeObjectURL(url); } catch (_) {} };
              img.src = url;
              prev.innerHTML = "";
              prev.appendChild(img);
            }
          } catch (_) {}

          setStatus("\u9884\u68c0\u901a\u8fc7\uff0c\u6b63\u5728\u4e0a\u4f20\u5230OBS\u5e76\u6821\u9a8c\u56fe\u7247\u53ef\u7528\u6027…");

          const md5 = md5Uint8Hex(pngBytes);
          const cfg = await getFaceRecognitionConfig();
          if (!cfg) {
            setStatus("\u83b7\u53d6OBS\u914d\u7f6e\u5931\u8d25\uff0c\u65e0\u6cd5\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c");
            return;
          }
          const uploaded = await uploadPhotoToOBS(pngBytes, md5, cfg, "image/png", "png");
          if (!uploaded || !uploaded.ok) {
            setStatus("\u4e0a\u4f20OBS\u5931\u8d25\uff0c\u65e0\u6cd5\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c");
            return;
          }
          const obsOk = await verifyUploadedPhotoMd5(uploaded.obsUrl, md5, { label: "OBS\u6e90\u7ad9" });
          if (!obsOk) {
            setStatus(`❌ OBS\u6e90\u7ad9\u56de\u8bfbMD5\u4e0d\u4e00\u81f4\uff0c\u5df2\u6682\u505c\u63d0\u4ea4\uff08\u907f\u514d\u6d88\u8017\u6b21\u6570\uff09\u3002\nOBS: ${uploaded.obsUrl}\nCDN: ${uploaded.cdnUrl}`);
            return;
          }
          const ready = await waitForPhotoReady(uploaded.cdnUrl, 8);
          if (!ready) {
            setStatus(`OBS\u6e90\u7ad9\u5df2\u4e00\u81f4\uff0c\u4f46CDN\u77ed\u65f6\u95f4\u5185\u4ecd\u4e0d\u53ef\u8bbf\u95ee/\u672a\u540c\u6b65\u3002\nCDN: ${uploaded.cdnUrl}\nOBS: ${uploaded.obsUrl}\n\u5df2\u6682\u505c\u63d0\u4ea4\uff08\u907f\u514d\u6d88\u8017\u6b21\u6570\uff09\u3002`);
            return;
          }
          const cdnOk = await verifyUploadedPhotoMd5(uploaded.cdnUrl, md5, { label: "CDN" });
          if (!cdnOk) {
            setStatus(`⚠️ OBS\u6e90\u7ad9\u4e00\u81f4\uff0c\u4f46CDN\u56de\u8bfbMD5\u4ecd\u4e0d\u4e00\u81f4\uff08\u7f13\u5b58/\u540c\u6b65\u5ef6\u8fdf\uff09\u3002\nCDN: ${uploaded.cdnUrl}\nOBS: ${uploaded.obsUrl}\n\u5efa\u8bae\u7a0d\u540e\u518d\u8bd5\u3002`);
            return;
          }

          const cachePayload = withLivePreferredPinned({
            source: "manual_upload",
            md5: md5,
            cdnUrl: uploaded.cdnUrl,
            obsUrl: uploaded.obsUrl,
            objectKey: uploaded.objectKey,
            studentId: resolveLearningUserId(),
            updatedAt: Date.now(),
          });
          writeFaceCache(cachePayload);
          state.startupFacePrepared = true;
          state.faceCapturedThisRun = true;
          setFaceCacheStatus("\u5df2\u5c31\u7eea(\u624b\u52a8\u4e0a\u4f20)");
          if (onUploaded) {
            try { onUploaded(cachePayload); } catch (_) {}
          }
          finished = true;

          if (manualCaptureOnly || !AUTO_SUBMIT_FACE_VERIFICATION) {
            setStatus(`✅ \u4e0a\u4f20\u6210\u529f\u4e14MD5\u4e00\u81f4\uff0c\u56fe\u7247\u5df2\u7f13\u5b58\u3002\nCDN: ${uploaded.cdnUrl}\n\u53ef\u5173\u95ed\u5f39\u7a97\u7ee7\u7eed\u5b66\u4e60\u3002`);
            stopStream();
            closeInjectedFaceDialog();
            return;
          }
          if (!courseId || !resourceId) {
            setStatus("\u5df2\u4e0a\u4f20\u5e76\u7f13\u5b58\u3002\u7f3a\u5c11 courseId/resourceId\uff0c\u6682\u4e0d\u63d0\u4ea4\u540e\u53f0\u6838\u9a8c\u3002");
            return;
          }
          const ok = await submitFaceVerification(uploaded.cdnUrl, md5, courseId, resourceId, resType);
          if (ok) setStatus("✅ \u540e\u53f0\u4eba\u8138\u6838\u9a8c\u63d0\u4ea4\u6210\u529f\uff08\u63a5\u53e3\u8fd4\u56detrue\uff09\u3002\u4f60\u53ef\u4ee5\u7ee7\u7eed\u81ea\u52a8\u5b66\u4e60\u3002");
          else setStatus("❌ \u540e\u53f0\u4eba\u8138\u6838\u9a8c\u672a\u901a\u8fc7\uff08\u63a5\u53e3\u8fd4\u56defalse/\u5f02\u5e38\uff09\u3002\u5efa\u8bae\u6539\u7528\u5e73\u53f0\u539f\u751f\u5f39\u7a97\u518d\u8bd5\u3002");
        } catch (e) {
          setStatus(`\u4e0a\u4f20\u5904\u7406\u5931\u8d25: ${String((e && e.message) || e)}`);
        } finally {
          try { btnUpload.disabled = false; } catch (_) {}
          try { fileInput.value = ""; } catch (_) {}
        }
      });
    }

    try { wrapper.tabIndex = -1; wrapper.focus(); } catch (_) {}
    return { ok: true, method: "injected_dialog" };
  }

  async function waitForNativeFaceDialogAndOpen(timeoutMs = 20 * 1000, options = {}) {
    const resourceId = options && options.resourceId ? String(options.resourceId) : "";
    const start = Date.now();
    let retriggered = false;

    const tryOpenNow = () => {
      if (tryClickOpenNativeFaceDialog()) return { ok: true, method: "click" };

      const wrapper = findNativeFaceDialogWrapper();
      if (!wrapper) return { ok: false };

      if (tryOpenVueDialogVisible(wrapper)) return { ok: true, method: "vue_visible" };

      if (forceShowElementUiDialog(wrapper)) return { ok: true, method: "force_show" };

      return { ok: false };
    };

    const first = tryOpenNow();
    if (first.ok) return first;

    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        try { obs.disconnect(); } catch (_) {}
        resolve({ ok: false, method: "timeout" });
      }, timeoutMs);

      const obs = new MutationObserver(() => {
        const r = tryOpenNow();
        if (r.ok) {
          clearTimeout(timer);
          try { obs.disconnect(); } catch (_) {}
          resolve(r);
        } else if (Date.now() - start > timeoutMs) {
          clearTimeout(timer);
          try { obs.disconnect(); } catch (_) {}
          resolve({ ok: false, method: "timeout" });
        } else if (!retriggered && resourceId && Date.now() - start > 2500) {
          retriggered = true;
          const clicked = tryClickResourceEntry(resourceId);

        }
      });

      try {
        obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
      } catch (_) {
        clearTimeout(timer);
        resolve({ ok: false, method: "observer_failed" });
      }
    });
  }

  async function openNativeFaceModalOrNavigate(courseId, resourceId, resType, options = {}) {
    const force = !!(options && options.force);
    const url = buildNativeFaceUrl(courseId, resourceId, resType);
    log(`🧑‍🦰 \u9700\u8981\u4eba\u8138\u6838\u9a8c\uff1a\u5c1d\u8bd5\u5f39\u51fa\u539f\u751f\u4eba\u8138\u8bc6\u522b\u7a97\u53e3\uff08\u9875\u9762\u5185\u5f39\u7a97\uff09`);

    await waitForDomReady("body", 15000);

    const isStudentSpace = location.pathname.includes("/app/jxjy-student-space-web");
    if (!isStudentSpace) {
      try {
        const u = new URL(url, location.href);
        if (u.origin === location.origin) {
          history.pushState({}, "", u.href);
          window.dispatchEvent(new PopStateEvent("popstate"));

          await sleep(600);
          const r = await waitForNativeFaceDialogAndOpen(20 * 1000, { resourceId });
          if (r.ok) return { ok: true, action: `open_after_route:${r.method}` };
        }
      } catch (_) {}

      if (force) {
        try {
          const faceInfo = await getFaceRecognitionInfo(courseId, resourceId, resType);
          const inj = await openInjectedFaceDialog(faceInfo, { courseId, resourceId, resType });

          return { ok: true, action: inj.method };
        } catch (e) {

          return { ok: false, action: "inject_failed" };
        }
      }

      location.href = url;
      return { ok: true, action: "navigate_hard" };
    }

    if (resourceId) {
      const clicked = tryClickResourceEntry(resourceId);

    }
    const r = await waitForNativeFaceDialogAndOpen(20 * 1000, { resourceId });
    if (r.ok) {

      return { ok: true, action: r.method };
    }

    try {
      const faceInfo = await getFaceRecognitionInfo(courseId, resourceId, resType);
      const inj = await openInjectedFaceDialog(faceInfo, { courseId, resourceId, resType });

      return { ok: true, action: inj.method };
    } catch (e) {

      return { ok: false, action: r.method || "unknown" };
    }
  }

  async function waitUntilFaceVerified(courseId, resourceId, resType, timeoutMs = 3 * 60 * 1000, options = {}) {
    const force = !!(options && options.force);
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const info = await getFaceRecognitionInfo(courseId, resourceId, resType);
      if (!force && info && info.IsNeedFaceVerification === false) {
        return true;
      }
      await sleep(5000);
    }
    return !force;
  }

  function withNoCacheQuery(url) {
    try {
      const u = new URL(String(url), location.href);
      u.searchParams.set("_ts", String(Date.now()));
      u.searchParams.set("_r", String(Math.random()).slice(2));
      return u.toString();
    } catch (_) {
      const sep = String(url).includes("?") ? "&" : "?";
      return `${url}${sep}_ts=${Date.now()}&_r=${String(Math.random()).slice(2)}`;
    }
  }

  async function waitForPhotoReady(photoUrl, maxRetry = 6) {
    for (let i = 0; i < maxRetry; i++) {
      try {
        const u = withNoCacheQuery(photoUrl);
        try {
          await fetchRequestArrayBuffer(u, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" }, null);
        } catch (_) {
          try {
            await gmRequestArrayBufferDirect(u, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" });
          } catch (_) {
            await gmRequestArrayBuffer(u, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" });
          }
        }

        return true;
      } catch (e) {

        await sleep(1200 + i * 900);
      }
    }
    return false;
  }

  async function verifyUploadedPhotoMd5(photoUrl, expectedMd5, options = {}) {
    const label = (options && options.label) ? String(options.label) : "";
    try {
      const finalUrl = withNoCacheQuery(photoUrl);

      let uploaded;
      let meta = { via: "", status: 0, contentType: "" };
      try {
        const r = await fetchRequestArrayBufferWithMeta(finalUrl, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" }, null);
        uploaded = r.arrayBuffer;
        meta = { via: "fetch", status: r.status, contentType: r.contentType };
      } catch (e) {

        try {
          const r2 = await gmRequestArrayBufferDirect(finalUrl, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" });
          uploaded = r2.arrayBuffer;
          meta = { via: "gm_direct", status: r2.status, contentType: r2.contentType };
        } catch (e2) {
          uploaded = await gmRequestArrayBuffer(finalUrl, "GET", { "Cache-Control": "no-cache", Pragma: "no-cache" });
          meta = { via: "gm_wrapper", status: 0, contentType: "" };
        }
      }
      const actualMd5 = md5ArrayBufferHex(uploaded);
      const bytes = new Uint8Array(uploaded || []);
      const sigHex = Array.from(bytes.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const isPng = bytes.length >= 8 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
        bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
      const ok = actualMd5 === expectedMd5;

      if (!ok) {
        let previewText = "";
        try {
          previewText = new TextDecoder().decode(bytes.slice(0, 120)).replace(/\s+/g, " ");
        } catch (_) {}

      }
      return ok;
    } catch (e) {

      return false;
    }
  }

 async function uploadPhotoToOBS(photoData, photoMd5, config, contentType, fileExt) {
    if (!config) {

        return null;
    }

    const bucketName = config.bucketName;
    const endpoint = config.endpoint;

    const objectKey = `${photoMd5}.${fileExt}`;
    const fallbackObsUrl = `https://${bucketName}.${endpoint}/${objectKey}`;
    const date = new Date().toUTCString();

    try {
        const headers = {
            "x-obs-date": date,
            "x-obs-acl": "public-read",
            "Content-Type": contentType,
        };
        const signResult = await _os(config.encryptedConfig || "", objectKey, contentType);
        const signedHeaders = signResult && signResult.headers ? signResult.headers : {};
        const authorization = String(signResult.authorization || signedHeaders.Authorization || "");
        const obsUrl = String(signResult.obsUrl || fallbackObsUrl);
        if (!authorization) {
          throw new Error("obs_sign_empty");
        }
        headers.Authorization = authorization;
        if (signedHeaders["x-obs-date"]) headers["x-obs-date"] = String(signedHeaders["x-obs-date"]);
        if (signedHeaders["x-obs-acl"]) headers["x-obs-acl"] = String(signedHeaders["x-obs-acl"]);
        if (signedHeaders["Content-Type"]) headers["Content-Type"] = String(signedHeaders["Content-Type"]);

        const sendBody = (photoData instanceof Uint8Array)
          ? photoData.buffer.slice(photoData.byteOffset, photoData.byteOffset + photoData.byteLength)
          : photoData;
        const uploadBlob = (sendBody instanceof Blob) ? sendBody : new Blob([sendBody], { type: contentType });

        try {
          const base = `https://${bucketName}.${endpoint}`;
          await fetch(`${base}/?apiversion`, {
            method: "OPTIONS",
            mode: "cors",
            credentials: "omit",
            headers: {
              Origin: location.origin,
              "Access-Control-Request-Method": "PUT",
              "Access-Control-Request-Headers": "authorization,content-type,x-obs-acl,x-obs-date",
            },
          });
        } catch (_) {}
        try {
          const base = `https://${bucketName}.${endpoint}`;
          await fetch(`${base}/?apiversion`, {
            method: "HEAD",
            mode: "cors",
            credentials: "omit",
            headers: {
              region: "undefined",
              "x-obs-date": String(headers["x-obs-date"] || date),
            },
          });
        } catch (_) {}

        let putStatus = 0;
        try {
          const putRes = await fetch(obsUrl, {
            method: "PUT",
            mode: "cors",
            credentials: "omit",
            headers: headers,
            body: uploadBlob,
          });
          putStatus = putRes.status;

          if (!putRes.ok) {
            const t = await putRes.text().catch(() => "");
            throw new Error(`HTTP ${putRes.status}: ${String(t).slice(0, 240)}`);
          }
        } catch (fetchErr) {

          const gmRes = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: "PUT",
              url: obsUrl,
              headers: headers,
              data: uploadBlob,
              timeout: 60000,
              withCredentials: false,
              responseType: "text",
              onload: (res) => resolve(res),
              onerror: () => reject(new Error("\u7f51\u7edc\u9519\u8bef")),
              ontimeout: () => reject(new Error("\u4e0a\u4f20\u8d85\u65f6")),
            });
          });
          putStatus = gmRes.status;

          if (gmRes.status !== 200) {
            throw new Error(`HTTP ${gmRes.status}: ${String(gmRes.responseText || "").slice(0, 240)}`);
          }
        }

        if (putStatus === 200) {
            const base = String(config.urlBase || "https://frs.ahjxjy.cn").replace(/\/+$/, "");
            const cdnUrl = `${base}/${objectKey}`;

            return { ok: true, objectKey, obsUrl, cdnUrl };
        }
        return null;
    } catch (e) {

        return null;
    }
}

 async function submitFaceVerification(photoUrl, photoMd5, courseId, resourceId, resType) {
    const verificationData = {
        url: photoUrl,
        md5: photoMd5,
        courseId: courseId,
        resourceId: resourceId,
        resType: resType
    };

    const verificationJson = JSON.stringify(verificationData);

    const encryptedData = await _bp("face", verificationData);
    if (!encryptedData) {

        return false;
    }

    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/face-recognition/face-verification";
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.bearerToken}`,
        "Student": state.studentId,
        "user-type": "4",
        "Origin": "https://jxjynew.ahjxjy.cn",
        "Referer": "https://jxjynew.ahjxjy.cn/",
    };

    const requestBody = JSON.stringify({ data: encryptedData });

    try {
        try {
            const responseText = await fetchRequestText(url, "POST", headers, requestBody);

            return String(responseText).trim() === "true";
        } catch (fetchErr) {

            const gmRes = await gmRequestWithStatus(url, "POST", headers, requestBody);
            const gmText = String(gmRes.text || "");
            if (gmRes.status === 403 && gmText.includes("\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5")) {
              setFaceVerifyLockedToday("\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5");
              state.faceVerifyBlockedInRun = true;
              log("⛔ \u68c0\u6d4b\u5230\u5e73\u53f0\u5df2\u9501\u5b9a\uff1a\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5\uff08\u672c\u6b21\u53ca\u4eca\u65e5\u5c06\u8df3\u8fc7\u540e\u7eed\u6838\u9a8c\uff09");
              showPanelNotice("\u5e73\u53f0\u63d0\u793a\uff1a\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5\uff08\u5df2\u81ea\u52a8\u505c\u6b62\u7ee7\u7eed\u5c1d\u8bd5\uff09", "error", false, 9000);
            }

            return gmRes.status >= 200 && gmRes.status < 300 && String(gmRes.text).trim() === "true";
        }
    } catch (e) {

        return false;
    }
}

  async function performFaceRecognitionIdPhotoAttempts(courseId, resourceId, resType, maxAttempts) {
    const n = Math.max(1, Math.min(Number(maxAttempts) || 3, 5));
    for (let i = 1; i <= n; i++) {
      if (isFaceVerifyLockedToday() || state.faceVerifyBlockedInRun) {
        setFaceCacheStatus("\u4eca\u65e5\u9501\u5b9a");
        return false;
      }
      try {
        const pack = await prepareFaceUploadFromIdPhoto();

        if (await submitFaceVerification(pack.cdnUrl, pack.md5, courseId, resourceId, resType)) {

          const snap = readFaceCache();
          const pinned =
            snap &&
            snap.livePreferredCdnUrl &&
            snap.livePreferredMd5 &&
            isLivePreferredFaceCacheSource(snap.livePreferredSource);
          setFaceCacheStatus(pinned ? "\u5df2\u5c31\u7eea(\u4eba\u8138·\u8bc1\u4ef6\u7167·\u6d3b\u4f53OBS\u5df2\u4fdd\u7559)" : "\u5df2\u5c31\u7eea(\u4eba\u8138·\u8bc1\u4ef6\u7167)");
          updateStatus("\u8fd0\u884c\u4e2d");
          return true;
        }
      } catch (_) {}
    }
    log(`❌ \u4eba\u8138\u6838\u9a8c\u63d0\u4ea4\u5931\u8d25\uff08\u8bc1\u4ef6\u7167 ${n} \u6b21\u5747\u5931\u8d25\uff09`);
    state.faceVerifyBlockedInRun = true;
    setFaceCacheStatus("\u63d0\u4ea4\u5931\u8d25");
    return false;
  }

async function performFaceRecognition(courseId, resourceId, resType, options = {}) {
    const force = !!(options && options.force);
    const reason = (options && options.reason) ? String(options.reason) : "";

    try {
        if (isFaceVerifyLockedToday()) {
          state.faceVerifyBlockedInRun = true;
          setFaceCacheStatus("\u4eca\u65e5\u9501\u5b9a");
          log("⛔ \u4eca\u65e5\u5df2\u88ab\u5e73\u53f0\u9501\u5b9a\uff1a\u4e09\u6b21\u4eba\u8138\u6838\u9a8c\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5\uff08\u8df3\u8fc7\u6838\u9a8c\uff09");
          showPanelNotice("\u4eca\u65e5\u4eba\u8138\u6838\u9a8c\u5df2\u88ab\u5e73\u53f0\u9501\u5b9a\uff1a\u4e09\u6b21\u5931\u8d25\uff0c\u8bf7\u660e\u65e5\u518d\u8bd5", "error", false, 9000);
          return false;
        }
        updateStatus("\u51c6\u5907\u4eba\u8138\u63d0\u4ea4\u56fe\u7247...");

        if (state.faceForceIdPhotoFrsForRun) {

          return await performFaceRecognitionIdPhotoAttempts(courseId, resourceId, resType, 3);
        }

        let liveOk = false;
        try {
          let live = readLivePreferredFaceCacheForRun();
          if (!live) {
            live = await prepareFaceUploadLivePreferred();
          }
          liveOk = await submitFaceVerification(live.cdnUrl, live.md5, courseId, resourceId, resType);
          if (!liveOk && live) {
            log("⚠️ \u6d3b\u4f53\u4f18\u5148 OBS \u5df2\u8bf7\u6c42\u4eba\u8138\u63a5\u53e3\uff0c\u5e73\u53f0\u8fd4\u56de\u672a\u901a\u8fc7\uff08\u975e true\uff09\uff0c\u5c06\u5207\u6362\u8bc1\u4ef6\u7167\u5e76\u591a\u6b21\u5c1d\u8bd5", "warn");
          }
        } catch (e0) {

          liveOk = false;
        }
        if (liveOk) {

          setFaceCacheStatus("\u5df2\u5c31\u7eea(\u4eba\u8138=\u6d3b\u4f53/OBS\u7f13\u5b58)");
          updateStatus("\u8fd0\u884c\u4e2d");
          return true;
        }
        if (isFaceVerifyLockedToday() || state.faceVerifyBlockedInRun) {
          setFaceCacheStatus("\u4eca\u65e5\u9501\u5b9a");
          return false;
        }

        state.faceForceIdPhotoFrsForRun = true;

        return await performFaceRecognitionIdPhotoAttempts(courseId, resourceId, resType, 3);
    } catch (e) {

        setFaceCacheStatus("\u5f02\u5e38");
        return false;
    } finally {

    }
}
  async function fetchCoursesFromAPI() {
    if (!state.bearerToken || !state.studentId) return [];
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/course-info/stu-my-course-list?Type=1&SkipCount=0&MaxResultCount=200";
    const result = await apiRequest(url, "GET");
    if (!result || !Array.isArray(result.items)) return [];

    const currentYear = new Date().getFullYear();
    const normalizeCourseTitle = (raw) => {
      const s = String(raw || "").trim();
      return s.replace(/\s*[\(\uff08]\s*\u63a5\u53e3\s*[\)\uff09]\s*$/i, "").trim();
    };
    state.apiCourses = result.items
      .filter((c) => String(c.studyYear || "") === String(currentYear))
      .map((c) => ({
        key: `api-course:${c.id}`,
        courseId: c.id,
        title: normalizeCourseTitle(c.courseName) || "\u672a\u547d\u540d\u8bfe\u7a0b",
        schedule: Number(c.schedule || 0),
      }));
    return state.apiCourses;
  }

  async function fetchCourseResources(courseId) {
    const url = `https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/course-module/stu-design-list/${courseId}`;
    let result = await apiRequest(url, "GET");
    if (!result) {

      const refreshed = await forceRefreshAuth();
      if (refreshed) result = await apiRequest(url, "GET");
    }
    if (!result) return null;
    if (!Array.isArray(result.list)) return [];

    const resources = [];
    for (const unit of result.list) {
      const unitTitle = unit && unit.title ? unit.title : "\u672a\u547d\u540d\u5355\u5143";
      const lessons = Array.isArray(unit.lessonList) ? unit.lessonList : [];
      for (const lesson of lessons) {
        const lessonTitle = lesson && lesson.title ? lesson.title : "\u672a\u547d\u540d\u7ae0\u8282";
        const cells = Array.isArray(lesson.cellList) ? lesson.cellList : [];
        for (const cell of cells) {
          const title = String(cell?.title || "\u672a\u77e5\u8d44\u6e90");
          const ext = String(cell?.extension || "").toLowerCase();
          const isClassroomCheck = /\u8bfe\u5802\u68c0\u6d4b|\u968f\u5802\u6d4b\u9a8c|\u7ae0\u8282\u6d4b\u9a8c|\u7ae0\u8282\u68c0\u6d4b|\u5c0f\u6d4b|\u6d4b\u9a8c/.test(title);
          const isTestLike = Number(cell?.resType) === 7;
          const isVideoLike =
            Number(cell?.resType) === 1 &&
            /^(mp4|m3u8|flv|avi|wmv|mov|mpg|mpeg|webm|mkv|mp3|wav|aac|m4a|ogg|rarx|zipx|csf)$/.test(ext);
          const isDocLike = Number(cell?.resType) === 2 || Number(cell?.resType) === 3;
          if (isVideoLike || isDocLike || isClassroomCheck || isTestLike) {
            resources.push({
              id: cell.id,
              courseId: courseId,
              title: title,
              relevantId: cell.relevantId || "",
              progress: Number(cell.studyCount || 0),
              resType: cell.resType,
              type: isVideoLike
                ? "\u89c6\u9891"
                : (isTestLike ? "\u968f\u5802\u6d4b\u9a8c" : (isClassroomCheck ? "\u8bfe\u5802\u68c0\u6d4b" : "\u6587\u6863")),
              unitTitle: unitTitle,
              lessonTitle: lessonTitle,
            });
          }
        }
      }
    }
    return resources;
  }

  async function loadTestRecord(courseId, cellId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/paper/load-test-record";
    return await apiRequest(url, "POST", { courseId: courseId, courseCellId: cellId }, false);
  }

  async function submitTestFinal(courseId, cellId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/test-answer/submit-test";
    await sleep(1200 + Math.floor(Math.random() * 1200));
    const res = await apiRequest(url, "POST", { courseId: courseId, cellId: cellId }, false);
    return !!res || res?.code === 1000;
  }

  async function refreshCourseModuleAfterTest(courseId, cellId) {
    try { await loadTestRecord(courseId, cellId); } catch (_) {}
    try { await initDocumentStudy(courseId, cellId, 7); } catch (_) {}
    try { await submitDocumentComplete(courseId, cellId); } catch (_) {}
  }

  async function processInClassTest(courseId, cellId, title) {
    if (!state.running) {
      setLastChapterDiag("\u8fd0\u884c\u5df2\u505c\u6b62\uff0c\u672a\u5f00\u59cb\u968f\u5802\u6d4b\u9a8c");
      return false;
    }

    try { await initDocumentStudy(courseId, cellId, 7); } catch (_) {}

    const details = await loadTestRecord(courseId, cellId);
    const ruleId = details?.ruleId || details?.RuleId || "";
    const paperId = details?.paperId || details?.PaperId || "";
    const paperJsonEnc = String(details?.paperJson || "");
    if (!paperJsonEnc || !ruleId || !paperId) {

      setLastChapterDiag("\u968f\u5802\u6d4b\u9a8c\u8be6\u60c5\u4e0d\u5b8c\u6574");
      return false;
    }

    let payloads = [];
    try {
      const prep = await _pp(paperJsonEnc, ruleId, { requireAnswers: false });
      payloads = Array.isArray(prep?.payloads) ? prep.payloads : [];

    } catch (e) {

      setLastChapterDiag("\u968f\u5802\u6d4b\u9a8c\u8bd5\u5377\u4e91\u7aef\u89e3\u6790\u5931\u8d25");
      return false;
    }
    if (!payloads.length) {
      setLastChapterDiag("\u968f\u5802\u6d4b\u9a8c\u65e0\u6709\u6548\u63d0\u4ea4\u9879");
      return false;
    }

    let alreadySubmitted = false;
    for (let i = 0; i < payloads.length && state.running; i++) {
      const encrypted = String(payloads[i]?.encrypted_data || "");
      const resp = await submitPaperAnswerEncrypted(encrypted);
      const ok = !!resp?.ok;
      const raw = String(resp?.text || "");
      if (!ok && (resp?.status === 403) && raw.includes("\u8bd5\u5377\u5df2\u7ecf\u63d0\u4ea4")) {
        alreadySubmitted = true;

        break;
      }
      await sleep(400 + Math.floor(Math.random() * 500));
    }

    if (!state.running) {
      setLastChapterDiag("\u8fd0\u884c\u5df2\u505c\u6b62\uff0c\u968f\u5802\u6d4b\u9a8c\u672a\u5b8c\u6210");
      return false;
    }
    if (!alreadySubmitted) {
      const okFinal = await submitTestFinal(courseId, cellId);
      if (!okFinal) {

        setLastChapterDiag("\u968f\u5802\u6d4b\u9a8c\u6700\u7ec8\u63d0\u4ea4\u672a\u901a\u8fc7");
        return false;
      }
    }

    await refreshCourseModuleAfterTest(courseId, cellId);

    markResourceDoneRealtime(cellId);
    await rateLimitSubmit();
    return true;
  }

  async function getPreviewResourceRaw(relevantId) {
    const url = `https://jxjynew.ahjxjy.cn/v1/file-service/api/preview/${relevantId}/preview-resource`;
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Origin: "https://jxjynew.ahjxjy.cn",
      Referer: "https://jxjynew.ahjxjy.cn/app/jxjy-student-space-web",
    };
    if (state.bearerToken) headers.Authorization = `Bearer ${state.bearerToken}`;
    if (state.studentId) {
      headers.Student = state.studentId;
      headers["user-type"] = "4";
    }
    try {
      const text = await requestTextWithFallback(url, "POST", headers, JSON.stringify({}));
      return text ? JSON.parse(text) : null;
    } catch (e) {
      const msg = String((e && e.message) || "");
      if (msg.includes("HTTP 403")) return { __error403: true, __errorMessage: msg };
        log("⚠️ \u8bfe\u4ef6\u9884\u89c8\u8bf7\u6c42\u5931\u8d25\uff08\u8bf7\u7a0d\u540e\u6216\u68c0\u67e5\u7f51\u7edc\uff09", "info");
      return null;
    }
  }

  function normalizeUrl(raw) {
    if (!raw) return "";
    const s = String(raw).trim();
    if (s.startsWith("//")) return `https:${s}`;
    if (s.startsWith("/")) return `https://jxjynew.ahjxjy.cn${s}`;
    return s;
  }

  function normalizeVideoUrlForCache(videoUrl) {
    try {
      const u = new URL(videoUrl, location.origin);
      return `${u.origin}${u.pathname}`;
    } catch (_) {
      return String(videoUrl || "");
    }
  }

  function loadDurationCache() {
    try {
      const data = JSON.parse(localStorage.getItem(VIDEO_DURATION_CACHE_KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch (_) {
      return {};
    }
  }

  function saveDurationCache(cache) {
    localStorage.setItem(VIDEO_DURATION_CACHE_KEY, JSON.stringify(cache || {}));
  }

  function previewEntryHttpUrl(entry) {
    if (!entry || typeof entry !== "object") return "";
    const v =
      entry.Value != null
        ? entry.Value
        : entry.value != null
          ? entry.value
          : entry.Url != null
            ? entry.Url
            : entry.url != null
              ? entry.url
              : "";
    if (typeof v !== "string") return "";
    const s = v.trim();
    return /^https?:\/\//i.test(s) ? s : "";
  }

  function parsePreviewVideoUrl(previewData) {
    if (!previewData || typeof previewData !== "object") return "";
    const root =
      previewData.data && typeof previewData.data === "object" && !Array.isArray(previewData.data)
        ? previewData.data
        : previewData;
    try {
      if (root.previewUrl) {
        const rawPreview = root.previewUrl;
        if (typeof rawPreview === "string" && /^https?:\/\//i.test(rawPreview.trim())) {
          const s = rawPreview.trim();
          try {
            const u = new URL(s);
            const pathOnly = u.pathname || "";
            const low = pathOnly.toLowerCase();
            const packExts = [".rarx", ".zipx", ".csf"];
            if (packExts.some((ext) => low.endsWith(ext))) {
              const base = pathOnly.replace(/\/+$/, "");
              u.pathname = `${base}/teacher.mp4`;
              return normalizeUrl(u.toString());
            }
          } catch (_) {}
          return normalizeUrl(s);
        }
        let list = null;
        try {
          list = typeof rawPreview === "string" ? JSON.parse(rawPreview) : rawPreview;
        } catch (_) {
          list = null;
        }
        if (list && typeof list === "object" && !Array.isArray(list)) {
          const preferKeys = ["HD", "hd", "SD", "sd", "KA", "ka", "FHD", "1080", "720", "480", "LD"];
          for (const k of preferKeys) {
            if (list[k] != null && typeof list[k] === "string" && /^https?:\/\//i.test(String(list[k]).trim())) {
              return normalizeUrl(String(list[k]).trim());
            }
          }
          for (const v of Object.values(list)) {
            if (typeof v === "string" && /^https?:\/\//i.test(v.trim())) return normalizeUrl(v.trim());
          }
        }
        if (Array.isArray(list) && list.length) {
          const nm = (x) => String((x && (x.Name != null ? x.Name : x.name)) || "");
          const byExactHd = list.find((x) => x && /^HD$/i.test(nm(x)) && previewEntryHttpUrl(x));
          if (byExactHd) return normalizeUrl(previewEntryHttpUrl(byExactHd));
          const byExactSd = list.find((x) => x && /^SD$/i.test(nm(x)) && previewEntryHttpUrl(x));
          if (byExactSd) return normalizeUrl(previewEntryHttpUrl(byExactSd));
          const byKa = list.find((x) => x && /^KA$/i.test(nm(x)) && previewEntryHttpUrl(x));
          if (byKa) return normalizeUrl(previewEntryHttpUrl(byKa));
          const score = (x) => {
            const n = nm(x);
            if (/1080|HD|\u8d85\u6e05|\u539f\u753b/i.test(n)) return 40;
            if (/720|\u9ad8\u6e05/i.test(n)) return 30;
            if (/480|SD|\u6807\u6e05|\u6d41\u7545|\u6807\u6e05\s*-?\s*AVC/i.test(n)) return 20;
            if (/^KA$/i.test(n)) return 15;
            if (/360|LD|\u6d41\u7545/i.test(n)) return 10;
            return previewEntryHttpUrl(x) ? 1 : 0;
          };
          const sorted = [...list].sort((a, b) => score(b) - score(a));
          for (const item of sorted) {
            const u = previewEntryHttpUrl(item);
            if (u) return normalizeUrl(u);
          }
        }
      }
    } catch (_) {}
    const fb =
      root.videoUrl ||
      root.url ||
      root.playUrl ||
      root.resourceUrl ||
      root.streamUrl ||
      root.playAddress ||
      previewData.videoUrl ||
      previewData.url ||
      previewData.playUrl ||
      "";
    return normalizeUrl(fb);
  }

  async function getVideoDurationByHead(videoUrl) {
    if (!videoUrl) return 0;
    const cacheKey = normalizeVideoUrlForCache(videoUrl);
    const durationCache = loadDurationCache();
    const cached = Number(durationCache[cacheKey] || 0);
    if (cached > 0) {
        return cached;
    }

    try {
        const duration = await getVideoDurationByMetadata(videoUrl);
        if (duration > 0) {
            durationCache[cacheKey] = duration;
            saveDurationCache(durationCache);

            return duration;
        }
    } catch (_) {}

    return 3600;
  }

  function getVideoDurationByMetadata(videoUrl) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";

        let finished = false;
        const timer = setTimeout(() => {
            if (!finished) {
                finished = true;
                video.removeAttribute("src");
                video.load();
                if (video.parentNode) video.parentNode.removeChild(video);
                resolve(0);
            }
        }, 10000);

        video.onloadedmetadata = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            const duration = video.duration;
            if (isFinite(duration) && duration > 0) {
                resolve(Math.floor(duration));
            } else {
                resolve(0);
            }
            if (video.parentNode) video.parentNode.removeChild(video);
        };

        video.onerror = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            resolve(0);
            if (video.parentNode) video.parentNode.removeChild(video);
        };

        document.body.appendChild(video);
        video.src = videoUrl;
    });
  }

  async function getInitialProgress(courseId, cellId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/studying-lenard";
    return apiRequest(url, "POST", { courseId: courseId, cellId: cellId });
  }

  async function getVideoRecord(courseId, cellId) {
    const url = `https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/video-record?cellId=${encodeURIComponent(cellId)}&courseId=${encodeURIComponent(courseId)}`;
    const headers = {
      Authorization: `Bearer ${state.bearerToken}`,
      Student: state.studentId,
      "user-type": "4",
    };
    try {
      const text = await fetchRequestText(url, "GET", headers, null);
      if (!text) return null;
      try {
        const decrypted = await _ad(text, "video_payload");
        if (decrypted) return JSON.parse(decrypted);
      } catch (_) {}
      return { raw: text };
    } catch (e) {
      return null;
    }
  }

  async function submitVideoProgressAt(courseId, cellId, position, faceResourceId) {
    const enc = await _bp("video", { cellId, courseId, position: Number(position || 1) });
    if (!enc) return { code: "encrypt_failed", isStudy: false };
    return submitVideoProgressEncrypted(enc, courseId, cellId, position, 0, faceResourceId);
  }

  async function getGraphicCodeImage() {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/code-image";
    try {
      const headers = {
        Authorization: `Bearer ${state.bearerToken}`,
        Student: state.studentId,
        "user-type": "4",
      };
      return await gmRequestJson(url, "GET", headers, null);
    } catch (e) {
      return null;
    }
  }

  async function verifyGraphicCodeImage(codeImgId, code, courseId, cellId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/verify-code-image";
    try {
      const headers = {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.bearerToken}`,
        Student: state.studentId,
        "user-type": "4",
      };
      const payload = {
        id: String(codeImgId || ""),
        code: String(code || ""),
        courseId: String(courseId || ""),
        cellId: String(cellId || ""),
      };
      const encryptedData = await _ae(JSON.stringify(payload), "video_payload");
      if (!encryptedData) return null;
      return await gmRequestJson(url, "POST", headers, JSON.stringify({ data: encryptedData }));
    } catch (e) {
      return null;
    }
  }

  function extractPureBase64FromImageCode(imageCode) {
    const s = String(imageCode || "").trim();
    if (!s) return "";
    if (s.startsWith("data:image/")) {
      const idx = s.indexOf("base64,");
      return idx >= 0 ? s.slice(idx + "base64,".length).trim() : "";
    }
    return s.replace(/^data:.*?base64,/i, "").trim();
  }

  function jxjyAsBool(v, defaultVal) {
    if (v === true || v === 1 || v === "1") return true;
    if (v === false || v === 0 || v === "0") return false;
    return !!defaultVal;
  }

  function jxjyCloudAbsUrl(relPath) {
    const base = String(state.cloudApiBase || DEFAULT_CLOUD_API_BASE || "").trim().replace(/\/+$/, "");
    const p = String(relPath || "").trim();
    if (!base || !p) return "";
    return `${base}${p.startsWith("/") ? p : `/${p}`}`;
  }

  function jxjyServiceOrigin() {
    try {
      const base = String(state.cloudApiBase || DEFAULT_CLOUD_API_BASE || "").trim().replace(/\/+$/, "");
      if (!base) return "";
      return new URL(base).origin;
    } catch (_) {
      return "";
    }
  }

  function applyJxjyClientConfig(j) {
    if (!j || typeof j !== "object") return;
    try {
      if (j.panelNoticePath != null) {
        const p = String(j.panelNoticePath).trim();
        if (p) state.panelNoticePath = p.startsWith("/") ? p : `/${p}`;
      }
      const cap = j.captcha && typeof j.captcha === "object" ? j.captcha : {};
      state.captchaSelfApiEnable = jxjyAsBool(cap.selfEnabled, true);
      state.captchaSelfApiUrl = String(cap.selfUrl || "").trim();
      state.captchaSelfApiToken = "";
      state.captchaJfbymEnabled = jxjyAsBool(cap.jfbymEnabled, true);
      state.captchaJfbymViaProxy = jxjyAsBool(cap.jfbymViaProxy, true);
      state.captchaJfbymToken = "";
      state.captchaJfbymType = String(cap.jfbymType || "10110").trim() || "10110";
      state.clientConfigUpdatedAt = Date.now();

      const st = document.querySelector("#jxjy-client-config-status");
      if (st) st.textContent = `\u670d\u52a1\u7aef\u914d\u7f6e\u5df2\u540c\u6b65 ${new Date().toLocaleString()}`;
    } catch (e) {
      log(`⚠️ \u89e3\u6790\u670d\u52a1\u7aef\u5ba2\u6237\u914d\u7f6e\u5931\u8d25: ${e}`);
    }
  }

  async function fetchJxjyPanelNotice() {
    const path = String(state.panelNoticePath || _w(10)).trim() || _w(10);
    const origin = jxjyServiceOrigin();
    if (!origin) return;
    const url = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    try {
      const res = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 15000,
          onload: (r) => resolve(r),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error("timeout")),
        });
      });
      const st = Number(res?.status || 0);
      const text = String(res?.responseText || "").trim();
      if (st < 200 || st >= 300) {

        return;
      }
      state.remotePanelNotice = text || JXJY_PANEL_NOTICE_FALLBACK;
      const el = document.querySelector("#jxjy-ann-text");
      if (el) el.textContent = state.remotePanelNotice;
    } catch (_) {}
  }

  async function fetchJxjyClientConfig() {
    const url = jxjyCloudAbsUrl(JXJY_CLIENT_CONFIG_PATH);
    if (!url) return;
    try {
      const res = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 20000,
          onload: (r) => resolve(r),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error("timeout")),
        });
      });
      const st = Number(res?.status || 0);
      const text = String(res?.responseText || "");
      if (st < 200 || st >= 300) {

        const stEl = document.querySelector("#jxjy-client-config-status");
        if (stEl) stEl.textContent = `\u62c9\u53d6\u5931\u8d25 HTTP ${st}\uff0c\u6cbf\u7528\u4e0a\u6b21\u6216\u9ed8\u8ba4`;
        return;
      }
      const j = JSON.parse(text);
      applyJxjyClientConfig(j);
    } catch (e) {

      const stEl = document.querySelector("#jxjy-client-config-status");
      if (stEl) stEl.textContent = "\u62c9\u53d6\u5f02\u5e38\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u6216\u670d\u52a1\u7aef \u6388\u6743\u63a5\u53e3";
      const ann = document.querySelector("#jxjy-ann-text");
      if (ann && !state.clientConfigUpdatedAt) ann.textContent = JXJY_PANEL_NOTICE_FALLBACK;
    } finally {
      try {
        await fetchJxjyPanelNotice();
      } catch (_) {}
    }
  }

  function cleanCaptchaFourChars(s) {
    const t = String(s || "").replace(/[^0-9A-Za-z]/g, "").trim();
    return t.length === 4 ? t : "";
  }

  function buildSelfCaptchaPredictUrl(baseUrl) {
    const u = String(baseUrl || "").trim().replace(/\/+$/, "");
    if (!u) return "";
    if (/\/predict$/i.test(u)) return u;
    return `${u}/predict`;
  }

  function buildJxjySelfPredictUrl(root) {
    const u = String(root || "").trim().replace(/\/+$/, "");
    if (!u) return "";
    try {
      const o = jxjyServiceOrigin();
      if (o && u === o) return `${o}${_w(7)}`;
    } catch (_) {}
    return buildSelfCaptchaPredictUrl(u);
  }

  async function buildCaptchaCloudPayload(base64Image) {
    await _el(false);
    return JSON.stringify({
      lease: String(state.cloudLease || ""),
      image_base64: String(base64Image || "").trim(),
    });
  }

  async function solveCaptchaViaSelfApi(base64Image, opts = {}) {
    const configured = String(opts.baseUrl || state.captchaSelfApiUrl || "").trim();
    const root = configured || jxjyServiceOrigin();
    const token = String(opts.token || state.captchaSelfApiToken || "").trim();
    const img = String(base64Image || "").trim();
    if (!root || !img) return { ok: false, text: "", raw: null, reason: "missing_params" };
    const url = buildJxjySelfPredictUrl(root);
    const isCloudProxy = /\/api\/ahjxjy\/captcha\/self-predict/i.test(url);
    const payload = isCloudProxy
      ? await buildCaptchaCloudPayload(img)
      : JSON.stringify({ image_base64: img });
    const headers = { "Content-Type": "application/json" };
    if (token) headers["X-Token"] = token;
    try {
      const res = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          url,
          headers,
          data: payload,
          timeout: 90000,
          onload: (r) => resolve(r),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error("self_ocr timeout")),
        });
      });
      const status = Number(res?.status || 0);
      const textBody = String(res?.responseText || "");
      let obj = null;
      try {
        obj = JSON.parse(textBody);
      } catch (_) {
        obj = null;
      }
      if (status === 401) {
        log(
          isCloudProxy
            ? "⚠️ \u81ea\u5efaOCR\u8fd4\u56de401\uff1a\u9a8c\u8bc1\u7801\u4ee3\u7406\u9700\u8981\u6709\u6548 lease\uff0c\u8bf7\u5148\u5b8c\u6210\u6388\u6743/\u62c9\u53d6 lease"
            : "⚠️ \u81ea\u5efaOCR\u8fd4\u56de401\uff1a\u76f4\u8fde\u81ea\u5efa\u670d\u65f6\u8bf7\u5e26 X-Token",
        );
        return { ok: false, text: "", raw: obj, reason: isCloudProxy ? "invalid_lease" : "unauthorized" };
      }
      if (status < 200 || status >= 300) {
        if (status === 502 || status === 500) {
          const hint = obj && (obj.hint || obj.detail) ? String(obj.hint || obj.detail) : "";
          const path = obj && obj.path ? String(obj.path) : "";
          const head = obj && obj.body_head ? String(obj.body_head).slice(0, 160) : "";

        }
        return { ok: false, text: "", raw: obj, reason: `http_${status}` };
      }
      const rawTxt = obj && obj.text != null ? String(obj.text) : "";
      const cleaned = cleanCaptchaFourChars(rawTxt);
      if (cleaned) {
        return { ok: true, text: cleaned, raw: obj, reason: "ok" };
      }
      return { ok: false, text: "", raw: obj, reason: "empty_or_not_4chars" };
    } catch (e) {
      return { ok: false, text: "", raw: null, reason: String((e && e.message) || e || "error") };
    }
  }

  async function solveCaptchaViaJfbymProxy(base64Image) {
    const o = jxjyServiceOrigin();
    const img = String(base64Image || "").trim();
    if (!o || !img) return { ok: false, text: "", raw: null, reason: "missing_params" };
    const url = `${o}${_w(14)}`;
    const payload = await buildCaptchaCloudPayload(img);
    try {
      const res = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          url,
          headers: { "Content-Type": "application/json" },
          data: payload,
          timeout: 90000,
          onload: (r) => resolve(r),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error("jfbym_proxy timeout")),
        });
      });
      const status = Number(res?.status || 0);
      const textBody = String(res?.responseText || "");
      let obj = null;
      try {
        obj = JSON.parse(textBody);
      } catch (_) {
        obj = null;
      }
      if (status === 401) {

        return { ok: false, text: "", raw: obj, reason: "invalid_lease" };
      }
      if (status < 200 || status >= 300) {
        return { ok: false, text: "", raw: obj, reason: `http_${status}` };
      }
      if (obj && obj.ok === true && obj.text != null) {
        const cleaned = cleanCaptchaFourChars(String(obj.text));
        if (cleaned) return { ok: true, text: cleaned, raw: obj, reason: "ok" };
      }
      return {
        ok: false,
        text: "",
        raw: obj,
        reason: String((obj && obj.reason) || "jfbym_proxy_fail"),
      };
    } catch (e) {
      return { ok: false, text: "", raw: null, reason: String((e && e.message) || e || "error") };
    }
  }

  async function solveCaptchaViaJfbym(base64Image, opts = {}) {
    const token = String((opts.token || state.captchaJfbymToken || "")).trim();
    const type = String((opts.type || state.captchaJfbymType || "10110")).trim();
    const img = String(base64Image || "").trim();
    if (!token || !type || !img) return { ok: false, text: "", raw: null, reason: "missing_params" };
    const url = "http://api.jfbym.com/api/YmServer/customApi";
    const payload = JSON.stringify({ token, type, image: img });
    try {
      const res = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          url,
          headers: { "Content-Type": "application/json" },
          data: payload,
          timeout: 30000,
          onload: (r) => resolve(r),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error("jfbym timeout")),
        });
      });
      const text = String(res?.responseText || "");
      let obj = null;
      try {
        obj = JSON.parse(text);
      } catch (_) {
        obj = null;
      }
      const outerCode = obj && obj.code != null ? String(obj.code) : "";
      const outerMsg = obj && obj.msg != null ? String(obj.msg) : "";
      let candidate = "";
      const inner = obj ? obj.data : null;
      if (typeof inner === "string") candidate = inner;
      else if (Array.isArray(inner) && inner.length) {
        const first = inner[0];
        if (first && typeof first === "object") candidate = String(first.data || first.code || "");
      } else if (inner && typeof inner === "object") {
        candidate = String(inner.data || inner.code || inner.result || "");
      }
      const cleaned = String(candidate || "").replace(/[^0-9A-Za-z]/g, "").trim();
      if (cleaned) {

        return { ok: true, text: cleaned, raw: obj, reason: "ok" };
      }
      return { ok: false, text: "", raw: obj, reason: `empty_result(code=${outerCode},msg=${outerMsg})` };
    } catch (e) {
      return { ok: false, text: "", raw: null, reason: String((e && e.message) || e || "error") };
    }
  }

  function parseGraphicCodeImageResp(resp) {
    if (!resp || typeof resp !== "object") return null;
    const id = resp.id || resp.codeImgID || resp.codeImgId || resp.code_img_id;
    const imageCode = resp.imageCode || resp.image_code || resp.image || "";
    if (!id || !imageCode) return null;
    const s = String(imageCode || "");
    return { id: String(id), imageCode: s };
  }

  function normalizeBase64ImageSrc(imageCode) {
    const s = String(imageCode || "").trim();
    if (!s) return "";
    if (s.startsWith("data:image/")) return s;
    return `data:image/png;base64,${s}`;
  }

  function escapeHtml(s) {
    const str = String(s == null ? "" : s);
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function promptGraphicCaptcha(imageSrc, opts = {}) {
    const title = String(opts.title || "\u9700\u8981\u56fe\u5f62\u9a8c\u8bc1\u7801");
    const hint = String(opts.hint || "\u8bf7\u8f93\u5165\u56fe\u7247\u4e2d\u76844\u4f4d\u9a8c\u8bc1\u7801\u540e\u7ee7\u7eed\u3002");
    return new Promise((resolve) => {
      try {
        const overlay = document.createElement("div");
        overlay.style.cssText =
          "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;";
        const card = document.createElement("div");
        card.style.cssText =
          "width:min(520px,100%);background:#0b1220;color:#e5e7eb;border:1px solid rgba(148,163,184,.22);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;";
        card.innerHTML = `
          <div style="padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.18);display:flex;align-items:center;justify-content:space-between;">
            <div style="font-weight:700;font-size:14px;">${escapeHtml(title)}</div>
            <button id="jxjy-cap-close" style="background:transparent;border:0;color:#94a3b8;font-size:18px;cursor:pointer;line-height:1;">×</button>
          </div>
          <div style="padding:16px;">
            <div style="color:#cbd5e1;font-size:13px;line-height:1.6;margin-bottom:12px;">${escapeHtml(hint)}</div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
              <div style="flex:0 0 auto;background:#0f172a;border:1px solid rgba(148,163,184,.18);border-radius:10px;padding:10px;">
                <img id="jxjy-cap-img" alt="captcha" src="${imageSrc}" style="display:block;max-width:220px;max-height:92px;object-fit:contain;" />
              </div>
              <div style="flex:1 1 200px;min-width:200px;">
                <input id="jxjy-cap-input" placeholder="\u9a8c\u8bc1\u7801\uff084\u4f4d\uff09" maxlength="8" autocomplete="off"
                  style="width:100%;box-sizing:border-box;background:#0f172a;border:1px solid rgba(148,163,184,.22);color:#e5e7eb;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;" />
                <div style="display:flex;gap:10px;margin-top:10px;justify-content:flex-end;">
                  <button id="jxjy-cap-cancel" style="padding:9px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.22);background:transparent;color:#cbd5e1;cursor:pointer;">\u53d6\u6d88</button>
                  <button id="jxjy-cap-ok" style="padding:9px 12px;border-radius:10px;border:0;background:linear-gradient(90deg,#22d3ee,#2563eb);color:#031018;font-weight:700;cursor:pointer;">\u786e\u8ba4</button>
                </div>
              </div>
            </div>
          </div>
        `;
        overlay.appendChild(card);
        const cleanup = () => {
          try {
            overlay.remove();
          } catch (_) {}
        };
        const done = (val) => {
          cleanup();
          resolve(val);
        };
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) done(null);
        });
        card.querySelector("#jxjy-cap-close")?.addEventListener("click", () => done(null));
        card.querySelector("#jxjy-cap-cancel")?.addEventListener("click", () => done(null));
        const input = card.querySelector("#jxjy-cap-input");
        const okBtn = card.querySelector("#jxjy-cap-ok");
        const submit = () => {
          const v = String(input?.value || "").trim();
          if (!v) return;
          done(v);
        };
        okBtn?.addEventListener("click", submit);
        input?.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") submit();
          if (ev.key === "Escape") done(null);
        });
        document.body.appendChild(overlay);
        setTimeout(() => input?.focus(), 50);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async function tryGraphicCaptchaAfterRollback(courseId, cellId, position, faceResourceId = null, opts = {}) {
    const macroCycles = Math.max(1, Number(opts.maxTries || 6));
    const manualPromptsPerMacro = Math.max(1, Number(opts.manualPromptsPerMacro || 8));
    const manualFailRealtimeFallback = Math.max(0, Number(opts.manualFailRealtimeFallback || 0));
    let manualFailures = 0;
    const cooldownMs = Math.max(1000, Number(opts.cooldownMs || 5000));
    const progressPos = Math.max(1, Number(position || 1));
    const finalPosition = Math.max(progressPos, Number(opts.finalPosition || progressPos));
    const retryPosition = Math.max(progressPos, Number(opts.retryPosition || progressPos));
    const maxSelf = Math.max(0, Number(CAPTCHA_SELF_MAX_ROUNDS));
    const maxCloud = Math.max(0, Number(CAPTCHA_JFBYM_MAX_ROUNDS));
    const submitAfterCaptcha = async (sceneTag = "\u9a8c\u8bc1\u7801") => {
      const res2 = await submitVideoProgressAt(courseId, cellId, retryPosition, faceResourceId, { maxRetries: 1 });
      const code2 = res2?.code;
      const isStudy2 = res2?.isStudy;

      if (String(code2 || "").toLowerCase() === "allow" && isStudy2 === true) return { ok: true, res: res2 };
      if (String(code2 || "").toLowerCase() === "refresh" && isStudy2 === false && finalPosition > retryPosition) {
        const res3 = await submitVideoProgressAt(courseId, cellId, finalPosition, faceResourceId, { maxRetries: 1 });
        const code3 = res3?.code;
        const isStudy3 = res3?.isStudy;

        if (String(code3 || "").toLowerCase() === "allow" && isStudy3 === true) return { ok: true, res: res3 };
        return { ok: false, res: res3 };
      }
      return { ok: false, res: res2 };
    };
    const fetchCaptchaParsed = async () => {
      const imgResp = await getGraphicCodeImage();
      const p = parseGraphicCodeImageResp(imgResp);
      if (!p) return null;
      return { parsed: p, pure: extractPureBase64FromImageCode(p.imageCode) };
    };
    const refreshCaptchaWithRetry = async (ctx) => {
      for (let r = 0; r < 4 && state.running; r++) {
        const pair = await fetchCaptchaParsed();
        if (pair && pair.parsed && pair.pure) return pair;
        await sleep(400 + r * 200);
      }
      log(`⚠️ ${ctx}\uff1a\u62c9\u53d6\u65b0\u9a8c\u8bc1\u7801\u56fe\u5931\u8d25`, true);
      return null;
    };

    const selfEnabled = !!(state.captchaSelfApiEnable && String(state.captchaSelfApiUrl || "").trim());
    const jfbymCanRun = !!(
      state.captchaJfbymEnabled &&
      (state.captchaJfbymViaProxy !== false || String(state.captchaJfbymToken || "").trim())
    );

    for (let cycle = 1; cycle <= macroCycles && state.running; cycle++) {

      if (cycle === 1) {
        if (!state.captchaSelfApiEnable) {
          log("⚠️ \u8df3\u8fc7\u81ea\u5efaOCR\uff1aclient-config \u4e2d selfEnabled=false", true);
        } else if (!String(state.captchaSelfApiUrl || "").trim()) {

        }
      }

      const runVerifyAndResubmit = async (parsedRef, code4, sceneTag) => {
        const raw4 = String(code4 || "").replace(/[^0-9A-Za-z]/g, "").trim();
        if (raw4.length !== 4) return null;
        const codeSend = raw4.toUpperCase();
        log(`🤖 ${sceneTag}\u8bc6\u522b\u7ed3\u679c\uff1a${raw4}${codeSend !== raw4 ? "\uff08\u63d0\u4ea4\u5927\u5199\uff09" : ""}`, true);
        await verifyGraphicCodeImage(parsedRef.id, codeSend, courseId, cellId);
        const post = await submitAfterCaptcha(sceneTag);
        return post;
      };

      if (selfEnabled && maxSelf > 0) {
        for (let si = 1; si <= maxSelf && state.running; si++) {
          const pair = await refreshCaptchaWithRetry(`\u81ea\u5efa ${si}/${maxSelf}`);
          if (!pair) {
            await sleep(cooldownMs);
            continue;
          }
          const { parsed, pure } = pair;
          log(`🏠 \u81ea\u5efaOCR \u7b2c${si}/${maxSelf}\u8f6e\uff08\u5df2\u6362\u65b0\u56fe\uff09`, true);
          const selfRes = await solveCaptchaViaSelfApi(pure, {});
          const st = cleanCaptchaFourChars(selfRes?.text || "");
          if (!st) {
            continue;
          }
          const postSelf = await runVerifyAndResubmit(parsed, st, "\u81ea\u5efaOCR");
          if (postSelf && postSelf.ok) {
            log("✅ \u9a8c\u8bc1\u7801\u9a8c\u8bc1\u6210\u529f", "info");
            return postSelf;
          }

        }
      }

      if (jfbymCanRun && maxCloud > 0) {
        for (let ci = 1; ci <= maxCloud && state.running; ci++) {
          const pair = await refreshCaptchaWithRetry(`\u4e91\u7801 ${ci}/${maxCloud}`);
          if (!pair) {
            await sleep(cooldownMs);
            continue;
          }
          const { parsed, pure } = pair;
          log(`☁️ \u4e91\u7801 \u7b2c${ci}/${maxCloud}\u8f6e\uff08\u5df2\u6362\u65b0\u56fe\uff09`, true);
          const solved =
            state.captchaJfbymViaProxy !== false
              ? await solveCaptchaViaJfbymProxy(pure)
              : await solveCaptchaViaJfbym(pure, {});
          const t = String(solved?.text || "").trim();
          if (!t || t.length !== 4) {

            continue;
          }
          const post = await runVerifyAndResubmit(parsed, t, "\u4e91\u7801");
          if (post && post.ok) {
            log("✅ \u9a8c\u8bc1\u7801\u9a8c\u8bc1\u6210\u529f", "info");
            return post;
          }

        }
        log(`⚠️ \u4e91\u7801\u5df2\u8bd5\u6ee1 ${maxCloud} \u8f6e\u4ecd\u672a\u901a\u8fc7\uff0c\u8fdb\u5165\u624b\u52a8\u8f93\u5165`, true);
      }

      let parsedManual = null;
      for (let mi = 1; mi <= manualPromptsPerMacro && state.running; mi++) {
        const pairM = await refreshCaptchaWithRetry(`\u624b\u52a8 ${mi}/${manualPromptsPerMacro}`);
        if (pairM) {
          parsedManual = pairM.parsed;
        } else if (!parsedManual) {
          log("⚠️ \u65e0\u6cd5\u62c9\u56fe\u4f9b\u624b\u52a8\u9a8c\u8bc1\uff0c\u7ed3\u675f\u672c\u5b8f\u5468\u671f", true);
          break;
        }
        log(`✋ \u624b\u52a8\u8f93\u5165\u9a8c\u8bc1\u7801 ${mi}/${manualPromptsPerMacro}\uff08\u5df2\u6362\u65b0\u56fe\uff09`, true);
        const imageSrc = normalizeBase64ImageSrc(parsedManual.imageCode);
        const userCode = await promptGraphicCaptcha(imageSrc, {
          title: "\u672b\u5c3e\u9a8c\u8bc1\uff1a\u56fe\u5f62\u9a8c\u8bc1\u7801",
          hint: "\u5df2\u56de\u9000\u5230\u7ea690%\u4f4d\u7f6e\u3002\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801\u5b8c\u6210\u9a8c\u8bc1\u540e\u811a\u672c\u4f1a\u7ee7\u7eed\u63d0\u4ea4\u8fdb\u5ea6\u3002",
        });
        const cleaned = String(userCode || "").replace(/[^0-9A-Za-z]/g, "").trim();
        if (!cleaned) return { ok: false, reason: "cancelled", manual_failures: manualFailures };
        if (cleaned.length !== 4) {

          await sleep(Math.min(2000, cooldownMs));
          continue;
        }
        await verifyGraphicCodeImage(parsedManual.id, cleaned.toUpperCase(), courseId, cellId);
        const post = await submitAfterCaptcha("\u9a8c\u8bc1\u7801");
        if (post.ok) {
          log("✅ \u9a8c\u8bc1\u7801\u9a8c\u8bc1\u6210\u529f", "info");
          return post;
        }
        manualFailures += 1;
        if (manualFailRealtimeFallback > 0 && manualFailures >= manualFailRealtimeFallback) {
          return {
            ok: false,
            reason: "manual_limit",
            manual_failures: manualFailures,
            fallback_realtime: true,
          };
        }

        await sleep(Math.min(2000, cooldownMs));
      }

      await sleep(cooldownMs);
    }
    return { ok: false, reason: "max_tries", manual_failures: manualFailures };
  }

  async function processVideo(courseId, cellId, relevantId, title, _faceRetry = 0, refreshForceFinalize = false) {
    logVideoUserStart(title);
    return _ve(courseId, cellId, relevantId, title, refreshForceFinalize);
  }

  async function submitDocumentComplete(courseId, cellId) {
    const encryptedData = await _bp("document", { courseId, cellId });
    if (!encryptedData) return null;
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/study-lenard";
    return apiRequest(url, "POST", encryptedData, true);
  }

  async function initDocumentStudy(courseId, cellId, resType = 2) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/study/studying-lenard";
    return apiRequest(url, "POST", { courseId: courseId, cellId: cellId, resType: Number(resType) || 2 });
  }

  async function processDocument(courseId, cellId, title, resType = 2, resourceTypeLabel = "\u6587\u6863") {

    await initDocumentStudy(courseId, cellId, resType);
    const result = await submitDocumentComplete(courseId, cellId);
    const ok = !!(result && result.code === "allow" && result.isStudy === true);

    if (ok) {

        markResourceDoneRealtime(cellId);
        await rateLimitSubmit();
    } else {

        const c = result && result.code != null ? String(result.code) : "\u65e0";
        const learned =
          result && result.isStudy === true ? "\u662f" : result && result.isStudy === false ? "\u5426" : "\u672a\u77e5";
        setLastChapterDiag(`${resourceTypeLabel}\u672a\u6807\u8bb0\u5b66\u5b8c\uff08\u8fd4\u56de\u7801 ${c}\uff0c\u5b66\u5b8c ${learned}\uff09`);
    }
    return ok;
  }

  async function fetchAssignmentsByTerm(studyYear, studyTerm) {
    const params = new URLSearchParams({
      StudyYear: String(studyYear),
      StudyTerm: String(studyTerm),
      SkipCount: "0",
      MaxResultCount: "500",
    });
    const url = `https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/assignment-rule/stu-assignment-list?${params.toString()}`;
    const res = await apiRequest(url, "GET", null, false);
    return Array.isArray(res?.items) ? res.items : [];
  }

  async function fetchCourseAssignments(courseId) {
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() - 1];
    const terms = [1, 2];
    const merged = [];
    for (const y of years) {
      for (const t of terms) {
        const items = await fetchAssignmentsByTerm(y, t);
        for (const it of items) {
          if (String(it?.courseId || "") === String(courseId || "")) {
            merged.push(it);
          }
        }
      }
    }
    const dedup = new Map();
    merged.forEach((a) => {
      const id = String(a?.assignmentId || a?.Id || "");
      if (id) dedup.set(id, a);
    });
    return Array.from(dedup.values());
  }

  function summarizeAssignmentList(list) {
    const items = Array.isArray(list) ? list : [];
    const total = items.length;
    const pending = items.filter((a) => {
      const st = a?.state;
      const score = Number(a?.score || 0);
      return (st == null || st === 0) || ((st === 1 || st === 2) && score < 100);
    }).length;
    return { total, pending };
  }

  function formatHomeworkBadge(summary) {
    if (!summary || summary.total <= 0) return "\u65e0\u4f5c\u4e1a";
    if (summary.pending <= 0) return "\u4f5c\u4e1a\u5df2\u5b8c";
    return `\u4f5c\u4e1a:${summary.pending}`;
  }

  async function refreshCourseHomeworkBadges() {
    const courses = Array.isArray(state.apiCourses) ? state.apiCourses : [];
    if (!courses.length) return;
    const reqId = ++state.assignmentSummaryReqId;
    try {
      const now = new Date();
      const years = [now.getFullYear(), now.getFullYear() - 1];
      const terms = [1, 2];
      const dedup = new Map();
      for (const y of years) {
        for (const t of terms) {
          const items = await fetchAssignmentsByTerm(y, t);
          for (const it of items) {
            const aid = String(it?.assignmentId || it?.Id || "");
            if (!aid) continue;
            dedup.set(aid, it);
          }
        }
      }
      if (reqId !== state.assignmentSummaryReqId) return;
      const byCourseId = {};
      Array.from(dedup.values()).forEach((a) => {
        const cid = String(a?.courseId || "");
        if (!cid) return;
        if (!byCourseId[cid]) byCourseId[cid] = [];
        byCourseId[cid].push(a);
      });
      const summary = {};
      courses.forEach((c) => {
        const cid = String(c?.courseId || "");
        summary[cid] = summarizeAssignmentList(byCourseId[cid] || []);
      });
      state.assignmentSummaryByCourseId = summary;
      courses.forEach((c) => {
        const cid = String(c?.courseId || "");
        const el = document.querySelector(`[data-hw-badge="${cid}"]`);
        if (el) {
          const sum = summary[cid];
          el.textContent = formatHomeworkBadge(sum);
          const done = Number(sum?.total || 0) > 0 && Number(sum?.pending || 0) <= 0;
          el.classList.toggle("done", done);
          el.classList.toggle("todo", !done);
        }
      });
    } catch (_) {
    }
  }

  function summarizeExamList(list) {
    const items = Array.isArray(list) ? list : [];
    const total = items.length;
    const pending = items.filter((e) => {
      const st = Number(e?.state || 0);
      const sc = Number(e?.score || 0);
      return st === 0 || (st === 2 && sc < 99);
    }).length;
    return { total, pending };
  }

  function formatExamBadge(summary) {
    const total = Number(summary?.total || 0);
    if (total <= 0) return "\u65e0\u8003\u8bd5";
    const pending = Number(summary?.pending || 0);
    if (pending <= 0) return "\u8003\u8bd5\u5df2\u5b8c";
    return `\u8003\u8bd5:${pending}`;
  }

  async function refreshCourseExamBadges() {
    const courses = Array.isArray(state.apiCourses) ? state.apiCourses : [];
    if (!courses.length) return;
    const now = Date.now();
    const cacheOk = now - Number(state.examBadgeLastFetchAt || 0) < 60000 && state.examBadgeCacheByCourseId && Object.keys(state.examBadgeCacheByCourseId).length;
    const applyFromCache = () => {
      const cache = state.examBadgeCacheByCourseId || {};
      for (const c of courses) {
        const cid = String(c?.courseId || "");
        const span = document.querySelector(`[data-exam-badge="${cid}"]`);
        if (!span) continue;
        const list = cache[cid] || [];
        const summary = summarizeExamList(list);
        const done = Number(summary?.total || 0) > 0 && Number(summary?.pending || 0) <= 0;
        span.textContent = formatExamBadge(summary);
        span.classList.toggle("done", done);
        span.classList.toggle("todo", !done);
      }
    };
    if (cacheOk) {
      applyFromCache();
      return;
    }
    const reqId = ++state.examBadgeReqId;
    try {
      const year = new Date().getFullYear();
      const all = await fetchExamListByTerms(year, [1, 2]);
      if (reqId !== state.examBadgeReqId) return;
      const byCourseId = {};
      for (const it of Array.isArray(all) ? all : []) {
        const cid = String(it?.courseId || "");
        if (!cid) continue;
        if (!byCourseId[cid]) byCourseId[cid] = [];
        byCourseId[cid].push(it);
      }
      state.examBadgeCacheByCourseId = byCourseId;
      state.examBadgeLastFetchAt = Date.now();
      for (const c of courses) {
        const cid = String(c?.courseId || "");
        const span = document.querySelector(`[data-exam-badge="${cid}"]`);
        if (!span) continue;
        const list = byCourseId[cid] || [];
        const summary = summarizeExamList(list);
        const done = Number(summary?.total || 0) > 0 && Number(summary?.pending || 0) <= 0;
        span.textContent = formatExamBadge(summary);
        span.classList.toggle("done", done);
        span.classList.toggle("todo", !done);
      }
    } catch (_) {
    }
  }

  function resolveQuestionType(q) {
    const t = Number(q?.Type || 0);
    const n = String(q?.TypeName || "").toLowerCase();
    if (t === 1 || n.includes("\u5355\u9009")) return "single";
    if (t === 2 || n.includes("\u591a\u9009")) return "multiple";
    if (t === 3 || n.includes("\u5224\u65ad")) return "judge";
    if (t === 4 || n.includes("\u586b\u7a7a")) return "fill";
    if (t === 7 || n.includes("\u95ee\u7b54")) return "wenda";
    if (t === 5 || n.includes("\u7b80\u7b54") || n.includes("\u8bba\u8ff0")) return "essay";
    return "unknown";
  }

  function resolveAnswerId(q) {
    const keys = ["AnswerId", "answerId", "QuestionId", "questionId", "CourseQuestionId", "courseQuestionId"];
    for (const k of keys) {
      if (q && q[k]) return q[k];
    }
    if (q && q._parent_question_id) return q._parent_question_id;
    return q?.Id;
  }

  function parseRightAnswerIndices(rightAnswer, optionLen) {
    if (!rightAnswer) return [];
    const parts = String(rightAnswer).split(",").map((s) => s.trim()).filter(Boolean);
    return parts.filter((p) => /^\d+$/.test(p) && Number(p) >= 1 && Number(p) <= Math.max(10, optionLen || 0));
  }

  function buildQuestionLookupText(q) {
    const title = stripHtmlText(String(q?.Title || q?.title || ""));
    const content = stripHtmlText(String(q?.Content || q?.content || ""));
    const merged = title && content ? `${title}\n${content}` : (content || title);
    const lines = String(merged || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const uniq = [];
    const seen = new Set();
    for (const ln of lines) {
      const k = ln.replace(/\s+/g, " ");
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(ln);
    }
    return uniq.join("\n");
  }

  function buildLegacyExamQuestionText(q) {
    const title = String(q?.Title || q?.title || "");
    const content = String(q?.Content || q?.content || "");
    return (title && content) ? `${title}|${content}` : (content || title);
  }

  function buildQuestionLookupCandidates(q) {
    const rawTitle = String(q?.Title || q?.title || "");
    const rawContent = String(q?.Content || q?.content || "");
    const title = stripHtmlText(rawTitle).trim();
    const content = stripHtmlText(rawContent).trim();
    const arr = [];
    const push = (s) => {
      const v = String(s || "").trim();
      if (!v) return;
      arr.push(v);
      const compact = v.replace(/\s+/g, " ").trim();
      if (compact && compact !== v) arr.push(compact);
    };
    push(rawTitle && rawContent ? `${rawTitle}|${rawContent}` : (rawContent || rawTitle));
    push(buildQuestionLookupText(q));
    push(title && content ? `${title}|${content}` : "");
    push(title);
    push(content);
    const out = [];
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
    return out;
  }

  function stripHtmlText(raw) {
    const s = String(raw == null ? "" : raw);
    return s
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getOptionTextByIndex(q, idx1) {
    const idx = Number(idx1 || 0);
    const opts = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    if (!opts.length || !Number.isFinite(idx) || idx <= 0) return "";
    const bySort = opts.slice().sort((a, b) => Number(a?.Sort || 0) - Number(b?.Sort || 0));
    const pick = bySort[idx - 1] || opts[idx - 1] || null;
    const raw = pick?.Content ?? pick?.OptionContent ?? pick?.Title ?? pick?.Text ?? "";
    return stripHtmlText(raw);
  }

  function formatAnswerWithOptionText(q, qType, bankAnswerRaw) {
    const a0 = String(bankAnswerRaw == null ? "" : bankAnswerRaw).trim();
    if (!a0) return "";
    if (qType === "fill" || qType === "essay" || qType === "wenda") return a0;
    if (qType === "judge") {
      const n = Number(String(a0).split(",")[0]);
      return n === 2 ? "\u9519\u8bef" : "\u6b63\u786e";
    }
    const parts = a0.replace(/\uff0c/g, ",").split(",").map((x) => x.trim()).filter(Boolean);
    const items = parts.map((p) => {
      const n = Number(p);
      if (!Number.isFinite(n) || n <= 0) return "";
      const code = 64 + n;
      if (code < 65 || code > 90) return "";
      const letter = String.fromCharCode(code);
      const text = getOptionTextByIndex(q, n);
      return text ? `${letter}\uff1a${text}` : letter;
    }).filter(Boolean);
    if (!items.length) return "";
    if (qType === "multiple") return Array.from(new Set(items)).join("; ");
    return items[0];
  }

  function normalizeCloudAnswer(raw, qType, optionLen) {
    let s0 = String(raw == null ? "" : raw).trim();
    try {
      const j = JSON.parse(s0);
      if (j != null) s0 = String(j).trim();
    } catch (_) {}
    if (
      (s0.startsWith("\"") && s0.endsWith("\"")) ||
      (s0.startsWith("'") && s0.endsWith("'"))
    ) {
      s0 = s0.slice(1, -1).trim();
    }
    if (!s0) return "";
    const s = s0.replace(/\uff0c/g, ",").replace(/\u3001/g, ",").replace(/\s+/g, "");
    if (qType === "fill" || qType === "essay" || qType === "wenda") return s0;
    if (qType === "judge") {
      const up = s.toUpperCase();
      if (["1", "\u5bf9", "\u6b63\u786e", "TRUE", "T", "√"].includes(up)) return "1";
      if (["2", "\u9519", "\u9519\u8bef", "FALSE", "F", "×"].includes(up)) return "2";
      return "1";
    }
    if (qType === "single") {
      const m = s.match(/\d+/);
      if (m) {
        const n = Number(m[0]);
        if (n >= 1 && n <= Math.max(10, optionLen || 0)) return String(n);
      }
      const c = s.toUpperCase().charCodeAt(0);
      if (c >= 65 && c <= 90) {
        const idx = c - 64;
        if (idx >= 1 && idx <= Math.max(10, optionLen || 0)) return String(idx);
      }
      return "1";
    }
    if (qType === "multiple") {
      const set = new Set();
      s.split(",").forEach((tok) => {
        const t = String(tok || "").trim();
        if (!t) return;
        if (/^\d+$/.test(t)) {
          const n = Number(t);
          if (n >= 1 && n <= Math.max(10, optionLen || 0)) set.add(String(n));
          return;
        }
        const c = t.toUpperCase().charCodeAt(0);
        if (c >= 65 && c <= 90) {
          const idx = c - 64;
          if (idx >= 1 && idx <= Math.max(10, optionLen || 0)) set.add(String(idx));
        }
      });
      const arr = Array.from(set).sort((a, b) => Number(a) - Number(b));
      return arr.length ? arr.join(",") : "1,2";
    }
    return s0;
  }

  async function _qg(questionText) {
    const q = String(questionText || "").trim();
    if (!q) return null;
    try {
      await _el(false);
      const data = await _rq(_w(13), "POST", { question_text: q });
      if (data && data.found && data.answer != null) {
        return { answer: String(data.answer), questionHash: String(data.question_hash || "") };
      }
    } catch (_) {}
    return null;
  }

  async function _qu(questionText, questionType, answer, source = "tampermonkey_homework") {
    const q = String(questionText || "").trim();
    const a = String(answer == null ? "" : answer).trim();
    if (!q || !a) return false;
    try {
      await _el(false);
      await _rq(_w(11), "POST", {
        question_text: q,
        question_type: String(questionType || ""),
        answer: a,
        source: String(source || "tampermonkey_homework"),
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function _ai(prompt) {
    const p = String(prompt || "").trim();
    if (!p) return null;
    try {
      await _el(false);
      const data = await _rq(_w(12), "POST", { prompt: p });
      const txt = String(data?.answer || "").trim();
      if (!txt) {
        const dbg = data?.debug || data?.detail || data?.message || "";
        const slice = String(dbg || "").slice(0, 260);
        if (slice) throw new Error(`deepseek_empty_answer: ${slice}`);
      }
      return txt || null;
    } catch (e) {
      try {
        if (!state.examDebugAiErrLogged) {
          state.examDebugAiErrLogged = true;
          setExamDebug({ aiErr: `cloud_ai_error: ${String((e && e.message) || e).slice(0, 180)}` });
        }
      } catch (_) {}
      return null;
    }
  }

  function buildExamAiPrompt(q, qType) {
    const qText = buildQuestionLookupText(q) || stripHtmlText(String(q?.Title || ""));
    const opts = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    const optionText = opts.map((op, i) => {
      const c = stripHtmlText(String(op?.Content ?? op?.OptionContent ?? op?.Title ?? op?.Text ?? ""));
      return `${i + 1}. ${c}`;
    }).join("\n");
    const typeHint =
      qType === "single" ? "\u5355\u9009\u9898" :
      qType === "multiple" ? "\u591a\u9009\u9898" :
      qType === "judge" ? "\u5224\u65ad\u9898" :
      qType === "fill" ? "\u586b\u7a7a\u9898" :
      qType === "essay" ? "\u95ee\u7b54\u9898/\u7b80\u7b54\u9898" :
      "\u672a\u77e5\u9898\u578b";

    return `\u4f60\u662f\u8003\u8bd5\u7b54\u9898\u52a9\u624b\u3002\u8bf7\u6839\u636e\u9898\u76ee\u7ed9\u51fa\u6700\u53ef\u80fd\u7b54\u6848\uff0c\u53ea\u8fd4\u56deJSON\uff0c\u4e0d\u8981\u89e3\u91ca\u3002\n\u9898\u578b:${typeHint}\n\u9898\u76ee:\n${qText}\n\u9009\u9879:\n${optionText}\n\u8fd4\u56de\u683c\u5f0f:\n{"answer":"..."}\n\u89c4\u5219:\n- \u5355\u9009\u8fd4\u56de 1-\u9009\u9879\u6570 \u7684\u6570\u5b57\n- \u591a\u9009\u8fd4\u56de \u9017\u53f7\u5206\u9694\u6570\u5b57 \u4f8b\u5982 1,3\n- \u5224\u65ad\u8fd4\u56de 1(\u6b63\u786e) \u6216 2(\u9519\u8bef)\n- \u586b\u7a7a\u9898\u8fd4\u56de“\u586b\u5199\u5185\u5bb9”\u7684\u6587\u672c\uff08\u4e0d\u8981\u8fd4\u56de\u6570\u5b57\u5e8f\u53f7\uff09\n- \u95ee\u7b54\u9898/\u7b80\u7b54\u9898\u8fd4\u56de\u7b26\u5408\u8003\u8bd5\u7b54\u9898\u7684\u4f5c\u7b54\u6587\u672c\uff08\u4e0d\u8981\u8fd4\u56de\u6570\u5b57\u5e8f\u53f7\uff09\n- \u65e0\u6cd5\u786e\u5b9a\u4e5f\u5fc5\u987b\u7ed9\u51fa\u6700\u53ef\u80fd\u7b54\u6848\uff08\u4e3b\u89c2\u9898\u4e5f\u8981\u7ed9\u6587\u672c\uff09`;
  }

  function parseAiAnswerContent(text, qType, optionLen) {
    const raw = String(text || "").trim();
    if (!raw) return "";
    let ans = "";
    try {
      const j = JSON.parse(raw);
      if (j && j.answer != null) ans = String(j.answer).trim();
    } catch (_) {}
    if (!ans) {
      const m = raw.match(/"answer"\s*:\s*"([^"]+)"/i);
      if (m) ans = String(m[1] || "").trim();
    }
    if (!ans) {
      const m = raw.match(/"answer"\s*:\s*"([^"]*)/i);
      if (m && m[1] != null) ans = String(m[1]).trim();
    }
    ans = ans || "";
    if (ans && /^\{[\s\S]*"answer"\s*:/.test(ans)) {
      const m2 = ans.match(/"answer"\s*:\s*"([^"]*)/i);
      if (m2 && m2[1] != null) ans = String(m2[1]).trim();
    }
    if (!ans) ans = raw;
    const normalized = normalizeCloudAnswer(ans, qType, optionLen);

    if (String(qType || "") && ["essay", "wenda", "fill"].includes(String(qType))) {
      if (/^\d+$/.test(String(normalized || "").trim())) {
        return String(qType) === "essay" ? "\u672c\u9898\u8003\u67e5\u76f8\u5173\u77e5\u8bc6\u70b9\uff0c\u8bf7\u7ed3\u5408\u8bfe\u7a0b\u5185\u5bb9\u4f5c\u7b54\u3002" : "\u586b\u5199\u5185\u5bb9";
      }
    }

    return normalized;
  }

  async function deepseekAnswerExamQuestion(q, qType) {
    if (!state.deepseekEnabled) return null;
    try { await _el(false); } catch (_) {}
    const isPro = String(state.cloudTier || "").toLowerCase() === "pro";
    if (!isPro) {
      try {
        if (!state.examDebugAiNoProLogged) {
          state.examDebugAiNoProLogged = true;
          setExamDebug({ ai: `skip_no_pro(tier=${String(state.cloudTier || "")})` });
        }
      } catch (_) {}
      return null;
    }
    try {
      if (!state.examDebugAiTriedLogged) {
        state.examDebugAiTriedLogged = true;
        setExamDebug({ aiTried: "yes" });
      }
    } catch (_) {}
    const options = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    const prompt = buildExamAiPrompt(q, qType);
    const txt = await _ai(prompt);
    if (!txt) {
      try { setExamDebug({ aiStage: "cloud_ai_empty" }); } catch (_) {}
      return null;
    }
    const ans = parseAiAnswerContent(txt, qType, options.length);
    if (!ans) {
      try { setExamDebug({ aiStage: "parse_ai_failed" }); } catch (_) {}
      return null;
    }
    try { setExamDebug({ aiStage: "ai_ok" }); } catch (_) {}
    return ans;
  }

  async function syncAssignmentPaperToCloudBank(courseId, assignmentId) {
    const details = await loadAssignmentDetails(courseId, assignmentId, { waitIfPaperGenerating: false });
    if (!details?.paperJson) {
      log(`[\u4f5c\u4e1a] \u63d0\u4ea4\u540e\u540c\u6b65\u9898\u5e93\uff1a\u65e0 paperJson`, true);
      return 0;
    }
    let decrypted = "";
    try {
      decrypted = await _ad(String(details.paperJson || ""), "assignment_payload");
    } catch (e) {
      log(`[\u4f5c\u4e1a] \u63d0\u4ea4\u540e\u540c\u6b65\u9898\u5e93\uff1a\u89e3\u5bc6\u5931\u8d25 ${(e && e.message) || e}`, true);
      return 0;
    }
    if (!decrypted) return 0;
    let sections = [];
    try {
      sections = JSON.parse(decrypted);
    } catch (_) {
      sections = [];
    }
    const questions = extractQuestionsFromPaperSections(sections);
    const scoreVal = Number(details.score ?? details.Score ?? 0);
    const canInfer = Number.isFinite(scoreVal) && scoreVal >= 100;
    let cached = 0;
    for (const q of questions) {
      const qt = resolveExamQuestionType(q);
      let known = extractKnownAnswerFromQuestion(q, qt);
      if (!known && canInfer && ["single", "multiple", "judge"].includes(qt)) {
        const sa = String(q?.StudentAnswer ?? q?.studentAnswer ?? q?.student_answer ?? "").trim();
        if (sa) {
          const optionLen = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList.length : 0;
          known = normalizeCloudAnswer(sa, qt, optionLen);
        }
      }
      if (!known) continue;
      for (const text of buildQuestionLookupCandidates(q)) {
        let existed = null;
        try {
          existed = await _qg(text);
        } catch (_) {}
        if (existed?.answer) break;
        const ok = await _qu(text, qt, known, "homework_post_submit");
        if (ok) {
          cached += 1;
          break;
        }
      }
    }
    if (cached > 0) log(`📚 \u4f5c\u4e1a\u63d0\u4ea4\u540e\u5df2\u540c\u6b65 ${cached} \u9898\u5230\u4e91\u7aef\u9898\u5e93`, "info");
    else log(`[\u4f5c\u4e1a] \u63d0\u4ea4\u540e\u540c\u6b65\u9898\u5e93\uff1a\u672a\u53d1\u73b0\u53ef\u5199\u5165\u6807\u7b54\uff08\u5171 ${questions.length} \u9898\uff09`, true);
    return cached;
  }

  function extractKnownAnswerFromQuestion(q, qType) {
    const rightAnswer = q?.RightAnswer;
    const options = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    if (qType === "essay" || qType === "wenda" || qType === "fill") {
      return rightAnswer ? String(rightAnswer) : "";
    }
    if (!options.length) return rightAnswer ? String(rightAnswer) : "";

    let correct = [];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (Number(opt?.IsAnswer) === 1) correct.push(String(opt?.Sort || i + 1));
    }
    if (!correct.length) {
      correct = parseRightAnswerIndices(rightAnswer, options.length);
    }
    if (!correct.length) return "";

    if (qType === "multiple") {
      const uniq = Array.from(new Set(correct));
      return uniq.join(",");
    }
    if (qType === "judge") return String(correct[0]) === "2" ? "2" : "1";
    return correct[correct.length - 1] || "";
  }

  function assignmentDetailsCacheKey(courseId, assignmentId) {
    return `${String(courseId || "")}|${String(assignmentId || "")}`;
  }

  function cacheAssignmentDetails(courseId, assignmentId, details) {
    if (!details || !courseId || !assignmentId || details.error) return;
    state.assignmentDetailsCache[assignmentDetailsCacheKey(courseId, assignmentId)] = {
      details,
      ts: Date.now(),
    };
  }

  function popCachedAssignmentDetails(courseId, assignmentId, maxAgeMs) {
    const key = assignmentDetailsCacheKey(courseId, assignmentId);
    const entry = state.assignmentDetailsCache[key];
    if (!entry) return null;
    delete state.assignmentDetailsCache[key];
    const age = Date.now() - Number(entry.ts || 0);
    if (age > Number(maxAgeMs || ASSIGNMENT_DETAILS_CACHE_MAX_AGE_MS)) return null;
    return entry.details || null;
  }

  function invalidateAssignmentDetailsCache(courseId, assignmentId) {
    delete state.assignmentDetailsCache[assignmentDetailsCacheKey(courseId, assignmentId)];
  }

  async function loadAssignmentDetails(courseId, assignmentId, opts = {}) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/paper/load-assignment-record";
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Origin: "https://jxjynew.ahjxjy.cn",
      Referer: "https://jxjynew.ahjxjy.cn/app/jxjy-student-space-web",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139.0.0.0",
    };
    if (state.bearerToken) headers.Authorization = `Bearer ${state.bearerToken}`;
    if (state.studentId) {
      headers.Student = state.studentId;
      headers["user-type"] = "4";
    }
    const body = JSON.stringify({ courseId, assignmentId });
    const waitGen = opts.waitIfPaperGenerating === true;
    const attempts = waitGen ? ASSIGNMENT_PAPER_GENERATING_MAX_ATTEMPTS : 1;

    for (let tryIdx = 0; tryIdx < attempts; tryIdx++) {
      try {
        const res = await gmRequestWithStatus(url, "POST", headers, body);
        const text = String(res.text || "").trim();
        let data = null;
        if (text && text.startsWith("{")) {
          try {
            data = JSON.parse(text);
          } catch (_) {
            data = null;
          }
        }
        if (res.status >= 200 && res.status < 300 && data && !data.error) {
          cacheAssignmentDetails(courseId, assignmentId, data);
          return data;
        }
        const errText = text || "";
        const errMsg =
          (data && data.error && data.error.message) ||
          (data && data.message) ||
          `HTTP ${res.status}`;
        if (
          waitGen &&
          res.status === 403 &&
          tryIdx < attempts - 1 &&
          (/\u8bd5\u5377\u6b63\u5728\u751f\u6210|\u8bf7\u52ff\u91cd\u590d\u751f\u6210/.test(errText) || /\u8bd5\u5377\u6b63\u5728\u751f\u6210|\u8bf7\u52ff\u91cd\u590d\u751f\u6210/.test(String(errMsg)))
        ) {
          const delay = Math.min(
            10,
            ASSIGNMENT_PAPER_GENERATING_BASE_DELAY_S * Math.pow(1.35, tryIdx) + Math.random() * 0.7,
          );
          log(`⏳ \u8bd5\u5377\u751f\u6210\u4e2d\uff08403\uff09\uff0c\u7b49\u5f85 ${delay.toFixed(1)}s \u540e\u91cd\u8bd5\uff08${tryIdx + 1}/${attempts}\uff09`, "info");
          await sleep(Math.round(delay * 1000));
          continue;
        }
        return { error: { message: String(errMsg || "load-assignment-record failed") }, httpStatus: res.status };
      } catch (e) {
        if (tryIdx >= attempts - 1) {
          return { error: { message: String((e && e.message) || e || "network_error") } };
        }
        await sleep(1200);
      }
    }
    return { error: { message: "load-assignment-record \u5df2\u8fbe\u6700\u5927\u91cd\u8bd5\u6b21\u6570" } };
  }

  async function redoAssignment(courseId, assignmentId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/assignment-answer/redo-assignment";
    const res = await apiRequest(url, "POST", { courseId, assignmentId }, false);
    return !!res || res?.code === 1000;
  }

  async function redoAssignmentAndLoadDetails(courseId, assignmentId) {
    invalidateAssignmentDetailsCache(courseId, assignmentId);
    if (!(await redoAssignment(courseId, assignmentId))) {
      log("❌ \u4f5c\u4e1a\u91cd\u505a(redo-assignment)\u5931\u8d25", "warn");
      return null;
    }
    await sleep(ASSIGNMENT_REDO_POST_WAIT_MS + Math.round(Math.random() * 600));
    const details = await loadAssignmentDetails(courseId, assignmentId, { waitIfPaperGenerating: true });
    if (!details || details.error || !details.paperJson) {
      const em = details?.error?.message || "\u65e0 paperJson";
      log(`❌ \u91cd\u505a\u540e\u52a0\u8f7d\u4f5c\u4e1a\u8be6\u60c5\u5931\u8d25: ${em}`, "warn");
      return null;
    }
    log(`✅ \u91cd\u505a\u540e\u5df2\u52a0\u8f7d\u4f5c\u4e1a\u8be6\u60c5\uff08paperJson.len=${String(details.paperJson || "").length}\uff09`, "info");
    return details;
  }

  async function submitOnlineAssignment(courseId, assignmentId) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/assignment-answer/submit-online-assignment";
    const res = await apiRequest(url, "POST", { courseId, assignmentId }, false);
    return !!res;
  }

  function isHomeworkPaperAnswerTooFrequent403(resp) {
    if (!resp || Number(resp.status) !== 403) return false;
    const raw = String(resp.text || "");
    let blob = raw;
    try {
      const j = JSON.parse(raw);
      blob = `${j?.error?.message || ""} ${j?.message || ""} ${raw}`;
    } catch (_) {}
    return /\u64cd\u4f5c\u9891\u7e41|\u8bf7\u6c42\u8fc7\u4e8e\u9891\u7e41|\u8bbf\u95ee\u8fc7\u4e8e\u9891\u7e41|\u63d0\u4ea4\u9891\u7e41|\u9891\u7387|\u592a\u5feb|\u8bf7\u7a0d\u5019|\u7a0d\u540e\u518d\u8bd5/i.test(blob);
  }

  async function submitPaperAnswerEncrypted(encryptedData) {
    const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/paper/submit-paper-answer";
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.bearerToken}`,
      Student: state.studentId,
      "user-type": "4",
      Referer: "https://jxjynew.ahjxjy.cn/app/noFrame/jxjy-student-space-web",
      Origin: "https://jxjynew.ahjxjy.cn",
    };
    const body = JSON.stringify({ data: encryptedData });
    const pageXhrPost = () => new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        Object.entries(headers).forEach(([k, v]) => {
          try { xhr.setRequestHeader(k, String(v)); } catch (_) {}
        });
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: Number(xhr.status || 0),
            text: String(xhr.responseText || ""),
          });
        };
        xhr.onerror = function () { reject(new Error("xhr network error")); };
        xhr.send(body);
      } catch (e) {
        reject(e);
      }
    });
    try {
      const x = await pageXhrPost();
      if (x && x.status) return x;
    } catch (_) {}
    try {
      const gm = await gmRequestWithStatus(url, "POST", headers, body);
      if (gm.status >= 200 && gm.status < 300) return { ok: true, status: gm.status, text: gm.text || "" };
      const msg = String(gm.text || "");
      return { ok: false, status: gm.status, text: msg };
    } catch (_) {
      try {
        const txt = await fetchRequestText(url, "POST", headers, body);
        return { ok: true, status: 200, text: txt || "" };
      } catch (e2) {
        const msg = String(e2?.message || e2 || "");
        const m = msg.match(/HTTP\s+(\d+)/i);
        const status = m ? Number(m[1]) : 0;
        return { ok: false, status: status, text: msg };
      }
    }
  }

  function extractQuestionsFromPaperSections(sections) {
    const questions = [];
    const list = Array.isArray(sections) ? sections : [];
    for (const sec of list) {
      const secQs = Array.isArray(sec?.GetPaperList) ? sec.GetPaperList : [];
      for (const q of secQs) {
        if (!q || typeof q !== "object") continue;
        const sub = Array.isArray(q.CourseSubQuestionList) ? q.CourseSubQuestionList : [];
        if (sub.length) {
          const parentTitle = String(q?.Title || "");
          const parentContent = String(q?.Content || "");
          const parentId = q?.Id || q?.id;
          for (const s of sub) {
            if (!s || typeof s !== "object") continue;
            const subQ = Object.assign({}, s);
            subQ.Type = s.SubQuestionType || q.Type || sec.QuestionType;
            subQ.TypeName = "\u9605\u8bfb\u7406\u89e3-\u5b50\u9898";
            subQ._parent_question_id = parentId;
            const subTitle = String(s?.Title || parentTitle || "");
            const subContent = String(s?.Content || "");
            let mergedContent = parentContent;
            if (mergedContent && subContent) mergedContent = `${mergedContent}\n\n${subContent}`;
            else if (subContent) mergedContent = subContent;
            subQ.Title = subTitle;
            subQ.Content = mergedContent;
            questions.push(subQ);
          }
        } else {
          q.Type = q.Type || sec.QuestionType;
          q.TypeName = q.TypeName || sec.QuestionTypeName;
          questions.push(q);
        }
      }
    }
    return questions;
  }

  function hasRightAnswerInfo(q) {
    if (!q || typeof q !== "object") return false;
    if (q.RightAnswer != null && String(q.RightAnswer).trim() !== "") return true;
    const opts = Array.isArray(q.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    return opts.some((o) => Number(o?.IsAnswer) === 1);
  }

  async function processAssignment(courseId, assignment) {
    if (!state.running) return false;
    const assignmentId = assignment?.assignmentId || assignment?.Id;
    const title = assignment?.title || assignment?.Title || "\u672a\u77e5\u4f5c\u4e1a";
    if (!assignmentId) return false;
    setCurrentHomework(title);
    log(`📝 \u6b63\u5728\u5904\u7406\u4f5c\u4e1a: ${title}`);

    let details = popCachedAssignmentDetails(courseId, assignmentId);
    if (details) {
      log(`[\u4f5c\u4e1a] \u590d\u7528\u91cd\u505a\u540e\u5df2\u7f13\u5b58\u7684\u4f5c\u4e1a\u8be6\u60c5\uff0c\u8df3\u8fc7\u91cd\u590d\u62c9\u5377`, true);
    } else {
      details = await loadAssignmentDetails(courseId, assignmentId, { waitIfPaperGenerating: true });
    }
    let ruleId = details?.RuleId || details?.ruleId || "";
    if (details?.error?.message) {
      log(`❌ \u4f5c\u4e1a load-assignment-record: ${details.error.message}`);
      log(`[\u4f5c\u4e1a] \u5e73\u53f0\u8fd4\u56de error\uff0c\u65e0 paperJson`, true);
      return false;
    }
    if (!details) {
      log(`❌ \u4f5c\u4e1a\u8be6\u60c5\u8bf7\u6c42\u5931\u8d25\uff08\u65e0\u54cd\u5e94\uff09: ${title}`);
      setLastChapterDiag("\u4f5c\u4e1a\u8be6\u60c5\u65e0\u54cd\u5e94");
      return false;
    }
    if (!ruleId || !details?.paperJson) {
      log(`❌ \u4f5c\u4e1a\u8be6\u60c5\u4e0d\u5b8c\u6574\uff0c\u8df3\u8fc7: ${title}\uff08ruleId=${ruleId ? "\u6709" : "\u65e0"} paperJson.len=${String(details?.paperJson || "").length}\uff09`);
      setLastChapterDiag("\u4f5c\u4e1a\u8be6\u60c5\u4e0d\u5b8c\u6574");
      log(`[\u4f5c\u4e1a] ruleId=${ruleId ? "\u6709" : "\u65e0"} paperJson.len=${String(details?.paperJson || "").length}`, true);
      return false;
    }
    log(`[\u4f5c\u4e1a] \u5df2\u52a0\u8f7d\u8bd5\u5377 paperJson.len=${String(details.paperJson || "").length} ruleId=${ruleId}`, true);

    const needFace = details?.courseRule?.isNeedFaceVerification;
    if (needFace === true) {
      const faceOk = await performFaceRecognition(courseId, assignmentId, 2, {
        force: true,
        reason: "\u4f5c\u4e1a\u8981\u6c42\u4eba\u8138\u6838\u9a8c",
      });
      if (!faceOk) {
        log(`❌ \u4f5c\u4e1a\u4eba\u8138\u6838\u9a8c\u672a\u901a\u8fc7\uff0c\u8df3\u8fc7: ${title}`, "warn");
        return false;
      }
    }

    let paperJson = String(details?.paperJson || "");
    const paperEncLen = paperJson.length;
    if (paperEncLen > CLOUD_ASSIGNMENT_CIPHER_MAX_CHARS) {
      const mb = (paperEncLen / (1024 * 1024)).toFixed(2);
      const capMb = (CLOUD_ASSIGNMENT_CIPHER_MAX_CHARS / (1024 * 1024)).toFixed(1);
      log(`⚠️ \u4f5c\u4e1a\u8bd5\u5377\u8fc7\u5927\uff08\u7ea6${mb}MB\uff0c\u4e91\u7aef\u4e0a\u9650${capMb}MB\uff09\uff0c\u8df3\u8fc7: ${title}`, "warn");
      setLastChapterDiag(`\u4f5c\u4e1a\u8bd5\u5377\u8fc7\u5927(\u7ea6${mb}MB)`);
      return false;
    }

    const reloadMaxAttempts = 3;
    let paperPayloads = [];
    let lastPrepDiag = "";
    let usedPlatformAnswers = false;
    for (let attempt = 1; attempt <= reloadMaxAttempts; attempt++) {
      if (!state.running) {
        log(`⏹️ \u5df2\u505c\u6b62\uff0c\u7ec8\u6b62\u4f5c\u4e1a\u5904\u7406: ${title}`);
        return false;
      }
      try {
        const prep = await _pp(paperJson, ruleId, {
          requireAnswers: true,
          answerSource: "platform",
        });
        paperPayloads = Array.isArray(prep?.payloads) ? prep.payloads : [];
        const ready = prep?.ready === true || prep?.has_answer === true;
        lastPrepDiag = `payloads=${paperPayloads.length} ready=${ready} q=${Number(prep?.question_count || 0)} has_answer=${prep?.has_answer === true}`;
        log(`[\u4f5c\u4e1a] \u4e91\u7aef prepare \u7b2c${attempt}\u6b21: ${lastPrepDiag}`, true);
        if (paperPayloads.length && ready) {
          usedPlatformAnswers = true;
          log(`✅ \u4f5c\u4e1a\u5df2\u83b7\u53d6\u7b54\u6848\u4fe1\u606f: ${title}`);
          break;
        }
        if (
          (paperPayloads.length && !ready) ||
          (!paperPayloads.length && prep?.question_count > 0 && !ready)
        ) {
          paperPayloads = [];
        }
      } catch (e) {
        const em = String((e && e.message) || e);
        lastPrepDiag = `error=${em}`;
        if (/payload_too_large/i.test(em)) {
          log(`❌ \u4f5c\u4e1a\u8bd5\u5377\u8d85\u8fc7\u4e91\u7aef\u89e3\u6790\u4e0a\u9650\uff0c\u8df3\u8fc7: ${title}`);
          setLastChapterDiag("\u4f5c\u4e1a\u8bd5\u5377\u8d85\u8fc7\u4e91\u7aef\u4e0a\u9650");
          return false;
        }
        log(`❌ \u4f5c\u4e1a\u4e91\u7aef\u89e3\u6790\u5931\u8d25\uff08\u7b2c${attempt}\u6b21\uff09: ${em}`);
      }
      if (attempt < reloadMaxAttempts) {
        if (attempt >= reloadMaxAttempts - 1) {
          log(`ℹ️ \u591a\u6b21\u91cd\u8f7d\u540e\u4ecd\u672a\u83b7\u53d6\u5230\u6807\u51c6\u7b54\u6848\uff0c\u5c06\u5c1d\u8bd5\u4e91\u7aef\u9898\u5e93/\u968f\u673a\u7b56\u7565`, "info");
        }
        const waitS = 2 + Math.random() * 2;
        log(`[\u4f5c\u4e1a] \u672a\u68c0\u6d4b\u5230\u6807\u7b54\uff0c\u7b49\u5f85 ${waitS.toFixed(1)}s \u540e\u91cd\u65b0\u8fdb\u5165\u4f5c\u4e1a\uff08${attempt}/${reloadMaxAttempts}\uff09`, true);
        await sleep(Math.round(waitS * 1000));
        const reloaded = await loadAssignmentDetails(courseId, assignmentId, { waitIfPaperGenerating: true });
        if (reloaded?.error?.message) {
          log(`❌ \u4f5c\u4e1a reload: ${reloaded.error.message}`);
          log(`[\u4f5c\u4e1a] reload \u5931\u8d25\uff0c\u7ee7\u7eed\u4f7f\u7528\u5df2\u7f13\u5b58 paperJson.len=${paperJson.length}`, true);
        } else if (reloaded?.paperJson) {
          details = reloaded;
          ruleId = details?.RuleId || details?.ruleId || ruleId;
          paperJson = String(details.paperJson || paperJson);
          log(`[\u4f5c\u4e1a] reload \u6210\u529f paperJson.len=${paperJson.length}`, true);
        } else {
          log(`❌ \u4f5c\u4e1a reload \u65e0 paperJson\uff0c\u7ee7\u7eed\u4f7f\u7528\u5df2\u7f13\u5b58 len=${paperJson.length}`);
        }
      } else {
        log(
          `ℹ️ ${reloadMaxAttempts} \u6b21 prepare \u5747\u65e0\u6807\u7b54\uff08${lastPrepDiag || "has_answer=false"}\uff09\uff0c\u5c06\u8d70\u4e91\u7aef\u9898\u5e93→\u968f\u673a`,
          "info",
        );
      }
    }

    if (!usedPlatformAnswers && !paperPayloads.length) {
      try {
        const prepBank = await _pp(paperJson, ruleId, {
          requireAnswers: false,
          answerSource: "bank",
        });
        paperPayloads = Array.isArray(prepBank?.payloads) ? prepBank.payloads : [];
        const bankHits = Number(prepBank?.bank_hits || 0);
        const guessHits = Number(prepBank?.guess_hits || 0);
        lastPrepDiag = `bank payloads=${paperPayloads.length} bank_hits=${bankHits} guess_hits=${guessHits} q=${Number(prepBank?.question_count || 0)}`;
        log(`[\u4f5c\u4e1a] \u4e91\u7aef prepare \u9898\u5e93: ${lastPrepDiag}`, true);
        if (bankHits > 0) log(`📚 \u9898\u5e93\u547d\u4e2d ${bankHits} \u9898\uff0c\u5176\u4f59 ${guessHits} \u9898\u968f\u673a/\u9ed8\u8ba4`, "info");
        else if (paperPayloads.length) log(`🎲 \u9898\u5e93\u672a\u547d\u4e2d\uff0c\u5168\u90e8\u6309\u968f\u673a/\u9ed8\u8ba4\u7b54\u6848\u63d0\u4ea4\uff08${guessHits} \u9898\uff09`, "info");
        if (!paperPayloads.length) {
          const prepGuess = await _pp(paperJson, ruleId, {
            requireAnswers: false,
            answerSource: "guess",
          });
          paperPayloads = Array.isArray(prepGuess?.payloads) ? prepGuess.payloads : [];
          lastPrepDiag = `guess payloads=${paperPayloads.length} q=${Number(prepGuess?.question_count || 0)}`;
          log(`[\u4f5c\u4e1a] \u4e91\u7aef prepare \u968f\u673a: ${lastPrepDiag}`, true);
        }
      } catch (e) {
        log(`❌ \u4f5c\u4e1a\u9898\u5e93/\u968f\u673a prepare \u5931\u8d25: ${(e && e.message) || e}`);
      }
      if (!paperPayloads.length) {
        log(`❌ \u4f5c\u4e1a\u672a\u83b7\u53d6\u5230\u53ef\u63d0\u4ea4\u9898\u76ee\uff08\u5df2\u91cd\u8bd5${reloadMaxAttempts}\u6b21\u4e14\u9898\u5e93/\u968f\u673a\u5931\u8d25\uff09: ${title}\uff1b${lastPrepDiag || ""}`);
        setLastChapterDiag("\u4f5c\u4e1a\u65e0\u6807\u51c6\u7b54\u6848\u4e14\u9898\u5e93\u5931\u8d25");
        return false;
      }
    }

    if (!paperPayloads.length) {
      log(`❌ \u4f5c\u4e1a\u65e0\u9898\u76ee\uff0c\u8df3\u8fc7: ${title}\uff1b${lastPrepDiag || ""}`);
      setLastChapterDiag("\u4f5c\u4e1a\u65e0\u9898\u76ee");
      return false;
    }

    const assignmentOpenedAt = Date.now();
    let okCount = 0;
    const totalItems = paperPayloads.length;
    setHomeworkProgress(0, totalItems);
    for (let i = 0; i < totalItems; i++) {
      if (!state.running) {
        log(`⏹️ \u5df2\u505c\u6b62\uff0c\u7ec8\u6b62\u4f5c\u4e1a\u7b54\u9898: ${title}`);
        return false;
      }
      setHomeworkProgress(i + 1, totalItems);
      let encrypted = "";
      encrypted = String(paperPayloads[i]?.encrypted_data || "");
      if (!encrypted) continue;
      const homeworkSubmitMaxRetries = 3;
      let questionSubmitOk = false;
      let lastResp = null;
      for (let attempt = 0; attempt <= homeworkSubmitMaxRetries; attempt++) {
        if (!state.running) return false;
        lastResp = await submitPaperAnswerEncrypted(encrypted);
        if (lastResp && lastResp.ok) {
          questionSubmitOk = true;
          break;
        }
        const freq = isHomeworkPaperAnswerTooFrequent403(lastResp);
        if (freq && attempt < homeworkSubmitMaxRetries) {
          const waitMs = Math.round(3000 * Math.pow(2, attempt) + Math.random() * 2000);
          log(
            `⏳ \u4f5c\u4e1a\u5355\u9898 submit-paper-answer \u89e6\u53d1403/\u9891\u7e41\u9650\u5236\uff0c\u9000\u907f ${Math.round(waitMs / 1000)} \u79d2\u540e\u91cd\u8bd5\uff08${attempt + 1}/${homeworkSubmitMaxRetries}\uff09…`,
          );
          await sleep(waitMs);
          continue;
        }
        break;
      }
      if (questionSubmitOk) {
        okCount += 1;
      } else {
        const resp = lastResp || { ok: false, status: 0, text: "" };
        const raw = String(resp.text || "");
        let serverCode = "";
        let serverMsg = "";
        try {
          const j = JSON.parse(raw);
          serverCode = j?.error?.code != null ? String(j.error.code) : "";
          serverMsg = j?.error?.message ? String(j.error.message) : "";
        } catch (_) {}
        if (resp.status === 403) {
          log(`❌ submit-paper-answer 403: http=${resp.status}, error.code=${serverCode || "null"}, error.message=${serverMsg || "unknown"}`);
          log(`📥 submit-paper-answer 403 body: ${raw.slice(0, 1200)}`);
        } else {
          log(`❌ submit-paper-answer \u5931\u8d25: http=${resp.status}, error.code=${serverCode || "null"}, error.message=${serverMsg || "unknown"}`);
          if (raw) log(`📥 submit-paper-answer body: ${raw.slice(0, 600)}`);
        }
      }
      if (!state.running) return false;
      await sleep(3000 + Math.random() * 500);
    }
    if (okCount <= 0) {
      log(`❌ \u4f5c\u4e1a\u7b54\u9898\u63d0\u4ea4\u5931\u8d25: ${title}`, "warn");
      return false;
    }
    const minMsBeforeFinalSubmit = 30 * 1000;
    const elapsed = Date.now() - assignmentOpenedAt;
    if (elapsed < minMsBeforeFinalSubmit) {
      await sleep(minMsBeforeFinalSubmit - elapsed);
    }
    if (!state.running) return false;
    const finalOk = await submitOnlineAssignment(courseId, assignmentId);
    log(finalOk ? `✅ \u4f5c\u4e1a\u5df2\u4ea4\u5377: ${title}` : `❌ \u4f5c\u4e1a\u4ea4\u5377\u5931\u8d25: ${title}`, finalOk ? "info" : "warn");
    if (finalOk && !usedPlatformAnswers) {
      await sleep(2000);
      try {
        await syncAssignmentPaperToCloudBank(courseId, assignmentId);
      } catch (e) {
        log(`⚠️ \u4f5c\u4e1a\u63d0\u4ea4\u540e\u540c\u6b65\u9898\u5e93\u5931\u8d25: ${(e && e.message) || e}`, "warn");
      }
    }
    setHomeworkProgress(totalItems, totalItems);
    return !!finalOk;
  }

  function resolveExamQuestionType(q) {
    const opts = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    const typeNameRaw = String(q?.TypeName || q?.QuestionTypeName || "");
    const titleText = stripHtmlText(String(q?.Title || q?.title || ""));
    const contentText = stripHtmlText(String(q?.Content || q?.content || ""));
    const mergedText = `${typeNameRaw}|${titleText}|${contentText}`.toLowerCase();

    if (/(\u95ee\u7b54|\u7b80\u7b54|\u8bba\u8ff0|\u4e3b\u89c2|\u7b80\u8ff0|\u9610\u8ff0|\u5206\u6790|\u8c08\u8c08|\u8bd5\u8ff0|\u6848\u4f8b)/i.test(mergedText)) {
      return "essay";
    }

    if (!opts.length) {
      const t0 = Number(q?.Type || 0);
      if (t0 === 4) return "fill";
      if (t0 === 3) return "judge";
      return "essay";
    }

    if (opts.length === 2) {
      const t0 = stripHtmlText(String(opts[0]?.Content ?? opts[0]?.OptionContent ?? opts[0]?.Title ?? opts[0]?.Text ?? "")).trim();
      const t1 = stripHtmlText(String(opts[1]?.Content ?? opts[1]?.OptionContent ?? opts[1]?.Title ?? opts[1]?.Text ?? "")).trim();
      const s = `${t0}|${t1}`;
      if (/(\u6b63\u786e|\u5bf9)\s*\|/.test(s) && /(\||)\s*(\u9519\u8bef|\u9519)/.test(s)) return "judge";
      if (/^(\u6b63\u786e|\u5bf9)\|/.test(s) && /(\u9519\u8bef|\u9519)$/.test(s)) return "judge";
    }

    const t = Number(q?.Type || 0);
    const n = typeNameRaw.toLowerCase();
    if (t === 1 || t === 6 || n.includes("\u5355\u9009") || n.includes("\u7ffb\u8bd1")) return "single";
    if (t === 2 || n.includes("\u591a\u9009")) return "multiple";
    if (t === 3 || n.includes("\u5224\u65ad")) return "judge";
    if (t === 4 || n.includes("\u586b\u7a7a")) return "fill";
    if (t === 5 || n.includes("\u7b80\u7b54") || n.includes("\u8bba\u8ff0") || n.includes("\u95ee\u7b54") || n.includes("\u4e3b\u89c2")) return "essay";
    return "unknown";
  }

  function examQuestionTypeLabel(qType) {
    const t = String(qType || "");
    if (t === "single") return "\u5355\u9009\u9898";
    if (t === "multiple") return "\u591a\u9009\u9898";
    if (t === "judge") return "\u5224\u65ad\u9898";
    if (t === "fill") return "\u586b\u7a7a\u9898";
    if (t === "essay") return "\u7b80\u7b54\u9898";
    return "\u672a\u77e5\u9898\u578b";
  }

  async function fetchExamListByTerms(studyYear, terms = [1, 2]) {
    const all = [];
    for (const term of terms) {
      const url = "https://jxjynew.ahjxjy.cn/v1/jxjy-teacher-space-service/api/exam-rule/stu-exam-list";
      const q = `?StudyYear=${encodeURIComponent(studyYear)}&StudyTerm=${encodeURIComponent(term)}&SkipCount=0&MaxResultCount=500`;
      const data = await apiRequest(`${url}${q}`, "GET", null, false);
      const items = Array.isArray(data?.items) ? data.items : [];
      all.push(...items);
    }
    return all;
  }

  function randomAnswerByType(q, qType) {
    const options = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
    if (qType === "single") return String(Math.max(1, Math.min(options.length || 1, 1)));
    if (qType === "multiple") return options.length >= 2 ? "1,2" : "1";
    if (qType === "judge") return "1";
    if (qType === "fill") return "\u586b\u5199\u5185\u5bb9";
    if (qType === "essay") return "\u672c\u9898\u8003\u67e5\u76f8\u5173\u77e5\u8bc6\u70b9\uff0c\u8bf7\u7ed3\u5408\u8bfe\u7a0b\u5185\u5bb9\u4f5c\u7b54\u3002";
    return "1";
  }

  function normalizeSubmitAnswerByType(raw, qType, optionLen) {
    const t = String(qType || "");
    const s = String(raw == null ? "" : raw).trim();
    if (t === "multiple") {
      const nums = (s.match(/\d+/g) || [])
        .map((x) => Number(x))
        .filter((n) => n >= 1 && n <= Math.max(26, Number(optionLen || 0) || 0));
      const uniq = Array.from(new Set(nums)).sort((a, b) => a - b);
      return uniq.join(",");
    }
    if (t === "single") {
      const m = s.match(/\d+/);
      if (!m) return "1";
      const n = Number(m[0]);
      if (n >= 1 && n <= Math.max(26, Number(optionLen || 0) || 0)) return String(n);
      return "1";
    }
    if (t === "judge") {
      return String(s).includes("2") ? "2" : "1";
    }
    return s;
  }

  async function buildExamSubmitData(q, ruleId) {
    const res = await _ra(q, ruleId);
      const r = res?.result || {};
      const sp = res?.submit_payload || {};
      const enc = String(sp?.encrypted_data || "");
      const qType = String(r.q_type || resolveExamQuestionType(q));
      const opts = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList : [];
      const studentAnswer = normalizeSubmitAnswerByType(String(r.answer || ""), qType, opts.length);
      return {
        id: q?.Id,
        studentAnswer,
        ruleId: ruleId,
        answerId: q?._parent_question_id || resolveAnswerId(q),
        optionId: String(r.option_id || "00000000-0000-0000-0000-000000000000"),
        questionType: (qType === "single" ? 1 : qType === "multiple" ? 2 : qType === "judge" ? 3 : qType === "fill" ? 4 : qType === "essay" ? 5 : 0),
        optionCount: opts.length,
        qType,
        bankAnswer: String(r.bank_answer || ""),
        bankHash: String(r.bank_hash || ""),
        _cloudEncrypted: enc,
      };
    }

  async function processCourseHomework(courseId, courseTitle) {
    if (!state.running) return false;
    try {
      state.inHomeworkPhase = true;
      state.homeworkDoneAssignments = 0;
      log(`📚 \u5f00\u59cb\u4f5c\u4e1a\u5904\u7406: ${courseTitle}`);
      const list = await fetchCourseAssignments(courseId);
      if (!list.length) {
        state.homeworkTotalAssignments = 0;
        updateQueueSummary();
        log("📭 \u5f53\u524d\u8bfe\u7a0b\u65e0\u4f5c\u4e1a");
        setCurrentHomework("\u65e0\u4f5c\u4e1a");
        return true;
      }
      const targets = list.filter((a) => {
        const st = a?.state;
        const score = Number(a?.score || 0);
        return (st == null || st === 0) || ((st === 1 || st === 2) && score < 100);
      });
      if (!targets.length) {
        state.homeworkTotalAssignments = 0;
        updateQueueSummary();
        log("🎉 \u5f53\u524d\u8bfe\u7a0b\u4f5c\u4e1a\u5df2\u5b8c\u6210");
        setCurrentHomework("\u4f5c\u4e1a\u5df2\u5b8c\u6210");
        return true;
      }
      state.homeworkTotalAssignments = targets.length;
      updateQueueSummary();
      log(`🧾 \u5f85\u5904\u7406\u4f5c\u4e1a ${targets.length} \u4e2a`);
      for (let ai = 0; ai < targets.length; ai++) {
        if (!state.running) {
          log("⏹️ \u5df2\u505c\u6b62\uff0c\u7ec8\u6b62\u8bfe\u7a0b\u4f5c\u4e1a\u5904\u7406");
          return false;
        }
        const a = targets[ai];
        const aTitle = a?.title || a?.Title || "\u672a\u77e5\u4f5c\u4e1a";
        setCurrentHomework(`${aTitle} (${ai + 1}/${targets.length})`);
        const st = a?.state;
        const score = Number(a?.score || 0);
        if ((st === 1 || st === 2) && score < 100) {
          await redoAssignmentAndLoadDetails(courseId, a?.assignmentId || a?.Id);
          if (!state.running) return false;
        }
        const ok = await processAssignment(courseId, a);
        if (ok) {
          state.homeworkDoneAssignments += 1;
        } else {
          log(`❌ \u4f5c\u4e1a\u5904\u7406\u5931\u8d25: ${aTitle}`);
        }
        updateQueueSummary();
      }
      setCurrentHomework("\u4f5c\u4e1a\u5904\u7406\u5b8c\u6210");
      setHomeworkProgress(0, 0);
      return true;
    } catch (e) {
      log(`❌ \u4f5c\u4e1a\u5904\u7406\u5f02\u5e38: ${e.message}`, "warn");
      setCurrentHomework("\u4f5c\u4e1a\u5904\u7406\u5f02\u5e38");
      setHomeworkProgress(0, 0);
      return false;
    } finally {
      state.inHomeworkPhase = false;
      state.homeworkTotalAssignments = 0;
      state.homeworkDoneAssignments = 0;
      updateQueueSummary();
    }
  }

  async function updateHomeworkHintFromSelection() {
    if (state.running) return;
    const selected = loadQueue();
    if (!selected.length) {
      setCurrentHomework("\u65e0");
      setHomeworkProgress(0, 0);
      return;
    }
    const selectedCourses = selected
      .map((k) => state.apiCourses.find((c) => c.key === k))
      .filter((c) => !!(c && c.courseId));
    if (!selectedCourses.length) {
      setCurrentHomework("\u65e0");
      return;
    }
    if (selectedCourses.length === 1) {
      setCurrentCourse(selectedCourses[0].title || "\u65e0");
    }
    setCurrentHomework("\u67e5\u8be2\u4f5c\u4e1a\u4e2d...");
    try {
      let totalAssignments = 0;
      let pendingAssignments = 0;
      for (const c of selectedCourses) {
        const list = await fetchCourseAssignments(c.courseId);
        totalAssignments += list.length;
        const targets = list.filter((a) => {
          const st = a?.state;
          const score = Number(a?.score || 0);
          return (st == null || st === 0) || ((st === 1 || st === 2) && score < 100);
        });
        pendingAssignments += targets.length;
      }
      if (selectedCourses.length === 1) {
        if (totalAssignments <= 0) {
          setCurrentHomework("\u65e0\u4f5c\u4e1a");
        } else if (pendingAssignments <= 0) {
          setCurrentHomework("\u4f5c\u4e1a\u5df2\u5b8c\u6210");
        } else {
          setCurrentHomework(`\u5f85\u5904\u7406\u4f5c\u4e1a ${pendingAssignments} \u4e2a`);
        }
      } else {
        if (totalAssignments <= 0) {
          setCurrentHomework(`\u5df2\u9009${selectedCourses.length}\u95e8: \u65e0\u4f5c\u4e1a`);
        } else if (pendingAssignments <= 0) {
          setCurrentHomework(`\u5df2\u9009${selectedCourses.length}\u95e8: \u4f5c\u4e1a\u5df2\u5b8c\u6210`);
        } else {
          setCurrentHomework(`\u5df2\u9009${selectedCourses.length}\u95e8: \u5f85\u5904\u7406\u4f5c\u4e1a ${pendingAssignments} \u4e2a`);
        }
      }
    } catch (_) {
      setCurrentHomework("\u4f5c\u4e1a\u4fe1\u606f\u83b7\u53d6\u5931\u8d25");
    } finally {
      setHomeworkProgress(0, 0);
    }
  }

  async function processCourse(courseId, courseTitle) {
    log(`====== \u8bfe\u7a0b: ${courseTitle} ======`);
    setCurrentCourse(courseTitle);
    if (state.autoHomeworkEnabled) setCurrentHomework("\u5f85\u7ae0\u8282\u5b8c\u6210\u540e\u5904\u7406\u4f5c\u4e1a");
    else setCurrentHomework("\u5df2\u5173\u95ed\u81ea\u52a8\u5904\u7406");
    setHomeworkProgress(0, 0);
    const chapterRetryCount = new Map();
    const chapterSkippedThisRun = new Set();
    const chapterSkipReasonByKey = new Map();
    let lastDeferredBulkLogAt = 0;

    while (state.running) {
      if (state.testChapterLockEnabled && state.testChapterMatchedOnce) {

        return false;
      }
      const resources = await fetchCourseResources(courseId);
      if (!resources) {

        await sleep(2000);
        continue;
      }

      const unfinishedAll = resources.filter((r) => Number(r.progress || 0) < 100);
      const testCandidates = state.testChapterLockEnabled
        ? unfinishedAll.filter((r) => isTargetTestChapter(r))
        : unfinishedAll;
      try {
        for (const r of resources) {
          const rid = String(r?.id || "");
          if (!rid) continue;
          if (Number(r?.progress || 0) >= 100) delete state.refreshDeferredPlan[rid];
        }
      } catch (_) {}
      let forceFinalize = false;
      let unfinished = null;
      if (state.testChapterLockEnabled) {
        unfinished = testCandidates.find((r) => !chapterSkippedThisRun.has(`${courseId}_${r.id}`)) || null;
      } else if (ENABLE_REFRESH_ROTATION_MODE) {
        const nowSec = Date.now() / 1000;
        let dueResource = null;
        let dueResourceAt = null;
        let nearestDueLeft = null;
        const planObj = state.refreshDeferredPlan || {};
        const hasPlan = Object.keys(planObj).length > 0;
        if (hasPlan) {
          for (const r of unfinishedAll) {
            if (chapterSkippedThisRun.has(`${courseId}_${r.id}`)) continue;
            const rid = String(r?.id || "");
            const plan = planObj[rid];
            if (!plan) continue;
            if (String(plan.courseId || "") !== String(courseId || "") || r.type !== "\u89c6\u9891") continue;
            const dueAt = Number(plan.dueAt || 0);
            if (!Number.isFinite(dueAt) || dueAt <= 0) continue;
            if (nowSec >= dueAt) {
              if (!dueResource || dueAt < Number(dueResourceAt || 0)) {
                dueResource = r;
                dueResourceAt = dueAt;
              }
            } else {
              const left = Math.max(0, Math.floor(dueAt - nowSec));
              if (nearestDueLeft == null || left < nearestDueLeft) nearestDueLeft = left;
            }
          }
        }
        if (dueResource) {
          unfinished = dueResource;
          forceFinalize = true;
          const duePlan = state.refreshDeferredPlan[String(unfinished.id || "")] || null;
          const overdue = duePlan ? Math.max(0, Math.floor(nowSec - Number(duePlan.dueAt || nowSec))) : 0;
          log(`⏰ \u5230\u70b9\u6536\u5c3e\uff1a\u56de\u8bbf\u7ae0\u8282\u300a${unfinished.title || "\u672a\u77e5\u7ae0\u8282"}\u300b\u8fdb\u884c\u4e00\u6b21\u6027\u63d0\u4ea4\uff08\u5df2\u5230\u70b9${overdue}\u79d2\uff09`, true);
        } else {
          if (nearestDueLeft != null && Number(nearestDueLeft) <= 20) {
            const waitSec = Math.max(3, Math.min(10, Number(nearestDueLeft || 3)));
            log(`⏳ \u6700\u8fd1\u6536\u5c3e\u5373\u5c06\u5230\u70b9\uff08\u7ea6${nearestDueLeft}\u79d2\uff09\uff0c\u7b49\u5f85${waitSec}\u79d2\u540e\u4f18\u5148\u6536\u5c3e`, true);
            await sleep(waitSec * 1000);
            continue;
          }
          if (nearestDueLeft != null) {
            log(`🧭 \u6536\u5c3e\u961f\u5217\u5b58\u5728\u672a\u5230\u70b9\u4efb\u52a1\uff0c\u6700\u8fd1\u5230\u70b9\u7ea6${nearestDueLeft}\u79d2\u540e`, true);
          }
          unfinished = unfinishedAll.find((r) => {
            if (chapterSkippedThisRun.has(`${courseId}_${r.id}`)) return false;
            const rid = String(r?.id || "");
            const plan = (state.refreshDeferredPlan || {})[rid];
            if (!plan) return true;
            if (String(plan.courseId || "") !== String(courseId || "")) return true;
            if (r.type !== "\u89c6\u9891") return true;
            const dueAt = Number(plan.dueAt || 0);
            return !Number.isFinite(dueAt) || dueAt <= 0 || nowSec >= dueAt;
          });
        }
      } else {
        unfinished = unfinishedAll.find((r) => !chapterSkippedThisRun.has(`${courseId}_${r.id}`));
      }
      if (!unfinished) {
        if (state.testChapterLockEnabled) {
          const q = String(state.testChapterLockQuery || "").trim();
          if (!q) {
            log("⚠️ \u6d4b\u8bd5\u7ae0\u8282\u9501\u5b9a\u5df2\u5f00\u542f\u4f46\u672a\u8bbe\u7f6e\u5339\u914d\u5185\u5bb9");
          } else {
            log(`ℹ️ \u672c\u8bfe\u7a0b\u672a\u547d\u4e2d\u6d4b\u8bd5\u7ae0\u8282\uff1a${q}`);
          }
          return false;
        }
        if (unfinishedAll.length > 0) {
          const nowPick = Date.now() / 1000;
          let skippedN = 0;
          let deferredWaitN = 0;
          let otherN = 0;
          const detailLines = [];
          for (const r of unfinishedAll) {
            const rk = `${courseId}_${r.id}`;
            const label = `${String(r.lessonTitle || "").trim()}/${String(r.title || "").trim()}`.replace(/\s+/g, " ");
            if (chapterSkippedThisRun.has(rk)) {
              skippedN++;
              if (detailLines.length < 15) {
                const why = chapterSkipReasonByKey.get(rk) || "\u672a\u8bb0\u5f55\u5177\u4f53\u539f\u56e0";
                detailLines.push(`· ${label} → \u8fde\u7eed\u5931\u8d25\u5df2\u8df3\u8fc7\uff08${why}\uff09`);
              }
              continue;
            }
            if (ENABLE_REFRESH_ROTATION_MODE) {
              const rid = String(r?.id || "");
              const plan = (state.refreshDeferredPlan || {})[rid];
              if (
                plan &&
                String(plan.courseId || "") === String(courseId || "") &&
                String(r.type || "") === "\u89c6\u9891"
              ) {
                const dueAt = Number(plan.dueAt || 0);
                if (Number.isFinite(dueAt) && dueAt > 0 && nowPick < dueAt) {
                  deferredWaitN++;
                  if (detailLines.length < 15) {
                    const left = Math.max(0, Math.floor(dueAt - nowPick));
                    detailLines.push(`· ${label} → \u5ef6\u65f6\u8865\u5b66\u961f\u5217\uff08\u7ea6 ${left} \u79d2\u540e\u518d\u81ea\u52a8\u5904\u7406\uff09`);
                  }
                  continue;
                }
              }
            }
            otherN++;
            if (detailLines.length < 15) {
              detailLines.push(`· ${label} → \u5f53\u524d\u8f6e\u6b21\u672a\u80fd\u9009\u4e2d\uff08\u8bf7\u5f00\u8c03\u8bd5\u65e5\u5fd7\u6216\u7a0d\u540e\u91cd\u8bd5\uff09`);
            }
          }
          const total = unfinishedAll.length;
          if (skippedN === 0 && deferredWaitN === total && deferredWaitN > 0) {
            let minLeftSec = Infinity;
            let nearestNextTitle = "";
            for (const r of unfinishedAll) {
              const rid = String(r?.id || "");
              const plan = (state.refreshDeferredPlan || {})[rid];
              if (!plan) continue;
              const dueAt = Number(plan.dueAt || 0);
              if (Number.isFinite(dueAt) && dueAt > 0) {
                const left = Math.max(0, dueAt - nowPick);
                if (left < minLeftSec) {
                  minLeftSec = left;
                  const pt = String(plan.title || "").trim();
                  nearestNextTitle =
                    pt ||
                    `${String(r.lessonTitle || "").trim()}/${String(r.title || "").trim()}`.replace(/\s+/g, " ").trim();
                }
              }
            }
            if (!Number.isFinite(minLeftSec) || minLeftSec <= 0) minLeftSec = 8;
            const nextShort =
              nearestNextTitle.length > 56 ? `${nearestNextTitle.slice(0, 55)}…` : nearestNextTitle;
            const nowMs = Date.now();
            if (nowMs - lastDeferredBulkLogAt > 45000) {
              lastDeferredBulkLogAt = nowMs;

            }
            setCurrentResource(
              nextShort
                ? `\u5ef6\u65f6\u6536\u5c3e·\u4e0b\u4e00\u8282≈${Math.ceil(minLeftSec)}\u79d2·${nextShort.slice(0, 40)}`
                : `\u5ef6\u65f6\u8865\u5b66\u7b49\u5f85\uff08\u7ea6${Math.ceil(minLeftSec)}\u79d2\uff09`,
            );
            const sliceSec = Math.max(5, Math.min(60, Math.ceil(Math.min(minLeftSec, 90) - 1)));
            await sleep(sliceSec * 1000);
            continue;
          }

          let head = "";
          if (skippedN === total) {
            head = `⚠️ \u672c\u8bfe\u7a0b ${total} \u4e2a\u7ae0\u8282\u5747\u5df2\u8fde\u7eed\u5931\u8d25\u8df3\u8fc7\uff0c\u660e\u7ec6\u5982\u4e0b`;
          } else {
            head = `⚠️ \u672c\u8bfe\u7a0b\u5c1a\u6709 ${total} \u4e2a\u672a\u5b8c\u6210\u7ae0\u8282\uff1a\u5931\u8d25\u8df3\u8fc7 ${skippedN}\uff0c\u5ef6\u65f6\u7b49\u5f85 ${deferredWaitN}\uff0c\u5176\u5b83 ${otherN}`;
          }
          log(head, "info");
          for (const line of detailLines) {
            log(line, "info");
          }
          setCurrentResource("\u9700\u624b\u52a8\u68c0\u67e5");
          return false;
        }
        if (state.autoHomeworkEnabled) {
          setCurrentHomework("\u7ae0\u8282\u5df2\u5b8c\u6210\uff0c\u5f00\u59cb\u5904\u7406\u4f5c\u4e1a");
          await processCourseHomework(courseId, courseTitle);
        } else {
          log("⏭️ \u5df2\u5173\u95ed\u4f5c\u4e1a\u81ea\u52a8\u5904\u7406\uff0c\u8df3\u8fc7\u4f5c\u4e1a\u9636\u6bb5", "info");
          setCurrentHomework("\u5df2\u8df3\u8fc7(\u5f00\u5173\u5173\u95ed)");
          setHomeworkProgress(0, 0);
        }
        setCurrentHomework("");
        log(`🎉 \u8bfe\u7a0b\u5b8c\u6210`);
        setCurrentResource("\u65e0");
        return true;
      }

      setCurrentResource(`${unfinished.lessonTitle}/${unfinished.title}`);
      const chapterConsumeKey = `${courseId}_${unfinished.id}`;
      if (!state.consumedChapterKeys.has(chapterConsumeKey)) {
        try {
          await _cc(courseId, unfinished.id);
          state.consumedChapterKeys.add(chapterConsumeKey);
        } catch (e) {
          const em = String((e && e.message) || "");
          log(`❌ \u7ae0\u8282\u6388\u6743\u5931\u8d25: ${em}`);
          if (em.includes("free_quota_exhausted")) {
            updateStatus("\u514d\u8d39\u4f53\u9a8c\u7ae0\u8282\u5df2\u7528\u5b8c");
            promptFreeQuotaEnded(true);
          }
          return false;
        }
      }

      log(`📖 \u5b66\u4e60\u4e2d\uff1a${unfinished.lessonTitle}/${unfinished.title}\uff08\u8bf7\u52ff\u5237\u65b0\u9875\u9762\uff0c\u4ee5\u514d\u4e2d\u65ad\u8fdb\u5ea6\uff09`, "info");

      let ok = false;
      let deferred = false;
      const chapterRetryKey = `${courseId}_${unfinished.id}`;
      const alreadyTried = Number(chapterRetryCount.get(chapterRetryKey) || 0);
      for (let attempt = alreadyTried + 1; attempt <= 3 && state.running; attempt++) {
        chapterRetryCount.set(chapterRetryKey, attempt);
        state.lastChapterDiag = "";
        log(`🔁 \u7ae0\u8282\u5c1d\u8bd5 ${attempt}/3: ${unfinished.lessonTitle}/${unfinished.title}`, "info");
        if (unfinished.type === "\u89c6\u9891") {
          const videoResult = await processVideo(courseId, unfinished.id, unfinished.relevantId, unfinished.title, 0, forceFinalize);
          if (videoResult === "deferred") {
            deferred = true;
            ok = true;
          } else {
            ok = !!videoResult;
          }
        } else if (Number(unfinished.resType) === 7 || String(unfinished.type || "").includes("\u6d4b\u9a8c")) {
          ok = await processInClassTest(courseId, unfinished.id, unfinished.title);
        } else {
          ok = await processDocument(courseId, unfinished.id, unfinished.title, unfinished.resType, unfinished.type || "\u6587\u6863");
        }
        if (ok) {
          chapterRetryCount.delete(chapterRetryKey);
          break;
        }
        if (attempt < 3) {
          const hint = state.lastChapterDiag ? `\uff0c\u539f\u56e0\uff1a${state.lastChapterDiag}` : "";
          log(`⚠️ \u7ae0\u8282\u5904\u7406\u5931\u8d25\uff0c\u7a0d\u540e\u91cd\u8bd5: ${unfinished.title}${hint}`, "info");
          await sleep(3000);
        }
      }

      if (!ok) {
        chapterSkippedThisRun.add(chapterRetryKey);
        const hint = state.lastChapterDiag ? `\uff0c\u539f\u56e0\uff1a${state.lastChapterDiag}` : "";
        chapterSkipReasonByKey.set(
          chapterRetryKey,
          state.lastChapterDiag ? String(state.lastChapterDiag) : "\u672a\u8bb0\u5f55\u5177\u4f53\u539f\u56e0",
        );
        log(`⏭️ \u7ae0\u8282\u5931\u8d25\u8fbe\u52303\u6b21\uff0c\u5df2\u8df3\u8fc7\u5f85\u4f60\u624b\u52a8\u68c0\u67e5: ${unfinished.lessonTitle}/${unfinished.title}${hint}`, "info");
        await refreshChapterPreview();
        await sleep(1000);
        continue;
      }
      if (deferred) {
        log(`[PROGRESS]\u7ae0\u8282\uff1a${unfinished.title} ⏳\u5df2\u9884\u70ed\uff0c\u5f85\u5230\u70b9\u6536\u5c3e`, true);
        log(`🗂️ \u5f53\u524d\u6536\u5c3e\u961f\u5217\u6570\u91cf: ${Object.keys(state.refreshDeferredPlan || {}).length}`, true);
        await refreshChapterPreview();
        await sleep(500);
        continue;
      }
      const isVideoChapter =
        String(unfinished.type || "").includes("\u89c6\u9891") || Number(unfinished.resType) === 1;
      if (!isVideoChapter) {
        log(`✅ \u5df2\u5b8c\u6210\uff1a${unfinished.lessonTitle}/${unfinished.title}`, "info");
      }
      await refreshChapterPreview();
      if (state.testChapterLockEnabled) {
        state.testChapterMatchedOnce = true;
        log(`🧪 \u6d4b\u8bd5\u7ae0\u8282\u5b8c\u6210\uff1a${unfinished.lessonTitle}/${unfinished.title}`);
        updateStatus("\u6d4b\u8bd5\u7ae0\u8282\u5b8c\u6210");
        state.running = false;
        break;
      }

      await sleep(3000);
    }
    return false;
  }

  async function runMainLoop() {
    let queue = loadQueue();
    if (!queue.length) {

      state.running = false;
      updateStatus("\u961f\u5217\u4e3a\u7a7a");
      return;
    }

    let allDone = true;
    for (let i = 0; i < queue.length && state.running; i++) {
      queue = loadQueue();
      const courseKey = queue[i];
      const course = state.apiCourses.find((c) => c.key === courseKey);
      if (!course) continue;

      const done = await processCourse(course.courseId, course.title);
      if (done) {
        queue = loadQueue().filter((k) => k !== courseKey);
        saveQueue(queue);
        updateQueueSummary();
      } else {
        allDone = false;
        log(`⚠️ \u8bfe\u7a0b\u672a\u5b8c\u6210\uff0c\u5df2\u4fdd\u7559\u5728\u961f\u5217: ${course.title}`);
      }

      if (i < queue.length - 1 && state.running) {

        await sleep(30000);
      }
    }

    state.running = false;
    state.starting = false;
    stopPreviewAutoRefresh();
    state.runSelectedTotal = 0;
    setCurrentCourse("\u65e0");
    setCurrentResource("\u65e0");
    setCurrentHomework("\u65e0");
    setHomeworkProgress(0, 0);
    updateStatus(allDone ? "\u5b8c\u6210" : "\u90e8\u5206\u672a\u5b8c\u6210");
    syncRunButtons();
    await refreshChapterPreview();
    if (allDone) log("🏁 \u5168\u90e8\u5904\u7406\u5b8c\u6210");

  }

  function updateStatus(text) {
    const el = document.querySelector("#jxjy-auto-status");
    if (!el) return;
    const s = String(text || "");
    el.textContent = s;
    el.classList.remove("jxjy-status-running", "jxjy-status-starting", "jxjy-status-stopped", "jxjy-status-error");
    if (/\u8fd0\u884c\u4e2d|\u5904\u7406\u4e2d|\u5b66\u4e60\u4e2d|\u8fd0\u884c/.test(s)) el.classList.add("jxjy-status-running");
    else if (/\u542f\u52a8\u4e2d|\u51c6\u5907\u4e2d|\u91c7\u96c6\u4e2d|\u7b49\u5f85|\u8ba4\u8bc1/.test(s)) el.classList.add("jxjy-status-starting");
    else if (/\u5df2\u505c\u6b62|\u505c\u6b62|\u961f\u5217\u4e3a\u7a7a|\u5b8c\u6210/.test(s)) el.classList.add("jxjy-status-stopped");
    else if (/\u5f02\u5e38|\u5931\u8d25|\u9519\u8bef|\u7981\u7528/.test(s)) el.classList.add("jxjy-status-error");
  }

  function syncRunButtons() {
    const startBtn = document.querySelector("#jxjy-start");
    const stopBtn = document.querySelector("#jxjy-stop");
    const revoked = !!state.cloudRevoked;
    const running = !!state.running;
    const starting = !!state.starting;
    if (startBtn) {
      const disableStart = revoked || running || starting;
      startBtn.disabled = disableStart;
      startBtn.style.opacity = disableStart ? "0.6" : "";
      startBtn.style.cursor = disableStart ? "not-allowed" : "";
      startBtn.classList.remove("jxjy-btn-running", "jxjy-btn-starting", "jxjy-btn-stopped");
      if (revoked) startBtn.classList.add("jxjy-btn-stopped");
      else if (running) startBtn.classList.add("jxjy-btn-running");
      else if (starting) startBtn.classList.add("jxjy-btn-starting");
      else startBtn.classList.add("jxjy-btn-stopped");
      const startText = revoked
        ? "\u5f00\u59cb(\u7981\u7528)"
        : (starting ? "\u542f\u52a8\u4e2d..." : "\u5f00\u59cb");
      const label = startBtn.querySelector(".jxjy-btn-label");
      if (label) label.textContent = startText;
      else startBtn.textContent = startText;
      startBtn.title = revoked
        ? "\u5f53\u524d Token \u5df2\u7981\u7528\uff0c\u8bf7\u5148\u66f4\u6362 Token"
        : (running ? "\u4efb\u52a1\u8fd0\u884c\u4e2d\uff0c\u4e0d\u80fd\u91cd\u590d\u5f00\u59cb" : "");
    }
    if (stopBtn) {
      const disableStop = !running && !starting;
      stopBtn.disabled = disableStop;
      stopBtn.style.opacity = disableStop ? "0.6" : "";
      stopBtn.style.cursor = disableStop ? "not-allowed" : "";
      stopBtn.classList.remove("jxjy-btn-running", "jxjy-btn-starting", "jxjy-btn-stopped");
      if (running) stopBtn.classList.add("jxjy-btn-running");
      else if (starting) stopBtn.classList.add("jxjy-btn-starting");
      else stopBtn.classList.add("jxjy-btn-stopped");
      stopBtn.title = disableStop
        ? "\u5f53\u524d\u672a\u5728\u8fd0\u884c"
        : (starting ? "\u5373\u5c06\u5f00\u59cb\uff0c\u53ef\u5148\u505c\u6b62" : "\u505c\u6b62\u8fd0\u884c\uff08\u5982\u521a\u5f00\u59cb\u53ef\u80fd\u9700\u7b49\u5f85\u51e0\u79d2\uff09");
      const stopText = !disableStop ? (running ? "\u505c\u6b62" : "\u505c\u6b62\u51c6\u5907\u4e2d...") : "\u505c\u6b62";
      const label = stopBtn.querySelector(".jxjy-btn-label");
      if (label) label.textContent = stopText;
      else stopBtn.textContent = stopText;
    }
    const studySel = document.querySelector("#jxjy-study-mode");
    if (studySel) {
      const lockMode = running || starting;
      studySel.disabled = lockMode;
      studySel.title = lockMode
        ? "\u8fd0\u884c\u4e2d\u4e0d\u53ef\u5207\u6362\u5b66\u4e60\u6a21\u5f0f\uff0c\u8bf7\u5148\u505c\u6b62"
        : "\u81ea\u7531\u9009\u62e9\u5b66\u4e60\u6a21\u5f0f";
    }
  }

  function showPanelNotice(message, level = "warn", focusToken = false, durationMs = 4500, anchorEl = null) {
    const panel = document.querySelector("#jxjy-auto-panel");
    if (!panel) return;
    const box = panel.querySelector("#jxjy-cloud-toast");
    if (!box) return;
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
    box.style.display = "block";
    box.classList.remove("jxjy-toast-warn", "jxjy-toast-error", "jxjy-toast-info", "jxjy-toast-hide", "jxjy-toast-show");
    box.classList.add(level === "error" ? "jxjy-toast-error" : level === "info" ? "jxjy-toast-info" : "jxjy-toast-warn");
    const textEl = box.querySelector(".jxjy-toast-text");
    if (textEl) textEl.textContent = String(message || "");

    try {
      const body = panel.querySelector("#jxjy-panel-body");
      const anchor = anchorEl || null;
      if (body && anchor && anchor.getBoundingClientRect) {
        const b = body.getBoundingClientRect();
        const r = anchor.getBoundingClientRect();
        const top = Math.max(8, Math.min((body.clientHeight || 0) - 60, (r.top - b.top) - 6));
        const left = Math.max(8, Math.min((body.clientWidth || 0) - 340, (r.left - b.left) + (r.width || 0) + 8));
        box.style.top = `${top}px`;
        box.style.left = `${left}px`;
        box.style.right = "auto";
      } else {
        box.style.top = "8px";
        box.style.right = "8px";
        box.style.left = "auto";
      }
    } catch (_) {}
    void box.offsetHeight; // eslint-disable-line no-unused-expressions
    box.classList.add("jxjy-toast-show");
    if (focusToken) {
      const tokenInput = panel.querySelector("#jxjy-cloud-token");
      if (tokenInput && typeof tokenInput.focus === "function") tokenInput.focus();
    }
    const ms = Math.max(1200, Math.min(20000, Number(durationMs || 0) || 4500));
    state.toastTimer = setTimeout(() => {
      hidePanelNotice();
    }, ms);
  }

  function hidePanelNotice() {
    const panel = document.querySelector("#jxjy-auto-panel");
    if (!panel) return;
    const box = panel.querySelector("#jxjy-cloud-toast");
    if (!box) return;
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
    box.classList.add("jxjy-toast-hide");
    setTimeout(() => {
      if (!box.classList.contains("jxjy-toast-hide")) return;
      box.style.display = "none";
      const textEl = box.querySelector(".jxjy-toast-text");
      if (textEl) textEl.textContent = "";
      box.classList.remove("jxjy-toast-show");
    }, 220);
  }

  function updateExamAssistPanel() {
    const panel = document.querySelector("#jxjy-exam-assist-panel");
    if (!panel) return;
    const box = panel.querySelector("#jxjy-exam-assist-list");
    if (!box) return;
    const rows = Array.isArray(state.examAssistRows) ? state.examAssistRows : [];
    if (!rows.length) {
      box.innerHTML = "<div class='jxjy-exam-empty'>\u7b49\u5f85\u8003\u8bd5\u9898\u76ee...</div>";
      return;
    }
    const sel = Number(state.examAssistSelectedNo || 1);
    const esc = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const qid = getCurrentNativeQuestionId();
    const qTextNow = getCurrentNativeQuestionText();
    const pickedById = qid ? findExamRowByQuestionId(qid) : null;
    const pickedByText = qTextNow ? findExamRowByQuestionText(qTextNow) : null;
    const pickedByNo = rows.find((r) => Number(r.no || 0) === sel) || null;
    const subjectiveKeys = ["fill", "essay", "wenda"];
    const pickedByNoKey = String(pickedByNo?.qTypeKey || "");
    const isPickedByNoSubjective = subjectiveKeys.includes(pickedByNoKey);
    const picked = isPickedByNoSubjective ? (pickedByNo || pickedByText || pickedById || rows[0]) : (pickedByText || pickedByNo || pickedById || rows[0]);

    const rawTitle = String(picked?.question || "");
    const MAX_TITLE = 70;
    const titleShort = rawTitle.length > MAX_TITLE ? `${rawTitle.slice(0, MAX_TITLE)}…` : rawTitle;
    const qTitle = esc(titleShort);
    const ansText = esc(picked?.answerText || picked?.bankAnswer || "");
    const ansHtml = ansText.replace(/([A-Z])\uff1a/g, "<span class=\"jxjy-ans-key\">$1</span><span class=\"jxjy-ans-sep\">\uff1a</span>");
    const typeText = esc(picked?.qTypeLabel || "\u672a\u77e5\u9898\u578b");
    const qTypeKey = String(picked?.qTypeKey || "");
    const isSubjective = ["fill", "essay", "wenda"].includes(qTypeKey);
    const bankHashRaw = String(picked?.bankHash || "");
    const isAi = bankHashRaw.toLowerCase().startsWith("ai:deepseek");

    const cloudHashText = !isAi ? esc(bankHashRaw) : "";
    const aiHashText = isAi ? esc(bankHashRaw) : "";

    const cloudBankAnswerStr = String(picked?.bankAnswer || "");
    const cloudMissing = !cloudBankAnswerStr || cloudBankAnswerStr.includes("\u65e0\u9898\u5e93\u7b54\u6848");

    const cloudAnswerHtml = !isAi ? (ansHtml || "\uff08\u65e0\u9898\u5e93\u7b54\u6848\uff09") : "\uff08\u65e0\u9898\u5e93\u7b54\u6848\uff09";
    const aiAnswerHtml = isAi ? (ansHtml || "\uff08\u65e0AI\u7b54\u6848\uff09") : "\uff08\u65e0AI\u7b54\u6848\uff09";

    const escAttr = (v) =>
      String(v || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const toB64 = (s) => {
      try {
        return btoa(unescape(encodeURIComponent(String(s || ""))));
      } catch (_) {
        return "";
      }
    };

    const showCloudCopy = isSubjective && !isAi && String(picked?.bankAnswer || "").trim() && !String(picked?.bankAnswer || "").includes("\u65e0\u9898\u5e93\u7b54\u6848");
    const showAiCopy = isSubjective && isAi && String(picked?.bankAnswer || "").trim() && !String(picked?.bankAnswer || "").includes("\u65e0\u9898\u5e93\u7b54\u6848");

    const cloudCopy =
      showCloudCopy
        ? `<div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <button class="jxjy-exam-copy" data-copy-b64="${escAttr(toB64(picked?.bankAnswer || picked?.answerText || ""))}" style="border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">\u590d\u5236</button>
          </div>`
        : "";
    const aiCopy =
      showAiCopy
        ? `<div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <button class="jxjy-exam-copy" data-copy-b64="${escAttr(toB64(picked?.bankAnswer || picked?.answerText || ""))}" style="border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">\u590d\u5236</button>
          </div>`
        : "";

    const showAiArea = isAi || !!cloudMissing;

    box.innerHTML = `
      <div class="jxjy-exam-detail">
        <div class="jxjy-exam-detail-title">\u5f53\u524d\u9898\u578b\uff1a${typeText}</div>
        <div class="jxjy-exam-detail-title">\u5f53\u524d\u9898\u76ee</div>
        <div class="jxjy-exam-detail-q">${qTitle || "\uff08\u7a7a\u9898\u76ee\uff09"}</div>

        <div style="margin-top:10px;display:grid;gap:8px;">
          <div style="${showAiArea ? "" : "grid-column:1 / -1;"}">
            <div class="jxjy-exam-detail-title" style="margin-top:0;">\u9898\u5e93\u7b54\u6848${cloudHashText ? `\uff08\u54c8\u5e0c: ${cloudHashText}\uff09` : ""}</div>
            <div class="jxjy-exam-detail-a">${cloudAnswerHtml}</div>
            ${cloudCopy}
          </div>
          ${showAiArea ? `
          <div>
            <div class="jxjy-exam-detail-title" style="margin-top:0;">AI\u7b54\u6848${aiHashText ? `` : ""}</div>
            <div class="jxjy-exam-detail-a" style="background:linear-gradient(180deg,#eff6ff,#e0f2fe);border-color:#93c5fd;color:#0f172a;">
              ${aiAnswerHtml}
            </div>
            ${aiCopy}
          </div>
          ` : ""}
        </div>
      </div>
    `;

    try {
      const qTypeKey = String(picked?.qTypeKey || "");
      const isObjective = ["single", "multiple", "judge"].includes(qTypeKey);
      if (isObjective) {
        const idxs = parseAnswerToIndexList(String(picked?.bankAnswer || ""));
        const sig = `${qTypeKey}|${String(picked?.bankHash || "")}|${String(picked?.bankAnswer || "")}|${String(picked?.questionId || "")}`;
        if (idxs.length && state.examAssistLastPaintSig !== sig) {
          state.examAssistLastPaintSig = sig;
          paintCurrentQuestionChoiceState(idxs);
        }
      }
    } catch (_) {}

    if (isSubjective) {
      const btns = box.querySelectorAll(".jxjy-exam-copy[data-copy-b64]");
      btns.forEach((btn) => {
        if (!btn || btn.__jxjyCopyBound) return;
        btn.__jxjyCopyBound = true;
        btn.addEventListener("click", async () => {
          try {
            const b64 = String(btn.getAttribute("data-copy-b64") || "");
            const text = decodeURIComponent(escape(atob(b64)));
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(text);
              showExamAssistNotice("\u7b54\u6848\u5df2\u590d\u5236", 1400);
            } else {
              const ta = document.createElement("textarea");
              ta.value = text;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              ta.remove();
              showExamAssistNotice("\u7b54\u6848\u5df2\u590d\u5236", 1400);
            }
          } catch (_) {}
        });
      });
    }
  }

  function pushExamAssistRow(no, question, bankAnswer, answerText = "", qTypeLabel = "", questionId = "", bankHash = "", qTypeKey = "") {
    state.examAssistRows.push({
      no: Number(no || 0),
      question: String(question || ""),
      bankAnswer: String(bankAnswer || ""),
      answerText: String(answerText || ""),
      qTypeLabel: String(qTypeLabel || ""),
      questionId: String(questionId || ""),
      bankHash: String(bankHash || ""),
      qTypeKey: String(qTypeKey || ""),
    });
    if (state.examAssistRows.length > 200) state.examAssistRows = state.examAssistRows.slice(-200);
    updateExamAssistPanel();
  }

  function resetExamAssistRows() {
    state.examAssistRows = [];
    state.examAssistSelectedNo = 1;
    state.examAnsweredNos = new Set();
    state.examAutoFillDone = {};
    state.examAutoFillInFlight = {};
    state.examDirectSubmitDone = {};
    state.examCurrentRuleId = "";
    state.examQuestionById = {};
    state.examQuestionsFlat = [];
    updateExamAssistPanel();
  }

  function getCurrentNativeQuestionId() {
    try {
      const uls = Array.from(document.querySelectorAll(".item-card-area ul.answer-list[data-question-id]"));
      const vis = uls.filter((ul) => {
        const rect = ul.getBoundingClientRect ? ul.getBoundingClientRect() : null;
        return rect && rect.width > 0 && rect.height > 0;
      });
      vis.sort((a, b) => {
        const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
        return (rb.width * rb.height) - (ra.width * ra.height);
      });
      const ul = vis[0];
      if (!ul) return "";
      return String(ul.getAttribute("data-question-id") || "").trim();
    } catch (_) {
      return "";
    }
  }

  function findExamRowByQuestionId(qid) {
    const id = String(qid || "").trim();
    if (!id) return null;
    const rows = Array.isArray(state.examAssistRows) ? state.examAssistRows : [];
    return rows.find((r) => String(r?.questionId || "") === id) || null;
  }

  function normalizeExamCompareText(s) {
    return stripHtmlText(String(s || ""))
      .replace(/\s+/g, "")
      .replace(/[\uff1a:,.\uff0c\u3002\uff01\uff1f!?\-|]/g, "")
      .trim();
  }

  function getCurrentNativeQuestionText() {
    try {
      const selectors = [".question-content", ".topic-content", ".subject-content", ".item-title", ".question-title", ".content-box", ".left-box", ".stem"];
      const nodes = [];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => nodes.push(el));
      }
      if (!nodes.length) {
        document.querySelectorAll("div,p,section").forEach((el) => {
          if (nodes.length > 120) return;
          nodes.push(el);
        });
      }
      let bestText = "";
      let bestScore = 0;
      for (const el of nodes) {
        if (!el || (el.closest && el.closest("#jxjy-exam-assist-panel"))) continue;
        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if (!rect || rect.width < 120 || rect.height < 20) continue;
        const txt = stripHtmlText(el.textContent || "").trim();
        if (!txt || txt.length < 8) continue;
        if (/\u9898\u578b|\u7b54\u9898\u5361|\u6700\u5c0f\u5316|\u63d0\u4ea4|\u8003\u8bd5\u8f85\u52a9\u9762\u677f|\u8bf7\u8f93\u5165\u5185\u5bb9/.test(txt)) continue;
        const score = Math.min(200, txt.length) + Math.min(20000, rect.width * rect.height) / 1000;
        if (score > bestScore) {
          bestScore = score;
          bestText = txt;
        }
      }
      return bestText;
    } catch (_) {
      return "";
    }
  }

  function findExamRowByQuestionText(qText) {
    const target = normalizeExamCompareText(qText);
    if (!target) return null;
    const rows = Array.isArray(state.examAssistRows) ? state.examAssistRows : [];
    let best = null;
    let bestScore = 0;
    for (const r of rows) {
      const src = normalizeExamCompareText(r?.question || "");
      if (!src) continue;
      if (src === target) return r;
      if (src.includes(target) || target.includes(src)) {
        const score = Math.min(src.length, target.length);
        if (score > bestScore) {
          bestScore = score;
          best = r;
        }
      }
    }
    return best;
  }

  function showExamAssistNotice(message, ms = 2600) {
    try {
      const level = /\u5931\u8d25|\u9519\u8bef|err/i.test(String(message || "")) ? "error" : "success";
      let n = document.getElementById("jxjy-exam-page-toast");
      if (!n) {
        n = document.createElement("div");
        n.id = "jxjy-exam-page-toast";
        document.body.appendChild(n);
      }
      n.textContent = String(message || "");
      n.classList.remove("jxjy-toast-success", "jxjy-toast-error");
      n.classList.add(level === "error" ? "jxjy-toast-error" : "jxjy-toast-success");
      n.classList.add("show");
      setTimeout(() => {
        try { n.classList.remove("show"); } catch (_) {}
      }, Math.max(1200, Number(ms || 0)));
    } catch (_) {}
  }

  function _extractCardNoFromText(s) {
    const t = String(s || "").trim();
    if (!t) return 0;
    const m = t.match(/^#?\s*(\d{1,3})$/);
    return m ? Number(m[1]) : 0;
  }

  function _extractCardNoFromElement(el) {
    try {
      if (!el) return 0;
      const parseId = (node) => {
        const nid = String(node?.id || node?.getAttribute?.("id") || "").trim();
        const m = nid.match(/^number_(\d{1,3})$/);
        return m && m[1] ? Number(m[1]) : 0;
      };

      let v = parseId(el);
      if (v) return v;
      if (el.closest) {
        const c = el.closest('[id^="number_"]');
        v = parseId(c);
        if (v) return v;
      }

      const txt = String(el.textContent || "").trim();
      return _extractCardNoFromText(txt);
    } catch (_) {
      return 0;
    }
  }

  function _detectNativeAnswerCardContainer() {
    const all = Array.from(document.querySelectorAll("div,section,ul,ol"));
    let best = null;
    let bestScore = 0;
    for (const el of all) {
      if (!el || !el.querySelectorAll) continue;
      if (el.closest && el.closest("#jxjy-exam-assist-panel")) continue;
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      if (rect && (rect.width < 120 || rect.height < 80)) continue;
      const nodes = el.querySelectorAll("button,li,a,div,span");
      let score = 0;
      let has1 = false;
      let has2 = false;
      for (const n of nodes) {
        const v = _extractCardNoFromElement(n);
        if (!v) continue;
        if (v >= 1 && v <= 200) score += 1;
        if (v === 1) has1 = true;
        if (v === 2) has2 = true;
      }
      if (has1 && has2) score += 8;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return bestScore >= 20 ? best : null;
  }

  function _findNativeAnswerCardCandidates(no) {
    const n = Number(no || 0);
    if (!n) return [];
    const container = _detectNativeAnswerCardContainer();
    const roots = [];
    if (container) roots.push(container);
    roots.push(document.body);
    const out = [];
    for (const root of roots) {
      const nodes = root.querySelectorAll("button,li,a,div,span");
      for (const el of nodes) {
        if (!el || !el.textContent) continue;
        if (el.closest && el.closest("#jxjy-exam-assist-panel")) continue;
        const v = _extractCardNoFromElement(el);
        if (v !== n) continue;
        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if (rect && rect.width === 0 && rect.height === 0) continue;
        const clickable = el.closest("button,a,li,[role='button'],[onclick],[class*='item'],[class*='num'],[class*='card']") || el;
        if (!out.includes(clickable)) out.push(clickable);
      }
      if (out.length) break;
    }
    return out;
  }

  function syncToNativeAnswerCard(no) {
    try {
      const before = Number(state.examAssistSelectedNo || 0);
      const candidates = _findNativeAnswerCardCandidates(no);
      if (!candidates.length) return;
      for (const el of candidates) {
        if (!el) continue;
        try {
          if (typeof el.click === "function") el.click();
          try { el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })); } catch (_) {}
          el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
          el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
          el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          if (Number(state.examAssistSelectedNo || 0) === Number(no || 0) && before !== Number(no || 0)) break;
        } catch (_) {}
      }
    } catch (_) {}
  }

  function goNextQuestionLikeAiWenDa(currentNo) {
    if (EXAM_ASSIST_SHOW_ONLY) return false;
    try {
      const no = Number(currentNo || 0);
      if (!no) return false;
      const rows = Array.isArray(state.examAssistRows) ? state.examAssistRows : [];
      const maxNo = rows.reduce((m, r) => Math.max(m, Number(r?.no || 0)), 0);
      const nextNo = no + 1;
      if (!nextNo || (maxNo > 0 && nextNo > maxNo)) return false;

      const root = document.querySelector("micro-app-body>#app>div");
      const vm = root && root.__vue__;
      if (vm && typeof vm.goAnchor === "function" && Array.isArray(vm.hierarchyList)) {
        const target = vm.hierarchyList[nextNo - 1];
        const id = target && target.Id ? String(target.Id) : "";
        if (id) {
          try { vm.goAnchor(id); } catch (_) {}
          state.examAssistSelectedNo = nextNo;
          updateExamAssistPanel();
          setTimeout(() => scheduleAutoFillByNo(nextNo), 220);
          return true;
        }
      }

      syncToNativeAnswerCard(nextNo);
      setTimeout(() => scheduleAutoFillByNo(nextNo), 260);
      return true;
    } catch (_) {
      return false;
    }
  }

  function scheduleAutoNextQuestion(currentNo, minDelayMs = 5200) {
    if (EXAM_ASSIST_SHOW_ONLY) return;
    const no = Number(currentNo || 0);
    if (!no) return;
    setTimeout(() => {
      try { goNextQuestionLikeAiWenDa(no); } catch (_) {}
    }, Math.max(3000, Number(minDelayMs || 0)));
  }

  function parseAnswerToIndexList(raw) {
    const s = String(raw == null ? "" : raw).trim();
    if (!s) return [];
    const out = [];
    const nums = s.match(/\d+/g) || [];
    for (const n of nums) {
      const v = Number(n);
      if (v >= 1 && v <= 26) out.push(v);
    }
    if (out.length) return Array.from(new Set(out));
    const letters = (s.toUpperCase().match(/[A-Z]/g) || []);
    for (const ch of letters) {
      const v = ch.charCodeAt(0) - 64;
      if (v >= 1 && v <= 26) out.push(v);
    }
    return Array.from(new Set(out));
  }

  function _visibleChoiceInputs() {
    const all = Array.from(document.querySelectorAll("input[type='radio'],input[type='checkbox']"));
    return all.filter((el) => {
      if (!el) return false;
      if (el.closest && el.closest("#jxjy-exam-assist-panel")) return false;
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      if (!rect) return true;
      return rect.width > 0 && rect.height > 0;
    });
  }

  function paintCurrentQuestionChoiceState(idxs) {
    try {
      const want = new Set((Array.isArray(idxs) ? idxs : []).map((x) => Number(x)).filter((n) => n > 0));
      if (!want.size) return;
      const markCheckedLikeNative = (root, on) => {
        if (!root) return;
        const op = on ? "add" : "remove";
        const cls = root.classList;
        cls[op]("active");
        cls[op]("selected");
        cls[op]("checked");
        cls[op]("is-checked");
        cls[op]("ant-checkbox-wrapper-checked");
        cls[op]("ant-radio-wrapper-checked");
        cls[op]("jxjy-force-picked");
        root.setAttribute("aria-checked", on ? "true" : "false");
        root.setAttribute("data-checked", on ? "true" : "false");
        if (on) root.setAttribute("aria-selected", "true");
        else root.removeAttribute("aria-selected");

        const antChecks = root.querySelectorAll(".ant-checkbox, .ant-radio");
        for (const box of antChecks) {
          box.classList[op](box.classList.contains("ant-radio") ? "ant-radio-checked" : "ant-checkbox-checked");
          const inner = box.querySelector(".ant-checkbox-input, .ant-radio-input");
          if (inner) inner.checked = !!on;
        }
        const antInners = root.querySelectorAll(".ant-checkbox-inner, .ant-radio-inner");
        for (const inn of antInners) {
          inn.classList[op]("jxjy-force-picked");
        }

        const elNodes = root.querySelectorAll(".el-checkbox, .el-radio, .el-checkbox__input, .el-radio__input");
        for (const n of elNodes) n.classList[op]("is-checked");
        const elInputs = root.querySelectorAll(".el-checkbox__original, .el-radio__original");
        for (const i of elInputs) i.checked = !!on;

        const nativeInputs = root.querySelectorAll("input[type='checkbox'],input[type='radio']");
        for (const i of nativeInputs) i.checked = !!on;
      };
      const uls = Array.from(document.querySelectorAll(".item-card-area ul.answer-list"));
      const visibleUls = uls.filter((ul) => {
        if (!ul) return false;
        if (ul.closest && ul.closest("#jxjy-exam-assist-panel")) return false;
        const rect = ul.getBoundingClientRect ? ul.getBoundingClientRect() : null;
        return !!rect && rect.width > 0 && rect.height > 0;
      });
      visibleUls.sort((a, b) => {
        const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
        return (rb.width * rb.height) - (ra.width * ra.height);
      });
      const ul = visibleUls[0] || null;
      if (ul) {
        const lis = Array.from(ul.querySelectorAll(":scope > li"));
        for (let i = 0; i < lis.length; i++) {
          const no = i + 1;
          const li = lis[i];
          if (!li) continue;
          const on = want.has(no);
          markCheckedLikeNative(li, on);
        }
      }

      const inputs = _visibleChoiceInputs();
      const checks = inputs.filter((x) => String(x.type || "").toLowerCase() === "checkbox");
      const radios = inputs.filter((x) => String(x.type || "").toLowerCase() === "radio");
      const target = checks.length >= 2 ? checks : radios;
      for (let i = 0; i < target.length; i++) {
        const no = i + 1;
        const el = target[i];
        if (!el) continue;
        const on = want.has(no);
        el.checked = on;
        const wrap = el.closest("label,li,.ant-checkbox-wrapper,.ant-radio-wrapper,.el-checkbox,.el-radio,div");
        if (wrap) markCheckedLikeNative(wrap, on);
      }
    } catch (_) {}
  }

  function isOptionSelectedLikeNative(el) {
    if (!el) return false;
    if (el.getAttribute && el.getAttribute("aria-checked") === "true") return true;
    const cl = el.classList;
    if (!cl) return false;
    return (
      cl.contains("active") ||
      cl.contains("selected") ||
      cl.contains("checked") ||
      cl.contains("is-checked") ||
      cl.contains("ant-checkbox-checked") ||
      cl.contains("ant-radio-checked") ||
      cl.contains("ant-checkbox-wrapper-checked") ||
      cl.contains("ant-radio-wrapper-checked")
    );
  }

  function triggerNativeOptionClick(el) {
    if (!el) return false;
    try {
      try { el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })); } catch (_) {}
      el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      try { el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true })); } catch (_) {}
      el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    } catch (_) {
      return false;
    }
  }

  function applyAnswerListUiState(ul, idxs) {
    try {
      if (!ul) return;
      const lis = Array.from(ul.querySelectorAll(":scope > li"));
      if (!lis.length) return;
      const want = new Set((Array.isArray(idxs) ? idxs : []).map((n) => Number(n)).filter((n) => n > 0));
      for (let i = 0; i < lis.length; i++) {
        const li = lis[i];
        if (!li) continue;
        const on = want.has(i + 1);
        if (on) li.classList.add("on");
        else li.classList.remove("on");
        try { li.setAttribute("aria-checked", on ? "true" : "false"); } catch (_) {}
        const op = on ? "add" : "remove";
        li.classList[op]("active");
        li.classList[op]("selected");
        li.classList[op]("checked");
        li.classList[op]("is-checked");
      }
    } catch (_) {}
  }

  function getVisibleAnswerListByQuestionId(qid) {
    try {
      const id = String(qid || "").trim();
      if (!id) return null;
      const uls = Array.from(document.querySelectorAll(`.item-card-area ul.answer-list[data-question-id="${CSS.escape(id)}"]`));
      const visible = uls.filter((ul) => {
        if (!ul) return false;
        if (ul.closest && ul.closest("#jxjy-exam-assist-panel")) return false;
        const rect = ul.getBoundingClientRect ? ul.getBoundingClientRect() : null;
        return !!rect && rect.width > 0 && rect.height > 0;
      });
      visible.sort((a, b) => {
        const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
        return (rb.width * rb.height) - (ra.width * ra.height);
      });
      return visible[0] || null;
    } catch (_) {
      return null;
    }
  }

  function forceApplyAnswerUiForDuration(qid, idxs, durationMs = 2000) {
    try {
      const start = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      let lastApply = 0;
      const tick = (t) => {
        try {
          const now = Number(t || 0) || ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now());
          if ((now - start) > durationMs) return;
          if ((now - lastApply) >= 50) {
            lastApply = now;
            const ul = getVisibleAnswerListByQuestionId(qid);
            applyAnswerListUiState(ul, idxs);
            paintCurrentQuestionChoiceState(idxs);
          }
        } catch (_) {}
        try { requestAnimationFrame(tick); } catch (_) {}
      };
      try { requestAnimationFrame(tick); } catch (_) {}
    } catch (_) {}
  }

  function softRefreshExamQuestionView(qid) {
    try {
      const cur = String(qid || "");
      if (!cur) return false;
      const nextBtn = document.querySelector(".operate .operate_div.operate_bottom.enable_tip");
      const prevBtn = document.querySelector(".operate .operate_div.operate_top.enable_tip");
      if (!nextBtn || !prevBtn) return false;
      try { nextBtn.click(); } catch (_) {}
      setTimeout(() => {
        try { prevBtn.click(); } catch (_) {}
      }, 260);
      return true;
    } catch (_) {
      return false;
    }
  }

  function reloadOnceAfterMultiSubmit(qid, delayMs = 650) {
    try {
      const id = String(qid || "").trim();
      if (!id) return false;
      const key = `jxjy:exam:reloadOnce:${id}`;
      if (sessionStorage.getItem(key) === "1") return false;
      sessionStorage.setItem(key, "1");
      setTimeout(() => {
        try { window.location.reload(); } catch (_) {}
      }, Math.max(0, Number(delayMs || 0)));
      return true;
    } catch (_) {
      return false;
    }
  }

  function autoFillCurrentQuestionByRow(no) {
    if (EXAM_ASSIST_SHOW_ONLY) return;
    try {
      const rows = Array.isArray(state.examAssistRows) ? state.examAssistRows : [];
      const qid = getCurrentNativeQuestionId();
      const row = (qid ? findExamRowByQuestionId(qid) : null) || rows.find((r) => Number(r.no || 0) === Number(no || 0));
      if (!row) return;
      const idxs = parseAnswerToIndexList(row.bankAnswer || "");
      if (!idxs.length) return;
      const isMultiByLabel = String(row?.qTypeLabel || "").includes("\u591a\u9009");
      const isMultiByAnswer = idxs.length > 1;
      const isMultiLikely = isMultiByLabel || isMultiByAnswer;
      const key = String(qid || row.questionId || `no:${no}`);
      const now = Date.now();
      const inFlightTs = Number(state.examAutoFillInFlight[key] || 0);
      if (inFlightTs && (now - inFlightTs) < 3200) return;
      state.examAutoFillInFlight[key] = now;
      const prev = state.examAutoFillGuard[key];
      const wantSig = idxs.join(",");
      const guardMs = isMultiLikely ? 4500 : 1500;
      if (prev && prev.sig === wantSig && (now - prev.ts) < guardMs) return;
      if (isMultiLikely && state.examAutoFillDone[key] === wantSig) return;
      state.examAutoFillGuard[key] = { sig: wantSig, ts: now };

      try {
        const uls = Array.from(document.querySelectorAll(".item-card-area ul.answer-list"));
        const visibleUls = uls.filter((ul) => {
          if (!ul) return false;
          if (ul.closest && ul.closest("#jxjy-exam-assist-panel")) return false;
          const rect = ul.getBoundingClientRect ? ul.getBoundingClientRect() : null;
          return !!rect && rect.width > 0 && rect.height > 0;
        });
        visibleUls.sort((a, b) => {
          const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
          return (rb.width * rb.height) - (ra.width * ra.height);
        });
        const ul = visibleUls[0] || null;
        if (ul) {
          const lis = Array.from(ul.querySelectorAll(":scope > li"));
          if (lis.length) {
            const dataType = String(ul.getAttribute("data-type") || "").toLowerCase();
            const qTypeAttr = String(ul.getAttribute("data-question-type") || "").trim();
            const isMulti =
              isMultiByLabel ||
              qTypeAttr === "2" ||
              dataType === "checkbox" ||
              isMultiByAnswer;
            if (isMulti) {
              const uniqIdxs = Array.from(new Set(idxs))
                .map((x) => Number(x))
                .filter((x) => x > 0)
                .sort((a, b) => a - b);
              (async () => {
                try {
                  state.examAutoFillInFlight[key] = Date.now();
                  for (const idx of uniqIdxs) {
                    const li = lis[idx - 1];
                    if (!li) continue;
                    if (isOptionSelectedLikeNative(li)) continue;
                    try { li.scrollIntoView({ block: "center", inline: "nearest" }); } catch (_) {}
                    try { li.click(); } catch (_) {}
                    await sleep(Math.floor(3100 + Math.random() * 900));
                  }
                  state.examAutoFillDone[key] = wantSig;
                  scheduleAutoNextQuestion(no, 5600);
                } catch (_) {}
              })();
              return;
            }
            const selectedNow = [];
            for (let i = 0; i < lis.length; i++) {
              const li = lis[i];
              const active = isOptionSelectedLikeNative(li);
              if (active) selectedNow.push(i + 1);
            }
            const same = selectedNow.length === idxs.length && selectedNow.every((v, i) => v === idxs[i]);
            if (same) {
              if (isMulti) state.examAutoFillDone[key] = wantSig;
              return;
            }
            if (isMulti) {
              const uniqIdxs = Array.from(new Set(idxs)).map((x) => Number(x)).filter((x) => x > 0).sort((a, b) => a - b);
              (async () => {
                try {
                  state.examAutoFillInFlight[key] = Date.now();

                  const clickOne = async (li) => {
                    if (!li) return;
                    try { li.scrollIntoView({ block: "center", inline: "nearest" }); } catch (_) {}
                    const target =
                      li.querySelector("i") ||
                      li.querySelector(".option-item") ||
                      li.querySelector("span") ||
                      li;
                    try { if (typeof target.click === "function") target.click(); } catch (_) {}
                    try { triggerNativeOptionClick(target); } catch (_) {}
                    await sleep(Math.floor(260 + Math.random() * 320));
                  };

                  for (const idx of uniqIdxs) {
                    if (idx < 1 || idx > lis.length) continue;
                    const li = lis[idx - 1];
                    if (!li) continue;
                    if (isOptionSelectedLikeNative(li)) continue;
                    await clickOne(li);
                  }
                  let okAll = true;
                  for (const idx of uniqIdxs) {
                    if (idx < 1 || idx > lis.length) continue;
                    const li = lis[idx - 1];
                    if (!li) continue;
                    if (isOptionSelectedLikeNative(li)) continue;
                    okAll = false;
                    await clickOne(li);
                  }

                  let finalOk = true;
                  for (const idx of uniqIdxs) {
                    const li = lis[idx - 1];
                    if (!li || !isOptionSelectedLikeNative(li)) { finalOk = false; break; }
                  }
                  if (finalOk || okAll) {
                    state.examAutoFillDone[key] = wantSig;
                  } else {
                    try { delete state.examAutoFillDone[key]; } catch (_) { state.examAutoFillDone[key] = ""; }
                    setTimeout(() => { try { autoFillCurrentQuestionByRow(no); } catch (_) {} }, 680);
                  }
                } catch (_) {}
              })();
              return;
            }
            const first = Number(idxs[0] || 0);
            if (first >= 1 && first <= lis.length) {
              const li = lis[first - 1];
              const already = isOptionSelectedLikeNative(li);
              if (!already && li && typeof li.click === "function") li.click();
            }
            scheduleAutoNextQuestion(no, 5200);
            return;
          }
        }
      } catch (_) {}

      if (isMultiLikely) return;

      const inputs = _visibleChoiceInputs();
      const radios = inputs.filter((x) => String(x.type || "").toLowerCase() === "radio");
      const checks = inputs.filter((x) => String(x.type || "").toLowerCase() === "checkbox");
      const target = checks.length >= 2 ? checks : radios;
      let clicked = false;
      if (target.length) {
        if (checks.length >= 2) {
          for (const i of idxs) {
            const el = checks[i - 1];
            if (!el) continue;
            if (el.checked) continue;
            try { el.click(); clicked = true; } catch (_) {}
          }
        } else {
          const i = idxs[0];
          const el = target[i - 1];
          if (el && !el.checked) {
            try { el.click(); clicked = true; } catch (_) {}
          }
        }
      }

      if (!clicked) {
        const optionSelector = [
          ".ant-radio-wrapper",
          ".ant-checkbox-wrapper",
          ".el-radio",
          ".el-checkbox",
          "[class*='option'] label",
          "[class*='option'] li",
          "[class*='option'] div",
          "[class*='question'] label",
          "[class*='question'] li",
        ].join(",");
        const raw = Array.from(document.querySelectorAll(optionSelector));
        const visible = raw.filter((el) => {
          if (!el || !el.textContent) return false;
          if (el.closest && el.closest("#jxjy-exam-assist-panel")) return false;
          const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
          if (!rect || rect.width <= 0 || rect.height <= 0) return false;
          const txt = String(el.textContent || "").trim();
          return !!txt && txt.length <= 300;
        });
        const dedup = [];
        const seen = new Set();
        for (const el of visible) {
          const t = String(el.textContent || "").replace(/\s+/g, " ").trim();
          const r = el.getBoundingClientRect();
          const k = `${Math.round(r.top)}|${Math.round(r.left)}|${t.slice(0, 40)}`;
          if (seen.has(k)) continue;
          seen.add(k);
          dedup.push(el);
        }
        dedup.sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          return (ra.top - rb.top) || (ra.left - rb.left);
        });
        const options = dedup.slice(0, 10);
        for (const i of idxs) {
          const el = options[i - 1];
          if (!el) continue;
          const clickable = el.closest("label,li,button,a,div,[role='button']") || el;
          try {
            if (typeof clickable.click === "function") clickable.click();
            clicked = true;
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  function scheduleAutoFillByNo(no) {
    if (EXAM_ASSIST_SHOW_ONLY) return;
    const n = Number(no || 0);
    if (!n) return;
    setTimeout(() => autoFillCurrentQuestionByRow(n), 120);
    setTimeout(() => {
      try {
        const qid = getCurrentNativeQuestionId();
        const row = (qid ? findExamRowByQuestionId(qid) : null) || (state.examAssistRows || []).find((r) => Number(r.no || 0) === n);
        const t = String(row?.qTypeLabel || "");
        const idxs = parseAnswerToIndexList(row?.bankAnswer || "");
        if (t.includes("\u591a\u9009") || idxs.length > 1) return;
      } catch (_) {}
      autoFillCurrentQuestionByRow(n);
    }, 520);
  }

  function _isGreenLike(el) {
    try {
      const st = window.getComputedStyle(el);
      const bg = String(st.backgroundColor || "");
      const c = String(st.color || "");
      const parse = (s) => {
        const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
      };
      const bgv = parse(bg);
      const cv = parse(c);
      const ok1 = bgv && bgv.g > 120 && bgv.g > bgv.r + 10 && bgv.g > bgv.b + 10;
      const ok2 = cv && cv.g > 120 && cv.g > cv.r + 10 && cv.g > cv.b + 10;
      return !!(ok1 || ok2);
    } catch (_) {
      return false;
    }
  }

  function syncAnsweredNosFromNativeCard() {
    try {
      syncExamAssistSelectedNoFromNativeCard();

      const container = _detectNativeAnswerCardContainer();
      if (!container) return;
      const nodes = container.querySelectorAll("button,li,a,div,span");
      const next = new Set();
      for (const el of nodes) {
        if (!el || !el.textContent) continue;
        const no = _extractCardNoFromElement(el);
        if (!no) continue;
        const cls = String(el.className || "");
        const byClass = /active|answered|done|success|finish|right/i.test(cls);
        const byColor = _isGreenLike(el);
        if (byClass || byColor) next.add(no);
      }
      if (next.size) {
        state.examAnsweredNos = next;
        updateExamAssistPanel();
      }
    } catch (_) {}
  }

  function syncExamAssistSelectedNoFromNativeCard() {
    try {
      const typeEl =
        document.querySelector(".topic_title .topic_type") ||
        document.querySelector(".topic_type");
      const typeText = stripHtmlText(typeEl?.textContent || "").trim();
      if (!typeText) return;

      const topicContentEl =
        document.querySelector(".topic_title .topic_content") ||
        document.querySelector(".topic_content");
      const topicText = stripHtmlText(topicContentEl?.textContent || "").trim();
      const m = topicText.match(/\u9898\u76ee\s*[:\uff1a]\s*(\d{1,3})/);
      if (!m) return;
      const sectionNo = Number(m[1]);
      if (!sectionNo) return;

      const answerCard = document.querySelector(".answer-card");
      if (!answerCard) return;

      const subTitles = Array.from(answerCard.querySelectorAll("div.sub-title"));
      const sub = subTitles.find((s) => stripHtmlText(s?.textContent || "").includes(typeText));
      if (!sub) return;

      const scope = sub.parentElement || sub;
      const anchors = Array.from(scope.querySelectorAll("a[id^='number_']"));
      let bestNo = 0;
      for (const a of anchors) {
        const at = stripHtmlText(a?.textContent || "").trim();
        if (String(at) !== String(sectionNo)) continue;
        const aid = String(a?.id || "").trim();
        const mm = aid.match(/^number_(\d{1,3})$/);
        if (mm && mm[1]) {
          bestNo = Number(mm[1]);
          break;
        }
      }
      if (!bestNo) return;

      const prev = Number(state.examAssistSelectedNo || 0);
      if (prev && prev === bestNo) return;
      state.examAssistSelectedNo = bestNo;
      updateExamAssistPanel();
    } catch (_) {}
  }

  function bindNativeAnswerCardSyncOnce() {
    if (state.examCardSyncBound) return;
    state.examCardSyncBound = true;
    document.addEventListener("click", (e) => {
      try {
        const t = e.target;
        if (!t || !t.closest) return;
        const hit = t.closest("button,li,div,a,span");
        if (!hit) return;
        if (hit.closest("#jxjy-exam-assist-panel")) return;
        const cardWrap = hit.closest("[class*='card'],[class*='answer']");
        if (!cardWrap) return;
        const no = _extractCardNoFromElement(hit);
        if (!no) return;
        if (no === Number(state.examAssistSelectedNo || 0)) return;
        state.examAssistSelectedNo = no;
        state.examAnsweredNos.add(no);
        updateExamAssistPanel();
        scheduleAutoFillByNo(no);
      } catch (_) {}
    }, true);
  }

  function createExamAssistPanel() {
    const old = document.querySelector("#jxjy-exam-assist-panel");
    if (old) old.remove();
    const panel = document.createElement("div");
    panel.id = "jxjy-exam-assist-panel";
    panel.innerHTML = `
      <div id="jxjy-exam-assist-header">
        <div style="font-weight:800;">\u8003\u8bd5\u8f85\u52a9\u9762\u677f</div>
        <button id="jxjy-exam-assist-toggle">\u6700\u5c0f\u5316</button>
      </div>
      <div id="jxjy-exam-assist-hint">\u63d0\u793a\uff1a\u6bcf\u9898\u63d0\u4ea4\u95f4\u9694\u5efa\u8bae 3-5 \u79d2\uff0c\u8fc7\u5feb\u53ef\u80fd“\u64cd\u4f5c\u9891\u7e41”\u5bfc\u81f4\u63d0\u4ea4\u5931\u8d25\uff1b\u9898\u5e93\u6682\u65e0\u7b54\u6848\u65f6\uff0c\u4f1a\u81ea\u52a8\u8c03\u7528AI\u8fdb\u884c\u7b54\u9898\uff0c\u6b63\u786e\u738790%\u5de6\u53f3\u3002</div>
      <div id="jxjy-exam-assist-list"></div>
    `;
    document.body.appendChild(panel);
    bindNativeAnswerCardSyncOnce();
    try {
      const p = state.examPendingNotice;
      if (p && p.message) {
        state.examPendingNotice = null;
        setTimeout(() => showExamAssistNotice(p.message, p.ms || 2600), 60);
      }
    } catch (_) {}
    if (state.examAnsweredSyncTimer) {
      clearInterval(state.examAnsweredSyncTimer);
      state.examAnsweredSyncTimer = null;
    }
    state.examAnsweredSyncTimer = setInterval(syncAnsweredNosFromNativeCard, 1200);
    let collapsed = false;
    const toggleBtn = panel.querySelector("#jxjy-exam-assist-toggle");
    const listEl = panel.querySelector("#jxjy-exam-assist-list");
    if (toggleBtn && listEl) {
      toggleBtn.addEventListener("click", () => {
        collapsed = !collapsed;
        listEl.style.display = collapsed ? "none" : "block";
        panel.style.maxHeight = collapsed ? "46px" : "72vh";
        toggleBtn.textContent = collapsed ? "\u5c55\u5f00" : "\u6700\u5c0f\u5316";
      });
    }
    const header = panel.querySelector("#jxjy-exam-assist-header");
    if (header) {
      let dragging = false;
      let sx = 0, sy = 0, sl = 0, st = 0;
      header.addEventListener("mousedown", (e) => {
        if (e.target && e.target.id === "jxjy-exam-assist-toggle") return;
        dragging = true;
        sx = e.clientX; sy = e.clientY;
        const rect = panel.getBoundingClientRect();
        sl = rect.left; st = rect.top;
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        panel.style.left = `${Math.max(0, sl + e.clientX - sx)}px`;
        panel.style.top = `${Math.max(0, st + e.clientY - sy)}px`;
        panel.style.right = "auto";
      });
      document.addEventListener("mouseup", () => { dragging = false; });
    }
    updateExamAssistPanel();
    updateExamDebugPanel();
  }

  function updateExamDebugPanel() {
    const panel = document.querySelector("#jxjy-exam-assist-panel");
    if (!panel) return;
    const box = panel.querySelector("#jxjy-exam-assist-debug");
    if (!box) return;
    const d = state.examDebug || {};
    const route = String(d.route || String(location.hash || "")).slice(0, 220);
    const url = d.lastUrl ? String(d.lastUrl).slice(0, 260) : "\u65e0";
    const lines = [
      `\u8c03\u8bd5\uff08\u8003\u8bd5\u9875\uff09`,
      `cloudTier: ${String(state.cloudTier || "")}`,
      `deepseekEnabled: ${state.deepseekEnabled ? "1" : "0"}`,
      `deepseek(localStorage): ${(() => {
        try {
          return localStorage.getItem(DEEPSEEK_ENABLE_KEY);
        } catch (_) {
          return "err";
        }
      })()}`,
      `route: ${route}`,
      `hook: ${d.hook || "?"}`,
      `capture: ${Number(d.captureCount || 0)}`,
      `url: ${url}`,
      `paperJson: ${d.gotPaperJson}/${Number(d.paperLen || 0)}`,
      `decrypt: ${d.decrypted || "no"}`,
      `questions: ${Number(d.questions || 0)}`,
      d.ai ? `ai: ${String(d.ai).slice(0, 200)}` : "",
      d.aiTried ? `aiTried: ${String(d.aiTried).slice(0, 50)}` : "",
      d.aiStage ? `aiStage: ${String(d.aiStage).slice(0, 80)}` : "",
      d.aiErr ? `aiErr: ${String(d.aiErr).slice(0, 200)}` : "",
      d.lastErr ? `err: ${String(d.lastErr).slice(0, 160)}` : "",
    ].filter(Boolean);
    box.textContent = lines.join("\n");
  }

  function setExamDebug(patch) {
    try {
      state.examDebug = Object.assign({}, state.examDebug || {}, patch || {}, { ts: Date.now() });
    } catch (_) {}
    updateExamDebugPanel();
  }

  function promptFreeQuotaEnded(force = false) {
    const used = Number(state.freeUsedChapters || 0);
    const limit = Number(state.freeChapterLimit || 0);
    if (!force && (limit <= 0 || used < limit)) return;
    if (state.freeQuotaPromptShown) return;
    state.freeQuotaPromptShown = true;
    try {
      const exhaustedKey = freeQuotaExhaustedStorageKey();
      localStorage.setItem(exhaustedKey, "1");
    } catch (_) {}
    const tip = `\u514d\u8d39\u4f53\u9a8c\u5df2\u7ecf\u7ed3\u675f\uff08${used}/${limit}\uff09\uff0c\u8bf7\u5728\u8bbe\u7f6e\u91cc\u9762\u8f93\u5165 Token \u5347\u7ea7 Pro \u540e\u7ee7\u7eed\u3002`;
    const freeEl = document.querySelector("#jxjy-cloud-free");
    showPanelNotice(tip, "warn", true, 8000, freeEl);
    const panel = document.querySelector("#jxjy-auto-panel");
    if (panel) {
      const btn = panel.querySelector(".jxjy-tab-btn[data-tab='course']");
      if (btn) btn.click();
    }
  }

  function updateCloudPanelUI() {
    const tierEl = document.querySelector("#jxjy-cloud-tier");
    const freeLabelEl = document.querySelector("#jxjy-cloud-free-label");
    const freeEl = document.querySelector("#jxjy-cloud-free");
    const authEl = document.querySelector("#jxjy-auth-status");
    const tokenInput = document.querySelector("#jxjy-cloud-token");
    if (tierEl) {
      tierEl.textContent = state.cloudTier || "unknown";
      tierEl.style.color = state.cloudRevoked ? "#dc2626" : "#0f172a";
      tierEl.style.fontWeight = state.cloudRevoked ? "800" : "700";
    }
    if (state.cloudRevoked) {
      if (freeLabelEl) freeLabelEl.textContent = "\u6388\u6743\u72b6\u6001";
      if (freeEl) freeEl.textContent = "Token\u5df2\u7981\u7528";
      if (authEl) {
        authEl.textContent = "Token\u5df2\u7981\u7528";
        authEl.style.color = "#dc2626";
        authEl.style.fontWeight = "900";
      }
    } else if (String(state.cloudTier || "").toLowerCase() === "pro") {
      if (freeLabelEl) freeLabelEl.textContent = "Pro\u5230\u671f";
      if (freeEl) freeEl.textContent = formatLeaseExpireText(state.cloudProExpireAt || state.cloudLeaseExp);
      if (authEl) {
        authEl.textContent = `Pro\u53ef\u7528\uff08${formatLeaseExpireText(state.cloudProExpireAt || state.cloudLeaseExp)}\uff09`;
        authEl.style.color = "#059669";
        authEl.style.fontWeight = "900";
      }
    } else {
      if (freeLabelEl) freeLabelEl.textContent = "\u514d\u8d39\u4f53\u9a8c\u7ae0\u8282";
      if (freeEl) freeEl.textContent = `${state.freeUsedChapters}/${state.freeChapterLimit}`;
      if (authEl) {
        authEl.textContent = "\u514d\u8d39\u4f53\u9a8c";
        authEl.style.color = "#0f172a";
        authEl.style.fontWeight = "800";
      }
    }
    if (tokenInput && tokenInput !== document.activeElement) tokenInput.value = state.cloudToken || "";
    syncRunButtons();
    if (Number(state.freeUsedChapters || 0) < Number(state.freeChapterLimit || 0)) {
      state.freeQuotaPromptShown = false;
      const exhaustedKey = freeQuotaExhaustedStorageKey();
      try { localStorage.removeItem(exhaustedKey); } catch (_) {}
    }
    if (Number(state.freeUsedChapters || 0) >= Number(state.freeChapterLimit || 0) && state.cloudTier !== "pro") {
      promptFreeQuotaEnded(false);
    }
    setDeepseekEnabled(state.deepseekEnabled);
    try { applyUiByRoute(); } catch (_) {}
  }

  function updateQueueSummary() {
    const count = state.courseQueue.length;
    const countEl = document.querySelector("#jxjy-queue-count");
    const textEl = document.querySelector("#jxjy-queue-text");
    const pctEl = document.querySelector("#jxjy-queue-percent");
    const barEl = document.querySelector("#jxjy-queue-progress");
    const chapterTotal = Math.max(0, Number(state.runChapterTotal || 0));
    const chapterDone = Math.max(0, Math.min(chapterTotal, Number(state.runChapterDone || 0)));
    const hwTotal = Math.max(0, Number(state.homeworkTotalAssignments || 0));
    const hwDone = Math.max(0, Math.min(hwTotal, Number(state.homeworkDoneAssignments || 0)));
    const useHomework = !!state.inHomeworkPhase && hwTotal > 0;
    if (countEl) countEl.textContent = String(useHomework ? hwDone : chapterDone);
    const totalEl = document.querySelector("#jxjy-queue-total");
    if (totalEl) totalEl.textContent = String(useHomework ? hwTotal : chapterTotal);
    if (textEl) {
      textEl.textContent = useHomework
        ? `\u4f5c\u4e1a\u8fdb\u5ea6 ${hwDone}/${hwTotal}\uff08\u5269\u4f59\u8bfe\u7a0b ${count}\uff09`
        : (chapterTotal > 0
          ? `\u7ae0\u8282\u8fdb\u5ea6 ${chapterDone}/${chapterTotal}\uff08\u5269\u4f59\u8bfe\u7a0b ${count}\uff09`
          : "\u672a\u9009\u62e9");
    }
    const pct = useHomework
      ? (hwTotal > 0 ? Math.max(0, Math.min(100, Math.round((hwDone / hwTotal) * 100))) : 0)
      : (chapterTotal > 0 ? Math.max(0, Math.min(100, Math.round((chapterDone / chapterTotal) * 100))) : 0);
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  let jxjyPanelLogDedupeBody = "";
  let jxjyPanelLogDedupeAt = 0;

  function pushPanelLog(text) {
    const box = document.querySelector("#jxjy-run-log");
    if (!box) return;
    const empty = box.querySelector(".jxjy-empty-state");
    if (empty) empty.remove();
    const raw = String(text || "");
    const bodyNorm = raw.replace(/^\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]\s*(?:\[DBG\]\s*)?/, "").trim();
    const nowDedupe = Date.now();
    if (bodyNorm && bodyNorm === jxjyPanelLogDedupeBody && nowDedupe - jxjyPanelLogDedupeAt < 3500) return;
    jxjyPanelLogDedupeBody = bodyNorm;
    jxjyPanelLogDedupeAt = nowDedupe;
    const classify = (s) => {
      if (/❌|\u5931\u8d25|\u5f02\u5e38|\u9519\u8bef/.test(s)) return "error";
      if (/⚠️|\u8b66\u544a/.test(s)) return "warn";
      return "info";
    };
    const level = classify(raw);
    const m = raw.match(/^\[([0-9]{2}:[0-9]{2}:[0-9]{2})\]\s*(.*)$/s);
    const ts = m ? m[1] : "";
    const msg = m ? m[2] : raw;
    const esc = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const studyNoRefreshHint = "\uff08\u8bf7\u52ff\u5237\u65b0\u9875\u9762\uff0c\u4ee5\u514d\u4e2d\u65ad\u8fdb\u5ea6\uff09";
    let escapedMsg = esc(msg);
    const hintIdx = msg.indexOf(studyNoRefreshHint);
    if (hintIdx >= 0) {
      escapedMsg = `${esc(msg.slice(0, hintIdx))}<span class="jxjy-log-study-hint">${esc(studyNoRefreshHint)}</span>`;
    }
    const escapedTs = ts ? esc(`[${ts}]`) : "";
    const row = document.createElement("div");
    row.className = "jxjy-log-row";
    row.dataset.level = level;
    row.classList.add(level === "error" ? "jxjy-log-error" : level === "warn" ? "jxjy-log-warn" : "jxjy-log-info");
    row.innerHTML = escapedTs ? `<span class="jxjy-log-ts">${escapedTs}</span>${escapedMsg}` : escapedMsg;
    box.prepend(row);
    applyRunLogFilter();
  }

  function applyRunLogFilter() {
    const box = document.querySelector("#jxjy-run-log");
    if (!box) return;
    const filter = String(state.runLogFilter || "all");
    const verbose = isRuntimeVerbose();
    const rows = Array.from(box.querySelectorAll(".jxjy-log-row"));
    for (const row of rows) {
      const level = String(row.dataset.level || "info");
      let show = true;
      if (!verbose) {
        if (filter === "error") show = level === "error";
        else if (filter === "info") show = level !== "error";
      }
      if (show) row.style.display = "";
      else row.style.display = "none";
    }
  }

  function ensurePanelStyles() {
    const id = "jxjy-panel-style-v2";
    if (document.getElementById(id) || !document.head) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      #jxjy-auto-panel{position:fixed;right:20px;top:80px;z-index:999999;width:420px;background:#f4f7fb;border:1px solid #dbe4f0;border-radius:18px;box-shadow:0 18px 44px rgba(15,23,42,.18);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;color:#0f172a;overflow:hidden;}
      #jxjy-panel-header{padding:10px 12px;background:linear-gradient(180deg,#f8ecd5,#f4e8cf);border-bottom:1px solid #e5dbc6;display:flex;justify-content:space-between;align-items:center;cursor:move;}
      #jxjy-panel-brand{display:flex;align-items:center;gap:10px;}
      #jxjy-panel-logo{width:34px;height:34px;border-radius:10px;object-fit:cover;box-shadow:0 2px 10px rgba(15,23,42,.12);border:1px solid rgba(148,163,184,.45);background:#fff;}
      #jxjy-panel-title{font-size:16px;font-weight:900;color:#b45309;line-height:1.2;display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;}
      #jxjy-panel-sub{font-size:12px;color:#475569;margin-top:1px;}
      .jxjy-panel-version{
        font-size:11px;font-weight:900;color:#64748b;
        margin-top:0;
        display:inline-flex;align-items:center;gap:6px;
        padding:2px 8px;border-radius:999px;
        background:#f1f5f9;border:1px solid #e2e8f0;
        max-width:100%;
      }
      #jxjy-toggle{border:none;background:#fff;color:#64748b;width:30px;height:30px;border-radius:999px;cursor:pointer;box-shadow:0 1px 2px rgba(15,23,42,.1);}
      #jxjy-panel-body{padding:9px;position:relative;}
      .jxjy-card{background:#fff;border:1px solid #d9e2ee;border-radius:14px;padding:9px 10px;margin-bottom:9px;}
      .jxjy-progress-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:12px;color:#334155;}
      .jxjy-progress-num{font-size:28px;font-weight:900;color:#0f172a;}
      .jxjy-progress-num small{font-size:16px;color:#64748b;}
      .jxjy-progress-pct{font-size:22px;font-weight:900;color:#0369a1;}
      .jxjy-progress-bar{height:10px;border-radius:999px;background:#e2e8f0;overflow:hidden;}
      .jxjy-progress-bar > span{display:block;height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#2563eb);transition:width .2s ease;}
      .jxjy-meta-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;margin-bottom:5px;}
      .jxjy-meta-label{color:#64748b;}
      .jxjy-meta-value{font-weight:700;color:#0f172a;text-align:right;}
      .jxjy-btn-row{display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap;}
      .jxjy-btn-row-nowrap{flex-wrap:nowrap;}
      .jxjy-card-actions .jxjy-btn-row{margin-bottom:0;}
      .jxjy-study-mode-bar{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:nowrap;}
      .jxjy-study-mode-label{flex:0 0 auto;font-size:12px;font-weight:800;color:#475569;white-space:nowrap;}
      .jxjy-study-mode-select{flex:1 1 auto;min-width:0;max-width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:7px 8px;font-size:12px;font-weight:700;color:#0f172a;background:#f8fafc;cursor:pointer;}
      .jxjy-study-mode-select:disabled{cursor:not-allowed;opacity:.65;}
      .jxjy-study-mode-hint-box{margin:0 0 10px 0;padding:11px 12px;border-radius:12px;border:2px solid transparent;box-shadow:0 6px 22px rgba(15,23,42,.14);}
      .jxjy-study-mode-hint-efficiency{background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 45%,#6ee7b7 160%);border-color:#10b981;color:#064e3b;}
      .jxjy-study-mode-hint-realtime{background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 45%,#fcd34d 160%);border-color:#f59e0b;color:#78350f;}
      .jxjy-study-mode-hint-header{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px;}
      .jxjy-study-mode-hint-badge{flex:0 0 auto;font-size:10px;font-weight:900;letter-spacing:.03em;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.82);border:1px solid rgba(15,23,42,.12);color:inherit;box-shadow:0 1px 2px rgba(0,0,0,.06);}
      .jxjy-study-mode-hint-title{font-size:13px;font-weight:900;color:inherit;line-height:1.25;}
      .jxjy-study-mode-hint-body{margin:0;font-size:12px;line-height:1.58;font-weight:800;color:inherit;text-shadow:0 1px 0 rgba(255,255,255,.35);}
      .jxjy-study-mode-hint--hidden{display:none !important;margin:0 !important;padding:0 !important;border:none !important;box-shadow:none !important;}
      .jxjy-btn-action{min-width:0 !important;flex:1 1 0 !important;}
      .jxjy-btn{flex:1;border:none;color:#fff;padding:8px 10px;border-radius:11px;cursor:pointer;font-weight:800;min-width:84px;}
      .jxjy-btn-ghost{flex:0 0 auto;border:1px solid rgba(148,163,184,.45);background:#fff;color:#0f172a;}
      .jxjy-btn:hover{filter:brightness(1.04);}
      .jxjy-btn{transition:transform .15s ease, filter .15s ease, opacity .15s ease;}
      .jxjy-btn:disabled{filter:saturate(.92) grayscale(.08);opacity:.55;cursor:not-allowed;transform:none !important;}
      .jxjy-btn-refresh{background:#64748b;}
      .jxjy-btn-start{background:#16a34a;}
      .jxjy-btn-stop{background:#ef4444;}
      .jxjy-btn-face{background:#0284c7;}
      .jxjy-btn-pro{flex:0 0 auto;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border:none;box-shadow:0 4px 12px rgba(239,68,68,.25);}
      .jxjy-btn-pro:hover{filter:brightness(1.06);}
      #jxjy-course-list,#jxjy-chapter-preview,#jxjy-run-log{max-height:170px;overflow-y:auto;background:#f8fafc;border:1px solid #dbe4f0;border-radius:12px;padding:6px;}
      #jxjy-run-log{max-height:150px;}
      .jxjy-tabbar{display:flex;gap:8px;margin-bottom:10px;}
      .jxjy-tab-btn{flex:1;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;padding:6px 8px;border-radius:10px;cursor:pointer;font-weight:700;font-size:12px;}
      .jxjy-tab-btn.active{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(30,64,175,.25);}
      .jxjy-pane{display:none;}
      .jxjy-pane.active{display:block;}
      .jxjy-list-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
      .jxjy-list-title{font-size:12px;color:#64748b;font-weight:700;}
      .jxjy-list-tag{font-size:11px;color:#92400e;background:#ffedd5;border:1px solid #fdba74;border-radius:999px;padding:2px 8px;}
      .jxjy-auth-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:999px;font-weight:900;font-size:11px;border:1px solid rgba(148,163,184,.45);white-space:nowrap;text-align:center;}
      #jxjy-auto-status{padding:5px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.45);font-weight:900;font-size:12px;background:#fff;}
      #jxjy-auto-status.jxjy-status-running{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.45);color:#059669;}
      #jxjy-auto-status.jxjy-status-starting{background:rgba(14,165,233,.12);border-color:rgba(14,165,233,.45);color:#0369a1;}
      #jxjy-auto-status.jxjy-status-stopped{background:rgba(100,116,139,.10);border-color:rgba(148,163,184,.45);color:#475569;}
      #jxjy-auto-status.jxjy-status-error{background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.45);color:#dc2626;}

      .jxjy-face-dot{width:8px;height:8px;border-radius:999px;background:#94a3b8;display:inline-block;margin-right:6px;vertical-align:middle;}
      .jxjy-face-dot.on{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18);}
      .jxjy-face-dot.wait{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.16);}
      .jxjy-face-dot.off{background:#94a3b8;}
      .jxjy-face-dot.err{background:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.16);}
      .jxjy-btn-ico{font-size:14px;line-height:1;display:inline-flex;align-items:center;margin-right:6px;transform:translateY(1px);}
      .jxjy-btn-label{white-space:nowrap;}

      .jxjy-course-item{display:flex;gap:8px;align-items:center;background:linear-gradient(180deg,#ffffff,#f8fbff);border:1px solid #dbe4f0;border-radius:11px;padding:8px 9px;margin-bottom:6px;font-size:13px;box-shadow:0 1px 0 rgba(148,163,184,.15);}
      .jxjy-course-item input{accent-color:#2563eb;}
      .jxjy-course-card{
        display:flex;align-items:center;justify-content:space-between;gap:10px;
        background:linear-gradient(180deg,#ffffff,#f8fbff);
        border:1px solid #dbe4f0;border-radius:12px;padding:10px 10px;margin-bottom:8px;
        cursor:pointer;transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease;
      }
      .jxjy-course-card:hover{border-color:#93c5fd;box-shadow:0 10px 22px rgba(30,64,175,.10);transform:translateY(-1px);}
      .jxjy-course-card.selected{border-color:#2563eb;box-shadow:0 14px 34px rgba(37,99,235,.16);}
      .jxjy-course-card-left{display:flex;gap:10px;align-items:center;min-width:0;flex:1;}
      .jxjy-course-card-title{font-size:13px;font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .jxjy-course-card-badges{display:flex;gap:6px;align-items:center;flex:0 0 auto;flex-wrap:nowrap;justify-content:flex-end;max-width:none;}
      .jxjy-course-badge{font-size:10px;font-weight:900;border-radius:999px;padding:2px 6px;border:1px solid rgba(148,163,184,.35);color:#334155;background:#fff;white-space:nowrap;}
      .jxjy-course-badge.done{color:#059669;background:rgba(16,185,129,.10);border-color:rgba(16,185,129,.45);}
      .jxjy-course-badge.todo{color:#0369a1;background:rgba(14,165,233,.10);border-color:rgba(14,165,233,.45);}

      .jxjy-chapter-course{margin-bottom:8px;border:1px solid #dbe4f0;border-radius:10px;background:#fff;}
      .jxjy-chapter-title{padding:7px 10px;background:#eaf1ff;border-bottom:1px solid #dbe4f0;color:#1d4ed8;font-size:12px;font-weight:700;}
      .jxjy-chapter-item{padding:5px 10px;font-size:12px;color:#334155;display:flex;justify-content:space-between;gap:8px;}
      .jxjy-dot{font-weight:700;}
      .jxjy-log-row{padding:4px 6px;border-bottom:1px dashed #d4deea;color:#334155;font-size:12px;line-height:1.45;white-space:pre-wrap;word-break:break-word;}
      .jxjy-log-row.jxjy-log-error{color:#dc2626;}
      .jxjy-log-row.jxjy-log-warn{color:#92400e;}
      .jxjy-log-row.jxjy-log-info{color:#0f172a;}
      .jxjy-log-ts{font-weight:900;color:#64748b;margin-right:6px;}
      .jxjy-log-study-hint{display:inline-block;margin:2px 0 0 4px;padding:3px 8px;border-radius:8px;background:linear-gradient(180deg,#fffbeb,#fef3c7);color:#b45309;font-weight:800;font-size:11px;line-height:1.35;border:1px solid #fbbf24;box-shadow:0 1px 2px rgba(180,83,9,.12);vertical-align:middle;}
      .jxjy-log-filter-btn{border:1px solid rgba(148,163,184,.45);background:#fff;color:#0f172a;padding:4px 10px;border-radius:999px;cursor:pointer;font-size:11px;font-weight:900;}
      .jxjy-log-filter-btn-active{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);border-color:transparent;color:#fff;}

      .jxjy-toggle-on{background:linear-gradient(135deg,#1d4ed8,#0ea5e9) !important;border-color:transparent !important;color:#fff !important;}
      .jxjy-empty-state{padding:14px 8px;text-align:center;color:#94a3b8;font-size:12px;font-weight:900;}
      .jxjy-settings-group{background:#f8fafc;border:1px solid #dbe4f0;border-radius:14px;padding:10px 10px;margin-bottom:10px;}
      .jxjy-settings-title{font-size:12px;color:#64748b;font-weight:900;margin-bottom:8px;}
      .jxjy-btn-running{box-shadow:0 10px 22px rgba(34,197,94,.24);transform:translateY(-1px) !important;}
      .jxjy-btn-starting{box-shadow:0 10px 22px rgba(14,165,233,.22);animation:jxjyPulse 1.1s infinite ease-in-out;}
      .jxjy-btn-stopped{box-shadow:0 10px 22px rgba(239,68,68,.18);}
      @keyframes jxjyPulse{0%{filter:brightness(1);}50%{filter:brightness(1.08);}100%{filter:brightness(1);}}

      #jxjy-cloud-toast{display:none;position:absolute;top:8px;right:8px;max-width:320px;padding:10px 12px;border-radius:14px;font-size:12px;font-weight:800;line-height:1.45;border:1px solid transparent;box-shadow:0 12px 26px rgba(15,23,42,.18);backdrop-filter:saturate(1.2) blur(6px);transform:translateY(-6px);opacity:0;transition:transform .18s ease, opacity .18s ease;z-index:999999;pointer-events:auto;}
      #jxjy-cloud-toast.jxjy-toast-show{transform:translateY(0);opacity:1;}
      #jxjy-cloud-toast.jxjy-toast-hide{transform:translateY(-6px);opacity:0;}
      #jxjy-cloud-toast .jxjy-toast-text{font-weight:800;}
      #jxjy-cloud-toast .jxjy-toast-close{position:absolute;top:6px;right:8px;border:none;background:transparent;color:inherit;cursor:pointer;font-size:14px;line-height:1;padding:2px 4px;opacity:.7;}
      #jxjy-cloud-toast .jxjy-toast-close:hover{opacity:1;}
      .jxjy-toast-warn{background:rgba(255,247,237,.96);color:#9a3412;border-color:#fdba74;}
      .jxjy-toast-error{background:rgba(254,242,242,.96);color:#991b1b;border-color:#fca5a5;}
      .jxjy-toast-info{background:rgba(239,246,255,.96);color:#1d4ed8;border-color:#93c5fd;}
      .jxjy-toast-success{background:rgba(16,185,129,.96);color:#fff;border-color:rgba(5,150,105,.9);}
      #jxjy-exam-page-toast{
        position:fixed;top:12px;right:12px;z-index:9999999;
        max-width:360px;padding:10px 12px;border-radius:14px;
        font-size:12px;font-weight:800;line-height:1.45;
        border:1px solid transparent;box-shadow:0 12px 26px rgba(15,23,42,.18);
        backdrop-filter:saturate(1.2) blur(6px);
        transform:translateY(-6px);opacity:0;
        transition:transform .18s ease, opacity .18s ease;
        pointer-events:auto;
      }
      #jxjy-exam-page-toast.show{transform:translateY(0);opacity:1;}
      #jxjy-exam-page-toast.hide{transform:translateY(-6px);opacity:0;}
      .jxjy-footer-extra{padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;opacity:.92;}
      .jxjy-qq-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;}
      .jxjy-qq-text{font-size:12px;color:#475569;}
      .jxjy-qq-title{font-size:13px;font-weight:800;color:#0f172a;}
      .jxjy-qq-btn{border:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:6px 14px;border-radius:999px;font-weight:800;cursor:pointer;}
      .jxjy-ann{position:relative;font-size:12px;color:#334155;line-height:1.5;background:linear-gradient(180deg,#fffdf5,#fff7e6);border:1px solid #fcd34d;border-radius:12px;padding:10px 10px 10px 12px;}
      .jxjy-ann::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#f59e0b,#ef4444);border-top-left-radius:12px;border-bottom-left-radius:12px;}
      .jxjy-ann-title{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:900;color:#9a3412;margin-bottom:4px;}
      .jxjy-ann-text{display:block;}
      #jxjy-vip-modal{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:1000001;display:none;align-items:center;justify-content:center;padding:20px;}
      .jxjy-vip-card{width:min(560px,92vw);max-height:88vh;overflow:auto;background:#fff;border-radius:18px;border:1px solid #dbe4f0;box-shadow:0 18px 46px rgba(15,23,42,.25);padding:16px;}
      .jxjy-vip-title{font-size:26px;font-weight:900;color:#0f172a;}
      .jxjy-vip-sub{font-size:13px;color:#64748b;margin-top:4px;}
      .jxjy-vip-sec{margin-top:12px;border:1px solid #dbe4f0;border-radius:12px;padding:12px;background:#f8fafc;}
      .jxjy-vip-sec h4{margin:0 0 8px;font-size:15px;color:#0f172a;}
      .jxjy-vip-sec p{margin:4px 0;font-size:13px;color:#334155;}
      .jxjy-vip-sec ul{margin:6px 0 0 18px;padding:0;}
      .jxjy-vip-sec li{margin:4px 0;font-size:13px;color:#334155;}
      .jxjy-vip-buy{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
      .jxjy-vip-buy .muted{color:#64748b;font-size:12px;line-height:1.5;}
      .jxjy-vip-buy a{display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;font-weight:800;text-decoration:none;align-self:flex-start;}
      .jxjy-vip-buy a:hover{filter:brightness(1.05);}
      .jxjy-vip-warn{margin-top:8px;background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:8px 10px;font-size:13px;color:#92400e;font-weight:700;}
      .jxjy-vip-actions{margin-top:14px;display:flex;justify-content:flex-end;}
      .jxjy-vip-close{border:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;}
      #jxjy-panel-footer{padding:8px 12px;background:#eef2f7;border-top:1px solid #dbe4f0;color:#334155;font-size:12px;}
      .jxjy-face-tip{display:none;}
      #jxjy-exam-assist-panel{position:fixed;right:450px;top:90px;z-index:999998;width:560px;max-height:94vh;background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);border:1px solid #cfe1ff;border-radius:16px;box-shadow:0 18px 44px rgba(15,23,42,.20),0 2px 10px rgba(30,64,175,.08);overflow:hidden;backdrop-filter:blur(2px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;}
      #jxjy-exam-assist-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(135deg,#1e40af,#0284c7);border-bottom:1px solid rgba(191,219,254,.5);cursor:move;font-size:16px;color:#fff;}
      #jxjy-exam-assist-header > div{letter-spacing:.3px;}
      #jxjy-exam-assist-toggle{border:1px solid rgba(191,219,254,.65);background:rgba(255,255,255,.92);color:#1d4ed8;border-radius:10px;padding:5px 11px;cursor:pointer;font-size:13px;font-weight:700;box-shadow:0 2px 6px rgba(30,64,175,.15);}
      #jxjy-exam-assist-hint{padding:10px 12px;border-bottom:1px solid #e2e8f0;background:linear-gradient(180deg,#fff7e6,#fffbeb);color:#9a3412;font-size:14px;line-height:1.6;}
      #jxjy-exam-assist-list{max-height:calc(94vh - 42px);overflow:auto;padding:10px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);}
      #jxjy-exam-assist-list::-webkit-scrollbar{width:8px;}
      #jxjy-exam-assist-list::-webkit-scrollbar-thumb{background:#c7d2fe;border-radius:10px;}
      #jxjy-exam-assist-list::-webkit-scrollbar-track{background:transparent;}
      #jxjy-exam-assist-notice{position:absolute;right:10px;bottom:10px;max-width:280px;background:rgba(16,185,129,.96);color:#fff;border:1px solid rgba(5,150,105,.9);border-radius:10px;padding:8px 10px;font-size:12px;font-weight:800;line-height:1.4;box-shadow:0 10px 26px rgba(5,150,105,.35);opacity:0;transform:translateY(8px);transition:all .18s ease;pointer-events:none;z-index:9;}
      #jxjy-exam-assist-notice.show{opacity:1;transform:translateY(0);}
      .jxjy-exam-empty{font-size:15px;color:#64748b;padding:12px;text-align:center;}
      .jxjy-exam-detail{padding:12px;border:1px solid #dbe4f0;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f8fbff);min-height:140px;box-shadow:0 8px 20px rgba(15,23,42,.08);transition:box-shadow .2s ease, transform .2s ease;}
      .jxjy-exam-detail:hover{box-shadow:0 12px 26px rgba(30,64,175,.14);transform:translateY(-1px);}
      .jxjy-exam-detail-title{font-size:15px;font-weight:900;color:#0f172a;margin-bottom:6px;display:flex;align-items:center;gap:6px;}
      .jxjy-exam-detail-q{font-size:16px;line-height:1.55;color:#334155;white-space:pre-wrap;word-break:break-word;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:8px 10px;}
      .jxjy-exam-detail-a{font-size:16px;line-height:1.55;color:#166534;background:linear-gradient(180deg,#f0fdf4,#ecfdf5);border:1px solid #86efac;border-radius:10px;padding:8px 10px;white-space:pre-wrap;word-break:break-word;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);}
      .jxjy-exam-detail-a .jxjy-ans-key{display:inline-block;min-width:18px;text-align:center;font-weight:900;color:#1d4ed8;background:#dbeafe;border:1px solid #93c5fd;border-radius:6px;padding:0 4px;margin-right:2px;}
      .jxjy-exam-detail-a .jxjy-ans-sep{color:#1d4ed8;font-weight:900;margin-right:2px;}
      .jxjy-force-picked{box-shadow:inset 0 0 0 999px rgba(34,197,94,.10) !important;border-radius:6px !important;}
    `;
    document.head.appendChild(style);
  }

  function setCurrentCourse(title) {
    state.currentCourseTitle = title || "\u65e0";
    const el = document.querySelector("#jxjy-current-course");
    if (el) el.textContent = state.currentCourseTitle;
  }

  function setCurrentResource(title) {
    state.currentResourceTitle = title || "\u65e0";
    const el = document.querySelector("#jxjy-current-resource");
    if (el) el.textContent = state.currentResourceTitle;
  }

  function setCurrentHomework(title) {
    state.currentHomeworkTitle = title || "\u65e0";
    const el = document.querySelector("#jxjy-current-homework");
    if (el) el.textContent = state.currentHomeworkTitle;
  }

  function setHomeworkProgress(cur, total) {
    const c = Math.max(0, Number(cur || 0));
    const t = Math.max(0, Number(total || 0));
    state.homeworkProgressText = `${c}/${t}`;
    const el = document.querySelector("#jxjy-homework-progress");
    if (el) el.textContent = state.homeworkProgressText;
  }

  function setAutoHomeworkEnabled(enabled) {
    state.autoHomeworkEnabled = !!enabled;
    localStorage.setItem(HOMEWORK_AUTO_KEY, state.autoHomeworkEnabled ? "1" : "0");
    const btn = document.querySelector("#jxjy-toggle-homework");
    if (btn) {
      const label = btn.querySelector(".jxjy-btn-label");
      if (label) label.textContent = state.autoHomeworkEnabled ? "\u5904\u7406\u4f5c\u4e1a\uff1a\u5f00" : "\u5904\u7406\u4f5c\u4e1a\uff1a\u5173";
      else btn.textContent = state.autoHomeworkEnabled ? "\u5904\u7406\u4f5c\u4e1a\uff1a\u5f00" : "\u5904\u7406\u4f5c\u4e1a\uff1a\u5173";
      btn.classList.toggle("jxjy-toggle-on", state.autoHomeworkEnabled);
      btn.classList.toggle("jxjy-btn-ghost", !state.autoHomeworkEnabled);
      btn.style.borderColor = state.autoHomeworkEnabled ? "rgba(14,165,233,.55)" : "rgba(148,163,184,.55)";
      btn.style.color = state.autoHomeworkEnabled ? "#0369a1" : "#64748b";
      btn.title = state.autoHomeworkEnabled ? "\u5f00\u542f\uff1a\u81ea\u52a8\u5904\u7406\u4f5c\u4e1a\u9636\u6bb5" : "\u5173\u95ed\uff1a\u8df3\u8fc7\u4f5c\u4e1a\u9636\u6bb5";
    }
  }

  function setAutoExamEnabled(enabled) {
    state.autoExamEnabled = !!enabled;
    localStorage.setItem(EXAM_AUTO_KEY, state.autoExamEnabled ? "1" : "0");
    const btn = document.querySelector("#jxjy-toggle-exam");
    if (btn) {
      const label = btn.querySelector(".jxjy-btn-label");
      if (label) label.textContent = state.autoExamEnabled ? "\u8003\u8bd5\u8f85\u52a9\uff1a\u5f00" : "\u8003\u8bd5\u8f85\u52a9\uff1a\u5173";
      else btn.textContent = state.autoExamEnabled ? "\u8003\u8bd5\u8f85\u52a9\uff1a\u5f00" : "\u8003\u8bd5\u8f85\u52a9\uff1a\u5173";
      btn.classList.toggle("jxjy-toggle-on", state.autoExamEnabled);
      btn.classList.toggle("jxjy-btn-ghost", !state.autoExamEnabled);
      btn.style.borderColor = state.autoExamEnabled ? "rgba(14,165,233,.55)" : "rgba(148,163,184,.55)";
      btn.style.color = state.autoExamEnabled ? "#0369a1" : "#64748b";
      btn.title = state.autoExamEnabled ? "\u5f00\u542f\uff1a\u8003\u8bd5\u9898\u5e93\u65e0\u7b54\u6848\u65f6\u53ef\u8fdb\u884c\u8f85\u52a9" : "\u5173\u95ed\uff1a\u4ec5\u4f7f\u7528\u9898\u5e93\u7b54\u6848";
    }
  }

  function setDeepseekEnabled(enabled) {
    const isPro = String(state.cloudTier || "").toLowerCase() === "pro";
    state.deepseekEnabled = !!enabled;
    localStorage.setItem(DEEPSEEK_ENABLE_KEY, state.deepseekEnabled ? "1" : "0");
    if (!isPro && enabled) {
      const btn = document.querySelector("#jxjy-toggle-deepseek");
      showPanelNotice("\u5f53\u524d\u672a\u68c0\u6d4b\u5230 Pro\uff0c\u8003\u8bd5AI \u7b54\u9898\u529f\u80fd\u5c06\u5728\u5347\u7ea7\u4e3aPro\u540e\u81ea\u52a8\u751f\u6548\u3002", "warn", false, 2800, btn);
    }
    const btn = document.querySelector("#jxjy-toggle-deepseek");
    if (btn) {
      if (!isPro) {
        const label = btn.querySelector(".jxjy-btn-label");
        if (label) label.textContent = state.deepseekEnabled ? "AI\u641c\u9898\uff1a\u5f00(\u9700 Pro)" : "AI\u641c\u9898\uff1a\u5173(\u9700 Pro)";
        else btn.textContent = state.deepseekEnabled ? "AI\u641c\u9898\uff1a\u5f00" : "AI\u641c\u9898\uff1a\u5173";
      } else {
        const label = btn.querySelector(".jxjy-btn-label");
        if (label) label.textContent = state.deepseekEnabled ? "AI\u641c\u9898\uff1a\u5f00" : "AI\u641c\u9898\uff1a\u5173";
        else btn.textContent = state.deepseekEnabled ? "AI\u641c\u9898\uff1a\u5f00" : "AI\u641c\u9898\uff1a\u5173";
      }
      btn.classList.toggle("jxjy-toggle-on", state.deepseekEnabled && isPro);
      btn.classList.toggle("jxjy-btn-ghost", !state.deepseekEnabled || !isPro);
      const showEnabledColor = state.deepseekEnabled && isPro;
      btn.style.borderColor = showEnabledColor ? "rgba(14,165,233,.55)" : "rgba(148,163,184,.55)";
      btn.style.color = showEnabledColor ? "#0369a1" : "#64748b";
      btn.disabled = !isPro;
      btn.style.opacity = !isPro ? "0.6" : "";
      btn.style.cursor = !isPro ? "not-allowed" : "";
      btn.title = !isPro ? "\u4ec5 Pro \u7528\u6237\u53ef\u4f7f\u7528 AI \u641c\u9898" : "\u5f00\u542f\uff1a\u9898\u5e93\u65e0\u7b54\u6848\u65f6\u8c03\u7528 DeepSeek AI";
    }
  }

  function isRealtimeStudyMode() {
    try {
      return String(localStorage.getItem(STUDY_MODE_KEY) || "efficiency") === "realtime";
    } catch (_) {
      return false;
    }
  }

  function setStudyMode(mode) {
    const m = String(mode || "").toLowerCase() === "realtime" ? "realtime" : "efficiency";
    try {
      localStorage.setItem(STUDY_MODE_KEY, m);
    } catch (_) {}
    state.studyMode = m;
    const sel = document.querySelector("#jxjy-study-mode");
    if (sel) sel.value = m;
    syncStudyModeHint(m, { reveal: true });
  }

  function syncStudyModeSelect() {
    const sel = document.querySelector("#jxjy-study-mode");
    const m = isRealtimeStudyMode() ? "realtime" : "efficiency";
    if (sel) sel.value = m;
    syncStudyModeHint(m, { reveal: false });
  }

  function syncStudyModeHint(mode, opts) {
    const reveal = !!(opts && opts.reveal);
    const box = document.querySelector("#jxjy-study-mode-hint");
    if (!box) return;
    const m = String(mode || "").toLowerCase() === "realtime" ? "realtime" : "efficiency";
    const rt = m === "realtime";
    box.classList.remove("jxjy-study-mode-hint-efficiency", "jxjy-study-mode-hint-realtime");
    box.classList.add(rt ? "jxjy-study-mode-hint-realtime" : "jxjy-study-mode-hint-efficiency");
    const badge = box.querySelector(".jxjy-study-mode-hint-badge");
    const titleEl = box.querySelector(".jxjy-study-mode-hint-title");
    const bodyEl = box.querySelector(".jxjy-study-mode-hint-body");
    if (rt) {
      if (badge) badge.textContent = "1:1 \u771f\u5b9e\u8fdb\u5ea6";
      if (titleEl) titleEl.textContent = "\u8d85\u5b89\u51681:1\u65f6\u957f\u6a21\u5f0f";
      if (bodyEl) {
        bodyEl.textContent =
          "\u5b8c\u5168\u6a21\u62df\u771f\u5b9e\u89c2\u770b\u8fdb\u5ea6\uff0c1:1\u5b66\u4e60\u89c6\u9891\u8bfe\u7a0b\u603b\u65f6\u957f\uff0c\u901f\u5ea6\u7a0d\u6162\uff01\u8bfe\u4ef6\u65f6\u957f\u591a\u5c11\u5206\u949f\u5c31\u5f97\u5b66\u4e60\u591a\u5c11\u5206\u949f\u624d\u5b8c\u6210";
      }
    } else {
      if (badge) badge.textContent = "\u9ed8\u8ba4\u63a8\u8350";
      if (titleEl) titleEl.textContent = "\u5b89\u5168\u6548\u7387\u6a21\u5f0f";
      if (bodyEl) {
        bodyEl.textContent =
          "\u5728\u786e\u4fdd\u5b66\u4e60\u8bb0\u5f55\u5b89\u5168\u60c5\u51b5\u4e0b\u9002\u5f53\u63d0\u901f\u5b66\u4e60\u8fdb\u5ea6\uff0c\u8fbe\u5230\u8f83\u5feb\u5b8c\u6210\u8bfe\u7a0b\u6a21\u5f0f";
      }
    }
    const sel = document.querySelector("#jxjy-study-mode");
    if (sel && !sel.disabled) {
      sel.title = rt
        ? "\u8d85\u5b89\u51681:1\uff1a\u6309\u8bfe\u4ef6\u771f\u5b9e\u65f6\u957f\u9010\u6b65\u5b66\u4e60\uff0c\u6700\u7a33\u3001\u6700\u6162"
        : "\u5b89\u5168\u6548\u7387\uff1a\u5728\u4fdd\u8bc1\u5b66\u4e60\u8bb0\u5f55\u5b89\u5168\u7684\u524d\u63d0\u4e0b\u8f83\u5feb\u5237\u5b8c\u8bfe\u65f6";
    }
    if (reveal) {
      box.classList.remove("jxjy-study-mode-hint--hidden");
    } else {
      box.classList.add("jxjy-study-mode-hint--hidden");
    }
  }

  function collapseStudyModeHint() {
    try {
      const box = document.querySelector("#jxjy-study-mode-hint");
      if (box) box.classList.add("jxjy-study-mode-hint--hidden");
    } catch (_) {}
  }

  function setTestChapterLockEnabled(enabled) {
    state.testChapterLockEnabled = !!enabled;
    localStorage.setItem(TEST_CHAPTER_LOCK_ENABLE_KEY, state.testChapterLockEnabled ? "1" : "0");
    const btn = document.querySelector("#jxjy-toggle-test-lock");
    if (btn) {
      const label = btn.querySelector(".jxjy-btn-label");
      const text = state.testChapterLockEnabled ? "\u7ae0\u8282\u9501\u5b9a\uff1a\u5f00" : "\u7ae0\u8282\u9501\u5b9a\uff1a\u5173";
      if (label) label.textContent = text;
      else btn.textContent = text;
      btn.classList.toggle("jxjy-toggle-on", state.testChapterLockEnabled);
      btn.classList.toggle("jxjy-btn-ghost", !state.testChapterLockEnabled);
      btn.style.borderColor = state.testChapterLockEnabled ? "rgba(14,165,233,.55)" : "rgba(148,163,184,.55)";
      btn.style.color = state.testChapterLockEnabled ? "#0369a1" : "#64748b";
      btn.title = state.testChapterLockEnabled ? "\u4ec5\u5904\u7406\u547d\u4e2d\u76841\u4e2a\u6d4b\u8bd5\u7ae0\u8282" : "\u5173\u95ed\uff1a\u6062\u590d\u6b63\u5e38\u5168\u91cf\u5904\u7406";
    }
  }

  function isTargetTestChapter(resource) {
    if (!state.testChapterLockEnabled) return true;
    const query = String(state.testChapterLockQuery || "").trim().toLowerCase();
    if (!query) return false;
    const rid = String(resource?.id || "").toLowerCase();
    const title = String(resource?.title || "").toLowerCase();
    const lessonTitle = String(resource?.lessonTitle || "").toLowerCase();
    const relevantId = String(resource?.relevantId || "").toLowerCase();
    return rid === query || relevantId === query || title.includes(query) || lessonTitle.includes(query);
  }

  function syncCourseProgressFromPreview() {
    if (!Array.isArray(state.chapterPreview) || !state.chapterPreview.length) return;
    const percentByCourseId = {};
    for (const course of state.chapterPreview) {
      const cid = String(course?.courseId || "");
      if (!cid) continue;
      const arr = Array.isArray(course?.resources) ? course.resources : [];
      const total = arr.length;
      const done = arr.filter((r) => Number(r?.progress || 0) >= 100).length;
      const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
      percentByCourseId[cid] = pct;
      const hit = state.apiCourses.find((c) => String(c?.courseId || "") === cid);
      if (hit) hit.schedule = pct;
    }
    Object.keys(percentByCourseId).forEach((cid) => {
      const el = document.querySelector(`[data-course-progress="${cid}"]`);
      if (el) {
        const v = Number(percentByCourseId[cid] || 0);
        const done = v >= 100;
        el.textContent = done ? "\u8bfe\u7a0b\u5df2\u5b8c" : `${v}%`;
        el.classList.toggle("done", done);
        el.classList.toggle("todo", !done);
      }
    });
  }

  function markResourceDoneRealtime(resourceId) {
    if (!resourceId || !Array.isArray(state.chapterPreview) || !state.chapterPreview.length) return;
    let changed = false;
    for (const course of state.chapterPreview) {
      const arr = Array.isArray(course && course.resources) ? course.resources : [];
      for (const r of arr) {
        if (String(r.id || "") === String(resourceId) && Number(r.progress || 0) < 100) {
          r.progress = 100;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
    if (!changed) return;
    state.runChapterTotal = state.chapterPreview.reduce((sum, course) => sum + (Array.isArray(course.resources) ? course.resources.length : 0), 0);
    state.runChapterDone = state.chapterPreview.reduce((sum, course) => {
      const arr = Array.isArray(course.resources) ? course.resources : [];
      return sum + arr.filter((r) => Number(r.progress || 0) >= 100).length;
    }, 0);
    syncCourseProgressFromPreview();
    renderChapterPreview();
    updateQueueSummary();
  }

  async function refreshChapterPreview() {
    const selected = loadQueue();
    if (!selected.length) {
      state.chapterPreview = [];
      renderChapterPreview();
      return;
    }
    const list = [];
    for (const key of selected) {
      const course = state.apiCourses.find((c) => c.key === key);
      if (!course) continue;
      const resources = await fetchCourseResources(course.courseId);
      list.push({
        courseId: course.courseId,
        courseTitle: course.title || "\u672a\u547d\u540d\u8bfe\u7a0b",
        resources: resources.map((r) => ({
          id: r.id,
          lessonTitle: r.lessonTitle || "",
          title: r.title || "",
          type: r.type || "",
          progress: Number(r.progress || 0),
          active: false,
        })),
      });
    }
    state.chapterPreview = list;
    state.runChapterTotal = list.reduce((sum, course) => sum + (Array.isArray(course.resources) ? course.resources.length : 0), 0);
    state.runChapterDone = list.reduce((sum, course) => {
      const arr = Array.isArray(course.resources) ? course.resources : [];
      return sum + arr.filter((r) => Number(r.progress || 0) >= 100).length;
    }, 0);
    syncCourseProgressFromPreview();
    renderChapterPreview();
    updateQueueSummary();
  }

  function renderChapterPreview() {
    const box = document.querySelector("#jxjy-chapter-preview");
    if (!box) return;
    if (!state.chapterPreview.length) {
      box.innerHTML = "<div class='jxjy-empty-state'>\u8bf7\u9009\u62e9\u8bfe\u7a0b</div>";
      return;
    }
    box.innerHTML = state.chapterPreview.map((course) => {
      const items = (course.resources || []).map((r) => {
        const done = r.progress >= 100;
        const color = r.active ? "#16a34a" : done ? "#64748b" : "#334155";
        const mark = r.active ? "▶" : done ? "✓" : "•";
        return `<div class="jxjy-chapter-item" style="color:${color};"><span><span class="jxjy-dot">${mark}</span> ${r.lessonTitle}/${r.title} (${r.type})</span><span>${Math.round(r.progress)}%</span></div>`;
      }).join("");
      return `<div class="jxjy-chapter-course">
        <div class="jxjy-chapter-title">${course.courseTitle}</div>
        <div>${items}</div>
      </div>`;
    }).join("");
  }

  function readPanelCollapsed() {
    const v = localStorage.getItem(PANEL_COLLAPSED_KEY);
    return v == null ? true : v === "1";
  }
  function writePanelCollapsed(collapsed) { localStorage.setItem(PANEL_COLLAPSED_KEY, collapsed ? "1" : "0"); }
  function readPanelPos() {
    try { return JSON.parse(localStorage.getItem(PANEL_POS_KEY) || "{}"); } catch (_) { return null; }
  }
  function writePanelPos(left, top) { localStorage.setItem(PANEL_POS_KEY, JSON.stringify({ left, top })); }

  function applyPanelCollapsed(panel, collapsed) {
    const body = panel.querySelector("#jxjy-panel-body");
    const footerExtra = panel.querySelector(".jxjy-footer-extra");
    const footer = panel.querySelector("#jxjy-panel-footer");
    const btn = panel.querySelector("#jxjy-toggle");
    if (body) body.style.display = collapsed ? "none" : "";
    if (footerExtra) footerExtra.style.display = collapsed ? "none" : "";
    if (footer) footer.style.display = collapsed ? "none" : "";
    if (btn) btn.textContent = collapsed ? "+" : "\u4e00";
  }

  function enablePanelDrag(panel) {
    const header = panel.querySelector("#jxjy-panel-header");
    if (!header) return;
    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    header.addEventListener("mousedown", (e) => {
      if (e.target?.closest("#jxjy-toggle")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, startLeft + (e.clientX - startX)));
      const top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, startTop + (e.clientY - startY)));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    });
    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      const rect = panel.getBoundingClientRect();
      writePanelPos(rect.left, rect.top);
    });
  }

  function startPreviewAutoRefresh() {
    stopPreviewAutoRefresh();
    state.previewRefreshTimer = setInterval(() => {
      if (!state.running) return;
      refreshChapterPreview().catch(() => {});
    }, 12000);
  }

  function stopPreviewAutoRefresh() {
    if (state.previewRefreshTimer) {
      clearInterval(state.previewRefreshTimer);
      state.previewRefreshTimer = null;
    }
  }

  async function start() {
    if (state.running || state.starting) return;
    state.starting = true;
    syncRunButtons();
    if (state.cloudRevoked) {
      updateStatus("Token\u5df2\u7981\u7528");
      showPanelNotice("\u5f53\u524d Token \u5df2\u88ab\u7981\u7528\uff0c\u8bf7\u66f4\u6362\u540e\u518d\u5f00\u59cb\u3002", "error", true, 7000, document.querySelector("#jxjy-cloud-tier"));
      state.starting = false;
      syncRunButtons();
      return;
    }
    if (!state.bearerToken || !state.studentId) {
      const ok = await forceRefreshAuth();
      if (!ok || !state.bearerToken || !state.studentId) {
        remindRelogin("\u8bf7\u91cd\u65b0\u767b\u5f55");
        state.starting = false;
        syncRunButtons();
        return;
      }
    }
    try {
      await _el(false);
    } catch (e) {
      if (state.cloudRevoked) {
        updateStatus("Token\u5df2\u7981\u7528");
        state.starting = false;
        syncRunButtons();
        return;
      }

      updateStatus("\u4e91\u7aef\u672a\u8fde\u63a5");
      state.starting = false;
      syncRunButtons();
      return;
    }
    try {
      const exhaustedKey = freeQuotaExhaustedStorageKey();
      const exhausted = localStorage.getItem(exhaustedKey) === "1";
      if (exhausted && state.cloudTier !== "pro") {
        state.freeQuotaPromptShown = false;
        promptFreeQuotaEnded(true);
      }
    } catch (_) {}
    if (!state.faceCapturedThisRun) {
      updateStatus("\u672c\u6b21\u8fd0\u884c\u672a\u91c7\u96c6\u4eba\u8138");
      const allow = await showFaceCollectPrompt();
      if (!allow) {
        setFaceCacheStatus("\u672c\u6b21\u672a\u91c7\u96c6");
        log("⚠️ \u4f60\u53d6\u6d88\u4e86\u672c\u6b21\u4eba\u8138\u91c7\u96c6\uff0c\u672a\u5f00\u59cb\u8fd0\u884c");
        state.starting = false;
        syncRunButtons();
        return;
      }
      setFaceCacheStatus("\u7b49\u5f85\u624b\u52a8\u62cd\u7167");
      const faceInfo = await getFaceRecognitionInfo(null, null, null);
      const captured = await new Promise(async (resolve) => {
        try {
          await openInjectedFaceDialog(faceInfo, {
            manualCaptureOnly: true,
            onUploaded: () => resolve(true),
            onClosed: () => resolve(false),
          });
        } catch (_) {
          resolve(false);
        }
      });
      if (!captured) {
        updateStatus("\u8bf7\u5148\u91c7\u96c6\u4eba\u8138\u7167\u7247");
        setFaceCacheStatus("\u672c\u6b21\u672a\u91c7\u96c6");

        state.starting = false;
        syncRunButtons();
        return;
      }
    }
    state.consumedChapterKeys = new Set();
    state.faceVerifyBlockedInRun = false;
    state.faceForceIdPhotoFrsForRun = false;
    state.testChapterMatchedOnce = false;
    if (state.testChapterLockEnabled && !String(state.testChapterLockQuery || "").trim()) {
      updateStatus("\u672a\u8bbe\u7f6e\u6d4b\u8bd5\u7ae0\u8282\u5339\u914d");
      showPanelNotice("\u5df2\u5f00\u542f\u6d4b\u8bd5\u7ae0\u8282\u9501\u5b9a\uff0c\u4f46\u672a\u586b\u5199\u5339\u914d\u5173\u952e\u8bcd/ID\u3002", "warn", false, 3800, document.querySelector("#jxjy-test-lock-query"));
      state.starting = false;
      syncRunButtons();
      return;
    }
    state.runSelectedTotal = loadQueue().length;
    state.starting = false;
    state.running = true;
    collapseStudyModeHint();
    syncRunButtons();
    updateStatus("\u8fd0\u884c\u4e2d");
    updateQueueSummary();
    startPreviewAutoRefresh();
    runMainLoop();
  }

  function stop() {
    stopPreviewAutoRefresh();
    state.starting = false;
    state.running = false;
    state.runSelectedTotal = 0;
    state.runChapterTotal = 0;
    state.runChapterDone = 0;
    setCurrentCourse("\u65e0");
    setCurrentResource("\u65e0");
    setCurrentHomework("\u65e0");
    setHomeworkProgress(0, 0);
    updateStatus("\u5df2\u505c\u6b62");
    syncRunButtons();
    updateQueueSummary();
  }

  function renderCourseList() {
    const box = document.querySelector("#jxjy-course-list");
    if (!box) return;
    const courses = Array.isArray(state.apiCourses) ? state.apiCourses : [];
    if (!courses.length) {
      box.innerHTML = "<div class='jxjy-empty-state'>\u6682\u65e0\u8bfe\u7a0b\u6570\u636e</div>";
      return;
    }
    const selectedSet = new Set(state.courseQueue);
    box.innerHTML = courses.map((c) => {
      const key = String(c.key || "");
      const cid = String(c.courseId || "");
      const pct = Math.round(Number(c.schedule || 0));
      const done = pct >= 100;
      const selected = selectedSet.has(key);
      const badgeCls = done ? "done" : "todo";
      return `
        <label class="jxjy-course-card ${selected ? "selected" : ""}" data-course-key="${key}">
          <div class="jxjy-course-card-left">
            <input type="checkbox" class="jxjy-course-checkbox" data-course-key="${key}" ${selected ? "checked" : ""}/>
            <div class="jxjy-course-card-title">${c.title}</div>
          </div>
          <div class="jxjy-course-card-badges">
            <span data-hw-badge="${cid}" class="jxjy-course-badge" style="display:inline-flex;">\u4f5c\u4e1a...</span>
            <span data-exam-badge="${cid}" class="jxjy-course-badge todo" style="display:inline-flex;">\u8003...</span>
            <span data-course-progress="${cid}" class="jxjy-course-badge ${badgeCls}">${done ? "\u8bfe\u7a0b\u5df2\u5b8c" : (pct + "%")}</span>
          </div>
        </label>
      `;
    }).join("");

    const checkboxSelector = "input[type='checkbox'].jxjy-course-checkbox";
    box.querySelectorAll(checkboxSelector).forEach((el) => {
      el.addEventListener("change", () => {
        const selected = Array.from(box.querySelectorAll(checkboxSelector + ":checked")).map((i) => i.dataset.courseKey);
        saveQueue(selected);
        const selectedSet2 = new Set(selected);
        const cards = box.querySelectorAll(".jxjy-course-card");
        cards.forEach((card) => {
          const ck = card.getAttribute("data-course-key") || "";
          card.classList.toggle("selected", selectedSet2.has(ck));
        });
        updateQueueSummary();
        refreshChapterPreview();
        updateHomeworkHintFromSelection();
      });
    });
    refreshCourseHomeworkBadges();
    refreshCourseExamBadges();
  }

  function createPanel() {
    if (state.clientConfigPollTimer) {
      clearInterval(state.clientConfigPollTimer);
      state.clientConfigPollTimer = null;
    }
    const old = document.querySelector("#jxjy-auto-panel");
    if (old) old.remove();
    ensurePanelStyles();

    const panel = document.createElement("div");
    panel.id = "jxjy-auto-panel";
    panel.innerHTML = `
      <div id="jxjy-panel-header">
        <div id="jxjy-panel-brand">
          <img id="jxjy-panel-logo" alt="logo" referrerpolicy="no-referrer" src="https://huaweicloudobs.ahjxjy.cn/895789f9086469785b846d30c0ed95f9.png"/>
          <div>
            <div id="jxjy-panel-title">\u5b89\u5fbd\u7ee7\u7eed\u6559\u80b2\u5728\u7ebf\u65b0\u5e73\u53f0\u52a9\u624b <span class="jxjy-panel-version">v${SCRIPT_VERSION}</span></div>
            <div id="jxjy-panel-sub">\u8fd0\u884c\u524d\u8bf7\u5148\u91c7\u96c6\u4eba\u8138\u7167\u7247\uff08\u672c\u6b21\u8fd0\u884c\u5fc5\u9700\uff09\u3002</div>
          </div>
        </div>
        <button id="jxjy-toggle">\uff0d</button>
      </div>
      <div id="jxjy-panel-body">
        <div id="jxjy-cloud-toast">
          <button class="jxjy-toast-close" title="\u5173\u95ed">×</button>
          <div class="jxjy-toast-text"></div>
        </div>
        <div class="jxjy-card">
          <div class="jxjy-progress-top">
            <span>\u72b6\u6001</span><span id="jxjy-auto-status">\u672a\u542f\u52a8</span>
          </div>
          <div class="jxjy-progress-top">
            <div class="jxjy-progress-num"><span id="jxjy-queue-count">0</span><small> /<span id="jxjy-queue-total">0</span> \u7ae0\u5df2\u5b8c\u6210</small></div>
            <div class="jxjy-progress-pct" id="jxjy-queue-percent">0%</div>
          </div>
          <div class="jxjy-progress-bar"><span id="jxjy-queue-progress"></span></div>
        </div>
        <div class="jxjy-card" style="display:none;"></div>
        <div class="jxjy-card">
          <div class="jxjy-tabbar">
            <button class="jxjy-tab-btn active" data-tab="course">\u8bfe\u7a0b\u5217\u8868</button>
            <button class="jxjy-tab-btn" data-tab="chapter">\u7ae0\u8282\u9884\u89c8</button>
            <button class="jxjy-tab-btn" data-tab="log">\u8fd0\u884c\u65e5\u5fd7</button>
            <button class="jxjy-tab-btn" data-tab="settings">\u8bbe\u7f6e</button>
          </div>
          <div class="jxjy-pane active" data-pane="course">
            <div class="jxjy-list-head">
              <span class="jxjy-list-title">\u8bfe\u7a0b\u9009\u62e9</span>
              <span class="jxjy-list-tag">\u8bfe\u7a0b\u5217\u8868</span>
            </div>
            <div id="jxjy-course-list"></div>
          </div>
          <div class="jxjy-pane" data-pane="chapter">
            <div class="jxjy-list-head">
              <span class="jxjy-list-title">\u7ae0\u8282\u9884\u89c8</span>
              <span class="jxjy-list-tag">\u5b9e\u65f6\u8fdb\u5ea6</span>
            </div>
            <div id="jxjy-chapter-preview"></div>
          </div>
          <div class="jxjy-pane" data-pane="log">
            <div class="jxjy-list-head">
              <span class="jxjy-list-title">\u8fd0\u884c\u65e5\u5fd7</span>
              <span class="jxjy-list-tag">\u5b9e\u65f6\u65e5\u5fd7</span>
            </div>
            <div class="jxjy-log-filter" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 8px 0;">
              <button class="jxjy-log-filter-btn jxjy-log-filter-btn-active" type="button" data-filter="all">\u5168\u90e8</button>
              <button class="jxjy-log-filter-btn" type="button" data-filter="error">\u4ec5\u5931\u8d25</button>
              <button class="jxjy-log-filter-btn" type="button" data-filter="info">\u4ec5\u4fe1\u606f</button>
              <button id="jxjy-log-verbose-btn" class="jxjy-log-filter-btn" type="button" title="\u663e\u793a [DBG] \u8c03\u8bd5\u7ec6\u8282" style="display:none">DBG:\u5173</button>
            </div>
            <div id="jxjy-run-log"><div class="jxjy-empty-state">\u6682\u65e0\u8fd0\u884c\u65e5\u5fd7</div></div>
          </div>
          <div class="jxjy-pane" data-pane="settings">
            <div class="jxjy-list-head">
              <span class="jxjy-list-title">\u8bbe\u7f6e</span>
              <span class="jxjy-list-tag">\u53c2\u6570\u914d\u7f6e</span>
            </div>
            <div class="jxjy-settings-group">
              <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u7528\u6237\u7c7b\u578b</span><span class="jxjy-meta-value jxjy-auth-badge" id="jxjy-cloud-tier">unknown</span></div>
              <div class="jxjy-meta-row"><span class="jxjy-meta-label" id="jxjy-cloud-free-label">\u514d\u8d39\u4f53\u9a8c\u7ae0\u8282</span><span class="jxjy-meta-value" id="jxjy-cloud-free">0/6</span></div>
              <div class="jxjy-meta-row" style="align-items:center;">
                <span class="jxjy-meta-label">Token</span>
                <input id="jxjy-cloud-token" type="text" placeholder="\u5347\u7ea7pro\u7c98\u8d34token\uff08\u53ef\u9009\uff09" style="flex:1 1 auto;min-width:120px;border:1px solid #cbd5e1;border-radius:8px;padding:4px 8px;font-size:12px;"/>
                <button id="jxjy-cloud-save" class="jxjy-btn jxjy-btn-ghost" style="flex:0 0 auto;padding:3px 8px;font-size:12px;">\u4fdd\u5b58\u5e76\u6821\u9a8c</button>
                <button id="jxjy-open-vip" class="jxjy-btn jxjy-btn-pro" style="flex:0 0 auto;padding:3px 8px;font-size:12px;">\u5347\u7ea7Pro</button>
              </div>
            </div>

            <div class="jxjy-settings-group" style="margin-bottom:0;">
              <div class="jxjy-settings-title">\u8fd0\u884c\u8bbe\u7f6e</div>
              <div class="jxjy-btn-row jxjy-btn-row-nowrap" style="margin-bottom:0;">
                <button id="jxjy-toggle-homework" class="jxjy-btn jxjy-btn-ghost"><span class="jxjy-btn-label">\u5904\u7406\u4f5c\u4e1a\uff1a\u5f00</span></button>
                <button id="jxjy-toggle-exam" class="jxjy-btn jxjy-btn-ghost"><span class="jxjy-btn-label">\u8003\u8bd5\u8f85\u52a9\uff1a\u5f00</span></button>
                <button id="jxjy-toggle-deepseek" class="jxjy-btn jxjy-btn-ghost"><span class="jxjy-btn-label">AI\u641c\u9898\uff1a\u5173</span></button>
              </div>
              <div class="jxjy-meta-row" style="margin-top:8px;">
                <span class="jxjy-meta-label">AI\u8bf4\u660e</span>
                <span class="jxjy-meta-value">\u4ec5 Pro \u53ef\u7528\uff0c\u8003\u8bd5\u9898\u5e93\u65e0\u7b54\u6848\u65f6\u81ea\u52a8 AI\u7b54\u9898</span>
              </div>
            </div>
          </div>
        </div>
        <div class="jxjy-card">
          <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u5f53\u524d\u8bfe\u7a0b</span><span class="jxjy-meta-value" id="jxjy-current-course">\u65e0</span></div>
          <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u5f53\u524d\u7ae0\u8282</span><span class="jxjy-meta-value" id="jxjy-current-resource">\u65e0</span></div>
          <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u5f53\u524d\u4f5c\u4e1a</span><span class="jxjy-meta-value" id="jxjy-current-homework">\u65e0</span></div>
          <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u4f5c\u4e1a\u8fdb\u5ea6</span><span class="jxjy-meta-value" id="jxjy-homework-progress">0/0</span></div>
          <div class="jxjy-meta-row"><span class="jxjy-meta-label">\u4eba\u8138\u7f13\u5b58</span><span class="jxjy-meta-value" id="jxjy-face-cache-status">\u672a\u521d\u59cb\u5316</span></div>
        </div>
        <div class="jxjy-card jxjy-card-actions">
          <div class="jxjy-study-mode-bar">
            <label class="jxjy-study-mode-label" for="jxjy-study-mode">\u5b66\u4e60\u6a21\u5f0f</label>
            <select id="jxjy-study-mode" class="jxjy-study-mode-select" title="\u5207\u6362\u9009\u9879\u540e\u5c55\u5f00\u4e0b\u65b9\u6a21\u5f0f\u8bf4\u660e\uff1b\u9ed8\u8ba4\u5b89\u5168\u6548\u7387\u6a21\u5f0f">
              <option value="efficiency" selected>\u5b89\u5168\u6548\u7387\u6a21\u5f0f</option>
              <option value="realtime">\u8d85\u5b89\u51681:1\u65f6\u957f\u6a21\u5f0f</option>
            </select>
          </div>
          <div id="jxjy-study-mode-hint" class="jxjy-study-mode-hint-box jxjy-study-mode-hint-efficiency jxjy-study-mode-hint--hidden" role="status" aria-live="polite">
            <div class="jxjy-study-mode-hint-header">
              <span class="jxjy-study-mode-hint-badge">\u9ed8\u8ba4\u63a8\u8350</span>
              <span class="jxjy-study-mode-hint-title">\u5b89\u5168\u6548\u7387\u6a21\u5f0f</span>
            </div>
            <p class="jxjy-study-mode-hint-body">\u5728\u786e\u4fdd\u5b66\u4e60\u8bb0\u5f55\u5b89\u5168\u60c5\u51b5\u4e0b\u9002\u5f53\u63d0\u901f\u5b66\u4e60\u8fdb\u5ea6\uff0c\u8fbe\u5230\u8f83\u5feb\u5b8c\u6210\u8bfe\u7a0b\u6a21\u5f0f</p>
          </div>
          <div class="jxjy-btn-row jxjy-btn-row-nowrap">
            <button id="jxjy-refresh" class="jxjy-btn jxjy-btn-face jxjy-btn-action"><span class="jxjy-btn-ico">📷</span><span class="jxjy-btn-label">\u91c7\u96c6\u4eba\u8138\u7167</span></button>
            <button id="jxjy-start" class="jxjy-btn jxjy-btn-start jxjy-btn-action"><span class="jxjy-btn-ico">▶</span><span class="jxjy-btn-label">\u5f00\u59cb</span></button>
            <button id="jxjy-stop" class="jxjy-btn jxjy-btn-stop jxjy-btn-action"><span class="jxjy-btn-ico">⏹</span><span class="jxjy-btn-label">\u505c\u6b62</span></button>
          </div>
        </div>
      </div>
      <div class="jxjy-footer-extra">
        <div class="jxjy-ann">

          <span class="jxjy-ann-text" id="jxjy-ann-text">${JXJY_PANEL_NOTICE_FALLBACK}</span>
        </div>
        <div class="jxjy-qq-row">
          <div>
            <div class="jxjy-qq-text">\u52a0\u5165QQ\u7fa4\uff1a${QQ_GROUP_NUMBER}</div>
            <div class="jxjy-qq-title">\u5b89\u5fbd\u7ee7\u7eed\u6559\u80b2\u52a9\u624b\u4ea4\u6d41\u7fa4</div>
          </div>
          <button id="jxjy-join-qq" class="jxjy-qq-btn">\u52a0\u5165</button>
        </div>
      </div>
      <div id="jxjy-panel-footer">
        \u961f\u5217\u72b6\u6001\uff1a<span id="jxjy-queue-text">\u672a\u9009\u62e9</span>
      </div>
    `;
    document.body.appendChild(panel);
    void fetchJxjyClientConfig();
    state.clientConfigPollTimer = setInterval(() => {
      void fetchJxjyClientConfig();
    }, 3 * 60 * 1000);
    const oldVip = document.querySelector("#jxjy-vip-modal");
    if (oldVip) oldVip.remove();
    const vip = document.createElement("div");
    vip.id = "jxjy-vip-modal";
    vip.innerHTML = `
      <div class="jxjy-vip-card">
        <div class="jxjy-vip-title">\u5f00\u901a Pro</div>
        <div class="jxjy-vip-sub">Pro \u7528\u6237\u53ef\u81ea\u52a8\u5b8c\u6210\u8bfe\u7a0b\u8bfe\u65f6\u4e0e\u4f5c\u4e1a\uff1b\u671f\u672b\u8003\u8bd5\u8bf7\u5728\u8003\u8bd5\u9875\u4f7f\u7528\u300c\u8003\u8bd5\u8f85\u52a9\u300d\u9762\u677f</div>
        <div class="jxjy-vip-sec">
          <h4>Pro \u6743\u76ca</h4>
          <ul>
            <li>\u89e3\u9664\u514d\u8d39\u4f53\u9a8c\u7ae0\u8282\u9650\u5236\uff1aPro \u7528\u6237\u53ef\u5904\u7406\u5168\u90e8\u8bfe\u7a0b\u8bfe\u65f6\u4e0e\u4f5c\u4e1a\uff1b\u8003\u8bd5\u8bf7\u7528\u8003\u8bd5\u9875\u300c\u8003\u8bd5\u8f85\u52a9\u300d\u9762\u677f</li>
            <li>Pro\u6709\u6548\u671f30\u5929</li>
          </ul>
          <div class="jxjy-vip-warn" style="margin-top:10px;background:#eff6ff;border-color:#93c5fd;color:#1d4ed8;">
            \u63d0\u793a\uff1aPro\u6743\u9650\u7ed1\u5b9a\u7528\u6237\u8d26\u53f7\uff0c\u5207\u6362\u8d26\u53f7\u5931\u6548\uff01
          </div>
        </div>
        <div class="jxjy-vip-sec">
          <h4>\u5f00\u901a\u65b9\u5f0f</h4>
          <p>1) \u516c\u6d4b\u671f\u95f4\uff08\u622a\u81f34\u670825\u65e5\uff09\uff1a\u8054\u7cfb\u7fa4\u7ba1\u7406\u83b7\u53d6Token\uff0c\u9700\u53ca\u65f6\u53cd\u9988Bug</p>
          <div class="jxjy-vip-buy">
            <div>
              <p style="margin:0 0 6px 0;">2) \u5176\u4ed6\u65f6\u95f4\uff1a\u524d\u5f80\u8d2d\u4e70\u9875\u83b7\u53d6 Token\uff0c24\u5c0f\u65f6\u81ea\u52a9\u53d1\u8d27\uff01</p>
              <div class="muted">\u8d2d\u5f97 Token \u540e\uff1a\u5728\u9762\u677f Token \u8f93\u5165\u6846\u7c98\u8d34\u5e76\u70b9\u51fb“\u4fdd\u5b58\u5e76\u6821\u9a8c”\u3002</div>
            </div>
            <a href="${PRO_BUY_URL}" target="_blank" rel="noopener noreferrer">\u524d\u5f80\u8d2d\u4e70\u9875\u5f00\u901a Pro</a>
          </div>
          <div class="jxjy-vip-warn">\u91cd\u8981\uff1a\u8bf7\u52ff\u968f\u610f\u6cc4\u9732 Token\uff0c\u907f\u514d\u8d26\u53f7\u88ab\u591a\u4eba\u5171\u7528\u5bfc\u81f4\u5931\u6548\u3002</div>
        </div>
        <div class="jxjy-vip-actions">
          <button id="jxjy-vip-close" class="jxjy-vip-close">\u6211\u77e5\u9053\u4e86</button>
        </div>
      </div>
    `;
    document.body.appendChild(vip);

    const savedPos = readPanelPos();
    if (savedPos && savedPos.left && savedPos.top) {
      panel.style.right = "auto";
      panel.style.left = `${savedPos.left}px`;
      panel.style.top = `${savedPos.top}px`;
    }
    applyPanelCollapsed(panel, readPanelCollapsed());
    enablePanelDrag(panel);
    setFaceCacheStatus(state.faceCacheStatus);
    const toastClose = panel.querySelector("#jxjy-cloud-toast .jxjy-toast-close");
    if (toastClose) toastClose.addEventListener("click", hidePanelNotice);

    panel.querySelector("#jxjy-refresh").addEventListener("click", async () => {

      setFaceCacheStatus("\u7b49\u5f85\u624b\u52a8\u62cd\u7167");
      const faceInfo = await getFaceRecognitionInfo(null, null, null);
      await openInjectedFaceDialog(faceInfo, {
        manualCaptureOnly: true,
        onUploaded: () => {
          state.faceCapturedThisRun = true;
          updateStatus("\u4eba\u8138\u7167\u7247\u5df2\u91c7\u96c6");
          setFaceCacheStatus("\u5df2\u5c31\u7eea(\u624b\u52a8\u62cd\u7167)");
          log("✅ \u4eba\u8138\u7167\u7247\u91c7\u96c6\u5b8c\u6210\uff0c\u73b0\u5728\u53ef\u4ee5\u70b9\u51fb\u5f00\u59cb", "info");
        },
        onClosed: () => {
          const cached = readFaceCache();
          if (!cached || !cached.cdnUrl || !cached.md5) {
            updateStatus("\u8bf7\u5148\u91c7\u96c6\u4eba\u8138\u7167\u7247");
            setFaceCacheStatus("\u672a\u91c7\u96c6");
          }
        },
      });
    });
    setAutoHomeworkEnabled(state.autoHomeworkEnabled);
    setAutoExamEnabled(state.autoExamEnabled);
    setDeepseekEnabled(state.deepseekEnabled);
    setTestChapterLockEnabled(state.testChapterLockEnabled);
    syncStudyModeSelect();
    const studyModeSel = panel.querySelector("#jxjy-study-mode");
    if (studyModeSel) {
      studyModeSel.addEventListener("change", () => {
        setStudyMode(studyModeSel.value);
        const label = isRealtimeStudyMode() ? "\u8d85\u5b89\u51681:1\u65f6\u957f\u6a21\u5f0f" : "\u5b89\u5168\u6548\u7387\u6a21\u5f0f";

      });
    }
    setHomeworkProgress(0, 0);
    updateCloudPanelUI();
    try {
      const q = panel.querySelector("#jxjy-test-lock-query");
      if (q && q !== document.activeElement) q.value = state.testChapterLockQuery || "";
    } catch (_) {}
    panel.querySelector("#jxjy-cloud-save").addEventListener("click", async () => {
      const input = panel.querySelector("#jxjy-cloud-token");
      const token = String((input && input.value) || "").trim();
      state.cloudToken = token;
      state.cloudRevoked = false;
      localStorage.setItem(CLOUD_TOKEN_KEY, token);
      if (!token) writeCloudProExpireCache("", 0);
      writeCloudLeaseCache("", 0);
      state.cloudLease = "";
      state.cloudLeaseExp = 0;
      state.cloudProExpireAt = 0;
      try {
        await _el(true);

        hidePanelNotice();
      } catch (e) {
        const em = String((e && e.message) || e);

        if (/(invalid|unauthorized|forbidden|401|403|token|license)/i.test(em)) {
          const tokenEl = panel.querySelector("#jxjy-cloud-token");
          showPanelNotice("Token \u6821\u9a8c\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u540e\u91cd\u65b0\u8f93\u5165\u3002", "error", true, 6000, tokenEl);
        } else {
          const tokenEl = panel.querySelector("#jxjy-cloud-token");
          showPanelNotice(`\u4e91\u7aef\u6388\u6743\u5931\u8d25\uff1a${em}`, "error", false, 6000, tokenEl);
        }
      }
      updateCloudPanelUI();
    });
    panel.querySelector("#jxjy-toggle-homework").addEventListener("click", () => {
      setAutoHomeworkEnabled(!state.autoHomeworkEnabled);
      const btn = panel.querySelector("#jxjy-toggle-homework");
      showPanelNotice(
        state.autoHomeworkEnabled ? "\u81ea\u52a8\u5904\u7406\u4f5c\u4e1a\u529f\u80fd\u5df2\u5f00\u542f" : "\u81ea\u52a8\u5904\u7406\u4f5c\u4e1a\u529f\u80fd\u5df2\u5173\u95ed",
        "info",
        false,
        2200,
        btn
      );
    });
    panel.querySelector("#jxjy-toggle-test-lock")?.addEventListener("click", () => {
      setTestChapterLockEnabled(!state.testChapterLockEnabled);
      const btn = panel.querySelector("#jxjy-toggle-test-lock");
      showPanelNotice(
        state.testChapterLockEnabled ? "\u6d4b\u8bd5\u7ae0\u8282\u9501\u5b9a\u5df2\u5f00\u542f" : "\u6d4b\u8bd5\u7ae0\u8282\u9501\u5b9a\u5df2\u5173\u95ed",
        "info",
        false,
        2200,
        btn
      );
    });
    panel.querySelector("#jxjy-test-lock-save")?.addEventListener("click", () => {
      const q = panel.querySelector("#jxjy-test-lock-query");
      const query = String((q && q.value) || "").trim();
      state.testChapterLockQuery = query;
      localStorage.setItem(TEST_CHAPTER_LOCK_QUERY_KEY, query);
      if (state.testChapterLockEnabled && !query) {
        setTestChapterLockEnabled(false);
        showPanelNotice("\u672a\u586b\u5199\u5339\u914d\u5185\u5bb9\uff0c\u5df2\u81ea\u52a8\u5173\u95ed\u7ae0\u8282\u9501\u5b9a\u3002", "warn", false, 2600, q);
        return;
      }
      showPanelNotice(
        query ? `\u6d4b\u8bd5\u7ae0\u8282\u5339\u914d\u5df2\u4fdd\u5b58\uff1a${query}` : "\u6d4b\u8bd5\u7ae0\u8282\u5339\u914d\u5df2\u6e05\u7a7a",
        "info",
        false,
        2600,
        panel.querySelector("#jxjy-test-lock-save")
      );
    });
    panel.querySelector("#jxjy-toggle-exam").addEventListener("click", () => {
      const isPro = String(state.cloudTier || "").toLowerCase() === "pro";
      if (!isPro) {
        setAutoExamEnabled(false);
        const btn = panel.querySelector("#jxjy-toggle-exam");
        showPanelNotice("\u8003\u8bd5\u8f85\u52a9\u4ec5 Pro \u7528\u6237\u53ef\u7528\uff0c\u8bf7\u5148\u5347\u7ea7 Pro\u3002", "warn", false, 3200, btn);
        applyUiByRoute();
        return;
      }
      setAutoExamEnabled(!state.autoExamEnabled);
      const btn = panel.querySelector("#jxjy-toggle-exam");
      showPanelNotice(
        state.autoExamEnabled ? "\u8003\u8bd5\u8f85\u52a9\u529f\u80fd\u5df2\u5f00\u542f" : "\u8003\u8bd5\u8f85\u52a9\u529f\u80fd\u5df2\u5173\u95ed",
        "info",
        false,
        2200,
        btn
      );
      applyUiByRoute();
    });
    panel.querySelector("#jxjy-toggle-deepseek").addEventListener("click", () => {
      setDeepseekEnabled(!state.deepseekEnabled);
      const btn = panel.querySelector("#jxjy-toggle-deepseek");
      showPanelNotice(
        state.deepseekEnabled ? "AI\u641c\u9898\u5df2\u5f00\u542f\uff08\u8003\u8bd5\u9898\u5e93\u65e0\u7b54\u6848\u65f6\u8c03\u7528AI\u7b54\u9898\uff09" : " \u8003\u8bd5AI \u641c\u9898\u5df2\u5173\u95ed",
        "info",
        false,
        2400,
        btn
      );
    });
    panel.querySelector("#jxjy-join-qq").addEventListener("click", () => {
      try {
        GM_openInTab(QQ_GROUP_LINK, { active: true, insert: true, setParent: true });
      } catch (_) {
        window.open(QQ_GROUP_LINK, "_blank");
      }
    });
    panel.querySelector("#jxjy-open-vip").addEventListener("click", () => {
      const vm = document.querySelector("#jxjy-vip-modal");
      if (vm) vm.style.display = "flex";
    });
    const closeVip = () => {
      const vm = document.querySelector("#jxjy-vip-modal");
      if (vm) vm.style.display = "none";
    };
    vip.addEventListener("click", (e) => {
      if (e.target === vip) closeVip();
    });
    vip.querySelector("#jxjy-vip-close").addEventListener("click", closeVip);
    panel.querySelectorAll(".jxjy-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        panel.querySelectorAll(".jxjy-tab-btn").forEach((b) => b.classList.remove("active"));
        panel.querySelectorAll(".jxjy-pane").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const pane = panel.querySelector(`.jxjy-pane[data-pane="${tab}"]`);
        if (pane) pane.classList.add("active");
      });
    });

    bootRuntimeVerboseIfUnset();
    syncDbgPanelUi();
    const verboseBtn = panel.querySelector("#jxjy-log-verbose-btn");
    if (verboseBtn) {
      verboseBtn.addEventListener("click", () => {
        setRuntimeVerbose(!isRuntimeVerbose());
        log(isRuntimeVerbose() ? "✅ \u8fd0\u884c\u65e5\u5fd7\u8c03\u8bd5\u6a21\u5f0f\u5df2\u5f00\u542f\uff08\u5e26 [DBG] \u524d\u7f00\uff09" : "ℹ️ \u8fd0\u884c\u65e5\u5fd7\u8c03\u8bd5\u6a21\u5f0f\u5df2\u5173\u95ed", "info");
      });
      syncRuntimeVerboseBtn();
    }
    panel.querySelectorAll(".jxjy-log-filter-btn[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = String(btn.getAttribute("data-filter") || "all");
        state.runLogFilter = f;
        try { localStorage.setItem("jxjy_run_log_filter_v1", f); } catch (_) {}
        panel.querySelectorAll(".jxjy-log-filter-btn[data-filter]").forEach((b) => {
          const bf = String(b.getAttribute("data-filter") || "all");
          b.classList.toggle("jxjy-log-filter-btn-active", bf === f);
        });
        applyRunLogFilter();
      });
    });
    panel.querySelectorAll(".jxjy-log-filter-btn[data-filter]").forEach((b) => {
      const bf = String(b.getAttribute("data-filter") || "all");
      b.classList.toggle("jxjy-log-filter-btn-active", bf === String(state.runLogFilter || "all"));
    });
    applyRunLogFilter();

    panel.querySelector("#jxjy-start").addEventListener("click", start);
    panel.querySelector("#jxjy-stop").addEventListener("click", stop);
    syncRunButtons();
    panel.querySelector("#jxjy-toggle").addEventListener("click", () => {
      const collapsed = !readPanelCollapsed();
      writePanelCollapsed(collapsed);
      applyPanelCollapsed(panel, collapsed);
    });
  }

  function isExamRoute() {
    const h = String(location.hash || "");
    return /#\/myExam(\/|$|\?)/.test(h);
  }

  function applyUiByRoute() {
    let main = document.querySelector("#jxjy-auto-panel");
    const vip = document.querySelector("#jxjy-vip-modal");
    const exam = document.querySelector("#jxjy-exam-assist-panel");
    const isPro = String(state.cloudTier || "").toLowerCase() === "pro";
    const allowExamAssist = isPro && !!state.autoExamEnabled;
    if (isExamRoute()) {
      if (main) main.style.display = "none";
      if (vip) vip.style.display = "none";
      installExamRouteHookOnce();
      setExamDebug({ route: String(location.hash || ""), hook: state.examHookInstalled ? "on" : "off" });
      if (allowExamAssist) {
        if (!exam) createExamAssistPanel();
      } else if (exam) {
        exam.remove();
      }
    } else {
      if (exam) exam.remove();
      if (!main) {
        createPanel();
        main = document.querySelector("#jxjy-auto-panel");
      }
      if (main) main.style.display = "block";
    }
  }

  function ensureUiRouteSyncWatcher() {
    if (state.uiRouteSyncTimer) return;
    state.uiRouteSyncTimer = setInterval(() => {
      try {
        const key = `${location.pathname}#${location.hash}|${!!document.querySelector("#jxjy-auto-panel")}|${!!document.querySelector("#jxjy-exam-assist-panel")}|${String(state.cloudTier || "")}|${state.autoExamEnabled ? "1" : "0"}`;
        if (key === state.uiLastRouteKey) return;
        state.uiLastRouteKey = key;
        applyUiByRoute();
      } catch (_) {}
    }, 450);
  }

  function installExamRouteHookOnce() {
    if (state.examHookInstalled) return;
    state.examHookInstalled = true;
    setExamDebug({ hook: "on", route: String(location.hash || "") });

    const injectHookToPage = () => {
      try {
        const doc = document;
        if (!doc || !doc.documentElement) return false;
        if (doc.getElementById("jxjy-exam-hook-injected")) return true;
        const s = doc.createElement("script");
        s.id = "jxjy-exam-hook-injected";
        s.type = "text/javascript";
        s.textContent = `
(function(){
  try{
    if (window.__jxjyExamHooked) return;
    window.__jxjyExamHooked = true;
    function isExamRoute(){
      try { return /#\\/myExam(\\/|$|\\?)/.test(String(location.hash||"")); } catch(e){ return false; }
    }
    function shouldCaptureUrl(u){
      var s=String(u||"");
      return s.indexOf("paper/load-exam-record")>=0 || s.indexOf("paper/preview-examt-record")>=0 || s.indexOf("paper/preview-exam")>=0 || s.indexOf("/api/paper/")>=0;
    }
    function post(u, text){
      try{
        if (!isExamRoute()) return;
        if (!shouldCaptureUrl(u)) return;
        window.postMessage({ __jxjy_type:"JXJY_EXAM_CAPTURE", url:String(u||""), text:String(text||"") }, "*");
      }catch(e){}
    }
    try{
      var rawFetch = window.fetch;
      if (typeof rawFetch === "function"){
        window.fetch = function(){
          return rawFetch.apply(this, arguments).then(function(res){
            try{
              var u = arguments && arguments.length ? arguments[0] : "";
              var url = "";
              try{ url = (typeof u==="string") ? u : (u && u.url) ? u.url : ""; }catch(e){ url=""; }
              if (res && typeof res.clone === "function"){
                res.clone().text().then(function(t){ post(url, t); }).catch(function(){});
              }
            }catch(e){}
            return res;
          });
        };
      }
    }catch(e){}
    try{
      var XHROpen = XMLHttpRequest.prototype.open;
      var XHRSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url){
        try{ this.__jxjy_url = url; }catch(e){}
        return XHROpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(){
        try{
          var u = this.__jxjy_url || "";
          if (shouldCaptureUrl(u)){
            this.addEventListener("load", function(){
              try{ post(u, this.responseText); }catch(e){}
            });
          }
        }catch(e){}
        return XHRSend.apply(this, arguments);
      };
    }catch(e){}
  }catch(e){}
})();`;
        doc.documentElement.appendChild(s);
        s.parentNode && s.parentNode.removeChild(s);
        return true;
      } catch (_) {
        return false;
      }
    };

    const shouldCaptureUrl = (u) => {
      const s = String(u || "");
      return (
        s.includes("paper/load-exam-record") ||
        s.includes("paper/preview-examt-record") ||
        s.includes("paper/preview-exam") ||
        s.includes("/api/paper/")
      );
    };

    const simplifyUrlForDebug = (u) => {
      const s = String(u || "");
      if (!s) return "";
      const m = s.match(/\/v1\/jxjy-teacher-space-service\/api\/paper\/[^?#]+/i);
      const path = m ? m[0] : (s.includes("/api/paper/") ? "/api/paper/[captured]" : "[captured]");
      const q = s.includes("examId=") ? " examId=*" : "";
      return `${path}${q}`;
    };

    const findFirstByKey = (obj, key, maxDepth = 6) => {
      try {
        const k = String(key || "");
        const seen = new Set();
        const walk = (v, depth) => {
          if (!v || depth > maxDepth) return null;
          if (typeof v !== "object") return null;
          if (seen.has(v)) return null;
          seen.add(v);
          if (Object.prototype.hasOwnProperty.call(v, k)) return v[k];
          if (Array.isArray(v)) {
            for (const it of v) {
              const r = walk(it, depth + 1);
              if (r != null) return r;
            }
            return null;
          }
          for (const kk of Object.keys(v)) {
            const r = walk(v[kk], depth + 1);
            if (r != null) return r;
          }
          return null;
        };
        return walk(obj, 0);
      } catch (_) {
        return null;
      }
    };

    const tryHandleExamPaperJsonText = async (text) => {
      if (!isExamRoute()) return;
      const raw = String(text || "").trim();
      if (!raw) return;
      let j = null;
      try {
        j = JSON.parse(raw);
      } catch (_) {
        return;
      }
      if (!j || typeof j !== "object") return;
      const paperJson = findFirstByKey(j, "paperJson") || findFirstByKey(j, "PaperJson") || "";
      const ruleId = findFirstByKey(j, "ruleId") || findFirstByKey(j, "RuleId") || "";
      if (!paperJson) return;
      setExamDebug({ gotPaperJson: "yes", paperLen: String(paperJson || "").length });
      const sig = `${String(ruleId || "")}|${String(paperJson || "").slice(0, 48)}|${String(paperJson || "").length}`;
      if (sig && sig === state.examLastPaperSig) return;
      state.examLastPaperSig = sig;

      try { state.deepseekEnabled = localStorage.getItem(DEEPSEEK_ENABLE_KEY) === "1"; } catch (_) {}

      try {
        if (!state.bearerToken || !state.studentId) {
          const ok = await forceRefreshAuth();
          if (!ok) {
            showPanelNotice("\u8003\u8bd5\u9875\u672a\u83b7\u53d6\u5230\u767b\u5f55\u4fe1\u606f\uff0c\u8bf7\u9000\u51fa\u8d26\u53f7\u91cd\u65b0\u767b\u5f55\u540e\u518d\u8bd5", "error", false, 9000);
            setExamDebug({ decrypted: "no", lastErr: "auth_missing" });
            return;
          }
        }
        const decrypted = await _ad(String(paperJson || ""), "assignment_payload");
        if (!decrypted) {
          setExamDebug({ decrypted: "no", lastErr: "decrypt_failed" });
          return;
        }
        setExamDebug({ decrypted: "yes", lastErr: "" });
        let sections = [];
        try { sections = JSON.parse(decrypted); } catch (_) { sections = []; }
        const questions = extractQuestionsFromPaperSections(sections);
        resetExamAssistRows();
        setExamDebug({ questions: Array.isArray(questions) ? questions.length : 0 });
        if (!questions.length) return;
        const rid = String(ruleId || "");
        state.examCurrentRuleId = rid;
        state.examQuestionsFlat = Array.isArray(questions) ? questions.slice() : [];
        const qMap = {};
        for (const q of questions) {
          const id = String(q?.Id || q?.id || "");
          if (!id) continue;
          qMap[id] = q;
        }
        state.examQuestionById = qMap;
        let cachedToCloudCount = 0;
        try {
          for (const q of questions) {
            const qt = resolveExamQuestionType(q);
            const known = extractKnownAnswerFromQuestion(q, qt);
            const legacyText = buildLegacyExamQuestionText(q);
            if (known && legacyText) {
              const ok2 = await _qu(legacyText, qt, known, "exam_paper");
              if (ok2) cachedToCloudCount += 1;
            }
          }
        } catch (_) {}
        if (cachedToCloudCount <= 0) {
          try {
            const scoreVal = Number(findFirstByKey(j, "score") || findFirstByKey(j, "Score") || 0);
            const canInfer = Number.isFinite(scoreVal) && scoreVal >= 100;
            if (canInfer) {
              for (const q of questions) {
                const qt = resolveExamQuestionType(q);
                if (!["single", "multiple", "judge"].includes(qt)) continue;
                const legacyText = buildLegacyExamQuestionText(q);
                if (!legacyText) continue;
                const studentAnsRaw = String(q?.StudentAnswer ?? q?.studentAnswer ?? q?.student_answer ?? "").trim();
                if (!studentAnsRaw) continue;
                const existed = await _qg(legacyText);
                if (existed && existed.answer) continue;
                const optionLen = Array.isArray(q?.CourseQuestionOptionList) ? q.CourseQuestionOptionList.length : 0;
                const normalized = normalizeCloudAnswer(studentAnsRaw, qt, optionLen);
                if (!normalized) continue;
                const ok3 = await _qu(legacyText, qt, normalized, "exam_score_infer");
                if (ok3) cachedToCloudCount += 1;
              }
            }
          } catch (_) {}
        }
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const qText = buildQuestionLookupText(q);
          if (!qText) continue;
          let bank = "";
          let bankHash = "";
          try {
            if (rid) {
          const submitData = await buildExamSubmitData(q, rid);
              bank = String(submitData?.bankAnswer || "");
              bankHash = String(submitData?.bankHash || "");
            } else {
              const qt = resolveExamQuestionType(q);
              const qaRes = await _ra(q, ""); const qa = { answer: qaRes?.result?.answer, bankAnswer: qaRes?.result?.bank_answer, bankHash: qaRes?.result?.bank_hash };
              bank = String(qa?.bankAnswer || "");
              bankHash = String(qa?.bankHash || "");
            }
          } catch (_) {}
          const qt2 = resolveExamQuestionType(q);
          const answerText2 = formatAnswerWithOptionText(q, qt2, bank) || bank || "\uff08\u65e0\u9898\u5e93\u7b54\u6848\uff09";
          pushExamAssistRow(
            i + 1,
            qText,
            bank || "\uff08\u65e0\u9898\u5e93\u7b54\u6848\uff09",
            answerText2,
            examQuestionTypeLabel(qt2),
            String(q?.Id || q?.id || ""),
            bankHash,
            String(qt2 || "")
          );
        }
        try {
          state.examAssistSelectedNo = 1;
          const root = document.querySelector("micro-app-body>#app>div");
          const vm = root && root.__vue__;
          const first = vm && Array.isArray(vm.hierarchyList) ? vm.hierarchyList[0] : null;
          const id = first && first.Id ? String(first.Id) : "";
          if (vm && id && typeof vm.goAnchor === "function") {
            try { vm.goAnchor(id); } catch (_) {}
          } else {
            try { syncToNativeAnswerCard(1); } catch (_) {}
          }
          setTimeout(() => scheduleAutoFillByNo(1), 600);
        } catch (_) {}
        showExamAssistNotice(
          cachedToCloudCount > 0
            ? `\u672c\u6b21\u5df2\u7f13\u5b58 ${cachedToCloudCount} \u9898\u5230\u9898\u5e93\uff0c\u4e0b\u6b21\u53ef\u76f4\u63a5\u4f7f\u7528`
            : "\u672c\u6b21\u672a\u7f13\u5b58\u65b0\u9898\uff1a\u8bd5\u5377\u672a\u5305\u542b\u5df2\u77e5\u6b63\u786e\u7b54\u6848\u6216\u9898\u5e93\u5199\u5165\u5931\u8d25\uff08\u53ef\u91cd\u8bd5/\u7a0d\u540e\u518d\u8bd5\uff09",
          4200
        );
      } catch (_) {}
    };

    try {
      injectHookToPage();

      const rawFetch = window.fetch;
      if (typeof rawFetch === "function") {
        window.fetch = async function (...args) {
          const res = await rawFetch.apply(this, args);
          try {
            const u = (args && args[0] && (typeof args[0] === "string" ? args[0] : args[0].url)) || "";
            if (isExamRoute() && shouldCaptureUrl(u) && res && typeof res.clone === "function") {
              setExamDebug({
                lastUrl: `fetch ${simplifyUrlForDebug(u)}`,
                route: String(location.hash || ""),
                captureCount: Number((state.examDebug && state.examDebug.captureCount) || 0) + 1,
              });
              res.clone().text().then((t) => tryHandleExamPaperJsonText(t)).catch(() => {});
            }
          } catch (_) {}
          return res;
        };
      }
    } catch (_) {}

    try {
      const XHROpen = XMLHttpRequest.prototype.open;
      const XHRSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (method, url) {
        try { this.__jxjy_url = url; } catch (_) {}
        return XHROpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function () {
        try {
          const u = this.__jxjy_url || "";
          if (isExamRoute() && shouldCaptureUrl(u)) {
            this.addEventListener("load", () => {
              setExamDebug({
                lastUrl: `xhr ${simplifyUrlForDebug(u)}`,
                route: String(location.hash || ""),
                captureCount: Number((state.examDebug && state.examDebug.captureCount) || 0) + 1,
              });
              tryHandleExamPaperJsonText(this.responseText);
            });
          }
        } catch (_) {}
        return XHRSend.apply(this, arguments);
      };
    } catch (_) {}

    try {
      window.addEventListener("message", (ev) => {
        try {
          const data = ev && ev.data;
          if (!data || data.__jxjy_type !== "JXJY_EXAM_CAPTURE") return;
          if (!isExamRoute()) return;
          const u = String(data.url || "");
          const t = String(data.text || "");
          if (!t) return;
          setExamDebug({
            lastUrl: `page ${simplifyUrlForDebug(u)}`,
            route: String(location.hash || ""),
            captureCount: Number((state.examDebug && state.examDebug.captureCount) || 0) + 1,
          });
          tryHandleExamPaperJsonText(t);
        } catch (_) {}
      });
    } catch (_) {}
  }

  try { installExamRouteHookOnce(); } catch (_) {}

  async function init() {

    createPanel();
    applyUiByRoute();
    ensureUiRouteSyncWatcher();
    window.addEventListener("hashchange", applyUiByRoute);
    window.addEventListener("popstate", applyUiByRoute);
    const ok = await initAuth();
    if (!ok) {
      remindRelogin("\u9996\u6b21\u521d\u59cb\u5316\u5931\u8d25");
      return;
    }
    const last = readCloudLastState();
    if (last) {
      if (last.tier) state.cloudTier = last.tier;
      if (Number.isFinite(last.freeChapterLimit) && last.freeChapterLimit > 0) state.freeChapterLimit = last.freeChapterLimit;
      if (Number.isFinite(last.freeUsedChapters) && last.freeUsedChapters >= 0) state.freeUsedChapters = last.freeUsedChapters;
      updateCloudPanelUI();
    }
    try {
      await _el(false);
    } catch (_) {}
    try {
      const exhaustedKey = freeQuotaExhaustedStorageKey();
      const exhausted = localStorage.getItem(exhaustedKey) === "1";
      if (exhausted && state.cloudTier !== "pro") {
        state.freeQuotaPromptShown = false;
        promptFreeQuotaEnded(true);
      }
    } catch (_) {}
    const cached = readFaceCache();
    if (cached && cached.cdnUrl && cached.md5) {
      state.startupFacePrepared = true;
      setFaceCacheStatus("\u5df2\u5c31\u7eea(\u5386\u53f2\u7f13\u5b58)");
      updateStatus("\u672c\u6b21\u8fd0\u884c\u672a\u91c7\u96c6\u4eba\u8138");
    } else {
      setFaceCacheStatus("\u672a\u91c7\u96c6");
      updateStatus("\u672c\u6b21\u8fd0\u884c\u672a\u91c7\u96c6\u4eba\u8138");
    }
    await fetchCoursesFromAPI();
    state.courseQueue = loadQueue();
    renderCourseList();
    await refreshChapterPreview();
    await updateHomeworkHintFromSelection();
    updateQueueSummary();
    if (state.faceCapturedThisRun) updateStatus("\u5c31\u7eea");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
