"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { cn } from "../utils";

interface UrlInputProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative flex items-center bg-black rounded-lg leading-none">
                    <div className="pl-4">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Pega tu enlace de Spotify aquí..."
                        className="w-full p-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url.trim()}
                        className={cn(
                            "absolute right-2 top-2 bottom-2 px-6 rounded-md font-bold transition-all duration-200",
                            isLoading || !url.trim()
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-black hover:bg-green-400 hover:scale-105"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            "Buscar"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
