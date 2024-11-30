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
       try {
           const blob = new Blob(chunks, { type: 'video/mp4' });
           const fileName = `video_${Date.now()}.mp4`;
           
           // Display the captured video locally
           capturedVideo.style.display = 'block';
           capturedVideo.src = URL.createObjectURL(blob);
           
           // Upload video directly to Cloud Function
           const result = await sendToCloudFunction(blob, fileName);
           console.log('Upload successful:', result);
       } catch (error) {
           console.error('Error in onstop handler:', error);
       }
   };

   // Start recording and stop after 1.2 seconds
   mediaRecorder.start();
   setTimeout(() => mediaRecorder.stop(), 1200); // 1.2 seconds
});

// Send video directly to Cloud Function
async function sendToCloudFunction(videoBlob, fileName) {
   try {
       console.log('Starting upload...'); // Debug log
       console.log('File name:', fileName); // Debug log
       console.log('Blob size:', videoBlob.size); // Debug log

       const formData = new FormData();
       formData.append('video', videoBlob, fileName);

       // Log the FormData contents
       for (let pair of formData.entries()) {
           console.log('FormData entry:', pair[0], pair[1].name); // Debug log
       }

       const response = await fetch(CLOUD_FUNCTION_URL, {
           method: 'POST',
           mode: 'cors',
           headers: {
               'Accept': 'application/json',
           },
           body: formData
       });

       console.log('Response status:', response.status); // Debug log
       console.log('Response headers:', [...response.headers]); // Debug log

       // Get response text even if it's not JSON
       const textResponse = await response.text();
       console.log('Raw response:', textResponse); // Debug log

       try {
           const data = JSON.parse(textResponse);
           console.log('Parsed response:', data);
           return data;
       } catch (e) {
           console.error('Error parsing JSON:', textResponse);
           throw new Error('Invalid JSON response');
       }
       
   } catch (error) {
       console.error('Full error details:', error);
       throw error; // Re-throw to handle it in the calling code
   }
}

// Test endpoint accessibility
fetch(CLOUD_FUNCTION_URL, {
   method: 'OPTIONS'
}).then(r => console.log('Endpoint status:', r.status))
 .catch(error => console.error('Endpoint check failed:', error));
