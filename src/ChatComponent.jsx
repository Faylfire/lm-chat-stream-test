import React, { useState, useRef, useEffect } from "react";
import OpenAI from "openai";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef(null);
  const chatOutputRef = useRef(null);
  const api_key = "";

  const openai = new OpenAI({
    apiKey: "dummy-lmstudio-key",
    dangerouslyAllowBrowser: true,
    baseURL: "http://localhost:1234/v1",
  });

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
    if (api_key === "") {
      const assistantMessage = {
        role: "assistant",
        content:
          "There is no api_key loaded. This is only to simulate a response.",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      return;
    }
    controllerRef.current = new AbortController();
    setInputMessage("");
    setIsLoading(true);

    try {
      const stream = await openai.chat.completions.create({
        model:
          "TheBloke/Mistral-7B-Instruct-v0.2-GGUF/mistral-7b-instruct-v0.2.Q6_K.gguf",
        messages: userMessageWithContext,
        stream: true,
        temperature: 0.7,
        max_tokens: -1,
      });

      let assistantResponse = "";
      const assistantMessage = { role: "assistant", content: "" };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      for await (const chunk of stream) {
        if (controllerRef.current.signal.aborted) {
          console.log("Request aborted");
          throw new Error("Request aborted");
        }
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          assistantResponse += content;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].content =
              assistantResponse;
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.name === "AbortError" || error.message === "Request aborted") {
        console.log("Generation was aborted");
      } else {
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
    console.log("abort generation signal sent");
    console.log(controllerRef.current);
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsLoading(false);
    }
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
