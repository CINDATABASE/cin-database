import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageSquare, Filter } from "lucide-react";
import api from "../services/api";

interface Discipline {
  _id: string;
  name: string;
  code: string;
  professor: string;
}

interface Review {
  _id: string;
  difficulty: number;
  didactics: number;
  comment: string;
  createdAt: string;
}

interface ViewReviewsProps {
  onBack: () => void;
}

export default function ViewReviewsPage({ onBack }: ViewReviewsProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await api.get<Discipline[]>("/disciplines");
        setDisciplines(response.data);
      } catch (err) {
        console.error("Erro ao carregar cadeiras:", err);
      }
    };
    fetchDisciplines();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedDisciplineId) {
        setReviews([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get<Review[]>(
          `/reviews?disciplineId=${selectedDisciplineId}`,
        );
        setReviews(response.data);
      } catch (err) {
        console.error("Erro ao buscar reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedDisciplineId]);

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? "#f59e0b" : "transparent"}
            color={star <= rating ? "#f59e0b" : "#cbd5e1"}
          />
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

      <div style={styles.filterCard}>
        <label style={styles.label}>
          Filtrar Avaliações por Cadeira e Docente
        </label>
        <div style={styles.selectWrapper}>
          <Filter size={18} style={styles.icon} />
          <select
            value={selectedDisciplineId}
            onChange={(e) => setSelectedDisciplineId(e.target.value)}
            style={styles.select}
          >
            <option value="">
              Selecione a combinação de cadeira e professor...
            </option>
            {disciplines.map((disc) => (
              <option key={disc._id} value={disc._id}>
                {disc.name} ({disc.code}) — Prof. {disc.professor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.centerState}>
          Calculando métricas e puxando feedbacks...
        </div>
      ) : !selectedDisciplineId ? (
        <div style={styles.centerState}>
          Escolha uma cadeira acima para analisar os feedbacks dos alunos.
        </div>
      ) : reviews.length === 0 ? (
        <div style={styles.centerState}>
          Essa cadeira ainda não possui nenhuma avaliação anônima registrada.
        </div>
      ) : (
        <div style={styles.reviewsList}>
          {reviews.map((rev) => (
            <div key={rev._id} style={styles.reviewCard}>
              <div style={styles.cardMetrics}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Dificuldade:</span>
                  {renderStars(rev.difficulty)}
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Didática:</span>
                  {renderStars(rev.didactics)}
                </div>
                <span style={styles.cardDate}>
                  {new Date(rev.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {rev.comment && (
                <div style={styles.commentBox}>
                  <MessageSquare
                    size={16}
                    color="#64748b"
                    style={{ marginTop: "2px" }}
                  />
                  <p style={styles.commentText}>{rev.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "800px", margin: "0 auto", boxSizing: "border-box" },
  header: { marginBottom: "20px" },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "15px",
    cursor: "pointer",
    padding: 0,
  },
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  icon: { position: "absolute", left: "14px", color: "#94a3b8" },
  select: {
    width: "100%",
    padding: "12px 12px 12px 42px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    outline: "none",
    cursor: "pointer",
  },
  centerState: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    fontSize: "15px",
  },
  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
  },
  cardMetrics: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    flexWrap: "wrap",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  metricRow: { display: "flex", alignItems: "center", gap: "8px" },
  metricLabel: { fontSize: "14px", fontWeight: "500", color: "#334155" },
  cardDate: { marginLeft: "auto", fontSize: "12px", color: "#94a3b8" },
  commentBox: { display: "flex", gap: "10px", alignItems: "flex-start" },
  commentText: {
    margin: 0,
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.5",
  },
};
