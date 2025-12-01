"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Key, CheckCircle2, FolderOpen } from "lucide-react";
import Link from "next/link";
import DirectoryPicker from "../components/DirectoryPicker";

const translations = {
    es: {
        title: "Configuración",
        apiConfig: "Configuración de API",
        apiDescription: "Ingresa tus credenciales de Spotify Developer.",
        clientId: "Client ID",
        clientSecret: "Client Secret",
        downloadPath: "Ruta de Descarga",
        audioQuality: "Calidad de Audio",
        saveButton: "Guardar Configuración",
        saving: "Guardando...",
        successMessage: "Configuración guardada correctamente",
        errorMessage: "Error al guardar",
        connectionError: "Error de conexión",
        browseButton: "Explorar"
    },
    en: {
        title: "Settings",
        apiConfig: "API Configuration",
        apiDescription: "Enter your Spotify Developer credentials.",
        clientId: "Client ID",
        clientSecret: "Client Secret",
        downloadPath: "Download Path",
        audioQuality: "Audio Quality",
        saveButton: "Save Settings",
        saving: "Saving...",
        successMessage: "Settings saved successfully",
        errorMessage: "Error saving",
        connectionError: "Connection error",
        browseButton: "Browse"
    }
};

export default function Settings() {
    const [lang, setLang] = useState<"es" | "en">("es");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [downloadPath, setDownloadPath] = useState("");
    const [quality, setQuality] = useState("320K");
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        // Load language from localStorage
        const savedLang = localStorage.getItem("app_lang") as "es" | "en";
        if (savedLang) setLang(savedLang);

        // Cargar configuración actual al montar
        fetch("http://localhost:8001/api/settings")
            .then((res) => res.json())
            .then((data) => {
                if (data.client_id) setClientId(data.client_id);
                if (data.client_secret) setClientSecret(data.client_secret);
                if (data.download_path) setDownloadPath(data.download_path);
            })
            .catch(() => { });

        // Cargar calidad guardada desde localStorage
        const savedQuality = localStorage.getItem("audio_quality");
        if (savedQuality) {
            setQuality(savedQuality);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            // Guardar calidad en localStorage
            localStorage.setItem("audio_quality", quality);

            const response = await fetch("http://localhost:8001/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    download_path: downloadPath
                }),
            });

            if (response.ok) {
                setStatus(t.successMessage);
                setTimeout(() => setStatus(null), 3000);
            } else {
                setStatus(t.errorMessage);
            }
        } catch (error) {
            setStatus(t.connectionError);
        } finally {
            setIsLoading(false);
        }
    };

    const t = translations[lang];

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Key className="w-8 h-8 text-green-500" />
                        {t.title}
                    </h1>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Key className="w-5 h-5 text-green-500" />
                            {t.apiConfig}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {t.apiDescription}
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t.clientId}
                            </label>
                            <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                placeholder="Pegar Client ID aquí"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t.clientSecret}
                            </label>
                            <input
                                type="password"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                placeholder="Pegar Client Secret aquí"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t.downloadPath}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={downloadPath}
                                    onChange={(e) => setDownloadPath(e.target.value)}
                                    className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Ej: /Users/tuusuario/Desktop/Musica"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPickerOpen(true)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <FolderOpen className="w-5 h-5" />
                                    {t.browseButton}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Deja vacío para usar la carpeta por defecto (Música).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t.audioQuality}
                            </label>
                            <select
                                value={quality}
                                onChange={(e) => setQuality(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
                            >
                                <option value="128K">128 kbps - Calidad Estándar</option>
                                <option value="192K">192 kbps - Calidad Alta</option>
                                <option value="256K">256 kbps - Calidad Muy Alta</option>
                                <option value="320K">320 kbps - Calidad Máxima (Recomendado)</option>
                                <option value="FLAC">FLAC - Calidad Sin Pérdida (Hi-Res)</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                                Esta configuración se aplicará a todas las descargas futuras.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-400">
                            <p>
                                ¿No tienes credenciales? Ve al{" "}
                                <a
                                    href="https://developer.spotify.com/dashboard/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:underline"
                                >
                                    Spotify Developer Dashboard
                                </a>
                                , crea una app y copia los datos.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                t.saving
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> {t.saveButton}
                                </>
                            )}
                        </button>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 text-green-400 mt-4"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {status}
                            </motion.div>
                        )}
                    </form>
                </div>
            </div>

            <DirectoryPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(path) => {
                    setDownloadPath(path);
                    setIsPickerOpen(false);
                }}
                initialPath={downloadPath}
            />
        </div>
    );
}
