let base = window.smilecampus_config.modules.weather.base_url;


let api = {
  base:`${base}`,
  getWeather:`${base}/weather/get`,
  getCities:`${base}/weather/getCities`,

};

export default api
