from flask import Flask, jsonify, request
from flask_cors import CORS
import os, random, json, tempfile, subprocess, wave
from difflib import SequenceMatcher
import cv2
import numpy as np
import mediapipe as mp
import vosk

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    return response

WORD_FILE = os.path.join(os.path.dirname(__file__), "word_categories.json")
SENTENCE_FILE = os.path.join(os.path.dirname(__file__), "sentence_categories.json")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models/vosk-model-small-ko-0.22")

@app.route("/words/random", methods=["GET"])
def get_random_word():
    category = request.args.get("category")
    limit = request.args.get("limit", type=int)
    try:
        with open(WORD_FILE, "r", encoding="utf-8") as f:
            word_categories = json.load(f)
        if not category or category not in word_categories:
            return jsonify({"error": "유효한 카테고리를 지정하세요."}), 400
        words = word_categories[category]
        if limit:
            words = random.sample(words, min(limit, len(words)))
        else:
            words = [random.choice(words)]
        return jsonify({"category": category, "words": words})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/sentences/random", methods=["GET"])
def get_random_sentence():
    category = request.args.get("category")
    limit = request.args.get("limit", type=int)
    try:
        with open(SENTENCE_FILE, "r", encoding="utf-8") as f:
            sentence_categories = json.load(f)
        if not category or category not in sentence_categories:
            return jsonify({"error": "유효한 카테고리를 지정하세요."}), 400
        sentences = sentence_categories[category]
        if limit:
            sentences = random.sample(sentences, min(limit, len(sentences)))
        else:
            sentences = [random.choice(sentences)]
        return jsonify({"category": category, "words": sentences})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate", methods=["POST"])
def evaluate():
    if "audio" not in request.files or "video" not in request.files or "target" not in request.form:
        return jsonify({"error": "오디오, 비디오, 문장 누락"}), 400

    audio = request.files["audio"]
    video = request.files["video"]
    target_text = request.form["target"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as webm_file:
        audio.save(webm_file.name)
        wav_path = webm_file.name.replace(".webm", ".wav")

    try:
        subprocess.run(["ffmpeg", "-i", webm_file.name, "-ar", "16000", "-ac", "1", wav_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        wf = wave.open(wav_path, "rb")
    except Exception as e:
        return jsonify({"error": f"FFmpeg 변환 오류: {str(e)}"}), 500

    model = vosk.Model(MODEL_PATH)
    rec = vosk.KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    result_text = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            result_text += result.get("text", "") + " "
    result_text += json.loads(rec.FinalResult()).get("text", "")
    recognized = result_text.strip()

    sim = SequenceMatcher(None, target_text.replace(" ", ""), recognized.replace(" ", "")).ratio()
    pronunciation_score = round(sim * 100, 2)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_vid:
        video.save(temp_vid.name)
        cap = cv2.VideoCapture(temp_vid.name)

        mp_face_mesh = mp.solutions.face_mesh
        lip_distances = []

        with mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1) as face_mesh:
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb)

                if results.multi_face_landmarks:
                    face_landmarks = results.multi_face_landmarks[0]
                    h, w, _ = frame.shape
                    upper_lip = np.array([
                        face_landmarks.landmark[13].x * w,
                        face_landmarks.landmark[13].y * h
                    ])
                    lower_lip = np.array([
                        face_landmarks.landmark[14].x * w,
                        face_landmarks.landmark[14].y * h
                    ])
                    distance = np.linalg.norm(upper_lip - lower_lip)
                    lip_distances.append(distance)

        cap.release()
        os.remove(temp_vid.name)

    if len(lip_distances) > 1:
        variation_sum = sum(abs(lip_distances[i] - lip_distances[i - 1]) for i in range(1, len(lip_distances)))
        variation_avg = variation_sum / (len(lip_distances) - 1)
        mouth_shape_score = min(100, round(variation_avg * 200, 2))
    else:
        mouth_shape_score = 0

    wf.rewind()
    duration = wf.getnframes() / wf.getframerate()
    word_count = len(recognized.split())
    speed = round(word_count / duration, 2) if duration > 0 else 0

    if speed < 1.0:
        speed_feedback = "너무 느려요"
    elif speed > 3.0:
        speed_feedback = "너무 빨라요"
    else:
        speed_feedback = "적당해요"

    wf.rewind()
    frames = wf.readframes(wf.getnframes())
    volume = round(np.mean(np.abs(np.frombuffer(frames, dtype=np.int16))) / 32768 * 100, 2)

    if volume < 20:
        volume_feedback = "너무 작아요"
    elif volume > 80:
        volume_feedback = "너무 커요"
    else:
        volume_feedback = "적당해요"

    final_score = round((pronunciation_score * 0.8 + mouth_shape_score * 0.2), 2)

    return jsonify({
        "recognized": recognized,
        "pronunciation": pronunciation_score,
        "mouthShape": mouth_shape_score,
        "finalScore": final_score,
        "speed": speed,
        "speedFeedback": speed_feedback,
        "volume": volume,
        "volumeFeedback": volume_feedback
    })

if __name__ == "__main__":
    app.run(host="localhost", port=3000, debug=True)


