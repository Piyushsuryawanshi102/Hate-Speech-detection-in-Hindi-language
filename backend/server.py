"""
Flask API Server for Hate Speech Detection.

Endpoints:
    POST /predict          — Predict hate speech for given text
    POST /predict-batch    — Predict hate speech for multiple texts
    GET  /health           — Health check

Run:
    python server.py

The server will start on http://localhost:5000
For Expo on the same machine, use http://10.0.2.2:5000 (Android emulator)
or http://localhost:5000 (web).
"""

import os
import re
import string
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

# Download NLTK data
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# ── Flask App ──────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the Expo app

# ── Load Model ─────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_model')
model = joblib.load(os.path.join(MODEL_DIR, 'hate_speech_model.joblib'))
tfidf = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.joblib'))

print("✅ Model and vectorizer loaded successfully!")

# ── Preprocessing (same as training) ──────────────────────────────────
exclude = string.punctuation
stopwords = set(ENGLISH_STOP_WORDS)
stopwords.discard('no')
stopwords.discard('not')
stopwords.discard('never')
stopwords.discard('nor')

lemmatizer = WordNetLemmatizer()

# Optional: Google Translator for Hindi → English
try:
    from deep_translator import GoogleTranslator
    translator = GoogleTranslator(source='auto', target='en')
    TRANSLATOR_AVAILABLE = True
    print("✅ Google Translator loaded for Hindi→English translation")
except ImportError:
    TRANSLATOR_AVAILABLE = False
    print("⚠️  deep_translator not found. Hindi auto-translation disabled.")


def preprocess_text(text: str) -> str:
    """Full preprocessing pipeline matching the training notebook."""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+|@\w+', '', text)
    text = text.replace('#', '')
    text = text.translate(str.maketrans('', '', exclude))
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = " ".join([w for w in text.split() if w not in stopwords])
    text = " ".join([lemmatizer.lemmatize(w) for w in text.split()])
    return text.strip()


def detect_hindi(text: str) -> bool:
    """Check if text contains Devanagari characters (Hindi)."""
    return bool(re.search(r'[\u0900-\u097F]', text))


def predict_single(text: str) -> dict:
    """Run full prediction pipeline on a single text."""
    original_text = text
    is_hindi = detect_hindi(text)

    # Translate Hindi text to English
    translated_text = text
    if is_hindi and TRANSLATOR_AVAILABLE:
        try:
            translated_text = translator.translate(text)
        except Exception as e:
            print(f"Translation error: {e}")
            translated_text = text

    # Preprocess
    clean_text = preprocess_text(translated_text)

    # Vectorize & predict
    features = tfidf.transform([clean_text])
    prediction = int(model.predict(features)[0])

    # Get probability scores
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))
    hate_probability = float(probabilities[1])  # probability of class 1 (hate)
    safe_probability = float(probabilities[0])  # probability of class 0 (not hate)

    # Determine label & severity
    if prediction == 1:
        if hate_probability >= 0.90:
            label = 'Critical'
        elif hate_probability >= 0.80:
            label = 'Severe'
        elif hate_probability >= 0.70:
            label = 'High'
        elif hate_probability >= 0.60:
            label = 'Moderate'
        else:
            label = 'Low Risk'
    else:
        label = 'Safe'

    return {
        'text': original_text,
        'translatedText': translated_text if is_hindi else None,
        'isHindi': is_hindi,
        'prediction': prediction,
        'label': label,
        'confidence': round(confidence, 4),
        'overallScore': round(hate_probability, 4),
        'categories': {
            'toxicity': round(hate_probability, 4),
            'severeToxicity': round(hate_probability * 0.7, 4) if prediction == 1 else round(hate_probability * 0.2, 4),
            'identityAttack': round(hate_probability * 0.5, 4) if prediction == 1 else round(hate_probability * 0.1, 4),
            'insult': round(hate_probability * 0.85, 4) if prediction == 1 else round(hate_probability * 0.15, 4),
            'profanity': round(hate_probability * 0.6, 4) if prediction == 1 else round(hate_probability * 0.1, 4),
            'threat': round(hate_probability * 0.3, 4) if prediction == 1 else round(hate_probability * 0.05, 4),
        },
    }


# ── Routes ─────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'Hindi Hate Speech Logistic Regression',
        'translator': TRANSLATOR_AVAILABLE,
    })


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text" field in request body'}), 400

    text = data['text'].strip()
    if not text:
        return jsonify({'error': 'Text cannot be empty'}), 400

    try:
        result = predict_single(text)
        result['timestamp'] = __import__('datetime').datetime.utcnow().isoformat() + 'Z'
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    data = request.get_json()
    if not data or 'texts' not in data:
        return jsonify({'error': 'Missing "texts" field in request body'}), 400

    texts = data['texts']
    if not isinstance(texts, list) or len(texts) == 0:
        return jsonify({'error': '"texts" must be a non-empty array'}), 400

    results = []
    for text in texts[:20]:  # Limit to 20 texts per batch
        try:
            results.append(predict_single(str(text).strip()))
        except Exception as e:
            results.append({'text': text, 'error': str(e)})

    return jsonify({'results': results})


# ── Main ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n🚀 Starting Hate Speech Detection API Server...")
    print("   Endpoints:")
    print("   POST http://localhost:5000/predict")
    print("   POST http://localhost:5000/predict-batch")
    print("   GET  http://localhost:5000/health")
    print()
    app.run(host='0.0.0.0', port=5000, debug=True)
