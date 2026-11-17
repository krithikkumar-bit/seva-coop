import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load local .env if present (in Vercel production, environment variables are injected directly)
from dotenv import load_dotenv  # noqa: E402
env_file = os.path.join(backend_dir, ".env")
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    load_dotenv()

from main import app  # noqa: E402
