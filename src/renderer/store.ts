// 界面状态（zustand）。第 1 步全部是假数据；第 2-5 步会改成从主进程读取。
import { create } from 'zustand'
import type { Member, Message, Server } from '../shared/types'

export type View =
  | { type: 'dm'; memberId: string | null } // memberId 为 null = 私信首页
  | { type: 'channel'; serverId: string; channelId: string }
  | { type: 'settings' }

const members: Member[] = [
  {
    id: 'claude',
    name: 'Claude',
    avatar: 'C',
    kind: 'api',
    provider: 'anthropic',
    model: 'claude',
    persona: '',
    notify: true,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    avatar: 'G',
    kind: 'api',
    provider: 'openai-compatible',
    persona: '',
    notify: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    avatar: 'D',
    kind: 'api',
    provider: 'openai-compatible',
    persona: '',
    notify: true,
  },
  {
    id: 'muse',
    name: 'Muse Spark',
    avatar: 'M',
    kind: 'api',
    provider: 'openai-compatible',
    persona: '',
    notify: true,
  },
  {
    id: 'artist',
    name: '画师',
    avatar: '🎨',
    kind: 'web',
    webUrl: 'https://www.midjourney.com',
    persona: '',
    notify: true,
  },
]

const servers: Server[] = [
  {
    id: 'study',
    name: '学习',
    icon: '学',
    channels: [
      {
        id: 'general',
        serverId: 'study',
        name: '综合讨论',
        memberIds: ['claude', 'chatgpt', 'deepseek'],
        defaultResponderId: 'claude',
      },
      {
        id: 'code',
        serverId: 'study',
        name: '代码',
        memberIds: ['claude', 'chatgpt'],
        defaultResponderId: 'claude',
      },
    ],
  },
  {
    id: 'create',
    name: '创作',
    icon: '创',
    channels: [
      {
        id: 'ideas',
        serverId: 'create',
        name: '小说灵感',
        memberIds: ['claude', 'deepseek', 'muse'],
        defaultResponderId: null,
      },
    ],
  },
]

const t0 = Date.now() - 60 * 60 * 1000
const fake = (
  id: string,
  conversationId: string,
  authorId: string,
  content: string,
  minutes: number,
): Message => ({
  id,
  conversationId,
  authorId,
  content,
  createdAt: t0 + minutes * 60 * 1000,
  status: 'done',
})

const messages: Record<string, Message[]> = {
  general: [
    fake('m1', 'general', 'me', '@所有人 帮我比较一下 RAG 和微调的区别', 1),
    fake('m2', 'general', 'claude', 'RAG 改变模型能看到的资料，微调改变模型的行为风格……', 2),
    fake('m3', 'general', 'chatgpt', '补充一点：RAG 更新资料只需要更新数据库，成本低很多。', 3),
  ],
  'dm:claude': [
    fake('m4', 'dm:claude', 'me', '你好！', 5),
    fake('m5', 'dm:claude', 'claude', '你好！今天想聊点什么？', 6),
  ],
}

interface State {
  members: Member[]
  servers: Server[]
  messages: Record<string, Message[]>
  view: View
  setView: (view: View) => void
  /** 第 1 步：只把你的消息加到列表里，还没有 AI 回复 */
  addMyMessage: (conversationId: string, content: string) => void
}

export const useStore = create<State>((set) => ({
  members,
  servers,
  messages,
  view: { type: 'channel', serverId: 'study', channelId: 'general' },
  setView: (view) => set({ view }),
  addMyMessage: (conversationId, content) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] ?? []),
          {
            id: crypto.randomUUID(),
            conversationId,
            authorId: 'me',
            content,
            createdAt: Date.now(),
            status: 'done',
          },
        ],
      },
    })),
}))
