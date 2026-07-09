const fs = require("fs");
const path = require("path");

const SITE_URL = "https://tiziline.com";
const SITE_NAME = "Tiziline 机场观察";
const TODAY = "2026-07-09";

const airports = [
  ["极连云", "jilianyun", "https://haozevpn.jlyvipaff.com/#/?code=KUKfOY13", "8元 60G/月", "入门首选", "适合刚接触机场订阅、希望用低预算验证线路稳定性的用户。"],
  ["光年梯", "guangnianti", "https://gnt001.gntvipaff.cc/#/?code=j1ufpE44", "7.5元 50G/月", "便宜机场", "适合预算敏感，主要用于查资料、收发消息和轻量视频的用户。"],
  ["影子", "yingzi", "https://www.yingzi01.com/register?code=X7XPN1cS", "18.80元 150GB/月", "中等流量", "适合需要更宽松月流量，同时又不想上来就买高价套餐的人群。"],
  ["边界云机场", "bianjieyun", "https://www.lvpn.cc/r/6UQDZT", "12.33元 50GB/月", "工具订阅", "适合只在需要访问海外服务时打开代理的工具型用户。"],
  ["飞猫云", "feimaoyun", "https://flycat.flycatvipaff.cc/#/?code=1arEKHqh", "84元/年（学生版）", "年付低价", "适合希望低成本保留长期备用订阅的学生党。"],
  ["可信云", "kexinyun", "https://varnexa.kexintttt.xyz/#/register?code=zcjBlIde", "8元 60G/月", "性价比", "适合手机、平板和电脑混合使用，但总流量需求不夸张的用户。"],
  ["速界", "sujie", "https://trevona.speed-world.cc/#/register?code=r7IOqoY7", "7.5元 50G/月", "新手友好", "适合用低成本体验机场客户端订阅流程的新手。"],
  ["快狸", "kuaili", "https://varnexa.kuailitttt.homes/#/register?code=G56QwHto", "10元 30GB/月", "轻量备用", "适合偶尔查资料、登录海外账号、使用 AI 服务的低频用户。"],
  ["边缘节点", "bianyuanjiedian", "https://varnexa.bianyuanjiediantttt.sbs/#/register?code=Oy1wZvzJ", "9元 45GB/月", "节点体验", "适合用不到十元的预算体验多地区节点可用性的用户。"],
  ["光速云", "guangshuyun", "https://kjlq01.gsyvipaff.cc/#/?code=b1OTkTeL", "8.25元 59G/月", "低价日用", "适合在低价和可用流量之间找平衡的个人用户。"],
  ["星岛梦", "xingdaomeng", "https://wuyou202001.xdmvipaff.cc/#/?code=olWCiAhj", "16元 100G/月", "日常主力", "适合作为个人主力机场，覆盖社交、视频、AI 工具和远程办公。"],
  ["全球云", "quanqiuyun", "https://haozevpn.gcvipaff.cc/#/?code=WRQJc2v4", "20元 120G/月", "全球节点", "适合常在不同地区服务之间切换，希望节点覆盖更全面的用户。"],
  ["瞬云机场", "shunyun", "https://ccc.jichang.best/#/register?code=o4I4kToe", "8.25元 59G/月", "轻中度", "适合想要低价但又不想只有极小流量包的用户。"],
  ["寰宇云机场", "huanyuyun", "https://vip3.huanyuyunbest.com/#/register?code=K6h5VWw2", "89元/年 60G/月", "长期备用", "适合长期使用需求稳定在轻量区间的人。"],
  ["Lumina", "lumina", "https://luminak.net/?token=lumina#/register?code=dCgHyjFi", "10元 200GB/月", "大流量低价", "适合预算不高但流量消耗明显的人，比如视频、资料下载和多设备并行。"],
  ["拼好连", "pinhaolian", "https://sxzofrnamc.runwayhz.com/#/register?code=A63zaSvx", "9.90元 100GB/月", "百 G 入门", "适合用十元左右预算获得 100GB 月流量的个人用户。"],
  ["99吧", "99bar", "https://99vpn.bar/#/register?code=Uni7IOJh", "7.5元 66GB/月", "学生党", "适合学生党、低预算用户和只需要基础访问能力的人。"],
  ["锦云机场", "jinyun", "https://w2.whengdl.com/#/register?code=BIGc8qrQ", "6元 50GB/月", "超低价", "适合把价格放在首位，只需要基本可用订阅的轻量用户。"],
  ["山海机场", "shanhai", "https://shanhai.sbs/#/register?code=qVTbPfWP", "3元 128G/月", "极低价", "适合想用极低成本尝试大流量套餐，但能接受自行测试风险的用户。"],
].map(([name, slug, url, cheap, tag, angle]) => ({ name, slug, url, cheap, tag, angle }));

const knowledgeTopics = [
  ["机场和 VPN 有什么区别？新手应该怎么选", "airport-vs-vpn", "区别选择", "很多新手会把机场和 VPN 混在一起，其实二者在产品形态、客户端、线路组织和使用风险上都有明显差异。"],
  ["IEPL、IPLC、BGP 中转是什么意思", "iepl-iplc-bgp", "线路科普", "机场页面经常写 IEPL、IPLC、BGP 中转、专线入口，这些词会影响价格，也会影响晚高峰体验。"],
  ["机场套餐里的倍率、流量和设备数怎么看", "traffic-rate-device", "套餐选择", "机场套餐不能只看月费，倍率、月流量、重置周期和设备数量共同决定真实使用成本。"],
  ["Clash、Mihomo、Shadowrocket 订阅导入指南", "client-subscription-guide", "客户端", "订阅链接是机场使用的核心入口，正确导入和定期更新能减少很多连接问题。"],
  ["如何测试机场晚高峰稳定性", "peak-hour-test", "测速方法", "机场是否稳定，不能只看白天测速，晚高峰连续使用才更接近真实体验。"],
  ["机场流媒体解锁为什么会失效", "streaming-unlock", "流媒体", "Netflix、Disney+、TikTok 等服务会识别节点 IP，解锁能力并不是永久固定的。"],
  ["ChatGPT、Claude 使用机场时要注意什么", "ai-service-guide", "AI 工具", "AI 服务对 IP、地区和登录状态比较敏感，机场节点选择不当容易触发验证或风控。"],
  ["机场节点地区怎么选：香港、日本、新加坡、美国", "node-region-guide", "节点地区", "不同节点地区适合不同任务，延迟、解锁和稳定性不能只看距离远近。"],
  ["机场跑路前常见信号和止损方法", "airport-risk-signals", "风险控制", "机场行业变化快，学会识别异常信号，比事后追责更重要。"],
  ["备用机场为什么重要：主力和备用怎么搭配", "backup-airport", "备用方案", "只依赖一家机场会放大维护、域名迁移和节点波动的影响，备用方案能降低中断风险。"],
  ["机场订阅链接泄露会发生什么", "subscription-security", "安全隐私", "订阅链接本质上是你的节点凭证，泄露后可能被消耗流量，也可能引发账号风控。"],
  ["手机端使用机场的常见问题", "mobile-airport-guide", "手机端", "手机端常见问题包括系统代理、规则模式、耗电、通知和后台保活。"],
  ["电脑端使用机场的常见问题", "desktop-airport-guide", "电脑端", "电脑端更适合复杂规则和多软件协作，但也更容易被系统代理、DNS 和防火墙影响。"],
  ["便宜机场为什么有时不便宜", "cheap-airport-cost", "低价避坑", "便宜机场的真实成本不只在月费，还包括排查问题、重复购买和不稳定带来的时间损耗。"],
  ["第一次买机场的完整检查清单", "first-buy-checklist", "购买清单", "第一次买机场不用追求一步到位，按清单逐项验证能避开大部分新手坑。"],
].map(([title, slug, tag, intro]) => ({ title, slug, tag, intro }));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function prefixFor(pathName) {
  if (pathName === "/") return "";
  const clean = pathName.replace(/^\/+|\/+$/g, "");
  const depth = clean.includes(".") ? clean.split("/").length - 1 : clean.split("/").length;
  return "../".repeat(depth);
}

function localHref(prefix, target) {
  if (target === "") return `${prefix}index.html`;
  if (target.endsWith("/")) return `${prefix}${target}index.html`;
  return `${prefix}${target}`;
}

function relink(html, prefix) {
  return html.replace(/href="\/([^"#?]*)"/g, (_, target) => `href="${localHref(prefix, target)}"`);
}

function layout({ title, description, pathName, content, extraHead = "" }) {
  const prefix = prefixFor(pathName);
  const canonical = `${SITE_URL}${pathName}`;
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ${SITE_NAME}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  ${extraHead}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="${SITE_NAME}">
      <span class="brand-mark"></span>
      <span>${SITE_NAME}</span>
    </a>
    <nav class="top-nav" aria-label="主导航">
      <a href="/">首页</a>
      <a href="/rank/">机场排行</a>
      <a href="/reviews/">机场测评</a>
      <a href="/knowledge/">科普知识</a>
      <a href="/about/">关于我们</a>
    </nav>
  </header>
  <main>
${content}
  </main>
  <footer class="site-footer">
    <p>${SITE_NAME} 只做公开信息整理与选购思路说明，套餐、节点和注册链接以服务商官网实时页面为准。</p>
    <p><a href="/sitemap.xml">Sitemap</a> · <a href="/robots.txt">Robots</a></p>
  </footer>
</body>
</html>
`;
  return relink(html, prefix);
}

function schema(title, description, pathName) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: TODAY,
    dateModified: TODAY,
    author: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}${pathName}`,
  })}</script>`;
}

function airportCard(item) {
  return `<a class="post-card" href="/posts/${item.slug}.html">
    <span class="tag">${item.tag}</span>
    <h3>${item.name}</h3>
    <p>${item.cheap} · ${item.angle}</p>
  </a>`;
}

function knowledgeCard(item) {
  return `<a class="post-card" href="/knowledge/${item.slug}.html">
    <span class="tag">${item.tag}</span>
    <h3>${item.title}</h3>
    <p>${item.intro}</p>
  </a>`;
}

function homePage() {
  const content = `    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">2026 机场推荐博客</p>
        <h1>机场订阅怎么选，一次看清价格、流量和风险</h1>
        <p>这里整理去重后的机场排行、独立测评、注册链接、最低套餐和机场科普知识。内容按真实选购流程组织，方便新手快速筛选，也方便老用户查漏补缺。</p>
        <div class="hero-actions">
          <a class="button primary" href="/rank/">查看机场排行</a>
          <a class="button secondary" href="/knowledge/">阅读科普知识</a>
        </div>
      </div>
      <div class="hero-visual" aria-label="机场线路视觉图">
        <div class="radar"></div>
        <div class="route r1"></div>
        <div class="route r2"></div>
        <div class="route r3"></div>
        <span class="node n1">HK</span>
        <span class="node n2">JP</span>
        <span class="node n3">SG</span>
        <span class="node n4">US</span>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>机场排行</h2><a href="/rank/">全部排行</a></div>
      <div class="post-grid">${airports.slice(0, 6).map(airportCard).join("")}</div>
    </section>
    <section class="section">
      <div class="section-head"><h2>科普知识</h2><a href="/knowledge/">全部科普</a></div>
      <div class="post-grid">${knowledgeTopics.slice(0, 6).map(knowledgeCard).join("")}</div>
    </section>`;
  return layout({ title: "机场排行、机场测评与科普知识", description: "整理机场排行、机场测评、机场科普知识、注册链接和套餐对比。", pathName: "/", content });
}

function rankPage(pathName = "/rank/") {
  const rows = airports.map((item, index) => `<tr>
    <td>${index + 1}</td>
    <td><a href="/posts/${item.slug}.html">${item.name}</a></td>
    <td>${item.cheap}</td>
    <td>${item.tag}</td>
    <td>${item.angle}</td>
    <td><a href="${escapeHtml(item.url)}" target="_blank" rel="nofollow sponsored noopener">注册</a></td>
  </tr>`).join("");
  const content = `    <section class="list-hero">
      <p class="eyebrow">Airport Ranking</p>
      <h1>机场排行</h1>
      <p>这里放去重后的机场列表，按低价、流量和适用场景综合整理。排行不等于绝对优劣，建议结合自己的运营商、地区、客户端和晚高峰表现做最终判断。</p>
    </section>
    <section class="section">
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>机场</th><th>最低套餐</th><th>定位</th><th>适合人群</th><th>入口</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
  return layout({ title: "机场排行", description: "18 家去重机场排行列表，包含最低套餐、定位、适合人群和注册链接。", pathName, content });
}

function reviewsPage() {
  const content = `    <section class="list-hero">
      <p class="eyebrow">Airport Reviews</p>
      <h1>机场测评</h1>
      <p>这里集中放每个机场的独立测评文章，包含官网入口、最低套餐、适合人群、线路观察和购买前注意事项。</p>
    </section>
    <section class="section">
      <div class="post-grid">${airports.map(airportCard).join("")}</div>
    </section>`;
  return layout({ title: "机场测评", description: "18 篇机场测评文章合集，覆盖价格、流量、节点和风险控制。", pathName: "/reviews/", content });
}

function knowledgePage() {
  const content = `    <section class="list-hero">
      <p class="eyebrow">Knowledge Base</p>
      <h1>科普知识</h1>
      <p>这里整理 15 篇机场相关科普文章，覆盖线路、套餐、客户端、节点地区、流媒体、AI 工具、安全和购买避坑。</p>
    </section>
    <section class="section">
      <div class="post-grid">${knowledgeTopics.map(knowledgeCard).join("")}</div>
    </section>`;
  return layout({ title: "科普知识", description: "15 篇机场相关科普知识文章，帮助新手理解机场订阅和科学上网基础概念。", pathName: "/knowledge/", content });
}

function aboutPage() {
  const content = `    <article class="article">
      <div class="article-hero">
        <p class="eyebrow">About</p>
        <h1>关于我们</h1>
        <p class="lead">Tiziline 机场观察是一个机场推荐与科普型静态博客，主要整理公开页面中的机场信息、套餐入口、使用场景和选购注意事项。</p>
      </div>
      <section>
        <h2>本站定位</h2>
        <p>本站不运营机场服务，也不提供代理节点。所有文章都以公开资料整理、选购逻辑说明和新手科普为主，帮助读者理解机场套餐、线路类型、客户端配置、流媒体解锁、AI 工具访问和风险控制。</p>
        <p>机场行业变化很快，套餐价格、域名入口、节点质量和售后状态都可能随时调整。本站内容适合作为筛选参考，真正下单前仍应以服务商官网实时页面为准。</p>
      </section>
      <section>
        <h2>内容原则</h2>
        <p>我们优先关注可读性和实用性：把复杂术语讲清楚，把适合人群写明白，把购买风险提前说明。对于低价套餐、年付套餐和共用跳转入口，会尽量提醒读者先短周期测试，避免冲动长付。</p>
      </section>
    </article>`;
  return layout({ title: "关于我们", description: "了解 Tiziline 机场观察的内容定位、信息来源和更新原则。", pathName: "/about/", content });
}

function airportArticle(item, index) {
  const title = `${item.name}机场怎么样？${item.cheap} 套餐、注册链接与测评`;
  const description = `${item.name}机场测评：整理官网入口、最低套餐、适合人群、线路观察和购买前注意事项。`;
  const related = airports.filter((airport) => airport.slug !== item.slug).slice(index % 6, index % 6 + 3);
  const content = `    <article class="article">
      <div class="article-hero">
        <p class="eyebrow">机场测评 · ${TODAY}</p>
        <h1>${title}</h1>
        <p class="lead">${item.angle} 本文基于公开页面整理 ${item.name} 的入口、价格、使用场景和避坑要点，适合在下单前快速建立判断框架。</p>
        <div class="hero-actions">
          <a class="button primary" href="${escapeHtml(item.url)}" target="_blank" rel="nofollow sponsored noopener">访问 ${item.name} 注册入口</a>
          <a class="button secondary" href="/reviews/">返回机场测评</a>
        </div>
      </div>
      <section class="quick-card">
        <div><span>机场名称</span><strong>${item.name}</strong></div>
        <div><span>最低套餐</span><strong>${item.cheap}</strong></div>
        <div><span>定位</span><strong>${item.tag}</strong></div>
      </section>
      <section>
        <h2>${item.name} 适合谁？</h2>
        <p>${item.angle} 机场订阅的好坏，不能只看能不能打开网页，更要看你的使用节奏：是否经常看视频，是否长时间使用 ChatGPT、YouTube、Netflix、Telegram 等服务，是否有多台设备同时在线。</p>
        <p>${item.name} 的最低公开套餐是 <strong>${item.cheap}</strong>。新手比较稳妥的方式是先买短周期套餐，用几天观察常用节点，再决定是否续费更长周期。如果你的需求集中在浏览网页、同步资料、登录海外服务和偶尔看视频，入门套餐会比较容易控制成本。</p>
      </section>
      <section>
        <h2>套餐与性价比观察</h2>
        <p>看性价比时，建议把价格换算成每月可用流量、每 GB 成本和常用节点倍率。低价套餐通常适合试用、备用和轻量访问；中高档套餐更适合长期追剧、多设备同步和家庭共享。真实销售页可能因为促销、节点维护、套餐改版而变化，下单前务必以官网收银台为准。</p>
        <p>如果套餐流量看起来很多，也要检查热门节点是否额外倍率扣流量。一个 50GB 的低价包适合轻量用户，但若常用节点按 2 倍或 3 倍消耗，实际可用时长会明显缩短。反过来，大流量套餐如果晚高峰不稳，也未必比小而稳的套餐更值得买。</p>
      </section>
      <section>
        <h2>线路、节点和解锁能力</h2>
        <p>机场常见线路包括公网中转、BGP 中转、IEPL、IPLC 和多个地区落地节点。普通用户不必纠结术语本身，重点看三项实际指标：晚高峰是否能稳定连上，YouTube 1080p 或 4K 是否持续缓冲，常用 AI 与流媒体服务是否频繁风控。</p>
        <p>香港、日本、新加坡、台湾、美国通常是中文用户最常用的区域。香港和日本延迟低，适合日常网页和视频；美国节点适合 ChatGPT、Claude、Google、Netflix 美区等服务。购买后优先使用后台提供的一键订阅导入，并打开自动更新订阅。</p>
      </section>
      <section>
        <h2>购买前风险控制</h2>
        <p>机场行业变化很快，域名迁移、套餐调整、节点临时维护都很常见。无论看起来多便宜，都不建议第一次就购买多年套餐，也不要把全部网络访问都压在一家机场上。更稳的方式是主力机场加备用机场，两个服务商的入口和通知渠道尽量分散。</p>
        <p>下单前建议检查公告频道、工单响应、教程完整度和退款说明。隐私方面，机场并不等于完全匿名，不要把订阅链接公开到论坛或群聊；订阅链接本质上就是你的节点凭证，一旦泄露，流量可能被别人消耗。</p>
      </section>
      <section>
        <h2>${item.name} 总结</h2>
        <p>综合来看，${item.name} 更适合${item.angle.replace(/^适合/, "").replace(/。$/, "")}。如果你刚好属于这个场景，可以从最低套餐或短周期套餐开始，先测试常用地区节点和晚高峰表现。最终建议很简单：先月付，后长付；先测试，后迁移；先看稳定性，再看最低价。</p>
      </section>
      <aside class="notice"><strong>注册入口：</strong><a href="${escapeHtml(item.url)}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(item.url)}</a></aside>
      <section><h2>相关推荐</h2><div class="post-grid compact">${related.map(airportCard).join("")}</div></section>
    </article>`;
  return layout({ title, description, pathName: `/posts/${item.slug}.html`, content, extraHead: schema(title, description, `/posts/${item.slug}.html`) });
}

function knowledgeArticle(item, index) {
  const title = item.title;
  const description = `${item.title}，约 1500 字机场科普，帮助新手理解机场订阅、线路、套餐和使用风险。`;
  const next = knowledgeTopics[(index + 1) % knowledgeTopics.length];
  const content = `    <article class="article">
      <div class="article-hero">
        <p class="eyebrow">科普知识 · ${item.tag}</p>
        <h1>${title}</h1>
        <p class="lead">${item.intro} 这篇文章不追求术语堆叠，而是从普通用户的购买、配置和日常使用角度，把关键判断方法讲清楚。</p>
      </div>
      <section>
        <h2>为什么需要理解这个问题</h2>
        <p>${item.intro} 对机场用户来说，最容易踩坑的地方不是不会付款，而是没有建立判断框架。很多页面会同时出现专线、倍率、解锁、原生 IP、低延迟、不限速等词，如果只看宣传词，很难知道它们和自己的需求有什么关系。</p>
        <p>更好的方式是先确认自己的场景：你是偶尔查资料，还是每天看视频；是主要使用 AI 工具，还是需要流媒体解锁；是一个人用，还是手机、电脑、平板和家人一起用。场景不同，适合的套餐、节点地区和客户端配置也会不同。</p>
      </section>
      <section>
        <h2>核心判断方法</h2>
        <p>第一，看可验证的信息。价格、流量、周期、节点地区、设备数量、倍率规则、退款说明和公告渠道，都是可以在购买前确认的内容。相比“高速稳定”这样的描述，这些具体信息更能帮助你判断服务是否适合自己。</p>
        <p>第二，看连续体验。机场速度不是一次测速就能说明问题，尤其要观察晚高峰、周末和跨运营商环境。你可以连续测试网页打开、YouTube 播放、Telegram 收发、GitHub 访问、AI 登录和常用流媒体。如果这些任务都稳定，再考虑长期续费。</p>
        <p>第三，看故障处理。任何机场都可能遇到节点维护、域名迁移和订阅更新异常。真正影响长期体验的，是服务商有没有清晰公告、工单是否回复、教程是否完整、客户端订阅是否容易更新。售后和维护能力往往比首页宣传更重要。</p>
      </section>
      <section>
        <h2>新手常见误区</h2>
        <p>常见误区之一，是把最低价当成唯一标准。低价套餐适合试用和备用，但未必适合每天看高清视频、直播、会议或多人共享。另一个误区，是看到大流量就认为一定划算。大流量也要看倍率和线路质量，如果常用节点扣量高或晚高峰不稳，体验仍然会打折。</p>
        <p>还有人会把机场等同于完全匿名工具。机场能帮助你访问更多网络服务，但并不意味着可以忽略账号安全。不要复用密码，不要公开订阅链接，不要在陌生页面输入敏感信息，也不要把所有重要账号都绑定在同一个不稳定网络环境里。</p>
      </section>
      <section>
        <h2>实用操作建议</h2>
        <p>购买前优先选择月付或短周期套餐。拿到订阅后，先导入常用客户端，开启自动更新，再分别测试香港、日本、新加坡、美国等常见节点。测试时不要只看测速数字，更要看真实任务是否顺畅，例如视频是否持续缓冲、AI 是否频繁验证、网页是否出现地区限制。</p>
        <p>如果你已经有主力机场，建议再准备一个低价备用机场。备用机场不需要流量特别大，关键是入口、面板和通知渠道不要和主力完全重合。这样当主力线路维护或订阅异常时，你不会完全断开。</p>
        <p>日常维护也很重要。建议每隔一段时间检查订阅是否能正常更新、客户端版本是否过旧、规则文件是否失效、常用节点是否出现明显延迟变化。遇到问题时先换节点，再更新订阅，最后再考虑更换客户端或联系工单，这样排查顺序更清晰，也能避免把所有问题都误判成机场跑路。</p>
      </section>
      <section>
        <h2>总结</h2>
        <p>${title} 的关键，不是背术语，而是把术语转化成自己的使用判断。先明确需求，再看套餐；先短期测试，再考虑长付；先验证稳定性，再比较最低价。只要按照这个顺序，新手也能避开大部分机场选择误区。</p>
      </section>
      <aside class="notice">下一篇：<a href="/knowledge/${next.slug}.html">${next.title}</a></aside>
    </article>`;
  return layout({ title, description, pathName: `/knowledge/${item.slug}.html`, content, extraHead: schema(title, description, `/knowledge/${item.slug}.html`) });
}

function sitemap() {
  const urls = [
    ["/", "1.0"],
    ["/rank/", "0.9"],
    ["/airport/", "0.8"],
    ["/reviews/", "0.9"],
    ["/knowledge/", "0.9"],
    ["/about/", "0.6"],
    ...airports.map((item) => [`/posts/${item.slug}.html`, "0.8"]),
    ...knowledgeTopics.map((item) => [`/knowledge/${item.slug}.html`, "0.8"]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, priority]) => `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function style() {
  return `:root {
  color-scheme: light;
  --bg: #f6f8fb;
  --panel: #ffffff;
  --text: #152033;
  --muted: #607086;
  --line: #dbe3ee;
  --primary: #0f766e;
  --primary-dark: #115e59;
  --accent: #d97706;
  --blue: #2563eb;
  --shadow: 0 18px 45px rgba(21, 32, 51, .08);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; background: var(--bg); color: var(--text); line-height: 1.75; }
a { color: inherit; text-decoration: none; }
.site-header { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px clamp(18px, 4vw, 56px); border-bottom: 1px solid rgba(219, 227, 238, .8); background: rgba(246, 248, 251, .94); backdrop-filter: blur(18px); }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); white-space: nowrap; }
.brand-mark { width: 30px; height: 30px; border-radius: 8px; background: conic-gradient(from 180deg, var(--primary), var(--blue), var(--accent), var(--primary)); box-shadow: 0 8px 20px rgba(15, 118, 110, .25); }
.top-nav { display: flex; flex-wrap: wrap; gap: 18px; color: var(--muted); font-size: 15px; }
.top-nav a:hover { color: var(--primary); }
main { min-height: 70vh; }
.home-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr); gap: 44px; align-items: center; padding: clamp(48px, 7vw, 92px) clamp(18px, 4vw, 56px) 36px; max-width: 1180px; margin: 0 auto; }
.hero-copy h1, .article-hero h1, .list-hero h1 { margin: 10px 0 16px; line-height: 1.12; font-size: clamp(34px, 5vw, 64px); }
.hero-copy p, .lead, .list-hero p { max-width: 760px; color: var(--muted); font-size: 18px; }
.eyebrow { margin: 0; color: var(--primary); font-weight: 800; letter-spacing: 0; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 18px; border: 1px solid var(--line); border-radius: 8px; font-weight: 700; }
.button.primary { border-color: var(--primary); background: var(--primary); color: #fff; }
.button.secondary { background: #fff; color: var(--text); }
.hero-visual { position: relative; min-height: 420px; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, rgba(15,118,110,.92), rgba(37,99,235,.82)); box-shadow: var(--shadow); }
.radar { position: absolute; left: 50%; top: 50%; width: 220px; height: 220px; transform: translate(-50%, -50%); border: 2px solid rgba(255,255,255,.65); border-radius: 50%; }
.radar::before, .radar::after { content: ""; position: absolute; inset: 34px; border: 1px solid rgba(255,255,255,.42); border-radius: 50%; }
.radar::after { inset: 72px; }
.route { position: absolute; height: 3px; background: rgba(255,255,255,.72); transform-origin: left center; }
.r1 { width: 220px; left: 120px; top: 120px; transform: rotate(22deg); }
.r2 { width: 260px; left: 250px; top: 310px; transform: rotate(-18deg); }
.r3 { width: 190px; left: 210px; bottom: 110px; transform: rotate(35deg); }
.node { position: absolute; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #fff; color: var(--primary-dark); font-weight: 900; box-shadow: 0 12px 28px rgba(0,0,0,.2); }
.n1 { left: 70px; top: 86px; } .n2 { right: 88px; top: 140px; } .n3 { left: 150px; bottom: 86px; } .n4 { right: 130px; bottom: 120px; }
.section, .article, .list-hero { max-width: 1080px; margin: 0 auto; padding: 34px clamp(18px, 4vw, 56px); }
.article { max-width: 920px; }
.article-hero, .list-hero { padding-top: 56px; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.section h2, .article h2 { margin: 34px 0 12px; font-size: 28px; line-height: 1.25; }
.post-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.post-card { display: block; min-height: 182px; padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); box-shadow: 0 8px 24px rgba(21, 32, 51, .04); }
.post-card:hover { border-color: rgba(15, 118, 110, .45); transform: translateY(-2px); }
.post-card h3 { margin: 8px 0; font-size: 22px; line-height: 1.25; }
.post-card p { margin: 0; color: var(--muted); font-size: 15px; }
.tag { display: inline-block; color: var(--accent); font-size: 13px; font-weight: 800; }
.quick-card { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 28px 0; }
.quick-card div { padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
.quick-card span { display: block; color: var(--muted); font-size: 13px; }
.quick-card strong { display: block; margin-top: 6px; overflow-wrap: anywhere; }
.notice { margin: 30px 0; padding: 18px; border-left: 4px solid var(--primary); border-radius: 8px; background: #fff; overflow-wrap: anywhere; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
table { width: 100%; border-collapse: collapse; min-width: 840px; }
th, td { padding: 13px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
th { background: #eef4f8; font-size: 14px; }
.site-footer { margin-top: 46px; padding: 32px clamp(18px, 4vw, 56px); border-top: 1px solid var(--line); color: var(--muted); text-align: center; }
.site-footer p { margin: 6px 0; }
@media (max-width: 860px) {
  .site-header { align-items: flex-start; flex-direction: column; }
  .home-hero { grid-template-columns: 1fr; }
  .hero-visual { min-height: 300px; }
  .post-grid, .quick-card { grid-template-columns: 1fr; }
  .hero-copy h1, .article-hero h1, .list-hero h1 { font-size: 34px; }
}
`;
}

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f766e"/><path d="M13 36 51 14 37 52l-7-15-17-1Z" fill="#fff"/><path d="M30 37 51 14 37 52l-7-15Z" fill="#fbbf24" opacity=".9"/></svg>`;
}

function build() {
  const root = process.cwd();
  write(path.join(root, "assets", "style.css"), style());
  write(path.join(root, "assets", "favicon.svg"), favicon());
  write(path.join(root, "index.html"), homePage());
  write(path.join(root, "rank", "index.html"), rankPage("/rank/"));
  write(path.join(root, "airport", "index.html"), rankPage("/airport/"));
  write(path.join(root, "reviews", "index.html"), reviewsPage());
  write(path.join(root, "knowledge", "index.html"), knowledgePage());
  write(path.join(root, "about", "index.html"), aboutPage());
  airports.forEach((item, index) => write(path.join(root, "posts", `${item.slug}.html`), airportArticle(item, index)));
  knowledgeTopics.forEach((item, index) => write(path.join(root, "knowledge", `${item.slug}.html`), knowledgeArticle(item, index)));
  write(path.join(root, "sitemap.xml"), sitemap());
  write(path.join(root, "robots.txt"), robots());
}

build();
