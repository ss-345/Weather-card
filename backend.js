
const fs = require("fs");
const http = require("http");
const axios = require("axios");
const url = require("url");

const changes = (filename, target) => {
    let temperatures = filename.replace("{%mausam%}", target.weather[0].main)
    temperatures = temperatures.replace("{%typing%}", target.weather[0].main)
    temperatures = temperatures.replace("{%location%}", target.name)
    temperatures = temperatures.replace("{%country%}", target.sys.country)
    temperatures = temperatures.replace("{%temperature%}", Math.floor((target.main.temp) / 10))
    temperatures = temperatures.replace("{%Mintemp%}",  Math.round(((target.main.temp_min) / 10) - 1))
    temperatures = temperatures.replace("{%Maxtemp%}",  Math.round(((target.main.temp_max) / 10) + 1))
    return temperatures
}

const file = fs.readFileSync("index.html", "utf-8");

const getCityWeather = async (cityName) => {
    require('dotenv').config();

    const apiKey = process.env.API_KEY; // Replace with your OpenWeatherMap API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
    
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error.response.data);
        return null;
    }
}

const server = http.createServer(async (req, res) => {
    const reqUrl = url.parse(req.url, true);
    const cityName = req.url.slice(1);
    // console.log(reqUrl)
    // console.log(cityName)
    if (reqUrl.pathname == `/${cityName}`) {
        const weatherData = await getCityWeather(cityName);
        // console.log(weatherData)
        if (weatherData) {
            const modifiedHTML = changes(file, weatherData);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(modifiedHTML);
        } else {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>City not found</h1>");
        }
    } else {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>Please provide a city name</h1>");
    }
});

server.listen(4000, "127.0.0.1", () => {
    console.log("Server is running on http://127.0.0.1:4000");
});
