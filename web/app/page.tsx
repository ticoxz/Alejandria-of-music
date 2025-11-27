"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UrlInput } from "./components/UrlInput";
import { Download, Music, Disc, CheckCircle2, AlertCircle, Settings as SettingsIcon, Loader2, HelpCircle, X, FileText, ListMusic, Globe, Moon, Sun, Clock } from "lucide-react";
import Link from "next/link";

interface SpotifyInfo {
  type: "track" | "playlist";
  data: any;
  count?: number;
}

const translations = {
  es: {
    title: "Alejandria of",
    subtitle: "Descarga tu música favorita de Spotify, YouTube y SoundCloud en alta calidad.",
    slogan: "Gratis, rápido y simple.",
    urlMode: "URL",
    tracklistMode: "Tracklist",
    placeholderUrl: "Pega tu enlace de Spotify, YouTube o SoundCloud aquí...",
    placeholderTracklist: "Pega tu tracklist aquí...\nArtist - Title\nArtist - Title",
    processTracklist: "Procesar Tracklist",
    downloadNow: "Descargar Ahora",
    downloadAll: "Descargar Todo",
    downloading: "Descargando",
    processing: "Procesando audio...",
    completed: "¡Descarga completada!",
    error: "Error",
    helpTitle: "Ayuda & Información",
    spotifyHelp: "¡Soporte completo! Puedes descargar canciones individuales, álbumes completos y playlists enteras.",
    otherHelp: "Actualmente solo soportamos la descarga de canciones individuales (una por una). Las playlists de estas plataformas aún no están soportadas.",
    tracklistHelp: "Puedes pegar una lista de canciones (Artista - Titulo). ¡Nuevo! Ahora soportamos la descarga de portadas (cover art) también en tracklists.",
    recentHistory: "Descargas Recientes",
    clearHistory: "Borrar Historial"
  },
  en: {
    title: "Alejandria of",
    subtitle: "Download your favorite music from Spotify, YouTube, and SoundCloud in high quality.",
    slogan: "Free, fast, and simple.",
    urlMode: "URL",
    tracklistMode: "Tracklist",
    placeholderUrl: "Paste your Spotify, YouTube or SoundCloud link here...",
    placeholderTracklist: "Paste your tracklist here...\nArtist - Title\nArtist - Title",
    processTracklist: "Process Tracklist",
    downloadNow: "Download Now",
    downloadAll: "Download All",
    downloading: "Downloading",
    processing: "Processing audio...",
    completed: "Download completed!",
    error: "Error",
    helpTitle: "Help & Info",
    spotifyHelp: "Full support! You can download individual songs, full albums, and entire playlists.",
    otherHelp: "Currently we only support downloading individual songs (one by one). Playlists from these platforms are not yet supported.",
    tracklistHelp: "You can paste a list of songs (Artist - Title). New! We now support downloading cover art in tracklists too.",
    recentHistory: "Recent Downloads",
    clearHistory: "Clear History"
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<SpotifyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [searchedUrl, setSearchedUrl] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Settings State
  const [lang, setLang] = useState<"es" | "en">("es");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);

  // Tracklist Mode State
  const [mode, setMode] = useState<"url" | "tracklist">("url");
  const [tracklistText, setTracklistText] = useState("");
  const [parsedTracks, setParsedTracks] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    // Load saved settings
    const savedLang = localStorage.getItem("app_lang") as "es" | "en";
    if (savedLang) setLang(savedLang);

    const savedTheme = localStorage.getItem("app_theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);

    const savedHistory = localStorage.getItem("download_history");
    if (savedHistory) setRecentDownloads(JSON.parse(savedHistory));

    // Apply theme
    document.documentElement.classList.toggle("dark", (savedTheme || "dark") === "dark");
    document.documentElement.classList.toggle("light", (savedTheme || "dark") === "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const toggleLang = () => {
    const newLang = lang === "es" ? "en" : "es";
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  const addToHistory = (item: any) => {
    const newHistory = [item, ...recentDownloads].slice(0, 5);
    setRecentDownloads(newHistory);
    localStorage.setItem("download_history", JSON.stringify(newHistory));
  };


  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setInfo(null);
    setDownloadStatus(null);
    setTaskId(null);
    setProgress(0);
    setSearchedUrl(url);

    try {
      const response = await fetch("http://localhost:8001/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener información. Verifica el enlace.");
      }

      const data = await response.json();
      setInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = async () => {
    if (!tracklistText.trim()) return;
    setIsParsing(true);
    setError(null);
    setParsedTracks([]);

    try {
      const response = await fetch("http://localhost:8001/api/parse_tracklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tracklistText }),
      });

      if (!response.ok) throw new Error("Error al procesar el tracklist");

      const data = await response.json();
      setParsedTracks(data.tracks);
      if (data.tracks.length === 0) {
        setError("No se encontraron canciones válidas en el texto.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownload = async () => {
    if (mode === "url" && !info) return;
    if (mode === "tracklist" && parsedTracks.length === 0) return;

    setDownloadStatus("Iniciando descarga...");
    setProgress(0);
    setTaskId(null);

    // Llamada real al backend
    try {
      // Leer la calidad guardada desde localStorage, por defecto 320K
      const quality = localStorage.getItem("audio_quality") || "320K";

      let body = {};

      if (mode === "url") {
        console.log("Info object:", info);
        let urlToDownload = info!.data.url || info!.data.original_url || info!.data.external_urls?.spotify;

        // Fallback if URL is missing
        if (!urlToDownload && searchedUrl) {
          urlToDownload = searchedUrl;
        }

        if (!urlToDownload) {
          console.error("URL missing in info.data:", info!.data);
          throw new Error("URL no encontrada en la respuesta");
        }

        body = {
          spotify_url: urlToDownload,
          quality: quality
        };
      } else {
        // Tracklist mode
        body = {
          tracklist_mode: true,
          tracks: parsedTracks,
          quality: quality
        };
      }

      const response = await fetch("http://localhost:8001/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Download response data:", data);
        setDownloadStatus("Descarga iniciada...");
        if (data.task_id) {
          console.log("Setting taskId:", data.task_id);
          setTaskId(data.task_id);
        } else {
          console.error("No task_id in response");
        }
      } else {
        console.error("Response not ok");
        setDownloadStatus("Error al iniciar descarga.");
      }
    } catch (e: any) {
      console.error("Download error:", e);
      setDownloadStatus(`Error: ${e.message || "Error de conexión"}`);
    }
  };

  // Polling for progress
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8001/api/progress/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Progress data:", data);

          if (data.status === 'downloading') {
            if (data.total_tracks) {
              setDownloadStatus(`Descargando ${data.current_track}/${data.total_tracks}: ${data.filename} (${data.percent.toFixed(1)}%)`);
            } else {
              setDownloadStatus(`Descargando: ${data.percent.toFixed(1)}%`);
            }
            setProgress(data.percent);
          } else if (data.status === 'processing') {
            setDownloadStatus("Procesando audio...");
            setProgress(100);
          } else if (data.status === 'completed') {
            setDownloadStatus(t.completed);
            setProgress(100);
            clearInterval(interval);
            setTaskId(null); // Stop polling

            // Add to history
            if (display.title) {
              addToHistory({
                title: display.title,
                artist: display.artist,
                cover: display.cover,
                date: new Date().toISOString()
              });
            }
          } else if (data.status === 'error') {
            setDownloadStatus(`Error: ${data.error || "Falló la descarga"}`);
            clearInterval(interval);
            setTaskId(null);
          } else if (data.status === 'starting') {
            setDownloadStatus("Iniciando...");
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [taskId]);

  // Helper to safely get display data
  const getDisplayData = () => {
    if (!info) return { title: "", artist: "", cover: null };

    if (Array.isArray(info.data)) {
      // It's a list of tracks (legacy backend behavior)
      return {
        title: "Playlist",
        artist: `${info.count || info.data.length} canciones`,
        cover: info.data[0]?.cover_art || info.data[0]?.cover_url || null
      };
    } else {
      // It's a dict (track or new playlist)
      return {
        title: info.data.title || info.data.name,
        artist: info.data.artist || info.data.owner?.display_name,
        cover: info.data.cover_url || info.data.cover_art
      };
    }
  };

  const display = getDisplayData();

  return (
    <main className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white selection:bg-neon-pink selection:text-white' : 'bg-gray-100 text-gray-900 selection:bg-neon-pink selection:text-white'} overflow-hidden flex flex-col`}>
      <div className={`absolute inset-0 bg-[url('/grid.svg')] bg-center ${theme === 'dark' ? 'opacity-100' : 'opacity-10 invert'} mask-[linear-gradient(180deg,white,rgba(255,255,255,0))]`}></div>

      <div className="relative container mx-auto px-4 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 mt-20"
        >
          <h1 className={`text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent ${theme === 'dark' ? 'bg-linear-to-b from-white to-gray-400' : 'bg-linear-to-b from-black to-gray-600'}`}>
            {t.title} <span className="text-neon-pink animate-neon-pulse inline-block">Music</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.subtitle}
            <br />
            <span className="text-neon-pink font-semibold drop-shadow-[0_0_10px_rgba(255,16,240,0.5)]">{t.slogan}</span>
          </p>
        </motion.div>

        <div className="absolute top-8 right-8 flex gap-4 items-center">
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 text-sm font-bold rounded-full bg-gray-900/10 hover:bg-gray-900/20 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-4 h-4" />
            {lang.toUpperCase()}
          </button>

          <button
            onClick={toggleTheme}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-200 dark:bg-gray-900/50 rounded-full hover:bg-gray-300 dark:hover:bg-gray-800 transition-all"
          >
            {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-200 dark:bg-gray-900/50 rounded-full hover:bg-gray-300 dark:hover:bg-gray-800 transition-all"
            title={t.helpTitle}
          >
            <HelpCircle className="w-6 h-6" />
          </button>
          <Link
            href="/settings"
            className="p-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-200 dark:bg-gray-900/50 rounded-full hover:bg-gray-300 dark:hover:bg-gray-800 transition-all"
            title="Configuración"
          >
            <SettingsIcon className="w-6 h-6" />
          </Link>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-8 bg-gray-200 dark:bg-gray-900/50 p-1 rounded-xl backdrop-blur-sm border border-gray-300 dark:border-gray-800">
          <button
            onClick={() => {
              setMode("url");
              setError(null);
              setDownloadStatus(null);
              setParsedTracks([]); // Clear tracklist results
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${mode === "url"
              ? "bg-neon-pink text-white shadow-[0_0_15px_rgba(255,16,240,0.4)]"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <Music className="w-4 h-4" /> {t.urlMode}
          </button>
          <button
            onClick={() => {
              setMode("tracklist");
              setError(null);
              setDownloadStatus(null);
              setInfo(null); // Clear URL results
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${mode === "tracklist"
              ? "bg-neon-pink text-white shadow-[0_0_15px_rgba(255,16,240,0.4)]"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <FileText className="w-4 h-4" /> {t.tracklistMode}
          </button>
        </div>

        <div className="w-full mb-12 flex justify-center">
          {mode === "url" ? (
            <UrlInput onSubmit={handleSearch} isLoading={isLoading} placeholder={t.placeholderUrl} />
          ) : (
            <div className="w-full max-w-2xl">
              <textarea
                value={tracklistText}
                onChange={(e) => setTracklistText(e.target.value)}
                placeholder={t.placeholderTracklist}
                className="w-full h-48 bg-gray-200 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-xl p-4 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all resize-none mb-4 font-mono text-sm"
              />
              <button
                onClick={handleParse}
                disabled={isParsing || !tracklistText.trim()}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ListMusic className="w-5 h-5" />}
                {t.processTracklist}
              </button>
            </div>
          )}
        </div>

        {/* Recent History */}
        {
          recentDownloads.length > 0 && !info && parsedTracks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-gray-800">
                  <Clock className="w-5 h-5 text-neon-pink" />
                  {t.recentHistory}
                </h3>
                <button
                  onClick={() => {
                    setRecentDownloads([]);
                    localStorage.removeItem("download_history");
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                  {t.clearHistory}
                </button>
              </div>
              <div className="space-y-2">
                {recentDownloads.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-xl">
                    {item.cover ? (
                      <img src={item.cover} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                        <Music className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate dark:text-white text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">{item.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        }

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowHelp(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 dark:text-white text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-neon-pink" />
                  {t.helpTitle}
                </h2>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <h3 className="font-semibold dark:text-white text-gray-900 mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4 text-neon-pink" /> Spotify
                    </h3>
                    <p className="text-sm">
                      {t.spotifyHelp}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <h3 className="font-semibold dark:text-white text-gray-900 mb-2 flex items-center gap-2">
                      <Disc className="w-4 h-4 text-orange-400" /> SoundCloud & YouTube
                    </h3>
                    <p className="text-sm">
                      {t.otherHelp}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <h3 className="font-semibold dark:text-white text-gray-900 mb-2 flex items-center gap-2">
                      <ListMusic className="w-4 h-4 text-blue-400" /> Tracklists
                    </h3>
                    <p className="text-sm">
                      {t.tracklistHelp}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-6 text-center">
                    Versión 2.0.0 - Alejandria of Music
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-lg flex items-center gap-3 mb-8"
            >
              <AlertCircle className="w-6 h-6" />
              <p>{error}</p>
            </motion.div>
          )}

          {info && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                {display.cover ? (
                  <img
                    src={display.cover}
                    alt="Cover"
                    className="w-24 h-24 rounded-lg shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Disc className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate text-white">
                    {display.title}
                  </h3>
                  <p className="text-gray-400 truncate">
                    {display.artist}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {info.type === "track" ? (
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" /> Canción
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Disc className="w-3 h-3" /> Playlist ({info.count})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {taskId && (
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                  <motion.div
                    className="bg-neon-pink h-2.5 rounded-full shadow-[0_0_10px_rgba(255,16,240,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={!!taskId || downloadStatus === "¡Descarga completada!"}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {taskId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {downloadStatus}
                  </>
                ) : downloadStatus === "¡Descarga completada!" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-neon-pink" />
                    {downloadStatus}
                  </>
                ) : downloadStatus && downloadStatus.startsWith("Error") ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    {downloadStatus}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {t.downloadNow}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Tracklist Result Display */}
          {mode === "tracklist" && parsedTracks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <ListMusic className="w-8 h-8 text-neon-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.tracklistMode}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{parsedTracks.length} canciones detectadas</p>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto mb-6 space-y-2 pr-2 custom-scrollbar">
                {parsedTracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800/30 rounded-lg text-sm">
                    <span className="text-gray-500 w-6 text-center">{i + 1}</span>
                    <div className="flex-1 truncate">
                      <span className="text-gray-900 dark:text-white font-medium">{track.artist}</span>
                      <span className="text-gray-500 mx-2">-</span>
                      <span className="text-gray-500 dark:text-gray-400">{track.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              {taskId && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                  <motion.div
                    className="bg-neon-pink h-2.5 rounded-full shadow-[0_0_10px_rgba(255,16,240,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={!!taskId || downloadStatus === t.completed}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {taskId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {downloadStatus}
                  </>
                ) : downloadStatus === t.completed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-neon-pink" />
                    {downloadStatus}
                  </>
                ) : downloadStatus && downloadStatus.startsWith("Error") ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    {downloadStatus}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {t.downloadAll} ({parsedTracks.length})
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="w-full text-center text-gray-500 text-sm mt-auto pt-8">
          <p className="flex items-center justify-center gap-2">
            made with <span className="text-red-500">❤️</span> by ticox
          </p>
        </footer>
      </div >
    </main >
  );
}
