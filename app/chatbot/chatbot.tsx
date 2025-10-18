import { useEffect, useRef, useState } from "react";

export function Chatbot() {
    const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
        latitude: null,
        longitude: null,
    });
    const [messages, setMessages] = useState([
        { role: "bot", content: "How can I assist you?" },
    ]);
    const [input, setInput] = useState("");
    const [inputError, setInputError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        });
    }, []);

    // print changed geolocation
    useEffect(() => {
        if (location.latitude && location.longitude) {
            console.log(location.latitude, location.longitude);
        }
    }, [location]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendRequest(
        query: string,
        location: { latitude: number; longitude: number }
    ): Promise<Response> {
        // Extract the request body into a variable
        const requestBody = {
            query: query,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        };

        const request: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        };

        const response = await fetch("http://172.105.21.209:80/message", request);
        return response;
    }

    const handleSend = async () => {
        if (!input.trim()) return;
        if (input.length > 5000) {
            setInputError("Maximum input length is 5000 characters.");
            return;
        }

        // Check if location is available
        if (!location.latitude || !location.longitude) {
            setInputError("Location not available. Please enable location services.");
            return;
        }

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: input }]);
        const currentInput = input;
        setInput("");
        setInputError("");

        // Add loading message
        setMessages((prev) => [...prev, { role: "bot", content: "Thinking..." }]);

        try {
            const response = await sendRequest(currentInput, {
                latitude: location.latitude,
                longitude: location.longitude
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Remove loading message and add actual response
            setMessages((prev) => [
                ...prev.slice(0, -1), // Remove "Thinking..." message
                { role: "bot", content: data.answer || "No response from server" } // <-- THIS IS THE CHANGE
            ]);
        } catch (error) {
            console.error("Error:", error);
            // Remove loading message and add error message
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "bot", content: "Couldn't reach server" }
            ]);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSend();
    };

    const handleCopy = async (content: string, index: number) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(content);
            } else {
                // fallback for older browsers
                const textarea = document.createElement("textarea");
                textarea.value = content;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error("copy failed:", err);
        }
    };

    return (
        <div
            style={{
                maxWidth: 1000,
                margin: "40px auto",
                border: "1px solid #eee",
                borderRadius: 12,
                boxShadow: "0 2px 8px #eee",
                background: "#fff",
                padding: 24,
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: 24,
                    fontSize: 40,
                    fontWeight: 800,
                    letterSpacing: 2,
                    color: "#007bff",
                    background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    textShadow: "0 2px 8px #e0e7ff"
                }}
            >
                Chatbot
            </h1>

            <div
                style={{
                    height: 800,
                    overflowY: "auto",
                    background: "#f9f9f9",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                }}
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: 8,
                        }}
                    >
                        {msg.role === "bot" ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: 8,
                                    maxWidth: "70%",
                                }}
                            >
                                <div
                                    style={{
                                        background: "#e2e3e5",
                                        color: "#222",
                                        borderRadius: 16,
                                        padding: "8px 16px",
                                        fontSize: 16,
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {msg.content}
                                </div>

                                <button
                                    onClick={() => handleCopy(msg.content, idx)}
                                    style={{
                                        background: copiedIndex === idx ? "#28a745" : "#6c757d",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "6px 10px",
                                        fontSize: 14,
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                        flexShrink: 0,
                                        minWidth: 48,
                                        height: 32,
                                    }}
                                    title="Copy"
                                >
                                    {copiedIndex === idx ? "✓" : "📋"}
                                </button>
                            </div>
                        ) : (
                            <div
                                style={{
                                    background: "#d1e7dd",
                                    color: "#222",
                                    borderRadius: 16,
                                    padding: "8px 16px",
                                    maxWidth: "70%",
                                    fontSize: 16,
                                    position: "relative",
                                    wordBreak: "break-word",
                                }}
                            >
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            if (e.target.value.length > 5000) {
                                setInputError("Maximum input length is 5000 characters.");
                                return;
                            }
                            setInput(e.target.value);
                            setInputError("");
                        }}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Type your question here..."
                        style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            fontSize: 16,
                        }}
                        maxLength={5000}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            background: "#007bff",
                            color: "#fff",
                            border: "none",
                            fontSize: 16,
                        }}
                        disabled={input.length > 5000}
                    >
                        ASK
                    </button>
                </div>

                {inputError && (
                    <div style={{ color: "#d32f2f", fontSize: 14, marginTop: 4 }}>
                        {inputError}
                    </div>
                )}
            </div>
        </div>
    );
}
