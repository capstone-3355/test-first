import streamlit as st
import cv2
import numpy as np
import pyaudio
import json
import time
import difflib
import random
import struct
import plotly.graph_objs as go
import vosk
import mediapipe as mp
from pathlib import Path
import librosa

# ─────────────────────────────
# ▶ 전역 설정
# ─────────────────────────────
LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]  # 입술 외곽만 사용
UPPER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
LOWER_LIP = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]

# ─────────────────────────────
# ▶ 문장 불러오기
# ─────────────────────────────
def load_sentences_from_file(filepath="sentences.txt"):
    with open(filepath, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

# ─────────────────────────────
# ▶ 실시간 오디오 분석
# ─────────────────────────────
def get_rms(block):
    count = len(block) // 2
    format = f"{count}h"
    shorts = struct.unpack(format, block)
    shorts = np.array(shorts, dtype=np.int16)
    return np.sqrt(np.mean(shorts ** 2))

def estimate_pitch(audio_data, rate):
    try:
        audio_float = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
        pitches, magnitudes = librosa.piptrack(y=audio_float, sr=rate)
        pitch_values = pitches[magnitudes > np.median(magnitudes)]
        if len(pitch_values) > 0:
            return np.mean(pitch_values)
    except:
        pass
    return 0.0

# ─────────────────────────────
# ▶ 시각화 초기 그래프 생성
# ─────────────────────────────
def init_plot():
    layout = go.Layout(
        title="📊 실시간 음성 분석",
        xaxis=dict(title="Time"),
        yaxis=dict(title="Value"),
        height=300,
    )
    fig = go.Figure(layout=layout)
    fig.add_trace(go.Scatter(y=[], mode="lines", name="Volume (dB)", line=dict(color="blue")))
    fig.add_trace(go.Scatter(y=[], mode="lines", name="Pitch (Hz)", line=dict(color="red")))
    return fig

# ─────────────────────────────
# ▶ 메인 분석 함수
# ─────────────────────────────
def recognize_audio_video_with_prompt(model_path="vosk-model-small-ko", num_sentences=5):
    st.subheader("🎤 주어진 문장을 발음하고 입모양을 따라 하세요!")

    model = vosk.Model(model_path)
    recognizer = vosk.KaldiRecognizer(model, 16000)
    p = pyaudio.PyAudio()
    RATE = 16000
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=RATE, input=True, frames_per_buffer=4096)
    stream.start_stream()

    cap = cv2.VideoCapture(0)
    st_frame = st.empty()
    result_text = st.empty()
    audio_info = st.empty()
    graph_plot = st.empty()

    mp_face_mesh = mp.solutions.face_mesh
    all_sentences = load_sentences_from_file("sentences.txt")
    sentences = random.sample(all_sentences, num_sentences)
    scores = []

    fig = init_plot()
    db_history = []
    pitch_history = []
    x_labels = []

    with mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5) as face_mesh:
        idx = 0
        st.subheader(f"👉 발음할 문장: `{sentences[idx]}`")

        while cap.isOpened() and idx < num_sentences:
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(frame_rgb)
            h, w, _ = frame.shape
            lip_open = 0

            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    upper = [(int(face_landmarks.landmark[i].x * w), int(face_landmarks.landmark[i].y * h)) for i in UPPER_LIP]
                    lower = [(int(face_landmarks.landmark[i].x * w), int(face_landmarks.landmark[i].y * h)) for i in LOWER_LIP]

                    if upper and lower:
                        upper_mean = np.mean(upper, axis=0)
                        lower_mean = np.mean(lower, axis=0)
                        lip_open = np.linalg.norm(upper_mean - lower_mean)

                    # 깔끔한 입술 윤곽선 (외곽만)
                    outer_points = [(int(face_landmarks.landmark[i].x * w), int(face_landmarks.landmark[i].y * h)) for i in LIPS_OUTER]
                    curve = cv2.approxPolyDP(np.array(outer_points, dtype=np.int32), epsilon=1.5, closed=True)
                    cv2.polylines(frame, [curve], isClosed=True, color=(0, 255, 0), thickness=2)

                    # 👉 윗입술 윤곽 추가
                    upper_points = [(int(face_landmarks.landmark[i].x * w), int(face_landmarks.landmark[i].y * h)) for i in UPPER_LIP]
                    upper_curve = cv2.approxPolyDP(np.array(upper_points, dtype=np.int32), epsilon=1.5, closed=False)
                    cv2.polylines(frame, [upper_curve], isClosed=False, color=(255, 0, 0), thickness=2)

            st_frame.image(frame, channels="BGR")

            data = stream.read(4096, exception_on_overflow=False)
            rms = get_rms(data)
            pitch = estimate_pitch(data, RATE)
            volume_db = 20 * np.log10(rms) if rms > 0 else -100

            audio_info.markdown(f"🔊 **볼륨**: `{round(volume_db, 2)} dB` | 🎵 **음 높이**: `{round(pitch, 2)} Hz`")

            # 실시간 Plotly 그래프 갱신
            db_history.append(round(volume_db, 2))
            pitch_history.append(round(pitch, 2))
            x_labels.append(time.strftime("%H:%M:%S"))

            fig.data[0].y = db_history[-50:]
            fig.data[1].y = pitch_history[-50:]
            fig.update_layout(xaxis=dict(tickvals=list(range(len(x_labels[-50:]))), ticktext=x_labels[-50:]))
            graph_plot.plotly_chart(fig, use_container_width=True)

            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                detected_text = result["text"]

                if not detected_text.strip():
                    continue

                similarity = difflib.SequenceMatcher(None, sentences[idx].replace(" ", ""), detected_text.replace(" ", "")).ratio()
                percentage = round(similarity * 100, 2)
                mouth_score = 1.0 if lip_open >= 5 else 0.8
                final_score = percentage * mouth_score
                scores.append(final_score)

                result_text.markdown(f"""
                - 🎯 목표 문장: `{sentences[idx]}`
                - 🗣 인식된 문장: `{detected_text}`
                - 📏 발음 정확도: **{percentage}%**
                - 👄 입모양 점수: **{mouth_score * 100}%**
                - 📊 최종 평가 점수: **{round(final_score, 2)}%**
                """)

                if final_score >= 80:
                    idx += 1
                    if idx < num_sentences:
                        st.subheader(f"👉 다음 문장: `{sentences[idx]}`")
                    time.sleep(1)

            if cv2.waitKey(1) & 0xFF == 27:
                break

    cap.release()
    cv2.destroyAllWindows()
    stream.stop_stream()
    stream.close()
    p.terminate()

    avg_score = sum(scores) / len(scores) if scores else 0
    st.success(f"✅ 모든 테스트 완료! 평균 발음 정확도: **{round(avg_score, 2)}%**")

# ─────────────────────────────
# ▶ Streamlit 실행 엔트리포인트
# ─────────────────────────────
def main():
    st.title("🗣️ 실시간 발음 & 입모양 평가")
    app_mode = st.selectbox("모드를 선택하세요", ["Word Pronunciation Accuracy"])

    if app_mode == "Word Pronunciation Accuracy":
        recognize_audio_video_with_prompt()

if __name__ == "__main__":
    main()
