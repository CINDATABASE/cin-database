import React, { useState } from "react";
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (emailTarget: string): boolean => {
    return emailTarget.toLowerCase().endsWith("@cin.ufpe.br");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Apenas e-mails terminados em @cin.ufpe.br são permitidos.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", { email, password });
        const { access_token } = response.data;
        localStorage.setItem("@CInDatabase:token", access_token);
        navigate("/dashboard");
      } else {
        const usernamePrefix = email.split("@")[0];
        const generatedName =
          usernamePrefix.charAt(0).toUpperCase() + usernamePrefix.slice(1);
        const generatedMatricula = `mat-${Date.now().toString().slice(-6)}`;

        await api.post("/users/register", {
          name: generatedName,
          email: email,
          matricula: generatedMatricula,
          password: password,
        });

        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const backendMessage = (
        err as { response?: { data?: { message?: string | string[] } } }
      ).response?.data?.message;

      const parsedMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage;

      setError(parsedMessage || "Ocorreu um erro ao processar a requisição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoPlaceholder}>CIn</div>
          <h2 style={styles.title}>DataBase</h2>
          <p style={styles.subtitle}>
            {isLogin
              ? "Faça login com sua conta institucional"
              : "Crie sua conta institucional"}
          </p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail do CIn</label>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="usuario@cin.ufpe.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar Senha</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? (
              "Carregando..."
            ) : isLogin ? (
              <>
                <LogIn size={18} style={{ marginRight: 8 }} /> Entrar
              </>
            ) : (
              <>
                <UserPlus size={18} style={{ marginRight: 8 }} /> Cadastrar
              </>
            )}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={styles.toggleButton}
          >
            {isLogin
              ? "Não tem uma conta? Cadastre-se"
              : "Já possui uma conta? Entre aqui"}
          </button>
        </div>
      </div>
    </div>
  );
}

const COLORS = {
  cinRed: "#9c1c1c",
  cinRedHover: "#7a1414",
  white: "#ffffff",
  grayBg: "#f4f5f7",
  textDark: "#1a1a1a",
  textMuted: "#666666",
  border: "#e1e4e8",
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: COLORS.grayBg,
    fontFamily: "Segoe UI, Roboto, Helvetica Neue, sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
    padding: "40px 30px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logoPlaceholder: {
    backgroundColor: COLORS.cinRed,
    color: COLORS.white,
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 auto 12px auto",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: COLORS.textDark,
    margin: "0 0 5px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: COLORS.textMuted,
    margin: 0,
  },
  errorAlert: {
    backgroundColor: "#ffebe9",
    color: COLORS.cinRed,
    border: `1px solid rgba(156, 28, 28, 0.2)`,
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.textDark,
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: COLORS.textMuted,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    fontSize: "15px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: COLORS.textMuted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  submitButton: {
    backgroundColor: COLORS.cinRed,
    color: COLORS.white,
    padding: "14px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s",
    marginTop: "10px",
  },
  toggleContainer: {
    textAlign: "center",
    marginTop: "25px",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "20px",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: COLORS.cinRed,
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
