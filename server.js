const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;
const ANIO_MINIMO = 2020;
const ANIO_MAXIMO = 2030;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "TU_CLAVE",
  database: "gestion_matriculas"
});

conexion.connect((error) => {
  if (error) {
    console.log("Error de conexion a MySQL:", error);
    return;
  }

  console.log("Conexion exitosa a MySQL");
});

function validarMatricula(datos) {
  if (
    !datos.nombre ||
    !datos.apellido ||
    !datos.rut ||
    !datos.correo ||
    !datos.carrera ||
    !datos.anio_academico ||
    !datos.jornada ||
    !datos.estado_matricula
  ) {
    return "Todos los campos son obligatorios.";
  }

  if (!datos.correo.includes("@")) {
    return "Debe ingresar un correo valido.";
  }

  if (datos.anio_academico < ANIO_MINIMO || datos.anio_academico > ANIO_MAXIMO) {
    return `El anio academico debe estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`;
  }

  return "";
}

app.post("/matriculas", (req, res) => {
  const errorValidacion = validarMatricula(req.body);

  if (errorValidacion) {
    res.status(400).json({ mensaje: errorValidacion });
    return;
  }

  const {
    nombre,
    apellido,
    rut,
    correo,
    carrera,
    anio_academico,
    jornada,
    estado_matricula
  } = req.body;

  conexion.query("SELECT id FROM carreras WHERE nombre = ?", [carrera], (errorCarrera, carreras) => {
    if (errorCarrera || carreras.length === 0) {
      res.status(500).json({ mensaje: "Error al obtener la carrera" });
      return;
    }

    const carreraId = carreras[0].id;
    const sqlEstudiante = `
      INSERT INTO estudiantes (nombre, apellido, rut, correo)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      nombre = VALUES(nombre),
      apellido = VALUES(apellido),
      correo = VALUES(correo)
    `;

    conexion.query(sqlEstudiante, [nombre, apellido, rut, correo], (errorEstudiante) => {
      if (errorEstudiante) {
        res.status(500).json({ mensaje: "Error al guardar el estudiante" });
        return;
      }

      conexion.query("SELECT id FROM estudiantes WHERE rut = ?", [rut], (errorRut, estudiantes) => {
        if (errorRut || estudiantes.length === 0) {
          res.status(500).json({ mensaje: "Error al obtener el estudiante" });
          return;
        }

        const estudianteId = estudiantes[0].id;
        const sqlMatricula = `
          INSERT INTO matriculas
          (estudiante_id, carrera_id, anio_academico, jornada, estado_matricula)
          VALUES (?, ?, ?, ?, ?)
        `;

        conexion.query(
          sqlMatricula,
          [estudianteId, carreraId, anio_academico, jornada, estado_matricula],
          (errorMatricula) => {
            if (errorMatricula) {
              res.status(500).json({ mensaje: "Error al guardar la matricula" });
              return;
            }

            res.json({ mensaje: "Matricula guardada correctamente" });
          }
        );
      });
    });
  });
});

app.put("/matriculas/:id", (req, res) => {
  const errorValidacion = validarMatricula(req.body);

  if (errorValidacion) {
    res.status(400).json({ mensaje: errorValidacion });
    return;
  }

  const {
    nombre,
    apellido,
    rut,
    correo,
    carrera,
    anio_academico,
    jornada,
    estado_matricula
  } = req.body;

  conexion.query("SELECT id FROM carreras WHERE nombre = ?", [carrera], (errorCarrera, carreras) => {
    if (errorCarrera || carreras.length === 0) {
      res.status(500).json({ mensaje: "Error al obtener la carrera" });
      return;
    }

    conexion.query(
      "SELECT estudiante_id FROM matriculas WHERE id = ?",
      [req.params.id],
      (errorBusqueda, matriculas) => {
        if (errorBusqueda || matriculas.length === 0) {
          res.status(404).json({ mensaje: "Matricula no encontrada" });
          return;
        }

        const carreraId = carreras[0].id;
        const estudianteId = matriculas[0].estudiante_id;
        const sqlEstudiante = `
          UPDATE estudiantes
          SET nombre = ?, apellido = ?, rut = ?, correo = ?
          WHERE id = ?
        `;

        conexion.query(
          sqlEstudiante,
          [nombre, apellido, rut, correo, estudianteId],
          (errorEstudiante) => {
            if (errorEstudiante) {
              res.status(500).json({ mensaje: "Error al actualizar el estudiante" });
              return;
            }

            const sqlMatricula = `
              UPDATE matriculas
              SET carrera_id = ?, anio_academico = ?, jornada = ?, estado_matricula = ?
              WHERE id = ?
            `;

            conexion.query(
              sqlMatricula,
              [carreraId, anio_academico, jornada, estado_matricula, req.params.id],
              (errorMatricula) => {
                if (errorMatricula) {
                  res.status(500).json({ mensaje: "Error al actualizar la matricula" });
                  return;
                }

                res.json({ mensaje: "Matricula actualizada correctamente" });
              }
            );
          }
        );
      }
    );
  });
});

app.delete("/matriculas/:id", (req, res) => {
  conexion.query("DELETE FROM matriculas WHERE id = ?", [req.params.id], (error, resultado) => {
    if (error) {
      res.status(500).json({ mensaje: "Error al eliminar la matricula" });
      return;
    }

    if (resultado.affectedRows === 0) {
      res.status(404).json({ mensaje: "Matricula no encontrada" });
      return;
    }

    res.json({ mensaje: "Matricula eliminada correctamente" });
  });
});

app.get("/matriculas", (req, res) => {
  const busqueda = req.query.busqueda || "";
  const filtro = `%${busqueda}%`;
  const sql = `
    SELECT
      m.id,
      e.nombre,
      e.apellido,
      e.rut,
      e.correo,
      c.nombre AS carrera,
      m.anio_academico,
      m.jornada,
      m.estado_matricula
    FROM matriculas m
    INNER JOIN estudiantes e ON m.estudiante_id = e.id
    INNER JOIN carreras c ON m.carrera_id = c.id
    WHERE e.rut LIKE ? OR e.nombre LIKE ?
    ORDER BY m.id DESC
  `;

  conexion.query(sql, [filtro, filtro], (error, resultados) => {
    if (error) {
      res.status(500).json({ mensaje: "Error al obtener las matriculas" });
      return;
    }

    res.json(resultados);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
