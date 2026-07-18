const cityInput = document.getElementById('city-input');
const cityName = cityInput.value.trim() || 'Москва';


function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getWeather(query) {
  if (!query) {
    query = cityInput.value.trim() || 'Москва';
  }
  currentCity = cityName;
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');

  const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(query)}?unitGroup=metric&key=8LQF97DXMZVN5M9FTABV3BC6Y&contentType=json&lang=ru`;


  fetch(API_URL)


    .then(response => response.json())
    .then(data => {
      const current = data.currentConditions;
      const today = data.days[0];


      setText('city-name', data.resolvedAddress.split(',')[0]);
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
        // Visual Crossing присылает: clear-day, cloudy, rain, snow, wind и т.д.
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
        const iconName = iconMap[current.icon]
        const img = document.createElement('img');
        img.src = `images/icons/${iconName}`
        img.alt = `Погода: ${current.icon || 'неизвестно'}`
        img.style.width = '40px'
        weatherIcon.innerHTML = '';
        weatherIcon.appendChild(img)
      }


      const dateObj = new Date(today.datetime); // Дата сегодня
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
    <div style="display:flex;justify-content:center"><img style='width:40px;height:40px' src=images/icons/${getIconByCondition(day.icon)} alt='Погода: ${current.icon || 'неизвестно'}' /></div>
    <div>${Math.round(day.temp)}°</div>
  `;
        forecastContainer.appendChild(dayEl);
      });
      if (loader) loader.classList.add('hidden');
      console.log(data)
    })
    .catch(error => {
      console.error('Ошибка:', error)
      if (loader) loader.classList.add('hidden');
    });

}

function initApp() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const coords = `${position.coords.latitude},${position.coords.longitude}`;
      getWeather(coords);
    }, () => {
      getWeather('Цивильск')
    }
    )
  } else {
    getWeather('Цивильск')
  }
}




cityInput.addEventListener('change', function () {
  getWeather();
});


cityInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    getWeather();
  }
});

document.getElementById('city-search-btn').addEventListener('click', function () {
  getWeather();
});

// Функция для обновления только времени
function updateClock() {
  const now = new Date();

  // Получаем день недели
  const weekDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const dayName = weekDays[now.getDay()];

  // Форматируем время HH:mm
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
  return iconMap[iconKey] || '🌤️';
}

setInterval(updateClock, 60 * 1000);

updateClock();

setInterval(getWeather, 10 * 60 * 1000);
initApp()
