import http.server
import socketserver
import os
import re

PORT = 3000
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")
ENV_FILE = os.path.join(os.path.dirname(__file__), "dashboard-generator", "app", ".env")

def load_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                env[key.strip()] = val.strip()
    return env

env = load_env(ENV_FILE)
GEMINI_KEY     = env.get("VITE_GEMINI_API_KEY", "")
SUPABASE_URL   = env.get("VITE_SUPABASE_URL", "").rstrip("/").replace("/rest/v1", "")
SUPABASE_KEY   = env.get("VITE_SUPABASE_ANON_KEY", "")

INJECT = f"""<script>
  (function(){{
    if("{GEMINI_KEY}")   localStorage.setItem('gemini_key',    "{GEMINI_KEY}");
    if("{SUPABASE_URL}") localStorage.setItem('supabase_url',  "{SUPABASE_URL}");
    if("{SUPABASE_KEY}") localStorage.setItem('supabase_key',  "{SUPABASE_KEY}");
  }})();
</script>"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        if self.path in ("/", "/app.html"):
            html_path = os.path.join(FRONTEND_DIR, "app.html")
            with open(html_path, "r", encoding="utf-8") as f:
                content = f.read()
            content = content.replace("<head>", "<head>" + INJECT, 1)
            body = content.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def log_message(self, format, *args):
        pass

print(f"Servidor rodando em http://localhost:{PORT}/app.html")
print(f"Gemini:   {'ok' if GEMINI_KEY   else 'NAO ENCONTRADA'}")
print(f"Supabase: {'ok' if SUPABASE_URL else 'NAO ENCONTRADA'}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
