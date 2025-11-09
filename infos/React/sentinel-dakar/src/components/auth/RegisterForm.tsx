import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo (2).png";
import { User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function RegisterForm({ showHeader = true }: { showHeader?: boolean }) {
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    prenom: "",
    nom: "",
  });
  const [show, setShow] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("first_name", formData.prenom);
    data.append("last_name", formData.nom);

    await register(data);
    const token = localStorage.getItem("token");
    if (token) navigate("/", { replace: true });

    setFormData({
      username: "",
      email: "",
      password: "",
      prenom: "",
      nom: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-6 md:p-8 bg-white rounded-2xl shadow-lg space-y-4 border border-border"
    >
      {showHeader && (
        <div className="flex flex-col items-center">
          <img src={logo} alt="Sentinel Dakar" className="h-16 w-16 rounded-2xl object-contain shadow-depth" />
          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-foreground">{t('auth.registerTitle')}</h2>
          <p className="text-sm text-muted-foreground">Sentinel Dakar</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input
        name="prenom"
        value={formData.prenom}
        onChange={handleChange}
        placeholder="Prénom"
            className="w-full border p-2 pl-9 rounded-lg"
      />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input
        name="nom"
        value={formData.nom}
        onChange={handleChange}
        placeholder="Nom"
            className="w-full border p-2 pl-9 rounded-lg"
      />
        </div>
      </div>
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
            placeholder={t('auth.usernameOrEmail') as string}
          className="w-full border p-2 pl-9 rounded-lg"
      />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
          className="w-full border p-2 pl-9 rounded-lg"
      />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input
        name="password"
          type={show ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
            placeholder={t('auth.password') as string}
          className="w-full border p-2 pl-9 rounded-lg"
      />
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={show} onChange={(e)=>setShow(e.target.checked)} />
        Afficher mon mot de passe
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-smooth"
      >
        {loading ? "..." : (t('auth.registerBtn') as string)}
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}


