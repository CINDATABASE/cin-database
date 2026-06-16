import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageSquare, Filter } from "lucide-react";
import api from "../services/api";
import "./ViewReviews.css";

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
    <div className="viewReviewsContainer">
      <header className="viewReviewsHeader">
        <button onClick={onBack} className="viewReviewsBackButton">
          <ArrowLeft size={20} />
          <span>Voltar ao Repositório</span>
        </button>
      </header>

      <div className="viewReviewsFilterCard">
        <label className="viewReviewsLabel">
          Filtrar Avaliações por Cadeira e Docente
        </label>
        <div className="viewReviewsSelectWrapper">
          <Filter size={18} className="viewReviewsIcon" />
          <select
            value={selectedDisciplineId}
            onChange={(e) => setSelectedDisciplineId(e.target.value)}
            className="viewReviewsSelect"
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
        <div className="viewReviewsCenterState">
          Calculando métricas e puxando feedbacks...
        </div>
      ) : !selectedDisciplineId ? (
        <div className="viewReviewsCenterState">
          Escolha uma cadeira acima para analisar os feedbacks dos alunos.
        </div>
      ) : reviews.length === 0 ? (
        <div className="viewReviewsCenterState">
          Essa cadeira ainda não possui nenhuma avaliação anônima registrada.
        </div>
      ) : (
        <div className="viewReviewsList">
          {reviews.map((rev) => (
            <div key={rev._id} className="viewReviewsReviewCard">
              <div className="viewReviewsCardMetrics">
                <div className="viewReviewsMetricRow">
                  <span className="viewReviewsMetricLabel">Dificuldade:</span>
                  {renderStars(rev.difficulty)}
                </div>
                <div className="viewReviewsMetricRow">
                  <span className="viewReviewsMetricLabel">Didática:</span>
                  {renderStars(rev.didactics)}
                </div>
                <span className="viewReviewsCardDate">
                  {new Date(rev.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {rev.comment && (
                <div className="viewReviewsCommentBox">
                  <MessageSquare
                    size={16}
                    color="#64748b"
                    style={{ marginTop: "2px" }}
                  />
                  <p className="viewReviewsCommentText">{rev.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
