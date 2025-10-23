
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../types';

interface ChatProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <a href={product.url} target="_blank" rel="noopener noreferrer" className="block mt-2 p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
        <p className="font-semibold text-indigo-600">{product.itemName}</p>
        <p className="text-sm text-slate-600">{product.price}</p>
    </a>
);


export const Chat: React.FC<ChatProps> = ({ history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col" style={{height: '60vh'}}>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {msg.products.map((p, i) => <ProductCard key={i} product={p} />)}
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && history[history.length - 1]?.sender === 'user' && (
             <div className="flex items-end justify-start">
              <div className="px-4 py-2 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Make the rug blue' or 'Find a similar couch'"
            className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
};
