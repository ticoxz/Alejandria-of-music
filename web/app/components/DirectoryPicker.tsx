import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, ChevronUp, Check, X, Loader2, Plus, FolderPlus } from "lucide-react";

interface DirectoryPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (path: string) => void;
    initialPath?: string;
}

interface FolderItem {
    name: string;
    path: string;
}

export default function DirectoryPicker({ isOpen, onClose, onSelect, initialPath }: DirectoryPickerProps) {
    const [currentPath, setCurrentPath] = useState(initialPath || "");
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const fetchFolders = async (path?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const url = new URL("http://localhost:8001/api/browse");
            if (path) {
                url.searchParams.append("path", path);
            }
            
            const res = await fetch(url.toString());
            
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            
            if (data.error) {
                setError(data.error);
                setFolders([]);
            } else {
                setFolders(Array.isArray(data.folders) ? data.folders : []);
                setCurrentPath(data.current_path || path || "");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const res = await fetch("http://localhost:8001/api/create_folder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: currentPath, name: newFolderName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Error al crear carpeta");
            }

            // Refresh folders
            await fetchFolders(currentPath);
            setIsCreating(false);
            setNewFolderName("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFolders(currentPath);
        }
    }, [isOpen]);

    const handleNavigate = (path: string) => {
        fetchFolders(path);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Folder className="w-5 h-5 text-green-500" />
                        Seleccionar Carpeta
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsCreating(!isCreating)}
                            className={`p-2 rounded-lg transition-colors ${isCreating ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800 text-gray-400'}`}
                            title="Nueva Carpeta"
                        >
                            <FolderPlus className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Current Path */}
                <div className="px-4 py-2 bg-gray-800/30 text-xs text-gray-400 font-mono border-b border-gray-800 truncate">
                    {currentPath || "Cargando..."}
                </div>

                {/* Create Folder Form */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleCreateFolder}
                            className="bg-gray-800/50 border-b border-gray-800 p-3 overflow-hidden"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Nombre de la carpeta"
                                    className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 bg-green-500 text-black text-sm font-bold rounded-lg hover:bg-green-400 transition-colors"
                                >
                                    Crear
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Content */}
                <div className="h-80 overflow-y-auto p-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-green-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
                            <p>{error}</p>
                            <button 
                                onClick={() => fetchFolders()} 
                                className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm text-white"
                            >
                                Ir al inicio
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {folders.map((folder) => (
                                <button
                                    key={folder.path}
                                    onClick={() => handleNavigate(folder.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                                >
                                    {folder.name === ".." ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-white" />
                                    ) : (
                                        <Folder className="w-5 h-5 text-yellow-500/80 group-hover:text-yellow-400" />
                                    )}
                                    <span className="text-sm text-gray-300 group-hover:text-white truncate">
                                        {folder.name}
                                    </span>
                                </button>
                            ))}
                            {folders.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    Carpeta vacía
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSelect(currentPath)}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-green-500 text-black hover:bg-green-400 transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Seleccionar esta carpeta
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
