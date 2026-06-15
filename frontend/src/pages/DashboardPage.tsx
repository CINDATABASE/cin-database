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
} from "lucide-react";
import api from "../services/api";

interface Material {
  _id: string;
  title: string;
  description: string;
  disciplineId: string;
  disciplineName: string;
  professor: string;
  type: "PROVA" | "LISTA" | "VIDEO";
  isApproved: boolean;
}

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("TODAS");
  const [selectedProfessor, setSelectedProfessor] = useState<string>("TODOS");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const [favorites, setFavorites] = useState<string[]>([]);

  const disciplinesMock = [
    "TODAS",
    "Infraestrutura de Redes",
    "Sistemas Digitais",
    "Programação 1",
    "Algoritmos",
  ];
  const professorsMock = [
    "TODOS",
    "Professor do CIn",
    "Patricia Tedesco",
    "Kelvin Lopes",
    "Paulo Borba",
  ];

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await api.get("/materials");
        setMaterials(response.data);
      } catch (err) {
        console.error("Erro ao buscar materiais do backend:", err);
        setMaterials([
          {
            _id: "mock-1",
            title: "Primeira Exercitação (EE1) - 2025.2 (Modo Offline)",
            description: "Questões resolvidas sobre roteamento IP e sub-redes.",
            disciplineId: "101",
            disciplineName: "Infraestrutura de Redes",
            professor: "Professor do CIn",
            type: "PROVA",
            isApproved: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

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

    return (
      matchesSearch && matchesDiscipline && matchesProfessor && matchesType
    );
  });

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.miniLogo}>CIn</div>
          <span style={styles.sidebarBrand}>DataBase</span>
        </div>

        <nav style={styles.sidebarNav}>
          <button
            style={{ ...styles.sidebarButton, ...styles.activeSidebarButton }}
          >
            <BookOpen size={20} />
            <span>Explorar</span>
          </button>

          <button
            style={styles.sidebarButton}
            onClick={() => alert("Abrir modal de Avaliação de Cadeira")}
          >
            <Star size={20} />
            <span>Avaliar Cadeira</span>
          </button>

          <button
            style={styles.sidebarButton}
            onClick={() => alert("Filtrar apenas favoritados")}
          >
            <Bookmark size={20} />
            <span>Favoritos ({favorites.length})</span>
          </button>

          <button
            style={styles.sidebarButton}
            onClick={() => alert("Abrir modal de Upload de Material")}
          >
            <PlusCircle size={20} />
            <span>Upar Material</span>
          </button>
        </nav>

        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair da Conta</span>
        </button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.contentHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>Repositório Acadêmico</h1>
            <p style={styles.welcomeSubtitle}>
              Encontre provas, listas e materiais compartilhados por alunos do
              CIn.
            </p>
          </div>
        </header>

        <section style={styles.filterSection}>
          <div style={styles.searchBarWrapper}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquise por palavras-chave (ex: EE1, ponteiros, indução)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterControlsRow}>
            <div style={styles.dropdownGroup}>
              <div style={styles.selectWrapper}>
                <Filter size={16} style={styles.selectIcon} />
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  style={styles.selectInput}
                >
                  {disciplinesMock.map((disc) => (
                    <option key={disc} value={disc}>
                      {disc}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.selectWrapper}>
                <SlidersHorizontal size={16} style={styles.selectIcon} />
                <select
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  style={styles.selectInput}
                >
                  {professorsMock.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.typeTabs}>
              <button
                onClick={() => setSelectedType("ALL")}
                style={{
                  ...styles.tabButton,
                  ...(selectedType === "ALL" ? styles.activeTabButton : {}),
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedType("PROVA")}
                style={{
                  ...styles.tabButton,
                  ...(selectedType === "PROVA" ? styles.activeTabButton : {}),
                }}
              >
                <FileText size={16} style={{ marginRight: 4 }} /> Provas
              </button>
              <button
                onClick={() => setSelectedType("LISTA")}
                style={{
                  ...styles.tabButton,
                  ...(selectedType === "LISTA" ? styles.activeTabButton : {}),
                }}
              >
                <FileText size={16} style={{ marginRight: 4 }} /> Listas
              </button>
              <button
                onClick={() => setSelectedType("VIDEO")}
                style={{
                  ...styles.tabButton,
                  ...(selectedType === "VIDEO" ? styles.activeTabButton : {}),
                }}
              >
                <Video size={16} style={{ marginRight: 4 }} /> Vídeos/Monitorias
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={styles.centeredState}>
            Carregando banco de arquivos...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div style={styles.centeredState}>
            Nenhum material encontrado com os filtros selecionados.
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredMaterials.map((material) => (
              <div key={material._id} style={styles.materialCard}>
                <div style={styles.cardHeader}>
                  <span
                    style={{
                      ...styles.typeBadge,
                      ...styles[material.type.toLowerCase() + "Badge"],
                    }}
                  >
                    {material.type}
                  </span>
                  <button
                    onClick={() => toggleFavorite(material._id)}
                    style={styles.cardFavoriteButton}
                  >
                    <Star
                      size={20}
                      fill={
                        favorites.includes(material._id)
                          ? "#f59e0b"
                          : "transparent"
                      }
                      color={
                        favorites.includes(material._id) ? "#f59e0b" : "#9ca3af"
                      }
                    />
                  </button>
                </div>

                <h3 style={styles.cardTitle}>{material.title}</h3>
                <p style={styles.cardDescription}>{material.description}</p>

                <div style={styles.cardFooter}>
                  <div style={styles.metaItem}>
                    <strong>Cadeira:</strong> {material.disciplineName}
                  </div>
                  <div style={styles.metaItem}>
                    <strong>Docente:</strong> {material.professor}
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(`Baixando/Visualizando arquivo ID: ${material._id}`)
                  }
                  style={styles.downloadCardButton}
                >
                  Visualizar Material
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const COLORS = {
  cinRed: "#9c1c1c",
  cinRedHover: "#7a1414",
  white: "#ffffff",
  grayBg: "#f8fafc",
  textDark: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
};

// 💡 Imagem 3: Tipagem estrita de CSSProperties para remover o erro de 'any' do ESLint
const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: COLORS.grayBg,
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: COLORS.white,
    borderRight: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "30px 20px",
    boxSizing: "border-box",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
  },
  miniLogo: {
    backgroundColor: COLORS.cinRed,
    color: COLORS.white,
    padding: "6px 10px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  sidebarBrand: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.textDark,
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sidebarButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "none",
    border: "none",
    borderRadius: "8px",
    color: COLORS.textMuted,
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  activeSidebarButton: {
    backgroundColor: "#fef2f2",
    color: COLORS.cinRed,
    fontWeight: "600",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "none",
    border: "none",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    marginTop: "auto",
  },
  mainContent: {
    padding: "40px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  contentHeader: {
    marginBottom: "30px",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.textDark,
    margin: "0 0 6px 0",
  },
  welcomeSubtitle: {
    fontSize: "15px",
    color: COLORS.textMuted,
    margin: 0,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "35px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  searchBarWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    color: COLORS.textMuted,
  },
  searchInput: {
    width: "100%",
    padding: "14px 14px 14px 48px",
    fontSize: "15px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
  },
  filterControlsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  dropdownGroup: {
    display: "flex",
    gap: "12px",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  selectIcon: {
    position: "absolute",
    left: "12px",
    color: COLORS.textMuted,
    pointerEvents: "none",
  },
  selectInput: {
    padding: "10px 16px 10px 36px",
    fontSize: "14px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    outline: "none",
    color: COLORS.textDark,
    cursor: "pointer",
  },
  typeTabs: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "8px",
    gap: "4px",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    background: "none",
    borderRadius: "6px",
    color: COLORS.textMuted,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  materialCard: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, boxShadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  typeBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  provaBadge: { backgroundColor: "#fee2e2", color: "#9c1c1c" },
  listaBadge: { backgroundColor: "#e0f2fe", color: "#0369a1" },
  videoBadge: { backgroundColor: "#fef3c7", color: "#b45309" },
  cardFavoriteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: COLORS.textDark,
    margin: "0 0 8px 0",
  },
  cardDescription: {
    fontSize: "14px",
    color: COLORS.textMuted,
    margin: "0 0 20px 0",
    lineHeight: "1.5",
  },
  cardFooter: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "14px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metaItem: {
    fontSize: "13px",
    color: COLORS.textDark,
  },
  downloadCardButton: {
    backgroundColor: "#f1f5f9",
    color: COLORS.textDark,
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    textAlign: "center",
  },
  centeredState: {
    textAlign: "center",
    padding: "60px",
    color: COLORS.textMuted,
    fontSize: "16px",
  },
};
