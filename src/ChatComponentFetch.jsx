import React, { useState, useRef, useEffect } from "react";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatOutputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const api_key = "";

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: "user", content: inputMessage };
    const userMessageWithContext = [...messages, userMessage];
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    //simulate a response if no api-key is found
    setInputMessage("");
    if (api_key === "") {
      const assistantMessage = {
        role: "assistant",
        content:
          "There is no api_key loaded. This is only to simulate a response.",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      return;
    }

    setIsLoading(true);

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        "http://localhost:1234/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model:
              "TheBloke/Mistral-7B-Instruct-v0.2-GGUF/mistral-7b-instruct-v0.2.Q6_K.gguf",
            messages: userMessageWithContext,
            stream: true,
            temperature: 0.7,
            max_tokens: -1,
          }),
          signal: abortControllerRef.current.signal, // Pass the abort signal
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantResponse = "";
      const assistantMessage = { role: "assistant", content: "" };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                assistantResponse += content;
                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1].content =
                    assistantResponse;
                  return updatedMessages;
                });
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "error", content: error.message },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      console.log("Stopping generation by aborting fetch");
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-output" ref={chatOutputRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === "user" ? "You" : "Assistant"}:</strong>{" "}
            {message.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
        <button onClick={stopGenerating} disabled={!isLoading}>
          Stop Generating
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
