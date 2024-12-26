# TaskScribe

TaskScribe is an intelligent live call task detection system that automatically identifies and records tasks mentioned during voice calls or meetings. Using Azure's Speech Recognition technology, it transcribes conversations in real-time and extracts potential tasks or action items.

## Features

- Real-time speech recognition using Azure Speech Services
- Multi-language support
- Automatic task detection using keyword analysis
- Local file-based task storage
- Simple and intuitive web interface
- Continuous recording capability

## Use Cases

- **Remote Meetings**: Capture action items during virtual team meetings without manual note-taking
- **Client Calls**: Record client requirements and commitments automatically
- **Project Discussions**: Track assigned tasks and responsibilities in real-time
- **Interview Notes**: Document follow-up items during interviews
- **Personal Task Management**: Convert verbal todos into written tasks

## Getting Started

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Configure Azure Speech Services:
   - Sign up for Azure Speech Services
   - Copy your subscription key and region
   - Update `config.js` with your credentials

4. Start the server:
```bash
npm start
```

5. Open `http://localhost:3000` in your browser

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Speech Recognition: Azure Speech Services
- Storage: Local file system

## Configuration

1. Copy `config.example.js` to `config.js`:
```bash
cp config.example.js config.js
```

2. Update `config.js` with your Azure credentials:
```javascript
const config = {
    azureKey: 'YOUR_AZURE_SUBSCRIPTION_KEY',
    azureRegion: 'YOUR_AZURE_REGION'
};
```

Note: `config.js` is gitignored to prevent accidentally committing sensitive credentials.

## Task Detection

TaskScribe identifies tasks using keyword analysis. Current trigger words include:
- "need to"
- "must"
- "should"
- "task:"
- "todo:"
- "please"

All detected tasks are saved in `Tasks.txt` with timestamps for easy reference.

## Contributing

Feel free to contribute to this project by:
- Adding more sophisticated task detection algorithms
- Implementing additional speech recognition services
- Improving the user interface
- Adding task categorization features
- Implementing cloud storage options

## License

MIT License

## Author

[Your Name]
