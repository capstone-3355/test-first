import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WordPractice.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

const FreeModePractice = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const volumeBarRef = useRef(null);
    const streamRef = useRef(null);
    const animatingRef = useRef(false);

    const [customText, setCustomText] = useState('');
    const [recognizedText, setRecognizedText] = useState('');
    const [pronunciation, setPronunciation] = useState(0);
    const [mouthShape, setMouthShape] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPracticeText, setShowPracticeText] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleStart = async () => {
        if (!customText.trim()) {
            alert('문장을 입력해주세요.');
            return;
        }
        setShowPracticeText(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        beginRecording(stream);
    };

    const beginRecording = async (stream) => {
        setAnimating(true);
        animatingRef.current = true;
        setShowResult(false);
        setDisplayScore(0);
        setIsSaved(false);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        const animateVolume = () => {
            analyser.getByteTimeDomainData(dataArray);
            const sum = dataArray.reduce((acc, val) => {
                const norm = (val - 128) / 128;
                return acc + norm * norm;
            }, 0);
            const volume = Math.sqrt(sum / dataArray.length);
            const percent = Math.min(100, Math.floor(volume * 200));
            if (volumeBarRef.current) {
                volumeBarRef.current.style.width = `${percent}%`;
            }
            if (animatingRef.current) {
                requestAnimationFrame(animateVolume);
            }
        };
        animateVolume();

        const chunks = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const fullBlob = new Blob(chunks, { type: 'video/webm' });
            sendToServer(fullBlob, fullBlob);
        };

        recorder.start();
    };

    const handleStop = () => {
        setAnimating(false);
        animatingRef.current = false;
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const sendToServer = (audio, video) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('audio', audio, 'audio.wav');
        formData.append('video', video, 'video.webm');
        formData.append('target', customText);

        fetch('http://127.0.0.1:5000/evaluate', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                setRecognizedText(data.recognized);
                setPronunciation(data.pronunciation);
                setMouthShape(data.mouthShape);
                setFinalScore(data.finalScore);
                setShowResult(true);
                animateScore(data.finalScore);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('평가 실패:', err);
                alert("서버 오류가 발생했습니다.");
                setIsLoading(false);
            });
    };

    const animateScore = (score) => {
        let current = 0;
        const interval = setInterval(() => {
            setDisplayScore(prev => {
                const next = prev + 1;
                if (next >= score) {
                    clearInterval(interval);
                    return score;
                }
                return next;
            });
        }, 15);
    };

    const handleSave = () => {
        setIsSaved(true);
        alert(`"${customText}" 문장이 저장되었습니다.`);
    };

    const handleRetry = () => {
        setShowResult(false);
        setShowPracticeText(true);
        setRecognizedText('');
        setPronunciation(0);
        setMouthShape(0);
        setFinalScore(0);
        setDisplayScore(0);
        setIsSaved(false);
    };

    const handleNext = () => {
        setCustomText('');
        setShowPracticeText(false);
        setShowResult(false);
        setRecognizedText('');
        setPronunciation(0);
        setMouthShape(0);
        setFinalScore(0);
        setDisplayScore(0);
        setIsSaved(false);
    };

    return (
        <div className="practice-wrapper">
            <a href="#" className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</a>

            {!showPracticeText && (
                <input
                    type="text"
                    className="custom-text-input"
                    placeholder="말하고 싶은 문장을 입력하세요"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                />
            )}

            {showPracticeText && (
                <div style={{ position: 'relative', textAlign: 'center', marginTop: '12px' }}>
                    <p className="practice-title" style={{ color: '#3B82F6', fontWeight: '600' }}>
                        &quot;{customText}&quot;
                    </p>
                    {showResult && (
                        <button
                            onClick={handleSave}
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                fontSize: '18px',
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                                color: isSaved ? '#f59e0b' : '#d1d5db'
                            }}
                            title="즐겨찾기 저장"
                        >
                            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                    )}
                </div>
            )}

            <div className="media-area">
                <video ref={videoRef} autoPlay muted className="video" />
                {!animating && (
                    <button className="record-btn" onClick={handleStart}>⏺ 시작</button>
                )}
                {animating && <button className="stop-btn" onClick={handleStop}>⏹ 정지</button>}
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-box">
                            <p>결과를 측정중입니다...</p>
                            <div className="dot-loader"><span></span><span></span><span></span></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="volume-section">
                <p className="volume-label">권장 성량에 맞춰 발음해주세요.</p>
                <div className="volume-bar-container">
                    <div className="volume-bar" ref={volumeBarRef}></div>
                    <div className="threshold-line yellow"></div>
                    <div className="threshold-line red"></div>
                </div>
            </div>

            {showResult && (
                <div className="result-box clean-result">
                    <div className="circle-score">
                        <CircularProgressbar
                            value={displayScore}
                            text={`${displayScore}`}
                            styles={buildStyles({
                                textColor: '#111827',
                                pathColor: '#069ded',
                                trailColor: '#eee',
                                textSize: '22px'
                            })}
                        />
                    </div>
                    <div className="score-details">
                        <div className="score-item">
                            <div className="score-label">
                                <span>발음 정확도</span>
                                <span className="score-percent">{pronunciation}%</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${pronunciation}%`, backgroundColor: '#60a5fa' }}></div>
                            </div>
                        </div>
                        <div className="score-item">
                            <div className="score-label">
                                <span>입모양 점수</span>
                                <span className="score-percent">{mouthShape}%</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${mouthShape}%`, backgroundColor: '#f97316' }}></div>
                            </div>
                        </div>
                        <div className="score-item">
                            <div className="score-label">인식된 문장</div>
                            <div className="recognized-sentence">{recognizedText}</div>
                        </div>
                    </div>
                    <div className="result-buttons">
                        <button onClick={handleRetry}>다시하기</button>
                        <button onClick={handleNext}>다음으로</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreeModePractice;
