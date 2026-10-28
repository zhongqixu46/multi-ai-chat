// 中英文字典。界面上的所有文字都从这里取，切换语言时整个界面跟着变。
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Lang } from '../shared/types'

const zh = {
  home: '私信',
  directMessages: '私信',
  channels: '频道',
  members: '成员',
  me: '我',
  messagePlaceholder: '发消息到 {{name}}',
  send: '发送',
  noMessages: '还没有消息，打个招呼吧。',
  webMember: '网页型成员',
  webMemberHint: '{{name}} 的网页会在第 6 步嵌入这里。',
  apiMember: 'API 型成员',
  fakeDataNote: '当前是假数据，第 3 步接入真实 AI。',
  settings: '设置',
  back: '返回',
  language: '界面语言',
  security: '安全检查',
  ping: '主进程连接测试',
  runPing: '测试连接',
  selfTest: '加密数据库自检',
  selfTestHint:
    '在临时目录创建一个加密数据库并检查能否被读取，用来确认加密模块在这台电脑上装好了。',
  runSelfTest: '运行自检',
  running: '运行中…',
  passed: '全部通过',
  failed: '未通过',
  step_create: '创建加密数据库并写入',
  step_header: '文件头不是明文 SQLite',
  step_noKey: '没有密钥时无法读取',
  step_wrongKey: '错误密钥无法读取',
  step_rightKey: '正确密钥可以读回',
}

type Dict = typeof zh

const en: Dict = {
  home: 'Direct Messages',
  directMessages: 'Direct Messages',
  channels: 'Channels',
  members: 'Members',
  me: 'Me',
  messagePlaceholder: 'Message {{name}}',
  send: 'Send',
  noMessages: 'No messages yet. Say hello.',
  webMember: 'Web member',
  webMemberHint: "{{name}}'s website will be embedded here in step 6.",
  apiMember: 'API member',
  fakeDataNote: 'Demo data for now; real AI replies arrive in step 3.',
  settings: 'Settings',
  back: 'Back',
  language: 'Language',
  security: 'Security checks',
  ping: 'Main process connection',
  runPing: 'Test',
  selfTest: 'Encrypted database self-test',
  selfTestHint:
    'Creates an encrypted database in a temp folder and checks who can read it, to confirm the encryption module works on this computer.',
  runSelfTest: 'Run self-test',
  running: 'Running…',
  passed: 'All passed',
  failed: 'Failed',
  step_create: 'Create encrypted database and write',
  step_header: 'File header is not plain SQLite',
  step_noKey: 'Cannot read without a key',
  step_wrongKey: 'Cannot read with a wrong key',
  step_rightKey: 'Correct key reads data back',
}

/** 上次选择的语言只是界面偏好，存在本机浏览器存储里；读不到就用中文 */
export function savedLang(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

export function changeLang(lang: Lang): void {
  i18n.changeLanguage(lang)
  try {
    localStorage.setItem('lang', lang)
  } catch {
    // 存不了也不影响使用
  }
}

i18n.use(initReactI18next).init({
  resources: { 'zh-CN': { translation: zh }, en: { translation: en } },
  lng: savedLang(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false }, // React 自己会转义
})

export default i18n
