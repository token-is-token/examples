import os
import sys
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()


class StreamingChatBot:
    def __init__(self, system_prompt: str = ""):
        self.client = OpenAI(
            base_url=os.getenv("LLM_BASE_URL", "https://api.llmshare.network/v1"),
            api_key=os.getenv("LLM_API_KEY", ""),
        )
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        self.messages = []
        
        if system_prompt:
            self.messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        if not self.client.api_key:
            raise ValueError("API Key 未配置，请设置 LLM_API_KEY 环境变量")

    def chat_stream(self, message: str, callback=None):
        self.messages.append({
            "role": "user",
            "content": message
        })
        
        full_response = ""
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                temperature=0.7,
                max_tokens=2048,
                stream=True,
            )
            
            print("AI: ", end="", flush=True)
            
            for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                if content:
                    full_response += content
                    print(content, end="", flush=True)
                    if callback:
                        callback(content)
            
            print("\n")
            
            self.messages.append({
                "role": "assistant",
                "content": full_response
            })
            
            return full_response
        except Exception as e:
            print(f"\n流式聊天请求失败: {e}", file=sys.stderr)
            raise

    def clear_history(self):
        system_message = None
        for msg in self.messages:
            if msg["role"] == "system":
                system_message = msg
                break
        
        self.messages = [system_message] if system_message else []

    def get_history(self):
        return self.messages.copy()


def on_chunk(chunk: str):
    pass


def main():
    bot = StreamingChatBot(
        system_prompt="你是一个友好、专业的AI助手，擅长讲故事。"
    )
    
    print("=== Python 流式聊天演示 ===\n")
    
    messages = [
        "请给我讲一个关于勇气的小故事",
    ]
    
    for msg in messages:
        print(f"用户: {msg}")
        response = bot.chat_stream(msg, callback=on_chunk)
    
    print(f"\n对话历史: {len(bot.get_history())} 条消息")


if __name__ == "__main__":
    main()
