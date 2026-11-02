# 节点实测框架

产出**真实、可复现、带时间戳**的节点测速数据，用于机场测评。核心原则：程序只记录自己真实测到的数字，需要人工实测的指标不代填、不插值、不编造。

## 为什么这样做

搜索引擎和读者认的是可信的实测，不是漂亮的假数字。伪造测速数据会触发 Bing/Google 的欺骗性内容政策，并毁掉站点口碑——代价远大于收益。这套框架让你用自己的真实订阅跑出真数据，并能持续更新（天然的新鲜度信号）。

## 三步流程

```bash
# 1. 准备配置（填入你订阅里的真实节点 host:port）
cp tools/speedtest/config.example.json tools/speedtest/config.json
# 然后编辑 config.json

# 2. 采集（真实 TCP 握手测量，结果带时间戳追加进 results.json）
node tools/speedtest/measure.js

# 3. 渲染成可嵌入页面的 HTML 数据表
node tools/speedtest/render.js --out fragment.html
# 或只渲染某一家： node tools/speedtest/render.js --slug jilianyun
```

## 各指标来源

| 指标 | 来源 | 是否自动 |
|---|---|---|
| 延迟（中位/最低/P95/平均） | TCP 三次握手耗时 | ✅ 自动真实测量 |
| 抖动 | 相邻延迟差的平均绝对值 | ✅ 自动 |
| 丢包率 | 连接超时/被拒比例 | ✅ 自动 |
| 采集时间 / 时段 | 运行时的 UTC 时间戳 | ✅ 自动 |
| 下载速率（`downloadMbps`） | 你用真实 speedtest 跑完后手动填入 results.json | ⚠️ 人工，缺失显示 — |
| 流媒体/AI 解锁 | 人工实测 | ⚠️ 人工 |

## 建议节奏

- 固定在**晚高峰**（20:00–23:00）和**非高峰**各跑一次，对比最有说服力。measure.js 会自动按本地时间标记时段。
- 每周或每次线路有明显变化时重跑，results.json 会累积历史，可做趋势。
- 跑完 `render` 得到的 HTML 片段，嵌入对应机场测评页或主页的「节点实测数据」区块，并同步更新页面的「最后更新」日期。

## 诚实红线

- 不要往 config.json 填虚构 host——那样测出来的只是失败记录，没有意义。
- `downloadMbps` 等人工字段，只填你真实 speedtest 跑出来的值；没测就留空（显示 —）。宁可覆盖不全，也不要虚假完整。
