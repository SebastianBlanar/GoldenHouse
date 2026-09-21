/* ============================================
   Aurea — lógica del catálogo
   ============================================ */

// Cambiá este número por el de la cuenta de WhatsApp del emprendimiento.
// Formato: código de país + área sin el 0 + número sin el 15.
const WHATSAPP = "5491100000000";

const grilla   = document.getElementById("grilla");
const estado   = document.getElementById("estado");
const ficha    = document.getElementById("ficha");
const filtros  = document.querySelectorAll(".filtro");

let productos = [];
let ultimoFoco = null;

const precioARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

/* ---------- Carga ---------- */

async function cargarProductos() {
  try {
    const respuesta = await fetch("productos.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    productos = await respuesta.json();
    estado.hidden = true;

    mostrarPortada();
    dibujarGrilla("todas");
  } catch (error) {
    console.error(error);
    estado.hidden = false;
    estado.textContent =
      "No se pudo cargar el catálogo. Si estás abriendo el archivo desde el disco, " +
      "usá la extensión Live Server de VS Code.";
  }
}

/* ---------- Imagen con reemplazo si todavía no hay foto ---------- */

function ponerImagen(contenedor, producto) {
  const img = document.createElement("img");
  img.src = producto.imagen;
  console.log("URL de imagen:", img.src);
  img.alt = producto.nombre;
  img.loading = "lazy";

  img.addEventListener("error", () => {
    const marcador = document.createElement("div");
    marcador.className = "sin-foto";
    marcador.textContent = "Aurea";
    marcador.setAttribute("role", "img");
    marcador.setAttribute("aria-label", `Foto pendiente de ${producto.nombre}`);
    img.replaceWith(marcador);
  });

  contenedor.appendChild(img);
}

/* ---------- Portada ---------- */

function mostrarPortada() {
  const destacado = productos.find(p => p.destacado) || productos[0];
  if (!destacado) return;

  const img = document.getElementById("imagen-portada");
  img.src = destacado.imagen;
  img.alt = destacado.nombre;
  img.addEventListener("error", () => {
    const marcador = document.createElement("div");
    marcador.className = "sin-foto";
    marcador.textContent = "Aurea";
    marcador.setAttribute("role", "img");
    marcador.setAttribute("aria-label", "Foto de portada pendiente");
    img.replaceWith(marcador);
  });

  document.getElementById("pie-portada").textContent =
    `${destacado.nombre} — ${precioARS.format(destacado.precio)}`;
}

/* ---------- Grilla ---------- */

function dibujarGrilla(categoria) {
  const visibles = categoria === "todas"
    ? productos
    : productos.filter(p => p.categoria === categoria);

  grilla.replaceChildren();

  if (visibles.length === 0) {
    estado.hidden = false;
    estado.textContent = "Todavía no hay piezas en esta categoría. Probá con otra.";
    return;
  }

  estado.hidden = true;

  visibles.forEach(producto => {
    const boton = document.createElement("button");
    boton.className = "pieza";
    boton.type = "button";
    boton.setAttribute("aria-label", `Ver los detalles de ${producto.nombre}`);

    const foto = document.createElement("div");
    foto.className = "pieza__foto";
    ponerImagen(foto, producto);

    const nombre = document.createElement("h3");
    nombre.className = "pieza__nombre";
    nombre.textContent = producto.nombre;

    const material = document.createElement("p");
    material.className = "pieza__material";
    material.textContent = producto.material;

    const precio = document.createElement("p");
    precio.className = "pieza__precio";
    precio.textContent = precioARS.format(producto.precio);

    boton.append(foto, nombre, material, precio);
    boton.addEventListener("click", () => abrirFicha(producto));
    grilla.appendChild(boton);
  });
}

/* ---------- Filtros ---------- */

filtros.forEach(boton => {
  boton.addEventListener("click", () => {
    filtros.forEach(otro => {
      otro.classList.remove("filtro--activo");
      otro.setAttribute("aria-pressed", "false");
    });
    boton.classList.add("filtro--activo");
    boton.setAttribute("aria-pressed", "true");
    dibujarGrilla(boton.dataset.categoria);
  });
});

/* ---------- Ficha de producto ---------- */

function abrirFicha(producto) {
  ultimoFoco = document.activeElement;

  const contenedor = ficha.querySelector(".ficha__imagen");
  contenedor.replaceChildren();
  ponerImagen(contenedor, producto);

  document.getElementById("ficha-categoria").textContent = producto.categoria;
  document.getElementById("ficha-nombre").textContent = producto.nombre;
  document.getElementById("ficha-precio").textContent = precioARS.format(producto.precio);
  document.getElementById("ficha-material").textContent = producto.material;
  document.getElementById("ficha-descripcion").textContent = producto.descripcion;

  const mensaje = `Hola, me interesa ${producto.nombre} (${precioARS.format(producto.precio)}). ¿Tienen stock?`;
  document.getElementById("ficha-consulta").href =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  ficha.hidden = false;
  document.body.style.overflow = "hidden";
  ficha.querySelector(".ficha__cerrar").focus();
}

function cerrarFicha() {
  ficha.hidden = true;
  document.body.style.overflow = "";
  if (ultimoFoco) ultimoFoco.focus();
}

ficha.querySelectorAll("[data-cerrar]").forEach(elemento => {
  elemento.addEventListener("click", cerrarFicha);
});

document.addEventListener("keydown", evento => {
  if (evento.key === "Escape" && !ficha.hidden) cerrarFicha();
});

cargarProductos();
