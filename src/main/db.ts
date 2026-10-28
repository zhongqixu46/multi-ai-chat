// 数据与加密。第 1 步只有“加密数据库自检”；
// 第 2 步会在这里加入：账号、主密钥、恢复密钥、所有表和查询。
import Database from 'better-sqlite3-multiple-ciphers'
import { randomBytes } from 'node:crypto'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import type { SelfTestResult, SelfTestStep } from '../shared/types'

/** 用 SQLCipher 方式打开（或创建）一个加密数据库 */
export function openEncrypted(path: string, keyHex: string): Database.Database {
  const db = new Database(path)
  db.pragma(`cipher='sqlcipher'`)
  db.pragma(`key='${keyHex}'`) // keyHex 只含 0-9a-f，不会破坏语句
  return db
}

/** 能否读取数据库（用来验证“没有密钥 / 密钥错误时读不了”） */
function canRead(db: Database.Database): boolean {
  try {
    db.prepare('SELECT count(*) FROM sqlite_master').get()
    return true
  } catch {
    return false
  } finally {
    db.close()
  }
}

/**
 * 自检：在临时目录建一个加密数据库，确认
 * 1) 能写入  2) 文件头不是明文  3) 没有密钥读不了  4) 错误密钥读不了  5) 正确密钥能读回
 * 全部通过才说明加密模块在这台电脑上装好了。
 */
export function runEncryptionSelfTest(tempDir: string): SelfTestResult {
  const path = join(tempDir, `multi-ai-chat-selftest-${Date.now()}.db`)
  const key = randomBytes(32).toString('hex')
  const steps: SelfTestResult['steps'] = []

  const check = (step: SelfTestStep, fn: () => string): void => {
    try {
      steps.push({ step, ok: true, detail: fn() })
    } catch (err) {
      steps.push({ step, ok: false, detail: err instanceof Error ? err.message : String(err) })
    }
  }

  check('create', () => {
    const db = openEncrypted(path, key)
    db.exec('CREATE TABLE t (x TEXT)')
    db.prepare('INSERT INTO t VALUES (?)').run('hello')
    db.close()
    return 'ok'
  })
  check('header', () => {
    const head = readFileSync(path).subarray(0, 16).toString('latin1')
    if (head.startsWith('SQLite format 3')) throw new Error('plain SQLite header')
    return 'encrypted header'
  })
  check('noKey', () => {
    if (canRead(new Database(path))) throw new Error('readable without key')
    return 'rejected'
  })
  check('wrongKey', () => {
    if (canRead(openEncrypted(path, randomBytes(32).toString('hex'))))
      throw new Error('readable with wrong key')
    return 'rejected'
  })
  check('rightKey', () => {
    const db = openEncrypted(path, key)
    const row = db.prepare('SELECT x FROM t').get() as { x: string } | undefined
    db.close()
    if (row?.x !== 'hello') throw new Error('wrong data read back')
    return 'read back "hello"'
  })

  rmSync(path, { force: true })
  return { ok: steps.every((s) => s.ok), steps }
}
