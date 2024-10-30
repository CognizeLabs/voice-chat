# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from pydub import AudioSegment
import io

app = Flask(__name__)
CORS(app)

# Download NLTK data (if not already downloaded)
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

@app.route('/api/voice', methods=['POST'])
def voice():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    # Read the audio file into memory
    audio_bytes = file.read()

    try:
        # Convert audio to WAV format using pydub
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio.export(wav_io, format='wav')
        wav_io.seek(0)

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            return jsonify({'error': 'Could not understand audio', 'transcript': ''}), 400
        except sr.RequestError as e:
            return jsonify({'error': f'Could not request results; {e}', 'transcript': ''}), 500

        # Perform NLP processing (e.g., sentiment analysis)
        sentiment = sia.polarity_scores(text)
        if sentiment['compound'] >= 0.05:
            reply = 'That sounds positive!'
        elif sentiment['compound'] <= -0.05:
            reply = 'That sounds negative.'
        else:
            reply = 'That sounds neutral.'

        return jsonify({'transcript': text, 'reply': reply})
    except Exception as e:
        return jsonify({'error': f'Error processing audio: {str(e)}', 'transcript': ''}), 500

if __name__ == '__main__':
    app.run(debug=True)
