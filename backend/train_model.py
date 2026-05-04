"""
Train the Hate Speech Detection model from the Hindi dataset
and save the model + vectorizer for the API server.

Run this ONCE before starting the server:
    python train_model.py
"""

import os
import re
import string
import pandas as pd
import joblib
import nltk

from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Download NLTK data
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# ── Paths ──────────────────────────────────────────────────────────────
DATASET_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'hindi_dataset', 'hindi_dataset',
    'translated_hindi_dataset.csv'
)
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_model')

# ── Helper functions (same preprocessing as notebook) ─────────────────
exclude = string.punctuation

def punctuation_remove(text):
    return text.translate(str.maketrans('', '', exclude))

stopwords = set(ENGLISH_STOP_WORDS)
stopwords.discard('no')
stopwords.discard('not')
stopwords.discard('never')
stopwords.discard('nor')

def remove_stopwords(text):
    return " ".join([word for word in text.split() if word not in stopwords])

lemmatizer = WordNetLemmatizer()

def lemmatize_text(text):
    return " ".join([lemmatizer.lemmatize(word) for word in text.split()])


def preprocess_text(text: str) -> str:
    """Full preprocessing pipeline matching the notebook exactly."""
    # Lowercase
    text = text.lower()
    # Remove URLs, mentions
    text = re.sub(r'https?://\S+|www\.\S+|@\w+', '', text)
    # Remove hashtag symbol (keep the word)
    text = text.replace('#', '')
    # Remove punctuation
    text = punctuation_remove(text)
    # Replace non-ASCII with spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Remove stopwords
    text = remove_stopwords(text)
    # Lemmatize
    text = lemmatize_text(text)
    return text.strip()


def train():
    print("📂 Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"   Dataset shape: {df.shape}")

    # Drop nulls
    df = df.dropna(subset='translated_text')
    print(f"   After dropping nulls: {df.shape}")

    # Preprocess
    print("🔧 Preprocessing text...")
    df['translated_text'] = df['translated_text'].str.lower()
    df['clean_text'] = df['translated_text'].str.replace(
        r'https?://\S+|www\.\S+|@\w+', '', regex=True
    )
    df['clean_text'] = df['clean_text'].str.replace(r'#', '', regex=True)
    df['clean_text'] = df['clean_text'].apply(punctuation_remove)
    df['clean_text'] = df['clean_text'].str.replace(r'[^a-zA-Z\s]', ' ', regex=True)
    df['clean_text'] = df['clean_text'].apply(remove_stopwords)
    df['Content_lemma'] = df['clean_text'].apply(lemmatize_text)

    # Split
    x = df['Content_lemma']
    y = df['Label_binary']
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    # Vectorize with TF-IDF
    print("📊 Vectorizing with TF-IDF (ngram_range=(1,3))...")
    tfidf = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=15000,
        min_df=3,
        max_df=0.85,
    )
    x_train_tfidf = tfidf.fit_transform(x_train)
    x_test_tfidf = tfidf.transform(x_test)

    # Train model
    print("🧠 Training Logistic Regression model...")
    model = LogisticRegression(max_iter=1000)
    model.fit(x_train_tfidf, y_train)

    # Evaluate
    y_pred = model.predict(x_test_tfidf)
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Hate (0)', 'Hate (1)']))

    # Save model + vectorizer
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, 'hate_speech_model.joblib')
    tfidf_path = os.path.join(MODEL_DIR, 'tfidf_vectorizer.joblib')

    joblib.dump(model, model_path)
    joblib.dump(tfidf, tfidf_path)

    print(f"✅ Model saved to: {model_path}")
    print(f"✅ Vectorizer saved to: {tfidf_path}")
    print("\n🎉 Training complete! You can now run the server with: python server.py")


if __name__ == '__main__':
    train()
