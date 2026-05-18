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
INSERT INTO planes (id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan)
WITH RECURSIVE dias AS (
  SELECT 1 AS dia
  UNION ALL
  SELECT dia + 1 FROM dias WHERE dia < 31
)
SELECT
  u.id,
  CASE u.id
    WHEN 1 THEN 1
    WHEN 2 THEN 19
    WHEN 3 THEN 6
    WHEN 4 THEN 26
    WHEN 5 THEN 3
    WHEN 6 THEN 29
    WHEN 7 THEN 2
    WHEN 8 THEN 8
    WHEN 9 THEN 38
    WHEN 10 THEN 35
    WHEN 11 THEN 15
    WHEN 12 THEN 27
  END AS id_interes,
  CASE u.id
    WHEN 1 THEN 'Ruta por La Pedriza'
    WHEN 2 THEN 'Brunch en Malasana'
    WHEN 3 THEN 'Padel en Chamartin'
    WHEN 4 THEN 'Tarde de museos en Barcelona'
    WHEN 5 THEN 'Ruta ciclista por Valencia'
    WHEN 6 THEN 'Taller de acuarela en Sevilla'
    WHEN 7 THEN 'Running al amanecer'
    WHEN 8 THEN 'Surf en Cadiz'
    WHEN 9 THEN 'Sesion de juegos de mesa'
    WHEN 10 THEN 'Escape Room en Barcelona'
    WHEN 11 THEN 'Cata de vinos en Logrono'
    WHEN 12 THEN 'Concierto y paseo por Madrid'
  END AS titulo,
  CASE u.id
    WHEN 1 THEN 'Salida desde el aparcamiento de Canto Cochino. Haremos una ruta por naturaleza y luego tomamos algo. Plan relajado y con buen ambiente.'
    WHEN 2 THEN 'Quedamos para desayunar tarde, charlar sin prisa y conocer gente maja. Ambiente tranquilo y mesa reservada.'
    WHEN 3 THEN 'Partido amistoso de padel con buen rollo. Nivel intermedio y ganas de echar unas risas.'
    WHEN 4 THEN 'Recorremos una expo y despues comentamos la visita con un cafe cerca del centro.'
    WHEN 5 THEN 'Salida en bici con ritmo comodo y parada para cafe a mitad del recorrido.'
    WHEN 6 THEN 'Sesion creativa para pintar, aprender tecnicas basicas y pasar una tarde agradable.'
    WHEN 7 THEN 'Entreno suave para arrancar el dia con energia y buena conversacion al terminar.'
    WHEN 8 THEN 'Quedada para surfear, practicar equilibrio y aprovechar el buen tiempo junto al mar.'
    WHEN 9 THEN 'Tarde de juegos y estrategia con gente nueva. Ideal para hablar y reirse un rato.'
    WHEN 10 THEN 'Plan divertido para resolver pistas en equipo y luego comentar la jugada tomando algo.'
    WHEN 11 THEN 'Cata informal con varios vinos y algo de picoteo para compartir impresiones.'
    WHEN 12 THEN 'Quedamos antes del concierto para conocernos y despues alargamos la noche con un paseo.'
  END AS descripcion,
  CASE u.id
    WHEN 1 THEN 8
    WHEN 2 THEN 6
    WHEN 3 THEN 4
    WHEN 4 THEN 8
    WHEN 5 THEN 10
    WHEN 6 THEN 12
    WHEN 7 THEN 8
    WHEN 8 THEN 6
    WHEN 9 THEN 6
    WHEN 10 THEN 5
    WHEN 11 THEN 8
    WHEN 12 THEN 7
  END AS max_asistentes,
  CASE u.id
    WHEN 1 THEN 40.72800000
    WHEN 2 THEN 40.43200000
    WHEN 3 THEN 40.45300000
    WHEN 4 THEN 41.38300000
    WHEN 5 THEN 39.32500000
    WHEN 6 THEN 37.38600000
    WHEN 7 THEN 36.72100000
    WHEN 8 THEN 36.52700000
    WHEN 9 THEN 40.41800000
    WHEN 10 THEN 41.39500000
    WHEN 11 THEN 42.46472000
    WHEN 12 THEN 40.41700000
  END AS lat,
  CASE u.id
    WHEN 1 THEN -3.89600000
    WHEN 2 THEN -3.70100000
    WHEN 3 THEN -3.68700000
    WHEN 4 THEN 2.16600000
    WHEN 5 THEN -0.35700000
    WHEN 6 THEN -5.99200000
    WHEN 7 THEN -4.42100000
    WHEN 8 THEN -6.28900000
    WHEN 9 THEN -3.69400000
    WHEN 10 THEN 2.16100000
    WHEN 11 THEN -2.44760000
    WHEN 12 THEN -3.70800000
  END AS lng,
  TIMESTAMP(
    DATE(CONCAT('2026-05-', LPAD(dias.dia, 2, '0'))),
    MAKETIME(
      8 + MOD(u.id + dias.dia, 13),
      MOD((u.id * 7 + dias.dia * 5), 4) * 15,
      0
    )
  ) AS fecha_plan
FROM usuarios u
CROSS JOIN dias
WHERE u.rol = 'usuario';

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
