import { useState } from "react";
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

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
    <div className="authContainer">
      <div className="authCard">
        <div className="authHeader">
          <div className="authLogoPlaceholder">CIn</div>
          <h2 className="authTitle">DataBase</h2>
          <p className="authSubtitle">
            {isLogin
              ? "Faça login com sua conta institucional"
              : "Crie sua conta institucional"}
          </p>
        </div>

        {error && <div className="authErrorAlert">{error}</div>}

        <form onSubmit={handleSubmit} className="authForm">
          <div className="authInputGroup">
            <label className="authLabel">E-mail do CIn</label>
            <div className="authInputWrapper">
              <Mail size={20} className="authInputIcon" />
              <input
                type="email"
                placeholder="usuario@cin.ufpe.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="authInput"
              />
            </div>
          </div>

          <div className="authInputGroup">
            <label className="authLabel">Senha</label>
            <div className="authInputWrapper">
              <Lock size={20} className="authInputIcon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="authInput"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="authEyeButton"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="authInputGroup">
              <label className="authLabel">Confirmar Senha</label>
              <div className="authInputWrapper">
                <Lock size={20} className="authInputIcon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="authInput"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="authSubmitButton">
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

        <div className="authToggleContainer">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="authToggleButton"
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
