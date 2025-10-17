import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo (2).png";

export default function RegisterForm({ showHeader = true }: { showHeader?: boolean }) {
  const { register, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    prenom: "",
    nom: "",
  });

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
          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-foreground">Créer un compte</h2>
          <p className="text-sm text-muted-foreground">Rejoignez Sentinel Dakar</p>
        </div>
      )}
      <input
        name="prenom"
        value={formData.prenom}
        onChange={handleChange}
        placeholder="Prénom"
        className="w-full border p-2 rounded-lg"
      />
      <input
        name="nom"
        value={formData.nom}
        onChange={handleChange}
        placeholder="Nom"
        className="w-full border p-2 rounded-lg"
      />
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Nom d’utilisateur"
        className="w-full border p-2 rounded-lg"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full border p-2 rounded-lg"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Mot de passe"
        className="w-full border p-2 rounded-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-smooth"
      >
        {loading ? "Enregistrement..." : "S’inscrire"}
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}


