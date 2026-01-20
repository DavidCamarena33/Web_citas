<template>
  <main>
    <h1>Registro de Usuario</h1>
    <form id="registro" @submit.prevent="Register">
      <label for="nombre">Nombre completo</label><br>
      <input v-model="form.nombre" type="text" id="nombre" placeholder="Tu nombre" required max="100"><br>

      <label for="email">Correo electrónico</label><br>
      <input v-model="form.email" type="email" id="email" placeholder="usuario@ejemplo.com" required><br>

      <label for="fecha_nacimiento">Fecha de nacimiento</label><br>
      <input v-model="form.edad" type="date" id="fecha_nacimiento" required><br>

      <label for="contrasenya">Contraseña</label><br>
      <input v-model="form.contrasena" type="password" id="pass" placeholder="Mínimo 8 caracteres" required><br>

      <label>Género</label><br>
      <select v-model="form.genero" required>
        <option disabled value="">Selecciona uno</option>
        <option value="hombre">Hombre</option>
        <option value="mujer">Mujer</option>
      </select><br>

      <label>Orientación</label><br>
      <select v-model="form.orientacion" required>
        <option disabled value="">Selecciona una</option>
        <option value="hetero">Heterosexual</option>
        <option value="bi">Bisexual</option>
        <option value="homosexual">Homosexual</option>
      </select><br>

      <br>
      <button type="submit">Crear Cuenta</button>

      <p>¿Ya tienes cuenta? <RouterLink to="/login">Inicia Sesión</RouterLink></p>
    </form>
  </main>
</template>

<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';

    const router = useRouter();

    const form = ref({
        nombre: '',
        email: '',
        edad: '',
        contrasena: '',
        genero: '',
        orientacion: ''
    });

    async function Register() {
        try {
            console.log(form.value)
            const registro = await axios.post('http://localhost:3000/api/register', form.value)

            form.value = {
                nombre: "",
                email: "",
                edad: "",
                contrasena: "",
                genero: "",
                orientacion: ""
            }
            router.push('/')
        } catch (error) {
            console.error("Error en login:", error);
            if (error.response) {
                console.error("Respuesta del servidor:", error.response.data);
            }
            alert("Error al registrarse");
        }
    }
</script>