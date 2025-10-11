#!/bin/bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npm install
echo "Environment ready. Use: source venv/bin/activate"
