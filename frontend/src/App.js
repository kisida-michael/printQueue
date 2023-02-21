import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';

const ENDPOINT = 'http://192.168.0.223:5000';

const App = () => {
  const [progressBars, setProgressBars] = useState([]);

  useEffect(() => {
    // const socket = socketIOClient(ENDPOINT);
    // socket.on('progress', (data) => {
    //   const { name, progress } = data;
    //   setProgressBars((prevState) => {
    //     // Check if the progress bar already exists
    //     const progressBarIndex = prevState.findIndex(
    //       (progressBar) => progressBar.name === name
    //     );
    //     if (progressBarIndex === -1) {
    //       // If it doesn't exist, add a new progress bar
    //       return [...prevState, { name, progress }];
    //     } else {
    //       // If it exists, update the progress
    //       const newProgressBars = [...prevState];
    //       newProgressBars[progressBarIndex].progress = progress;
    //       return newProgressBars;
    //     }
    //   });
    // });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  const removeProgressBar = (name) => {
    setProgressBars((prevState) => {
      const newProgressBars = prevState.filter(
        (progressBar) => progressBar.name !== name
      );
      return newProgressBars;
    });
  };

  return (
    <div className='bg-gray-800 min-h-screen text-white mx-auto flex items-center justify-center'>
      <div className='max-w-3xl mx-auto px-4 py-8'>
        <FileUpload className='min-w-96' />
        {/* {progressBars.map((progressBar) => (
          <ProgressBar
            key={progressBar.name}
            name={progressBar.name}
            progress={progressBar.progress}
            onRemove={removeProgressBar}
          />
        ))} */}
      </div>
    </div>
  );
};

export default App;
