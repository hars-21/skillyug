'use client'

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, User, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
                                                                                                isLoading?: boolean;
                                                                                                recommendations?: any[];
};
export default function CourseRecommendationChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your course recommendation assistant. How can I help you find the perfect course today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const examplePrompts = [
    'I want to learn Python for beginners',
    'Show me affordable programming courses under ₹1500',
    'Recommend a course with certification',
    'I need a web development bootcamp',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add a temporary loading message
    const loadingMessageId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: input.trim(),
          max_results: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      
      // Remove loading message and add response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== loadingMessageId),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || 'Here are some course recommendations based on your query:',
          timestamp: new Date(),
          recommendations: data.data?.recommendations || [],
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== loadingMessageId),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Course Recommender AI</h1>
          </div>
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
            <span>Try Advanced Search</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>                                                                                                                                             

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">                                                                                             
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {messages.map((message) => (
              <AnimatePresence key={message.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 p-1 rounded-full ${
                          message.role === 'user' ? 'bg-indigo-500' : 'bg-indigo-100'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          {message.isLoading ? (
                            <div className="flex items-center space-x-1">
                              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.3s]"></span>
                              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.15s]"></span>
                              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-600"></span>
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              {message.content}
                            </div>
                          )}
                        </div>
                        
                        {!message.isLoading && Array.isArray(message.recommendations) && message.recommendations.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {message.recommendations.map((rec, idx) => (
                              <Card key={idx} className="border-indigo-100 hover:border-indigo-200 transition-colors">
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-semibold">
                                      {rec.course.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      {rec.match_type}
                                    </Badge>
                                  </div>
                                  <CardDescription className="flex items-center gap-2 text-xs">
                                    <span>₹{rec.course.price}</span>
                                    <span>•</span>
                                    <span>{rec.course.level}</span>
                                    {rec.course.certificate && (
                                      <>
                                        <span>•</span>
                                        <span className="text-green-600">Certificate</span>
                                      </>
                                    )}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {rec.reasoning}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {rec.course.features.slice(0, 3).map((feature: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Example Prompts */}
        {messages.length <= 1 && (
          <div className="max-w-3xl mx-auto w-full px-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(prompt)}
                  className="text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
          <div className="relative">
        <div className="flex items-center">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what course you're looking for..."
                className="pr-12"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Skillyug AI can make mistakes. Consider checking important information.
          </p>
          </div>
        </form>
      </div>
    </div>
  );
}