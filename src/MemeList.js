import React, {Component} from "react";
import {Button, Panel} from "react-bootstrap";
import './App.css';
import firebase from "./firebase"
import Pagination from "react-js-pagination";
import LoadedImage from "./LoadedImage";
import MemeClient from "./MemeClient";


let client = new MemeClient();

export default class MemeList extends Component {
    constructor(props) {
        super(props);
        this.state = {itemsCount: 10, activePage: 1, images: [], unMountFunction:()=>{}};
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    /**
     * mount the componenet
     */
    componentDidMount(){
        let db = firebase.firestore;
        const _this = this;
        let unsubscribe = db.collection('memes').orderBy('timestamp','desc').onSnapshot(function(success){
            let memesList = [];
            let fItemsCounter = 0;
            let itemsCounter = 0;
            let email = '';
            //make sure user exists or else it would point to a null eg: null.email
            if(_this.props.user){
                email = _this.props.user.email;
            }
            //on success put each meme into a list
            success.forEach(doc => {
                memesList.push(doc.data());
                memesList[itemsCounter]['memeId'] = doc.id;
                //if the person favorited the meme, add a remove favorite button
                //also update the count for the savedMeme
                if(memesList[itemsCounter]['favoritedBy'].includes(email)){
                    memesList[itemsCounter]['buttonType'] = 'danger';
                    memesList[itemsCounter]['buttonText'] = 'Remove Favorite';
                    if(!_this.props.isUnfiltered){
                        fItemsCounter++;
                    }
                }
                //if it's not favorited by the user
                //make it the add favorite button
                else{
                    memesList[itemsCounter]['buttonType'] = 'primary';
                    memesList[itemsCounter]['buttonText'] = 'Add Favorite';
                }
                //total number of memes
                itemsCounter++;
            });
            //set the state based on if unfiltered or filtered
            if(_this.props.isUnfiltered){
                _this.setState({itemsCount: itemsCounter});
            }
            else{
                _this.setState({itemsCount: fItemsCounter});
            }
            //loop through generate the images and store them into the images array state
            for(let i = 0; i < memesList.length; i++){
                client.generateMeme(memesList[i]['template'], memesList[i]['text']).then(data => {
                    memesList[i]['image'] = data;
                    _this.setState({images: memesList});
                });
            }
           
        });
        //set the unmount function
        this.setState({unMountFunction: unsubscribe});
    }

    /** 
     * whenever component unmounts, unsubscribe the onShanpshot() handler
    */
    componentWillUnmount(){
        let unsubscribe = this.state.unMountFunction;
        unsubscribe();
    }

    /**
     * 
     * @param {*} newPage page that was clicked
     * sets the new active page
     */
    handlePageChange(newPage){
        this.setState({activePage: newPage});
    }

    /**
     * 
     * @param {*} event the memeId and current event
     * there is a problem here where it updates every
     * componenet
     */
    handleClick(event){
        event.preventDefault();
        let db = firebase.firestore;
        let currentState = this.state;
        const currentMemeId = event.target.id;
        const email = this.props.user.email;
        let memeList = currentState['images'];
        let memeIndex = 0;
        let index = 0;
        for(let i = 0; i < memeList.length; i++){
            if(Object.values(memeList[i]).indexOf(currentMemeId) > -1){
                memeIndex = i;
                break;
            }
        }
        //checks if meme was favorited and changes the button
        if(currentState['images'][memeIndex]['favoritedBy'].includes(email)){
            index = currentState['images'][memeIndex]['favoritedBy'].indexOf(email);
            currentState['images'][memeIndex]['favoritedBy'].splice(index,1);
            currentState['images'][memeIndex]['buttonType'] = 'primary';
            currentState['images'][memeIndex]['buttonText'] = 'Add Favorite';
        }
        else{
            currentState['images'][memeIndex]['favoritedBy'].push(email);
            currentState['images'][memeIndex]['buttonType'] = 'danger';
            currentState['images'][memeIndex]['buttonText'] = 'Remove Favorite';
        }
        //set the current state
        this.setState(currentState);
        delete currentState['images'][memeIndex]['image'];
        delete currentState['images'][memeIndex]['memeId'];
        //update the database
        db.collection('memes').doc(currentMemeId).set(currentState['images'][memeIndex], {merge : true});
    }

    render() {
        //create the arrays to display the images and split them by 10 accross pages
        let itemsList = new Array(Math.ceil(this.state.itemsCount/10));
        for(let i = 0; i < itemsList.length; i++){
            itemsList[i] = new Array(10);
        }
        let pageCount = 0;
        let arrItemCount = 0;
        const style = {
            float: 'right',
            marginBottom: '10px'
        };
        this.state.images.map(data => {
            //if the memes are unfiltered
            if(this.props.isUnfiltered){
                if(typeof data['image'] === 'undefined'){
                    let theMemeId = data['memeId'];
                    itemsList[pageCount].push(<Panel key={theMemeId}><p key={theMemeId} >Loading {data.template}...</p></Panel>);
                    arrItemCount++;
                    if(arrItemCount === 10){
                        pageCount++;
                        arrItemCount = 0;
                    }
                }
                else{
                    let theMemeId = data['memeId'];
                    itemsList[pageCount].push(<div key={theMemeId} className="memeDiv">
                        <LoadedImage src={data['image']}/>
                        <br/>
                        {this.props.user && (<Button 
                            id={theMemeId} 
                            key={theMemeId}
                            onClick={this.handleClick} 
                            bsStyle={data['buttonType']} 
                            style={style}>{data['buttonText']}
                        </Button>)}
                    </div>);
                    arrItemCount++
                    if(arrItemCount === 10){
                        pageCount++;
                        arrItemCount=0;
                    }
                }
            }
            //if memes are filtered
            else{
                if(typeof data['image'] === 'undefined' && data['favoritedBy'].includes(this.props.user.email)){
                    let theMemeId = data['memeId'];
                    itemsList[pageCount].push(<Panel key={theMemeId}><p key={theMemeId} >Loading {data.template}...</p></Panel>);
                    arrItemCount++;
                    if(arrItemCount === 10){
                        pageCount++;
                        arrItemCount = 0;
                    }
                }
                else if(typeof data['image'] !== 'undefined' && data['favoritedBy'].includes(this.props.user.email)){
                    let theMemeId = data['memeId'];
                    itemsList[pageCount].push(<div key={theMemeId} className="memeDiv">
                        <LoadedImage src={data['image']}/>
                        <br/>
                        {this.props.user && (<Button 
                            id={theMemeId} 
                            key={theMemeId}
                            onClick={this.handleClick} 
                            bsStyle={data['buttonType']} 
                            style={style}>{data['buttonText']}
                        </Button>)}
                    </div>);
                    arrItemCount++
                    if(arrItemCount === 10){
                        pageCount++;
                        arrItemCount = 0;
                    }
                }
            }
            return false;
        });
        //returns the pagination and itemsList
       return (<div>
           <Pagination
            activePage={this.state.activePage}
            itemsCountPerPage={10}
            totalItemsCount={this.state.itemsCount}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange}
            />
            {itemsList[this.state.activePage-1]}
            <Pagination
            activePage={this.state.activePage}
            itemsCountPerPage={10}
            totalItemsCount={this.state.itemsCount}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange}
            />
       </div>)
    }
}
