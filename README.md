# Argus-Defense
ETHOnline Hackathon 2025

Argus Defense is a dual-environment project that uses both **Python 3.11+** (via virtual environments) and **Node.js** (via npm).  
Follow these steps to set up and verify your local environment.

### 1. Clone the Repository
```bash
git clone https://github.com/mccabe-eth/Argus-Defense.git
cd Argus-Defense
```

### 2. Run Setup Script
macOS / Linux
```bash
chmod +x setup.sh
source setup.sh
```

Windows (PowerShell)
```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
./setup.ps1
```

These scripts will:

Create and activate a Python virtual environment (venv/)

Install all Python dependencies from requirements.txt

Install all Node.js dependencies from package.json

### 3. Verify Installation
Check Python Environment

Make sure your virtual environment is active:
```bash
which python
```

It should show a path like:
```bash
.../Argus-Defense/venv/bin/python
```

Then verify dependencies:
```bash
pip list
```

Check Node.js Environment

Verify Node.js version:
```bash
node -v
```

Confirm packages installed correctly:
```bash
yarn info --name-only
```

### 4. Run the Project

Run:
```bash
yarn chain
```

Open new terminal and run:
```bash
yarn deploy
```

Open new terminal and run:
```bash
yarn start
```

If your project includes a Python backend:
```bash
python app.py
```

Both should start without errors.

### 5. Verify Everything is Working

No errors or missing module warnings in the terminal.

Both Python and Node servers (if applicable) start correctly.

venv/ and node_modules/ exist locally but are not committed (check .gitignore).

### 6. Deactivate and Cleanup

When finished:
```bash
deactivate
```

To clean your environment completely:
```bash
rm -rf venv node_modules
```
