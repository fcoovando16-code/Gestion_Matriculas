const btnGuardar = document.getElementById("btnGuardar");
const btnMostrar = document.getElementById("btnMostrar");
const btnBuscar = document.getElementById("btnBuscar");
const btnCancelar = document.getElementById("btnCancelar");
const mensaje = document.getElementById("mensaje");
const listaMatriculas = document.getElementById("listaMatriculas");
const busqueda = document.getElementById("busqueda");

let matriculaEditandoId = null;

btnGuardar.addEventListener("click", async () => {
  const anioAcademico = document.getElementById("anioAcademico").value;
  const matricula = obtenerDatosFormulario();

  if (
    matricula.nombre === "" ||
    matricula.apellido === "" ||
    matricula.rut === "" ||
    matricula.correo === "" ||
    matricula.carrera === "" ||
    anioAcademico === "" ||
    matricula.jornada === "" ||
    matricula.estado_matricula === ""
  ) {
    mensaje.textContent = "Todos los campos son obligatorios.";
    listaMatriculas.innerHTML = "";
    return;
  }

  try {
    const url = matriculaEditandoId ? `/matriculas/${matriculaEditandoId}` : "/matriculas";
    const metodo = matriculaEditandoId ? "PUT" : "POST";
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(matricula)
    });

    const datos = await respuesta.json();
    mensaje.textContent = datos.mensaje;
    listaMatriculas.innerHTML = "";

    if (!respuesta.ok) {
      return;
    }

    limpiarFormulario();
    cargarMatriculas(busqueda.value.trim());
  } catch (error) {
    mensaje.textContent = "Error al guardar la matricula.";
  }
});

btnMostrar.addEventListener("click", () => {
  busqueda.value = "";
  cargarMatriculas();
});

btnBuscar.addEventListener("click", () => {
  cargarMatriculas(busqueda.value.trim());
});

btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  mensaje.textContent = "Edicion cancelada.";
});

async function cargarMatriculas(filtro = "") {
  listaMatriculas.innerHTML = "";

  try {
    const respuesta = await fetch(`/matriculas?busqueda=${encodeURIComponent(filtro)}`);
    const matriculas = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = matriculas.mensaje;
      return;
    }

    if (matriculas.length === 0) {
      mensaje.textContent = filtro ? "No se encontraron matriculas." : "No hay matriculas registradas.";
      return;
    }

    mensaje.textContent = "Matriculas registradas:";

    matriculas.forEach((matricula) => {
      const item = document.createElement("div");
      item.className = "matricula";
      item.innerHTML = `
        <strong>Matricula N ${matricula.id}</strong><br>
        Estudiante: ${matricula.nombre} ${matricula.apellido}<br>
        RUT/ID: ${matricula.rut}<br>
        Correo: ${matricula.correo}<br>
        Carrera: ${matricula.carrera}<br>
        Anio academico: ${matricula.anio_academico}<br>
        Jornada: ${matricula.jornada}<br>
        Estado: ${matricula.estado_matricula}
        <div class="acciones">
          <button type="button" class="btn-editar">Editar</button>
          <button type="button" class="btn-eliminar">Eliminar</button>
        </div>
      `;

      item.querySelector(".btn-editar").addEventListener("click", () => cargarFormulario(matricula));
      item.querySelector(".btn-eliminar").addEventListener("click", () => eliminarMatricula(matricula.id));
      listaMatriculas.appendChild(item);
    });
  } catch (error) {
    mensaje.textContent = "Error al obtener las matriculas.";
  }
}

async function eliminarMatricula(id) {
  const confirmar = confirm("Desea eliminar esta matricula?");

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(`/matriculas/${id}`, {
      method: "DELETE"
    });
    const datos = await respuesta.json();

    mensaje.textContent = datos.mensaje;

    if (respuesta.ok) {
      cargarMatriculas(busqueda.value.trim());
    }
  } catch (error) {
    mensaje.textContent = "Error al eliminar la matricula.";
  }
}

function obtenerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    rut: document.getElementById("rut").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    carrera: document.getElementById("carrera").value,
    anio_academico: parseInt(document.getElementById("anioAcademico").value, 10),
    jornada: document.getElementById("jornada").value,
    estado_matricula: document.getElementById("estadoMatricula").value
  };
}

function cargarFormulario(matricula) {
  matriculaEditandoId = matricula.id;
  document.getElementById("nombre").value = matricula.nombre;
  document.getElementById("apellido").value = matricula.apellido;
  document.getElementById("rut").value = matricula.rut;
  document.getElementById("correo").value = matricula.correo;
  document.getElementById("carrera").value = matricula.carrera;
  document.getElementById("anioAcademico").value = matricula.anio_academico;
  document.getElementById("jornada").value = matricula.jornada;
  document.getElementById("estadoMatricula").value = matricula.estado_matricula;
  btnGuardar.textContent = "Actualizar matricula";
  mensaje.textContent = "Editando matricula N " + matricula.id;
}

function limpiarFormulario() {
  matriculaEditandoId = null;
  btnGuardar.textContent = "Guardar matricula";
  document.getElementById("nombre").value = "";
  document.getElementById("apellido").value = "";
  document.getElementById("rut").value = "";
  document.getElementById("correo").value = "";
  document.getElementById("carrera").value = "";
  document.getElementById("anioAcademico").value = "";
  document.getElementById("jornada").value = "";
  document.getElementById("estadoMatricula").value = "";
}
