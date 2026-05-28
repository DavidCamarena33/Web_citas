-- ======================================
-- SEEDER - DATOS DE PRUEBA para Link&Plan
-- ======================================
-- Contrasena de todos los usuarios: password123
-- Hash bcrypt: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ======================================

USE citas_db;

-- ======================================
-- USUARIOS (12 usuarios de prueba + 1 admin)
-- ======================================
INSERT INTO usuarios (nombre, email, edad, contrasena, rol, genero, orientacion, descripcion, direccion, lat, lng) VALUES
('Alejandro Garcia',    'alex@example.com',    '1995-04-12', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'hetero',      'Amante del senderismo y la fotografia. Siempre buscando nuevas rutas por la sierra.',         'Calle Gran Via 10, Madrid',            40.41956000, -3.68829000),
('Lucia Martinez',      'lucia@example.com',   '1998-07-23', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'hetero',      'Me encanta el yoga y los brunchs de domingo. Busco planes tranquilos pero divertidos.',       'Paseo de Recoletos 5, Madrid',         40.42150000, -3.69100000),
('Pablo Torres',        'pablo@example.com',   '1993-11-03', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'bi',          'Aficionado al padel y los juegos de mesa. Fan de la cerveza artesanal.',                     'Calle Serrano 45, Madrid',             40.42900000, -3.68500000),
('Sofia Lopez',         'sofia@example.com',   '1997-02-14', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'homosexual',  'Disenadora grafica. Me apasionan los museos, el cine indie y la comida vegana.',              'Rambla de Catalunya 22, Barcelona',    41.39100000,  2.16200000),
('Carlos Ruiz',         'carlos@example.com',  '1990-08-30', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'hetero',      'Ciclista de fin de semana y amante del cafe de especialidad. Geek empedernido.',             'Calle Colon 8, Valencia',              39.46991000, -0.37628000),
('Elena Sanchez',       'elena@example.com',   '1999-05-18', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'hetero',      'Estudiante de Bellas Artes. Me gusta pintar, hacer senderismo y hacer amigos nuevos.',        'Avenida Constitucion 33, Sevilla',     37.38883000, -5.99429000),
('Miguel Fernandez',    'miguel@example.com',  '1994-12-07', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'hetero',      'Runner de madrugada y adicto al sushi. Busco companeros de entreno y foodlovers.',           'Calle Larios 2, Malaga',               36.72016000, -4.42034000),
('Andrea Gomez',        'andrea@example.com',  '1996-09-25', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'bi',          'Apasionada del surf y los viajes. Siempre con la mochila lista. Amante del yoga.',           'Calle Olas 7, Cadiz',                  36.52772000, -6.28876000),
('Javier Moreno',       'javier@example.com',  '1992-03-11', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'hetero',      'Ingeniero informatico y jugador de rol. Los viernes son para D&D, los sabados para escalar.', 'Paseo del Prado 1, Madrid',            40.41389000, -3.69194000),
('Marta Castro',        'marta@example.com',   '2000-01-19', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'hetero',      'Universitaria fan del anime, los escape rooms y el karaoke. Me encanta conocer gente!',       'Gran Via de les Corts 100, Barcelona', 41.38500000,  2.15300000),
('Daniel Jimenez',      'daniel@example.com',  '1991-06-22', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'hombre', 'homosexual',  'Chef aficionado y sommelier amateur. Organizo cenas tematicas y catas de vinos.',            'Calle Laurel 18, Logrono',             42.46472000, -2.44760000),
('Natalia Diaz',        'natalia@example.com', '1995-10-08', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', 'mujer',  'hetero',      'Periodista viajera. Me gusta el running, los conciertos en directo y los roadtrips.',        'Calle Fuencarral 60, Madrid',          40.42694000, -3.70028000),
('Admin LinkPlan',      'admin@linkplan.com',  '1990-01-01', '$2b$10$zAZZJ..J7vn6SXJKtzAWOOaGlFn6zLEwtjk2NJ2AGd1yiBxpLC7VS', 'admin',   'hombre', 'hetero',      'Usuario administrador de la plataforma.',                                                    'Calle Mayor 1, Madrid',                40.41680000, -3.70380000);

-- ======================================
-- FOTOS USUARIOS
-- Usamos picsum.photos con seeds fijos para consistencia
-- ======================================
INSERT INTO fotos_usuarios (id_usuario, url, orden) VALUES
-- Alejandro (id=1)
(1, 'https://picsum.photos/seed/alex1/400/500',   0),
(1, 'https://picsum.photos/seed/alex2/400/500',   1),
-- Lucia (id=2)
(2, 'https://picsum.photos/seed/lucia1/400/500',  0),
(2, 'https://picsum.photos/seed/lucia2/400/500',  1),
-- Pablo (id=3)
(3, 'https://picsum.photos/seed/pablo1/400/500',  0),
-- Sofia (id=4)
(4, 'https://picsum.photos/seed/sofia1/400/500',  0),
(4, 'https://picsum.photos/seed/sofia2/400/500',  1),
-- Carlos (id=5)
(5, 'https://picsum.photos/seed/carlos1/400/500', 0),
-- Elena (id=6)
(6, 'https://picsum.photos/seed/elena1/400/500',  0),
(6, 'https://picsum.photos/seed/elena2/400/500',  1),
-- Miguel (id=7)
(7, 'https://picsum.photos/seed/miguel1/400/500', 0),
-- Andrea (id=8)
(8, 'https://picsum.photos/seed/andrea1/400/500', 0),
(8, 'https://picsum.photos/seed/andrea2/400/500', 1),
-- Javier (id=9)
(9, 'https://picsum.photos/seed/javi1/400/500',   0),
-- Marta (id=10)
(10, 'https://picsum.photos/seed/marta1/400/500', 0),
(10, 'https://picsum.photos/seed/marta2/400/500', 1),
-- Daniel (id=11)
(11, 'https://picsum.photos/seed/daniel1/400/500',0),
-- Natalia (id=12)
(12, 'https://picsum.photos/seed/nati1/400/500',  0),
(12, 'https://picsum.photos/seed/nati2/400/500',  1);

-- ======================================
-- PLANES (1 plan por usuario y por cada dia de mayo de 2026)
-- IDs de intereses de referencia del init.sql:
--   1=Senderismo, 2=Running, 3=Ciclismo, 4=Yoga, 5=Futbol
--   6=Padel, 7=Escalada, 8=Surf, 9=Gym & Fitness, 10=Baile
--   13=Cafe especialidad, 14=Cerveza artesanal, 15=Vinos y Catas
--   17=Sushi, 18=Cocina Italiana, 19=Brunch, 22=Cocinar
--   24=Cine, 25=Teatro, 26=Museos y Experiencias, 27=Conciertos
--   31=Videojuegos, 32=Juegos de Mesa, 35=Escape Room
--   41=Viajes, 45=Playa, 47=Camping, 49=Roadtrips
--   50=Discotecas, 51=Karaoke
-- ======================================
INSERT INTO planes (id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan) VALUES

-- Plan 1: Senderismo por la Pedriza
(1, 1,  'Ruta por La Pedriza',
 'Salida desde el aparcamiento de Canto Cochino. Haremos la ruta circular al Yelmo, unos 12 km. Nivel medio. Llevad agua y botas de monte.',
 8, 40.72800000, -3.89600000, '2026-04-05 08:30:00'),

-- Plan 2: Brunch dominical
(2, 19, 'Brunch en Malasana',
 'Quedamos en Madre (Calle Padre Damian) para un brunch tranquilo de domingo. Reservo mesa para 4-5 personas. Sin prisa!',
 6, 40.43200000, -3.70100000, '2026-04-06 11:30:00'),

-- Plan 3: Padel
(3, 6,  'Padel en Chamartin',
 '2 pistas reservadas en Club Chamartin. Somos 2, buscamos 2 mas para completar. Nivel intermedio. Duracion: 1h30.',
 4, 40.45300000, -3.68700000, '2026-04-02 19:00:00'),

-- Plan 4: Museos Barcelona
(4, 26, 'Tarde en el MACBA y el CCCB',
 'Visita a las exposiciones temporales de ambos espacios. Despues tomamos algo en el Raval. Duracion aprox. 3 horas.',
 8, 41.38300000,  2.16600000, '2026-04-10 16:00:00'),

-- Plan 5: Ruta ciclista
(5, 3,  'Ruta ciclista por la Albufera',
 'Salida en bici desde Valencia centro hasta el lago de la Albufera. Unos 25 km de ida y vuelta por carril bici. Nivel facil-medio.',
 10, 39.32500000, -0.35700000, '2026-04-12 09:00:00'),

-- Plan 6: Taller de pintura
(6, 29, 'Taller de acuarela en Sevilla',
 'Taller para principiantes en el Barrio de Santa Cruz. Todo el material incluido (5EUR pp). Aprendemos tecnicas basicas de acuarela.',
 12, 37.38600000, -5.99200000, '2026-04-08 17:30:00'),

-- Plan 7: Running
(7, 2,  'Entreno running por el Parque del Retiro',
 'Salida de 10 km por el carril del Retiro. Ritmo 5:30/km aprox. Quedamos en la puerta de Alcala a las 7:15.',
 8, 40.41500000, -3.68400000, '2026-04-03 07:15:00'),

-- Plan 8: Surf
(8, 8,  'Surf en Conil de la Frontera',
 'Surf para principiantes y nivel medio. Alquiler de tablas en la playa de Los Bateles. Instructor incluido (20EUR pp). El mar esta genial!',
 6, 36.27400000, -6.08500000, '2026-04-19 10:00:00'),

-- Plan 9: Rol D&D
(9, 38, 'Sesion de D&D - Campana nueva',
 'Arrancamos campana nueva para gente que quiera jugar a D&D. DM con experiencia. Se valorara conocer las reglas basicas, pero no es obligatorio.',
 6, 40.41800000, -3.69400000, '2026-04-04 18:00:00'),

-- Plan 10: Escape Room
(10, 35, 'Escape Room en Barcelona',
 'Somos 3, buscamos 1-2 mas. Sala "El Laberinto del Tiempo" en Zero Escape (Carrer de Provenca). Nivel avanzado. Precio ~18EUR pp.',
 5, 41.39500000,  2.16100000, '2026-04-11 20:00:00'),

-- Plan 11: Cata vinos
(11, 15, 'Cata de vinos de La Rioja',
 'Cata comentada de 6 vinos D.O. Rioja con maridaje de quesos. Organizo yo en casa. Maximo 8 personas. Aportacion 15EUR pp.',
 8, 42.46472000, -2.44760000, '2026-04-25 20:30:00'),

-- Plan 12: Concierto
(12, 27, 'Concierto indie-pop en el Joy Eslava',
 'Vamos al concierto de Carino este sabado en Joy Eslava. Quedo antes en el bar de enfrente a las 22h. Entradas por separado.',
 7, 40.41700000, -3.70800000, '2026-04-05 22:00:00'), 

-- Plan 13: Yoga
(2, 4,  'Yoga al amanecer en el Retiro',
 'Sesion de yoga para dar la bienvenida al fin de semana. Lleva tu esterilla. Nivel: todos los niveles. Despues un desayuno en el kiosco.',
 10, 40.41500000, -3.68100000, '2026-04-06 08:00:00'),

-- Plan 14: Sushi
(7, 17, 'Sushi lovers - mesa para 4',
 'Mesa reservada en Kappou (Ctra. de las Palmas) en Malaga. Pedimos omakase para la mesa. Precio aprox. 30-40EUR pp.',
 4, 36.71200000, -4.43100000, '2026-04-18 21:00:00'),

-- Plan 15: Karaoke
(10, 51, 'Karaoke noche en Gracia',
 'Somos 2 y buscamos mas gente animada para karaoke en El Karaoke Bar (Carrer Verdi). Empezamos a las 22h y cerramos el local.',
 12, 41.40200000,  2.15700000, '2026-04-17 22:00:00');

-- ======================================
-- FOTOS PLANES
-- ======================================
INSERT INTO fotos_planes (id_plan, url, orden)
SELECT
  p.id,
  CONCAT(
    'https://picsum.photos/seed/',
    CASE p.id_usuario
      WHEN 1 THEN 'ruta'
      WHEN 2 THEN 'brunch'
      WHEN 3 THEN 'padel'
      WHEN 4 THEN 'museo'
      WHEN 5 THEN 'bici'
      WHEN 6 THEN 'pintura'
      WHEN 7 THEN 'run'
      WHEN 8 THEN 'surf'
      WHEN 9 THEN 'juegos'
      WHEN 10 THEN 'escape'
      WHEN 11 THEN 'vino'
      WHEN 12 THEN 'concierto'
    END,
    LPAD(DAY(p.fecha_plan), 2, '0'),
    '/600/400'
  ),
  0
FROM planes p
JOIN usuarios u ON u.id = p.id_usuario
WHERE u.rol = 'usuario'
  AND YEAR(p.fecha_plan) = 2026
  AND MONTH(p.fecha_plan) = 5;

-- ======================================
-- SOLICITUDES
-- ======================================
INSERT INTO solicitudes (id_plan, id_solicitante, mensaje, estado) VALUES
-- Plan 1 (Senderismo de Alejandro): Lucia pide unirse -> aceptada
(1,  2,  'Me encanta La Pedriza! ?Puedo apuntarme? Tengo buen nivel de montana.', 'aceptada'),
-- Plan 1: Pablo pide unirse -> pendiente
(1,  3,  'Llevo meses queriendo hacer esa ruta. ?Queda algun hueco?', 'pendiente'),
-- Plan 2 (Brunch de Lucia): Carlos pide unirse -> aceptada
(2,  5,  'Ese local esta buenisimo! Me apunto sin dudarlo.', 'aceptada'),
-- Plan 2: Elena pide unirse -> pendiente
(2,  6,  'Llevo toda la semana con ganas de un buen brunch. ?Quedan sitios?', 'pendiente'),
-- Plan 3 (Padel de Pablo): Alejandro pide -> aceptada
(3,  1,  'Me apunto al padel. Nivel medio-alto. ?A que pista vamos?', 'aceptada'),
-- Plan 3: Natalia pide -> pendiente
(3,  12, 'Me gustaria apuntarme. Hace tiempo que no juego pero me defiendo bien.', 'pendiente'),
-- Plan 7 (Running de Miguel): Natalia pide -> aceptada
(7,  12, 'Me apunto! Corro habitualmente ese ritmo. ?Quedamos 5 min antes?', 'aceptada'),
-- Plan 9 (Juegos de mesa de Javier): Marta pide -> aceptada
(9,  10, 'Me apetece mucho una tarde de juegos. Hace tiempo que no me junto con gente nueva para jugar.', 'aceptada'),
-- Plan 9 (Juegos de mesa de Javier): Carlos pide -> pendiente
(9,  5,  '?Hay sitio para alguien competitivo pero simpatico? Llevo un par de juegos para sumar al plan.', 'pendiente'),
-- Plan 10 (Escape Room de Marta): Sofia pide -> rechazada
(10, 4,  'Me interesan los escape rooms. ?Queda algun hueco?', 'rechazada'),
-- Plan 2 (Brunch de Lucia): Andrea pide -> pendiente
(2, 8,  'Me apetece mucho ese brunch. Si queda hueco, me sumo encantada.', 'pendiente'),
-- Plan 10 (Escape Room de Marta): Andrea pide -> aceptada
(10, 8,  'Ese escape room me llama muchisimo. Si os falta una persona, contad conmigo.', 'aceptada');

-- ======================================
-- MENSAJES (en solicitudes aceptadas)
-- ======================================
INSERT INTO mensajes (id_solicitud, id_emisor, mensaje) VALUES
-- Solicitud 1 (Lucia -> Plan Senderismo de Alejandro)
(1, 1,  'Hola Lucia! Genial que te apuntes. Quedamos a las 8:15 en el aparcamiento de Canto Cochino.'),
(1, 2,  'Perfecto. ?Hay que llevar algo en especial ademas del agua?'),
(1, 1,  'Lleva bocata para el almuerzo y proteccion solar. La ruta dura unas 4 horas.'),
-- Solicitud 3 (Carlos -> Plan Brunch de Lucia)
(3, 2,  'Hola Carlos! Me alegra que te apuntes. Tengo mesa reservada a las 11:30.'),
(3, 5,  'Perfecto. ?Hay aparcamiento cerca o mejor ir en metro?'),
(3, 2,  'Mejor metro, linea 10, parada Alonso Martinez. Nos vemos alli!'),
-- Solicitud 5 (Alejandro -> Plan Padel de Pablo)
(5, 3,  'Genial Alejandro! Pista 3. Lleva raqueta si tienes, y si no te presto yo una.'),
(5, 1,  'Tengo mi propia raqueta. ?A que nombre esta la reserva?'),
(5, 3,  'A nombre de Pablo Torres. Club Chamartin, entrada principal.'),
-- Solicitud 7 (Natalia -> Running de Miguel)
(7, 7,  'Hola Natalia! Perfecto. Quedamos 5 min antes en la estatua de Velazquez.'),
(7, 12, 'Anotado. ?Hacemos el carril interior o exterior?'),
(7, 7,  'Interior, es menos concurrido por las mananas.'),
-- Solicitud 8 (Marta -> Juegos de mesa de Javier)
(8, 9,  'Hola Marta! Plan facil, ven con ganas de jugar y pasarlo bien.'),
(8, 10, 'Perfecto. ?Llevo algun juego o preferis usar los que ya teneis?'),
(8, 9,  'Trae alguno si te apetece, pero con lo que tengo vamos sobrados.'),
-- Solicitud 12 (Andrea -> Escape Room de Marta)
(12, 10, 'Perfecto Andrea! Ya somos el equipo completo para la sesion de la tarde.'),
(12, 8,  'Genial. Llego con tiempo y os espero en la puerta para entrar juntos.'),
(12, 10, 'Planazo. Luego comentamos las pruebas con algo de beber cerca.');

-- ======================================
-- NOTIFICACIONES
-- ======================================
INSERT INTO notificaciones (id_usuario, id_solicitud, tipo) VALUES
-- Alejandro recibe que Lucia solicita unirse a su plan de senderismo
(1, 1, 'recibida'),
-- Lucia recibe que fue aceptada
(2, 1, 'aceptada'),
-- Alejandro recibe solicitud de Pablo
(1, 2, 'recibida'),
-- Lucia recibe solicitud de Carlos en su brunch
(2, 3, 'recibida'),
-- Carlos recibe que fue aceptado al brunch
(5, 3, 'aceptada'),
-- Lucia recibe solicitud de Elena
(2, 4, 'recibida'),
-- Pablo recibe solicitud de Alejandro para padel
(3, 5, 'recibida'),
-- Alejandro recibe que fue aceptado al padel
(1, 5, 'aceptada'),
-- Pablo recibe solicitud de Natalia
(3, 6, 'recibida'),
-- Miguel recibe solicitud de Natalia para running
(7, 7, 'recibida'),
-- Natalia recibe que fue aceptada al running
(12, 7, 'aceptada'),
-- Javier recibe solicitud de Marta para juegos de mesa
(9, 8, 'recibida'),
-- Marta recibe que fue aceptada a juegos de mesa
(10, 8, 'aceptada'),
-- Javier recibe solicitud de Carlos para juegos de mesa
(9, 9, 'recibida'),
-- Sofia recibe que fue rechazada al escape room
(4, 10, 'rechazada'),
-- Lucia recibe solicitud de Andrea para brunch
(2, 11, 'recibida'),
-- Marta recibe solicitud de Andrea para su escape room
(10, 12, 'recibida'),
-- Andrea recibe que fue aceptada al escape room
(8, 12, 'aceptada');

-- ======================================
-- FAVORITOS
-- ======================================
INSERT INTO favoritos (id_usuario, id_plan) VALUES
(1, 2),
(1, 7),
(2, 1),
(3, 9),
(4, 10),
(8, 10),
(12, 3);

-- ======================================
-- PLANES ADICIONALES DE PRUEBA
-- ======================================

-- Plan A: Pareja - Pablo invita, Andrea acepta, con conversacion
INSERT INTO planes (id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan) VALUES
(3, 18, 'Cena italiana en Malasana', 'Cena tranquila en una trattoria autentica. Busco a alguien con quien compartir buena conversacion y mejor pasta.', 2, 40.42700000, -3.70200000, '2026-05-25 20:30:00');

-- Plan B: Para probar flujo de reserva - Andrea crea plan en Madrid con huecos
INSERT INTO planes (id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan) VALUES
(8, 26, 'Exposicion inmersiva en Matadero', 'Nueva expo interactiva en Matadero Madrid. Ideal para descubrir arte contemporaneo y charlar despues con un cafe.', 6, 40.39200000, -3.69700000, '2026-05-28 17:00:00');

-- Fotos para los nuevos planes
INSERT INTO fotos_planes (id_plan, url, orden) VALUES
(373, 'https://picsum.photos/seed/cena372/600/400', 0),
(374, 'https://picsum.photos/seed/expo373/600/400', 0);

-- Andrea solicita unirse al plan de cena de Pablo -> aceptada
INSERT INTO solicitudes (id_plan, id_solicitante, mensaje, estado) VALUES
(373, 8, 'Me encanta la pasta! Justo andaba buscando un plan tranquilo para esa noche. Me apunto seguro.', 'aceptada');

-- Conversacion entre Pablo y Andrea sobre la cena
INSERT INTO mensajes (id_solicitud, id_emisor, mensaje) VALUES
(13, 3, 'Hola Andrea! Me alegra que te hayas apuntado. Tengo reserva en Da Nicola a las 20:30.'),
(13, 8, 'Perfecto! Me encanta la comida italiana. Voy vestida informal o mejor arreglada?'),
(13, 3, 'Es un sitio con encanto pero sin etiqueta. Informal pero mona :)');

-- Notificaciones
INSERT INTO notificaciones (id_usuario, id_solicitud, tipo) VALUES
(3, 13, 'recibida'),
(8, 13, 'aceptada');
