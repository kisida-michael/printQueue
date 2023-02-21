import React from 'react';
import ProgressBar from 'react-progress-bar-plus';
import 'react-progress-bar-plus/lib/progress-bar.css';

const ProgressBarComponent = ({ name, progress }) => {
  return (
    <div>
      <p>{name}</p>
      <ProgressBar percent={progress} />
    </div>
  );
};

export default ProgressBarComponent;
