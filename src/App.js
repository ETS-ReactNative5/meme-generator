import React, {Component} from 'react';

import './App.css';
import MemeGenerator from "./MemeGenerator"
import {HashRouter, Redirect, Route} from "react-router-dom";
import Login from "./Login"
import firebase from "./firebase"
import {Nav, Navbar, NavItem} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap"
import MemeList from "./MemeList"

class App extends Component {

    constructor(props) {
        super(props);
        this.state={};
    }

    componentWillMount() {
        var _this = this;
        firebase.auth.onAuthStateChanged(function (user) {
            _this.setState({user: user});
        }, function (error) {
            console.log(error);
        });

    }

    render() {
        let nav;
        if(this.state.user){
            nav = <Nav>
                <LinkContainer to={"/generate"}>
                    <NavItem>Generate Memes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/saved"}>
                    <NavItem>View Saved Memes</NavItem>
                </LinkContainer>
                <LinkContainer to={"/logout"}><NavItem>Logout</NavItem></LinkContainer>
            </Nav>
        }
        else {
           nav = <Nav>
                <LinkContainer to={"/login"}>
                    <NavItem>Register/sign-in to generate memes</NavItem>
                </LinkContainer>
            </Nav>
        }
        if(this.state.user === undefined)
            return <span>Loading</span>
        return (
            <HashRouter>
                <div className="App">
                    <Navbar>
                        <Navbar.Header>
                            <LinkContainer to={"/"}>
                                <Navbar.Brand>(the)Memebase v4</Navbar.Brand>
                            </LinkContainer>
                        </Navbar.Header>
                        {nav}

                    </Navbar>
                    <div className={"content"}>

                        <div className={"container"}>
                            <Route exact path={"/"} render={(props) => <MemeList isUnfiltered={true} user={this.state.user} />} />
                            <Route exact path={"/login"} component={Login}/>
                            <Route exact path={"/logout"} component={Logout}/>
                            <PrivateRoute path={"/saved"} component={MemeList} user={this.state.user} />
                            <PrivateRoute path={"/generate"} component={MemeGenerator}  user={this.state.user} />
                        </div>
                    </div>
                </div>
            </HashRouter>
        );
    }


}

function Logout() {
    firebase.auth.signOut();
    return <Redirect to="/"/>
}

function PrivateRoute({component: Component, user: User, ...rest}) {
    return (
        <Route
            {...rest}
            render={props =>
                User ? (
                    <Component {...props} user = {User} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {from: props.location}
                        }}
                    />
                )
            }
        />
    );
}

export default App;
