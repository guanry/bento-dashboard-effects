# X / Twitter 短推草稿

## 主推(中文)

---

我不想再引 SortableJS 了,所以让 AI 和我一起写了个后台动效引擎:

🧩 可拖动 Bento 网格(其余卡片平滑让位,松手吸附)
🔍 点击卡片原地放大,其余缩成缩略条
🔢 筛选切换数字滚动补间
📈 多图表悬停联动
📜 滚动吸顶,进度驱动连续收缩
📋 列表详情抽屉,键盘可切

6 种动效 × 6 套主题,零第三方库,45KB。

Vue3 + Vite,MIT 开源👇
https://gitee.com/guanxi1971/bento-dashboard-effects

配套 AI 技能已打包:把 skill/ 丢进 ~/.agents/skills/,你的 AI 就会这套。

---

## 主推(English)

---

I stopped importing SortableJS and built a dashboard motion engine with AI instead:

🧩 Draggable bento grid — cards yield smoothly, snap to the nearest valid slot
🔍 Click to expand in place, others shrink into a thumbnail bar
🔢 Number tweening on filter change
📈 Linked chart hover with a shared reference line
📜 Scroll-progress sticky header
📋 Master-detail drawer, keyboard navigable

6 effects × 6 themes, zero deps, 45KB gzipped.

Vue 3 + Vite. MIT. Open source 👇
https://gitee.com/guanxi1971/bento-dashboard-effects

Also packaged as an AI skill — drop `skill/` into ~/.agents/skills/ and your agent knows the whole playbook.

---

## 跟发(系列短推,一天一条)

1. 拖拽那条的 aha 点:满铺网格里有些落点几何上无解,引擎会按距离试出最近合法格位。拖到"不可能的位置"时它不是坏了,是在吸附。附 v1 GIF。

2. 滚动吸顶那天发现 Chrome 的 scroll anchoring 会偷偷把 scrollTop 改回去,刚收缩的头部又被弹回来。一行 overflow-anchor: none 解决。所有 shrink-on-scroll 头部都该知道这个坑。附 v3 GIF。

3. <Transition mode="out-in"> 在后台标签页会永久卡住(Vue 等 transitionend,浏览器不给)。换 :key 重渲染 + CSS 动画,内容同步切、动画纯装饰。

4. 主题不是换色:撞色主题换主卡构图,沉浸主题把网格切成 12×6,图卡主题直接把卡片内容换成照片。setGrid 一下,卡片全部滑行到位。

5. 六套主题一键切换完整演示。你最喜欢哪套?评论区告诉我(附 v3 GIF 或主题轮播录屏)。
