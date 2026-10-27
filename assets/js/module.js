import pelota from "./json.json" with { type: "json" };
import { promesa } from "./async.js";

//Manejo de JSON
console.log(pelota);
console.log(pelota.peso);
console.log(pelota.fabricante.direccion);

//Manejo de promesas

//Funcion asincrona simple
const objeto = await promesa(pelota);
console.log(objeto.textura);

//Lectura de promesas
promesa()
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.error(err);
  })
  .finally(console.log("finalmente"));

//TRY/CATCH, el try intenta ejecutar todo lo que esta dentro y si algo sale mal se salta todo y va directo al catch, para evitar que el codigo se rompa y controlar el error, parecido a la forma en la que usamos el "then/catch"
intento(pelota);

//Consulta Fetch ejer con then/catch
const resultado = document.getElementById("result");
const img = document.createElement("img");

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mostrarPokemons() {
  for (let i = 1; i <= 151; i++) {
    const pokeapi = fetch("https://pokeapi.co/api/v2/pokemon/ditto")
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log(response.sprites.other["official-artwork"].front_shiny);
        img.src = response.sprites.other["official-artwork"].front_shiny;
        resultado.appendChild(img);
      })
      .catch((error) => {
        img.src = "https://www.postman.com/downloads/";
        resultado.appendChild(img);
      });
    await esperar(1000);
  }
}
mostrarPokemons();

//Ejercicio corregido con async/await
export async function pokefuncion() {
  const resultado = document.getElementById("result");

  for (let i = 1; i <= 151; i++) {
    const pokelista = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const pokemon = await pokelista.json();

    resultado.innerHTML += `<p>${pokemon.name} - Nº ${pokemon.id}</p>
    <img src="${pokemon.sprites.other["official-artwork"].front_shiny}">
    `;
    console.log(pokemon);
  }
}
