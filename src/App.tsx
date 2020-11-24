import React from 'react';
import './App.css';

import DeepFryer from './DeepFryer';

function App() {
  return (
    <div className="App">
      {((typeof createImageBitmap) === 'function' && window.Worker)
        ? (<DeepFryer/>)
        : (<p>Your browser does not support the APIs necessary to use this
          application. Try using <a href="https://mozilla.org/en-US/firefox">
          Firefox</a>, <a href="https://google.com/chrome">Chrome</a>, or the
          latest version of <a href="https://aka.ms/AA7052f">Edge.</a></p>)
      }
    </div>
  );
}

export default App;
