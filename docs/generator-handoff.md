# Generator Session Handoff - UK Rental Map

> 将本文档内容粘贴到新的Claude会话中，开始前端+后端开发。

---

## 你的角色

你是Generator，负责按Sprint Contract实现代码。严格按照技术方案和Sprint Contract开发，不要自行扩展范围。

## 项目位置

`E:/vibe coding/product/uk-rental-map/`

## 需要阅读的文档

开始前请先阅读以下文件获取完整上下文：
1. `docs/05-prd.md` — 产品需求文档（功能定义和验收标准）
2. `docs/07-design/design-spec.md` — 设计规范（色彩/字体/组件规范）
3. `docs/07-design/design-tokens.css` — CSS变量
4. `docs/07-design/pages/` — 6个高保真设计截图
5. `docs/09-tech-design.md` — 技术方案（技术栈/架构/数据模型/API/目录结构）

## Sprint Contract

### Sprint 1：基础设施 + 地图核心
**交付功能**：
- [ ] 项目初始化（Next.js 15 + Tailwind CSS 4 + Prisma + shadcn/ui + TypeScript）
- [ ] 数据库Schema（Prisma）+ 城市种子数据（8个城市）
- [ ] Mapbox GL JS地图集成（展示+缩放+拖动）
- [ ] 城市筛选聚焦（8城市按钮+flyTo动画）
- [ ] 房源标注展示（GeoJSON + cluster聚合）
- [ ] 高级筛选（价格滑块+房型+租期）→ 实时更新标注
- [ ] 标注弹窗（点击→Popup信息卡片：价格+房型+评分+设施标签）
- [ ] 房源详情页（SSR，左栏信息+右栏评价区占位）
- [ ] 左侧房源列表（与地图联动，显示当前可视区域内的房源）
- [ ] 顶部导航栏（Logo+城市按钮+发布/评价/登录按钮）

**明确不做**：用户系统、评价、发布、后台

**验收标准**：
- 功能完整性：地图可浏览，筛选可用，详情可查看，有mock/种子数据
- 代码质量：ESLint零警告，组件≤300行，TypeScript严格模式
- 用户体验：首屏≤2s，筛选≤500ms，移动端响应式
- 安全合规：HTTPS配置，安全Headers

### Sprint 2：用户系统 + 评价 + 发布
**交付功能**：
- [ ] NextAuth.js邮箱注册登录（注册→验证邮件→登录）
- [ ] 密码重置流程（发送重置邮件→重置密码）
- [ ] 评价发布（模态框：4维度1-5星评分+文字10-500字）
- [ ] 评价查看（详情页右栏：4维度聚合平均分+评价列表按时间倒序）
- [ ] 发布出租信息（左栏表单+右栏地图定位/地址搜索地理编码+照片上传Supabase Storage）
- [ ] AuthGuard（未登录点发布/评价→弹出登录模态框→登录后回到原操作）

**明确不做**：审核后台、种子数据管理、管理中心

**验收标准**：
- 功能：注册→验证→登录→发布→评价完整流程跑通
- 安全：密码bcrypt，JWT httpOnly cookie，Zod输入验证，防XSS
- 代码：同Sprint 1标准

### Sprint 3：后台 + 打磨 + 上线准备
**交付功能**：
- [ ] 管理后台Dashboard（/admin路由，统计卡片：待审核/总房源/总用户/总评价）
- [ ] 审核队列（表格：查看/通过/拒绝，拒绝需填理由，通过/拒绝后邮件通知发布者）
- [ ] 种子数据快速录入（一行表单：来源平台+链接+价格+房型+租期+地址→自动地理编码）
- [ ] 评价管理（列表+删除）
- [ ] 房源90天自动下架（expiresAt字段+定时检查或请求时检查）
- [ ] UI设计稿对齐（Design Tokens应用，品牌名统一为"UK Rental Map/英国租房地图"）
- [ ] 数据埋点（page_view, city_select, filter_apply, listing_click, review_submit等）
- [ ] 隐私政策页面
- [ ] 响应式最终检查（移动端地图+筛选可用）

**明确不做**：需求匹配提醒、用户管理中心

**验收标准**：
- 功能：后台审核流程完整，种子录入可用
- 体验：核心流程≤3步，loading/成功/失败都有反馈
- 安全：Admin路由权限校验，OWASP Top 10逐项通过
- 上线：Vercel部署成功

## 关键技术约束

1. **地图API**：Mapbox GL JS，token存环境变量，不硬编码
2. **数据库**：PostgreSQL via Supabase，通过Prisma ORM访问
3. **认证**：NextAuth.js v5，邮箱+密码模式，JWT存httpOnly cookie
4. **邮件**：Resend API发送验证邮件和通知
5. **照片存储**：Supabase Storage，前端压缩≤500KB后上传
6. **地理编码**：Mapbox Geocoding API，地址→坐标
7. **组件库**：shadcn/ui，图标用Lucide React
8. **样式**：Tailwind CSS，Design Tokens在globals.css中定义CSS变量

## 开发规则

1. 每完成一个Sprint，输出该Sprint的交付清单和自测结果
2. 遇到Sprint Contract不合理的地方，提出变更申请，不要自行缩减范围
3. 代码中不硬编码任何密钥/Token，全部走环境变量
4. 品牌名统一用"UK Rental Map"（英文）/ "英国租房地图"（中文），不用"The Curated Navigator"
