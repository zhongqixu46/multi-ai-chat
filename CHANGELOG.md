# 更新记录

## 0.0.1

- 第 1 步：项目骨架（三栏界面、中英文切换、安全设置、加密数据库自检）
- 修复：Electron 45 不再自动下载程序本体，`postinstall` 改为先运行 `electron/install.js`
- 修复：TypeScript 找不到加密 SQLite 的类型声明（tsconfig 里加 `paths`），以及 CSS 导入报错
- 修复：新版 Chromium 的 `scrollIntoView()` 返回 Promise，导致聊天区崩溃
- 修复：英文界面下"我"的头像仍显示中文
- 新增 `setup.bat`（检查环境 + 安装 + 格式化 + 类型检查，结果写入 setup-log.txt）和 `start.bat`（启动开发模式）
