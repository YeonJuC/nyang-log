# src/api_server.py
from flask import Flask, request, jsonify
import os
import openai
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_community.chat_models import ChatOpenAI
from langchain.callbacks import get_openai_callback
from flask_cors import CORS
from dotenv import load_dotenv

# 환경변수 로딩
load_dotenv()

# API 키 설정
my_api_key = os.getenv('OPENAI_API_KEY')  # ✅ 환경변수에서 가져오기
os.environ['OPENAI_API_KEY'] = my_api_key
api_key = my_api_key

# LLM 객체 생성
llm = ChatOpenAI(
    temperature=0.7,
    max_tokens=1024,
    model='gpt-4o-mini',
    openai_api_key=api_key
)

# Flask 앱 생성
app = Flask(__name__)
CORS(app)

# 프롬프트 템플릿
prompt_template = """
You are a cat behavior expert and a skilled writer.
Based on the provided cat's emotions and behaviors at different times of the day, write a diary entry from the perspective of the cat for the entire day.
Incorporate knowledge about cat behavior and emotions to make the diary vivid, informative, and cohesive, connecting the different moments naturally.
Start the diary with the date (use the date from the first time entry)
and summarize the day's emotional journey. But don't be too emotional and dramatic all the time.
----------------
Daily events:
{events}
----------------
Write the diary in Korean, ensuring a natural and engaging tone.
"""

prompt = PromptTemplate(
    template=prompt_template,
    input_variables=['events']
)

@app.route('/generate-diary', methods=['POST'])
def generate_diary():
    try:
        user_input = request.json
        events = user_input.get("events", [])
        if not events:
            return jsonify({"error": "No events provided."}), 400

        events_text = "\n".join([
            f"Time: {event['time']}\nEmotions: {event['emotions']}\nBehaviors: {event['behaviors']}"
            for event in events
        ])

        first_event_time = events[0]['time']
        day = ' '.join(first_event_time.split(' ')[0:3])

        llm_chain = LLMChain(prompt=prompt, llm=llm)
        # ✅ 이 부분을 invoke 방식으로 고치자!
        result = llm_chain.invoke({"events": events_text})

        diary_entry = {
            "day": day,
            "diary": result['text'].strip()
        }
        return jsonify(diary_entry)

    except Exception as e:
        import traceback
        traceback.print_exc()  # ✅ 터미널에 진짜 에러를 찍어줘
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
