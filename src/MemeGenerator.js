import React, {Component} from 'react';
import './App.css';
import {Button, ControlLabel, FormControl, FormGroup, Glyphicon} from "react-bootstrap";
import LoadedImage from "./LoadedImage";

import MemeClient from "./MemeClient";
import firebase from "./firebase";



let client = new MemeClient();

export default class MemeGenerator extends Component {
    //initialize the state values, bind this to handleChange
    constructor(props) {
        super(props);
        this.state = {selectedTemplate: undefined, availableTemplates: undefined};
        this.handleChange = this.handleChange.bind(this);

    }

    //populate the initialized state with data
    componentDidMount(){
        client.getTemplate().then(data => {
            for(var i in data){
                this.setState({selectedTemplate: i, availableTemplates: data});
                break;
            } 
        })
        .catch(err => {
            alert(err);
        });
    }

    //change the selected template from the drop down formControl
    handleChange(e){
        this.setState({selectedTemplate : e.target.value});
    }

    //render the MemeGenerator
    render() {
        //if the selected state and available templates are undefined, display Loading...
        if(typeof this.state.selectedTemplate === "undefined" || typeof this.state.availableTemplates === "undefined"){
            return <h1>Loading...</h1>
        }
        //return the edited html REACT component
        //memecustomizer has 2 properties, templateName and templateData
        return <div>
            <h2>Make a meme!</h2>
            Choose a template:
            <form>
                <FormGroup>
                    <FormControl componentClass="select" onChange = {this.handleChange} value = {this.state.selectedTemplate}>
                        {Object.keys(this.state.availableTemplates).map(data =>
                            <option key={data.toString()} value={data}>{data}</option>
                        )}
                    </FormControl>
                    Customize the text:
                </FormGroup>
            </form>
            <MemeCustomizer user= {this.props.user} templateName = {this.state.selectedTemplate} templateData = {this.state.availableTemplates[this.state.selectedTemplate]}></MemeCustomizer>
        </div>

    }
}

class MemeCustomizer extends Component {
    //constructor, initialize the state, handleChange and handleSubmit
    constructor(props) {
        super(props);
        this.state = {text: { top: "top", bottom:"bottom"}, imgData: undefined, disabled: false, 
                     buttonType: 'primary', saveMemeDisabled: true, glyphIconState: '', docId: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.saveMeme = this.saveMeme.bind(this);
    }

    //populate the state with data from the properties given by MemeGenerator
    componentDidMount(){
        this.setState({disabled : true});
        let text = {};
        for(var i in this.props.templateData["text"]){
            text[i] = ""+i;
        }
        client.generateMeme(this.props.templateName, text).then(data =>{
            let stateData = {};
            const templateData = this.props.templateData["text"];
            for(let i in templateData){
                stateData[i] = ""+i;
            }
            this.setState({text: stateData, imgData: data, disabled: false});
        })
        .catch(err => {
            alert(err);
        });
    }

    //Allow for text to change for each text input
    handleChange(data,e){
        let stateData = this.state;
        stateData.text[data] = e.target.value;
        this.setState(stateData);
    }

    //When you click the submit or return, update the image parameters and regenerate the image
    handleSubmit(event){
        event.preventDefault();
        this.setState({disabled : true});
        client.generateMeme(this.props.templateName, this.state.text).then(data =>{
            //set the image data and release the forms text input and buttom from being disabled
            this.setState({imgData: data, disabled: false, buttonType: 'primary', saveMemeDisabled: false, glyphIconState: ''});
        })
        .catch(err => {
            alert(err);
        });
        let db = firebase.firestore;
        let date = new Date();
        let currentMeme = {};
        currentMeme['template'] = this.props.templateName;
        currentMeme['text'] = this.state.text;
        currentMeme['timestamp'] = date;
        currentMeme['favoritedBy'] = [];
        db.collection('memes').add(currentMeme)
        .then(success => {
            this.setState({docId : success.id});
        })
        .catch(error => {
            alert('Some error occured ' + error);
        });
    }

    //whenever the MemeGenerator dropdown menu value changes, update the text component blocks and the image
    componentDidUpdate(prevProps){
        if(this.props.templateName !== prevProps.templateName){
            this.setState({disabled : true});
            let text = {};
            for(var i in this.props.templateData["text"]){
                text[i] = ""+i;
            }
            client.generateMeme(this.props.templateName, text).then(data =>{
                let stateData = {};
                const templateData = this.props.templateData["text"];
                for(let i in templateData){
                    stateData[i] = ""+i;
                }
                this.setState({text: stateData, imgData: data, disabled: false, buttonType: 'primary', saveMemeDisabled: true, glyphIconState: ''});
            })
            .catch(err => {
                alert(err);
            });
        }
    }

    saveMeme(event){
        event.preventDefault();
        let db = firebase.firestore;
        let currentMeme = {};
        currentMeme['template'] = this.props.templateName;
        currentMeme['text'] = this.state.text;
        currentMeme['favoritedBy'] = [];
        currentMeme['favoritedBy'].push(this.props.user.email);
        db.collection('memes').doc(this.state.docId).set(currentMeme, {merge : true})
        .then(success => {
            this.setState({buttonType: 'success', glyphIconState: 'ok', saveMemeDisabled: true});
        })
        .catch(error => {
            alert('Some error occured ' + error);
        });
    }

    //renders the MemeCustomizer component into the MemeGenerator
    //made a special function for handleChange to get key value
    //since you can't call e.target.key 
    render() {
        return <div>
            <form onSubmit={this.handleSubmit}>
                <FormGroup>
                    {Object.keys(this.state.text).map(data =>
                        <div>
                            <ControlLabel>{data}</ControlLabel>{' '}
                            <FormControl disabled={this.state.disabled} type="text" onChange = {(e) => this.handleChange(data,e)} value = {this.state.text[data]} key = {data} placeholder={data}/>
                        </div>
                    )}
                    <Button type = "submit" disabled={this.state.disabled}>Regenerate</Button>
                </FormGroup> 
            </form>
            <div id="memeDiv">
                <LoadedImage src={this.state.imgData}/>
                <br/>
                <Button type='button' id="saveMeme" bsStyle={this.state.buttonType} disabled={this.state.saveMemeDisabled} onClick={this.saveMeme}>
                    Save Meme<Glyphicon glyph={this.state.glyphIconState}/>
                </Button>
            </div>
        </div>
    }
}





