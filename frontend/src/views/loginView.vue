<template>
    <main>
        <h1>Login</h1>
        <form id="login" @submit.prevent="Login">
            <label for="email">Correo electronico</label><br>
            <input v-model="form.email" type="email" name="email" id="email" placeholder="usuario@ejemplo.com" required><br>

            <label for="contrasenya">Contraseña</label><br>
            <input v-model="form.contrasena" type="password" name="pass" id="pass" placeholder="TuApodo123" required><br>
            <br>
            <button type="submit">Iniciar Sesión</button>

            <p>No tienes cuenta? <RouterLink to="/registro">Registrate</RouterLink></p>
        </form>
    </main>
</template>

<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    
    const router = useRouter();

    const form = ref({
        email:"",
        contrasena:""
    })

    async function Login() {
        try {
            const login = await axios.post('http://localhost:3000/api/login', form.value, { withCredentials: true })

            console.log(login);
            if(login.status === 200){
                if(login.data.user.direccion === null){
                    router.push('/ubicacion');
                }else{
                    router.push('/perfil');
                }
            }
            
        } catch (error) {
            console.error("Error en login:", error);
            if (error.response) {
                console.error("Respuesta del servidor:", error.response.data);
            }
            alert("Error al iniciar sesión. Comprueba la consola para más detalles.");
        }
    }
</script>