
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          AI Interior Design Consultant
        </h1>
        <p className="text-slate-500">Reimagine your space with the power of AI</p>
      </div>
    </header>
  );
};
