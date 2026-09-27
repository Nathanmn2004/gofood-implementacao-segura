import React, { useEffect, useState } from 'react';

const API_BASE = 'https://localhost:3000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(email, password) {
    setError('');

    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError('Credenciais inválidas.');
      return;
    }

    const data = await res.json();
    setUser(data.user);

    await checkAdminAccess();
  }

  async function checkAdminAccess() {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    const me = await res.json();
    setUser({ id: me.id, email: me.email });
    setIsAdmin(me.role === 'admin');
  }

  useEffect(() => {
    checkAdminAccess();
  }, []);

  function ProductComments({ comments }) {
    return (
      <div>
        {comments.map((comment) => (
          <div key={comment.id}>{comment.text}</div>
        ))}
      </div>
    );
  }

  return (
    <main>
      <h1>GoFood</h1>
      {error && <p role="alert">{error}</p>}
      {user ? <p>Usuário autenticado: {user.email}</p> : <p>Usuário não autenticado.</p>}
      {isAdmin && (
        <section>
          <h2>Painel administrativo</h2>
          <p>A autorização real das rotas permanece no servidor.</p>
        </section>
      )}
      <ProductComments comments={[{ id: 1, text: 'Comentários são renderizados como texto puro.' }]} />
    </main>
  );
}
