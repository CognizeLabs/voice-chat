// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Header,
  ChatContainer,
  ChatBubble,
  Controls,
  MicButton,
  InputField,
  SendButton,
} from './AppStyles';
import { FiMic, FiMicOff, FiSend } from 'react-icons/fi';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
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
        const options = { mimeType: 'audio/webm' };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
    formData.append('file', audioBlob, 'voice.webm');

    // Display loading message
    const userMessageId = uuidv4();
    setChatHistory(prev => [...prev, { id: userMessageId, type: 'user', text: 'Sending audio...' }]);

    axios.post('http://localhost:5000/api/voice', formData)
      .then(response => {
        const { transcript, reply } = response.data;
        setChatHistory(prev => [
          ...prev.filter(msg => msg.id !== userMessageId), // Remove 'Sending audio...' message
          { id: uuidv4(), type: 'user', text: transcript },
          { id: uuidv4(), type: 'bot', text: reply }
        ]);
        // Optionally, use text-to-speech for bot response
        // speakText(reply);
      })
      .catch(error => {
        console.error('Error sending audio to server:', error);
        setChatHistory(prev => [
          ...prev.filter(msg => msg.id !== userMessageId),
          { id: uuidv4(), type: 'bot', text: 'Error processing audio.' }
        ]);
      });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendText = () => {
    if (inputText.trim() === '') return;

    const userMessage = { id: uuidv4(), type: 'user', text: inputText };
    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');

    // Send text to the backend
    axios.post('http://localhost:5000/api/text', { text: userMessage.text })
      .then(response => {
        const { reply } = response.data;
        const botMessage = { id: uuidv4(), type: 'bot', text: reply };
        setChatHistory(prev => [...prev, botMessage]);
        // Optionally, use text-to-speech for bot response
        // speakText(reply);
      })
      .catch(error => {
        console.error('Error sending text to server:', error);
        const errorMessage = { id: uuidv4(), type: 'bot', text: 'Error processing your message.' };
        setChatHistory(prev => [...prev, errorMessage]);
      });
  };

  // Optional: Function to convert text to speech
  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(text);
    synth.speak(utterThis);
  };

  // Scroll to bottom when new message arrives
  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Container>
      <Header>Voice Chat App</Header>
      <ChatContainer ref={chatContainerRef}>
        {chatHistory.map((chat) => (
          <ChatBubble key={chat.id} className={chat.type}>
            <p>{chat.text}</p>
          </ChatBubble>
        ))}
      </ChatContainer>
      <Controls>
        <MicButton onClick={handleMicClick} isListening={isListening}>
          {isListening ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </MicButton>
        <InputField
          type="text"
          placeholder="Type a message"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendText();
            }
          }}
        />
        <SendButton onClick={handleSendText}>
          <FiSend size={24} />
        </SendButton>
      </Controls>
    </Container>
  );
}

export default App;
