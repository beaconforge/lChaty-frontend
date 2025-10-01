import { getHealth } from '../../services/api.admin'

async function bootAdmin() {
  const mount = document.getElementById('admin')!
  try {
    const health = await getHealth()
    mount.innerText = `Admin portal — backend status: ${health?.status || 'unknown'}`
  } catch (err) {
    mount.innerText = 'Admin portal — unable to reach backend (are you running the dev proxy?)'
  }
}

bootAdmin()
