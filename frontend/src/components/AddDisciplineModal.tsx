import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import api from "../services/api";
import "./Modals.css";

interface AddDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDisciplineModal({ isOpen, onClose, onSuccess }: AddDisciplineModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(""); 
  const [professor, setProfessor] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/disciplines", {
        name,
        code: code.trim().toUpperCase(),
        professor,
      });

      alert(`Disciplina "${name}" cadastrada com sucesso!`);
      
      setName("");
      setCode("");
      setProfessor("");
      
      onSuccess(); 
      onClose();   
    } catch (err: unknown) {
      const backendMessage = (
        err as { response?: { data?: { message?: string | string[] } } }
      ).response?.data?.message;

      const parsedMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      setError(parsedMessage || "Erro ao cadastrar disciplina no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalCard modalCardSmall">
        <header className="modalHeader modalHeaderSmall">
          <div className="modalHeaderTitleGroup">
            <FolderPlus size={22} color="#9c1c1c" />
            <h2 className="modalTitle modalTitleSmall">Nova Disciplina</h2>
          </div>
          <button onClick={onClose} className="modalCloseButton">
            <X size={20} />
          </button>
        </header>

        {error && <div className="modalErrorAlert">{error}</div>}

        <form onSubmit={handleSubmit} className="modalForm modalFormSmall">
          <div className="modalInputGroup">
            <label className="modalLabel">Nome da Cadeira</label>
            <input 
              type="text" 
              placeholder="Ex: Infraestrutura de Redes" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="modalInput"
            />
          </div>

          <div className="modalInputGroup">
            <label className="modalLabel">Código da Cadeira</label>
            <input 
              type="text" 
              placeholder="Ex: IF678" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="modalInput"
            />
          </div>

          <div className="modalInputGroup">
            <label className="modalLabel">Professor Titular</label>
            <input 
              type="text" 
              placeholder="Ex: Patricia Tedesco" 
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              required
              className="modalInput"
            />
          </div>

          <button type="submit" disabled={loading} className="modalSubmitButton">
            {loading ? "Salvando..." : "Cadastrar Disciplina"}
          </button>
        </form>
      </div>
    </div>
  );
}