import './App.css';
import {BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Meeting from "./components/Meeting";
import Error404 from "./components/Error404";
import { UserContext } from "./UserContext";
import {useState} from "react";

function App() {

  const [user,setUser] = useState();

  return (
    <div className="App">
      <UserContext.Provider value={{ user, setUser }} >
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/meeting/:id" component={Meeting} />
            <Route component={Error404}/>
          </Switch>
        </BrowserRouter>
      </UserContext.Provider>
    </div>
  );
}

export default App;