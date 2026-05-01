import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const THEME_MAPPING: Record<string, { emoji: string; desc: string }> = {
  "Facturacion": { emoji: "💳", desc: "Pagos, cobros, reembolsos y suscripciones" },
  "Problema Tecnico": { emoji: "🛠️", desc: "Fallos de sistema, errores web y bugs" },
  "Acceso a Cuenta": { emoji: "🔐", desc: "Login, contraseñas, bloqueos y 2FA" },
  "Solicitud de Funcion": { emoji: "✨", desc: "Sugerencias, herramientas y mejoras" },
  "Consulta General": { emoji: "ℹ️", desc: "Documentación, guías y dudas generales" }
};

interface ClassifyResponse {
  confianza: number;
  tema: string;
}

export default function App() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/clasificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto: text })
      });

      if (!response.ok) {
        throw new Error('Error al clasificar el texto.');
      }

      const data: ClassifyResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleClassify();
    }
  };

  const activeTheme = result ? THEME_MAPPING[result.tema] : null;

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white flex flex-col items-center p-6 sm:p-12 overflow-x-hidden font-sans">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mt-12 mb-16 text-center"
      >
        <div className="inline-flex items-center justify-center space-x-2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide mb-6">
          <span>Clasificador IA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter mb-4">
          Descubre el tema.
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl font-light">
          Escribe un mensaje de soporte y deja que Atlas lo clasifique.
        </p>
      </motion.header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white border border-gray-200 rounded-[2rem] p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-black"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: Algunas cosas necesitan mejoras..."
            className="w-full h-32 resize-none bg-transparent outline-none p-6 text-xl placeholder:text-gray-300 leading-relaxed"
            spellCheck="false"
          />
          <div className="absolute bottom-4 right-4 flex items-center justify-between left-6">
            <span className="text-xs text-gray-400 font-medium">
              CMD + Enter para enviar
            </span>
            <button
              onClick={handleClassify}
              disabled={!text.trim() || isLoading}
              className="group flex items-center justify-center w-12 h-12 bg-black text-white rounded-full disabled:bg-gray-200 disabled:text-gray-400 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="p-6 bg-gray-50 text-black border border-gray-200 rounded-3xl flex items-start gap-4"
            >
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error</h3>
                <p className="text-gray-500">{error}</p>
              </div>
            </motion.div>
          )}

          {result && activeTheme && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
              className="bg-black text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clasificado</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/50">Confianza</span>
                    <span className="font-mono text-xl">{(result.confianza * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-6xl">{activeTheme.emoji}</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                      {result.tema}
                    </h2>
                  </div>
                  <p className="text-white/60 text-lg ml-[4.5rem]">
                    {activeTheme.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
