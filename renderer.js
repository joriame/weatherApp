let lastQuery = null;
let autoUpdateInterval = null;

const cityInput = document.getElementById('city-input');

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getWeather(query, overrideCityName = null) {

  if (query) {
    lastQuery = query;
  }
  
  
  if (!query) {
    query = lastQuery || cityInput.value.trim() || 'Цивильск';
  }
  
  const loader = document.getElementById('loader');
  if (loader) loader.classList.remove('hidden'); 

  const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(query)}?unitGroup=metric&key=8LQF97DXMZVN5M9FTABV3BC6Y&contentType=json&lang=ru`;

  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const current = data.currentConditions;
      const today = data.days[0];
      
    
      const displayCityName = overrideCityName || data.resolvedAddress.split(',')[0];

      setText('city-name', displayCityName);
      setText('temperature', Math.round(current.temp));
      setText('weather-condition', current.conditions);
      setText('feels-like', Math.round(current.feelslike));

      setText('day-wind', `${(current.windspeed / 3.6).toFixed(1)} м/с`);
      setText('day-humidity', `${current.humidity}%`);
      const rainAmount = current.precip ?? 0;
      const rainText = rainAmount > 0 ? `${rainAmount.toFixed(1)} мм` : 'Без осадков';
      setText('day-rain', rainText);

      const weatherIcon = document.getElementById('weather-icon');
      if (weatherIcon) {
        const iconMap = {
          'clear-day': 'clear-day.svg',
          'clear-night': 'clear-night.svg',
          'partly-cloudy-day': 'partly-cloudy-day.svg',
          'partly-cloudy-night': 'partly-cloudy-night.svg',
          'cloudy': 'cloudy.svg',
          'rain': 'rain.svg',
          'snow': 'snow.svg',
          'wind': 'wind.svg'
        };
        const iconName = iconMap[current.icon] || 'default.svg';
        const img = document.createElement('img');
        img.src = `images/icons/${iconName}`;
        img.alt = `Погода: ${current.icon || 'неизвестно'}`;
        img.style.width = '40px';
        weatherIcon.innerHTML = '';
        weatherIcon.appendChild(img);
      }

      const dateObj = new Date(today.datetime);
      const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      const formattedDate = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      setText('date-month', formattedDate);

      const forecastContainer = document.getElementById('forecast-week');
      forecastContainer.innerHTML = '';

      data.days.slice(1, 8).forEach(day => {
        const date = new Date(day.datetime);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });

        const dayEl = document.createElement('div');
        dayEl.className = 'forecast-day';
        dayEl.innerHTML = `
          <div>${dayName}</div>
          <div style="display:flex;justify-content:center">
            <img style='width:40px;height:40px' src="images/icons/${getIconByCondition(day.icon)}" alt="Погода" />
          </div>
          <div>${Math.round(day.temp)}°</div>
        `;
        forecastContainer.appendChild(dayEl);
      });
      
      if (loader) loader.classList.add('hidden');
    })
    .catch(error => {
      console.error(' Ошибка:', error);
      if (loader) loader.classList.add('hidden');
    
      setText('city-name', 'Ошибка загрузки');
    });
}

function getCityNameFromCoords(lat, lon) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=ru`, {
    headers: {
      'User-Agent': 'WeatherApp/1.0' 
    }
  })
    .then(response => response.json())
    .then(data => {
      const address = data.address;
      
      // Пробуем разные варианты названия города
      return address.city || 
             address.town || 
             address.village || 
             address.hamlet || 
             address.municipality ||
             address.county ||
             address.state ||
             'Неизвестно';
    });
}

function initApp() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const coords = `${lat},${lon}`;
        
        // Получаем город и погоду
        getCityNameFromCoords(lat, lon)
          .then(cityName => {
            getWeather(coords, cityName);
          })
          .catch(() => {
            console.warn(' Не удалось определить город, используем координаты');
            getWeather(coords);
          });
      }, 
      function (error) {
        console.warn('Геолокация недоступна:', error.message);
        getWeather('Цивильск');
      }
    );
  } else {
    getWeather('Цивильск');
  }
}

// Поиск города
cityInput.addEventListener('change', function () {
  const query = cityInput.value.trim() || 'Цивильск';
  lastQuery = query;
  getWeather(query);
});

cityInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const query = cityInput.value.trim() || 'Цивильск';
    lastQuery = query;
    getWeather(query);
    cityInput.blur(); 
  }
});

document.getElementById('city-search-btn').addEventListener('click', function () {
  const query = cityInput.value.trim() || 'Цивильск';
  lastQuery = query;
  getWeather(query);
});

// Часы
function updateClock() {
  const now = new Date();
  const weekDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const dayName = weekDays[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  setText('day-time', `${dayName} | ${hours}:${minutes}`);
}

function getIconByCondition(iconKey) {
  const iconMap = {
    'clear-day': 'clear-day.svg',
    'clear-night': 'clear-night.svg',
    'partly-cloudy-day': 'partly-cloudy-day.svg',
    'partly-cloudy-night': 'partly-cloudy-night.svg',
    'cloudy': 'cloudy.svg',
    'rain': 'rain.svg',
    'snow': 'snow.svg',
    'wind': 'wind.svg'
  };
  return iconMap[iconKey] || 'default.svg';
}


function startAutoUpdate() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
  }
  

  autoUpdateInterval = setInterval(() => {
    if (lastQuery) {
      getWeather(lastQuery);
    }
  }, 30 * 60 * 1000);
}

// Запуск
updateClock();
setInterval(updateClock, 60 * 1000);

initApp();
startAutoUpdate(); 