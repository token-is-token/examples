use rust_examples::ChatBot;

#[tokio::main]
async fn main() {
    let mut bot = match ChatBot::new("你是一个友好、专业的AI助手。") {
        Ok(bot) => bot,
        Err(e) => {
            println!("Error: {}", e);
            return;
        }
    };

    println!("=== Rust 聊天机器人演示 ===\n");

    let messages = vec![
        "你好，请介绍一下你自己",
        "你擅长什么领域？",
        "谢谢你！",
    ];

    for msg in messages {
        println!("用户: {}", msg);
        match bot.chat(msg).await {
            Ok(response) => println!("AI: {}\n", response),
            Err(e) => {
                println!("错误: {}\n", e);
                return;
            }
        }
    }

    println!("对话历史: {} 条消息", bot.get_history().len());
}
