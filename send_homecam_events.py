import schedule
import time
import requests
import datetime
import json

# Flask 서버 주소
FLASK_SERVER_URL = 'http://127.0.0.1:5000/generate-diary'

# 홈캠 결과 파일 읽기
def load_homecam_results(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 홈캠 결과를 events 포맷으로 변환
def generate_events_from_homecam(homecam_raw_results):
    today = datetime.datetime.now()
    today_string = f"{today.year}년 {today.month:02d}월 {today.day:02d}일"

    events = []
    for item in homecam_raw_results:
        event = {
            "time": f"{today_string} {item['hour']:02d}:00",
            "emotions": item['emotion'],
            "behaviors": item['behavior']
        }
        events.append(event)

    return events

# Flask 서버로 전송
def send_events_to_server(events):
    data = {"events": events}
    try:
        response = requests.post(FLASK_SERVER_URL, json=data)
        response.raise_for_status()
        diary = response.json()
        print("✅ 감성 일기 생성 성공!")
        print("날짜:", diary.get("day"))
        print("일기 내용:\n", diary.get("diary"))
    except Exception as e:
        print("❌ 서버 전송 실패:", e)

# 스케줄러로 매일 실행할 함수
def daily_send_homecam_events():
    print(f"[{datetime.datetime.now()}] 홈캠 결과를 서버로 전송 시작...")
    homecam_raw_results = load_homecam_results('homecam_output.json')
    events = generate_events_from_homecam(homecam_raw_results)
    send_events_to_server(events)

# 메인 루프
if __name__ == "__main__":
    # 매일 00:00에 실행 예약
    schedule.every().day.at("00:00").do(daily_send_homecam_events)

    print("⏰ 하루 1번 자동 감성 일기 생성 스케줄러 작동 시작!")

    # 무한 루프 (스케줄 대기)
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1분마다 체크
