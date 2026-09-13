import os
import json
import urllib.request
import urllib.error
import re
import time
from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables from backend/.env file
load_dotenv()

def clean_ai_text(text: str) -> str:
    """
    Cleans raw LaTeX math delimiters ($...$, $$...$$), backslashes,
    and confusing special symbols into clear, plain human-readable text.
    """
    if not text:
        return ""
    
    # Strip LaTeX math delimiters ($...$ or $$...$$)
    text = re.sub(r"\$\$(.*?)\$\$", r"\1", text)
    text = re.sub(r"\$(.*?)\$", r"\1", text)
    
    # Replace LaTeX commands with clean plain text equivalents
    text = text.replace(r"\times", " × ")
    text = text.replace(r"\div", " ÷ ")
    text = text.replace(r"\approx", " ≈ ")
    text = text.replace(r"\le", " ≤ ")
    text = text.replace(r"\ge", " ≥ ")
    text = text.replace(r"\neq", " ≠ ")
    text = text.replace(r"\frac", "")
    text = text.replace("\\", "")
    
    # Remove remaining lone dollar signs used for math formatting
    text = re.sub(r"(?<!\w)\$|\$(?!\w)", "", text)
    
    # Clean up double spaces
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def fetch_available_gemini_models(api_key: str):
    """
    Queries Google's ListModels endpoint to dynamically get active models
    supporting generateContent for the user's API key.
    """
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = data.get("models", [])
            valid_models = []
            for m in models:
                name = m.get("name", "").replace("models/", "")
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods and "gemini" in name.lower():
                    valid_models.append(name)
            if valid_models:
                print(f"Dynamically discovered active Gemini models for key: {valid_models}")
                return valid_models
    except Exception as e:
        print(f"Could not list Gemini models dynamically: {e}")
    
    # Standard active model fallback order
    return ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"]


def generate_questions_ai(topic_id: int, topic_name: str, difficulty: str, count: int):
    """
    Generates aptitude questions strictly through Google Gemini API.
    Does NOT use any fallback data. 100% powered by Gemini AI with clean plain-text formatting.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    
    if not api_key.strip():
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is missing in backend/.env file. Please add your GEMINI_API_KEY to backend/.env to generate questions using Gemini AI."
        )

    clean_api_key = api_key.strip()
    generation_seed = int(time.time() * 1000)

    prompt = f"""
You are an expert aptitude test question creator.
Generate exactly {count} unique, high-quality multiple-choice aptitude questions strictly tailored for the topic: "{topic_name}" with difficulty level: "{difficulty}".

Requirements:
- Topic: Must be specifically and accurately about "{topic_name}".
- Difficulty Level: Must be "{difficulty}".
- Question Count: Exactly {count} questions.
- Question pattern: Similar to real company campus placement and technical aptitude exams.
- Freshness Guarantee: Ensure these questions are brand new, creative, and completely different from previous generations. (Generation Seed: {generation_seed})

Text & Symbol Formatting Rules:
- DO NOT use LaTeX math symbols, backslashes, or dollar-sign delimiters like "$", "$$", "\\frac", "\\times", or "\\text".
- Write all explanations and step-by-step solutions in clean, simple, plain human language.
- Use standard currency notation like "Rs." or "rupees" instead of dollar signs ($) unless the question is specifically about US Dollars.
- Write clear, step-by-step sentences with numbers (e.g. Step 1:, Step 2:, Step 3:, Conclusion:) so anyone can read and understand easily.

For every single question:
1. Formulate a precise, complete question statement about {topic_name}.
2. Provide 4 distinct, plausible options: option_a, option_b, option_c, option_d.
3. Specify the correct answer letter ("A", "B", "C", or "D").
4. Write a concise explanation explaining why that answer is correct.
5. Write a step-by-step solution showing the full mathematical calculation or logical reasoning.

Required Output Format:
Return ONLY a valid JSON array of objects. Do not include markdown code formatting (do not use ```json or ```).
Each object must contain these exact keys:
- "question": string
- "option_a": string
- "option_b": string
- "option_c": string
- "option_d": string
- "correct_answer": string (Must be "A", "B", "C", or "D")
- "explanation": string
- "solution": string
"""

    models_to_try = fetch_available_gemini_models(clean_api_key)
    last_error_detail = None

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={clean_api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.95,
                    "responseMimeType": "application/json"
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text_content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Strip markdown code formatting if present
                text_content = re.sub(r"^```json\s*", "", text_content.strip())
                text_content = re.sub(r"^```\s*", "", text_content.strip())
                text_content = re.sub(r"\s*```$", "", text_content.strip())
                
                questions_data = json.loads(text_content)
                
                formatted_questions = []
                for item in questions_data:
                    formatted_questions.append({
                        "topic_id": topic_id,
                        "topic_name": topic_name,
                        "question": clean_ai_text(item.get("question", "")),
                        "option_a": clean_ai_text(str(item.get("option_a", ""))),
                        "option_b": clean_ai_text(str(item.get("option_b", ""))),
                        "option_c": clean_ai_text(str(item.get("option_c", ""))),
                        "option_d": clean_ai_text(str(item.get("option_d", ""))),
                        "correct_answer": str(item.get("correct_answer", "A")).upper().strip()[:1],
                        "explanation": clean_ai_text(item.get("explanation", "")),
                        "solution": clean_ai_text(item.get("solution", "")),
                        "difficulty": difficulty.capitalize()
                    })
                return formatted_questions

        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode("utf-8")
            print(f"Gemini API HTTP Error ({model_name}): {err_body}")
            try:
                err_json = json.loads(err_body)
                msg = err_json.get("error", {}).get("message", err_body)
            except Exception:
                msg = str(http_err)
            last_error_detail = f"Gemini API Error ({http_err.code}): {msg}"

        except Exception as e:
            print(f"Gemini API Exception ({model_name}): {e}")
            last_error_detail = str(e)

    # If all models failed, raise explicit error detail
    raise HTTPException(
        status_code=400,
        detail=last_error_detail or "Failed to receive response from Gemini API. Please check your API key."
    )
