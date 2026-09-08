from fastapi import FastAPI
from backend.app import predictions

app = FastAPI()
app.include_router(predictions.router)