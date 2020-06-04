import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Profile from './components/Profile';
import SearchResultUsername from './components/SearchResultUsername';
import SearchResultKeyword from './components/SearchResultKeyword';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' component={Login} />
                    <Route exact path='/signup' component={Signup} />
                    <Route exact path='/profile' component={Profile} />
                    <Route exact path='/search/username/*' component={SearchResultUsername} />
                    <Route exact path='/search/keyword/*' component={SearchResultKeyword} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
