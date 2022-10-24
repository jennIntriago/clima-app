import axios from "axios";

class Busquedas {
  //propiedades
  historial = [];

  constructor() {
    //TODO: leer BD si existe
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

    this.historial.unshift(lugar.toLowerCase());

    // Grabar en DB
  }
}

export { Busquedas };
