// src/AppStyles.js
import styled from 'styled-components';

export const Container = styled.div`
  max-width: 600px;
  height: 90vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: #e0f7ff;
  border: 1px solid #b3e5fc;
  border-radius: 10px;
  overflow: hidden;
`;

export const Header = styled.h1`
  text-align: center;
  background-color: #81d4fa;
  color: white;
  padding: 20px;
  margin: 0;
`;

export const ChatContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f1faff;
`;

export const ChatBubble = styled.div`
  max-width: 80%;
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 20px;
  position: relative;
  clear: both;

  &.user {
    background-color: #81d4fa;
    color: white;
    float: right;
    border-bottom-right-radius: 0;
  }

  &.bot {
    background-color: #ffffff;
    color: #333;
    float: left;
    border-bottom-left-radius: 0;
  }
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e0f7ff;
`;

export const MicButton = styled.button`
  background-color: ${(props) => (props.isListening ? '#ff5252' : '#81d4fa')};
  color: white;
  border: none;
  border-radius: 50%;
  padding: 12px;
  margin-right: 10px;
  cursor: pointer;
`;

export const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #b3e5fc;
  border-radius: 20px;
  outline: none;
`;

export const SendButton = styled.button`
  background-color: #81d4fa;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 12px;
  margin-left: 10px;
  cursor: pointer;
`;
