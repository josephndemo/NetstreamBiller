# NetStream backend

The backend owns all application data in PostgreSQL through SQLAlchemy. Firebase remains the identity provider: the frontend sends its Firebase ID token as a bearer token and the API verifies it before every request.

## Run locally

```sh
docker compose up -d db
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `backend/.env` to a Firebase service-account JSON file so the API can verify Firebase ID tokens. Do not commit that file.

The API is available at `http://localhost:8000`, with interactive documentation at `/docs`.
