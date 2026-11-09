# 机场推荐与目录页维护

2026-11-09 本轮范围：`/`、`/airport-recommend/`、`/recommend/`、`/rank/`。

## 生成与检查

在仓库根目录运行：

```powershell
node tools/build-site.js --recommendation-only
node tools/audit-site.js
```

局部生成只更新上述四页，以及对应的搜索索引、Feed、Sitemap 与 llms.txt。其余 HTML 含有尚未完全同步回生成器的历史编辑，当前不宜用全量生成覆盖。修改四页正文时应同步改生成器或 `editorial-content.js`，再运行局部生成。

审计会从当前 HTML 检查标题与描述重复、单 H1、canonical、站内资源和链接、JSON-LD、FAQ 正文一致性与 Sitemap。`savedContentAudit` 仅引用旧的 `content-audit.json`，不是当前 HTML 的全文相似性计算；长尾关键词缺失仅供编辑参考。

## 内容定位与保留要求

- `/airport-recommend/` 是“机场推荐”主清单；保留 37 项资料与原展示顺序，包括第 4 项大佬云；保留极连云、光年梯的“主推机场测评”模块。
- `/recommend/` 是按需求查找的专题目录；`/rank/` 是按名称排列的服务商资料目录。两页都使用自身 canonical。
- 套餐摘要来自站内资料库。本轮没有逐家核验官网套餐，也没有新增统一条件实测或评分；套餐周期、推广关系和资料边界应明确显示。
- FAQ 的可见正文与结构化数据共用数据源。ItemList 的展示顺序不作为质量评分。
- Sitemap 仅给实际修改的四页更新 lastmod，不能把结构更新日期当成套餐复核日期。

## 排名下滑的证据边界

本次可确认的是原有主清单、专题目录和排行页主题定位重叠，以及专题目录内容与 canonical 指向不一致；这些已修正，但不能直接证明它们就是某一天掉位的原因。

用户截图中的性能曲线只显示汇总趋势，未同时给出“机场推荐”的对应 URL、完整比较日期、地区、设备及平均位置；“建议关键词”列表也没有这些站点查询明细。现有材料不足以认定降权、处罚或特定算法更新。后续应以 Bing 同一站点、相同筛选条件下的查询与 URL 报告，比较连续完整日期的曝光、点击、CTR 和平均位置；并检查排名 URL 是否发生切换。首页外链提示本身不等于处罚通知。

本轮参考用户提供的竞品搜索摘要中所体现的套餐、线路、用途等决策维度，补足本站的结构和比较方法；没有获得可核验的竞品实时全文，也没有引用竞品的实测结果作为本站证据。

## 发布与 IndexNow

先完成站点发布并核对线上内容，再提交本轮四页：

```powershell
node tools/submit-indexnow.js --priority --dry-run
node tools/submit-indexnow.js --priority
```

单独提交现有线上页面：

```powershell
node tools/submit-indexnow.js --url https://tiziline.com/vpn-recommend/
```

HTTP 200 表示已收到，202 表示 key 校验待完成；都不代表已收录或排名提升。记录实际响应，不要把本地生成等同于上线。
