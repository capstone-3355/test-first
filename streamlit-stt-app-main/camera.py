import cv2

for backend in [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_AVFOUNDATION]:  # Windows는 DSHOW/MSMF, macOS는 AVFOUNDATION
    for i in range(5):  # 최대 5개의 인덱스까지 탐색
        print(f"Trying camera index {i} with backend {backend}")
        cap = cv2.VideoCapture(i, backend)
        if cap.isOpened():
            print(f"✅ Success: Camera index {i} opened with backend {backend}")
            cap.release()
        else:
            print(f"❌ Failed to open index {i} with backend {backend}")