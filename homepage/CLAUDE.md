CLAUDE.md - 项目指南与规范
1. 项目概述与技术栈
定位：吴氏企业官网

前端：React 19, Next.js 15 (App Router), Tailwind CSS, TypeScript

后端/数据库：Node.js, Prisma ORM, PostgreSQL

状态管理/API：TanStack Query (React Query)

身份验证：NextAuth.js

2. 核心开发命令
在执行相关任务前，请优先使用以下命令：

本地开发：npm run dev (启动开发服务器，端口 3000)

生产构建：npm run build

代码检查：npm run lint (ESLint) / npm run format (Prettier)

运行测试：

单元测试：npm run test (Vitest)

端到端测试：npm run test:e2e (Playwright)

数据库迁移：npx prisma db push (开发环境) / npx prisma migrate dev

3. 代码风格与规范
通用原则
TypeScript：必须开启严格模式 (strict: true)。严格禁止使用 any 类型，无法确定时使用 unknown。

错误处理：所有异步操作和 API 请求必须使用 try-catch 包裹，并在客户端捕获时展示友好的 Toast 提示，同时用 console.error 打印错误上下文。

组件设计：

优先使用函数式组件（Functional Components）。

大组件必须拆分为单职责的小组件。组件文件放在 components/ 目录下。

命名规范
组件与文件：组件名和文件名使用大驼峰（PascalCase），例如 UserProfile.tsx。

工具函数与变量：使用小驼峰（camelCase），例如 formatCurrency.ts。

常量：全部大写并用下划线分隔，例如 MAX_RETRY_COUNT = 3。

样式：统一使用 Tailwind CSS 类名，避免编写独立的 .css 文件。

4. 开发约定与最佳实践
API 响应：所有自定义 API 的返回格式必须统一为 { success: boolean, data?: any, error?: string }。

状态管理：服务端数据优先使用 TanStack Query 进行缓存和获取，避免将全局状态滥用在 Context 中。

提交规范：代码修改后，在生成 Commit 信息时，请遵循 Angular 规范（如 feat: , fix: , docs: , refactor: ）。

?? 给 Claude 的提示：
当我要求你编写新代码、重构或运行测试时，请务必严格遵守上述的命令、命名规范和技术栈约束。如果发现代码中有违反上述规范的地方，请在修改时一并修复。