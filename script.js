// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

let speech = window.speechSynthesis;
let voice;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
/**
  ------toggle the relevant buttons (submit, clear, and read text buttons) by disabling or enabling them as needed  
 */
  console.log('load fired');

  let canvas = document.getElementById('user-image');
  let context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  let dims = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

let imgInput = document.getElementById('image-input');

imgInput.addEventListener('change', (event) => {
  console.log('change fired');
  let files = event.target.files;
  let url = URL.createObjectURL(files[0]);
  img.src = url;
});

/*
on submit, generate your meme by grabbing the text in the two inputs with ids text-top and text-bottom,
and adding the relevant text to the canvas (note: you should still be able to add text to the canvas without an image uploaded)
toggle relevant buttons
*/

let form = document.getElementById('generate-meme');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let top_text = document.getElementById('text-top').value;
  let bottom_text = document.getElementById('text-bottom').value;
  let canvas = document.getElementById('user-image');
  let context = canvas.getContext('2d');

  context.fillStyle = 'black';
  context.font = 'sans serif 32px bold'
  context.fillText(top_text, 50, 50, canvas.width);
  context.fillText(bottom_text, 50, canvas.height-50, canvas.width);
  
  event.target.querySelector('button[type=\'submit\']').disabled = true;
  event.target.querySelector('button[type=\'reset\']').disabled = false;
  event.target.querySelector('button[type=\'button\']').disabled = false;
  document.getElementById('voice-selection').disabled = false;
});

let button_reset = document.querySelector('button[type=\'reset\']');

button_reset.addEventListener('click', (event) => {
  let canvas = document.getElementById('user-image');
  let context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);
  
  document.querySelector('button[type=\'submit\']').disabled = false;
  document.querySelector('button[type=\'reset\']').disabled = true;
  document.querySelector('button[type=\'button\']').disabled = true;
  document.getElementById('voice-selection').disabled = false;
});

let button_readText = document.querySelector('button[type=\'button\']');

button_readText.addEventListener('click', () => {
  let top_text = new SpeechSynthesisUtterance(document.getElementById('text-top').value);
  top_text.voice = speech.voice["Zuzana"];
  let bottom_text = new SpeechSynthesisUtterance(document.getElementById('text-bottom').value);
  top_text.voice = speech.voice["Zuzana"];

  let slider_volume = document.querySelector('#volume-group > input[type=\'range\']');

  // cast to number
  let volume = Number(slider_volume.value);

  // scale volume to interval [0, 1]
  let volume_max = slider_volume.max;
  top_text.volume = (volume / volume_max);
  bottom_text.volume = (volume / volume_max);

  speech.speak(top_text);
  speech.speak(bottom_text);

  
});

let voiceSelect = document.getElementById('voice-selection');
let voiceOptions = speech.getVoices();

speech.addEventListener('voiceschanged', () => {
  voiceOptions = speech.getVoices();
  voiceOptions.forEach(voice => {
    console.log(voice);
    let option;
    if (voice.default) {
      option = new Option(voice.name, voice.name, true, false);
    } else {
      option = new Option(voice.name, voice.name, false, false);
    }
    voiceSelect.appendChild(option);
  });
});

voiceSelect.addEventListener('change', (event) => {
  console.log(event.target.value);
  voice = event.target[event.target.value];
});

console.log(voiceSelect);

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
