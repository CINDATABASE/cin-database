import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Star,
  PlusCircle,
  LogOut,
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  FolderPlus,
  ShieldCheck,
  Check,
  Download,
  MessageSquare, // 💡 Adicionado para o botão de ver avaliações
} from "lucide-react";

import AddDisciplineModal from "../components/AddDisciplineModal";
import api from "../services/api";
import UploadMaterialModal from "../components/UploadMaterialModal";
import EvaluateDisciplinePage from "./EvaluateDisciplinePage";
import ViewReviewsPage from "./ViewReviewsPage";
import "./Dashboard.css";
interface Material {
  _id: string;
  title: string;
  description: string;
  disciplineId: string;
  disciplineName: string;
  professor: string;
  type: "PROVA" | "LISTA" | "VIDEO";
  isApproved: boolean;
  filename: string;
}

interface Discipline {
  _id: string;
  name: string;
  code: string;
  professor: string;
}

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<string>("ALUNO");
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("TODAS");
  const [selectedProfessor, setSelectedProfessor] = useState<string>("TODOS");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [isEvaluatingView, setIsEvaluatingView] = useState<boolean>(false);
  const [isViewingReviews, setIsViewingReviews] = useState<boolean>(false); // 💡 Estado da nova aba

  const [favorites, setFavorites] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAddDisciplineModalOpen, setIsAddDisciplineModalOpen] =
    useState<boolean>(false);

  const fetchMaterials = async (isAdminMode: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = isAdminMode ? "/materials/pending" : "/materials";
      const response = await api.get(endpoint);
      setMaterials(response.data);
    } catch (err) {
      console.error("Erro ao buscar materiais do backend:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisciplinesAndProfessors = async () => {
    try {
      const response = await api.get<Discipline[]>("/disciplines");
      const fetchedDisciplines = response.data;
      setDisciplines(fetchedDisciplines);

      const uniqueProfessors = Array.from(
        new Set(fetchedDisciplines.map((d) => d.professor)),
      ).filter(Boolean);

      setProfessors(uniqueProfessors);
    } catch (err) {
      console.error(
        "Erro ao carregar dados de disciplinas e professores:",
        err,
      );
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const token = localStorage.getItem("@CInDatabase:token");

      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));

          if (payload.role) {
            setUserRole(payload.role);
          }
        } catch (e) {
          console.error("Erro ao decodificar token JWT:", e);
        }
      }

      await Promise.all([
        fetchMaterials(false),
        fetchDisciplinesAndProfessors(),
      ]);
    };

    initializeDashboard();
  }, []);

  const handleToggleAdminView = (activeAdminMode: boolean) => {
    setIsAdminView(activeAdminMode);
    setShowOnlyFavorites(false);
    setIsEvaluatingView(false);
    setIsViewingReviews(false);
    fetchMaterials(activeAdminMode);
  };

  const handleApproveMaterial = async (id: string) => {
    try {
      await api.patch(`/materials/${id}/approve`);
      alert(
        "Material aprovado e publicado com sucesso no repositório público!",
      );
      fetchMaterials(true);
    } catch (err) {
      console.error(err);
      alert(
        "Não foi possível aprovar este material. Verifique suas credenciais.",
      );
    }
  };

  const handleViewMaterial = (materialId: string) => {
    const baseURL = api.defaults.baseURL || "";
    window.open(`${baseURL}/materials/view/${materialId}`, "_blank");
  };

  const handleDownloadMaterial = async (
    materialId: string,
    originalFilename: string,
  ) => {
    try {
      const response = await api.get(`/materials/download/${materialId}`, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] as
        | string
        | undefined;

      const blob = new Blob([response.data], {
        type: contentType || "application/octet-stream",
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", originalFilename);
      document.body.appendChild(link);

      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Erro ao efetuar o download do arquivo:", err);
      alert(
        "Não foi possível baixar este arquivo. Verifique se ele ainda está disponível.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("@CInDatabase:token");
    window.location.reload();
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline =
      selectedDiscipline === "TODAS" ||
      item.disciplineName === selectedDiscipline;
    const matchesProfessor =
      selectedProfessor === "TODOS" || item.professor === selectedProfessor;
    const matchesType = selectedType === "ALL" || item.type === selectedType;

    const matchesFavorites = !showOnlyFavorites || favorites.includes(item._id);

    return (
      matchesSearch &&
      matchesDiscipline &&
      matchesProfessor &&
      matchesType &&
      matchesFavorites
    );
  });

  return (
    <div className="dashboardContainer">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="miniLogo">CIn</div>
          <span className="sidebarBrand">DataBase</span>
        </div>

        <nav className="sidebarNav">
          <button
            className={`sidebarButton ${!isAdminView && !showOnlyFavorites && !isEvaluatingView && !isViewingReviews ? "activeSidebarButton" : ""}`}
            onClick={() => {
              setShowOnlyFavorites(false);
              setIsEvaluatingView(false);
              setIsViewingReviews(false);
              handleToggleAdminView(false);
            }}
          >
            <BookOpen size={20} />
            <span>Explorar</span>
          </button>

          <button
            className={`sidebarButton ${isEvaluatingView ? "activeSidebarButton" : ""}`}
            onClick={() => {
              setIsAdminView(false);
              setShowOnlyFavorites(false);
              setIsViewingReviews(false);
              setIsEvaluatingView(true);
            }}
          >
            <Star size={20} />
            <span>Avaliar Cadeira</span>
          </button>

          <button
            className={`sidebarButton ${isViewingReviews ? "activeSidebarButton" : ""}`}
            onClick={() => {
              setIsAdminView(false);
              setShowOnlyFavorites(false);
              setIsEvaluatingView(false);
              setIsViewingReviews(true);
            }}
          >
            <MessageSquare size={20} />
            <span>Ver Avaliações</span>
          </button>

          <button
            className={`sidebarButton ${showOnlyFavorites ? "activeSidebarButton" : ""}`}
            onClick={() => {
              setIsAdminView(false);
              setIsEvaluatingView(false);
              setIsViewingReviews(false);
              setShowOnlyFavorites(true);
            }}
          >
            <Bookmark size={20} />
            <span>Favoritos ({favorites.length})</span>
          </button>

          <button
            className="sidebarButton"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <PlusCircle size={20} />
            <span>Upar Material</span>
          </button>

          <button
            className="sidebarButton"
            onClick={() => setIsAddDisciplineModalOpen(true)}
          >
            <FolderPlus size={20} />
            <span>Adicionar Disciplina</span>
          </button>

          {userRole === "ADMIN" && (
            <button
              className={`sidebarButton ${isAdminView ? "activeAdminSidebarButton" : ""}`}
              onClick={() => handleToggleAdminView(true)}
            >
              <ShieldCheck size={20} />
              <span>Painel de Moderação</span>
            </button>
          )}
        </nav>

        <button className="logoutButton" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair da Conta</span>
        </button>
      </aside>

      <main className="mainContent">
        {isEvaluatingView ? (
          <EvaluateDisciplinePage onBack={() => setIsEvaluatingView(false)} />
        ) : isViewingReviews ? (
          <ViewReviewsPage onBack={() => setIsViewingReviews(false)} />
        ) : (
          <>
            <header className="contentHeader">
              <div>
                <h1 className="welcomeTitle">
                  {isAdminView
                    ? "Painel de Moderação"
                    : showOnlyFavorites
                      ? "Meus Favoritos"
                      : "Repositório Acadêmico"}
                </h1>
                <p className="welcomeSubtitle">
                  {isAdminView
                    ? "Aprovações pendentes antes de disponibilizar os arquivos para a comunidade do CIn."
                    : showOnlyFavorites
                      ? "Seus materiais acadêmicos salvos para rápido acesso."
                      : "Encontre provas, listas e materiais compartilhados por alunos do CIn."}
                </p>
              </div>
            </header>

            {!isAdminView && (
              <section className="filterSection">
                <div className="searchBarWrapper">
                  <Search size={20} className="searchIcon" />
                  <input
                    type="text"
                    placeholder="Pesquise por palavras-chave (ex: EE1, ponteiros, indução)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="searchInput"
                  />
                </div>

                <div className="filterControlsRow">
                  <div className="dropdownGroup">
                    <div className="selectWrapper">
                      <Filter size={16} className="selectIcon" />
                      <select
                        value={selectedDiscipline}
                        onChange={(e) => setSelectedDiscipline(e.target.value)}
                        className="selectInput"
                      >
                        <option value="TODAS">TODAS AS CADEIRAS</option>
                        {disciplines.map((disc) => (
                          <option key={disc._id} value={disc.name}>
                            {disc.name} ({disc.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="selectWrapper">
                      <SlidersHorizontal size={16} className="selectIcon" />
                      <select
                        value={selectedProfessor}
                        onChange={(e) => setSelectedProfessor(e.target.value)}
                        className="selectInput"
                      >
                        <option value="TODOS">TODOS OS DOCENTES</option>
                        {professors.map((prof) => (
                          <option key={prof} value={prof}>
                            {prof}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="typeTabs">
                    <button
                      onClick={() => setSelectedType("ALL")}
                      className={`tabButton ${selectedType === "ALL" ? "activeTabButton" : ""}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSelectedType("PROVA")}
                      className={`tabButton ${selectedType === "PROVA" ? "activeTabButton" : ""}`}
                    >
                      <FileText size={16} style={{ marginRight: 4 }} /> Provas
                    </button>
                    <button
                      onClick={() => setSelectedType("LISTA")}
                      className={`tabButton ${selectedType === "LISTA" ? "activeTabButton" : ""}`}
                    >
                      <FileText size={16} style={{ marginRight: 4 }} /> Listas
                    </button>
                    <button
                      onClick={() => setSelectedType("VIDEO")}
                      className={`tabButton ${selectedType === "VIDEO" ? "activeTabButton" : ""}`}
                    >
                      <Video size={16} style={{ marginRight: 4 }} />{" "}
                      Vídeos/Monitorias
                    </button>
                  </div>
                </div>
              </section>
            )}

            {loading ? (
              <div className="centeredState">
                Carregando banco de arquivos...
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="centeredState">
                {isAdminView
                  ? "Tudo limpo! Nenhum material aguardando aprovação por enquanto."
                  : showOnlyFavorites
                    ? "Você ainda não favoritou nenhum material. Clique na estrela dos arquivos para salvá-los aqui!"
                    : "Nenhum material encontrado com os filtros selecionados."}
              </div>
            ) : (
              <div className="cardsGrid">
                {filteredMaterials.map((material) => (
                  <div key={material._id} className="materialCard">
                    <div className="cardHeader">
                      <span
                        className={`typeBadge ${material.type.toLowerCase()}Badge`}
                      >
                        {material.type}
                      </span>

                      {!isAdminView && (
                        <button
                          onClick={() => toggleFavorite(material._id)}
                          className="cardFavoriteButton"
                        >
                          <Star
                            size={20}
                            fill={
                              favorites.includes(material._id)
                                ? "#f59e0b"
                                : "transparent"
                            }
                            color={
                              favorites.includes(material._id)
                                ? "#f59e0b"
                                : "#9ca3af"
                            }
                          />
                        </button>
                      )}
                    </div>

                    <h3 className="cardTitle">{material.title}</h3>
                    <p className="cardDescription">{material.description}</p>

                    <div className="cardFooter">
                      <div className="metaItem">
                        <strong>Cadeira:</strong> {material.disciplineName}
                      </div>
                      <div className="metaItem">
                        <strong>Docente:</strong> {material.professor}
                      </div>
                    </div>

                    {isAdminView ? (
                      <button
                        onClick={() => handleApproveMaterial(material._id)}
                        className="approveCardButton"
                      >
                        <Check size={16} style={{ marginRight: 6 }} />
                        Aprovar e Publicar
                      </button>
                    ) : (
                      <div
                        style={{ display: "flex", gap: "10px", width: "100%" }}
                      >
                        <button
                          onClick={() => handleViewMaterial(material._id)}
                          className="downloadCardButton"
                        >
                          Visualizar
                        </button>

                        <button
                          onClick={() =>
                            handleDownloadMaterial(
                              material._id,
                              material.filename,
                            )
                          }
                          className="downloadCardButton"
                          style={{ backgroundColor: "#e2e8f0" }}
                        >
                          <Download size={14} style={{ marginRight: 4 }} />
                          Baixar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => fetchMaterials(isAdminView)}
      />

      <AddDisciplineModal
        isOpen={isAddDisciplineModalOpen}
        onClose={() => setIsAddDisciplineModalOpen(false)}
        onSuccess={fetchDisciplinesAndProfessors}
      />
    </div>
  );
}


