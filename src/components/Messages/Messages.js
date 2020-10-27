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
        progressBar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: []
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
          this.countUniqueUsers(loadedMessages);
        });
      };

    //get search input 
    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    //search for messages using searchTerm
    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        //get all related messages
        const searchResults = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        }, []);
        //return searched messages
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoading: false }), 1000);
    }

    //count users in channel 
    countUniqueUsers = messages => {
        //get users
        const uniqueUsers = messages.reduce((acc, message) => {
        if (!acc.includes(message.user.name)){
            acc.push(message.user.name)
        }
        return acc;
        },[]);
        //check if there is 1 or more users
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
        //display users numbers
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
        this.setState({ numUniqueUsers })
    }

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

    displayChannelName = channel => channel ? `#${channel.name}` : '';

    //check if is uploading, then set progressbar to true
    isProgressBarVisible = percent => {
        if(percent > 0){
            this.setState({progressBar: true})
        }
    }

    render() {
        const {messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                />

                <Segment>
                    <Comment.Group 
                        className={progressBar ? 'messages__progress' : 'messages'}>
                        {searchTerm ? this.displayMessages(searchResults) 
                        : this.displayMessages(messages)}
                
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
