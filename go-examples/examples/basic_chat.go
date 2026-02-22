package main

import (
	"context"
	"fmt"
	"os"

	"github.com/sashabaranov/go-openai"
)

type ChatBot struct {
	client  *openai.Client
	model   string
	messages []openai.ChatCompletionMessage
}

func NewChatBot(systemPrompt string) *ChatBot {
	config := openai.DefaultConfig(os.Getenv("LLM_API_KEY"))
	config.BaseURL = os.Getenv("LLM_BASE_URL")
	if config.BaseURL == "" {
		config.BaseURL = "https://api.llmshare.network/v1"
	}

	client := openai.NewClientWithConfig(config)

	model := os.Getenv("LLM_MODEL")
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	bot := &ChatBot{
		client: client,
		model:  model,
		messages: []openai.ChatCompletionMessage{},
	}

	if systemPrompt != "" {
		bot.messages = append(bot.messages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemPrompt,
		})
	}

	return bot
}

func (bot *ChatBot) Chat(message string) (string, error) {
	bot.messages = append(bot.messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: message,
	})

	resp, err := bot.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:       bot.model,
			Messages:    bot.messages,
			Temperature: 0.7,
			MaxTokens:   2048,
		},
	)
	if err != nil {
		return "", fmt.Errorf("chat request failed: %w", err)
	}

	assistantMessage := resp.Choices[0].Message.Content

	bot.messages = append(bot.messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleAssistant,
		Content: assistantMessage,
	})

	return assistantMessage, nil
}

func (bot *ChatBot) ClearHistory() {
	if len(bot.messages) > 0 && bot.messages[0].Role == openai.ChatMessageRoleSystem {
		bot.messages = bot.messages[:1]
	} else {
		bot.messages = []openai.ChatCompletionMessage{}
	}
}

func (bot *ChatBot) GetHistory() []openai.ChatCompletionMessage {
	return bot.messages
}

func main() {
	apiKey := os.Getenv("LLM_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: LLM_API_KEY environment variable is not set")
		os.Exit(1)
	}

	bot := NewChatBot("你是一个友好、专业的AI助手。")

	fmt.Println("=== Go 聊天机器人演示 ===\n")

	messages := []string{
		"你好，请介绍一下你自己",
		"你擅长什么领域？",
		"谢谢你！",
	}

	for _, msg := range messages {
		fmt.Printf("用户: %s\n", msg)
		response, err := bot.Chat(msg)
		if err != nil {
			fmt.Printf("错误: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("AI: %s\n\n", response)
	}

	fmt.Printf("对话历史: %d 条消息\n", len(bot.GetHistory()))
}
