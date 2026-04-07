<template>
  <nav class="navbar glass-header">
    <div class="navbar-inner px-6 lg-px-20">
      
      <!-- Group Left: Logo & Nav Links -->
      <div class="navbar-left">
        <!-- Logo -->
        <RouterLink to="/discover" class="navbar-logo">
          <div class="logo-box shadow-primary">
            <span class="material-symbols-outlined">favorite</span>
          </div>
          <h1 class="logo-text">Link&amp;Plan</h1>
        </RouterLink>

        <!-- Nav Links (desktop) -->
        <div class="navbar-links hidden-mobile">
          <RouterLink to="/discover" class="nav-link" active-class="nav-link-active">
            Discover
          </RouterLink>
          <RouterLink to="/mis-planes" class="nav-link" active-class="nav-link-active">
            My Plans
          </RouterLink>
          <RouterLink to="/mensajes" class="nav-link" active-class="nav-link-active">
            Messages
          </RouterLink>
          <RouterLink to="/comunidades" class="nav-link" active-class="nav-link-active">
            Communities
          </RouterLink>
        </div>
      </div>

      <!-- Group Right: Search, Notifications, Avatar -->
      <div class="navbar-right">
        <!-- Search Bar (hidden on mobile) -->
        <div class="navbar-search hidden-mobile">
          <span class="search-icon material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Find activities..." 
            class="search-input"
          />
        </div>

        <button class="nav-btn-icon shadow-sm hidden-mobile">
          <span class="material-symbols-outlined">notifications</span>
        </button>

        <!-- Avatar -->
        <RouterLink to="/perfil">
          <div class="avatar navbar-avatar shadow-sm border-white"></div>
        </RouterLink>
        
        <!-- Mobile menu toggle -->
        <button class="hamburger-btn mobile-only" @click="$emit('toggle-drawer')">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/authStore";

defineEmits(["toggle-drawer", "notification"]);

const auth = useAuthStore();
const avatarUrl = computed(() => null); // will come from perfil data
const initials = computed(() => {
  const name = auth.user?.nombre || "";
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
});
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  border-bottom: 1px solid rgba(244, 63, 94, 0.1); /* primary/10 */
  box-shadow: none;
}
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg-px-20 { max-width: 1300px; margin: 0 auto; }
@media (min-width: 1024px) {
  .lg-px-20 { padding-left: 5rem; padding-right: 5rem; }
}

.navbar-inner {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* LEFT SIDE */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
}
.logo-box {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--primary); color: #fff;
}
.shadow-primary {
  box-shadow: 0 4px 14px 0 rgba(244, 63, 94, 0.39);
}
.logo-text {
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.nav-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: color var(--transition);
  text-decoration: none;
}
.nav-link:hover {
  color: var(--primary);
}
.nav-link-active {
  color: var(--primary);
}

/* RIGHT SIDE */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
/* SEARCH */
.navbar-search {
  position: relative;
  width: 256px;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8; /* slate-400 */
}
.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: rgba(244, 63, 94, 0.05); /* primary/5 */
  border: none;
  border-radius: var(--radius-pill);
  color: var(--text);
  font-size: 0.875rem;
  transition: all var(--transition);
}
.search-input:focus {
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
}
.search-input::placeholder {
  color: #94a3b8;
}

.nav-btn-icon {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: #fff; border: 1px solid var(--card-border);
  color: var(--text-muted); cursor: pointer;
}
.nav-btn-icon:hover { color: var(--primary); }

/* AVATAR */

.navbar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(244, 63, 94, 0.2);
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgfth6u_0d3-W-XESicQ_idDCOqXEA1eBOG_D5myo900SMUOOdWtROCb-DzuZCKN8nHzrfWP8jHGNPRoendRUHNw-g0_2ZZL0DgynghxRf2qOcM3jXJnCBW5oL_4nFUfNS7u3rp-fLe_0-sTSqaaF7OjZ-UvXsXx8rd2QOOjKo7UgUi6taPLUXgO-cztHyaeIzJ5A8zdVW7rR1OpskXIHGVRj7PC_RK_QBuM9fwbmH3ISUL0gBIMxUhKJnUyBtcHnIe6e1U5dvFFs');
  background-size: cover;
  background-position: center;
}

.mobile-only {
  display: none;
}
.hamburger-btn {
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 1023px) {
  .hidden-mobile {
    display: none !important;
  }
  .mobile-only {
    display: block;
  }
}
</style>
