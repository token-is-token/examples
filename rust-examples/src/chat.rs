use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: usize,
}

#[derive(Debug, Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Debug, Deserialize)]
struct ResponseMessage {
    content: String,
}

pub struct ChatBot {
    client: Client,
    model: String,
    base_url: String,
    api_key: String,
    messages: Vec<ChatMessage>,
}

impl ChatBot {
    pub fn new(system_prompt: &str) -> Result<Self, String> {
        let api_key = env::var("LLM_API_KEY").map_err(|_| "LLM_API_KEY not set")?;
        let base_url = env::var("LLM_BASE_URL").unwrap_or_else(|_| "https://api.llmshare.network/v1".to_string());
        let model = env::var("LLM_MODEL").unwrap_or_else(|_| "gpt-3.5-turbo".to_string());

        let client = Client::new();

        let mut bot = ChatBot {
            client,
            model,
            base_url,
            api_key,
            messages: Vec::new(),
        };

        if !system_prompt.is_empty() {
            bot.messages.push(ChatMessage {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            });
        }

        Ok(bot)
    }

    pub async fn chat(&mut self, message: &str) -> Result<String, String> {
        self.messages.push(ChatMessage {
            role: "user".to_string(),
            content: message.to_string(),
        });

        let request = ChatRequest {
            model: self.model.clone(),
            messages: self.messages.clone(),
            temperature: 0.7,
            max_tokens: 2048,
        };

        let url = format!("{}/chat/completions", self.base_url);

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("API request failed: {}", response.status()));
        }

        let chat_response: ChatResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let assistant_message = chat_response.choices
            .first()
            .ok_or("No response from API")?
            .message
            .content
            .clone();

        self.messages.push(ChatMessage {
            role: "assistant".to_string(),
            content: assistant_message.clone(),
        });

        Ok(assistant_message)
    }

    pub fn clear_history(&mut self) {
        if let Some(system_msg) = self.messages.first().cloned() {
            if system_msg.role == "system" {
                self.messages = vec![system_msg];
                return;
            }
        }
        self.messages.clear();
    }

    pub fn get_history(&self) -> &[ChatMessage] {
        &self.messages
    }
}
