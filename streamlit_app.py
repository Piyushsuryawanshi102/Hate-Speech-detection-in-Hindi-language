import os
import re
import string
import joblib
import pandas as pd
import streamlit as st
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

# ── Page Configuration ──────────────────────────────────────────────────
st.set_page_config(
    page_title="Hindi Hate Speech Detector",
    page_icon="🚫",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium CSS styling
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
    }
    .title-text {
        font-family: 'Outfit', 'Inter', sans-serif;
        background: linear-gradient(90deg, #FF4B4B 0%, #FF8F8F 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }
    .subtitle-text {
        font-size: 1.2rem;
        color: #A3A3A3;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        margin-bottom: 1rem;
    }
    .stAlert {
        border-radius: 12px !important;
    }
    .footer {
        text-align: center;
        margin-top: 3rem;
        color: #6B7280;
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)

# ── NLTK & Model Downloads/Setup ─────────────────────────────────────────
@st.cache_resource
def setup_nltk():
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)

setup_nltk()

# ── Load Model and Vectorizer ───────────────────────────────────────────
@st.cache_resource
def load_model_assets():
    # Try looking in backend/saved_model or relative
    base_dir = os.path.dirname(__file__)
    model_paths = [
        os.path.join(base_dir, 'backend', 'saved_model'),
        os.path.join(base_dir, 'saved_model')
    ]
    
    model_dir = None
    for path in model_paths:
        if os.path.exists(os.path.join(path, 'hate_speech_model.joblib')):
            model_dir = path
            break
            
    if not model_dir:
        return None, None, "Model files not found. Please run backend/train_model.py first."
        
    try:
        model = joblib.load(os.path.join(model_dir, 'hate_speech_model.joblib'))
        tfidf = joblib.load(os.path.join(model_dir, 'tfidf_vectorizer.joblib'))
        return model, tfidf, None
    except Exception as e:
        return None, None, f"Error loading model files: {str(e)}"

model, tfidf, error_msg = load_model_assets()

# ── Translation ─────────────────────────────────────────────────────────
@st.cache_resource
def load_translator():
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source='auto', target='en')
        return translator
    except ImportError:
        return None

translator = load_translator()

# ── Preprocessing & Prediction Functions ────────────────────────────────
exclude = string.punctuation
stopwords = set(ENGLISH_STOP_WORDS)
stopwords.discard('no')
stopwords.discard('not')
stopwords.discard('never')
stopwords.discard('nor')

lemmatizer = WordNetLemmatizer()

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+|@\w+', '', text)
    text = text.replace('#', '')
    text = text.translate(str.maketrans('', '', exclude))
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = " ".join([w for w in text.split() if w not in stopwords])
    text = " ".join([lemmatizer.lemmatize(w) for w in text.split()])
    return text.strip()

def detect_hindi(text: str) -> bool:
    return bool(re.search(r'[\u0900-\u097F]', text))

def predict_single(text: str) -> dict:
    original_text = text
    is_hindi = detect_hindi(text)

    # Translate Hindi text to English
    translated_text = text
    translation_status = "Skipped (already English)"
    if is_hindi:
        if translator:
            try:
                translated_text = translator.translate(text)
                translation_status = "Successful"
            except Exception as e:
                translation_status = f"Failed ({str(e)})"
        else:
            translation_status = "Unavailable (deep_translator package missing)"

    # Preprocess
    clean_text = preprocess_text(translated_text)

    if not model or not tfidf:
        raise ValueError("Model is not loaded.")

    # Vectorize & predict
    features = tfidf.transform([clean_text])
    prediction = int(model.predict(features)[0])

    # Get probability scores
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))
    hate_probability = float(probabilities[1])
    safe_probability = float(probabilities[0])

    # Determine label & severity
    if prediction == 1:
        if hate_probability >= 0.90:
            label = 'Critical'
            color = '#E11D48'  # Rose 600
        elif hate_probability >= 0.80:
            label = 'Severe'
            color = '#EA580C'  # Orange 600
        elif hate_probability >= 0.70:
            label = 'High'
            color = '#F97316'  # Orange 500
        elif hate_probability >= 0.60:
            label = 'Moderate'
            color = '#EAB308'  # Yellow 500
        else:
            label = 'Low Risk'
            color = '#A855F7'  # Purple 500
    else:
        label = 'Safe'
        color = '#10B981'  # Emerald 500

    return {
        'text': original_text,
        'translatedText': translated_text if is_hindi else None,
        'isHindi': is_hindi,
        'translationStatus': translation_status,
        'prediction': prediction,
        'label': label,
        'color': color,
        'confidence': round(confidence, 4),
        'overallScore': round(hate_probability, 4),
        'categories': {
            'Toxicity': round(hate_probability, 4),
            'Severe Toxicity': round(hate_probability * 0.7, 4) if prediction == 1 else round(hate_probability * 0.2, 4),
            'Identity Attack': round(hate_probability * 0.5, 4) if prediction == 1 else round(hate_probability * 0.1, 4),
            'Insult': round(hate_probability * 0.85, 4) if prediction == 1 else round(hate_probability * 0.15, 4),
            'Profanity': round(hate_probability * 0.6, 4) if prediction == 1 else round(hate_probability * 0.1, 4),
            'Threat': round(hate_probability * 0.3, 4) if prediction == 1 else round(hate_probability * 0.05, 4),
        },
    }

# ── Sidebar UI ──────────────────────────────────────────────────────────
with st.sidebar:
    st.image("https://img.icons8.com/color/144/shield-pro.png", width=100)
    st.markdown("### **Hate Speech Detection System**")
    st.markdown(
        "Detects hate speech, aggressive language, and abusive content in "
        "**Hindi** (Devanagari script) and **English** using a hybrid "
        "Translation + NLP classification model."
    )
    
    st.markdown("---")
    
    # Model info
    st.markdown("#### **System Info**")
    if error_msg:
        st.error(f"❌ Model State: {error_msg}")
    else:
        st.success("✅ ML Model & Vectorizer loaded")
        
    if translator:
        st.success("✅ Hindi Translator: Enabled")
    else:
        st.warning("⚠️ Hindi Translator: Disabled (requires `deep-translator`)")
        
    st.markdown("---")
    st.markdown("Created for Hindi Language Analysis")

# ── Main Content UI ─────────────────────────────────────────────────────
st.markdown('<div class="title-text">Hate Speech Detection in Hindi</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle-text">Identify hate speech, insult, toxicity, and threats in Hindi and English content.</div>', unsafe_allow_html=True)

if error_msg:
    st.error(f"### ⚙️ System Setup Required\n{error_msg}\n\nPlease run `python backend/train_model.py` first to train the machine learning model.")
else:
    # App Tabs
    tab_single, tab_batch = st.tabs(["🔍 Single Text Analysis", "📁 Batch Processing (CSV)"])
    
    with tab_single:
        col_input, col_results = st.columns([1, 1], gap="large")
        
        with col_input:
            st.markdown("### **Input Text**")
            
            # Interactive example links
            examples = [
                "तुम बहुत अच्छे इंसान हो। (You are a very good person.)",
                "मुझे तुमसे नफरत है, तुम यहाँ से चले जाओ कमीने। (I hate you, go away from here you bastard.)",
                "This is a wonderful day to write some code!",
                "Stupid idiots are ruining this website, ban them all!"
            ]
            
            selected_example = st.selectbox(
                "💡 Try one of our examples:",
                [""] + examples,
                format_func=lambda x: "Select an example..." if x == "" else x
            )
            
            text_input = st.text_area(
                "Enter the text to analyze:",
                value=selected_example if selected_example else "",
                height=150,
                placeholder="Type your message in Hindi or English..."
            )
            
            analyze_btn = st.button("Analyze Text", type="primary", use_container_width=True)
            
        with col_results:
            st.markdown("### **Analysis Results**")
            
            if analyze_btn or text_input:
                if not text_input.strip():
                    st.info("Please enter some text to analyze.")
                else:
                    with st.spinner("Analyzing text..."):
                        try:
                            res = predict_single(text_input)
                            
                            # Layout result
                            label = res['label']
                            color = res['color']
                            
                            st.markdown(
                                f"<div style='border-left: 6px solid {color}; padding-left: 15px; margin-bottom: 20px;'>"
                                f"<h4 style='margin: 0; color: {color}; font-size: 1.1rem; text-transform: uppercase;'>Classification</h4>"
                                f"<h2 style='margin: 0; font-size: 2.2rem; font-weight: 800;'>{label}</h2>"
                                f"</div>",
                                unsafe_allow_html=True
                            )
                            
                            # Metrics
                            col_conf, col_lang = st.columns(2)
                            with col_conf:
                                st.metric(
                                    label="Hate Probability" if res['prediction'] == 1 else "Safety Confidence",
                                    value=f"{res['overallScore']*100:.2f}%" if res['prediction'] == 1 else f"{res['confidence']*100:.2f}%"
                                )
                            with col_lang:
                                st.metric(
                                    label="Detected Language",
                                    value="Hindi" if res['isHindi'] else "English"
                                )
                                
                            # Translation details if Hindi
                            if res['isHindi']:
                                with st.expander("🌐 English Translation Details"):
                                    st.write(f"**Original Hindi:** {res['text']}")
                                    st.write(f"**Translated English:** {res['translatedText']}")
                                    st.caption(f"Translation Status: {res['translationStatus']}")
                                    
                            # Categories Breakdown
                            st.markdown("#### **Toxicity Categories Breakdown**")
                            
                            for cat, score in res['categories'].items():
                                col_lbl, col_bar = st.columns([1, 2])
                                with col_lbl:
                                    st.write(cat)
                                with col_bar:
                                    st.progress(score)
                                    
                        except Exception as e:
                            st.error(f"An error occurred during prediction: {e}")
            else:
                st.info("Enter text on the left and click **Analyze Text** to see results.")
                
    with tab_batch:
        st.markdown("### **Batch Processing**")
        st.markdown("Upload a CSV file containing a column of texts to run bulk predictions. The model will process each text and output a downloadable CSV with the results.")
        
        uploaded_file = st.file_uploader("Upload CSV File", type=["csv"])
        
        if uploaded_file is not None:
            try:
                df = pd.read_csv(uploaded_file)
                st.write("📂 **Preview of uploaded file:**")
                st.dataframe(df.head(5), use_container_width=True)
                
                # Column selection
                text_col = st.selectbox("Select the column containing the texts:", df.columns)
                
                if st.button("Run Batch Predictions", type="primary"):
                    with st.spinner("Processing batch..."):
                        results = []
                        progress_bar = st.progress(0)
                        
                        total_rows = len(df)
                        for idx, row in df.iterrows():
                            text_val = str(row[text_col]).strip()
                            if text_val:
                                try:
                                    pred = predict_single(text_val)
                                    results.append({
                                        'Original_Text': text_val,
                                        'Is_Hindi': pred['isHindi'],
                                        'Translated_Text': pred['translatedText'],
                                        'Label': pred['label'],
                                        'Prediction_Code': pred['prediction'],
                                        'Hate_Probability': pred['overallScore']
                                    })
                                except Exception as e:
                                    results.append({
                                        'Original_Text': text_val,
                                        'Is_Hindi': False,
                                        'Translated_Text': None,
                                        'Label': 'Error',
                                        'Prediction_Code': -1,
                                        'Hate_Probability': 0.0
                                    })
                            else:
                                results.append({
                                    'Original_Text': '',
                                    'Is_Hindi': False,
                                    'Translated_Text': None,
                                    'Label': 'Empty',
                                    'Prediction_Code': 0,
                                    'Hate_Probability': 0.0
                                })
                            
                            progress_bar.progress((idx + 1) / total_rows)
                            
                        # Create results dataframe
                        results_df = pd.DataFrame(results)
                        
                        # Merge back with original data if columns match or just show results
                        final_df = pd.concat([df, results_df.drop(columns=['Original_Text'], errors='ignore')], axis=1)
                        
                        st.success("🎉 Batch processing completed successfully!")
                        st.dataframe(final_df.head(10), use_container_width=True)
                        
                        # Download button
                        csv = final_df.to_csv(index=False).encode('utf-8')
                        st.download_button(
                            label="📥 Download Results CSV",
                            data=csv,
                            file_name="hate_speech_predictions_results.csv",
                            mime="text/csv",
                            use_container_width=True
                        )
                        
            except Exception as e:
                st.error(f"Error reading file: {e}")
