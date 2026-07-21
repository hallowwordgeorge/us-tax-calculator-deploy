# 客户反馈档案 · Customer Feedback Archive

> **本文件的用途：** 记录经真实用户验证的产品核心优势与功能需求。
> **⚠️ 未来任何改版、重构或删减功能之前，请先对照本文件——下表「护城河」列出的功能是用户明确点赞的卖点，不可移除或削弱。**
>
> 记录周期：2026-07-20 收集 · 2026-07-21 功能落地并归档
> 来源：Product Hunt / 用户留言（用户名与原文见第三节）

---

## 一、用户验证的核心优势（护城河 —— 请勿删除）

| # | 优势 | 用户原话出处 | 对应实现位置 |
|---|------|--------------|--------------|
| 1 | 资本利得**短期 vs 长期正确分类**（竞品普遍做错） | Şahin | 高级模式 LTCG 输入 + `LTCG_BRACKETS` 分年数据 + 堆叠计税逻辑（`computeTax` 内 LTCG 段） |
| 2 | **联邦税 + 50 州税一站式**处理 | Gülhan、Esila | 联邦计算器 + `STATE_TAX` 州税模块（50 州 + DC、地图与列表选择） |
| 3 | **自雇税明细透明**，数字来源可追溯 | Gülhan、Esila | SE 税分解（SS 12.4% / Medicare 2.9%、92.35%、一半扣除）+ 结果解读面板逐项说明 |
| 4 | **便捷 / 高级双模式**分层清晰 | Nuriye | `quick-mode` / `complex-only` 体系，模式切换按钮 |
| 5 | **模式切换数据不丢失** | Nuriye | 切模式仅改显示类，不清空任何输入框 |
| 6 | **无需注册即可使用**（降低门槛） | Nick Kalm | 全站无登录墙；记录仅存于浏览器会话（隐私政策已声明） |
| 7 | **中 / 英（/西）多语切换** | Esila | `I18N` 表 + `.i18n-*` span 体系 + `setLang` 全量重渲染 |

> 补充：Nick Kalm 同时点赞了「50 州计算保持准确的工作量」——数据准确性本身就是卖点，见第四节更新策略。

---

## 二、用户功能需求与实现状态

| 需求 | 提出用户 | 状态 | 实现说明（v2026-07-21） |
|------|----------|------|--------------------------|
| 跨年度税务对比（2026 vs 2027） | Alparslan | ✅ 已上线 | 计算前用「跨税年对比 Compare Tax Years」下拉选择组合，计算后结果区下方展开并排表格（各年成列 + 相邻年 Δ 差额列，绿=有利/红=不利） |
| 2025 vs 2026 对比（年中调整预扣税） | Gülseren | ✅ 已上线 | 新增 **2025 官方最终数据**（Rev. Proc. 2024-40 + OBBBA 追溯调整）；对比模式含 2025 vs 2026 与三年全对比 2025 vs 2026 vs 2027 |
| 场景保存 + 并排对比（W-2 vs 全职自由职业） | Kaan | ✅ 已上线 | 计算→「保存本次记录」命名场景→「假设分析」页勾选 2–3 行「对比」框→表格下方同页展开逐行明细（输入 + 结果 + **税后净收入** + Δ 列） |
| 税率数据更新机制说明 | Nick Kalm | ✅ 已上线 | 新增 FAQ「法规每年都在变，你们如何保持联邦和州税数据最新？」；更新策略详见第四节 |

---

## 三、留言原文存档

**Şahin (3h ago)** — “Switched over to Advanced mode and noticed the capital gains breakdown actually separates short-term vs long-term properly, which is something most free calculators get wrong. Genuinely useful for freelancers like me.”

**Alparslan Doğrucan (30m ago)** — “Adding the ability to compare two tax years side by side would be really useful, especially for freelancers trying to decide whether to bunch deductions into 2026 or push them to 2027.”

**Gülhan (10m ago)** — “Honestly pretty useful that it handles both federal and all 50 states in one place, and the self-employment tax breakdown actually shows me where the numbers come from.”

**Nuriye Bağçıvan (6m ago)** — “love how the quick and advanced modes are split so cleanly, makes it easy to switch from a rough estimate to a full breakdown without losing my place.”

**Nick Kalm** — “@andrew_zhang8 I can appreciate the amount of work that goes into keeping tax calculations accurate across all 50 states, so I was happy to give your product an upvote. Building it without requiring signups is a nice touch, and I'm interested to know how you're keeping federal and state tax rules updated as regulations change each year.”

**Kaan (8h ago)** — “One thing that would really help is letting users save scenarios to compare side by side, like a W-2 job vs full freelance income. That way I can see the tax impact before making a big decision about going self-employed, instead of running the numbers manually in two browser tabs.”

**Esila Dindoruk (8h ago)** — “Finally a tax calculator that covers all 50 states in one place instead of hunting down separate tools. The bilingual toggle is a nice touch, and the breakdown of self-employment tax actually shows where the numbers come from.”

**Gülseren (8h ago)** — “A ‘compare years’ view would be super useful, like a side-by-side of 2025 vs 2026 tax projections so I can see how the new brackets and credits actually change my refund. Would help a lot when deciding whether to adjust withholding mid-year.”

---

## 四、数据更新策略（对外承诺：站上数字永远与官方最新口径一致）

**数据来源（只用一手官方资料）：** IRS Revenue Procedure 年度通胀调整（2025 = Rev. Proc. 2024-40；2026 = Rev. Proc. 2025-32）、税改法案原文（如 2025-07 OBBBA）、SSA 年度工资基数公告、各州税务局（DOR）官方发布。不转抄第三方汇总表。

**更新日历：**

| 时间 | 动作 |
|------|------|
| 每年 10–11 月 | IRS 发布次年 Rev. Proc.、SSA 公布工资基数 → **数日内**把「预测」替换为官方数字（2027 预测预计 2026-10 转正式） |
| 每年 12–1 月 | 各州定稿次年税率/预扣表 → 逐州核对并更新州税模块 |
| 重大税法签署后 | **数日内**修订受影响数字，并同步更新 FAQ 与相关文章 |
| 每季度 | 全量数据抽查审计（联邦 + 州 + 文章中的数字） |

**当前数据状态（2026-07-21）：** 2025 = 官方最终；2026 = 官方；2027 = 预测（+2.5% CPI / +4.5% 工资基数推算，站内已标注）；州税模块按 2026 年规则。

**自动预警装置（v2026-07-21 上线）：** 页面按 `DATA-FRESHNESS.md` / `index.html` 内 `DATA_FRESHNESS` 常量逐一监测联邦与 51 个州（含 DC）的数据时效——进入更新窗口未核对→黄色提示；窗口结束仍未核对→红色"请暂停使用"警告。每次更新数据必须同步改两处的 `updated` 日期，警示才会解除。

---

## 五、改动前检查清单（每次上线前过一遍）

1. 本文件第一节的 7 项护城河功能是否全部完好？
2. 三个税年数据与「跨税年对比」下拉是否正常（含三年全对比模式）？
3. 场景保存 → 假设分析勾选 → 并排明细是否正常（含 Δ 列与税后净收入行）？
4. 中/英/西切换后，动态表格（结果、跨年对比、场景对比、历史列表）是否全部跟随语言刷新？
5. FAQ 数量与 JSON-LD FAQPage 是否同步？教程编号是否连续？
6. 隐私承诺未被破坏：无注册墙、记录仅存会话、不上传数据。
