// Confirmed live on this host: the Prisma Rust query engine can panic
// ("timer has gone away") under CPU throttling, and Prisma's own diagnostics
// say the engine is non-recoverable afterward — every later query on the same
// process fails identically, silently, forever (routes catch their own errors
// and just return 500s, so nothing here would otherwise notice or recover).
//
// This wraps the shared PrismaClient so that if a panic happens ANYWHERE
// (a route, a cron job, anywhere), the process deliberately exits shortly
// after, so Passenger restarts the app with a fresh engine. The original
// error still propagates to the caller untouched — this only adds a
// best-effort self-heal on top, it doesn't change any request's behavior.

function isPanicError(err) {
  return err?.name === 'PrismaClientRustPanicError' || /panic/i.test(err?.message || '')
}

let restarting = false
function triggerRestart(err) {
  if (restarting) return
  restarting = true
  console.error('🔥 Prisma query engine panicked — process is now unstable per Prisma\'s own diagnostics. Restarting in 1s for a fresh engine.')
  console.error(err)
  setTimeout(() => process.exit(1), 1000)
}

function wrap(target) {
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) return target
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver)
      if (typeof value === 'function') {
        return function (...args) {
          const result = value.apply(obj, args)
          if (result && typeof result.catch === 'function') {
            result.catch(err => { if (isPanicError(err)) triggerRestart(err) })
          }
          return result
        }
      }
      if (value && typeof value === 'object') return wrap(value)
      return value
    }
  })
}

export function withPanicGuard(prisma) {
  return wrap(prisma)
}
