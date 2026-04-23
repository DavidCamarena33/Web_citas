<template>
  <main class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-icon">♥</span>
        <span class="logo-text">Link<strong>&Plan</strong></span>
      </div>

      <h1 class="auth-title">Crea tu cuenta</h1>
      <p class="auth-sub text-muted">Únete y empieza a descubrir planes</p>

      <form id="registro" @submit.prevent="Register" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre completo *</label>
            <input
              v-model="form.nombre"
              class="form-input"
              type="text"
              placeholder="Tu nombre"
              required
              maxlength="100"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de nacimiento *</label>
            <input
              v-model="form.edad"
              class="form-input"
              type="date"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Correo electrónico *</label>
          <input
            v-model="form.email"
            class="form-input"
            type="email"
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña *</label>
          <div class="input-password-wrap">
            <input
              v-model="form.contrasena"
              class="form-input"
              :type="showPass ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="pass-toggle"
              @click="showPass = !showPass"
            >
              {{ showPass ? "🙈" : "👁️" }}
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Género *</label>
            <select v-model="form.genero" class="form-select" required>
              <option value="" disabled>Seleccionar</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Orientación *</label>
            <select v-model="form.orientacion" class="form-select" required>
              <option value="" disabled>Seleccionar</option>
              <option value="hetero">Heterosexual</option>
              <option value="bi">Bisexual</option>
              <option value="homosexual">Homosexual</option>
            </select>
          </div>
        </div>

        <p v-if="errorMsg" class="auth-error">⚠️ {{ errorMsg }}</p>

        <button
          type="submit"
          class="btn btn-primary auth-submit"
          :disabled="loading"
        >
          {{ loading ? "Creando cuenta..." : "🚀 Crear Cuenta" }}
        </button>

        <p class="auth-link">
          ¿Ya tienes cuenta? <RouterLink to="/login">Inicia Sesión</RouterLink>
        </p>
      </form>
    </div>

    <div class="auth-bg">
      <div class="auth-bg-circle c1"></div>
      <div class="auth-bg-circle c2"></div>
      <div class="auth-bg-circle c3"></div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const showPass = ref(false);
const loading = ref(false);
const errorMsg = ref("");

const form = ref({
  nombre: "",
  email: "",
  edad: "",
  contrasena: "",
  genero: "",
  orientacion: "",
});

async function Register() {
  errorMsg.value = "";
  loading.value = true;
  try {
    await axios.post("http://localhost:3000/api/register", form.value);
    router.push("/login");
  } catch (error) {
    errorMsg.value = error?.response?.data?.message || "Error al registrarse";
  }
  loading.value = false;
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}
.auth-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.4s ease both;
}
.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
}
.logo-text strong {
  color: var(--primary);
}
.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}
.auth-sub {
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-password-wrap {
  position: relative;
}
.input-password-wrap .form-input {
  padding-right: 2.5rem;
}
.pass-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.auth-error {
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
}
.auth-submit {
  width: 100%;
  justify-content: center;
  padding: 0.8rem;
  font-size: 1rem;
}
.auth-link {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.auth-link a {
  color: var(--primary);
  font-weight: 700;
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.auth-bg-circle {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-soft);
}
.c1 {
  width: 350px;
  height: 350px;
  top: -120px;
  right: -120px;
}
.c2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -60px;
  background: rgba(33, 150, 243, 0.07);
}
.c3 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: -60px;
  background: rgba(233, 30, 99, 0.06);
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.25rem;
    border-radius: 1rem;
  }

  .auth-title {
    font-size: 1.4rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .c1 {
    width: 240px;
    height: 240px;
    top: -90px;
    right: -90px;
  }

  .c2 {
    width: 150px;
    height: 150px;
  }

  .c3 {
    width: 90px;
    height: 90px;
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: 1.25rem;
  }

  .auth-card {
    padding: 1.5rem;
  }
}
</style>
