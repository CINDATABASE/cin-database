import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import api from "../services/api";

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
      // 💡 Payload atualizado: enviado sem o campo 'description'
      await api.post("/disciplines", {
        name,
        code: code.trim().toUpperCase(),
        professor,
      });

      alert(`Disciplina "${name}" cadastrada com sucesso!`);
      
      // Limpa o formulário
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
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <header style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <FolderPlus size={22} color="#9c1c1c" />
            <h2 style={styles.title}>Nova Disciplina</h2>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </header>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome da Cadeira</label>
            <input 
              type="text" 
              placeholder="Ex: Infraestrutura de Redes" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Código da Cadeira</label>
            <input 
              type="text" 
              placeholder="Ex: IF678" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Professor Titular</label>
            <input 
              type="text" 
              placeholder="Ex: Patricia Tedesco" 
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Salvando..." : "Cadastrar Disciplina"}
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
    zIndex: 1010,
    backdropFilter: "blur(4px)",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    boxSizing: "border-box",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "18px",
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
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
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
    fontFamily: "inherit",
  },
  submitButton: {
    backgroundColor: "#9c1c1c",
    color: "#ffffff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#ffebe9",
    color: "#9c1c1c",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "14px",
    textAlign: "center",
    fontWeight: "500",
  },
};