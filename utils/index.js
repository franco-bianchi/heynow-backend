const axios = require("axios") ;

function getWeatherMessage(data, lang) {
    const {location = {}, current = {} } = data;

    const city = location?.name;
    const country = location?.country;
    const condition = current?.condition?.text.toLowerCase();
    const celcius = current?.temp_c;
    const fahrenheit = current?.temp_f;

    return lang.includes('en') 
    ? `The day in ${city}, ${country} is currently ${condition}, with a temperature of ${celcius} degrees Celsius and ${fahrenheit} degrees Fahrenheit`
    : `El dia en ${city}, ${country} está ${condition}, con una temperatura de ${celcius} grados Celsius y ${fahrenheit} degrees Fahrenheit`
}

async function getWeather(lang, payload) {
    const {lat = '', long = '', location = ''} = payload;
    let query = lat && long ? `${lat},${long}` : location;
    const {data} = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${query}&aqi=no&lang=${lang}`);
    console.log('data', data);
    return getWeatherMessage(data, lang);
}

module.exports = {
    getWeather,
    getWeatherMessage
}