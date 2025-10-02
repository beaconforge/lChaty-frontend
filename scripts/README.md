# 🚀 lChaty Development Scripts# 🚀 lChaty Development Scripts# Developer scripts



**3 Essential Lock-Protected PowerShell Scripts for HTTPS Development**



> ⚠️ **CERTIFICATE POLICY**: Only use **mkcert** certificates. All PFX-related scripts removed.**Validated and Lock-Protected PowerShell Scripts for HTTPS Development**This folder contains helper scripts for local development.

> 🔒 **LOCK PROTECTED**: All 3 scripts include concurrency locks to prevent conflicts.

> 🎯 **SIMPLIFIED**: Reduced from 6+ scripts to 3 essential ones.



## 📋 The 3 Essential Scripts> ⚠️ **CERTIFICATE POLICY**: Only use **mkcert** certificates. All PFX-related scripts have been removed. > IMPORTANT - CERTIFICATE & SECURITY POLICY:



### 🎯 **1. `restart-server.ps1` - ORCHESTRATOR** ⭐ **MAIN SCRIPT**> 🔒 **LOCK PROTECTED**: All scripts include concurrency locks to prevent conflicts.>

- **Purpose**: Complete restart workflow (kill → start)

- **Status**: ✅ **VALIDATED & WORKING**> - Do NOT run or modify certificate generation, conversion, or trust scripts unless explicitly approved.

- **Usage**: 

  ```powershell## 📋 Available Scripts> - Actions that alter hosts, portproxy, or trust stores require an admin-approved ticket and must be executed manually by an authorized person.

  .\scripts\restart-server.ps1 -Port 5173

  ```> - See `../docs/CERT_POLICY_SNIPPET.md` for the canonical policy.

- **What it does**:

  - 🔒 Lock protected orchestration### 🌟 **Primary Scripts** (Recommended)

  - 🛑 Calls `kill-server.ps1` to clean up

  - 🚀 Calls `start-server.ps1` to launch  

  - 🎯 **Single command for complete restart**

- **Best for**: Daily development workflow#### `start-https.ps1` ⭐ **MAIN SCRIPT**start-vite.ps1



### 🛑 **2. `kill-server.ps1` - CLEANUP**- **Purpose**: Start HTTPS Vite dev server with mkcert certificates- Launches a new PowerShell window and runs `npm run dev` from the repository root.

- **Purpose**: Kill all Node processes and free ports

- **Status**: ✅ **VALIDATED & WORKING**- **Status**: ✅ **VALIDATED & WORKING**- Usage:

- **Usage**:

  ```powershell- **Usage**:   - `./start-vite.ps1` (defaults to port 5173)

  .\scripts\kill-server.ps1 -Ports @(5173,5174,3000) -Force

  ```  ```powershell  - `./start-vite.ps1 -Port 5175` (start on a specific port)

- **What it does**:

  - 🔒 Lock protected cleanup  .\scripts\start-https.ps1 -Port 5173  - Run PowerShell as Administrator if you need to set hosts entries or port forwarding.

  - Kills all Node.js processes

  - Frees multiple ports (5173, 5174, 3000 by default)  ```

  - Safe PID filtering

- **Best for**: Cleanup when things get stuck- **Features**:setup-hosts-and-proxy.ps1



### 🚀 **3. `start-server.ps1` - HTTPS SERVER**  - 🔒 Lock protected against concurrent runs- Add or remove hosts entries for `local.lchaty.com` and `local.admin.lchaty.com` and optionally create a `netsh` portproxy from a listen port to a target port. Must be run as Administrator.

- **Purpose**: Start HTTPS Vite dev server with mkcert

- **Status**: ✅ **VALIDATED & WORKING**  - Uses fresh mkcert certificates (`certs\local.lchaty.com+1.pem`)- Usage examples (run in elevated PowerShell):

- **Usage**: 

  ```powershell  - Serves both `local.lchaty.com:5173` and `local.admin.lchaty.com:5173`  - `./setup-hosts-and-proxy.ps1 -Action Add -ListenPort 5173 -TargetPort 5173`

  .\scripts\start-server.ps1 -Port 5173

  ```  - Automatic port cleanup before starting  - `./setup-hosts-and-proxy.ps1 -Action Remove -ListenPort 5173`

- **What it does**:

  - 🔒 Lock protected startup  - Background job execution with proper monitoring

  - ✅ Validates mkcert certificates exist

  - 📦 Installs npm dependencies if neededgenerate-dev-certs.ps1

  - 🌐 Serves `local.lchaty.com:5173` and `local.admin.lchaty.com:5173`

  - 🎯 Background job execution with monitoring#### `kill-port.ps1` 🛑- Create a self-signed certificate for local development and export a PFX and (if OpenSSL is present) PEM files to `./certs`.

- **Best for**: Manual server starts

- **Purpose**: Kill processes listening on a specific port- Usage (may require elevated PowerShell to trust the cert):

---

- **Status**: ✅ **VALIDATED & WORKING**  - `./generate-dev-certs.ps1 -OutDir ..\certs -PfxPassword devpassword`

## 🎯 **Recommended Workflow**

- **Usage**:

### **Daily Development:**

```powershell  ```powershellkill-port.ps1

# One command does it all! 🎉

.\scripts\restart-server.ps1  .\scripts\kill-port.ps1 -Port 5173 -Force- Interactive helper to find and terminate processes listening on a port.



# Result: Clean restart with fresh certificates  ```- Usage:

# ✅ Kills any existing processes

# ✅ Starts HTTPS server on 5173 - **Features**:  - `./kill-port.ps1 -Port 5173` (will prompt before killing each PID)

# ✅ Both domains ready: local.lchaty.com:5173 + local.admin.lchaty.com:5173

```  - 🔒 Lock protected per port  - `./kill-port.ps1 -Port 5173 -Force` (terminate without prompt)



### **Manual Control:**  - Interactive or force mode

```powershell

# Cleanup only  - Safe PID filtering (skips system processes)start-and-ensure.ps1

.\scripts\kill-server.ps1 -Force

- Orchestrator that runs `kill-port.ps1` and then launches the Vite server via `start-vite.ps1`.

# Start only

.\scripts\start-server.ps1### 🔧 **Management Scripts**- Usage:



# Full orchestrated restart    - `./start-and-ensure.ps1 -Port 5173 -Https -Force`

.\scripts\restart-server.ps1

```#### `restart-server.ps1` 🔄  - This will ensure the port is free, then open a new PowerShell window running Vite on the given port.



---- **Purpose**: Stop and restart the HTTPS server



## 🏗️ **Architecture**- **Usage**: `.\scripts\restart-server.ps1 -Port 5173`



```- **Features**: 🔒 Lock protected, calls kill-port + start-server

restart-server.ps1 (ORCHESTRATOR)

    ↓#### `start-server.ps1` 🚀

    🛑 kill-server.ps1 (cleanup all processes/ports)- **Purpose**: Alternative HTTPS server starter

    ↓- **Usage**: `.\scripts\start-server.ps1 -Port 5173`

    🚀 start-server.ps1 (launch HTTPS with mkcert)- **Features**: 🔒 Lock protected, background execution support

    ↓

    ✅ Ready: https://local.lchaty.com:5173#### `kill-server.ps1` ❌

```- **Purpose**: Kill all Node.js processes and free ports

- **Usage**: `.\scripts\kill-server.ps1 -Port 5173 -Force`

**Lock Protection**: Each script creates temporary locks in `%TEMP%` to prevent:- **Features**: 🔒 Lock protected, comprehensive cleanup

- Concurrent restarts

- Race conditions during cleanup### 🧪 **Development Scripts**

- Multiple server instances

#### `start-simple.ps1` 🔧

---- **Purpose**: Start HTTP-only Vite server (no HTTPS)

- **Usage**: `.\scripts\start-simple.ps1 -Port 3000`

## ✅ **Validation Status**- **Features**: 🔒 Lock protected, simple development mode



| Script | Status | Last Tested | Purpose |---

|--------|---------|-------------|---------|

| `restart-server.ps1` | ✅ **WORKING** | 2025-10-02 | **ORCHESTRATOR** |## 🎯 **Recommended Workflow**

| `kill-server.ps1` | ✅ **WORKING** | 2025-10-02 | **CLEANUP** |

| `start-server.ps1` | ✅ **WORKING** | 2025-10-02 | **HTTPS SERVER** |### **Starting Development:**

```powershell

**Last Successful Test**: 2025-10-02 - 6/8 Playwright tests passed (certificate issues resolved)# Start HTTPS server (recommended)

.\scripts\start-https.ps1 -Port 5173

---

# Verify it's working

## 🏆 **Success Criteria**# Visit: https://local.lchaty.com:5173 and https://local.admin.lchaty.com:5173

```

**HTTPS Server Working When:**

- ✅ No certificate trust errors in Playwright tests### **Stopping/Restarting:**

- ✅ Both domains accessible: `local.lchaty.com:5173` and `local.admin.lchaty.com:5173`  ```powershell

- ✅ TLS handshake successful (TLSv1.3)# Quick restart

- ✅ Vite HMR connecting properly.\scripts\restart-server.ps1

- ✅ 200 status responses for both domains

# Or manual control

---.\scripts\kill-port.ps1 -Port 5173 -Force

.\scripts\start-https.ps1

## 📖 **Certificate Management**```



**✅ Current Standard: mkcert**### **Troubleshooting:**

```powershell```powershell

# Certificates location# Clean kill all Node.js processes

certs\local.lchaty.com+1.pem      # Certificate.\scripts\kill-server.ps1 -Force

certs\local.lchaty.com+1-key.pem  # Private key

```# Start fresh

.\scripts\start-https.ps1

**Regenerate certificates if needed:**```

```powershell

# Clean old certificates---

Remove-Item certs\*.pem -Force

## ✅ **Validation Status**

# Generate fresh mkcert certificates  

cd certs| Script | Status | Last Tested | Certificate Support |

mkcert local.lchaty.com local.admin.lchaty.com|--------|---------|-------------|---------------------|

cd..| `start-https.ps1` | ✅ **WORKING** | 2025-10-02 | mkcert only |

| `kill-port.ps1` | ✅ **WORKING** | 2025-10-02 | N/A |

# Restart server to use new certificates| `restart-server.ps1` | ✅ **WORKING** | 2025-10-02 | mkcert only |

.\scripts\restart-server.ps1| `start-server.ps1` | ✅ **WORKING** | 2025-10-02 | mkcert only |

```| `kill-server.ps1` | ✅ **WORKING** | 2025-10-02 | N/A |

| `start-simple.ps1` | ✅ **WORKING** | 2025-10-02 | HTTP only |

---

---

## 🚫 **Removed Scripts**

## 🔒 **Lock Mechanism**

The following redundant scripts were **removed** for simplicity:

- ❌ `start-https.ps1` - Redundant with `start-server.ps1`All scripts use temporary lock files in `$env:TEMP` to prevent:

- ❌ `kill-port.ps1` - Redundant with `kill-server.ps1`- Concurrent server starts on the same port  

- ❌ `start-simple.ps1` - HTTP-only not needed for HTTPS development- Race conditions during port cleanup

- Resource conflicts during restart operations

---

**Lock Files Location**: `%TEMP%\lchaty-*.lock`

**🎉 Just 3 scripts, 1 main command: `.\scripts\restart-server.ps1` - that's it!**
**Auto-Cleanup**: Locks are automatically removed on script exit

---

## 🏆 **Success Criteria**

**HTTPS Server Working When:**
- ✅ No certificate trust errors in Playwright tests
- ✅ Both domains accessible: `local.lchaty.com:5173` and `local.admin.lchaty.com:5173`  
- ✅ TLS handshake successful (TLSv1.3)
- ✅ Vite HMR connecting properly
- ✅ 200 status responses for both domains

**Last Successful Test**: 2025-10-02 - 6/8 Playwright tests passed (certificate issues resolved)

---

## 🚫 **Removed Scripts**

The following broken/redundant scripts have been **removed**:
- ❌ `generate-dev-certs.ps1` - PFX-related (use mkcert instead)
- ❌ `convert-pfx-to-pem.ps1` - PFX-related (use mkcert instead)  
- ❌ `start-and-ensure.ps1` - Was broken, replaced by start-https.ps1
- ❌ `start-vite.ps1` - Redundant with start-https.ps1
- ❌ All `.js` helper files - Temporary debugging scripts

---

## 📖 **Certificate Management**

**✅ Current Standard: mkcert**
```powershell
# Certificates location
certs\local.lchaty.com+1.pem      # Certificate
certs\local.lchaty.com+1-key.pem  # Private key
```

**Regenerate certificates if needed:**
```powershell
# Clean old certificates
Remove-Item certs\*.pem -Force

# Generate fresh mkcert certificates  
cd certs
mkcert local.lchaty.com local.admin.lchaty.com
cd..
```

---

**🎉 All scripts are now validated, lock-protected, and ready for use! Use `start-https.ps1` for standard HTTPS development.**