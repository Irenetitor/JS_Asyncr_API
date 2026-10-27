// Ejercicios

// Usa la API pública PokéAPI (sin clave, sin registro). Haz cada ejercicio dos veces: una con .then/.catch y otra con async/await.

// Ejercicio 1: Una petición con manejo de errores

// Crea una función getPokemon(name) que:

// Pida https://pokeapi.co/api/v2/pokemon/${name}.
// Compruebe response.ok y lance un error si no lo es.
// Muestre por consola el nombre, la altura y el peso del Pokémon.
// Si falla, muestre un mensaje de error claro.

// Pruébalo con "pikachu" (debe funcionar) y con "pokemonquenoexiste" (debe caer en el catch con un 404).

// Pista: el JSON tiene name, height y weight en el primer nivel.

//THEN & CATCH
fetch("https://pokeapi.co/api/v2/pokemon")
  .then((Response) => {
    if (!Response.ok) {
      throw new Error(`Error HTTP: ${Response.status}`);
    }
    return Response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Error encontrado:", error);
  })
  .finally(() => {
    console.log(" ");
  });

//ASYNC & AWAIT
async function Pokename() {
  try {
    const respu = await fetch("https://pokeapi.co/api/v2/pokemon/${name}");

    if (!reponse.ok) {
      throw new Error(`Error HTTP: ${respu.status}`);
    }

    const datos = await respu.json();
    console.log(datos);
  } catch (error) {
    console.error("Error entontrado:", error);
  } finally {
    console.log("");
  }
}

Pokename();

// Ejercicio 2: Varias peticiones a la vez

// Crea una función getTeam(names) que reciba un array, por ejemplo ["pikachu", "charmander", "bulbasaur"], y:

// Lance todas las peticiones en paralelo.
// Versión A con Promise.all: si cualquiera falla, muestra un único error.
// Versión B con Promise.allSettled: muestra los Pokémon que sí se cargaron y avisa de cuáles fallaron.

// Pruébalo con un nombre falso en el array, por ejemplo ["pikachu", "noexiste", "bulbasaur"], y compara cómo se comportan A y B. Ese contraste es el punto del ejercicio.

// Pista: para convertir un array de nombres en un array de promesas, usa .map():
