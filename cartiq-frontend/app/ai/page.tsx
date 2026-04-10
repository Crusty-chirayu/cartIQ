"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface Message {
  role: "user" | "ai";
  text?: string;
  products?: Product[];
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      // fake response (replace with API later)
      const aiResponse: Message = {
        role: "ai",
        text: "Here are some suggestions:",
        products: [],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const openProduct = (id: string) => {
    window.location.href = `/product/${id}`;
  };

  const addToCart = (product: Product) => {
    console.log("Add to cart:", product);
  };

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
            <div
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.text && (
                <div
                  className={`px-4 py-3 rounded-lg max-w-[70%] text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              )}
            </div>

            {msg.products && msg.products.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                {msg.products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg p-3"
                  >
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
  );
}