// References to HTML elements
const cameraFeed = document.getElementById('cameraFeed');
const captureVideoButton = document.getElementById('captureVideo');
const capturedVideo = document.getElementById('capturedVideo');

// Cloud Function URL
const CLOUD_FUNCTION_URL = 'https://europe-west2-sync-app-440921.cloudfunctions.net/video_vision_http';

// Add auth state observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        captureVideoButton.disabled = false;  // Enable capture button when signed in
    } else {
        console.log('No user signed in');
        captureVideoButton.disabled = true;   // Disable capture button when not signed in
        initializeNotifications();  // Your existing auth function
    }
});

// Initialize camera and setup
document.addEventListener('DOMContentLoaded', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error("Camera enumeration not supported");
        return;
    }

    try {
        // List available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Add cameras to select dropdown
        cameraSelect.innerHTML = '';
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            if (option.text.toLowerCase().includes('back') || 
                option.text.toLowerCase().includes('environment')) {
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        });

        // Start camera with selected device (or back camera)
        const constraints = {
            video: {
                facingMode: "environment"  // Try back camera first
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        cameraFeed.srcObject = stream;
        console.log('Camera initialized successfully');
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
});

// Handle camera switching
cameraSelect.addEventListener('change', async () => {
    try {
        // Stop current stream
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Start new stream with selected camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: cameraSelect.value }
            },
            audio: false
        });
        currentStream = stream;
        cameraFeed.srcObject = stream;
    } catch (error) {
        console.error("Error switching camera:", error);
    }
});

// Capture and upload video
captureVideoButton.addEventListener('click', async () => {
    // Check if user is authenticated using Firebase directly
    const currentUser = firebase.auth().currentUser;  // Use Firebase's getAuth()
    if (!currentUser) {
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
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        console.log('Starting upload...'); 
        console.log('File name:', fileName); 
        console.log('Blob size:', videoBlob.size);

        // Get fresh token
        const idToken = await currentUser.getIdToken(true);
        
        const formData = new FormData();
        formData.append('video', videoBlob, fileName);

        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]); // Debug line
        }

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${idToken}`,
                'Origin': 'https://xav123j.github.io'   // Add your site origin
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
