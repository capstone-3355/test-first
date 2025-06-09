import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WordPractice.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowRotateLeft, faBook } from '@fortawesome/free-solid-svg-icons';

const WordPractice = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const volumeBarRef = useRef(null);
    const animatingRef = useRef(false);
    const streamRef = useRef(null);

    const wordList = JSON.parse(localStorage.getItem("wordList") || "[]");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
    const userId = userInfo?.id;

    const [wordIndex, setWordIndex] = useState(0);
    const [targetText, setTargetText] = useState('');
    const [recognizedText, setRecognizedText] = useState('');
    const [pronunciation, setPronunciation] = useState(0);
    const [mouthShape, setMouthShape] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [wrongWords, setWrongWords] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        setTargetText(wordList[wordIndex] || '');
    }, [wordIndex, wordList]);

    const handleStart = async () => {
        if (animating) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        let current = 3;
        setCountdown(current);
        const interval = setInterval(() => {
            current -= 1;
            if (current > 0) {
                setCountdown(current);
            } else {
                clearInterval(interval);
                setCountdown(null);
                beginRecording(stream);
            }
        }, 1000);
    };

    const beginRecording = async (stream) => {
        setAnimating(true);
        animatingRef.current = true;
        setHasRecorded(false);
        setShowResult(false);
        setDisplayScore(0);

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
        formData.append('target', targetText);

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

                if (data.finalScore < 85) {
                    setWrongWords(prev => [...prev, {
                        word: targetText,
                        recognized: data.recognized,
                        score: data.finalScore
                    }]);
                }
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

    const handleRetry = () => {
        setShowResult(false);
        setHasRecorded(false);
        setDisplayScore(0);
        setRecognizedText('');
    };

    const handleNextWord = () => {
        fetch('http://localhost:5050/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                word: targetText,
                recognized_text: recognizedText,
                pronunciation_score: pronunciation,
                mouth_shape_score: mouthShape,
                final_score: finalScore
            })
        }).catch(err => console.error('결과 저장 실패', err));

        if (wordIndex + 1 < wordList.length) {
            setWordIndex(prev => prev + 1);
            setHasRecorded(false);
            setShowResult(false);
            setRecognizedText('');
        } else {
            setShowResult(false);
            setIsFinished(true);
        }
    };

    const getDiffColoredText = () => {
        const dmp = new diff_match_patch();
        const diffs = dmp.diff_main(targetText, recognizedText);
        dmp.diff_cleanupSemantic(diffs);
        return diffs.map(([op, text], i) => {
            if (op === 0) return <span key={i}>{text}</span>;
            if (op === 1) return <span key={i} style={{ color: '#069ded' }}>{text}</span>;
            return null;
        });
    };

    const handleSave = (wordData) => {
        if (!userId) {
            alert("사용자 정보가 없습니다.");
            return;
        }

        const payload = {
            user_id: userId,
            content: wordData.word,
            type: wordData.word.includes(" ") ? "sentence" : "word",
            created_at: new Date().toISOString()
        };

        fetch("http://localhost:5050/api/save-word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                alert(`"${wordData.word}" 저장되었습니다.`);
            })
            .catch(err => {
                console.error("❌ 저장 오류:", err);
                alert("서버 오류 또는 요청 실패");
            });
    };

    return (
        <div className="practice-wrapper">
            <a href="#" className="back-btn" onClick={() => window.history.back()}>← 뒤로가기</a>

            {!isFinished && (
                <>
                    <h2 className="practice-title">
                        {targetText ? `"${targetText}"` : '단어를 불러오는 중...'}
                    </h2>

                    <div className="media-area">
                        <video ref={videoRef} autoPlay muted className="video" />
                        {countdown !== null && <div className="countdown-overlay"><span>{countdown}</span></div>}
                        {!animating && !hasRecorded && countdown === null && (
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
                </>
            )}

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
                            <div className="score-label"><span>인식된 문장</span></div>
                            <div className="recognized-sentence">{getDiffColoredText()}</div>
                        </div>
                    </div>

                    <div className="result-buttons">
                        <button onClick={handleRetry}>↺ 다시 녹음</button>
                        <button onClick={handleNextWord}>
                            {wordIndex === wordList.length - 1 ? '완료' : '다음 단어'}
                        </button>
                    </div>
                </div>
            )}

            {isFinished && (
                <div className="completion-fullscreen">
                    <FontAwesomeIcon icon={faCheckCircle} className="completion-icon" />
                    <h2>연습이 모두 완료되었습니다</h2>
                    <p>틀린 단어 {wrongWords.length}개</p>

                    <div className="wrong-words-list">
                        {wrongWords.map((item, i) => (
                            <div key={i} className="wrong-word-item">
                                <div className="word-info">
                                    <strong>{item.word}</strong>
                                    <span>→ 인식된 결과: {item.recognized}</span>
                                    <span>점수: {item.score}점</span>
                                </div>
                                <button className="save-word-btn" onClick={() => handleSave(item)}>저장하기</button>
                            </div>
                        ))}
                    </div>

                    <div className="completion-buttons">
                        <button onClick={() => window.location.reload()}>
                            <FontAwesomeIcon icon={faArrowRotateLeft} /> 다시하기
                        </button>
                        <button onClick={() => navigate('/review')}>
                            <FontAwesomeIcon icon={faBook} /> 복습하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordPractice;
