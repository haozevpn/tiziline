const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SITE_URL = "https://tiziline.com";
const GENERIC_TITLES = [
  "2026年稳定机场推荐：不同预算怎么选？",
  "高性价比机场推荐：价格、流量与线路对比",
  "便宜好用的机场有哪些？低预算选择指南",
  "稳定机场怎么选？购买前重点关注这几个指标",
  "月付机场推荐：适合短期使用的灵活套餐",
  "不限时流量机场推荐：低频用户如何选择？",
  "按量付费机场推荐：偶尔使用怎么买更划算？",
  "大流量机场推荐：适合视频与多设备用户",
  "IPLC专线机场推荐：价格贵在哪里？",
  "IEPL机场推荐：线路特点与适合人群分析",
  "原生IP机场推荐：哪些场景真的需要原生节点？",
  "小众机场推荐：人少速度快，但有哪些风险？",
  "老牌机场推荐：运营时间长是否更可靠？",
  "学生党机场推荐：低预算套餐选择指南",
  "家庭多设备机场推荐：设备数量与流量怎么选？",
  "机场怎么选？新手购买订阅完整指南",
  "什么是机场订阅？节点、线路与套餐基础知识",
  "机场节点越多越好吗？常见选购误区解析",
  "机场倍率是什么意思？流量扣除规则详细说明",
  "机场直连、中转和专线有什么区别？",
  "IPLC、IEPL和普通中转线路有什么区别？",
  "机场流量买多少合适？不同使用场景用量估算",
  "月付、季付还是年付？机场套餐周期怎么选？",
  "为什么不同机场价格差距这么大？",
  "机场延迟越低越好吗？测速数据应该怎么看？",
  "原生IP和广播IP有什么区别？",
  "机场流媒体解锁是什么意思？购买前如何判断？",
  "机场有必要准备备用线路吗？",
  "一个机场订阅可以同时连接多少台设备？",
  "机场订阅和传统VPN有什么区别？",
  "如何客观测评一家机场？六项核心指标解析",
  "机场测速教程：延迟、速度、丢包率怎么看？",
  "低价机场和高价机场有什么区别？实际体验对比",
  "专线机场与普通机场实测差距有多大？",
  "年付机场和月付机场哪个更值得购买？",
  "大机场与小机场哪个好？稳定性与服务对比",
  "机场节点数量和节点质量哪个更重要？",
  "晚高峰机场测速：为什么白天快、晚上却很慢？",
  "同价位机场横向对比应该关注哪些指标？",
  "机场订阅怎么用？从购买到导入的完整教程",
  "机场订阅链接怎么导入客户端？",
  "机场订阅更新失败怎么办？常见原因汇总",
  "机场节点全部超时怎么办？完整排查步骤",
  "机场能连接但打不开网页是什么原因？",
  "机场节点延迟低却很卡？常见原因分析",
  "机场晚高峰速度慢怎么办？节点选择技巧",
  "机场流量消耗过快怎么办？倍率与后台流量排查",
  "机场订阅链接泄露了怎么办？",
  "更换设备后机场不能使用怎么办？",
  "机场客户端显示订阅过期怎么解决？",
  "机场官网打不开，是维护还是跑路？",
  "机场节点怎么手动选择？不同地区节点的区别",
  "机场自动选择节点好用吗？策略组使用指南",
  "如何测试机场节点的真实下载速度？",
  "机场订阅转换安全吗？使用前要注意什么",
  "购买机场之前必须知道的十个避坑要点",
  "机场年付安全吗？长期套餐的风险分析",
  "如何判断一家机场是否靠谱？",
  "机场跑路前有哪些征兆？",
  "免费机场安全吗？可能存在哪些风险？",
  "超低价机场为什么要谨慎购买？",
  "机场优惠活动值得参加吗？年付促销避坑指南",
  "购买机场后无法退款怎么办？",
  "机场账号共享有哪些风险？",
  "为什么不建议一次购买多年机场套餐？",
  "机场订阅链接为什么不能公开分享？",
  "如何保护机场账户和订阅链接安全？",
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function normalize(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/[\s：:，,。.!！?？、·“”‘’（）()\-—]/g, "")
    .toLowerCase();
}

function localTarget(file, href) {
  const target = path.resolve(path.dirname(file), href);
  if (fs.existsSync(target)) return true;
  if (fs.existsSync(path.join(target, "index.html"))) return true;
  return false;
}

const files = walk(ROOT);
const pages = files.map((file) => ({ file, html: fs.readFileSync(file, "utf8") }));
const allText = normalize(pages.map((page) => page.html).join("\n"));
const missingLongTails = GENERIC_TITLES.filter((title) => !allText.includes(normalize(title)));
const issues = [];
const canonicals = new Map();

for (const page of pages) {
  const rel = path.relative(ROOT, page.file).replace(/\\/g, "/");
  const isNoindex = /<meta name="robots" content="[^"]*noindex/i.test(page.html);
  const description = page.html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || "";
  const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] || "";
  if (!page.html.includes("<title>")) issues.push(`${rel}: missing title`);
  if (!isNoindex && description.length < 80) issues.push(`${rel}: short description (${description.length})`);
  if (!canonical.startsWith(SITE_URL)) issues.push(`${rel}: invalid canonical`);
  if (!isNoindex && !page.html.includes("application/ld+json")) issues.push(`${rel}: missing JSON-LD`);
  if (canonical && !isNoindex) {
    if (canonicals.has(canonical)) issues.push(`${rel}: duplicate canonical with ${canonicals.get(canonical)}`);
    else canonicals.set(canonical, rel);
  }
  for (const match of page.html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:)/i.test(href)) continue;
    if (!localTarget(page.file, href)) issues.push(`${rel}: broken link ${href}`);
  }
}

const postPages = pages.filter((page) => path.relative(ROOT, page.file).replace(/\\/g, "/").startsWith("posts/"));
const missingBrandIntents = [];
for (const page of postPages) {
  const name = page.html.match(/<div><span>机场名称<\/span><strong>([^<]+)<\/strong><\/div>/)?.[1];
  if (!name) continue;
  for (const phrase of [`${name}机场怎么样`, `${name}机场靠谱吗`, `${name}机场值得买吗`, `${name}优惠码与套餐介绍`]) {
    if (!normalize(page.html).includes(normalize(phrase))) missingBrandIntents.push(`${path.basename(page.file)}: ${phrase}`);
  }
  const normalizedPage = normalize(page.html);
  if (!normalizedPage.includes(normalize(`${name}与`)) || !normalizedPage.includes(normalize("哪个好"))) {
    missingBrandIntents.push(`${path.basename(page.file)}: ${name}与其他机场哪个好`);
  }
}

const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const indexNow = JSON.parse(fs.readFileSync(path.join(ROOT, "indexnow-urls.json"), "utf8"));
if (sitemapUrls.length !== indexNow.urls.length) issues.push(`sitemap/indexNow count mismatch: ${sitemapUrls.length}/${indexNow.urls.length}`);
for (const url of sitemapUrls) if (!indexNow.urls.includes(url)) issues.push(`IndexNow missing ${url}`);
if (!fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8").includes(`${SITE_URL}/sitemap.xml`)) issues.push("robots.txt missing sitemap");

const audit = JSON.parse(fs.readFileSync(path.join(ROOT, "content-audit.json"), "utf8"));
if (audit.duplicateTitles.length) issues.push(`content duplicate titles: ${audit.duplicateTitles.length}`);
if (audit.duplicateParagraphs.length) issues.push(`content duplicate paragraphs: ${audit.duplicateParagraphs.length}`);
if (audit.similarPairs.length) issues.push(`content similar pairs: ${audit.similarPairs.length}`);

const result = {
  htmlPages: files.length,
  indexableUrls: sitemapUrls.length,
  genericLongTailTitles: GENERIC_TITLES.length,
  missingLongTails,
  airportReviewPages: postPages.length,
  missingBrandIntents,
  duplicateTitles: audit.duplicateTitles.length,
  duplicateParagraphs: audit.duplicateParagraphs.length,
  similarPairs: audit.similarPairs.length,
  issues,
};

console.log(JSON.stringify(result, null, 2));
if (issues.length || missingLongTails.length || missingBrandIntents.length) process.exitCode = 1;
