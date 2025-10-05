"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Zap, ArrowRight, Paperclip, X, FileText, Video } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: Array<string> | string;
  attachments?: Array<{ name: string; type: string }>;
}

interface FileAttachment {
  name: string;
  type: string;
  base64: string;
}

export default function WarrantyChat() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: ["Warranty claims", "Product issues", "Service requests"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const isPDF = file.type === "application/pdf";
      const isVideo = file.type.startsWith("video/");

      if (!isPDF && !isVideo) {
        alert(`File "${file.name}" is not a PDF or video file. Only PDF and video files are allowed.`);
        continue;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newFiles.push({
          name: file.name,
          type: file.type,
          base64: base64,
        });
      } catch (error) {
        console.error(`Error converting ${file.name} to base64:`, error);
        alert(`Failed to process file "${file.name}"`);
      }
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue || "Attached files",
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type })),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = inputValue;
    const currentFiles = [...attachedFiles];
    
    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const requestBody = {
        message: currentInput,
        files: currentFiles.map(file => ({
          name: file.name,
          type: file.type,
          base64: file.base64,
        })),
        history: messages,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || data.response || "Sorry, I couldn't process your request.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClick = (text: string) => setInputValue(text);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <div className="h-[80px] bg-primary w-full relative shadow-md">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-b-2xl" />
        <div className="relative h-full w-full flex items-center justify-between px-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-md">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-semibold tracking-wide">Service Bot</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/20 border-white/30 text-white rounded-full px-4 py-1 text-sm shadow-sm hover:bg-white/30 transition-all"
            >
              Help
            </Button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 relative overflow-auto flex flex-col px-2 sm:px-4 py-4 pb-32">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 m-3 max-w-[75%] sm:max-w-[60%] rounded-2xl shadow-sm ${
              message.role === "user"
                ? "bg-primary text-white self-end rounded-br-sm"
                : "bg-secondary self-start rounded-bl-sm"
            }`}
          >
            {Array.isArray(message.content) ? (
              <div className="space-y-3">
                {message.content.map((item, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleClick(item)}
                    variant="outline"
                    className="w-full shadow-md justify-between text-left group hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 rounded-xl h-auto py-3 px-4 border-border/40"
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-success group-hover:translate-x-1 transition-all" />
                  </Button>
                ))}
              </div>
            ) : (
              <>
                <p className="leading-relaxed">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm opacity-90">
                        {file.type === "application/pdf" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="p-4 m-3 max-w-[75%] sm:max-w-[60%] rounded-2xl shadow-sm bg-secondary self-start rounded-bl-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t z-10">
        {attachedFiles.length > 0 && (
          <div className="px-4 py-2 border-b">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg text-sm"
                >
                  {file.type === "application/pdf" ? (
                    <FileText className="w-4 h-4 text-primary" />
                  ) : (
                    <Video className="w-4 h-4 text-primary" />
                  )}
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-3">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="shadow-md rounded-xl px-3"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your warranty issue or attach files..."
                disabled={isLoading || messages.length === 1}
                className="relative flex-1 shadow-md rounded-xl border-border/60 focus-visible:ring-2 focus-visible:ring-success/30 transition-all duration-300"
              />
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
              className="bg-primary hover:bg-primary/90 shadow-md rounded-xl group px-4"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}