<template>
  <footer class="app-footer">
    <div class="footer-shell">
      <div class="footer-brand">
        <div class="brand-mark">
          <span class="material-symbols-outlined">favorite</span>
        </div>
        <div>
          <p class="brand-name">Link&Plan</p>
          <p class="brand-copy">
            Planes con chispa, gente real y excusas cada vez mejores para salir de casa.
          </p>
        </div>
      </div>

      <div class="footer-links">
        <a href="/docs/politica-privacidad.pdf" target="_blank" download>
          <span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:middle">description</span>
          Política de privacidad
        </a>
        <a href="mailto:hola@linkandplan.social">soporte@linkandplan.social</a>
        <a href="mailto:colabs@linkandplan.social">colabs@linkandplan.social</a>
        <a href="https://instagram.com/linkandplan.social" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://tiktok.com/@linkandplan.social" target="_blank" rel="noreferrer">
          TikTok
        </a>
        <a href="https://x.com/linkandplanapp" target="_blank" rel="noreferrer">
          X / Twitter
        </a>
      </div>

      <div class="footer-meta">
        <p>Valencia, Espana</p>
        <p>Soporte de lunes a domingo, 10:00 a 22:00</p>
        <p>&copy; 2026 Link&amp;Plan. Todas las citas, quedadas y planes improvisados reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  margin-top: auto;
  padding: 2rem 1.25rem 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(244, 63, 94, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), #fff7f8);
  border-top: 1px solid rgba(244, 63, 94, 0.12);
}

.footer-shell {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.75rem;
  border: 1px solid rgba(244, 63, 94, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 1.5rem;
}

.footer-brand {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--primary-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.35rem;
}

.brand-copy,
.footer-meta p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.footer-links a {
  width: fit-content;
  color: var(--text);
  font-weight: 600;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary);
  transform: translateX(3px);
}

.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

@media (max-width: 900px) {
  .footer-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .app-footer {
    padding: 1.25rem 1rem;
  }

  .footer-shell {
    padding: 1.25rem;
    border-radius: 20px;
  }

  .brand-copy,
  .footer-meta p,
  .footer-links a {
    font-size: 0.9rem;
  }
}
</style>
