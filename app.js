class LiveCallTaskNoter {
    constructor() {
        this.isRecording = false;
        this.speechConfig = null;
        this.recognizer = null;
        this.audioConfig = null;
        this.setupAzureSpeech();
        this.setupUI();
        this.languageSelect = document.getElementById('languageSelect');
    }

    setupAzureSpeech() {
        try {
            if (!window.SpeechSDK) {
                throw new Error('Speech SDK not loaded. Check your internet connection.');
            }

            if (!config.azureKey || !config.azureRegion) {
                throw new Error('Azure credentials not configured');
            }

            // Create speech configuration
            this.speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(
                config.azureKey, 
                config.azureRegion
            );

            // Set initial language
            this.updateSpeechLanguage();
            
            // Listen for language changes
            this.languageSelect.addEventListener('change', () => this.updateSpeechLanguage());
            
            this.status.textContent = 'Ready to record';
            this.status.className = 'success';
        } catch (err) {
            console.error('Speech SDK initialization failed:', err);
            this.status.textContent = `Error: ${err.message}`;
            this.status.className = 'error';
            this.startBtn.disabled = true;
        }
    }

    updateSpeechLanguage() {
        if (this.speechConfig) {
            this.speechConfig.speechRecognitionLanguage = this.languageSelect.value;
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

            // Request microphone permission first
            await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create audio config and recognizer
            this.audioConfig = window.SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            this.recognizer = new window.SpeechSDK.SpeechRecognizer(
                this.speechConfig, 
                this.audioConfig
            );

            // Set up recognition handlers
            this.setupRecognitionHandlers();

            // Start recognition
            this.recognizer.startContinuousRecognitionAsync(
                () => {
                    this.isRecording = true;
                    this.startBtn.disabled = true;
                    this.stopBtn.disabled = false;
                    this.status.textContent = 'Recording...';
                    this.status.className = 'recording';
                },
                (error) => {
                    console.error('Error starting recognition:', error);
                    this.status.textContent = `Failed to start recording: ${error.message || 'Unknown error'}`;
                    this.status.className = 'error';
                }
            );

        } catch (err) {
            console.error('Error accessing microphone:', err);
            this.status.textContent = `Microphone error: ${err.message}`;
            this.status.className = 'error';
        }
    }

    setupRecognitionHandlers() {
        this.recognizer.recognizing = (s, e) => {
            console.log('Recognizing:', e.result.text);
            this.status.textContent = 'Recognizing...';
        };

        this.recognizer.recognized = (s, e) => {
            if (e.result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
                console.log('Recognized:', e.result.text);
                this.processTranscript(e.result.text);
            }
        };

        this.recognizer.canceled = (s, e) => {
            console.log('Canceled:', e);
            this.status.textContent = `Recognition canceled: ${e.errorDetails}`;
            this.status.className = 'error';
            this.stopRecording();
        };

        this.recognizer.sessionStopped = (s, e) => {
            console.log('Session stopped');
            this.stopRecording();
        };
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

// Initialize only after DOM and Speech SDK are loaded
window.onload = () => {
    if (!window.SpeechSDK) {
        document.getElementById('status').textContent = 'Error: Speech SDK not loaded';
        document.getElementById('status').className = 'error';
        document.getElementById('startBtn').disabled = true;
        return;
    }
    const taskNoter = new LiveCallTaskNoter();
};
