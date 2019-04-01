import React, {Component} from "react";
import {Alert, Button, ControlLabel, FormControl} from "react-bootstrap";
import firebase from "./firebase"
import {Redirect} from "react-router-dom";

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {email: '', password: '', errorMessage: '', show: false, redirect: false};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        let currentState = this.state;
        currentState[e.target.name] = e.target.value;
        this.setState(currentState);
    }

    handleSubmit(event){
        event.preventDefault();
        firebase.auth.createUserWithEmailAndPassword(this.state.email,this.state.password).then(success => {
            let currentState = this.state;
            currentState.redirect = true;
            this.setState(currentState);
        })
        .catch(error => {
            firebase.auth.signInWithEmailAndPassword(this.state.email,this.state.password).then(success => {
                let currentState = this.state;
                currentState.redirect = true;
                this.setState(currentState);
            }).catch(error2 =>{
                let currentState = this.state;
                currentState.errorMessage = "Error: " + error2.message;
                currentState.show = true;
                this.setState(currentState);
            });
        });
        
    }

    render() {
        if(this.state.redirect){
            return <Redirect to={"/"}/>
        }
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <ControlLabel>Email address:</ControlLabel>{' '}
                <FormControl name="email" placeholder="Email" onChange={this.handleChange}/>
                <ControlLabel>Password:</ControlLabel>{' '}
                <FormControl type="password" name="password" placeholder="Password" onChange={this.handleChange}/>
                {this.state.show && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
                <Button type={"submit"}>Log in(or register)</Button>
            </form>
        </div>)
    }
}