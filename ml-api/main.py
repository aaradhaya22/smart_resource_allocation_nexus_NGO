from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("urgency_model.pkl")
cat_encoder = joblib.load("category_encoder.pkl")
target_encoder = joblib.load("target_encoder.pkl")

@app.post("/predict")
def predict(data: dict):
    category = data.get("category")
    people = data.get("people_affected")

    try:
        category_encoded = cat_encoder.transform([category])[0]
    except:
        return {"error": "Invalid category"}

    input_data = np.array([[category_encoded, people]])

    pred_encoded = model.predict(input_data)[0]
    prediction = target_encoder.inverse_transform([pred_encoded])[0]

    return {"urgency_level": prediction}