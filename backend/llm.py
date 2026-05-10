import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.gemini_api_key)

def call(prompt: str, *, system: str = "", temperature: float = 0.7) -> str:
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=system or None,
        generation_config=genai.GenerationConfig(temperature=temperature),
    )
    response = model.generate_content(prompt)
    return response.text

def chat(messages: list[dict], *, system: str = "", temperature: float = 0.7) -> str:
    """messages: [{"role": "user"|"model", "parts": "text"}, ...]"""
    history = [{"role": m["role"], "parts": [m["parts"]]} for m in messages[:-1]]
    last = messages[-1]["parts"]
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=system or None,
        generation_config=genai.GenerationConfig(temperature=temperature),
    )
    session = model.start_chat(history=history)
    response = session.send_message(last)
    return response.text
