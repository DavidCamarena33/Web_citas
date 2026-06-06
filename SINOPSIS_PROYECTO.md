# Sinopsis del proyecto Link&Plan

## Descripcion general

Link&Plan es una aplicacion web pensada para conectar personas a traves de planes, actividades e intereses en comun. A diferencia de una aplicacion de citas tradicional, el proyecto se centra en que los usuarios puedan crear, descubrir y unirse a planes reales, fomentando encuentros mas naturales y organizados.

La idea principal es que una persona pueda publicar una actividad, como hacer senderismo, ir a tomar cafe, asistir a un concierto o jugar a juegos de mesa, y que otros usuarios interesados puedan solicitar participar en ese plan.

## Objetivo del proyecto

El objetivo del proyecto es crear una plataforma social donde los usuarios puedan conocer gente mediante experiencias compartidas. Para ello, la aplicacion permite gestionar perfiles, ubicaciones, planes, solicitudes, mensajes, favoritos y valoraciones.

El proyecto esta desarrollado como una aplicacion completa, con una parte visual para el usuario, una API para gestionar los datos y una base de datos donde se guarda toda la informacion.

## Funcionamiento principal

El usuario empieza registrandose con sus datos personales basicos, como nombre, correo, fecha de nacimiento, genero y orientacion. Despues puede iniciar sesion y completar su ubicacion para que la aplicacion pueda mostrarle planes cercanos.

Una vez dentro, el usuario puede explorar planes desde la pantalla principal. Los planes se muestran en forma de listado y tambien sobre un mapa, lo que facilita encontrar actividades cercanas. Ademas, se pueden aplicar filtros por categoria, distancia, modalidad, fecha o favoritos.

Si un usuario encuentra un plan que le interesa, puede enviar una solicitud para unirse. El creador del plan recibe esa solicitud y puede aceptarla o rechazarla. Cuando una solicitud es aceptada, los usuarios pueden comunicarse mediante el sistema de mensajes de la aplicacion.

## Modulos principales

### Usuarios

El sistema permite registrar usuarios, iniciar sesion, cerrar sesion, comprobar si la sesion sigue activa y consultar o editar el perfil. Cada usuario puede tener descripcion, ubicacion, foto principal y galeria de fotos.

### Planes

Los planes son el elemento central de la aplicacion. Cada plan tiene titulo, descripcion, categoria o interes, fecha, ubicacion, capacidad maxima y fotos. Los usuarios pueden crear planes, ver el detalle de cada uno y consultar los planes disponibles.

### Solicitudes

Las solicitudes permiten controlar quien puede unirse a un plan. Un usuario envia una solicitud y el creador del plan decide si la acepta o la rechaza. Esto ayuda a mantener un minimo de organizacion y seguridad dentro de la plataforma.

### Mensajes

El sistema de mensajes permite que los usuarios se comuniquen dentro de la aplicacion. Las conversaciones estan relacionadas con los planes y aparecen cuando existe una relacion entre usuarios a traves de una solicitud aceptada.

### Favoritos

Los usuarios pueden marcar planes como favoritos para guardarlos y consultarlos facilmente mas adelante.

### Notificaciones

Las notificaciones informan al usuario sobre eventos importantes, como solicitudes recibidas o cambios en el estado de sus solicitudes.

### Valoraciones

Cuando un plan ya ha finalizado, los usuarios que participaron pueden valorarlo. Esto permite recoger opiniones sobre la experiencia y mostrar una media de valoraciones.

## Estructura tecnica del proyecto

El proyecto esta dividido en tres partes principales:

- Frontend: es la parte visual de la aplicacion. Esta desarrollada con Vue, Vite, Pinia, Vue Router, Axios y Leaflet para los mapas.
- Backend: es la API que recibe las peticiones del frontend. Esta desarrollada con Node.js y Express.
- Base de datos: usa MySQL para guardar usuarios, planes, fotos, solicitudes, mensajes, favoritos, notificaciones y valoraciones.

Tambien incluye Docker para levantar la base de datos de forma mas sencilla durante el desarrollo.

## Pantallas principales

La aplicacion incluye varias pantallas importantes:

- Login y registro de usuarios.
- Pantalla para configurar la ubicacion.
- Vista de descubrimiento de planes.
- Vista de detalle de un plan.
- Pantalla para crear un nuevo plan.
- Perfil de usuario.
- Seccion de mis planes.
- Mensajeria.
- Comunidades.

## Base de datos

La base de datos esta pensada para cubrir todas las funciones principales de la aplicacion. Incluye tablas para usuarios, intereses, planes, fotos de usuarios, fotos de planes, solicitudes, mensajes, notificaciones, favoritos y valoraciones.

Cada tabla se relaciona con las demas mediante claves externas. Por ejemplo, un plan pertenece a un usuario, una solicitud pertenece a un plan y a un usuario, y los mensajes estan asociados a una solicitud.

## Conclusion

Link&Plan es una plataforma social basada en actividades. Su proposito es ayudar a que las personas se conozcan de una manera mas natural, compartiendo planes e intereses reales.

El proyecto combina registro de usuarios, perfiles, geolocalizacion, creacion de planes, solicitudes de participacion, mensajeria, favoritos y valoraciones. En conjunto, ofrece una experiencia bastante completa para organizar actividades y conectar personas a traves de ellas.
