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
  const setUser = () => {
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
    
    socket.on('user2 won match', (winner) => {
      alert(`${winner} won the match`);
      setUserName('');
      setUserRegistered(false);
      setPlayMatch(false);
      setRoomCreated(false);
      setActiveRooms([]);
    })

    socket.on('out', (winner, draw, activeRooms) => {
      setActiveRooms(activeRooms);
       draw ? alert('Match Draw') : alert(`${winner} won the match`);
      setUserName('');
      setUserRegistered(false);
      setPlayMatch(false);
      setRoomCreated(false);
      setActiveRooms([]);
      setIsDisabled(false);
      
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
            <input type="text" className='form-control mt-4' id='name' style={{ 'width': '30%' }} />
            <button className='btn btn-primary mt-4' onClick={setUser}>Submit</button>
          </div>
        </>
      }

      {
        roomCreated && !playMatch && userRegistered &&
        <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
          <h1>Room Id: {roomId}</h1>
          <h1>Waiting for your friend to join</h1>
        </div>
      }

      {!playMatch && userRegistered && !roomCreated &&
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
