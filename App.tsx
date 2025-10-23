
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { StyleCarousel } from './components/StyleCarousel';
import { ImageComparator } from './components/ImageComparator';
import { Chat } from './components/Chat';
import { Spinner } from './components/Spinner';
import { ChatMessage, Product, AppState } from './types';
import { INTERIOR_STYLES } from './constants';
import { generateStyledImage, refineImageWithText, getShoppableLinks, getChatResponse } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (base64Image: string) => {
    setOriginalImage(base64Image);
    setGeneratedImage(null); // Reset generated image on new upload
    setChatHistory([]); // Reset chat history
    setAppState(AppState.IMAGE_UPLOADED);
    setError(null);
  };

  const handleStyleSelect = useCallback(async (style: string) => {
    if (!originalImage) return;

    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const prompt = `Reimagine this room in a ${style} style. Keep the original room layout and structure.`;
      const newImage = await generateStyledImage(originalImage, prompt);
      setGeneratedImage(newImage);
      setChatHistory([
        {
          sender: 'bot',
          text: `Here is your room reimagined in the ${style} style! You can now use the chat to make further refinements or ask for shoppable links.`,
        },
      ]);
      setAppState(AppState.IMAGE_GENERATED);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
      setAppState(AppState.IMAGE_UPLOADED);
    }
  }, [originalImage]);

  const handleSendMessage = async (message: string) => {
    if (!generatedImage || !originalImage) return;

    const userMessage: ChatMessage = { sender: 'user', text: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setAppState(AppState.GENERATING);
    setError(null);

    try {
      // Simple intent detection
      if (message.toLowerCase().includes('find') || message.toLowerCase().includes('buy') || message.toLowerCase().includes('shop')) {
        const products = await getShoppableLinks(generatedImage, message);
        const botMessage: ChatMessage = { sender: 'bot', text: "Here are some items I found:", products };
        setChatHistory((prev) => [...prev, botMessage]);
      } else if (message.toLowerCase().startsWith('add') || message.toLowerCase().startsWith('make') || message.toLowerCase().startsWith('change') || message.toLowerCase().startsWith('remove')) {
        const newImage = await refineImageWithText(generatedImage, message);
        setGeneratedImage(newImage);
        const botMessage: ChatMessage = { sender: 'bot', text: "I've updated the image with your changes." };
        setChatHistory((prev) => [...prev, botMessage]);
      } else {
        const responseText = await getChatResponse(chatHistory, message);
        const botMessage: ChatMessage = { sender: 'bot', text: responseText };
        setChatHistory((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setAppState(AppState.IMAGE_GENERATED);
    }
  };
  
  const isGenerating = appState === AppState.GENERATING;

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        {!originalImage && <ImageUploader onImageUpload={handleImageUpload} />}
        
        {originalImage && (
          <div className="w-full max-w-5xl flex flex-col gap-8">
            <StyleCarousel styles={INTERIOR_STYLES} onStyleSelect={handleStyleSelect} disabled={isGenerating} />
            
            {error && <div className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}

            <div className="relative w-full aspect-video rounded-lg shadow-2xl bg-slate-200 flex items-center justify-center">
                {isGenerating && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-20 rounded-lg">
                        <Spinner />
                        <p className="text-white mt-4 text-lg">AI is reimagining your space...</p>
                    </div>
                )}
                {!generatedImage && !isGenerating && (
                    <div className="text-slate-500">
                        <p>Select a style above to start the magic!</p>
                    </div>
                )}
                <ImageComparator originalImage={originalImage} generatedImage={generatedImage} />
            </div>

            {generatedImage && (
              <Chat 
                history={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isGenerating} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
