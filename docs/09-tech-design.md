# UK Rental Map - 技术设计文档
**版本**: v1.0 | **日期**: 2026-03-31

## 1. 技术需求摘要

**核心功能**：地图展示房源(含cluster) + 城市筛选 + 高级筛选 + 房源详情 + 邮箱注册登录 + 发布出租(含审核) + 真实评价 + 管理后台 + 种子数据录入

**性能要求**：首屏≤2s、地图交互≤100ms、筛选≤500ms、并发≤100用户

**安全要求**：HTTPS、bcrypt密码、防XSS/SQL注入、GDPR基本合规

**部署要求**：低成本、快速部署、MVP阶段零/极低运维成本

## 2. 技术栈选型

| 层级 | 选型 | 理由 |
|------|------|------|
| **框架** | Next.js 15 (App Router) | 全栈框架，SSR利于SEO，API Routes省去独立后端，Vercel一键部署 |
| **语言** | TypeScript | 类型安全，减少运行时错误 |
| **样式** | Tailwind CSS 4 | 与设计Token系统天然匹配，原子化CSS开发效率高 |
| **地图** | Mapbox GL JS | 免费层50K请求/月（足够MVP），中国访问比Google Maps更稳定，cluster内置支持 |
| **数据库** | PostgreSQL (Supabase) | 关系型适合结构化数据，PostGIS扩展支持地理查询，Supabase免费层500MB |
| **ORM** | Prisma | 类型安全ORM，迁移管理方便，与Next.js集成成熟 |
| **认证** | NextAuth.js (Auth.js v5) | 邮箱登录开箱即用，JWT会话管理，后续可扩展第三方登录 |
| **邮件** | Resend | 免费100封/天，API简洁，足够MVP阶段验证邮件+审核通知 |
| **文件存储** | Supabase Storage | 与数据库同一平台，免费1GB，用于房源照片 |
| **部署** | Vercel | Next.js官方部署平台，自动CI/CD，免费层够用 |
| **组件库** | shadcn/ui | 基于Radix UI，可定制性强，与Tailwind完美配合 |
| **图标** | Lucide React | 设计规范指定Lucide图标 |
| **地理编码** | Mapbox Geocoding API | 与地图同一供应商，免费层100K请求/月 |

**不选的备选方案**：
- Google Maps：免费额度后费用高，中国访问可能受限
- MongoDB：地理查询不如PostGIS强大
- Firebase：PostgreSQL的关系查询能力更适合本产品
- Leaflet：功能比Mapbox GL JS弱，不支持矢量瓦片

## 3. 系统架构设计

### 3.1 架构概览

```
用户浏览器
    │
    ├── 静态资源 (Vercel CDN)
    │
    ├── Next.js SSR/CSR Pages
    │     ├── 首页（地图浏览） — CSR为主（地图交互）
    │     ├── 详情页 — SSR（SEO友好）
    │     ├── 发布/评价 — CSR
    │     └── 管理后台 — CSR（无需SEO）
    │
    ├── Next.js API Routes (/api/*)
    │     ├── Auth API (NextAuth)
    │     ├── Listings API (CRUD + 筛选)
    │     ├── Reviews API (CRUD + 聚合)
    │     └── Admin API (审核 + 种子录入)
    │
    ├── Prisma ORM
    │     └── PostgreSQL (Supabase)
    │
    ├── Supabase Storage (照片)
    │
    └── 外部服务
          ├── Mapbox GL JS (地图渲染)
          ├── Mapbox Geocoding (地址→坐标)
          └── Resend (邮件发送)
```

### 3.2 模块划分

| 模块 | 职责 | 依赖 |
|------|------|------|
| Map Module | 地图渲染、标注、cluster、弹窗 | Mapbox GL JS |
| Filter Module | 城市筛选、价格/房型/租期筛选 | Map Module |
| Listing Module | 房源CRUD、详情展示、照片管理 | DB, Storage |
| Review Module | 评价CRUD、评分聚合 | DB |
| Auth Module | 注册、登录、密码重置、会话 | NextAuth, Resend |
| Admin Module | 审核队列、种子录入、统计 | DB |

## 4. 数据模型设计

### 4.1 Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

enum UserRole {
  USER
  ADMIN
}

enum ListingStatus {
  PENDING    // 待审核
  APPROVED   // 已上线
  REJECTED   // 已拒绝
  ARCHIVED   // 已下架
}

enum ListingSource {
  EDITORIAL  // 编辑录入（种子数据）
  USER       // 用户发布
}

enum RentalType {
  SHORT  // 短租 ≤6月
  LONG   // 长租 >6月
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  nickname      String
  role          UserRole  @default(USER)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  listings      Listing[]
  reviews       Review[]

  @@index([email])
}

model City {
  id        String  @id @default(cuid())
  name      String  @unique   // 中文名："伦敦"
  nameEn    String             // 英文名："London"
  lat       Float              // 中心纬度
  lng       Float              // 中心经度
  zoom      Int                // 默认缩放级别

  listings  Listing[]
}

model Listing {
  id            String        @id @default(cuid())
  // 位置
  lat           Float
  lng           Float
  address       String
  buildingName  String?       // 小区/公寓名称
  cityId        String
  city          City          @relation(fields: [cityId], references: [id])
  // 基本信息
  price         Int           // £/月
  roomType      String        // Studio, 1bed, 2bed, 3bed, 4bed+
  rentalType    RentalType
  availableFrom DateTime?
  // 详细信息
  description   String?
  amenities     String[]      // 设施标签
  billsIncluded Boolean       @default(false)
  photos        String[]      // 照片URL列表
  // 联系方式
  contactWechat String?
  contactPhone  String?
  contactEmail  String?
  // 来源
  source        ListingSource
  sourceUrl     String?       // 原始链接（编辑录入时）
  sourcePlatform String?      // "Rightmove" / "Zoopla" / "SpareRoom"
  // 状态
  status        ListingStatus @default(PENDING)
  rejectReason  String?
  // 关联
  userId        String?
  user          User?         @relation(fields: [userId], references: [id])
  // 时间
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  expiresAt     DateTime?     // 90天后自动下架

  @@index([cityId])
  @@index([status])
  @@index([lat, lng])
  @@index([price])
  @@index([rentalType])
}

model Review {
  id              String   @id @default(cuid())
  // 位置（评价可以独立于listing存在）
  lat             Float
  lng             Float
  address         String
  buildingName    String?
  // 评分（1-5）
  transportScore  Int
  safetyScore     Int
  valueScore      Int
  overallScore    Int
  // 文字评价
  content         String
  // 关联
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  // 时间
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, lat, lng]) // 同一用户同一位置只能评价一次
  @@index([lat, lng])
}
```

### 4.2 种子数据：城市

```
伦敦      London       51.5074  -0.1278  zoom=12
曼彻斯特  Manchester   53.4808  -2.2426  zoom=13
伯明翰    Birmingham   52.4862  -1.8904  zoom=13
爱丁堡    Edinburgh    55.9533  -3.1883  zoom=13
利兹      Leeds        53.8008  -1.5491  zoom=13
格拉斯哥  Glasgow      55.8642  -4.2518  zoom=13
布里斯托  Bristol      51.4545  -2.5879  zoom=13
谢菲尔德  Sheffield    53.3811  -1.4701  zoom=13
```

## 5. API接口设计

### 5.1 认证相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 无 |
| POST | /api/auth/login | 登录 | 无 |
| POST | /api/auth/verify-email | 验证邮箱 | 无 |
| POST | /api/auth/forgot-password | 发送重置邮件 | 无 |
| POST | /api/auth/reset-password | 重置密码 | 无 |
| GET  | /api/auth/me | 获取当前用户 | 需认证 |

### 5.2 房源相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET  | /api/listings | 查询房源列表（支持筛选） | 无 |
| GET  | /api/listings/:id | 获取房源详情 | 无 |
| POST | /api/listings | 创建房源（用户发布） | 需认证 |
| GET  | /api/listings/geo | 地图标注数据（轻量） | 无 |

**GET /api/listings 查询参数**：
```
?cityId=xxx          // 城市筛选
&minPrice=500        // 最低价格
&maxPrice=800        // 最高价格
&roomType=1bed       // 房型
&rentalType=LONG     // 租期
&page=1&limit=20     // 分页
```

**GET /api/listings/geo 响应**（地图标注专用，只返回坐标和价格）：
```json
{
  "data": [
    { "id": "xxx", "lat": 51.53, "lng": -0.12, "price": 680, "roomType": "1bed", "rentalType": "LONG" }
  ]
}
```

### 5.3 评价相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET  | /api/reviews | 查询评价（按位置范围） | 无 |
| GET  | /api/reviews/location | 某位置的评价聚合+列表 | 无 |
| POST | /api/reviews | 创建评价 | 需认证 |

**GET /api/reviews/location 查询参数**：
```
?lat=51.53&lng=-0.12&radius=100   // 100米范围内的评价
```

**响应**：
```json
{
  "averageScores": { "transport": 4.2, "safety": 3.8, "value": 4.0, "overall": 4.1 },
  "totalCount": 3,
  "reviews": [...]
}
```

### 5.4 管理后台

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET  | /api/admin/stats | Dashboard统计 | Admin |
| GET  | /api/admin/pending | 待审核列表 | Admin |
| POST | /api/admin/listings/:id/approve | 审核通过 | Admin |
| POST | /api/admin/listings/:id/reject | 审核拒绝 | Admin |
| POST | /api/admin/seed | 录入种子房源 | Admin |
| DELETE | /api/admin/reviews/:id | 删除评价 | Admin |

### 5.5 城市

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET  | /api/cities | 获取城市列表 | 无 |

### 5.6 地理编码

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET  | /api/geocode | 地址→坐标转换 | 需认证 |

**统一响应格式**：
```json
// 成功
{ "success": true, "data": {...} }

// 错误
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## 6. 目录结构

```
uk-rental-map/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 首页（地图浏览）
│   │   ├── layout.tsx                  # 根布局
│   │   ├── listing/
│   │   │   └── [id]/page.tsx           # 房源详情页（SSR）
│   │   ├── publish/page.tsx            # 发布出租页
│   │   ├── admin/
│   │   │   ├── page.tsx                # 后台Dashboard
│   │   │   └── layout.tsx              # 后台布局（侧边栏）
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── listings/route.ts       # GET(列表), POST(创建)
│   │       ├── listings/[id]/route.ts  # GET(详情)
│   │       ├── listings/geo/route.ts   # GET(地图标注)
│   │       ├── reviews/route.ts        # GET, POST
│   │       ├── reviews/location/route.ts
│   │       ├── cities/route.ts
│   │       ├── geocode/route.ts
│   │       └── admin/
│   │           ├── stats/route.ts
│   │           ├── pending/route.ts
│   │           ├── listings/[id]/approve/route.ts
│   │           ├── listings/[id]/reject/route.ts
│   │           ├── seed/route.ts
│   │           └── reviews/[id]/route.ts
│   ├── components/
│   │   ├── ui/                         # shadcn/ui组件
│   │   ├── map/
│   │   │   ├── MapContainer.tsx        # 地图容器
│   │   │   ├── MapMarkers.tsx          # 房源标注层
│   │   │   ├── MapPopup.tsx            # 弹窗信息卡片
│   │   │   └── MapControls.tsx         # 缩放控件
│   │   ├── listing/
│   │   │   ├── ListingCard.tsx         # 左侧列表卡片
│   │   │   ├── ListingDetail.tsx       # 详情页主体
│   │   │   └── ListingForm.tsx         # 发布表单
│   │   ├── review/
│   │   │   ├── ReviewCard.tsx          # 单条评价
│   │   │   ├── ReviewScores.tsx        # 4维度评分展示
│   │   │   ├── ReviewForm.tsx          # 评价表单（模态）
│   │   │   └── AuthenticBadge.tsx      # 紫色"真实评价"标签
│   │   ├── filter/
│   │   │   ├── FilterPanel.tsx         # 左侧筛选面板
│   │   │   ├── CitySelector.tsx        # 城市按钮组
│   │   │   └── PriceSlider.tsx         # 价格滑块
│   │   ├── auth/
│   │   │   ├── LoginModal.tsx          # 登录/注册模态框
│   │   │   └── AuthGuard.tsx           # 需登录时的守卫
│   │   └── layout/
│   │       ├── Navbar.tsx              # 顶部导航栏
│   │       └── AdminSidebar.tsx        # 后台侧边栏
│   ├── lib/
│   │   ├── db.ts                       # Prisma客户端
│   │   ├── auth.ts                     # NextAuth配置
│   │   ├── email.ts                    # Resend邮件发送
│   │   ├── storage.ts                  # Supabase Storage
│   │   ├── geocode.ts                  # Mapbox地理编码
│   │   └── validators.ts              # Zod验证schemas
│   ├── hooks/
│   │   ├── useMap.ts                   # 地图状态管理
│   │   ├── useListings.ts             # 房源数据获取
│   │   ├── useFilters.ts              # 筛选状态
│   │   └── useAuth.ts                 # 认证状态
│   ├── types/
│   │   └── index.ts                   # 全局类型定义
│   └── styles/
│       └── globals.css                # Tailwind + Design Tokens
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                        # 种子数据（城市）
│   └── migrations/
├── public/
│   └── images/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 7. 安全设计

### 7.1 STRIDE威胁建模

| 威胁 | 场景 | 风险 | 缓解措施 |
|------|------|------|---------|
| 仿冒 | 伪造JWT登录 | 中 | JWT密钥强度≥256bit，httpOnly cookie |
| 篡改 | 修改他人房源/评价 | 中 | API层权限校验：只能操作自己的数据 |
| 否认 | 发布虚假信息后否认 | 低 | 数据库记录userId+createdAt |
| 信息泄露 | 用户密码泄露 | 高 | bcrypt加密，API不返回passwordHash |
| 拒绝服务 | API暴力请求 | 中 | Rate limiting：100请求/分钟/IP |
| 权限提升 | 普通用户访问/admin | 中 | 中间件检查user.role === ADMIN |

### 7.2 OWASP Top 10防护

| # | 威胁 | 防护措施 |
|---|------|---------|
| A01 | 失效的访问控制 | API中间件校验角色+资源所有权 |
| A02 | 加密失败 | bcrypt密码、HTTPS全站、env存密钥 |
| A03 | 注入 | Prisma参数化查询（ORM天然防SQL注入） |
| A04 | 不安全设计 | 本文档（安全设计Review） |
| A05 | 安全配置错误 | .env分环境、生产不暴露错误详情 |
| A06 | 易受攻击的组件 | npm audit、依赖锁定 |
| A07 | 身份认证失败 | 密码强度校验、邮箱验证、JWT过期 |
| A08 | 数据完整性 | 输入Zod验证、CSP header |
| A09 | 日志监控不足 | Vercel日志 + 关键操作审计 |
| A10 | SSRF | 地理编码API白名单域名 |

### 7.3 安全Headers

```typescript
// next.config.ts
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]
```

### 7.4 输入验证（Zod Schemas）

```typescript
// 注册验证
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
  nickname: z.string().min(2).max(20),
})

// 房源发布验证
const listingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  price: z.number().int().min(1).max(9999),
  roomType: z.enum(['Studio', '1bed', '2bed', '3bed', '4bed+']),
  rentalType: z.nativeEnum(RentalType),
  // ...
})

// 评价验证
const reviewSchema = z.object({
  transportScore: z.number().int().min(1).max(5),
  safetyScore: z.number().int().min(1).max(5),
  valueScore: z.number().int().min(1).max(5),
  overallScore: z.number().int().min(1).max(5),
  content: z.string().min(10).max(500),
})
```

## 8. 部署方案

### 8.1 环境配置

| 环境 | 平台 | 数据库 | 用途 |
|------|------|--------|------|
| Development | 本地 localhost:3000 | Supabase (dev project) | 开发调试 |
| Production | Vercel | Supabase (prod project) | 正式上线 |

### 8.2 环境变量

```env
# .env.example
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000

MAPBOX_ACCESS_TOKEN=pk.xxx
RESEND_API_KEY=re_xxx

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 8.3 部署流程

```
git push main
  → Vercel自动触发构建
  → npm run build (Next.js构建)
  → 自动部署到Vercel Edge Network
  → 健康检查通过 → 流量切换
```

### 8.4 成本估算（MVP阶段）

| 服务 | 免费额度 | 预估用量 | 月费用 |
|------|---------|---------|--------|
| Vercel | 100GB带宽 | <10GB | $0 |
| Supabase | 500MB数据库+1GB存储 | <100MB+<500MB | $0 |
| Mapbox | 50K地图加载/月 | <10K | $0 |
| Resend | 100封/天 | <50封/天 | $0 |
| 域名 | - | 1个.com | ~$12/年 |
| **总计** | | | **~$1/月** |

## 9. 技术风险与缓解

| 风险 | 可能性 | 影响 | 分值 | 缓解策略 |
|------|--------|------|------|---------|
| Mapbox免费额度不够 | 低(2) | 中(3) | 6 | 监控用量，必要时切换Leaflet+OSM |
| 地理编码精度差 | 中(3) | 中(3) | 9 | 允许手动打点兜底 |
| Supabase存储额度满 | 低(2) | 中(3) | 6 | 前端照片压缩≤500KB |
| 邮件进垃圾箱 | 中(3) | 中(3) | 9 | 配置SPF/DKIM域名验证 |
| 地图在某些设备卡顿 | 低(2) | 中(3) | 6 | 标注点超500个时强制cluster |

无高风险项（分值≥12）。

## 10. Sprint Contract（最终版）

### Sprint 1：基础设施 + 地图核心
**交付功能**：
- [ ] 项目初始化（Next.js + Tailwind + Prisma + shadcn/ui）
- [ ] 数据库Schema + 城市种子数据
- [ ] Mapbox地图集成（展示+缩放+拖动）
- [ ] 城市筛选聚焦（8城市按钮+flyTo动画）
- [ ] 房源标注展示（GeoJSON + cluster聚合）
- [ ] 高级筛选（价格滑块+房型+租期）→ 实时更新标注
- [ ] 标注弹窗（点击→Popup信息卡片）
- [ ] 房源详情页（SSR + 信息展示）
- [ ] 左侧房源列表（与地图联动）

**明确不做**：用户系统、评价、发布、后台

**验收标准**：
- 功能：地图可浏览+筛选+详情，有种子房源数据可看
- 性能：首屏≤2s，筛选≤500ms
- 体验：移动端响应式地图可用
- 安全：HTTPS，安全Headers

### Sprint 2：用户系统 + 评价 + 发布
**交付功能**：
- [ ] 邮箱注册登录（含邮件验证）
- [ ] 密码重置流程
- [ ] 评价发布（4维度打分+文字，模态框）
- [ ] 评价查看（详情页右栏：聚合分+列表）
- [ ] 发布出租信息（表单+地图定位+地理编码+照片上传）
- [ ] AuthGuard（未登录时引导登录）

**明确不做**：审核后台、种子管理

**验收标准**：
- 功能：注册→登录→发布→评价完整流程跑通
- 安全：密码bcrypt、防XSS/注入、JWT httpOnly
- 代码：ESLint零警告、组件≤300行

### Sprint 3：后台 + 打磨 + 上线
**交付功能**：
- [ ] 管理后台Dashboard（统计卡片）
- [ ] 审核队列（查看/通过/拒绝+邮件通知）
- [ ] 种子数据录入（简化表单+地理编码）
- [ ] 评价管理（列表+删除）
- [ ] 房源90天自动下架逻辑
- [ ] 全站UI打磨（Design Token对齐设计稿）
- [ ] 数据埋点接入
- [ ] 隐私政策页
- [ ] 响应式适配最终检查

**明确不做**：需求匹配提醒、管理中心

**验收标准**：
- 功能：后台审核流程跑通，种子数据可录入
- 体验：核心流程≤3步，所有操作有反馈
- 安全：OWASP Top 10逐项通过
- 上线：Vercel部署成功，域名配置完成
