# UK Rental Map - 阶段12 Code Review

**评审角色**: Evaluator
**评审日期**: 2026-03-31
**代码版本**: GitHub main 分支（3 Sprint 全部完成）

---

## 评审总览

| 维度 | 得分 | 判定 |
|------|------|------|
| 功能完整性 | **7/10** | ❌ 未达标（需≥8） |
| 代码质量 | **7/10** | ❌ 未达标（需≥8） |
| 用户体验 | **7/10** | ❌ 未达标（需≥8） |
| 安全合规 | **5/10** | ❌ 未达标（需≥8），有CRITICAL级漏洞 |

**评审结论：🔴 打回 Generator 修复**

4个维度均未达到≥8的通过线，其中安全合规存在CRITICAL级漏洞必须优先修复。

---

## 维度1：功能完整性（7/10）

### 已完成功能（Sprint Contract 对照）

**Sprint 1 ✅ 全部完成**
- [x] 项目初始化（Next.js + Tailwind CSS 4 + Prisma + TypeScript）
- [x] 数据库 Schema + 8城市种子数据 + 22条 mock 房源
- [x] Mapbox GL JS 地图（展示 + 缩放 + 拖动 + 自定义价格标注）
- [x] 城市筛选聚焦（8城市按钮 + flyTo 动画）
- [x] 房源标注（GeoJSON + cluster 聚合 + 自定义图标）
- [x] 高级筛选（价格双滑块 + 房型 + 租期）→ 实时更新
- [x] 标注弹窗（点击 → Popup 信息卡片）
- [x] 房源详情页（SSR + generateMetadata）
- [x] 左侧房源列表（地图 bounds 联动）
- [x] 顶部导航栏

**Sprint 2 ⚠️ 部分缺失**
- [x] NextAuth.js 邮箱注册登录（含邮件验证 token）
- [x] 密码重置流程（发送重置邮件 → 重置密码页）
- [x] 评价发布（模态框，4维度星级 + 文字）
- [x] 评价查看（详情页右栏，聚合平均分 + 列表）
- [x] AuthGuard（未登录 → 弹登录模态框）
- [⚠️] 发布出租：**缺少地图定位和地理编码**，使用城市中心 + 随机偏移代替
- [⚠️] 照片上传：**仅有占位 UI**，未实际对接 Supabase Storage

**Sprint 3 ⚠️ 部分缺失**
- [x] 管理后台 Dashboard（统计卡片）
- [x] 审核队列（查看/通过/拒绝 + 邮件通知）
- [x] 种子数据录入（简化表单，无坐标时用城市中心偏移）
- [x] 评价管理（列表 + 删除）
- [x] 90天自动下架（expiresAt + 查询时检查）
- [x] 隐私政策页
- [⚠️] **埋点已定义但从未调用** — `analytics.ts` 定义了全部事件，但没有任何组件实际调用
- [⚠️] Design Token 对齐：CSS 变量已定义，但组件中全部硬编码十六进制色值
- [⚠️] 响应式：基础 flex 布局，缺少移动端深度适配

### 必须修复的功能缺陷

| # | 问题 | 位置 | 严重程度 |
|---|------|------|---------|
| F1 | 照片上传仅占位 UI，未对接 Supabase Storage | `publish/page.tsx:238-245` | HIGH |
| F2 | 发布页缺少地图定位/地理编码，坐标随机生成 | `publish/page.tsx:87-88` | HIGH |
| F3 | 埋点事件从未被调用 | `analytics.ts` 全文 | MEDIUM |
| F4 | ListingCard 评分硬编码为 "4.0" | `ListingCard.tsx:49` | MEDIUM |
| F5 | FilterPanel "应用筛选" 按钮无实际功能（筛选已实时生效） | `FilterPanel.tsx:114` | LOW |

---

## 维度2：代码质量（7/10）

### 优点

- **TypeScript 全栈**：类型定义完整（`types/index.ts`），Prisma 自动生成类型
- **文件结构清晰**：与技术方案目录结构高度一致
- **Zod 输入验证**：所有 API 端点使用 Zod schema 验证
- **Prisma ORM**：参数化查询天然防 SQL 注入
- **Prisma 单例**：`db.ts` 正确使用全局缓存避免连接泄漏
- **React 性能**：`useCallback`、`useMemo`、`dynamic import` 合理使用
- **组件拆分**：无单组件超过 340 行（最长 `MapContainer.tsx` 338 行，接近但未超限）
- **统一响应格式**：`{ success, data, error }` 结构一致

### 必须修复的质量问题

| # | 问题 | 位置 | 严重程度 |
|---|------|------|---------|
| Q1 | 全局命名空间污染：`window.__onPopupClick` | `MapContainer.tsx:264` | HIGH |
| Q2 | 使用 `<img>` 而非 `next/image`，缺少图片优化和安全防护 | `ListingCard.tsx:23`、`ListingDetail.tsx:99` | MEDIUM |
| Q3 | 组件内硬编码色值（`#004AC6`、`#434655` 等），未使用 `globals.css` 中定义的 CSS 变量 | 全部组件文件 | MEDIUM |
| Q4 | Mock fallback 模式不一致：部分 API 静默返回 mock 数据，部分直接失败 | `listings/route.ts`、`cities/route.ts` 等 | MEDIUM |
| Q5 | `eslint-disable` 注释抑制 hooks 规则 | `MapContainer.tsx:272` | LOW |
| Q6 | 无 React Error Boundary | 全局 | LOW |

---

## 维度3：用户体验（7/10）

### 优点

- **视觉一致性**：品牌渐变色（#004AC6→#2563EB）、圆角、间距统一
- **Loading 状态**：按钮提交时有 Loader2 旋转图标 + disabled 状态
- **错误反馈**：红色错误提示 + 绿色成功提示
- **模态交互**：登录/评价模态框有遮罩 + backdrop-blur + 关闭按钮
- **地图交互**：价格胶囊标注、cluster 聚合、flyTo 动画
- **SSR 详情页**：`generateMetadata` 支持 SEO
- **空状态处理**：列表无数据时显示图标 + 提示文案

### 必须修复的体验问题

| # | 问题 | 位置 | 严重程度 |
|---|------|------|---------|
| U1 | LoginModal 底部显示 "开发模式：demo@test.com / demo1234"，生产环境不应显示 | `LoginModal.tsx:278-280` | HIGH |
| U2 | AdminLayout 未授权页显示 admin 账号密码 | `admin/layout.tsx:58` | HIGH |
| U3 | 列表无分页 UI（API 支持分页但前端未实现） | `page.tsx` 首页 | MEDIUM |
| U4 | 发布页照片上传区域不可交互 | `publish/page.tsx:238-245` | MEDIUM |
| U5 | 发布页缺少地图可视化定位（用户无法看到/调整房源位置） | `publish/page.tsx` | MEDIUM |

---

## 维度4：安全合规（5/10）

### 已有防护

- ✅ 安全 Headers（X-Frame-Options DENY、HSTS、nosniff、Referrer-Policy）
- ✅ bcrypt 密码哈希（cost=12）
- ✅ Zod 输入验证（所有 POST 端点）
- ✅ Prisma 参数化查询（防 SQL 注入）
- ✅ Admin 角色校验（所有 /api/admin/* 端点）
- ✅ Token SHA256 哈希存储（邮件验证 + 密码重置）
- ✅ 防邮箱枚举（forgot-password 统一返回成功）
- ✅ 密码强度要求（≥8字符 + 字母 + 数字）
- ✅ 隐私政策页（GDPR 权利说明）

### 🔴 CRITICAL 安全漏洞

| # | 问题 | 位置 | 严重程度 |
|---|------|------|---------|
| **S1** | **Mock 认证后门：DB 连接失败时，hardcoded admin@test.com/admin1234 可获得 ADMIN 权限。生产环境如果 Supabase 短暂断连，任何人都可以用这组凭据登录为管理员，执行审核、删除等操作。** | `lib/auth.ts:59-80` | 🔴 CRITICAL |
| **S2** | **XSS 注入：Mapbox Popup 使用 `setHTML()` + 字符串拼接渲染房源数据。如果 roomType 或 rentalType 被注入恶意 HTML/JS，将直接执行。** | `MapContainer.tsx:244-251` | 🔴 CRITICAL |
| S3 | 无 Rate Limiting：注册、登录、忘记密码等端点无频率限制，可被暴力攻击 | 所有 API route | HIGH |
| S4 | 无 Content-Security-Policy header | `next.config.ts` | HIGH |
| S5 | 开发凭据暴露在 UI 中（LoginModal + AdminLayout），生产环境可见 | `LoginModal.tsx:278`、`admin/layout.tsx:58` | HIGH |
| S6 | Popup 使用 `window.__onPopupClick` + onclick 内联事件，可被劫持 | `MapContainer.tsx:250,264` | MEDIUM |

---

## Generator 修复清单（按优先级排序）

### P0 - 必须立即修复（阻塞上线）

1. **[S1] 移除 mock 认证后门**
   - 删除 `lib/auth.ts` 第 59-80 行的 catch fallback 逻辑
   - DB 不可用时应返回 `null`（登录失败），而非允许 hardcoded 凭据登录
   - 如需开发便利，改用环境变量 `ENABLE_MOCK_AUTH=true` 控制，且仅在 `NODE_ENV=development` 时生效

2. **[S2] 修复 XSS 注入风险**
   - `MapContainer.tsx` 的 Popup 改用 DOM API 创建元素（`document.createElement`），而非 `setHTML()` 字符串拼接
   - 或对所有插值进行 HTML 转义

3. **[S5/U1/U2] 移除 UI 中的开发凭据**
   - `LoginModal.tsx:278-280`：用 `process.env.NODE_ENV === 'development'` 条件包裹
   - `admin/layout.tsx:58`：移除管理员账号密码提示

### P1 - 上线前应修复

4. **[F1] 实现照片上传**
   - 对接 Supabase Storage，前端压缩 ≤500KB 后上传
   - 发布表单和详情页展示真实照片

5. **[F2] 实现地理编码**
   - 发布页接入 Mapbox Geocoding API（地址 → 坐标）
   - 或提供地图点击定位功能

6. **[S3] 添加 Rate Limiting**
   - 注册/登录/忘记密码：10次/分钟/IP
   - 其他 API：100次/分钟/IP
   - 推荐使用 `@upstash/ratelimit` 或简单的内存计数器

7. **[S4] 添加 CSP Header**
   - `next.config.ts` 添加 `Content-Security-Policy`
   - 至少配置 `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.mapbox.com https://*.supabase.co;`

8. **[Q2] 替换 `<img>` 为 `next/image`**
   - `ListingCard.tsx:23`、`ListingDetail.tsx:99`

### P2 - 质量提升

9. **[F3] 接入埋点调用**
   - 在 Navbar 城市切换、FilterPanel 筛选、ListingCard 点击、ReviewForm 提交、PublishPage 提交等位置调用 `analytics.*`

10. **[F4] ListingCard 评分用真实数据**
    - 移除硬编码 "4.0"，从 reviews API 获取或在 listing 查询时聚合

11. **[Q1] 修复全局命名空间污染**
    - `MapContainer.tsx`：用 React ref 或 CustomEvent 替代 `window.__onPopupClick`

12. **[Q3] 统一使用 CSS 变量**
    - 将组件中的硬编码色值替换为 `globals.css` 中定义的 Tailwind theme 变量

13. **[U3] 添加列表分页 UI**
    - 首页房源列表添加 "加载更多" 或分页按钮

14. **[F5] 移除或修改 "应用筛选" 按钮**
    - 因筛选已实时生效，该按钮应移除或改为手动模式

---

## 附录：文件清单与行数

| 文件 | 行数 | 职责 |
|------|------|------|
| `src/app/page.tsx` | 158 | 首页（地图 + 列表 + 筛选） |
| `src/components/map/MapContainer.tsx` | 338 | 地图容器（Mapbox集成） |
| `src/components/listing/ListingDetail.tsx` | 285 | 房源详情（左栏信息 + 右栏评价） |
| `src/components/auth/LoginModal.tsx` | 284 | 登录/注册/忘记密码模态框 |
| `src/app/publish/page.tsx` | 282 | 发布出租页 |
| `src/components/review/ReviewForm.tsx` | 161 | 评价发布模态框 |
| `src/app/admin/seed/page.tsx` | 142 | 种子数据录入 |
| `src/app/admin/layout.tsx` | 119 | 后台布局（权限校验 + 侧边栏） |
| `src/app/admin/pending/page.tsx` | 113 | 审核队列 |
| `src/app/api/listings/route.ts` | 134 | 房源 GET/POST API |
| `src/lib/auth.ts` | 108 | NextAuth 配置 |
| 其他文件 | <100 | 各自职责 |

共 51 个源文件，无单文件超过 340 行。
