import fs from "fs";

import axios from "axios";

class Busquedas {
  //propiedades
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: leer BD si existe
    this.leerDB();
  }
  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");

      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  //definimos un getter para traer los params
  get paramsMapbox() {
    return {
      language: "es",
      access_token: process.env.MAPBOX_KEY,
    };
  }

  get paramsWeather() {
    return {
      units: "metric",
      lang: "es",
      appid: process.env.OPENWHEATER_KEY,
    };
  }
  //busca ciudad
  async ciudad(lugar = "") {
    try {
      //peticion http
      const intance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await intance.get();

      return resp.data.features.map((lugar) => ({
        //regresa un objeto de forma implicita
        id: lugar.id,
        nombre: lugar.place_name_es,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      console.log("error");
      return [];
    }
  }
  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });

      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    // prevenir duplicados
    if (this.historial.includes(lugar.toLowerCase())) {
      return;
    }
    // Muestra solo 6 registros de forma descendente
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLowerCase());

    // Grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return null;
    }
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });

    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

export { Busquedas };
