import { useEffect } from 'react';
import { useState } from 'react';
import { io } from 'socket.io-client';
import { Chat } from '../Chat';

const LandingPage = (): JSX.Element => {
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const socket = io('http://localhost:8000', {
      withCredentials: true,
    });
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className='h-screen font-mono text-center bg-gray-800'>
      <div className='flex flex-col items-center justify-center h-screen text-2xl'>
        <h1 className='mb-4 text-5xl text-indigo-500'>Landing Page</h1>
        {socket && <Chat socket={socket} />}
      </div>
    </div>
  );
};

export default LandingPage;
