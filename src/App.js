import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ParticlesComponent from './particles';
import './App.css';


const socket = io('https://handy-cricket-backend.onrender.com/')
function App() {
  const [userName, setUserName] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [playMatch, setPlayMatch] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [activeRooms, setActiveRooms] = useState([{}]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isShowError, setShowError] = useState(false);
  const [isSelectMode, setSelectedMode] = useState(false);
  const setUser = () => {
    if (!document.getElementById('name').value) {
      setShowError(true);
      return;
    }
    setUserRegistered(true);
    setUserName(document.getElementById('name').value);
  }

  const createRoom = () => {
    socket.emit('create room', userName);
    setRoomCreated(true);
  }

  const joinRoom = () => {
    const roomId = document.getElementById('room-id').value;
    socket.emit('join room', userName, roomId);
  }

  const playerMove = (move) => {
    socket.emit('player move', roomId, move);
    setIsDisabled(true);
  }
  
  const modeSelected = (mode) => {
    setSelectedMode(true);
    if (mode === 'singlePlayer') {
      socket.emit('play with cpu', userName);
    }
  }

  useEffect(() => {
    socket.on('room created', (roomId) => {
      setRoomId(roomId);
    });

    socket.on('room not found', () => {
      alert('Room not found');
    });

    socket.on('room full', () => {
      alert('Room is full only 2 users allowed');
    });

    socket.on('can play now', (roomId, activeRooms) => {
      setPlayMatch(true);
      setRoomId(roomId);
      setActiveRooms(activeRooms);
    });

    socket.on('score updated', (activeRooms) => {
      setActiveRooms(activeRooms);
      setIsDisabled(false);
    })

    socket.on('bowled out', (batting, bowling, activeRooms, batterScore) => {
      alert(`${batting} scored ${batterScore} and is Bowled Out.  ${bowling} will bat now`);
      setIsDisabled(false);
      setActiveRooms(activeRooms);
    })
    
    socket.on('user2 won match', (winner, roomId) => {
      let playOneMoreMatch = window.confirm(`${winner} won the match Do you want to play one more match?`);
      if (playOneMoreMatch) {
        socket.emit('play again', roomId);
      }
      else {
        setUserName('');
        setUserRegistered(false);
        setPlayMatch(false);
        setRoomCreated(false);
        setActiveRooms([]);
        setIsDisabled(false);
      }
    })
    
    socket.on('restartMatch', (activeRooms) => {
      setActiveRooms(activeRooms);
      setIsDisabled(false);
    })

    socket.on('out', (winner, draw, activeRooms, roomId) => {
      setActiveRooms(activeRooms);
      let playOneMoreMatch;
      if (draw) {
        playOneMoreMatch = window.confirm('Match Draw Do You want to play one more match?');
      }
      else {
        playOneMoreMatch = window.confirm(`${winner} won the match Do You want to play one more match?`);
      }
      if (playOneMoreMatch) {
        socket.emit('play again', roomId);
      }
      else {
        setUserName('');
        setUserRegistered(false);
        setPlayMatch(false);
        setRoomCreated(false);
        setActiveRooms([]);
        setIsDisabled(false);
      }
    })

  }, []);
  return (
    <>
      <ParticlesComponent id='particles'></ParticlesComponent>
      {!userRegistered && !roomCreated &&
        <>
          <div className='d-flex justify-content-center text-danger p-3'><h1> Hand Cricket </h1></div>
          <div className='d-flex  flex-column align-items-center justify-content-center' style={{ 'height': '70%' }}>
            <h2>Enter Name</h2>
            <div style={{ 'height': '10%', 'width': '100%', 'display': 'grid', 'placeItems': 'center' }}>
            <input type="text" className='form-control mt-4' id='name' style={{ 'width': '30%' }} />
            { isShowError && <p className='text-danger'> Please enter your name to start the game and join the excitement! </p> }
            </div>
            <button className='btn btn-primary mt-5' onClick={setUser}>Submit</button>
          </div>
        </>
      }
      
      {
        userRegistered && !isSelectMode &&
        <>
          <div className='d-flex  flex-column align-items-center justify-content-center h-100'>
            <h1>Select Mode To Continue</h1>
            <div>
              <button className='btn btn-primary' onClick={() => modeSelected('singlePlayer')}>Single Player</button>
              <button className='btn btn-primary ms-2' onClick={() => modeSelected('multiplayer')}>Multiplayer</button>
            </div>
          </div>
        </>
      }
       
      {
        roomCreated && !playMatch && userRegistered && isSelectMode &&
        <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
          <h1>Room Id: {roomId}</h1>
          <h1>Waiting for your friend to join</h1>
        </div>
      }
      

      {!playMatch && userRegistered && !roomCreated && isSelectMode &&
        <>
          <div className="App d-flex justify-content-center align-items-center h-100">
            <div className='d-flex flex-column'>
              <h1>Create Room</h1>
              <button className='btn btn-primary' onClick={createRoom}>Create Room</button>
            </div>
            <div className='ms-5 text-center'>
              <h1 className='mt-4'>Join Room</h1>
              <input type="text" className='form-control mt-2' id="room-id" />
              <button className='btn btn-primary mt-2' onClick={joinRoom}>Join Room</button>
            </div>
          </div>
        </>
      }
      {playMatch &&
        <>
          <h1 className='text-center mt-4'>{activeRooms[roomId]?.users[0].userName} vs {activeRooms[roomId]?.users[1].userName}</h1>
          <div className='d-flex justify-content-between p-4'>
            <h3>Batting By {activeRooms[roomId]?.users[0].userName}</h3>
            <h3>Bowling By {activeRooms[roomId]?.users[1].userName}</h3>
          </div>
          <h1 className='text-center'>Batting Score - {activeRooms[roomId]?.totalScore}</h1>
          <div className='h-50 d-flex justify-content-center align-items-center p-2'>
            <button onClick={()=>playerMove('1')} className={`btn btn-primary ${isDisabled ? 'disabled' : ''}`}>1</button>
            <button onClick={()=>playerMove('2')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>2</button>
            <button onClick={()=>playerMove('3')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>3</button>
            <button onClick={()=>playerMove('4')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>4</button>
            <button onClick={()=>playerMove('5')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>5</button>
            <button onClick={()=>playerMove('6')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>6</button>
          </div>
        </>}
    </>
  );
}

export default App;
