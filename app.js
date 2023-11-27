const express = require('express');
const multer = require('multer');
const fs = require('fs');
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'myInfo.json';
const speech = require('@google-cloud/speech');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Replace 'YOUR_GOOGLE_PROJECT_ID' with your Google Cloud Project ID
const projectId = 'call-recording-key-pointers';
const client = new speech.SpeechClient({ projectId });


app.post('/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const audioFilePath = req.file.path;

    // Using Google Cloud Speech-to-Text
    const audio = {
        content: fs.readFileSync(audioFilePath).toString('base64'),
    };

    const request = {
        audio: audio,
        config: {
            encoding: 'MP3', // Specify MP3 encoding
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
    };

    try {
        const [response] = await client.recognize(request);
        console.log(response.results[0].alternatives[0])
        const transcription = await response.results.map(result => result.alternatives[0].transcript).join(' ');
        // Display the extracted text
        res.send(`<p id="result-data">${transcription}.</p>`);
        console.log("audio to text convert successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing audio file.');
    } finally {
        // Remove the uploaded file
        fs.unlinkSync(audioFilePath);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

