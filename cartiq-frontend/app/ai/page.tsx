"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { AIMessage } from "@/types";
import { Button, Input, Loader } from "@/components/ui";
import Footer from "@/components/Footer";

export default function AIPage() {
  const { post, get, loading } = useApi();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConversation = async () => {
      try {
        const response = await get("/ai/conversation", { showToast: false });
        if (response?.messages) {
          setMessages(response.messages);
          setConversationId(response._id);
        }
      } catch (err) {
        console.error("Failed to load conversation");
      }
    };

    fetchConversation();
  }, [isAuthenticated]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await post(
        "/ai/chat",
        {
          conversationId,
          question: userMessage,
        },
        { showToast: false }
      );

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          user: "",
          question: userMessage,
          reply: response.reply,
          products: response.products || [],
          intent: response.intent,
          createdAt: new Date().toISOString(),
        },
      ]);
      setConversationId(response.conversationId);
    } catch (err) {
      console.error("Failed to send message");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Shopping Assistant
        </h1>

        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to use AI Chat
              </h2>
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Go to login
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 bg-white rounded-lg p-6 mb-6 overflow-y-auto max-h-96 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-2xl">👋</p>
                    <p className="text-gray-600">
                      Hi! Ask me anything about products
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                        {msg.question}
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs">
                        {msg.reply}
                      </div>
                    </div>

                    {/* Products */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {msg.products.map((product) => (
                          <div
                            key={product._id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-blue-600 font-bold text-sm">
                              ₹{product.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything about products..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <Button
                variant="primary"
                type="submit"
                disabled={isTyping || !input.trim()}
                loading={isTyping}
              >
                Send
              </Button>
            </form>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

  /* ---------- LOAD CHAT ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("cartiq_ai_chat")
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages([
        {
          role: "ai",
          text: "Hello! I'm **CartIQ AI**. Ask me anything about products or shopping."
        }
      ])
    }
  }, [])

  /* ---------- SAVE CHAT ---------- */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("cartiq_ai_chat", JSON.stringify(messages))
    }
  }, [messages])

  /* ---------- SCROLL ---------- */
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  /* ---------- SEND MESSAGE WITH MEMORY ---------- */
  const sendMessage = async () => {

    if (!message.trim()) return

    const currentMessage = message

    const userMessage: Message = {
      role: "user",
      text: currentMessage
    }

    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setMessage("")
    setLoading(true)

    setTimeout(scrollToBottom, 100)

    try {

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: currentMessage,
          history: updatedMessages   // 🔥 SEND MEMORY
        })
      })

      const data = await res.json()

      const aiMessage: Message = {
        role: "ai",
        text: data.reply || "No response",
        products: data.products || []
      }

      setMessages(prev => [...prev, aiMessage])

      setTimeout(scrollToBottom, 100)

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: "AI server error."
        }
      ])

    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault()
      sendMessage()
    }
  }

  const openProduct = (id: string) => {
    router.push(`/product/${id}`)
  }

  const addToCart = (product: Product) => {
    dispatch({
      type: "SET_CART",
      payload: [
        {
          productId: product._id,
          quantity: 1,
          product
        }
      ]
    })
    showToast("Added to cart", "success")
  }

  return (

    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6 text-white">
        CartIQ AI Assistant
      </h1>

      <div
        ref={chatRef}
        className="border rounded-lg p-4 h-[500px] overflow-y-auto bg-neutral-900 space-y-4"
      >

        {messages.map((msg, index) => (

          <div key={index}>

            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

              {msg.text && (
                <div className={`px-4 py-3 rounded-lg max-w-[70%] text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white"
                }`}>
                  {msg.role === "ai"
                    ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                    : msg.text
                  }
                </div>
              )}

            </div>

            {msg.products && msg.products.length > 0 && (

              <div className="grid grid-cols-2 gap-4 mt-3">

                {msg.products.map(product => (

                  <div key={product._id} className="bg-white rounded-lg p-3">

                    <img
                      src={product.image}
                      className="w-full h-32 object-cover rounded cursor-pointer"
                      onClick={() => openProduct(product._id)}
                    />

                    <p
                      className="font-semibold mt-2 cursor-pointer"
                      onClick={() => openProduct(product._id)}
                    >
                      {product.name}
                    </p>

                    <p className="text-sm text-gray-600">
                      ₹{product.price}
                    </p>

                    <div className="flex gap-2 mt-2">

                      <button
                        onClick={() => addToCart(product)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => openProduct(product._id)}
                        className="bg-black text-white px-3 py-1 rounded text-sm"
                      >
                        View
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

        {loading && (
          <p className="text-gray-400 text-sm">
            AI is thinking...
          </p>
        )}

      </div>

      <div className="flex mt-4 gap-2">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          className="flex-1 border p-3 rounded bg-black text-white"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 rounded"
        >
          Send
        </button>

      </div>

    </div>

  )

}