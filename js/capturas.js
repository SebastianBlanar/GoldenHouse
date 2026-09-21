/* ============================================
   Aurea — lógica de "Ventas concretadas"
   Independiente de js/main.js: no comparte funciones ni variables con él.
   ============================================ */

(function () {
  const NOMBRES_CANAL = { whatsapp: "WhatsApp", instagram: "Instagram" };

  const galeria  = document.getElementById("galeria-capturas");
  const estado   = document.getElementById("estado-capturas");
  const filtros  = document.querySelectorAll(".pruebas__filtro");
  const visor    = document.getElementById("visor-captura");

  if (!galeria) return; // la sección no está en esta página

  let capturas = [];
  let ultimoFoco = null;

  cargarCapturas();

  async function cargarCapturas() {
    try {
      const respuesta = await fetch("datos/capturas.json");
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      capturas = await respuesta.json();
      estado.hidden = true;
      dibujarGaleria("todas");
    } catch (error) {
      console.error(error);
      estado.hidden = false;
      estado.textContent =
        "No se pudieron cargar las capturas. Si abriste el archivo desde el disco, " +
        "usá la extensión Live Server de VS Code.";
    }
  }

  function ponerImagenCaptura(contenedor, item) {
    const img = document.createElement("img");
    img.src = item.imagen;
    img.alt = item.alt || `Captura de conversación por ${NOMBRES_CANAL[item.canal] || item.canal}`;
    img.loading = "lazy";

    img.addEventListener("error", () => {
      const marcador = document.createElement("div");
      marcador.className = "captura-pendiente";
      marcador.innerHTML =
        '<span class="captura-pendiente__globo" aria-hidden="true"></span>' +
        '<span class="captura-pendiente__texto">Captura pendiente</span>';
      img.replaceWith(marcador);
    });

    contenedor.appendChild(img);
  }

  function dibujarGaleria(canal) {
    const visibles = canal === "todas"
      ? capturas
      : capturas.filter(c => c.canal === canal);

    galeria.replaceChildren();

    if (visibles.length === 0) {
      estado.hidden = false;
      estado.textContent = "Todavía no hay capturas para este canal.";
      return;
    }

    estado.hidden = true;

    visibles.forEach(item => {
      const boton = document.createElement("button");
      boton.className = "captura";
      boton.type = "button";
      boton.setAttribute("aria-label", `Ampliar la conversación sobre ${item.producto}`);

      const marco = document.createElement("div");
      marco.className = "captura__marco";
      ponerImagenCaptura(marco, item);

      const pie = document.createElement("div");
      pie.className = "captura__pie";

      const producto = document.createElement("span");
      producto.className = "captura__producto";
      producto.textContent = item.producto;

      pie.append(producto);
      boton.append(marco, pie);
      boton.addEventListener("click", () => abrirVisor(item));
      galeria.appendChild(boton);
    });
  }

  filtros.forEach(boton => {
    boton.addEventListener("click", () => {
      filtros.forEach(otro => {
        otro.classList.remove("pruebas__filtro--activo");
        otro.setAttribute("aria-pressed", "false");
      });
      boton.classList.add("pruebas__filtro--activo");
      boton.setAttribute("aria-pressed", "true");
      dibujarGaleria(boton.dataset.canal);
    });
  });

  function abrirVisor(item) {
    ultimoFoco = document.activeElement;

    const contenedor = visor.querySelector(".visor-captura__imagen");
    contenedor.replaceChildren();
    ponerImagenCaptura(contenedor, item);

    document.getElementById("visor-producto").textContent = item.producto;

    visor.hidden = false;
    document.body.style.overflow = "hidden";
    visor.querySelector(".visor-captura__cerrar").focus();
  }

  function cerrarVisor() {
    visor.hidden = true;
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  visor.querySelectorAll("[data-cerrar-captura]").forEach(el => {
    el.addEventListener("click", cerrarVisor);
  });

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !visor.hidden) cerrarVisor();
  });
})();
