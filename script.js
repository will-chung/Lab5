// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

let canvas = document.getElementById('user-image');
let context = canvas.getContext('2d');

let speech = window.speechSynthesis;
let voice;

let wrapper = {
  canvas_fields: {
    BAR_TOP: 50,
    BAR_BOTTOM: 50,
    MARGIN_LEFT: .2,
    MARGIN_RIGHT: .2
  },
  clear: (event) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  },
  drawImage: (image, bg) => {
    context.fillStyle = bg;
    context.fillRect(0, 0, canvas.width, canvas.height);
    let dims = getDimensions(canvas.width, canvas.height, image.width, image.height);
    context.drawImage(image, dims.startX, dims.startY, dims.width, dims.height);
  },
  drawText: (bottom_text, top_text, color, font) => {
    context.textAlign = 'center';
    context.fillStyle = color;
    context.font = font;
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(top_text, canvas.width/2, 40 + 10, canvas.width);
    context.strokeText(bottom_text, canvas.width/2, canvas.height - 20, canvas.width);
    context.fillText(top_text, canvas.width/2, 40 + 10, canvas.width);
    context.fillText(bottom_text, canvas.width/2, canvas.height - 20, canvas.width);
  }
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  wrapper.drawImage(img, 'black');
});

document.getElementById('image-input').addEventListener('change', (event) => {
  let files = event.target.files;
  let url = URL.createObjectURL(files[0]);
  img.src = url;
  img.alt = files[0].name;
});

document.getElementById('generate-meme').addEventListener('submit', (event) => {
  event.preventDefault();
  let top_text = document.getElementById('text-top').value;
  let bottom_text = document.getElementById('text-bottom').value;
  wrapper.drawText(bottom_text, top_text, 'white', 'bold 40px "Fira Sans", sans-serif');
  
  event.target.querySelector('button[type=\'submit\']').disabled = true;
  event.target.querySelector('button[type=\'reset\']').disabled = false;
  event.target.querySelector('button[type=\'button\']').disabled = false;
  document.getElementById('voice-selection').disabled = false;
});

document.querySelector('button[type=\'reset\']').addEventListener('click', (event) => {
  wrapper.clear();
  document.querySelector('button[type=\'submit\']').disabled = false;
  document.querySelector('button[type=\'reset\']').disabled = true;
  document.querySelector('button[type=\'button\']').disabled = true;
  document.getElementById('voice-selection').disabled = false;
});

function selectVoice() {
  let selection = voiceSelect.value;
  speech.getVoices().forEach(currVoice => {
    if (currVoice.name == selection)
      voice = currVoice;
  });
}

document.querySelector('button[type=\'button\']').addEventListener('click', () => {
  selectVoice();

  let top_text = new SpeechSynthesisUtterance(document.getElementById('text-top').value);
  top_text.voice = voice;
  let bottom_text = new SpeechSynthesisUtterance(document.getElementById('text-bottom').value);
  bottom_text.voice = voice;

  let slider_volume = document.querySelector('#volume-group > input[type=\'range\']');

  let volume = Number(slider_volume.value);
  let volume_max = Number(slider_volume.max);
  top_text.volume = (volume / volume_max);
  bottom_text.volume = (volume / volume_max);

  speech.speak(top_text);
  speech.speak(bottom_text);
});

document.querySelector('#volume-group > input[type=\'range\']').addEventListener('change', (event) => {
  let slider_volume = document.querySelector('#volume-group > input[type=\'range\']');
  let volume = Number(slider_volume.value);
  let volume_icon = document.querySelector('#volume-group > img');
  if(volume == 0) {
    volume_icon.src='icons/volume-level-0.svg'
  }else if(volume <= 33) {
    volume_icon.src='icons/volume-level-1.svg'
  }else if(volume <= 66) {
    volume_icon.src='icons/volume-level-2.svg'
  }else {
    volume_icon.src='icons/volume-level-3.svg'
  }
});

let voiceSelect = document.getElementById('voice-selection');

speech.addEventListener('voiceschanged', () => {
  // clear
  for (let i = 0; i < voiceSelect.options.length; i++) {
    voiceSelect.remove(i);
  }

  // repopulate
  let voiceOptions = speech.getVoices();
  voiceOptions.forEach(voice => {
    let option;
    if (voice.default) {
      option = new Option(voice.name + ' (' + voice.lang + ') -- DEFAULT', voice.name, true, false);
    } else {
      option = new Option(voice.name + ' (' + voice.lang + ')', voice.name, false, false);
    }
    voiceSelect.appendChild(option);
  });
});

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
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the aspect ratio is less than 1 it's a vertical image
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