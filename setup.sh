#!/bin/bash
set -e
rm -rf venv
yarn cache clean
echo "Creating and activating Python virtual environment..."
pyenv install 3.11.14
pyenv local 3.11.14
python3 -m venv venv
source venv/bin/activate
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "Installing Node/Yarn dependencies..."
yarn install
echo "Environment ready."