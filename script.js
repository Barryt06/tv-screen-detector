// References to HTML elements
const cameraFeed = document.getElementById('cameraFeed');
const captureVideoButton = document.getElementById('captureVideo');
const capturedVideo = document.getElementById('capturedVideo');

// Cloud Function URL
const CLOUD_FUNCTION_URL = 'https://europe-west2-sync-app-440921.cloudfunctions.net/video_vision_http';

// Stream video feed from the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        cameraFeed.srcObject = stream;
    })
    .catch(error => {
        console.error("Error accessing camera:", error);
    });

// Capture and upload video
captureVideoButton.addEventListener('click', async () => {
    // Set up MediaRecorder to record the video
    const stream = cameraFeed.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    // Collect video data
    mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
    };

    // Send to Cloud Function when recording stops
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const fileName = `video_${Date.now()}.mp4`;

        // Display the captured video locally
        capturedVideo.style.display = 'block';
        capturedVideo.src = URL.createObjectURL(blob);

        // Upload video directly to Cloud Function
        await sendToCloudFunction(blob, fileName);
    };

    // Start recording and stop after 1.2 seconds
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 1200); // 1.2 seconds
});

// Send video directly to Cloud Function
async function sendToCloudFunction(videoBlob, fileName) {
    try {
        // Get auth token for Cloud Function
        const token = await firebase.auth().currentUser.getIdToken();
        
        const formData = new FormData();
        formData.append('video', videoBlob, fileName); // Note: changed 'file' to 'video' to match Cloud Function

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Cloud Function response:', data);
        
        // You might want to do something with the response
        // data.time_detected will have the detected time
        
    } catch (error) {
        console.error('Error sending video to Cloud Function:', error);
    }
}
