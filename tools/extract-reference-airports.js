const fs = require("fs");

const html = fs.readFileSync("reference-airport.html", "utf8");

function clean(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name) {
  const map = {
    极连云: "jilianyun",
    光年梯: "guangnianti",
    影子: "yingzi",
    边界云机场: "bianjieyun",
    飞猫云: "feimaoyun",
    可信云: "kexinyun",
    速界: "sujie",
    快狸: "kuaili",
    边缘节点: "bianyuanjiedian",
    光速云: "guangshuyun",
    星岛梦: "xingdaomeng",
    全球云: "quanqiuyun",
    瞬云机场: "shunyun",
    寰宇云机场: "huanyuyun",
    Lumina: "lumina",
    "拼好连": "pinhaolian",
    "拼好连（原Runway Cloud）": "pinhaolian",
    "99吧": "99bar",
    锦云机场: "jinyun",
    极速云机场: "jisuyun",
    山水云: "shanshuiyun",
    秒秒云: "miaomiaoyun",
    迅达VPN: "xundavpn",
    "Edge-X机场": "edge-x",
    可达加速器: "keda",
    奈云: "naiyun",
    隐云: "yinyun",
    山海机场: "shanhai",
    LiZione: "lizione",
    哆啦A梦: "duolaameng",
    大哥云: "dageyun",
    龙猫云: "longmaoyun",
    飞鸟机场: "feiniaojichang",
    青云梯: "qingyunti",
    "花云机场": "huayunjichang",
    "花云机场 FlowerCloud": "huayunjichang",
  };
  return map[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const start = html.indexOf('<h3 id="极连云"');
const end = html.indexOf("<h2", html.indexOf("不同需求场景推荐方案"));
const content = html.slice(start, end > start ? end : undefined);
const headingRe = /<h3 id="([^"]+)"[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/h3>/g;
const headings = [];
let match;
while ((match = headingRe.exec(content))) {
  headings.push({
    index: match.index,
    id: match[1],
    rawTitle: clean(match[2]),
  });
}

const airports = headings.map((heading, i) => {
  const section = content.slice(heading.index, headings[i + 1]?.index ?? content.length);
  const name = heading.rawTitle.replace(/^\d+\.\s*/, "").replace(/\s*\(FlowerCloud\)/, " FlowerCloud").trim();
  const urlMatch = section.match(/官网地址：<a href="([^"]+)"/);
  const cheapMatch = section.match(/最便宜的订阅(?:有|为)?\s*<strong>([\s\S]*?)<\/strong>/);
  const reviewMatch = section.match(/<a class="route-link" href="([^"]+)"/);
  const paragraphs = [...section.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => clean(m[1])).filter(Boolean);
  const intro = paragraphs.find((p) => p.length > 45 && !p.includes("官网地址") && !p.includes("最便宜") && !p.includes("前往") && !p.includes("立即注册")) || "";
  const tableMatch = section.match(/<table>([\s\S]*?)<\/table>/);
  let plans = [];
  if (tableMatch) {
    const headers = [...tableMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => clean(m[1]));
    const rows = [...tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1);
    plans = rows.map((row) => {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => clean(m[1]));
      const item = {};
      headers.forEach((header, index) => {
        if (cells[index]) item[header || `字段${index + 1}`] = cells[index];
      });
      return item;
    }).filter((row) => Object.keys(row).length);
  }
  return {
    name,
    slug: slugify(name),
    url: (urlMatch?.[1] || "").replace(/&amp;/g, "&"),
    cheap: clean(cheapMatch?.[1] || ""),
    tag: clean(cheapMatch?.[1] || "").includes("年") ? "年付低价" : "机场推荐",
    angle: intro || `${name} 是参考页收录的机场服务，适合需要对比价格、流量和线路稳定性的用户。`,
    sourcePath: reviewMatch?.[1] || "",
    plans,
  };
}).filter((airport) => airport.url && airport.name && airport.plans.length);

fs.writeFileSync("tools/reference-airports.json", JSON.stringify(airports, null, 2), "utf8");
console.log(`airports=${airports.length}`);
