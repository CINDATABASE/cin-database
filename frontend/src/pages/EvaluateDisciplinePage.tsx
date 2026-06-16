import { useState, useEffect } from "react";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import api from "../services/api";
import "./EvaluateDiscipline.css";

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
      <div className="evaluateStarRow">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="evaluateStarButton"
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
    <div className="evaluateContainer">
      <header className="evaluateHeader">
        <button onClick={onBack} className="evaluateBackButton">
          <ArrowLeft size={20} />
          <span>Voltar ao Repositório</span>
        </button>
      </header>

      <main className="evaluateCard">
        <h1 className="evaluateTitle">Avaliar Cadeira do CIn</h1>
        <p className="evaluateSubtitle">
          Sua avaliação é 100% anônima. Ajude a comunidade de alunos a
          entender o fluxo, a didática e o peso de cada disciplina do centro.
        </p>

        {success && (
          <div className="evaluateSuccessAlert">
            🎉 Avaliação enviada com sucesso! Obrigado por contribuir.
            <button
              onClick={() => setSuccess(false)}
              className="evaluateResetSuccessBtn"
            >
              Avaliar outra
            </button>
          </div>
        )}

        {error && <div className="evaluateErrorAlert">{error}</div>}

        <form onSubmit={handleSubmit} className="evaluateForm">
          <div className="evaluateInputGroup">
            <label className="evaluateLabel">Selecione a Cadeira</label>
            <select
              value={selectedDisciplineId}
              onChange={(e) => setSelectedDisciplineId(e.target.value)}
              required
              className="evaluateSelect"
            >
              <option value="">Escolha uma cadeira...</option>
              {disciplines.map((disc) => (
                 <option key={disc._id} value={disc._id}>
                  {disc.name} ({disc.code}) - {disc.professor}
                </option>
              ))}
            </select>
          </div>

          <div className="evaluateRatingSection">
            <div className="evaluateRatingGroup">
              <label className="evaluateLabel">
                Nível de Dificuldade (Cobrança/Provas)
              </label>
              <span className="evaluateRatingDesc">
                1 = Muito Tranquila | 5 = Extremamente Pesada
              </span>
              {renderStarRating(difficulty, setDifficulty)}
            </div>

            <div className="evaluateRatingGroup">
              <label className="evaluateLabel">
                Qualidade da Didática / Suporte
              </label>
              <span className="evaluateRatingDesc">
                1 = Muito Ruim | 5 = Excelente Didática
              </span>
              {renderStarRating(didactics, setDidactics)}
            </div>
          </div>

          <div className="evaluateInputGroup">
            <label className="evaluateLabel">
              Comentário / Dica para Sobreviver à Cadeira (Opcional)
            </label>
            <div className="evaluateTextareaWrapper">
              <MessageSquare size={18} className="evaluateTextareaIcon" />
              <textarea
                placeholder="Ex: Foque nas listas antigas, o professor costuma repetir a lógica das questões na EE2..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                className="evaluateTextarea"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="evaluateSubmitButton">
            {loading ? "Registrando voto anônimo..." : "Submeter Avaliação"}
          </button>
        </form>
      </main>
    </div>
  );
}