# Multi AI Chat

私人桌面多 AI 群聊 App（第一阶段：Windows 单人版）。方案文档见「多 AI 群聊 App 初步方案」。

当前进度：**第 1 步 · 项目骨架**（三栏界面 + 假数据、中英文切换、安全设置、加密数据库自检）。

## 第一次运行（Windows PowerShell）

**准备**

1. 安装 Node.js 当前的 LTS 版本（https://nodejs.org）和 Git。
2. 加密数据库模块需要在你的电脑上编译，所以还需要：
   - Visual Studio Installer 里勾选 **“使用 C++ 的桌面开发”**；
   - Python 3（https://www.python.org，安装时勾选 “Add python.exe to PATH”）。

**步骤**（也可以直接双击 `setup.bat` 安装、双击 `start.bat` 启动）

```powershell
cd $HOME\Desktop\multi-ai-chat
npm install          # 安装依赖；结束时会自动把加密模块编译成 Electron 版本
npm run format       # 第一次运行时统一代码格式
npm run dev          # 启动 App
```

**验证第 1 步**（对应方案里的 1.1–1.6）

| 单元 | 怎么验证                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 1.1  | `npm run dev` 能打开窗口                                                                                   |
| 1.2  | 左下角 ⚙️ → 设置 → **运行自检**，5 项全部 ✅                                                               |
| 1.3  | 设置里 **测试连接** 显示 `pong`；按 `Ctrl+Shift+I` 打开开发者工具，在 Console 输入 `require`，应提示未定义 |
| 1.4  | `npm run typecheck` 没有报错                                                                               |
| 1.5  | 左侧切换服务器、频道和私信，假消息正常显示；可以发送消息（暂时没有 AI 回复）                               |
| 1.6  | 设置里切换语言，所有文字跟着变                                                                             |

**建立 Git 仓库**（1.1）

```powershell
git init
git add .
git commit -m "Step 1: project skeleton"
```

然后在 GitHub 新建一个 **Private** 仓库，按页面提示 `git remote add origin ...` 和 `git push`。

## 常见问题

- **`npm install` 在 better-sqlite3-multiple-ciphers 处报错**：通常是缺少 C++ 编译工具或 Python。装好后重新运行 `npm run postinstall`。
- **自检有 ❌**：把设置页里显示的结果截图发给我。
- **界面空白**：按 `Ctrl+Shift+I` 打开开发者工具，把 Console 里的红色错误发给我。

## 常用命令

```powershell
npm run dev        # 开发模式
npm run typecheck  # 类型检查
npm run check      # 类型检查 + 测试（提交前运行）
npm run format     # 格式化代码
npm run build:win  # 生成 Windows 安装包（dist/）
```
