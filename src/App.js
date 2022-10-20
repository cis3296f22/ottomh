import logo from './logo.svg';
import {useState} from 'react';
import {Form, Button} from 'react-bootstrap';

import './App.css';

function App() {
  let [response, setResponse] = useState("");
  let [formDisabled, setFormDisabled] = useState(true);

  let ws;
  // If the webpage was hosted in a secure context, the wss protocol must
  // be used.
  if (window.location.protocol == 'https:') {
    ws = new WebSocket(`wss://${window.location.host}/echo`);
  } else {
    ws = new WebSocket(`ws://${window.location.host}/echo`);
  }

  // Make sure the user can't submit with the form while
  // the websocket is closed.
  ws.onopen = (_) => {
    setFormDisabled(false);
  }

  ws.onclose = (_) => {
    setFormDisabled(true);
  }

  ws.onerror = (error) => {
    setFormDisabled(true);
    alert(`WebSocketd error: ${error.message}`);
    ws.close();
  }

  ws.onmessage = (event) => {
    setResponse(event.data);
  }

  let onFormKey = (event) => {
    if (event.key == "Enter") {
      formOnSubmit(event);
    }
  };

  let formOnSubmit = (_) => {
    if (!formDisabled) {
      let form = document.getElementById("echoMessageForm");
      ws.send(form.value);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div class="input-group mb-3">
          <input type="text" class="form-control" 
            placholder="WebSocket message" aria-label="WebSocket message"
            id="echoMessageForm" onKeyDown={onFormKey} disabled={formDisabled}/>
          <div class="input-group-append">
            <Button onClick={formOnSubmit}>
              Submit
            </Button>
          </div>
        </div>
        {response && 
          <p>
            {response}
          </p>
        }
      </header>
    </div>
  );
}

export default App;
