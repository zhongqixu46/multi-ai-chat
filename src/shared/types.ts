// 主进程和界面共用的数据类型，以及界面可以调用的接口清单。
// 界面只能通过 window.api 调用这里列出的函数，碰不到文件、数据库和密钥。

export type Lang = 'zh-CN' | 'en'

/** AI 成员：API 型直接调用接口；网页型把网站嵌进私聊窗口 */
export type MemberKind = 'api' | 'web'
/** Claude 用 Anthropic SDK；ChatGPT / DeepSeek / Muse Spark 都走 OpenAI 兼容格式 */
export type Provider = 'anthropic' | 'openai-compatible'

export interface Member {
  id: string
  name: string
  avatar: string // 第一阶段用一个字或 emoji 当头像
  kind: MemberKind
  provider?: Provider
  baseUrl?: string // OpenAI 兼容服务的地址
  model?: string
  webUrl?: string // 网页型成员的网址
  persona: string // 人设提示词
  notify: boolean // 这个 AI 的任务完成通知开关
}

export interface Channel {
  id: string
  serverId: string
  name: string
  memberIds: string[]
  defaultResponderId: string | null // 不 @ 任何人时谁来回答；null = 不回答
}

export interface Server {
  id: string
  name: string
  icon: string
  channels: Channel[]
}

/** 'me' 表示你自己，其余是成员 id */
export type AuthorId = 'me' | string

export interface Message {
  id: string
  conversationId: string // 频道 id，或 'dm:<成员 id>'
  authorId: AuthorId
  content: string
  createdAt: number
  status: 'streaming' | 'done' | 'error'
}

export interface Artifact {
  id: string
  messageId: string
  conversationId: string
  kind: 'code' | 'image' | 'file'
  fileName: string
  createdAt: number
}

export interface Task {
  id: string
  conversationId: string
  memberId: string
  title: string
  status: 'running' | 'success' | 'failed'
  startedAt: number
  endedAt: number | null
}

/** 加密数据库自检（第 1 步 1.2）每一项的结果 */
export type SelfTestStep = 'create' | 'header' | 'noKey' | 'wrongKey' | 'rightKey'
export interface SelfTestResult {
  ok: boolean
  steps: { step: SelfTestStep; ok: boolean; detail: string }[]
}

/**
 * 界面可调用的接口。第 1 步只有两个；之后每一步在这里加函数，
 * 再到 main/index.ts 注册、preload/index.ts 暴露。
 */
export interface Api {
  ping(): Promise<string>
  selfTest(): Promise<SelfTestResult>
}

declare global {
  interface Window {
    api: Api
  }
}
