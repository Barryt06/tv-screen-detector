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
    const bucketUrl = 'https://storage.googleapis.com/upload/storage/v1/b/sync_app_video_samples/o';
    const accessToken = '<Yya29.a0AeDClZAmdO1PcboI21zMa5Z9muR-d0EIwOzCaN4USJXTHxUpULbGuziqBrBB1_hSFJuhHAVlAngNjUZ58Bhqaw7Wtxdm9UgwWugOuOoDFI2iXR1l6wX1nnCW_VW3EyNSTNoMej9BMhuKDOtbMrbIcSaITwQSdLMtNFHQ_MSi91j5ZupcaCgYKAbISARMSFQHGX2MilgSnTS4cOtkColGeOfjxqA0183>'; // Replace with a valid OAuth token

    const formData = new FormData();
    formData.append('file', videoBlob, fileName);
    formData.append('name', fileName);

    try {
        const response = await fetch(`${bucketUrl}?uploadType=multipart`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            console.log(`Video uploaded successfully: ${fileName}`);
        } else {
            console.error('Failed to upload video:', await response.text());
        }
    } catch (error) {
        console.error('Error uploading video:', error);
    }
}
