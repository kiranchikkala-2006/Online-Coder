# CodeForge — Full-Stack Online Compiler & Code Sandbox

CodeForge is a modern, fast, and secure full-stack online compiler platform. It enables students, engineers, and competitive programmers to write, compile, and execute code across 10+ programming languages directly from the browser with no databases, no API keys, and no third-party paid compiler services.

---

## 🌟 Key Highlights

- **❌ Zero Databases**: No MongoDB, PostgreSQL, Firebase, or Supabase. All program persistence is maintained locally in the browser via **IndexedDB** & **localStorage**.
- **❌ Zero Paid/Third-Party Compiler APIs**: No Judge0, Paiza, JDoodle, or Sphere Engine dependencies.
- **❌ Zero API Keys**: 100% free and self-contained.
- **✅ Docker Sandbox Isolation**: Every execution runs inside hardened, resource-capped, non-root, network-disabled containers.
- **✅ Monaco Editor Core**: Syntax highlighting, code completion, bracket matching, code folding, minimap, search & replace, and custom themes.
- **✅ 10 Supported Languages**: Python, C, C++, Java, JavaScript, TypeScript, Go, Rust, Kotlin, and PHP.
- **✅ Bidirectional File I/O**: Upload local code files with automatic language detection and download source files with correct file extensions.

---

## 🏗️ Architecture Overview

```text
User Browser
  ↓
Monaco Code Editor
  ↓
POST /api/run
  ↓
Node.js + Express Backend
  ↓
Docker Sandbox (or Secure Fallback Subprocess)
  ↓
Compiler / Interpreter inside Container
  ↓
Captured stdout / stderr & Timing
  ↓
Frontend Output Terminal & Stats Bar
```

---

## 🔒 Security Architecture & Sandbox Limits

Every user execution is strictly locked down:
- **Network Disabled**: `--network none` blocks all outgoing and incoming connections (prevents port scanning, data exfiltration, and SSRF).
- **Memory Ceiling**: Max 128 MB (`--memory 128m --memory-swap 128m`) with Memory Limit Exceeded (MLE) trapping.
- **CPU & Timeout Cap**: 1.0 CPU limit (`--cpus 1.0`) with a strict 5.0s execution timeout kill-switch to defeat infinite loops.
- **Process / Fork Bomb Prevention**: `--pids-limit 64` prevents fork bombs from overwhelming host thread pools.
- **Filesystem Hardening**: Read-only root container filesystem (`--read-only`) with a transient tmpfs for compilation artifacts (`--tmpfs /tmp:rw,size=32m`).
- **Non-Root Execution**: Runs as unprivileged user ID 1000 (`sandboxuser`).
- **Capability Dropping**: Drops all Linux capabilities (`--cap-drop ALL`, `--security-opt no-new-privileges`).

---

## 💻 Supported Languages & Runtimes

| Language | Extension | Default Filename | Compilation Step | Execution Command |
| :--- | :--- | :--- | :--- | :--- |
| **Python 3.11** | `.py` | `main.py` | Interpreted | `python3 main.py` |
| **C (GCC)** | `.c` | `main.c` | `gcc -O2 main.c -o program` | `./program` |
| **C++ 17 (G++)** | `.cpp` | `main.cpp` | `g++ -O2 -std=c++17 main.cpp -o program` | `./program` |
| **Java 17 (OpenJDK)** | `.java` | `Main.java` | `javac Main.java` | `java Main` |
| **JavaScript (Node.js 20)**| `.js` | `main.js` | Interpreted | `node main.js` |
| **TypeScript 5.x** | `.ts` | `main.ts` | JIT Transpiled (`tsx`) | `npx tsx main.ts` |
| **Go 1.22** | `.go` | `main.go` | JIT (`go run`) | `go run main.go` |
| **Rust 1.77** | `.rs` | `main.rs` | `rustc -O main.rs -o program` | `./program` |
| **Kotlin 1.9** | `.kt` | `Main.kt` | `kotlinc Main.kt -include-runtime -d Main.jar` | `java -jar Main.jar` |
| **PHP 8.3** | `.php` | `index.php` | Interpreted | `php index.php` |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [Docker](https://www.docker.com/) & Docker Compose (Optional for container sandboxes; in-process sandbox will activate automatically if Docker is absent)

### Option 1: Run with Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/codeforge.git
cd codeforge

# 2. Build and launch with Docker Compose
docker compose up --build
```
Navigate to `http://localhost:3000` in your web browser.

### Option 2: Run with Local Node.js

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🛠️ API Endpoints

### 1. `POST /api/run`
Executes submitted source code inside an isolated sandbox with optional standard input.

**Request Payload:**
```json
{
  "language": "python",
  "code": "name = input()\nprint(f'Hello, {name}!')",
  "input": "CodeForge"
}
```

**Response:**
```json
{
  "status": "success",
  "output": "Hello, CodeForge!\n",
  "error": "",
  "executionTime": 0.082,
  "memoryUsageMB": 11.4,
  "sandbox": "docker",
  "exitCode": 0
}
```

### 2. `GET /api/languages`
Returns list of all configured languages, version metadata, file extensions, and starter code.

### 3. `GET /api/health`
Returns runtime health status, execution limit configs, and Docker daemon connectivity.

---

## ⌨️ Editor Keyboard Shortcuts

- `Ctrl + Enter` (or `Cmd + Enter`): Run current code
- `Ctrl + S` (or `Cmd + S`): Save snippet to browser IndexedDB
- `Ctrl + /` (or `Cmd + /`): Toggle line comment
- `F11` / Fullscreen Button: Toggle distraction-free IDE mode

---

## 📄 License
MIT License. Free for personal, educational, and commercial use.
