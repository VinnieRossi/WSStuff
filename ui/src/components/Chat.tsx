import React, { useEffect, useRef, useState } from 'react';

interface IChatProps {
  socket: any;
}

type User = {
  id: string;
  color: number;
  x: number;
  y: number;
};

export const Chat = ({ socket }: IChatProps) => {
  const userId = useRef('');
  const user = useRef<User>();
  const [userState, setUserState] = useState<User[]>([]);
  const [movement, setMovement] = useState({
    up: false,
    left: false,
    down: false,
    right: false,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();
  const [lastPoint, setLastPoint] = useState<any>();

  const colors = [
    'gray',
    'red',
    'yellow',
    'green',
    'blue',
    'indigo',
    'purple',
    'pink',
  ];

  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const newMoves = { ...movement };

    if (event.key === 'w') {
      console.log('move up');
      newMoves.up = true;
    }
    if (event.key === 'a') {
      console.log('move left');
      newMoves.left = true;
    }
    if (event.key === 's') {
      console.log('move down');
      newMoves.down = true;
    }
    if (event.key === 'd') {
      console.log('move right');
      newMoves.right = true;
    }

    setMovement(newMoves);
  };

  const handleKeyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const newMoves = { ...movement };
    if (event.key === 'w') {
      console.log('stop move up');
      newMoves.up = false;
    }
    if (event.key === 'a') {
      console.log('stop move left');
      newMoves.left = false;
    }
    if (event.key === 's') {
      console.log('stop move down');
      newMoves.down = false;
    }
    if (event.key === 'd') {
      console.log('stop move right');
      newMoves.right = false;
    }

    setMovement(newMoves);

    // // move here?
    // const xChange =
    //   movement.right && movement.left
    //     ? 0
    //     : movement.right
    //     ? 10
    //     : movement.left
    //     ? -10
    //     : 0;
    // // const newX = user.current!.x + xChange;
    // user.current!.x += xChange;

    // const yChange =
    //   movement.up && movement.down
    //     ? 0
    //     : movement.up
    //     ? 10
    //     : movement.down
    //     ? -10
    //     : 0;
    // // const newY = user.current!.y + yChange;
    // user.current!.y += yChange;
    // console.log(`${xChange} ${yChange}`);
    // console.log(`x: ${user.current!.x} y: ${user.current!.y}`);
  };

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.lineWidth = 4;
    contextRef.current = context;
  }, []);

  const startDrawing = ({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    setLastPoint(null);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    if (!lastPoint) {
      setLastPoint({ x: offsetX, y: offsetY });
      return;
    }

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    // setLastPoint({ x: offsetX, y: offsetY });
    socket.emit('drawing', {
      lastPoint: lastPoint,
      x: offsetX,
      y: offsetY,
      color: colors[user.current!.color],
    });
    setLastPoint({ x: offsetX, y: offsetY });
  };

  useEffect(() => {
    user.current = userState[0];
  }, [userState]);

  const updateState = (userState: User[]) => {
    const updatedUser = userState.find((user) => user.id === userId.current)!;
    // user.current = user;
    setUserState([
      updatedUser,
      ...userState.filter((user) => user.id !== userId.current),
    ]);
  };

  useEffect(() => {
    if (!user.current) {
      return;
    }

    console.log('movement');

    if (movement.left) {
      user.current.x = Math.max(user.current.x - 10, 0);
    }
    if (movement.right) {
      user.current.x = Math.min(user.current.x + 10, 1000);
    }
    if (movement.up) {
      user.current.y = Math.max(user.current.y - 10, 0);
    }
    if (movement.down) {
      user.current.y = Math.min(user.current.y + 10, 1000);
    }

    console.log(`x: ${user.current.x}, y: ${user.current.y}`);

    socket.emit('userMovement', user.current.x, user.current.y);
  }, [movement]);

  useEffect(() => {
    const registerSocketListeners = () => {
      socket.on('connected', (newUserState: User[]) => {
        userId.current = socket.id;
        user.current = newUserState.find((user) => user.id === socket.id);
        updateState(newUserState);
      });

      socket.on('thing', (newUserState: User[]) => {
        updateState(newUserState);
      });

      socket.on('disconnected', (newUserState: User[]) => {
        updateState(newUserState);
      });

      socket.on('userLocationChanged', (newUserState: User[]) => {
        updateState(newUserState);
      });

      socket.on('partnerDraw', (drawState: any) => {
        contextRef.current.closePath();
        contextRef.current.beginPath();
        contextRef.current.strokeStyle = drawState.color; // TODO: This is changing the previous line that the partner drew to the new color.
        contextRef.current.moveTo(drawState.lastPoint.x, drawState.lastPoint.y);
        contextRef.current.lineTo(drawState.x, drawState.y);
        contextRef.current.stroke();
        contextRef.current.closePath();
      });
    };

    registerSocketListeners();
  }, [socket]);

  const emitColorChange = () => {
    const num = Math.floor(Math.random() * 7);
    socket.emit('colorChange', num);
  };

  const emitMovement = () => {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    socket.emit('userMovement', x, y);
  };

  return (
    <div
      style={{ outline: 'none' }}
      onKeyDown={handleKeydown}
      onKeyUp={handleKeyup}
      tabIndex={-1}
    >
      <div className='text-white'>
        chat with {userState.length} user{userState.length === 1 ? '' : 's'}
      </div>
      {userState.map((user) => {
        return (
          <React.Fragment key={user.id}>
            <button
              disabled={user.id !== userId.current}
              className={`mr-2 ${
                user.id !== userId.current ? 'cursor-not-allowed' : ''
              } bg-${colors[user.color]}-500`}
              key={`button-${user.id}`}
              onClick={emitColorChange}
            >
              click
            </button>
            <div
              key={`player-${user.id}`}
              style={{ left: user.x, top: user.y }}
              className={`absolute w-2 h-2 bg-${colors[user.color]}-500`}
            ></div>
          </React.Fragment>
        );
      })}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        className='bg-white'
      ></canvas>
      <button onClick={emitMovement}>move</button>
    </div>
  );
};
