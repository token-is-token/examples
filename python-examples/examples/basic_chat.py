import os
import sys
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()


class ChatBot:
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

    def chat(self, message: str) -> str:
        self.messages.append({
            "role": "user",
            "content": message
        })
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                temperature=0.7,
                max_tokens=2048,
            )
            
            assistant_message = response.choices[0].message.content or ""
            
            self.messages.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            return assistant_message
        except Exception as e:
            print(f"聊天请求失败: {e}", file=sys.stderr)
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


def main():
    bot = ChatBot(
        system_prompt="你是一个友好、专业的AI助手。"
    )
    
    print("=== Python 聊天机器人演示 ===\n")
    
    messages = [
        "你好，请介绍一下你自己",
        "你擅长什么领域？",
        "谢谢你！"
    ]
    
    for msg in messages:
        print(f"用户: {msg}")
        response = bot.chat(msg)
        print(f"AI: {response}\n")
    
    print(f"对话历史: {len(bot.get_history())} 条消息")


if __name__ == "__main__":
    main()
