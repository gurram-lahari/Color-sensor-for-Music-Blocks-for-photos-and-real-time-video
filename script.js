const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const xInput = document.getElementById('x');
const yInput = document.getElementById('y');
const colorText = document.getElementById('colorText');
const colorPreview = document.getElementById('colorPreview');

let audioCtx = null;

// Initialize AudioContext on first user interaction
document.body.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log("AudioContext initialized");
  }
}, { once: true });

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    requestAnimationFrame(drawToCanvas);
  })
  .catch(err => console.error("Webcam error:", err));

// Draw webcam feed to canvas continuously
function drawToCanvas() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame(drawToCanvas);
}

// When button clicked: get color and play note
document.getElementById('getColor').addEventListener('click', () => {
  const x = parseInt(xInput.value);
  const y = parseInt(yInput.value);
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

  colorText.textContent = `Color at (${x}, ${y}): ${rgb}`;
  colorPreview.style.background = rgb;

  const note = mapColorToNote(pixel[0], pixel[1], pixel[2]);
  playNote(note);
});

// Map RGB to musical note
function mapColorToNote(r, g, b) {
  if (r > 200 && g < 100 && b < 100) return 'C4';      // Red
  if (r < 100 && g > 200 && b < 100) return 'D4';      // Green
  if (r < 100 && g < 100 && b > 200) return 'E4';      // Blue
  if (r > 200 && g > 200 && b < 100) return 'F4';      // Yellow
  if (r > 150 && g < 100 && b > 150) return 'G4';      // Pink
  if (r < 100 && g > 150 && b > 150) return 'A4';      // Cyan
  return 'B4'; // Default
}

// Play note
function playNote(note) {
  if (!audioCtx) {
    alert("Please click anywhere on the page first to enable sound.");
    return;
  }

  const freqMap = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
  };

  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(freqMap[note], audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
}
