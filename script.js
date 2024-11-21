
function getCameras() {
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const cameraSelect = document.getElementById('cameraSelect');
      cameraSelect.innerHTML = '';
      videoInputs.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error listing devices: ", err);
    });
}


function startCamera(deviceId) {
  const hdConstraints = {
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { min: 1280, ideal: 1920, max: 1920 },
    height: { min: 720, ideal: 1080, max: 1080 },
      // Enable automatic adjustment of the video to the environment
      facingMode: "environment", // or "environment" for the rear camera
      focusMode: "continuous", // request continuous focus
      exposureMode: "continuous", // request continuous exposure
    }
  };

  navigator.mediaDevices.getUserMedia(hdConstraints)
    .then(function(stream) {
      const cameraFeed = document.getElementById('cameraFeed');
      cameraFeed.srcObject = stream;
      // Ensure the video element has the appropriate event listeners for focus & exposure
      cameraFeed.addEventListener('click', function() {
        const track = stream.getVideoTracks()[0];
        // Apply constraints for focus and exposure dynamically when the user taps the screen
        track.applyConstraints({
          advanced: [{ focusMode: "continuous" }, { exposureMode: "continuous" }]
        });
      });
    })
    .catch(function(error) {
      console.error("Error accessing the camera: ", error);
      alert("An error occurred while accessing the camera.");
    });
}

 

function generateUUID() { // Helper function to generate UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Retrieve the UUID from local storage or generate if not present
const deviceIdentifier = localStorage.getItem('deviceIdentifier') || generateUUID();
localStorage.setItem('deviceIdentifier', deviceIdentifier);

function captureVideo() {
    const cameraFeed = document.getElementById('cameraFeed');
    const stream = cameraFeed.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    let videoChunks = [];

    // Generate UUID and UTC timestamp
    const uuid = generateUUID();
    const timestamp = new Date().toISOString();

    mediaRecorder.ondataavailable = function(e) {
        videoChunks.push(e.data);
    };

    mediaRecorder.onstop = function() {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const capturedVideo = document.getElementById('capturedVideo');
        capturedVideo.src = URL.createObjectURL(videoBlob);
        capturedVideo.style.display = 'block';

        // Convert Blob to FormData and send to server
        const formData = new FormData();
        const filename = `captured_${uuid}_${timestamp}.webm`;
        formData.append('file', videoBlob, filename);

        // Include UUID and timestamp as metadata
        formData.append('uuid', uuid);
        formData.append('timestamp', timestamp);

        fetch('https://serene-tundra-24888-5b5b7931001b.herokuapp.com/api/upload_video', {
            method: 'POST',
            body: formData,
            headers: {
                'X-UUID': uuid,
                'X-Timestamp': timestamp
            }
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    };

    mediaRecorder.start();

    // Stop recording after a set duration
    setTimeout(() => {
        mediaRecorder.stop();
    }, 1200); // Duration of recording in milliseconds
}





// Event listeners
window.addEventListener('DOMContentLoaded', () => {
    getCameras();
    document.getElementById('switchCamera').addEventListener('click', () => {
        const selectedCameraId = document.getElementById('cameraSelect').value;
        startCamera(selectedCameraId);
    });
    document.getElementById('captureVideo').addEventListener('click', captureVideo);
});

