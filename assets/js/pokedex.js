/* ==========================================================================
   POKÉDEX · FLUJO GENERAL
   --------------------------------------------------------------------------
   1. Referencias al DOM        → guardamos los elementos del HTML que usaremos
   2. obtenerPrimeros151()      → pide los datos a la API (async/await)
   3. crearTarjeta()            → convierte 1 Pokémon en 1 <button> (DOM)
   4. mostrarDetalles()         → rellena y abre el <dialog>
   5. iniciarPokedex()          → orquesta todo: pedir → crear → pintar → clic
   6. Eventos del modal         → cerrar con botón y clic fuera
   7. Arranque                  → llamada final que lo pone todo en marcha

   Esquema:
   API ──► obtenerPrimeros151 ──► crearTarjeta ──► #tablero ──► clic ──► modal
   ========================================================================== */

/* ==========================================================================
   1. REFERENCIAS AL DOM
   Cada id/clase viene de index.html. Se buscan UNA vez y se reutilizan.
   ========================================================================== */
const API_URL = "https://pokeapi.co/api/v2/pokemon";
const tablero = document.getElementById("tablero"); // <section> donde van las tarjetas
const estado = document.getElementById("estado"); // <p> de mensajes al usuario
const modal = document.getElementById("pokemon-modal"); // <dialog> de detalles
const contenidoModal = document.getElementById("modal-content"); // interior del dialog
const botonCerrarModal = document.querySelector(".pokemon-modal__close"); // botón ×

/* ==========================================================================
   2. PETICIÓN A LA API  (patrón: lista → detalle de cada elemento)
   ========================================================================== */
// El endpoint de lista solo da nombres y URLs; pedimos cada URL para obtener
// sprites, tipos y estadísticas, que son los datos que necesita la tarjeta.
async function obtenerPrimeros151() {
  // FASE 1: pedir la lista (solo { name, url } de cada Pokémon)
  const respuestaLista = await fetch(`${API_URL}?limit=151`);
  // fetch NO falla con un 404/500: hay que comprobar .ok a mano y lanzar error
  if (!respuestaLista.ok)
    throw new Error("No se pudo cargar la lista de Pokémon.");

  const lista = await respuestaLista.json(); // texto → objeto JS (también es asíncrono)

  // FASE 2: pedir el detalle de cada uno, las 151 peticiones a la vez
  // .map(async ...) devuelve un array de PROMESAS
  // Promise.all espera a que todas terminen → array con 151 objetos Pokémon
  return Promise.all(
    lista.results.map(async (elemento) => {
      const respuestaPokemon = await fetch(elemento.url);
      if (!respuestaPokemon.ok)
        throw new Error(`No se pudieron cargar los datos de ${elemento.name}.`);
      return respuestaPokemon.json();
    }),
  );
}

/* ==========================================================================
   3. CREAR UNA TARJETA  (datos → elementos HTML)
   Estructura que genera:
     button.pokemon-card
     ├─ img.pokemon-card__image
     └─ span.pokemon-card__info
        ├─ span.pokemon-card__number
        ├─ span.pokemon-card__name
        └─ span.pokemon-card__types
           └─ span.pokemon-card__type  (uno por cada tipo)
   ========================================================================== */
// Crea nodos HTML desde los datos recibidos. Las clases enlazan cada nodo con
// las reglas de estilo de style.css; textContent muestra texto sin interpretarlo como HTML.
function crearTarjeta(pokemon) {
  // --- Contenedor: es un <button> para que sea accesible con teclado ---
  const tarjeta = document.createElement("button");
  tarjeta.type = "button";
  tarjeta.className = "pokemon-card"; // ← enlace con el CSS
  tarjeta.setAttribute("aria-label", `Ver detalles de ${pokemon.name}`); // lectores de pantalla
  tarjeta.dataset.pokemonId = pokemon.id; // → <button data-pokemon-id="25"> (la tarjeta "recuerda" su id)

  // --- Imagen: ?? = "si es null/undefined usa el siguiente" (cadena de respaldo) ---
  const imagen = document.createElement("img");
  imagen.className = "pokemon-card__image";
  imagen.src =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default ??
    "";
  imagen.alt = `Ilustración de ${pokemon.name}`;
  imagen.loading = "lazy"; // solo descarga la imagen cuando está cerca de verse

  // --- Bloque de texto ---
  const informacion = document.createElement("span");
  informacion.className = "pokemon-card__info";

  const numero = document.createElement("span");
  numero.className = "pokemon-card__number";
  numero.textContent = `N.º ${String(pokemon.id).padStart(3, "0")}`; // 7 → "007"

  const nombre = document.createElement("span");
  nombre.className = "pokemon-card__name";
  nombre.textContent = pokemon.name;

  // --- Tipos: un array de longitud variable → un span por cada uno ---
  const tipos = document.createElement("span");
  tipos.className = "pokemon-card__types";
  pokemon.types.forEach(({ type }) => {
    // ({ type }) = desestructuración: saca la propiedad "type" de cada elemento
    const etiquetaTipo = document.createElement("span");
    etiquetaTipo.className = "pokemon-card__type";
    etiquetaTipo.textContent = type.name;
    tipos.append(etiquetaTipo);
  });

  // --- Ensamblado: de dentro hacia fuera ---
  informacion.append(numero, nombre, tipos);
  tarjeta.append(imagen, informacion);
  return tarjeta; // aún NO está en la página; se inserta en iniciarPokedex()
}

/* ==========================================================================
   4. MODAL DE DETALLES
   Misma técnica que crearTarjeta: crear → dar clase → meter dato → anidar.
   ========================================================================== */
// La tarjeta guarda el número en data-pokemon-id. Al hacer clic usamos ese
// número para encontrar los datos completos y presentar el diálogo nativo.
function mostrarDetalles(pokemon) {
  contenidoModal.replaceChildren(); // vacía el contenido del Pokémon anterior

  // --- Cabecera: imagen + (número, nombre, tipos) ---
  const encabezado = document.createElement("div");
  encabezado.className = "pokemon-modal__header";

  const imagen = document.createElement("img");
  imagen.className = "pokemon-modal__image";
  imagen.src =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default ??
    "";
  imagen.alt = `Ilustración de ${pokemon.name}`;

  const datosPrincipales = document.createElement("div");
  const numero = document.createElement("p");
  numero.className = "pokemon-card__number"; // reutiliza la clase de la tarjeta
  numero.textContent = `N.º ${String(pokemon.id).padStart(3, "0")}`;

  const nombre = document.createElement("h2");
  nombre.id = "modal-name"; // coincide con aria-labelledby del <dialog>
  nombre.className = "pokemon-modal__name";
  nombre.textContent = pokemon.name;

  const tipos = document.createElement("p");
  tipos.className = "pokemon-modal__types";
  // .map extrae los nombres, .join los une: ["fire","flying"] → "fire, flying"
  tipos.textContent = `Tipo: ${pokemon.types.map(({ type }) => type.name).join(", ")}`;
  datosPrincipales.append(numero, nombre, tipos);
  encabezado.append(imagen, datosPrincipales);

  // --- Estadísticas: lista <ul> con un <li> por stat ---
  const tituloStats = document.createElement("h3");
  tituloStats.className = "pokemon-modal__section-title";
  tituloStats.textContent = "Estadísticas";

  const listaStats = document.createElement("ul");
  listaStats.className = "pokemon-modal__stats";
  pokemon.stats.forEach(({ base_stat, stat }) => {
    const fila = document.createElement("li");
    fila.textContent = `${stat.name.replaceAll("-", " ")}: ${base_stat}`; // "special-attack" → "special attack"
    listaStats.append(fila);
  });

  // --- Datos físicos: la API da decímetros y hectogramos → /10 para m y kg ---
  const datosFisicos = document.createElement("p");
  datosFisicos.className = "pokemon-modal__physical";
  datosFisicos.textContent = `Altura: ${pokemon.height / 10} m · Peso: ${pokemon.weight / 10} kg`;

  // --- Insertar todo y abrir ---
  contenidoModal.append(encabezado, tituloStats, listaStats, datosFisicos);
  modal.showModal(); // método nativo de <dialog>: fondo oscuro + bloquea la página
}

/* ==========================================================================
   5. ORQUESTADOR  (aquí se conectan todas las piezas)
   Pedir datos → guardarlos → crear tarjetas → pintarlas → escuchar clics
   ========================================================================== */
async function iniciarPokedex() {
  try {
    estado.textContent = "Cargando los Pokémon...";

    // (a) PEDIR: array con 151 objetos Pokémon
    const pokemons = await obtenerPrimeros151();

    // (b) GUARDAR: Map = diccionario id → Pokémon. Búsqueda instantánea,
    // sin repetir peticiones a la API al abrir el detalle.
    // Guardamos los objetos completos para poder abrir el detalle sin otra petición.
    const pokemonsPorId = new Map(
      pokemons.map((pokemon) => [pokemon.id, pokemon]),
    );

    // (c) CREAR: array de 151 datos → array de 151 <button>
    const tarjetas = pokemons.map(crearTarjeta);

    // (d) PINTAR: vacía el tablero y mete todas las tarjetas (... = esparcir el array)
    tablero.replaceChildren(...tarjetas);
    estado.textContent = `Se han cargado ${pokemons.length} Pokémon. Pulsa una tarjeta para ver sus detalles.`;

    // (e) CLIC: delegación de eventos → 1 solo listener para las 151 tarjetas
    // Un solo listener en el tablero sirve para todas las tarjetas generadas.
    tablero.addEventListener("click", (evento) => {
      // evento.target puede ser la imagen o el nombre; closest sube hasta la tarjeta
      const tarjeta = evento.target.closest("[data-pokemon-id]");
      if (!tarjeta) return; // clic en un hueco del tablero: ignorar
      // dataset siempre devuelve texto → Number() para que coincida con la clave del Map
      mostrarDetalles(pokemonsPorId.get(Number(tarjeta.dataset.pokemonId)));
    });
  } catch (error) {
    // Cualquier fallo de red o throw de arriba termina aquí
    estado.textContent =
      "No se pudieron cargar los Pokémon. Comprueba tu conexión y recarga la página.";
    console.error(error); // detalle técnico para el desarrollador
  }
}

/* ==========================================================================
   6. EVENTOS DEL MODAL
   ========================================================================== */
botonCerrarModal.addEventListener("click", () => modal.close());

// El elemento <dialog> se cierra con Escape de forma nativa. Este clic detecta
// el fondo oscuro del diálogo para permitir también cerrar haciendo clic fuera.
// (el fondo cuenta como parte del <dialog>, así que target === modal solo si se pulsa fuera)
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) modal.close();
});

/* ==========================================================================
   7. ARRANQUE
   ========================================================================== */
iniciarPokedex();
