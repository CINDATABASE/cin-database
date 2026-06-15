import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";
import api from "../services/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface Discipline {
  _id: string;
  name: string;
  code: string;
  professor: string;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PROVA");
  const [disciplineId, setDisciplineId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await api.get<Discipline[]>("/disciplines");
        setDisciplines(response.data);
      } catch (err) {
        console.error("Erro ao carregar disciplinas no modal de upload:", err);
      }
    };

    if (isOpen) {
      fetchDisciplines();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Por favor, selecione um arquivo (PDF, imagem, etc).");
      return;
    }
    if (!disciplineId) {
      setError("Por favor, selecione a disciplina correspondente.");
      return;
    }

    const selectedDisciplineObject = disciplines.find(
      (d) => d._id === disciplineId,
    );

    if (!selectedDisciplineObject) {
      setError("A disciplina selecionada não foi encontrada na lista.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("disciplineId", disciplineId);
    formData.append("type", type);

    formData.append("disciplineName", selectedDisciplineObject.name);
    formData.append("professor", selectedDisciplineObject.professor);

    try {
      await api.post("/materials/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setDescription("");
      setFile(null);
      setDisciplineId("");

      onUploadSuccess();
      onClose();
    } catch (err: unknown) {
      const backendMessage = (
        err as { response?: { data?: { message?: string | string[] } } }
      ).response?.data?.message;

      const parsedMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage;
      setError(parsedMessage || "Falha ao enviar o material para o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <header style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <Upload size={22} color="#9c1c1c" />
            <h2 style={styles.title}>Compartilhar Material</h2>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </header>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Título do Material</label>
            <input
              type="text"
              placeholder="Ex: EE1 resolvida - 2025.1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Descrição / Notas</label>
            <textarea
              placeholder="Adicione detalhes úteis (ex: Assuntos abordados, questões difíceis)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ ...styles.input, height: "80px", resize: "none" }}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Disciplina</label>
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                required
                style={styles.select}
              >
                <option value="">Selecione...</option>

                {disciplines.map((disc) => (
                  <option key={disc._id} value={disc._id}>
                    {disc.name} ({disc.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Tipo de Arquivo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={styles.select}
              >
                <option value="PROVA">PROVA</option>
                <option value="LISTA">LISTA</option>
                <option value="VIDEO">VÍDEO / MONITORIA</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Arquivo</label>
            <div style={styles.fileDropzone}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" style={styles.fileLabel}>
                {file ? (
                  <div style={styles.fileSelectedInfo}>
                    <CheckCircle2 size={32} color="#16a34a" />
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileSize}>
                      (({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div style={styles.dropzonePlaceholder}>
                    <FileText size={32} color="#64748b" />
                    <span style={styles.dropzoneText}>
                      Clique para selecionar o arquivo
                    </span>
                    <span style={styles.dropzoneSubtext}>
                      PDF, Imagens, Documentos
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading
              ? "Enviando e salvando..."
              : "Upar Material para Avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    padding: "30px",
    boxSizing: "border-box",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    outline: "none",
    cursor: "pointer",
    width: "100%",
  },
  fileDropzone: {
    border: "2px dashed #e2e8f0",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  fileLabel: {
    cursor: "pointer",
    display: "block",
    width: "100%",
  },
  dropzonePlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  dropzoneText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  },
  dropzoneSubtext: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  fileSelectedInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  fileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    maxWidth: "400px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: "12px",
    color: "#64748b",
  },
  submitButton: {
    backgroundColor: "#9c1c1c",
    color: "#ffffff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.2s",
  },
  errorAlert: {
    backgroundColor: "#ffebe9",
    color: "#9c1c1c",
    border: "1px solid rgba(156, 28, 28, 0.2)",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "14px",
    textAlign: "center",
    fontWeight: "500",
  },
};
