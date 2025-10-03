import { login, getMe } from '../../services/api.user'

async function renderLogin(mount: HTMLElement) {
  mount.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-4" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-green-500 rounded-full mr-4"></div>
          <div class="w-16 h-16 bg-pink-500 rounded-full -ml-6"></div>
        </div>
        <h1 class="text-4xl font-bold text-white mb-4">lchaty</h1>
        <p class="text-lg text-gray-300 mb-2">Foundation. Innovation. Connection.</p>
        <h2 class="text-xl text-white mb-8">Sign in to continue</h2>
      </div>
      <div class="w-full max-w-sm">
        <form id="login" class="space-y-6" data-testid="login-form">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-white text-sm mb-2">Username</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your username"
                data-testid="username-input"
              />
            </div>
            <div>
              <label class="block text-white text-sm mb-2">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
                data-testid="password-input"
              />
            </div>
            <div class="flex items-center">
              <input 
                id="show-password" 
                name="show-password" 
                type="checkbox" 
                class="h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-800 focus:ring-blue-500"
              />
                <label for="show-password" class="ml-2 text-sm text-gray-300">
                  Show
                </label>
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            data-testid="login-submit"
          >
            Sign In
          </button>
          </form>

        <!-- Error message placeholder for E2E tests -->
        <div id="errorMessage" style="display:none;color:#f87171;margin-top:12px" aria-hidden="true"></div>

        <div class="text-center mt-8">
          <p class="text-gray-400 text-sm mb-4">Want to learn more about our beta?</p>
          <a
            href="/beta-info.html"
            class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            data-testid="beta-cta"
          >
            Explore the Beta Program
          </a>
        </div>
        </div>
      </div>
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
      // simple error handling: surface a visible error element for E2E tests
      const errEl = document.getElementById('errorMessage')
      if (errEl) {
        errEl.textContent = typeof err === 'string' ? err : (err && (err as any).message) || 'Login failed'
        errEl.style.display = 'block'
        errEl.setAttribute('aria-hidden', 'false')
      } else {
        // fallback
        alert('Login failed')
      }
    }
  })

  const demo = document.getElementById('demo-btn')
  demo?.addEventListener('click', () => {
    const u = (document.querySelector('input[name=username]') as HTMLInputElement)
    const p = (document.querySelector('input[name=password]') as HTMLInputElement)
    if (u && p) { u.value = 'demo'; p.value = 'demo' }
  })

  // Wire up the existing show-password checkbox (avoid duplicate IDs)
  const pwd = document.getElementById('password') as HTMLInputElement | null
  const showToggle = document.getElementById('show-password') as HTMLInputElement | null
  showToggle?.addEventListener('change', () => {
    if (!pwd) return
    pwd.type = showToggle.checked ? 'text' : 'password'
  })

  // Respect explicit .dark class on body or prefers-color-scheme
  function applyThemeClass() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (document.body.classList.contains('dark') || prefersDark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }
  applyThemeClass()
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyThemeClass) } catch (e) { /* ignore */ }
}

async function boot() {
  const mount = document.getElementById('app-root') || document.getElementById('app')!
  try {
    const me = await getMe()
    if (me) {
      mount.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-8" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div class="max-w-4xl w-full text-center text-white">
            <div class="mb-6 flex items-center justify-center">
              <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect width="100" height="100" rx="20" fill="#0f172a" />
                <text x="50%" y="56%" text-anchor="middle" font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto" font-weight="700" font-size="50" fill="#60a5fa">l</text>
              </svg>
            </div>
            <h1 class="text-4xl font-bold mb-2">lchaty</h1>
            <p class="text-lg text-gray-300 mb-6">Home</p>

            <div class="mt-8 bg-slate-800/60 p-6 rounded-lg inline-block text-left w-full max-w-2xl">
              <h2 class="text-2xl font-semibold text-white">Hello ${me.displayName || me.username || 'User'}</h2>
              <p class="text-sm text-slate-400 mt-2">You are signed in.</p>
            </div>

            <p class="mt-6 text-sm text-slate-400">Beta</p>
          </div>
        </div>
      `
    } else {
      await renderLogin(mount as HTMLElement)
    }
  } catch (err) {
    // If API call fails, show login fallback
    await renderLogin(mount as HTMLElement)
  }
}

boot()
