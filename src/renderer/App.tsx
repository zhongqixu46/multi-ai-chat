// 整个界面：左侧服务器栏 + 频道/私信栏 + 聊天区 + 频道成员栏，以及设置页。
// 超过约 400 行时，再把设置页、聊天区拆成单独文件。
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLang } from './i18n'
import { useStore } from './store'
import type { Member, Message, SelfTestResult } from '../shared/types'

export default function App() {
  const view = useStore((s) => s.view)
  return (
    <div className="flex h-full text-sm select-none">
      <ServerBar />
      {view.type === 'settings' ? (
        <Settings />
      ) : (
        <>
          <Sidebar />
          <ChatArea />
          {view.type === 'channel' && <MemberList />}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- 最左侧：服务器栏
function ServerBar() {
  const { t } = useTranslation()
  const { servers, view, setView } = useStore()
  const activeServer = view.type === 'channel' ? view.serverId : null
  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-[#1e1f22] py-3">
      <RoundButton
        label={t('home')}
        active={view.type === 'dm'}
        onClick={() => setView({ type: 'dm', memberId: null })}
      >
        💬
      </RoundButton>
      <div className="h-px w-8 bg-zinc-700" />
      {servers.map((server) => (
        <RoundButton
          key={server.id}
          label={server.name}
          active={activeServer === server.id}
          onClick={() =>
            setView({ type: 'channel', serverId: server.id, channelId: server.channels[0].id })
          }
        >
          {server.icon}
        </RoundButton>
      ))}
      <div className="flex-1" />
      <RoundButton
        label={t('settings')}
        active={view.type === 'settings'}
        onClick={() => setView({ type: 'settings' })}
      >
        ⚙️
      </RoundButton>
    </nav>
  )
}

function RoundButton(props: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      title={props.label}
      onClick={props.onClick}
      className={`flex h-12 w-12 items-center justify-center text-lg transition-all ${
        props.active
          ? 'rounded-2xl bg-indigo-500 text-white'
          : 'rounded-3xl bg-[#313338] hover:rounded-2xl hover:bg-indigo-500'
      }`}
    >
      {props.children}
    </button>
  )
}

// ---------------------------------------------------------------- 第二栏：频道列表或私信列表
function Sidebar() {
  const { t } = useTranslation()
  const { servers, members, view, setView } = useStore()

  if (view.type === 'channel') {
    const server = servers.find((s) => s.id === view.serverId)!
    return (
      <aside className="flex w-60 shrink-0 flex-col bg-[#2b2d31]">
        <header className="border-b border-black/30 px-4 py-3 font-semibold text-white">
          {server.name}
        </header>
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-zinc-400 uppercase">
          {t('channels')}
        </p>
        {server.channels.map((channel) => (
          <SidebarItem
            key={channel.id}
            active={view.channelId === channel.id}
            onClick={() => setView({ type: 'channel', serverId: server.id, channelId: channel.id })}
          >
            <span className="text-zinc-500">#</span> {channel.name}
          </SidebarItem>
        ))}
      </aside>
    )
  }

  const activeMember = view.type === 'dm' ? view.memberId : null
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#2b2d31]">
      <header className="border-b border-black/30 px-4 py-3 font-semibold text-white">
        {t('directMessages')}
      </header>
      <div className="pt-2">
        {members.map((member) => (
          <SidebarItem
            key={member.id}
            active={activeMember === member.id}
            onClick={() => setView({ type: 'dm', memberId: member.id })}
          >
            <Avatar member={member} small /> {member.name}
          </SidebarItem>
        ))}
      </div>
    </aside>
  )
}

function SidebarItem(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      className={`mx-2 flex items-center gap-2 rounded px-2 py-1.5 text-left ${
        props.active
          ? 'bg-[#404249] text-white'
          : 'text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
      }`}
    >
      {props.children}
    </button>
  )
}

function Avatar({ member, small }: { member?: Member; small?: boolean }) {
  const { t } = useTranslation()
  const size = small ? 'h-6 w-6 text-xs' : 'h-10 w-10 text-base'
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full ${member ? 'bg-indigo-500' : 'bg-emerald-600'} font-semibold text-white`}
    >
      {member ? member.avatar : t('me').slice(0, 1)}
    </span>
  )
}

// ---------------------------------------------------------------- 聊天区
function ChatArea() {
  const { t } = useTranslation()
  const { servers, members, messages, view, addMyMessage } = useStore()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 当前对话：频道用频道 id，私聊用 "dm:<成员 id>"
  let conversationId: string | null = null
  let title = ''
  let dmMember: Member | undefined
  if (view.type === 'channel') {
    const channel = servers
      .find((s) => s.id === view.serverId)
      ?.channels.find((c) => c.id === view.channelId)
    conversationId = channel?.id ?? null
    title = `# ${channel?.name ?? ''}`
  } else if (view.type === 'dm' && view.memberId) {
    dmMember = members.find((m) => m.id === view.memberId)
    conversationId = `dm:${view.memberId}`
    title = dmMember?.name ?? ''
  }
  const list: Message[] = conversationId ? (messages[conversationId] ?? []) : []

  // 新消息出现时滚到底部。注意要用花括号：新版 Chromium 的 scrollIntoView 会返回 Promise，
  // 如果直接返回给 useEffect，React 会把它当成清理函数而报错。
  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [list.length, conversationId])

  if (!conversationId) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#313338] text-zinc-500">
        {t('fakeDataNote')}
      </main>
    )
  }

  // 网页型成员：第 6 步在这里嵌入网站
  if (dmMember?.kind === 'web') {
    return (
      <main className="flex flex-1 flex-col bg-[#313338]">
        <ChatHeader title={title} subtitle={t('webMember')} />
        <div className="flex flex-1 items-center justify-center text-zinc-500">
          {t('webMemberHint', { name: dmMember.name })}
        </div>
      </main>
    )
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    addMyMessage(conversationId!, text)
    setDraft('')
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#313338]">
      <ChatHeader title={title} subtitle={t('fakeDataNote')} />
      <div className="flex-1 overflow-y-auto px-4 py-4 select-text">
        {list.length === 0 && <p className="text-zinc-500">{t('noMessages')}</p>}
        {list.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            member={members.find((m) => m.id === message.authorId)}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-5">
        <textarea
          value={draft}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter 发送，Shift+Enter 换行
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={t('messagePlaceholder', { name: title })}
          className="w-full resize-none rounded-lg bg-[#383a40] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500"
        />
      </div>
    </main>
  )
}

function ChatHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex items-baseline gap-3 border-b border-black/30 px-4 py-3">
      <span className="font-semibold text-white">{title}</span>
      <span className="truncate text-xs text-zinc-500">{subtitle}</span>
    </header>
  )
}

function MessageRow({ message, member }: { message: Message; member?: Member }) {
  const { t, i18n } = useTranslation()
  const time = new Date(message.createdAt).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="flex gap-3 py-2">
      <Avatar member={member} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-white">{member ? member.name : t('me')}</span>
          <span className="text-xs text-zinc-500">{time}</span>
        </div>
        {/* 第 3 步改成安全过滤后的 Markdown 显示 */}
        <p className="break-words whitespace-pre-wrap text-zinc-200">{message.content}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 频道成员栏
function MemberList() {
  const { t } = useTranslation()
  const { servers, members, view } = useStore()
  if (view.type !== 'channel') return null
  const channel = servers
    .find((s) => s.id === view.serverId)
    ?.channels.find((c) => c.id === view.channelId)
  const inChannel = members.filter((m) => channel?.memberIds.includes(m.id))
  return (
    <aside className="hidden w-56 shrink-0 bg-[#2b2d31] px-3 py-4 lg:block">
      <p className="pb-2 text-xs font-semibold text-zinc-400 uppercase">
        {t('members')} — {inChannel.length}
      </p>
      {inChannel.map((member) => (
        <div key={member.id} className="flex items-center gap-2 py-1.5 text-zinc-300">
          <Avatar member={member} small /> {member.name}
        </div>
      ))}
    </aside>
  )
}

// ---------------------------------------------------------------- 设置页（第 1 步：语言 + 安全检查）
function Settings() {
  const { t, i18n } = useTranslation()
  const setView = useStore((s) => s.setView)
  const [pong, setPong] = useState('')
  const [result, setResult] = useState<SelfTestResult | null>(null)
  const [running, setRunning] = useState(false)

  const runSelfTest = async () => {
    setRunning(true)
    try {
      setResult(await window.api.selfTest())
    } catch (err) {
      setResult({ ok: false, steps: [{ step: 'create', ok: false, detail: String(err) }] })
    } finally {
      setRunning(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#313338] px-10 py-8 select-text">
      <button
        className="mb-6 text-zinc-400 hover:text-white"
        onClick={() => setView({ type: 'dm', memberId: null })}
      >
        ← {t('back')}
      </button>
      <h1 className="mb-6 text-xl font-semibold text-white">{t('settings')}</h1>

      <section className="mb-8">
        <h2 className="mb-2 font-semibold text-white">{t('language')}</h2>
        <select
          value={i18n.language}
          onChange={(e) => changeLang(e.target.value as 'zh-CN' | 'en')}
          className="rounded bg-[#1e1f22] px-3 py-2 text-zinc-200"
        >
          <option value="zh-CN">简体中文</option>
          <option value="en">English</option>
        </select>
      </section>

      <section className="mb-8 max-w-xl">
        <h2 className="mb-3 font-semibold text-white">{t('security')}</h2>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-zinc-300">{t('ping')}</span>
          <button
            className="rounded bg-indigo-500 px-3 py-1 text-white"
            onClick={async () => setPong(await window.api.ping())}
          >
            {t('runPing')}
          </button>
          <span className="text-emerald-400">{pong}</span>
        </div>

        <p className="text-zinc-300">{t('selfTest')}</p>
        <p className="mb-3 text-xs text-zinc-500">{t('selfTestHint')}</p>
        <button
          disabled={running}
          className="rounded bg-indigo-500 px-3 py-1 text-white disabled:opacity-50"
          onClick={runSelfTest}
        >
          {running ? t('running') : t('runSelfTest')}
        </button>
        {result && (
          <div className="mt-4 rounded bg-[#2b2d31] p-4">
            <p className={result.ok ? 'mb-2 text-emerald-400' : 'mb-2 text-red-400'}>
              {result.ok ? t('passed') : t('failed')}
            </p>
            {result.steps.map((s) => (
              <p key={s.step} className="text-zinc-300">
                {s.ok ? '✅' : '❌'} {t(`step_${s.step}`)}{' '}
                <span className="text-xs text-zinc-500">{s.detail}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
