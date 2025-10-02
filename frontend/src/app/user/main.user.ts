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
                Show password
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

  // Show password toggle
  const showPasswordLabel = document.createElement('label')
  showPasswordLabel.className = 'inline-flex items-center space-x-2 mt-2'
  showPasswordLabel.innerHTML = `
    <input type="checkbox" id="show-password" data-testid="show-password" />
    <span class="text-sm text-muted">Show password</span>
  `
  form.appendChild(showPasswordLabel)

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
