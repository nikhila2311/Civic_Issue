import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_MODEL_URL = os.getenv("ROBOFLOW_MODEL_URL")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class ImageRequest(BaseModel):
    image_url: str

# Health check
@app.get("/health")
def health():
    return {"status": "ok", "service": "CivicPulse AI"}


# 🔥 Classification endpoint
@app.post("/classify")
def classify(request: ImageRequest):
    try:
        print("STEP 1: Received request")
        print("Image URL:", request.image_url)

        rf_url = f"{ROBOFLOW_MODEL_URL}?api_key={ROBOFLOW_API_KEY}&image={request.image_url}"

        print("STEP 2: Sending request to Roboflow...")
        print("Roboflow URL:", rf_url)

        try:
            rf_response = requests.post(rf_url, timeout=30)
            rf_response.raise_for_status()
            data = rf_response.json()
        except Exception as e:
            print("Roboflow ERROR:", str(e))
            return {
                "category": "unknown",
                "confidence": None
            }

        print("STEP 3: Response received")
        print("Parsed JSON:", data)

        predictions = data.get("predictions", [])

        if predictions:
            top = max(predictions, key=lambda x: x.get("confidence", 0))

            raw_category = top.get("class", "other").lower().strip()
            raw_category = raw_category.split()[0]

            mapping = {
                "pothole": "pothole",
                "potholes": "pothole",
                "garbage": "garbage",
                "trash": "garbage",
                "broken": "streetlight",
                "streetlight": "streetlight",
                "water": "water_leakage",
                "leakage": "water_leakage"
            }

            category = mapping.get(raw_category, raw_category)
            confidence = float(top.get("confidence", 0.0))

            return {
                "category": category,
                "confidence": confidence
            }

        return {
            "category": "unknown",
            "confidence": None
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "category": "unavailable",
            "confidence": None
        }