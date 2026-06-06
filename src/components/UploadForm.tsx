import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface UploadFormProps {
  onSubmit: (file: File) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const levels = ['estagio', 'junior', 'pleno'] as const;
const areas = ['Front-End', 'Back-End', 'Full Stack', 'Python', 'Dados', 'IA/Machine Learning', 'Suporte/TI', 'Cloud'];

export function UploadForm({ onSubmit, loading, error }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [level, setLevel] = useState<'estagio' | 'junior' | 'pleno'>('junior');
  const [area, setArea] = useState('Front-End');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setValidationError('Apenas PDF permitido');
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setValidationError('Arquivo muito grande (máx 10MB)');
        setFile(null);
        return;
      }
      setFile(f);
      setValidationError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        setValidationError('Apenas PDF permitido');
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setValidationError('Arquivo muito grande (máx 10MB)');
        setFile(null);
        return;
      }
      setFile(f);
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!file) {
      setValidationError('Selecione um PDF');
      return;
    }
    try {
      await onSubmit(file);
    } catch {
      // error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {(error || validationError) && (
        <div className="p-4 rounded-lg bg-error/10 flex gap-3 text-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error || validationError}</div>
        </div>
      )}

      {/* PDF Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-neon p-8 rounded-2xl"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neon-blue">
          <FileText className="w-5 h-5" />
          Seu Currículo
        </h3>
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all group"
          style={{
            borderColor: file ? 'rgba(39,201,255,0.6)' : 'rgba(39,201,255,0.2)',
            backgroundColor: file ? 'rgba(39,201,255,0.05)' : 'transparent',
          }}
        >
          <div className="flex flex-col items-center justify-center py-8">
            {file ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-neon-blue mb-3" />
                <p className="text-sm font-semibold theme-text">
                  {file.name}
                </p>
                <p className="text-xs theme-text-secondary mt-1">
                  ✓ Pronto para leitura
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-neon-blue mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold theme-text">
                  Arraste seu PDF aqui
                </p>
                <p className="text-xs theme-text-secondary mt-1">
                  ou clique para selecionar (máx 10MB)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </motion.div>

      {/* Job Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-neon-purple p-8 rounded-2xl space-y-6"
      >
        <h3 className="text-lg font-semibold text-neon-purple">Detalhes da Vaga (Opcional)</h3>

        <div>
          <label className="block text-sm font-medium theme-text mb-2">
            Cargo desejado
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex: Desenvolvedor React"
            className="w-full input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Nível
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="w-full input-field"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l === 'estagio' ? 'Estágio' : l === 'junior' ? 'Júnior' : 'Pleno'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Área
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full input-field"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Job Description Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-neon p-8 rounded-2xl"
      >
        <label className="block">
          <span className="text-sm font-medium theme-text block mb-2">
            Descrição da Vaga
          </span>
          <p className="text-xs theme-text-secondary mb-3">
            Este campo será utilizado em uma etapa futura
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Cole aqui o texto completo da vaga..."
            rows={8}
            className="w-full input-field resize-none"
          />
        </label>
      </motion.div>

      {/* Optional Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-neon-purple p-8 rounded-2xl space-y-4"
      >
        <h3 className="text-sm font-medium text-neon-purple">
          Links Adicionais (Opcional)
        </h3>

        <div>
          <label className="block text-sm font-medium theme-text mb-2">
            LinkedIn
          </label>
          <input
            type="text"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="linkedin.com/in/seu-perfil"
            className="w-full input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium theme-text mb-2">
            GitHub
          </label>
          <input
            type="text"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="github.com/seu-usuario"
            className="w-full input-field"
          />
        </div>
      </motion.div>

      {/* Privacy Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-neon p-6 rounded-xl border border-neon-blue/40 bg-neon-blue/5"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm theme-text">
            <p className="font-medium mb-1">Seus dados são totalmente privados</p>
            <p className="text-xs theme-text-secondary">
              Nenhum cadastro necessário. Seu currículo é processado apenas para esta leitura e não é armazenado.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
      >
        {loading ? 'Lendo...' : 'Ler meu currículo'}
      </motion.button>
    </form>
  );
}
