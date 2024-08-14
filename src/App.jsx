import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ChatComponent from "./ChatComponent";
import ChatComponentFetch from "./ChatComponentFetch";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>LMStudio Chat</h1>
      <ChatComponent />
      <h1>LMStudio Chat with Fetch</h1>
      <ChatComponentFetch />
    </div>
  );
}

export default App;
