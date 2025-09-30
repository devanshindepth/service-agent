"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, MessageSquare, Clock, ArrowRight, Sparkles, Zap } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: Array<string> | string;
}

export function WarrantyChat() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: ["Warranty claims", "Product issues", "Service requests"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue, history: messages }),
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

  const handleClick = (text: string) => setInputValue(text);

  return (
    // <div className="h-screen w-full">
    //   <div className="fixed bg-primary top-0 left-0 w-full h-16 flex items-center z-10 shadow-md">
    //     <Badge variant="secondary" className=" px-3 py-3 flex items-center gap-2 shadow-md border border-border/50 ml-3">
    //       <Zap className="w-4 h-4 text-success" />
    //       <span className="text-xl font-medium">AI Assistant</span>
    //     </Badge>
    //   </div>
    // <Card className="h-full flex flex-col shadow-xl border border-border/60 overflow-hidden mt-6">
    
    //   {/* CHAT BODY */}
    //   <CardContent className="flex-1 flex flex-col p-0 bg-background overflow-hidden">
    //     {/* Scrollable messages */}
    //     <ScrollArea ref={scrollRef} className="flex-1 px-6 overflow-auto py-5">
    //       <div className="space-y-6">
    //         {messages.map((message, idx) => (
    //           <div
    //             key={idx}
    //             className={`flex w-full gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    //           >
    //             {message.role === "assistant" && (
    //               <div className="relative flex-shrink-0">
    //                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
    //                 <Avatar className="w-9 h-9 bg-primary/10 border-2 border-primary/20 relative">
    //                   <AvatarFallback className="bg-transparent">
    //                     <Bot className="w-4 h-4 text-primary" />
    //                   </AvatarFallback>
    //                 </Avatar>
    //               </div>
    //             )}

    //             <div className={`flex flex-col gap-2 ${message.role === "user" ? "items-end max-w-[75%]" : "items-start max-w-[80%]"}`}>
    //               {Array.isArray(message.content) ? (
    //                 <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 shadow-md">
    //                   <div className="flex items-center gap-2 mb-3">
    //                     <Sparkles className="w-4 h-4 text-success" />
    //                     <p className="text-sm font-semibold">Quick Actions</p>
    //                   </div>
    //                   <div className="space-y-2">
    //                     {message.content.map((item, idx) => (
    //                       <Button
    //                         key={idx}
    //                         onClick={() => handleClick(item)}
    //                         variant="outline"
    //                         className="w-full justify-between text-left group hover:bg-success/5 hover:border-success/30 transition-all duration-300 rounded-xl h-auto py-3 px-4 border-border/40"
    //                       >
    //                         <span className="text-sm font-medium">{item}</span>
    //                         <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-success group-hover:translate-x-1 transition-all" />
    //                       </Button>
    //                     ))}
    //                   </div>
    //                 </div>
    //               ) : (
    //                 <div
    //                   className={`rounded-2xl px-4 py-3 text-sm shadow-md ${
    //                     message.role === "user"
    //                       ? "bg-primary text-primary-foreground rounded-br-none"
    //                       : "bg-muted text-muted-foreground rounded-bl-none border border-border/50"
    //                   }`}
    //                 >
    //                   <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
    //                 </div>
    //               )}
    //             </div>

    //             {message.role === "user" && (
    //               <div className="relative flex-shrink-0">
    //                 <div className="absolute inset-0 bg-success/20 rounded-full blur-md" />
    //                 <Avatar className="w-9 h-9 bg-success/10 border-2 border-success/20 relative">
    //                   <AvatarFallback className="bg-transparent">
    //                     <User className="w-4 h-4 text-success" />
    //                   </AvatarFallback>
    //                 </Avatar>
    //               </div>
    //             )}
    //           </div>
    //         ))}

    //         {isLoading && (
    //           <div className="flex gap-3 items-start">
    //             <div className="relative flex-shrink-0">
    //               <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
    //               <Avatar className="w-9 h-9 bg-primary/10 border-2 border-primary/20 relative">
    //                 <AvatarFallback className="bg-transparent">
    //                   <Bot className="w-4 h-4 text-primary" />
    //                 </AvatarFallback>
    //               </Avatar>
    //             </div>
    //             <div className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-bl-none px-4 py-3 shadow-md border border-border/50 flex items-center gap-2">
    //               <div className="flex gap-1">
    //                 <div className="w-2 h-2 bg-success rounded-full animate-bounce" />
    //                 <div className="w-2 h-2 bg-success rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
    //                 <div className="w-2 h-2 bg-success rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
    //               </div>
    //               <span className="text-xs text-muted-foreground">AI is typing...</span>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     </ScrollArea>

    //     {/* INPUT AREA - pinned to bottom */}
    //     <div className="border-t bg-background/60 backdrop-blur-sm px-4 py-3 flex-shrink-0 fixed bottom-0 left-0 w-full z-10">
    //       <form onSubmit={handleSubmit} className="flex gap-2">
    //         <div className="flex-1 relative group">
    //           <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    //           <Input
    //             value={inputValue}
    //             onChange={(e) => setInputValue(e.target.value)}
    //             placeholder="Describe your warranty issue or ask a question..."
    //             disabled={isLoading || messages.length === 1}
    //             className="relative flex-1 shadow-sm rounded-xl border-border/60 focus-visible:ring-2 focus-visible:ring-success/30 transition-all duration-300"
    //           />
    //         </div>
    //         <Button type="submit" disabled={!inputValue.trim() || isLoading} className="bg-primary hover:bg-primary/90 shadow-sm rounded-xl group">
    //           <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    //         </Button>
    //       </form>
    //     </div>
    //   </CardContent>
    // </Card>
    // </div>
    <div className="h-screen w-full flex flex-col bg-background">
  {/* Header */}
  <div className="h-[80px] bg-primary w-full relative shadow-md">
    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-b-2xl" />
    <div className="relative h-full w-full flex items-center justify-between px-6 text-white">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-md">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-semibold tracking-wide">Service Bot</span>
      </div>

      {/* Right-side action (optional button/icon for aesthetics) */}
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

  {/* Chat Section */}
  <div className="flex-1 relative overflow-auto flex flex-col px-2 sm:px-4 py-4">
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
          <p className="leading-relaxed">{message.content}</p>
        )}
      </div>
    ))}
  </div>

  {/* Input Section */}
  <div className="h-[70px] w-full">
    <div className="border-t bg-background/60 backdrop-blur-md px-4 py-3 flex-shrink-0 fixed bottom-0 left-0 w-full z-10">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your warranty issue or ask a question..."
            disabled={isLoading || messages.length === 1}
            className="relative flex-1 shadow-md rounded-xl border-border/60 focus-visible:ring-2 focus-visible:ring-success/30 transition-all duration-300"
          />
        </div>
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-primary hover:bg-primary/90 shadow-md rounded-xl group px-4"
        >
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </form>
    </div>
  </div>
</div>

  );
}
