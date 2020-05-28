import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Profile from './components/Profile';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' component={Login} />
                    <Route exact path='/signup' component={Signup} />
                    <Route exact path='/profile' component={Profile} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;