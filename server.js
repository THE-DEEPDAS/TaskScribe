const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const TASKS_FILE = path.join(__dirname, 'Tasks.txt');

app.post('/api/tasks', async (req, res) => {
    try {
        const { task } = req.body;
        await fs.appendFile(TASKS_FILE, task);
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving task:', err);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
