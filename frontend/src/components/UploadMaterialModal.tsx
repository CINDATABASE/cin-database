import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import "./Modals.css";

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
    <div className="modalOverlay">
      <div className="modalCard">
        <header className="modalHeader">
          <div className="modalHeaderTitleGroup">
            <Upload size={22} color="#9c1c1c" />
            <h2 className="modalTitle">Compartilhar Material</h2>
          </div>
          <button onClick={onClose} className="modalCloseButton">
            <X size={20} />
          </button>
        </header>

        {error && <div className="modalErrorAlert">{error}</div>}

        <form onSubmit={handleSubmit} className="modalForm">
          <div className="modalInputGroup">
            <label className="modalLabel">Título do Material</label>
            <input
              type="text"
              placeholder="Ex: EE1 resolvida - 2025.1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="modalInput"
            />
          </div>

          <div className="modalInputGroup">
            <label className="modalLabel">Descrição / Notas</label>
            <textarea
              placeholder="Adicione detalhes úteis (ex: Assuntos abordados, questões difíceis)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="modalInput"
              style={{ height: "80px", resize: "none" }}
            />
          </div>

          <div className="modalRow">
            <div className="modalInputGroup" style={{ flex: 1 }}>
              <label className="modalLabel">Disciplina</label>
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                required
                className="modalSelect"
              >
                <option value="">Selecione...</option>

                {disciplines.map((disc) => (
                  <option key={disc._id} value={disc._id}>
                    {disc.name} ({disc.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="modalInputGroup" style={{ flex: 1 }}>
              <label className="modalLabel">Tipo de Arquivo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="modalSelect"
              >
                <option value="PROVA">PROVA</option>
                <option value="LISTA">LISTA</option>
                <option value="VIDEO">VÍDEO / MONITORIA</option>
              </select>
            </div>
          </div>

          <div className="modalInputGroup">
            <label className="modalLabel">Arquivo</label>
            <div className="modalFileDropzone">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="modalFileLabel">
                {file ? (
                  <div className="modalFileSelectedInfo">
                    <CheckCircle2 size={32} color="#16a34a" />
                    <span className="modalFileName">{file.name}</span>
                    <span className="modalFileSize">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="modalDropzonePlaceholder">
                    <FileText size={32} color="#64748b" />
                    <span className="modalDropzoneText">
                      Clique para selecionar o arquivo
                    </span>
                    <span className="modalDropzoneSubtext">
                      PDF, Imagens, Documentos
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="modalSubmitButton">
            {loading
              ? "Enviando e salvando..."
              : "Upar Material para Avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
}
