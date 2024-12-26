class LiveCallTaskNoter {
    constructor() {
        this.isRecording = false;
        this.speechConfig = null;
        this.recognizer = null;
        this.setupAzureSpeech();
        this.setupUI();
    }

    setupAzureSpeech() {
        this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(config.azureKey, config.azureRegion);
        this.speechConfig.speechRecognitionLanguage = 'en-US';
        this.speechConfig.enableDictation();
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
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);

            this.recognizer.recognized = (s, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    this.processTranscript(e.result.text);
                }
            };

            this.recognizer.startContinuousRecognitionAsync();
            this.isRecording = true;
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.status.textContent = 'Recording...';
            
        } catch (err) {
            console.error('Error starting recognition:', err);
        }
    }

    stopRecording() {
        if (this.recognizer) {
            this.recognizer.stopContinuousRecognitionAsync();
            this.isRecording = false;
            
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.status.textContent = 'Not recording';
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
    const taskNoter = new LiveCallTaskNoter();
});
