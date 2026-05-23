const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
const cols = 200;
let cameraOn = false;
let animFrame;

function scaleAscii() {
  const pre = document.getElementById('ascii');
  const inner = document.getElementById('ascii-inner');
  if (!pre.textContent) return;
  // Reset scale first to measure natural size
  pre.style.transform = 'scale(1)';
  pre.style.fontSize = '5px';
  pre.style.lineHeight = '5px';
  const pw = pre.scrollWidth;
  const ph = pre.scrollHeight;
  const iw = inner.clientWidth - 8;
  const ih = inner.clientHeight - 8;
  const scale = Math.min(iw / pw, ih / ph);
  pre.style.transform = `scale(${scale})`;
}

function renderToAscii(source, w, h) {
  if (!w || !h) return;
  const canvas = document.getElementById('canvas');
  const rows = Math.floor((h / w) * cols * 0.5);
  canvas.width = cols;
  canvas.height = rows;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, cols, rows);

  const pixels = ctx.getImageData(0, 0, cols, rows).data;
  const pre = document.getElementById('ascii');
  pre.innerHTML = '';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      const char = chars[Math.floor(Math.random() * chars.length)];
      const span = document.createElement('span');
      span.textContent = char;
      span.style.color = `rgb(${r},${g},${b})`;
      pre.appendChild(span);
    }
    pre.appendChild(document.createTextNode('\n'));
  }

  scaleAscii();
}

// File upload
document.getElementById('myFile').addEventListener('change', function() {
  if (cameraOn) stopCamera();
  const img = document.getElementById('preview');
  img.src = URL.createObjectURL(this.files[0]);
  img.style.display = 'block';
  document.getElementById('placeholder').style.display = 'none';
  img.onload = function() {
    renderToAscii(img, img.naturalWidth, img.naturalHeight);
  };
});

// Camera
const camBtn = document.getElementById('camBtn');
const video = document.getElementById('video');

camBtn.addEventListener('click', function() {
  cameraOn ? stopCamera() : startCamera();
});

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('preview').style.display = 'none';
    document.getElementById('placeholder').style.display = 'none';
    cameraOn = true;
    camBtn.textContent = '⏹ Stop Camera';
    camBtn.classList.add('active');
    video.onloadedmetadata = function() {
      function loop() {
        renderToAscii(video, video.videoWidth, video.videoHeight);
        animFrame = requestAnimationFrame(loop);
      }
      loop();
    };
  }).catch(function() {
    alert('Could not access camera');
  });
}

function stopCamera() {
  cancelAnimationFrame(animFrame);
  video.srcObject.getTracks().forEach(t => t.stop());
  video.style.display = 'none';
  cameraOn = false;
  camBtn.textContent = '📷 Camera';
  camBtn.classList.remove('active');
  document.getElementById('placeholder').style.display = 'block';
  document.getElementById('ascii').innerHTML = '';
}

window.addEventListener('resize', scaleAscii);