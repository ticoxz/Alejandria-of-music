"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { cn } from "../utils";

interface UrlInputProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
    placeholder: string;
}

export function UrlInput({ onSubmit, isLoading, placeholder }: UrlInputProps) {
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
                <div className="absolute -inset-1 bg-linear-to-r from-neon-pink via-neon-purple to-neon-pink rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200 animate-border-flow"></div>
                <div className="relative flex items-center bg-black dark:bg-black bg-white rounded-lg leading-none border border-gray-300 dark:border-gray-800">
                    <div className="pl-4">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-4 bg-transparent text-black dark:text-white placeholder-gray-500 focus:outline-none text-lg"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url.trim()}
                        className={cn(
                            "absolute right-2 top-2 bottom-2 px-6 rounded-md font-bold transition-all duration-200",
                            isLoading || !url.trim()
                                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-neon-pink text-white hover:bg-fuchsia-600 hover:scale-105 shadow-[0_0_15px_rgba(255,16,240,0.5)]"
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
