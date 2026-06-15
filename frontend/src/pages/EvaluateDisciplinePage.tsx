import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import api from "../services/api";

interface Discipline {
  _id: string;
  name: string;
  code: string;
  professor: string;
}

interface EvaluatePageProps {
  onBack: () => void;
}

export default function EvaluateDisciplinePage({ onBack }: EvaluatePageProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState("");

  // Estados para as notas (1 a 5)
  const [difficulty, setDifficulty] = useState(0);
  const [didactics, setDidactics] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await api.get<Discipline[]>("/disciplines");
        setDisciplines(response.data);
      } catch (err) {
        console.error("Erro ao carregar disciplinas para avaliação:", err);
      }
    };
    fetchDisciplines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDisciplineId) {
      setError("Por favor, selecione uma cadeira para avaliar.");
      return;
    }
    if (difficulty === 0 || didactics === 0) {
      setError(
        "Por favor, atribua uma nota de estrelas para os dois critérios.",
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/reviews", {
        disciplineId: selectedDisciplineId,
        difficulty,
        didactics,
        comment,
      });

      setSuccess(true);
      setDifficulty(0);
      setDidactics(0);
      setComment("");
      setSelectedDisciplineId("");
    } catch (err) {
      console.error(err);
      setError("Falha ao enviar sua avaliação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }
  const renderStarRating = (
    currentRating: number,
    setRating: (rating: number) => void,
  ) => {
    return (
      <div style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={24}
              fill={star <= currentRating ? "#f59e0b" : "transparent"}
              color={star <= currentRating ? "#f59e0b" : "#cbd5e1"}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Voltar ao Repositório</span>
        </button>
      </header>

      <main style={styles.card}>
        <h1 style={styles.title}>Avaliar Cadeira do CIn</h1>
        <p style={styles.subtitle}>
          Sua avaliação é 100% anônima. Ajude a comunidade de alunos a
          entender o fluxo, a didática e o peso de cada disciplina do centro.
        </p>

        {success && (
          <div style={styles.successAlert}>
            🎉 Avaliação enviada com sucesso! Obrigado por contribuir.
            <button
              onClick={() => setSuccess(false)}
              style={styles.resetSuccessBtn}
            >
              Avaliar outra
            </button>
          </div>
        )}

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Selecione a Cadeira</label>
            <select
              value={selectedDisciplineId}
              onChange={(e) => setSelectedDisciplineId(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">Escolha uma cadeira...</option>
              {disciplines.map((disc) => (
                <option key={disc._id} value={disc._id}>
                  {disc.name} ({disc.code}) - {disc.professor}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.ratingSection}>
            <div style={styles.ratingGroup}>
              <label style={styles.label}>
                Nível de Dificuldade (Cobrança/Provas)
              </label>
              <span style={styles.ratingDesc}>
                1 = Muito Tranquila | 5 = Extremamente Pesada
              </span>
              {renderStarRating(difficulty, setDifficulty)}
            </div>

            <div style={styles.ratingGroup}>
              <label style={styles.label}>
                Qualidade da Didática / Suporte
              </label>
              <span style={styles.ratingDesc}>
                1 = Muito Ruim | 5 = Excelente Didática
              </span>
              {renderStarRating(didactics, setDidactics)}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Comentário / Dica para Sobreviver à Cadeira (Opcional)
            </label>
            <div style={styles.textareaWrapper}>
              <MessageSquare size={18} style={styles.textareaIcon} />
              <textarea
                placeholder="Ex: Foque nas listas antigas, o professor costuma repetir a lógica das questões na EE2..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                style={styles.textarea}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Registrando voto anônimo..." : "Submeter Avaliação"}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },
  header: {
    marginBottom: "24px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "36px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 32px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
  },
  select: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    outline: "none",
    cursor: "pointer",
    width: "100%",
  },
  ratingSection: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
  },
  ratingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: "250px",
  },
  ratingDesc: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  starRow: {
    display: "flex",
    gap: "6px",
  },
  starButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  textareaWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
  },
  textareaIcon: {
    position: "absolute",
    left: "14px",
    top: "14px",
    color: "#94a3b8",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px 12px 12px 42px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
    lineHeight: "1.5",
  },
  submitButton: {
    backgroundColor: "#9c1c1c",
    color: "#ffffff",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#ffebe9",
    color: "#9c1c1c",
    border: "1px solid rgba(156, 28, 28, 0.15)",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "500",
  },
  successAlert: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid rgba(22, 163, 74, 0.15)",
    padding: "16px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "500",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
  },
  resetSuccessBtn: {
    background: "none",
    border: "none",
    color: "#16a34a",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "600",
  },
};