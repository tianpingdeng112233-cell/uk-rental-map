# UK Rental Map - 设计规范文档

> 基于Stitch产出的高保真设计稿和DESIGN.md提取

## 1. 品牌名称
- 产品名：**The Curated Navigator**（英文品牌名，Stitch生成）
- 中文名：**英国租房地图**（导航栏中文Logo）
- 设计北极星：Editorial Utility——高信息密度 × 杂志级呼吸感

## 2. 色彩系统

### 品牌色
| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | #004AC6 | 主要CTA渐变起点 |
| Primary Container | #2563EB | 主要CTA渐变终点、价格标签 |
| On Primary | #FFFFFF | 主色上的文字 |

### 表面色层级
| 名称 | 色值 | 用途 |
|------|------|------|
| Surface (画布) | #F7F9FB | 页面底层背景 |
| Surface Container Low | #F2F4F6 | 大结构分区（侧边栏） |
| Surface Container Lowest | #FFFFFF | 内容卡片、模态框、输入框 |
| Surface Container High | — | 次要按钮背景 |

### 功能色
| 名称 | 色值 | 用途 |
|------|------|------|
| Success/Green | #059669 | 审核通过、正向 |
| Warning/Amber | #D97706 | 中等评分、提醒 |
| Error/Red | #DC2626 | 拒绝、错误 |
| Tertiary (紫) | #6A1EDB | "Authentic"真实评价标签 |
| Tertiary Fixed | 紫色浅底 | 真实评价标签背景 |

### 文字色
| 名称 | 色值 | 用途 |
|------|------|------|
| On Surface | #191C1E | 主要文字（禁止用纯黑#000） |
| On Surface Variant | #434655 | 图标、次要文字 |
| Outline Variant | #C3C6D7 | Ghost边框（15%透明度） |

### 评分星星
| 名称 | 色值 | 用途 |
|------|------|------|
| Star Yellow | #F59E0B | 评分星星填充 |

## 3. 字体系统

| 层级 | Token | 字号 | 字重 | 用途 |
|------|-------|------|------|------|
| Display | display-md | 2.75rem (44px) | Bold | 价格大字、Hero标题 |
| Headline | headline-sm | 1.5rem (24px) | SemiBold | 页面H1标题 |
| Title | title-md | 1.125rem (18px) | SemiBold | 卡片标题、H2 |
| Body | body-md | 0.875rem (14px) | Regular | 正文描述、评价 |
| Label | label-sm | 0.6875rem (11px) | SemiBold | 元数据、时间戳、标签 |

- 英文字体：Inter
- 中文字体：Noto Sans SC（思源黑体）
- 中文使用title-lg保持视觉权重匹配
- 正文行高：1.6

## 4. 间距系统
- 基准：4px
- 常用：4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px

## 5. 圆角系统
| 名称 | 值 | 用途 |
|------|-----|------|
| sm | 4px | 小按钮 |
| DEFAULT | 8px | 按钮、输入框 |
| md | 12px | 卡片 |
| lg | 16px | 模态框 |
| full | 9999px | 药丸标签、地图价格标注 |

## 6. 阴影系统

**核心规则**：使用Ambient Depth（色调阴影）而非传统灰色阴影。

| 名称 | 值 | 用途 |
|------|-----|------|
| Ambient | 0 12px 32px rgba(15, 23, 42, 0.06) | 浮动元素、模态框 |
| Medium | 中等阴影 | 地图价格标签浮动 |

**玻璃态**：浮动控件用surface_container_lowest 80%透明度 + 20px backdrop-blur。

## 7. 组件规范

### 按钮
- **Primary**：渐变填充（#004AC6 → #2563EB，135°）、8px圆角、无边框
- **Secondary**：surface_container_high背景 + on_secondary_container文字
- **Tertiary**：纯文字+图标，hover时surface_container_low背景
- **Danger**：红色#DC2626

### 卡片
- 背景：#FFFFFF
- 圆角：12px
- **禁止1px分割线**，用背景色差和间距分组
- 列表项间距：16px

### 地图价格标签
- 背景：Primary蓝色
- 文字：白色、加粗
- 圆角：全圆角(pill)
- 带Medium阴影浮动

### 输入框
- 默认背景：#FFFFFF
- 聚焦态：Primary色40%透明度Ghost边框 + 2px外发光
- 无硬边框

### "Authentic"真实评价标签
- 紫色#6A1EDB体系
- 药丸形状
- tertiary_fixed背景 + on_tertiary_fixed文字

### 图标
- 风格：Lucide线性图标
- 粗细：1.5px stroke
- 颜色：#434655 (on_surface_variant)
- 尺寸：16px / 20px / 24px

## 8. 关键设计规则

### Do
- 用背景色差和间距分组，不用分割线
- 图标用on_surface_variant (#434655)
- 中文字体用更大一级确保视觉匹配
- 所有交互点至少4px圆角

### Don't
- 禁止纯黑#000000文字，用#191C1E
- 禁止1px实线边框分隔大区域
- 禁止硬边角按钮

## 9. PRD页面覆盖检查

| PRD页面 | 设计稿 | 状态 |
|---------|--------|------|
| P01 首页/地图浏览 | 01-首页.png | ✅ 左侧筛选+右侧Google Maps |
| P02 标注弹窗 | 01-首页.png中可见价格标注 | ✅ |
| P03 房源详情页 | 03-房源详情.png | ✅ 左栏信息+右栏评价 |
| P04 登录/注册 | 02-登录注册.png | ✅ 模态卡片+Tab切换 |
| P05 发布出租 | 04-发布出租.png | ✅ 左表单+右地图 |
| P06 发布评价 | 05-发布评价.png | ✅ 模态卡片+4维度星评 |
| P07 管理后台 | 06-管理后台.png | ✅ Dashboard+审核+种子录入 |

**覆盖率：7/7 = 100%**
