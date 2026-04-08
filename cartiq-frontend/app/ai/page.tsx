"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { useRouter } from "next/navigation"
import { useApp } from "@/context/AppContext"

interface Product {
  _id: string
  name: string
  price: number
  image: string
}

interface Message {
  role: "user" | "ai"
  text: string
  products?: Product[]
}

export default function AIPage() {

  const router = useRouter()
  const { dispatch, showToast } = useApp()

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const chatRef = useRef<HTMLDivElement | null>(null)

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