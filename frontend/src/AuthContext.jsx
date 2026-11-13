import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthCtx = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let active = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const applySession = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const fd = new FormData();
    fd.append("username", email.trim().toLowerCase());
    fd.append("password", password);
    const { data } = await api.post("/auth/login", fd);
    return applySession(data);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return applySession(data);
  };

  const logout = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.post("/auth/logout").catch(() => {});
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);
