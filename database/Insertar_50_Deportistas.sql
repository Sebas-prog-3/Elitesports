SELECT dep.nombre AS deporte,
       COUNT(DISTINCT d.id_deportista) AS total
FROM elitesport.deportistas d
JOIN elitesport.usuarios u
  ON u.id_usuario = d.id_usuario
JOIN elitesport.equipo_deportista ed
  ON ed.id_deportista = d.id_deportista
JOIN elitesport.equipos e
  ON e.id_equipo = ed.id_equipo
JOIN elitesport.categorias c
  ON c.id_categoria = e.id_categoria
JOIN elitesport.deportes dep
  ON dep.id_deporte = c.id_deporte
WHERE u.nombre_usuario LIKE 'dep\_%' ESCAPE '\'
GROUP BY dep.nombre
ORDER BY dep.nombre;