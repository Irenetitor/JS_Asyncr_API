// Qué es una API y por qué es asíncrona

// Una API web es un servidor al que le haces una petición (por HTTP) y te devuelve datos, normalmente en formato JSON. Esa petición tarda: depende de la red y del servidor. JavaScript no se queda esperando parado; sigue ejecutando el resto del código y te devuelve una Promesa, que es como un “resguardo” de un resultado que llegará en el futuro.

// Una Promesa tiene tres estados:

// pending: todavía esperando
// fulfilled: salió bien, tienes los datos
// rejected: algo falló

// Tanto .then/.catch como async/await son dos formas de trabajar con la misma Promesa. No hay una “mejor” a nivel técnico, es cuestión de estilo y legibilidad.

// Camino 1: .then() y .catch()
js;
fetch("https://jsonplaceholder.typicode.com/users")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json(); // también devuelve una promesa
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Algo salió mal:", error);
  })
  .finally(() => {
    console.log("Esto se ejecuta siempre");
  });

// Cómo leerlo:

// fetch() devuelve una promesa con la respuesta.
// El primer .then recibe la respuesta. Con response.json() conviertes el cuerpo a un objeto de JavaScript (eso es otra promesa, por eso return).
// El segundo .then recibe ya los datos.
// .catch atrapa cualquier error de la cadena.
// .finally se ejecuta pase lo que pase (útil para quitar un “cargando...”).
// Camino 2: async / await
js;
async function getUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Algo salió mal:", error);
  } finally {
    console.log("Esto se ejecuta siempre");
  }
}

getUsers();

// Cómo leerlo:

// async delante de la función: dice que dentro puedes usar await y que la función siempre devuelve una promesa.
// await pausa la función (no todo el programa) hasta que la promesa se resuelve, y te da el valor directamente.
// try/catch/finally hace el papel de .catch/.finally.

// El código se lee de arriba abajo, como si fuera síncrono, y por eso a mucha gente le resulta más fácil.

// Un detalle importante sobre fetch

// fetch solo rechaza la promesa si hay un fallo de red (sin internet, servidor caído). Si el servidor responde con un 404 o un 500, fetch lo considera “éxito” y no entra en el catch. Por eso hay que comprobar response.ok manualmente, como en los ejemplos de arriba. Es un error muy común.

// Peticiones que no son GET (POST, PUT, DELETE)
js;
async function createPost() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Mi post",
        body: "Contenido",
        userId: 1,
      }),
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    console.log("Creado:", data);
  } catch (error) {
    console.error(error);
  }
}

// Con .then sería exactamente el mismo objeto de opciones en fetch, solo cambia cómo encadenas el resultado.

// Varias peticiones a la vez. Si las peticiones no dependen entre sí, no las hagas una detrás de otra; lánzalas en paralelo con Promise.all:

js;
async function getData() {
  try {
    const [users, posts] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json()),
      fetch("https://jsonplaceholder.typicode.com/posts").then((r) => r.json()),
    ]);
    console.log(users, posts);
  } catch (error) {
    console.error(error);
  }
}

// Si una falla, Promise.all falla entero. Si quieres que cada una vaya por su cuenta, existe Promise.allSettled.

// Comparación rápida
// 	.then/.catch	async/await
// Legibilidad	Bien en cadenas cortas, se complica si crece	Se lee de arriba a abajo, más claro
// Errores	.catch() al final de la cadena	try/catch
// Dependencias entre llamadas	Anidar o encadenar .then	Variables normales, muy natural
// Uso habitual hoy	Común en código antiguo y en ejemplos	Lo más habitual en proyectos nuevos
// Qué te recomiendo

// Aprende y practica los dos, porque te vas a encontrar ambos (documentación, tutoriales, código de otros). Pero para escribir tu código, async/await suele ser la opción más cómoda. Algo que se hace mucho: .then para transformaciones pequeñas y rápidas, y async/await para la lógica principal.

// Y como usas React, el patrón típico es llamar a la API dentro de un useEffect:

// jsx
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
      );
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      setUsers(await response.json());
    } catch (error) {
      setError(error.message);
    }
  };

  fetchUsers();
}, []);

// 1. ¿Para qué juntar las peticiones?

// Hay dos motivos distintos: velocidad y consistencia.

// Velocidad. Si las haces una detrás de otra, los tiempos se suman. Si las lanzas a la vez, el tiempo total es el de la más lenta:

js;
// Una detrás de otra: 300ms + 400ms = ~700ms
const users = await fetch(urlUsers).then((r) => r.json());
const posts = await fetch(urlPosts).then((r) => r.json());

// En paralelo: ~400ms (lo que tarde la más lenta)
const [users, posts] = await Promise.all([
  fetch(urlUsers).then((r) => r.json()),
  fetch(urlPosts).then((r) => r.json()),
]);

// Consistencia (“todo o nada”). A veces los datos solo tienen sentido juntos. Por ejemplo, una página de perfil que necesita usuario + sus pedidos: si faltan los pedidos, quizá prefieres mostrar un error general en vez de una pantalla a medias. Ahí el “si una falla, fallan todas” es justo lo que quieres.

// 2. ¿No sería más inteligente hacerlas por separado?

// Depende de qué quieras que pase cuando una falle. Y ojo, hay una confusión que conviene aclarar: “por separado” y “una detrás de otra” no son lo mismo.

// Puedes tener peticiones independientes pero lanzadas a la vez. Eso es justo Promise.allSettled:

js;
async function getData() {
  const results = await Promise.allSettled([
    fetch(urlUsers).then((r) => r.json()),
    fetch(urlPosts).then((r) => r.json()),
  ]);

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(`Petición ${i} OK:`, result.value);
    } else {
      console.error(`Petición ${i} falló:`, result.reason);
    }
  });
}

// Aquí se lanzan a la vez (rápido) y si una falla las otras siguen vivas (resistente). Nunca lanza error: te devuelve un array con el estado de cada una.

// Resumen para elegir:

// Situación	Qué usar
// Necesito todos los datos o ninguno	Promise.all
// Cada bloque de la página es independiente (un widget de noticias, otro de tiempo...)	Promise.allSettled
// La segunda petición necesita datos de la primera	await una detrás de otra

// Así que tienes razón en que no siempre conviene que falle todo, pero la solución no suele ser hacerlas secuenciales, sino allSettled.
