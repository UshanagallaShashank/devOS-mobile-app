# VS Code Workspace Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/.DS_Store": true
  },
  "search.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/venv": true
  }
}
```

## Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets** — dsznajder.es7-react-js-snippets
2. **Python** — ms-python.python
3. **Pylance** — ms-python.vscode-pylance
4. **Prettier** — esbenp.prettier-vscode
5. **ESLint** — dbaeumer.vscode-eslint
6. **Expo Tools** — expo.vscode-expo-tools
7. **REST Client** — humao.rest-client

## Project Setup in VS Code

1. Open workspace folder
2. Install recommended extensions
3. Create `.vscode/settings.json` with config above
4. Frontend terminal: `npm start`
5. Backend terminal: `python main.py`
6. Open http://localhost:8000/docs for API docs
