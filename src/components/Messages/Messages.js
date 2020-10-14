import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from './../../firebase/init';
import Message from './Message';

class Messages extends React.Component {

    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messagesLoading: true,
        messages: [],
        progressBar: false
    }

    //when component is mount load all messages 
    componentDidMount(){
        const { channel, user} = this.state;
    
        //if channel and user are not null
        if(channel && user){
            this.addListeners(channel.id);
        }
    }

    //run messages loader
    addListeners = channelId => {
        this.addMessageListener(channelId);
      };


    //load all channel messages
    addMessageListener = channelId => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", snap => {
          loadedMessages.push(snap.val());
          this.setState({
            //set messages on state
            messages: loadedMessages,
            messagesLoading: false
          });
        });
      };

    //loop for displaying messages
    displayMessages = messages => {
        return (messages.length > 0 && messages.map(message => (
            <Message 
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        )))
    }

    //check if is uploading, then set progressbar to true
    isProgressBarVisible = percent => {
        if(percent > 0){
            this.setState({progressBar: true})
        }
    }

    render() {
        const {messagesRef, messages, channel, user, progressBar} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader />

                <Segment>
                    <Comment.Group 
                        className={progressBar ? 'messages__progress' : 'messages'}>
                            {this.displayMessages(messages)}
                
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser= {user}
                    isProgressBarVisible={this.isProgressBarVisible}
                
                />
        </React.Fragment>
            );
        }
    }

export default Messages;
