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
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
        console.error('User not authenticated');
        alert('Please sign in first');
        return;
    }

    const stream = cameraFeed.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        try {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const fileName = `video_${Date.now()}.mp4`;
            
            capturedVideo.style.display = 'block';
            capturedVideo.src = URL.createObjectURL(blob);
            
            const result = await sendToCloudFunction(blob, fileName);
            console.log('Upload successful:', result);
        } catch (error) {
            console.error('Error in onstop handler:', error);
        }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 1200);
});

// Send video directly to Cloud Function
async function sendToCloudFunction(videoBlob, fileName) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No authenticated user');
        }

        console.log('Starting upload...'); 
        console.log('File name:', fileName); 
        console.log('Blob size:', videoBlob.size);

        // Get fresh token
        const idToken = await user.getIdToken(true);
        
        const formData = new FormData();
        formData.append('video', videoBlob, fileName);

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: formData
        });

        console.log('Response status:', response.status);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, response: ${textResponse}`);
        }

        const data = JSON.parse(textResponse);
        console.log('Parsed response:', data);
        return data;
        
    } catch (error) {
        console.error('Full error details:', error);
        throw error;
    }
}

// Export for use in other modules if needed
export { sendToCloudFunction };
