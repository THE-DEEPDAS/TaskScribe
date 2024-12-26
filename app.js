class LiveCallTaskNoter {
    constructor() {
        this.isRecording = false;
        this.speechConfig = null;
        this.recognizer = null;
        this.audioConfig = null;
        this.setupAzureSpeech();
        this.setupUI();
    }

    setupAzureSpeech() {
        try {
            if (!config.azureKey || !config.azureRegion) {
                throw new Error('Azure credentials not configured');
            }
            this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(config.azureKey, config.azureRegion);
            this.speechConfig.speechRecognitionLanguage = 'en-US';
            this.status.textContent = 'Speech SDK initialized';
        } catch (err) {
            console.error('Speech SDK initialization failed:', err);
            this.status.textContent = 'Failed to initialize speech recognition';
        }
    }

    setupUI() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.taskList = document.getElementById('taskList');

        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
    }

    async startRecording() {
        try {
            if (!this.speechConfig) {
                throw new Error('Speech config not initialized');
            }

            this.status.textContent = 'Requesting microphone access...';
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, this.audioConfig);

            this.recognizer.recognizing = (s, e) => {
                this.status.textContent = 'Recognizing...';
                console.log('Recognizing:', e.result.text);
            };

            this.recognizer.recognized = (s, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    console.log('Recognized:', e.result.text);
                    this.processTranscript(e.result.text);
                }
            };

            this.recognizer.canceled = (s, e) => {
                console.log('Canceled:', e);
                this.status.textContent = `Recognition canceled: ${e.errorDetails}`;
                this.stopRecording();
            };

            await new Promise((resolve, reject) => {
                this.recognizer.startContinuousRecognitionAsync(
                    () => {
                        this.isRecording = true;
                        this.startBtn.disabled = true;
                        this.stopBtn.disabled = false;
                        this.status.textContent = 'Recording started';
                        resolve();
                    },
                    (err) => {
                        reject(err);
                    }
                );
            });
            
        } catch (err) {
            console.error('Error starting recognition:', err);
            this.status.textContent = `Error: ${err.message}`;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }

    stopRecording() {
        if (this.recognizer) {
            this.recognizer.stopContinuousRecognitionAsync(
                () => {
                    this.isRecording = false;
                    this.startBtn.disabled = false;
                    this.stopBtn.disabled = true;
                    this.status.textContent = 'Recording stopped';
                    
                    // Cleanup
                    this.recognizer.close();
                    this.recognizer = null;
                },
                (err) => {
                    console.error('Error stopping recognition:', err);
                    this.status.textContent = 'Error stopping recording';
                }
            );
        }
    }

    processTranscript(transcript) {
        // Simple task detection - looking for keywords
        const taskKeywords = ['need to', 'must', 'should', 'task:', 'todo:', 'please'];
        const sentences = transcript.split(/[.!?]+/);
        
        sentences.forEach(sentence => {
            const containsTaskKeyword = taskKeywords.some(keyword => 
                sentence.toLowerCase().includes(keyword)
            );
            
            if (containsTaskKeyword) {
                this.addTaskToList(sentence.trim());
                this.saveTaskToNotes(sentence.trim());
            }
        });
    }

    addTaskToList(task) {
        const li = document.createElement('li');
        li.textContent = task;
        this.taskList.appendChild(li);
    }

    async saveTaskToNotes(task) {
        const timestamp = new Date().toISOString();
        const noteEntry = `${timestamp}: ${task}\n`;
        
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: noteEntry })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save task');
            }
        } catch (err) {
            console.error('Error saving task:', err);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    if (!window.SpeechSDK) {
        document.getElementById('status').textContent = 'Speech SDK not loaded';
        return;
    }
    const taskNoter = new LiveCallTaskNoter();
});
