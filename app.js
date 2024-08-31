const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherInfo = document.getElementById("weather-info");
const extendedForecast = document.getElementById("extended-forecast");
const recentCities = document.getElementById("recent-cities-dropdown");
const errorMsg = document.getElementById("error-msg");
const currentLocationBtn = document.getElementById("current-location-btn");



const API_KEY = "014e7f3da2d274249ddb38bb72c974c3"; 
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";



// Event listener for search button
searchBtn.addEventListener("click", handleSearch);
async function handleSearch() {
  const city = cityInput.value.trim();
  if (city) {
    disableButtons();
    await fetchWeatherData(city);
    enableButtons();
  } else {
    alert("Please enter a city name.");
  }
}

// Event listener for current location button
currentLocationBtn.addEventListener("click", useCurrentLocation);
async function useCurrentLocation() {
  if (navigator.geolocation) {
    disableButtons();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchWeatherDataByCoords(lat, lon);
      },
      () => {
        showError("Unable to retrieve your location.");
        enableButtons();
      }
    );
  } else {
    showError("Geolocation is not supported by your browser.");
    enableButtons();
  }
}



// Fetch weather data by city name
async function fetchWeatherData(city) {
              try {
                  const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
                  if (!response.ok) {
                            if(response.status === 400){
                      throw new Error("City not found");
                  } else {
                            throw new Error("An error occurred while fetching the data")
              }
                 
                  }
                  const data = await response.json();
                  clearError();
                  displayWeatherData(data);
                  updateRecentCities(city);
                  await fetchExtendedForecast(city);
              } catch (error) {
                            if(error.message === "City not found"){
                  showError("You have entered an invalid city name. Please enter a valid city name.");
              } else if (error.message === "Failed to fetch"){
                            showError("Network error. Please check your internet connection.");
                          } else {
                            showError("An unexpected error occurred. Please try again later.");
                          }
              } finally {
                  enableButtons();
              }
          }
          
          // Fetch weather data by coordinates
          async function fetchWeatherDataByCoords(lat, lon) {
              try {
                  const response = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                  if (!response.ok) {
                      throw new Error("Error retrieving weather data");
                  }
                  const data = await response.json();
                  clearError();
                  displayWeatherData(data);
                  await fetchExtendedForecastByCoords(lat, lon);
              } catch (error) {
                  showError("Error retrieving weather data. Please try again later.");
              } finally {
                  enableButtons();
              }
          }


      // Display weather data
function displayWeatherData(data) {
              const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
          
              document.getElementById("city-name").textContent = `${data.name} (${new Date().toISOString().split('T')[0]})`;
              document.getElementById("temperature").textContent = `Temperature: ${data.main.temp}°C`;
              document.getElementById("wind-speed").textContent = `Wind: ${data.wind.speed} M/S`;
              document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
              document.getElementById("weather-icon").src = weatherIcon;
              document.getElementById("weather-description").textContent = data.weather[0].description;
          
              weatherInfo.classList.remove('hidden');
          }    



          // Fetch extended forecast by city name
async function fetchExtendedForecast(city) {
              try {
                  const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
                  if (!response.ok) {
                      throw new Error("Forecast not available");
                  }
                  const data = await response.json();
                  displayExtendedForecast(data);
              } catch (error) {
                  console.error("Error fetching extended forecast:", error);
                  clearExtendedForecast();
              }
          }
          
          // Fetch extended forecast by coordinates
          async function fetchExtendedForecastByCoords(lat, lon) {
              try {
                  const response = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                  if (!response.ok) {
                      throw new Error("Error retrieving forecast");
                  }
                  const data = await response.json();
                  displayExtendedForecast(data);
              } catch (error) {
                  console.error("Error fetching extended forecast:", error);
                  clearExtendedForecast();
              }
          }
          
          // Display extended forecast
          function displayExtendedForecast(data) {
              const forecastContainer = extendedForecast.querySelector('.flex');
              forecastContainer.innerHTML = ''; // Clear previous forecast
              extendedForecast.classList.remove('hidden'); // Show the forecast section
          
              for (let i = 0; i < data.list.length; i += 8) { // Skip to the next day (every 8th item is a new day)
                  const day = data.list[i];
                  const forecastIcon = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
          
                  forecastContainer.innerHTML += `
                      <div class="h-60 sm:h-64 p-4 xm:w-32 lg:w-40 xl:w-40 border rounded-lg bg-gray-200 flex-shrink-0 flex-grow-0 mb-4">
                          <p class="font-semibold">${new Date(day.dt_txt).toLocaleDateString()}</p>
                          <img class="w-12 h-12 mx-auto" src="${forecastIcon}" alt="Weather Icon">
                          <p>${day.weather[0].description}</p>
                          <p>Temp: ${day.main.temp}°C</p>
                          <p>Wind: ${day.wind.speed} M/S</p>
                          <p>Humidity: ${day.main.humidity}%</p>
                      </div>
                  `;
              }
          }

          
          // Clear weather data
function clearWeatherData() {
              //  weatherInfo.innerHTML = '';
                weatherInfo.classList.add('hidden');
            }
            
            // Clear extended forecast
            function clearExtendedForecast() {
                extendedForecast.querySelector('.flex').innerHTML = '';
                extendedForecast.classList.add('hidden');
            }
            
            // Show error message
            function showError(message) {
                clearWeatherData();
                clearExtendedForecast();
                errorMsg.textContent = message;
                errorMsg.classList.remove('hidden');
            }
            
            // Clear error message
            function clearError() {
                errorMsg.textContent = '';
                errorMsg.classList.add('hidden');
            }
            
            // Enable buttons
            function enableButtons() {
                searchBtn.disabled = false;
                currentLocationBtn.disabled = false;
            }
            
            // Disable buttons
            function disableButtons() {
                searchBtn.disabled = true;
                currentLocationBtn.disabled = true;
            }
            
            // Update recently searched cities
            function updateRecentCities(city) {
                let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
                if (!cities.includes(city)) {
                    cities.push(city);
                    localStorage.setItem("recentCities", JSON.stringify(cities));
                }
                displayRecentCities();
            }
            
            // Display recently searched cities
            function displayRecentCities() {
                let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
                recentCities.querySelectorAll('option:not([disabled])').forEach(option => option.remove());
            
                cities.forEach(city => {
                    const option = document.createElement("option");
                    option.value = city;
                    option.textContent = city;
                    recentCities.appendChild(option);
                });
            }
            // Event listener for the dropdown
            recentCities.addEventListener("change", function () {
                const selectedCity = this.value;
                if (selectedCity) {
                  cityInput.value = selectedCity;
                    disableButtons();
                    fetchWeatherData(selectedCity);
                }
              });