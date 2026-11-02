const fs = require("fs");
const path = require("path");

// IndexNow 批量提交脚本
//
// 用法:
//   node tools/submit-indexnow.js              提交 indexnow-urls.json 里的全部 URL
//   node tools/submit-indexnow.js --priority    只提交本次 SEO 改动涉及的重点 URL
//   node tools/submit-indexnow.js --dry-run     只打印将要提交的内容，不真正发请求
//   node tools/submit-indexnow.js --url <URL>   提交单个指定 URL（可重复多次）
//
// 说明：IndexNow 的 key 文件已在站点根目录，Bing、Yandex 等会读取它校验归属。
// 提交到任一 IndexNow 端点即可，参与的搜索引擎会互相同步。

const manifestPath = path.join(__dirname, "..", "indexnow-urls.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// 本次 keyword cannibalization + GEO + hub-spoke 改动直接涉及的页面。
// 变动最大、最该优先重抓的放在这里。
const PRIORITY_URLS = [
  "https://tiziline.com/airport-recommend/", // 主页：消重 + 直接答案块 + 方法论 + FAQ 扩充 + hub 内链
  "https://tiziline.com/recommend/", // canonical 已指向 airport-recommend，需让 Bing 重新识别合并
  "https://tiziline.com/", // 首页导航已改向
  "https://tiziline.com/cheap-airport/",
  "https://tiziline.com/stable-airport/",
  "https://tiziline.com/high-speed-airport/",
  "https://tiziline.com/iepl-airport/",
  "https://tiziline.com/ipcl-airport/",
  "https://tiziline.com/dedicated-airport/",
  "https://tiziline.com/clash-airport/",
  "https://tiziline.com/multi-device-airport/",
  "https://tiziline.com/netflix-airport/",
  "https://tiziline.com/streaming-airport/",
  "https://tiziline.com/chatgpt-airport/",
  "https://tiziline.com/game-airport/",
  "https://tiziline.com/node-recommend/",
  "https://tiziline.com/science-airport/",
];

// 多个 IndexNow 端点；提交任一即可，这里按顺序尝试直到成功一个。
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

function parseArgs(argv) {
  const opts = { dryRun: false, priority: false, urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--priority") opts.priority = true;
    else if (a === "--url") {
      const u = argv[++i];
      if (u) opts.urls.push(u);
    } else if (a === "--help" || a === "-h") {
      opts.help = true;
    }
  }
  return opts;
}

function pickUrls(opts) {
  if (opts.urls.length) return opts.urls;
  if (opts.priority) {
    // 只保留确实在 manifest 里登记过的，避免提交未收录的孤立 URL
    const known = new Set(manifest.urls);
    const picked = PRIORITY_URLS.filter((u) => known.has(u));
    const missing = PRIORITY_URLS.filter((u) => !known.has(u));
    if (missing.length) {
      console.warn(
        `提醒：以下重点 URL 不在 indexnow-urls.json 中，已跳过：\n  ${missing.join("\n  ")}`
      );
    }
    return picked;
  }
  return manifest.urls;
}

async function submitTo(endpoint, urlList) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: manifest.host,
      key: manifest.key,
      keyLocation: manifest.keyLocation,
      urlList,
    }),
  });
  const body = await response.text();
  return { status: response.status, ok: response.ok, body };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(
      [
        "IndexNow 批量提交",
        "  node tools/submit-indexnow.js              提交全部 URL",
        "  node tools/submit-indexnow.js --priority    只提交本次改动重点 URL",
        "  node tools/submit-indexnow.js --dry-run     预览，不发请求",
        "  node tools/submit-indexnow.js --url <URL>   提交单个 URL（可重复）",
      ].join("\n")
    );
    return;
  }

  const urlList = pickUrls(opts);

  if (!urlList.length) {
    console.error("没有可提交的 URL。");
    process.exitCode = 1;
    return;
  }

  console.log(
    `host=${manifest.host}  key=${manifest.key}\n将提交 ${urlList.length} 个 URL` +
      (opts.priority ? "（重点模式）" : "") +
      (opts.dryRun ? "  [dry-run，不发送]" : "")
  );

  if (opts.dryRun) {
    urlList.forEach((u, i) => console.log(`  ${String(i + 1).padStart(3)}. ${u}`));
    console.log("dry-run 结束，未发送任何请求。");
    return;
  }

  let succeeded = false;
  for (const endpoint of ENDPOINTS) {
    try {
      const r = await submitTo(endpoint, urlList);
      console.log(`[${endpoint}] ${r.status}: ${r.body || "accepted"}`);
      // IndexNow 规范里 200/202 都算成功
      if (r.ok || r.status === 202) {
        succeeded = true;
        break;
      }
    } catch (e) {
      console.warn(`[${endpoint}] 请求失败：${e.message}`);
    }
  }

  if (!succeeded) {
    console.error("所有端点均未成功，请检查网络或 key 文件是否可公开访问。");
    process.exitCode = 1;
  } else {
    console.log("提交成功。搜索引擎通常在数分钟到数小时内开始重新抓取。");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
