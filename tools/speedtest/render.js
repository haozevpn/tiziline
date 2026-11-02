"use strict";

// 把 results.json 的真实采集数据渲染成一段可嵌入的 HTML 数据表。
//
// 用法：
//   node tools/speedtest/render.js            打印最新一次采集的 HTML 片段到标准输出
//   node tools/speedtest/render.js --slug jilianyun   只渲染某一家
//   node tools/speedtest/render.js --out fragment.html 写入文件
//
// 产出的表格只含 measure.js 真实测到的字段（延迟分布、抖动、丢包、采集时间）。
// 下载速率/解锁状态等需要人工实测的列，仅在 results.json 中显式存在时才渲染，
// 缺失一律显示“—”，绝不插值或编造。

const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const RESULTS_PATH = path.join(DIR, "results.json");

function parseArgs(argv) {
  const o = { slug: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--slug") o.slug = argv[++i];
    else if (argv[i] === "--out") o.out = argv[++i];
  }
  return o;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function cell(v, unit) {
  if (v === null || v === undefined) return "—";
  return esc(v) + (unit || "");
}

function fmtDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function render(record, slugFilter) {
  const windowLabel = record.timeWindow === "peak" ? "晚高峰" : "非高峰";
  let airports = record.airports;
  if (slugFilter) airports = airports.filter((a) => a.slug === slugFilter);

  const rows = [];
  for (const ap of airports) {
    for (const n of ap.nodes) {
      rows.push(`      <tr>
        <td>${esc(ap.name)}</td>
        <td>${esc(n.region)}</td>
        <td>${cell(n.median, "ms")}</td>
        <td>${cell(n.min, "ms")}</td>
        <td>${cell(n.p95, "ms")}</td>
        <td>${cell(n.jitter, "ms")}</td>
        <td>${cell(n.lossPct, "%")}</td>
        <td>${cell(n.downloadMbps, " Mbps")}</td>
      </tr>`);
    }
  }

  return `<section class="speedtest-data">
  <h2>节点实测数据</h2>
  <p class="speedtest-meta">采集时间：${esc(fmtDate(record.measuredAt))}（${windowLabel}）· 方法：TCP 握手延迟，每节点 ${
    record.airports[0]?.nodes[0]?.attempts || "多"
  } 次取样 · 丢包为连接超时/被拒比例。下载速率为人工实测填入，未测显示“—”。</p>
  <div class="table-wrap">
    <table class="rank-table speedtest-table">
      <thead><tr>
        <th>机场</th><th>节点</th><th>延迟(中位)</th><th>最低</th><th>P95</th><th>抖动</th><th>丢包</th><th>下载</th>
      </tr></thead>
      <tbody>
${rows.join("\n")}
      </tbody>
    </table>
  </div>
  <p class="speedtest-note">数据由本站脚本在固定时段客户端采集，可复现；节点和线路状态会变化，以你自己订阅实测为准。</p>
</section>
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error("找不到 results.json，请先运行 measure.js 采集真实数据。");
    process.exit(1);
  }
  const history = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"));
  if (!Array.isArray(history) || !history.length) {
    console.error("results.json 为空，没有可渲染的采集记录。");
    process.exit(1);
  }
  const latest = history[history.length - 1];
  const html = render(latest, args.slug);
  if (args.out) {
    fs.writeFileSync(path.join(DIR, args.out), html, "utf8");
    console.log(`已写入 ${args.out}`);
  } else {
    process.stdout.write(html);
  }
}

main();
