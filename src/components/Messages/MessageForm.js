import React, {Component} from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from './../../firebase/init';


class MessageForm extends Component {
    state = { 
        message: '',                       
        channel: this.props.currentChannel, //current channel
        user: this.props.currentUser,       //auth user
        loading: false,
        errors: []
     }

     //handle message input
    handleChange = event => {
        this.setState({[event.target.name]:event.target.value});
    }

    //create message structure
    createMessage = () => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user:{
                id: this.state.user.uid,
                name:this.state.user.displayName,
                avatar:this.state.user.photoURL
            },
            content: this.state.message,

        };
        return message;
    }

    //send message
    sendMessage = () => {
        const {messagesRef} = this.props; //messages ref to firebase
        const {message, channel} = this.state; //get channel and message
        //if message is not null
        if(message) {
            //load icon
            this.setState({loading:true});
            //send message to firebase
            messagesRef
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading:false, message:'', errors: []}) //clear state
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        loading:false,
                        errors:this.state.errors.concat(err) //get errors
                    })
                });
        }else{
            //if message is null, add an message error
            this.setState({
                errors: this.state.errors.concat({message: 'Add a message'})
            })
        }
    }

    render() { 

        //destructure object
        const {errors, message, loading} = this.state;

        return ( 
            <Segment className="message__form">
                <Input 
                    fluid
                    name="message"
                    onChange={this.handleChange}
                    value={message}
                    style={{marginBottom: '0.7em'}}
                    label={<Button  icon={'add'}/>}
                    labelPosition="left"
                    className={
                        errors.some(error => 
                            error.message.includes('message')) 
                            ? "error"
                            : ""
                    }
                    placeholder="Write your message"
                />
                <Button.Group icon width="2">
                    <Button
                        onClick={this.sendMessage}
                        color="orange"
                        disabled={loading}
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />

                    <Button 
                        color="teal"
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>

            </Segment>


         );
    }
}
 
export default MessageForm;