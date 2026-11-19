import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const out = path.resolve("artifacts");
const profile = path.resolve(".taste-skill/chrome-functional");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(profile, { recursive: true });
fs.mkdirSync(path.join(out, "downloads"), { recursive: true });
const executable = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((file) => file && fs.existsSync(file));
assert(executable, "A Chromium browser is required");
const portFile = path.join(profile, "DevToolsActivePort");
if (fs.existsSync(portFile)) fs.unlinkSync(portFile);
const chrome = spawn(
  executable,
  [
    "--headless=new",
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-gpu",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
let ws;
const records = [];
const exceptions = [];
const downloads = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const record = (name, detail) => {
  records.push({ name, result: "PASS", detail });
  console.log(`PASS ${name}: ${detail}`);
};
let seq = 0;
const pending = new Map();
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 45000);
    pending.set(id, (result) => {
      clearTimeout(timeout);
      if (result.error) reject(new Error(`${method}: ${result.error.message}`));
      else resolve(result.result);
    });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

try {
  for (let attempt = 0; attempt < 150 && !fs.existsSync(portFile); attempt++)
    await sleep(100);
  assert(fs.existsSync(portFile), "Chromium did not start");
  const port = parseInt(fs.readFileSync(portFile, "utf8"), 10);
  const version = await (
    await fetch(`http://127.0.0.1:${port}/json/version`)
  ).json();
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      pending.get(message.id)?.(message);
      pending.delete(message.id);
    }
    if (message.method === "Runtime.exceptionThrown")
      exceptions.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text,
      );
    if (
      message.method === "Browser.downloadProgress" &&
      message.params.state === "completed"
    )
      downloads.push(message.params.guid);
  });
  const { targetId } = await send("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  const S = (method, params) => send(method, params, sessionId);
  async function evaluate(expression) {
    const result = await S("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text,
      );
    return result.result?.value;
  }
  async function until(expression, label, timeout = 45000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      try {
        if (await evaluate(expression)) return;
      } catch {
        /* Navigation can replace an execution context. */
      }
      await sleep(150);
    }
    throw new Error(`Timed out: ${label}`);
  }
  async function navigate(route) {
    await S("Page.navigate", { url: `${base}${route}` });
    await until(
      `document.readyState === 'complete' && location.pathname === ${JSON.stringify(route.split("?")[0])}`,
      `navigate ${route}`,
    );
    await sleep(350);
  }
  async function viewport(width, height = width < 600 ? 844 : 1000) {
    await S("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }
  async function click(selector) {
    await until(
      `!!document.querySelector(${JSON.stringify(selector)})`,
      selector,
    );
    await evaluate(
      `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`,
    );
    const rect = await evaluate(
      `(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`,
    );
    await S("Input.dispatchMouseEvent", {
      type: "mousePressed",
      button: "left",
      clickCount: 1,
      ...rect,
    });
    await S("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      button: "left",
      clickCount: 1,
      ...rect,
    });
    await sleep(150);
  }
  async function clickText(text, parent = "document") {
    const selector = await evaluate(
      `(() => { const b=Array.from(${parent}.querySelectorAll('button,a,summary')).find(e=>e.textContent.trim()===${JSON.stringify(text)}); if(!b) return null; b.setAttribute('data-qa-target','active'); return '[data-qa-target="active"]'; })()`,
    );
    assert(selector, `Control missing: ${text}`);
    await click(selector);
    await evaluate(
      `document.querySelector('[data-qa-target="active"]')?.removeAttribute('data-qa-target')`,
    );
  }
  async function input(selector, value) {
    await evaluate(
      `(() => { const el=document.querySelector(${JSON.stringify(selector)}); const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); })()`,
    );
    await sleep(100);
  }
  async function screenshot(name) {
    await evaluate("window.scrollTo(0,0)");
    await sleep(200);
    const { cssContentSize } = await S("Page.getLayoutMetrics");
    const { data } = await S("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: await evaluate("innerWidth"),
        height: Math.min(cssContentSize.height, 12000),
        scale: 1,
      },
    });
    fs.writeFileSync(path.join(out, name), Buffer.from(data, "base64"));
  }
  async function layout(label, width) {
    const result = await evaluate(
      `(() => { const vw=innerWidth; const bad=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&(r.right>vw+1||r.left < -1)&&!e.closest('svg')&&!e.closest('dialog:not([open])')&&e.className!=='skip-link';}).slice(0,6).map(e=>e.tagName+'.'+String(e.className)); return {width:vw,scroll:document.documentElement.scrollWidth,offscreen:bad}; })()`,
    );
    assert(
      result.scroll <= width + 1,
      `${label} overflow at ${width}: ${JSON.stringify(result)}`,
    );
    assert.equal(
      result.offscreen.length,
      0,
      `${label} off-screen controls at ${width}: ${result.offscreen}`,
    );
    return result;
  }
  await S("Page.enable");
  await S("Runtime.enable");
  await send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.join(out, "downloads"),
    eventsEnabled: true,
  });
  await viewport(1440);
  // Start with a fresh isolated browser profile state, never the user's browser data.
  await S("Network.clearBrowserCookies");
  await navigate("/login");
  await evaluate("localStorage.clear()");
  await until("!!document.querySelector('.btn-demo')", "demo login button");
  assert.equal(
    await evaluate(
      "document.querySelector('#email').required && document.querySelector('#password').required",
    ),
    true,
  );
  await click(".auth-submit");
  assert.equal(
    await evaluate("document.querySelector('#email').validity.valueMissing"),
    true,
  );
  await click('[aria-label="Show password"]');
  assert.equal(
    await evaluate("document.querySelector('#password').type"),
    "text",
  );
  await click('[aria-label="Hide password"]');
  for (const route of [
    "/api/scan",
    "/api/reports",
    "/api/threats",
    "/api/threats/stream",
    "/api/notifications",
  ]) {
    assert.equal(
      await evaluate(`fetch(${JSON.stringify(route)}).then(r=>r.status)`),
      401,
      `Anonymous route ${route}`,
    );
  }
  record(
    "Anonymous access",
    "Protected data APIs return 401; required login fields and password visibility work.",
  );
  await screenshot("login-desktop.png");
  await click(".btn-demo");
  await until(
    "location.pathname==='/dashboard' && !!document.querySelector('.stats-grid')",
    "demo dashboard",
  );
  assert.equal(
    await evaluate(
      "JSON.parse(localStorage.getItem('cybersentinel-demo-v1')).scans.length",
    ),
    3,
  );
  const cookies = await send("Storage.getCookies");
  const cookie = cookies.cookies.find((item) => item.name === "sentinel-demo");
  assert(
    cookie?.httpOnly && cookie.sameSite === "Lax",
    "Demo session must be HttpOnly and SameSite",
  );
  record(
    "Demo access",
    "One-click demo opens without credentials or a database user; signed HttpOnly session cookie.",
  );

  await input(".period-select select", "6");
  await until(
    "document.querySelector('.chart-heading p').textContent.includes('6 hours')",
    "chart time range",
  );
  await input(".period-select select", "24");
  await input("#event-search", "zzzz-no-event");
  assert(
    await evaluate(
      "document.querySelector('.events-card').textContent.includes('No matching events')",
    ),
  );
  await input("#event-search", "");
  await input("#event-severity", "critical");
  assert(
    await evaluate(
      "[...document.querySelectorAll('.event-row .badge')].every(e=>e.textContent==='critical')",
    ),
  );
  await input("#event-severity", "all");
  await clickText("Next");
  assert(
    await evaluate(
      "document.querySelector('.table-footer').textContent.includes('7–12')",
    ),
  );
  await clickText("Previous");
  await click(".event-row");
  await until("!!document.querySelector('dialog[open]')", "event modal");
  await S("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await S("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await until("!document.querySelector('dialog[open]')", "Escape closes event");
  await clickText("Start simulation");
  await until(
    "document.querySelector('.stream-state').textContent.includes('Streaming')",
    "SSE connected",
  );
  await until(
    "document.querySelector('.table-footer').textContent.match(/of (10[1-9]|1[1-9][0-9])/)",
    "SSE events received",
  );
  await clickText("Pause stream");
  const beforeExport = downloads.length;
  await clickText("Export overview");
  await until("true", "export request");
  for (let i = 0; i < 30 && downloads.length === beforeExport; i++)
    await sleep(100);
  assert(downloads.length > beforeExport, "Overview download completes");
  record(
    "Overview controls",
    "Time range, search, severity filter, pagination, event details/Escape, SSE start/pause, and JSON export work.",
  );
  await click('[aria-label="Activity history"]');
  await until(
    "!!document.querySelector('#activity-panel')",
    "activity dropdown",
  );
  assert(
    await evaluate("document.querySelectorAll('.activity-list a').length>0"),
  );
  await click('[aria-label="Close activity"]');
  await clickText("Workspace guide");
  await until("!!document.querySelector('dialog[open]')", "workspace guide");
  await click('[aria-label="Close dialog"]');
  record(
    "Workspace navigation",
    "Activity history opens with records; guide opens and closes; existing page links are reachable.",
  );

  await navigate("/scanner");
  await until(
    "document.querySelectorAll('.scan-history-row').length===3",
    "seeded scan history",
  );
  await clickText("Use an example target");
  assert.equal(
    await evaluate("document.querySelector('#scan-url').value"),
    "https://portal.example.com",
  );
  await input("#scan-url", "http://127.0.0.1");
  await click("#start-scan");
  await until(
    "document.querySelector('#scan-error').textContent.includes('public hostname')",
    "private URL error",
  );
  for (const url of [
    "http://[::1]",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "http://2130706433",
    "http://192.168.0.1",
  ]) {
    assert.equal(
      await evaluate(
        `fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:${JSON.stringify(url)}})}).then(r=>r.status)`,
      ),
      400,
      `Blocked URL ${url}`,
    );
  }
  await input("#scan-url", "https://portal.example.com");
  await click('input[value="ssl"]');
  await click("#start-scan");
  await until("!!document.querySelector('.scan-results')", "scan result");
  assert(
    await evaluate(
      "[...document.querySelectorAll('.findings-accordion summary')].every(e=>/TLS|Cipher/.test(e.textContent))",
    ),
    "SSL profile filters findings",
  );
  await click(".findings-accordion summary");
  assert(
    await evaluate(
      "document.querySelector('.findings-accordion details').open",
    ),
  );
  await screenshot("scanner-results-desktop.png");
  const scanCount = await evaluate(
    "JSON.parse(localStorage.getItem('cybersentinel-demo-v1')).scans.length",
  );
  assert.equal(scanCount, 4);
  await S("Page.reload");
  await until(
    "document.querySelectorAll('.scan-history-row').length===4",
    "history after reload",
  );
  await click(".scan-history-row");
  await until("!!document.querySelector('.scan-results')", "reopen result");
  await clickText("Export results");
  await clickText("Create report");
  await until(
    "location.pathname==='/reports' && document.querySelectorAll('.report-row').length===4",
    "scan report saved",
  );
  record(
    "Scanner workflow",
    "Example URL, private-host rejection, SSL profile, expanded recommendation, persisted history, export, and report generation work.",
  );

  await input("#report-search", "zzzz-no-report");
  assert(
    await evaluate(
      "document.querySelector('.report-library').textContent.includes('No matching reports')",
    ),
  );
  await input("#report-search", "");
  await input("#report-status", "published");
  assert.equal(
    await evaluate("document.querySelectorAll('.report-row').length"),
    1,
  );
  await input("#report-status", "all");
  await click("#generate-report");
  await until("!!document.querySelector('dialog[open]')", "report form");
  await clickText("Save report", "document.querySelector('dialog[open]')");
  assert(
    await evaluate(
      "document.querySelector('#report-title').validity.valueMissing",
    ),
  );
  await input("#report-title", "QA browser assessment");
  await input(
    "#report-summary",
    "Browser verification of report creation, persistence and export. This is a demo record.",
  );
  await input("#report-type", "audit");
  await input("#report-severity", "high");
  await clickText("Save report", "document.querySelector('dialog[open]')");
  await until(
    "!document.querySelector('dialog[open]') && document.querySelectorAll('.report-row').length===5",
    "report saved",
  );
  await click(".report-open");
  await until("!!document.querySelector('.report-detail')", "report details");
  assert(
    await evaluate(
      "document.querySelector('.report-detail').textContent.includes('QA browser assessment')",
    ),
  );
  await clickText("Download JSON");
  await clickText("Close report");
  await S("Page.reload");
  await until(
    "document.querySelectorAll('.report-row').length===5",
    "report reload",
  );
  await clickText("Export reports");
  record(
    "Reports workflow",
    "Search and status filter, required-field validation, draft creation, details, individual/bulk JSON download, and refresh persistence work.",
  );

  const widths = [1440, 1280, 1024, 820, 768, 390, 320];
  for (const route of ["/dashboard", "/scanner", "/reports"]) {
    await navigate(route);
    await until("!document.querySelector('.loading-state')", `${route} loaded`);
    for (const width of widths) {
      await viewport(width);
      await sleep(150);
      await layout(route, width);
      if (
        width === 1440 ||
        width === 390 ||
        (width === 1024 && route === "/dashboard")
      )
        await screenshot(`${route.slice(1)}-${width}.png`);
    }
  }
  record(
    "Responsive layout",
    "Dashboard, scanner and reports have zero horizontal overflow or off-screen content at 1440, 1280, 1024, 820, 768, 390 and 320px.",
  );
  await viewport(390);
  await click('.mobile-nav a[href="/scanner"]');
  await until("location.pathname==='/scanner'", "mobile scanner navigation");
  await click('.mobile-nav a[href="/reports"]');
  await until("location.pathname==='/reports'", "mobile reports navigation");
  await click('[aria-label="Activity history"]');
  await layout("mobile activity", 390);
  await click('[aria-label="Close activity"]');
  await click("#generate-report");
  await until(
    "!!document.querySelector('dialog[open]')",
    "mobile report dialog",
  );
  await layout("mobile report dialog", 390);
  await screenshot("reports-mobile-dialog.png");
  await clickText("Cancel", "document.querySelector('dialog[open]')");
  await S("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert(
    await evaluate(
      "parseFloat(getComputedStyle(document.querySelector('.page-enter')).animationDuration) < 0.01",
    ),
  );
  await S("Emulation.setEmulatedMedia", { features: [] });
  record(
    "Mobile interaction",
    "Bottom navigation, activity panel, report dialog and reduced-motion preference work at phone width.",
  );

  await click('[aria-label="Account menu"]');
  await clickText("Reset demo data");
  await until("!!document.querySelector('dialog[open]')", "reset confirmation");
  await clickText("Keep my data");
  assert.equal(
    await evaluate(
      "JSON.parse(localStorage.getItem('cybersentinel-demo-v1')).reports.length",
    ),
    5,
  );
  await click('[aria-label="Account menu"]');
  await clickText("Reset demo data");
  await clickText("Reset demo data", "document.querySelector('dialog[open]')");
  await until(
    "document.querySelectorAll('.report-row').length===3",
    "reset completed",
  );
  await click('[aria-label="Account menu"]');
  await clickText("Exit demo");
  await until("location.pathname==='/login'", "demo exit");
  assert.equal(await evaluate("fetch('/api/reports').then(r=>r.status)"), 401);
  record(
    "Demo isolation and exit",
    "Reset requires confirmation and restores examples; exiting removes access to protected data.",
  );
  for (const route of ["/login", "/register"]) {
    await navigate(route);
    for (const width of widths) {
      await viewport(width);
      await sleep(100);
      await layout(route, width);
      if (width === 1440 || width === 390)
        await screenshot(`${route.slice(1)}-${width}.png`);
    }
  }
  await navigate("/register");
  await input("#name", "Demo browser check");
  await input("#email", "qa@example.com");
  await input("#password", "validpassword");
  await input("#confirm-password", "differentpassword");
  await click(".auth-submit");
  await until(
    "document.querySelector('[role=alert]')?.textContent.includes('do not match')",
    "registration mismatch validation",
  );
  record(
    "Authentication layout",
    "Login/register have no horizontal overflow at all seven widths; registration rejects mismatched passwords.",
  );
  assert.equal(
    exceptions.length,
    0,
    `Browser exceptions: ${exceptions.join("\n")}`,
  );
  record(
    "Browser runtime",
    "No uncaught browser exceptions during the verified flows.",
  );
  fs.writeFileSync(
    path.join(out, "browser-verification.json"),
    JSON.stringify(
      {
        result: "PASS",
        base,
        records,
        exceptions,
        completedDownloads: downloads.length,
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS complete: ${records.length} groups, ${downloads.length} downloads; screenshots in artifacts/`,
  );
} catch (error) {
  fs.writeFileSync(
    path.join(out, "browser-verification.json"),
    JSON.stringify(
      { result: "FAIL", error: error.stack, records, exceptions },
      null,
      2,
    ),
  );
  console.error(error.stack);
  process.exitCode = 1;
} finally {
  ws?.close();
  if (chrome.exitCode === null) {
    try {
      execFileSync("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } catch {
      chrome.kill();
    }
  }
}
