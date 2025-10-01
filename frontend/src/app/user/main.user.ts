import { login, getMe } from '../../services/api.user'

async function renderLogin(mount: HTMLElement) {
  mount.innerHTML = `
    <div class="max-w-md mx-auto">
      <div class="text-center mb-6">
        <img src="/assets/lchaty-logo.svg" alt="lChaty" class="mx-auto h-16 w-16" />
        <h2 class="mt-4 text-2xl font-semibold">Welcome to lChaty</h2>
        <p class="text-sm text-slate-500">Sign in to continue</p>
      </div>
      <form id="login" class="space-y-4">
        <input name="username" placeholder="Username" class="w-full px-4 py-2 border rounded" />
        <input name="password" type="password" placeholder="Password" class="w-full px-4 py-2 border rounded" />
        <div class="flex justify-between items-center">
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Sign in</button>
          <button type="button" id="demo-btn" class="px-3 py-2 text-sm text-slate-600">Demo</button>
        </div>
      </form>
    </div>
  `

  const form = document.getElementById('login') as HTMLFormElement
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    try {
      await login({ username: fd.get('username') as string, password: fd.get('password') as string })
      location.reload()
    } catch (err) {
      // simple error handling
      alert('Login failed')
    }
  })

  const demo = document.getElementById('demo-btn')
  demo?.addEventListener('click', () => {
    const u = (document.querySelector('input[name=username]') as HTMLInputElement)
    const p = (document.querySelector('input[name=password]') as HTMLInputElement)
    if (u && p) { u.value = 'demo'; p.value = 'demo' }
  })
}

async function boot() {
  const mount = document.getElementById('app-root') || document.getElementById('app')!
  try {
    const me = await getMe()
    if (me) {
      mount.innerHTML = `<div class="max-w-4xl mx-auto"><h2 class="text-xl font-medium">Hello ${me.displayName || me.username}</h2><p class="text-sm text-slate-500">You are signed in.</p></div>`
    } else {
      await renderLogin(mount as HTMLElement)
    }
  } catch (err) {
    // If API call fails, show login fallback
    await renderLogin(mount as HTMLElement)
  }
}

boot()
