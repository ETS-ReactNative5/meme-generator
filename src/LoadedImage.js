import {Component} from "react";
import React from "react";

export default class LoadedImage extends Component {
    render() {
        if (this.props.src)
            return <img alt="meme!" src={URL.createObjectURL(this.props.src)}/>
        return <p>Loading image</p>
    }
}