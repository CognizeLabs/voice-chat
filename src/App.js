// src/App.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleMicClick = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const options = { mimeType: 'audio/webm' }; // Default format
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];
          sendAudioToServer(audioBlob);
        });
      })
      .catch(error => {
        console.error('Error accessing microphone', error);
        alert('Microphone access is required for recording.');
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioToServer = (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.wav');

    // Display loading message
    setChatHistory(prev => [...prev, { type: 'user', text: 'Sending audio...' }]);

    axios.post('http://localhost:5000/api/voice', formData)
      .then(response => {
        const { transcript, reply } = response.data;
        setChatHistory(prev => [
          ...prev.slice(0, -1), // Remove 'Sending audio...' message
          { type: 'user', text: transcript },
          { type: 'bot', text: reply }
        ]);
      })
      .catch(error => {
        console.error('Error sending audio to server:', error);
        setChatHistory(prev => [
          ...prev.slice(0, -1), // Remove 'Sending audio...' message
          { type: 'bot', text: 'Error processing audio.' }
        ]);
      });
  };

  return (
    <div className="container">
      <h1>Voice Chat App</h1>
      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-bubble ${chat.type}`}>
            <p><strong>{chat.type === 'user' ? 'You' : 'Bot'}:</strong> {chat.text}</p>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={handleMicClick} className={`mic-button ${isListening ? 'listening' : ''}`}>
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
}

export default App;
