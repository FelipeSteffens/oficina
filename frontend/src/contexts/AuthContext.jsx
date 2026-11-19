import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService.js';
import { TOKEN_KEY, USER_KEY } from '../services/api.js';

const AuthContext = createContext(null);

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function normalizeMe(me) {
  return {
    id: me.id,
    nome: me.nome,
    email: me.email,
    perfil: me.perfil,
    oficinaId: me.oficina_id ?? me.oficinaId ?? null,
    clienteId: me.cliente_id ?? me.clienteId ?? null,
    funcionarioId: me.funcionario_id ?? me.funcionarioId ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [ready, setReady] = useState(() => !localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setReady(true);
      return;
    }
    let cancelled = false;
    authService.me()
      .then((me) => {
        if (cancelled) return;
        const current = normalizeMe(me);
        localStorage.setItem(USER_KEY, JSON.stringify(current));
        setUser(current);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => !cancelled && setReady(true));
    return () => { cancelled = true; };
  }, []);

  function persistSession(session) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setUser(session.user);
    setReady(true);
  }

  async function login(email, senha) {
    const session = await authService.login(email, senha);
    persistSession(session);
    return session.user;
  }

  async function registerCliente(payload) {
    const session = await authService.registerCliente(payload);
    persistSession(session);
    return session.user;
  }

  async function registerOficina(payload) {
    const session = await authService.registerOficina(payload);
    persistSession(session);
    return session.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  function updateUser(patch) {
    setUser((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }

  function hasRole(...roles) {
    return Boolean(user && roles.includes(user.perfil));
  }

  const value = useMemo(() => ({
    user,
    ready,
    authenticated: Boolean(user),
    login,
    logout,
    registerCliente,
    registerOficina,
    updateUser,
    hasRole,
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return context;
}

export default AuthContext;
