// References to HTML elements
const cameraFeed = document.getElementById('cameraFeed');
const captureVideoButton = document.getElementById('captureVideo');
const capturedVideo = document.getElementById('capturedVideo');

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

    // Save and upload video when recording stops
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const fileName = `video_${Date.now()}.mp4`;

        // Display the captured video locally
        capturedVideo.style.display = 'block';
        capturedVideo.src = URL.createObjectURL(blob);

        // Upload video to Google Cloud Storage
        await uploadToCloudStorage(blob, fileName);
    };

    // Start recording and stop after 1.2 seconds
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 1200); // 1.2 seconds
});

// Upload video to Google Cloud Storage
async function uploadToCloudStorage(videoBlob, fileName) {
   
    const formData = new FormData();
    formData.append('file', videoBlob, fileName);
    formData.append('name', fileName);

    try {
        fetch('https://serene-tundra-24888-5b5b7931001b.herokuapp.com/api/upload', {
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

           
        
    } catch (error) {
        console.error('Error uploading video:', error);
    }
}




        


