"use strict";

// 节点测速采集器（真实测量，零外部依赖）
//
// 做什么：对 config.json 里每个节点重复建立 TCP 连接，统计
//   - 延迟：TCP 三次握手完成耗时（min / 中位数 / p95 / 平均）
//   - 抖动：相邻两次延迟差的平均绝对值
//   - 丢包：连接超时或被拒的比例
// 这些都是客户端真实可测、可复现的指标，不涉及任何人工填写。
//
// 不做什么：不编造下载速率、不猜解锁状态。需要真连代理才能得到的指标
// （下载带宽、流媒体/AI 解锁）由你用真实 speedtest 跑完后，在渲染阶段
// 作为显式字段填入 results.json，程序绝不代填。
//
// 用法：
//   1) cp tools/speedtest/config.example.json tools/speedtest/config.json
//   2) 编辑 config.json，填入你订阅里的真实 host:port
//   3) node tools/speedtest/measure.js
//      结果追加写入 tools/speedtest/results.json（带 UTC 时间戳）

const fs = require("fs");
const net = require("net");
const path = require("path");

const DIR = __dirname;
const CONFIG_PATH = path.join(DIR, "config.json");
const RESULTS_PATH = path.join(DIR, "results.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(
      "找不到 config.json。请先复制 config.example.json 为 config.json 并填入真实节点。"
    );
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  cfg.attempts = cfg.attempts || 20;
  cfg.connectTimeoutMs = cfg.connectTimeoutMs || 2000;
  cfg.intervalMs = cfg.intervalMs || 200;
  return cfg;
}

// 单次 TCP 连接，resolve 为握手毫秒数；超时/出错 resolve 为 null（记为丢包）
function connectOnce(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const socket = new net.Socket();
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      done(Math.round(ms * 100) / 100);
    });
    socket.once("timeout", () => done(null));
    socket.once("error", () => done(null));
    socket.connect(port, host);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stats(samples) {
  const ok = samples.filter((s) => s !== null).sort((a, b) => a - b);
  const total = samples.length;
  const lossPct = Math.round(((total - ok.length) / total) * 1000) / 10;
  if (!ok.length) {
    return { attempts: total, success: 0, lossPct, min: null, median: null, p95: null, avg: null, jitter: null };
  }
  const q = (arr, p) => arr[Math.min(arr.length - 1, Math.floor(p * (arr.length - 1)))];
  const avg = Math.round((ok.reduce((a, b) => a + b, 0) / ok.length) * 100) / 100;
  // 抖动：按采集顺序算相邻差的平均绝对值（用成功样本的原顺序）
  const seq = samples.filter((s) => s !== null);
  let jitter = null;
  if (seq.length > 1) {
    let sum = 0;
    for (let i = 1; i < seq.length; i++) sum += Math.abs(seq[i] - seq[i - 1]);
    jitter = Math.round((sum / (seq.length - 1)) * 100) / 100;
  }
  return {
    attempts: total,
    success: ok.length,
    lossPct,
    min: ok[0],
    median: q(ok, 0.5),
    p95: q(ok, 0.95),
    avg,
    jitter,
  };
}

async function measureNode(node, cfg) {
  const samples = [];
  for (let i = 0; i < cfg.attempts; i++) {
    samples.push(await connectOnce(node.host, node.port, cfg.connectTimeoutMs));
    if (i < cfg.attempts - 1) await sleep(cfg.intervalMs);
  }
  return { region: node.region, host: node.host, port: node.port, ...stats(samples) };
}

async function main() {
  const cfg = loadConfig();
  const runStartedAt = new Date().toISOString();
  const hour = new Date().getHours();
  const isPeak = hour >= 20 && hour < 23; // 晚高峰 20:00-23:00 本地时间
  console.log(
    `开始采集：${cfg.airports.length} 家机场，每节点 ${cfg.attempts} 次，` +
      `时段 ${isPeak ? "晚高峰" : "非高峰"}（本地 ${hour} 点）`
  );

  const results = [];
  for (const ap of cfg.airports) {
    const nodes = [];
    for (const node of ap.nodes || []) {
      if (!node.host || node.host.includes("填入")) {
        console.warn(`  跳过 ${ap.name} / ${node.region}：host 未填写真实地址`);
        continue;
      }
      process.stdout.write(`  测 ${ap.name} / ${node.region} ... `);
      const r = await measureNode(node, cfg);
      console.log(
        r.median === null
          ? `全部失败（丢包 ${r.lossPct}%）`
          : `中位 ${r.median}ms，丢包 ${r.lossPct}%`
      );
      nodes.push(r);
    }
    if (nodes.length) results.push({ name: ap.name, slug: ap.slug, nodes });
  }

  const record = {
    measuredAt: runStartedAt,
    timeWindow: isPeak ? "peak" : "offpeak",
    method: "tcp-connect",
    note: "延迟为 TCP 握手耗时；丢包为连接超时/被拒比例。下载速率与解锁状态不在本采集内，需人工实测填入。",
    airports: results,
  };

  let history = [];
  if (fs.existsSync(RESULTS_PATH)) {
    try {
      history = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"));
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
  }
  history.push(record);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(history, null, 2) + "\n", "utf8");
  console.log(`\n完成。本次结果已追加到 ${path.relative(process.cwd(), RESULTS_PATH)}（累计 ${history.length} 次采集）。`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
