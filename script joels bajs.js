'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let inputData = {};

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor({ coords, distance, duration, cadence }) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor({ coords, distance, duration, elevationGain }) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);

console.log(run1);
console.log(cycling1);

////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}/`);

    const coords = [latitude, longitude];

    console.log(this);
    this.#map = L.map('map').setView(coords, 13);
    //   console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;

    // BACKA HIT!!!

    //   //Joels:
    inputData = {
      type: inputType.value,
      distance: inputDistance.value,
      duration: inputDuration.value,
      cadence: inputCadence.value,
      elevation: inputElevation.value,
      coords: [lat, lng],
    };
    console.log('inputData:', inputData);
    console.log('this.#mapEvent:', this.#mapEvent);

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //   //Joels:
    if (inputData.type === 'running') {
      const bajs = new Running(inputData);
      console.log(new Running(inputData));
      console.log('bajs:', bajs);
      window.localStorage.setItem('bajs', bajs.cadence);
      console.log(window.localStorage);
    }
    const workoutLabel = function (workoutType) {
      return `${workoutType === 'running' ? 'Running' : 'Cycling'} on ${
        months[mm - 1]
      } ${dd}`;
    };

    // Display marker
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${inputData.type}-popup`,
        })
      )
      .setPopupContent(
        `${inputData.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workoutLabel(
          inputData.type
        )}`
      )
      .openPopup();
    form.classList.add('hidden');

    const upperCase = function (string) {
      return `${string[0].toUpperCase()}${string.slice(1)}`;
    };
    const htmlBajs = `<li class="workout workout--${
      inputData.type
    }" data-id="1234567890"> <h2 class="workout__title">${workoutLabel(
      inputData.type
    )}</h2> <div class="workout__details">  <span class="workout__icon">${
      inputData.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
    }</span>  <span class="workout__value">${
      inputData.distance
    }</span>   <span class="workout__unit">km</span> </div> <div class="workout__details">  <span class="workout__icon">⏱</span>   <span class="workout__value">${
      inputData.duration
    }</span>  <span class="workout__unit">min</span></div><div class="workout__details">  <span class="workout__icon">⚡️</span>  <span class="workout__value">4.6</span>  <span class="workout__unit">min/km</span></div><div class="workout__details">  <span class="workout__icon">${
      inputData.type === 'running' ? '🦶🏼' : '⛰'
    }</span>  <span class="workout__value">${
      inputData.type === 'running' ? inputData.cadence : inputData.elevation
    }</span>  <span class="workout__unit">${
      inputData.type === 'running' ? 'spm' : 'm'
    }</span></div></li>`;

    containerWorkouts.insertAdjacentHTML('beforeend', htmlBajs);
  }
}

const app = new App();

// class Workout {
//   #id;
//   date = today;
//   constructor({ distance, duration, cadence, elevation, coords }) {
//     this.distance = distance;
//     this.cadence = cadence;
//     this.duration = duration;
//     this.coords = coords;
//   }
// }

// class Running extends Workout {
//   constructor(distance, duration, coords, cadence, pace) {
//     super(distance, duration, coords, cadence);
//     this.pace = this.cadence;
//   }
// }

// // Joels:
// Get today's date
let today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();
console.log(months[mm - 1]);
today = mm + '/' + dd + '/' + yyyy;

// SUBMIT!!!

// console.log(today);
