export async function asincronia(pelota) {
  return pelota;
}

//Promesa
export async function promesa() {
  const validado = falso;
  return new Promise((response, reject) => {
    if (validado != false) {
      response("todo bien");
    } else {
      reject("todo mal");
    }
  });
}

export function intento(pelota) {
  try {
    //codigo
    console.log(pelota);
    console.log(pelota.direccion);
    console.log;
  } catch (e) {
    //freno de emergencia
    throw new Error(e);
  }
}
