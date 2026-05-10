# Deployment Guide

## Frontend (Expo)

### Build for iOS
```bash
cd frontend
eas build --platform ios
```

### Build for Android
```bash
cd frontend
eas build --platform android
```

### Deploy to Expo Go
```bash
expo publish
```

## Backend (GCP Cloud Run)

### Build Docker image
```bash
cd backend
docker build -t devos-backend .
```

### Deploy to Cloud Run
```bash
gcloud run deploy devos-backend \
  --image devos-backend \
  --region asia-south1 \
  --platform managed
```

### Setup Cloud Scheduler (Cron)
```bash
gcloud scheduler jobs create http nightly-agents \
  --location=asia-south1 \
  --schedule="0 22 * * *" \
  --uri="https://devos-backend.run.app/api/v1/agents/run"
```

## Environment Variables

Set in Cloud Run via `.env.yaml` or Console.
