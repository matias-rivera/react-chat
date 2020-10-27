import React, {Component} from 'react';
import uuidv4 from 'uuid/v4';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from './../../firebase/init';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
    state = { 
        storageRef: firebase.storage().ref(), //firebase storage ref
        uploadState: '',                      //if is uploading
        uploadTask: null,
        percentUploaded: 0,
        message: '',                       
        channel: this.props.currentChannel, //current channel
        user: this.props.currentUser,       //auth user
        loading: false,
        errors: [],
        modal: false                        //file modal state
     }


    // function to open and close upload file modal
    openModal = () => this.setState({modal: true});
    closeModal = () => this.setState({modal: false});

    //handle message input
    handleChange = event => {
        this.setState({[event.target.name]:event.target.value});
    }

    //create message structure
    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user:{
                id: this.state.user.uid,
                name:this.state.user.displayName,
                avatar:this.state.user.photoURL
            },

        };
        //check if message is a file
        if(fileUrl !== null){
            message['image'] = fileUrl;
        }else{
            message['content'] = this.state.message;
        }
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

    //upload file to firebase
    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id; //path to channel
        const ref = this.props.messagesRef; //message
        const filePath = `chat/public/${uuidv4()}.jpg`; //firebase storage

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata) //firebase upload setup
        },
            () => {
                //upload image to firebase storage
                this.state.uploadTask.on(
                'state_changed',
                //set percentUploaded state 
                snap => {
                    const percentUploaded = Math.round(
                        (snap.bytesTransferred / snap.totalBytes) * 100
                    );
                    this.props.isProgressBarVisible(percentUploaded);
                    this.setState({percentUploaded}); //set progressbar value
                },
                    err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: 'error',
                            uploadTask: null
                        })
                    },
                    () => {
                        //get image url from firebase storage
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then(downloadUrl => {
                            //send file message with image
                            this.sendFileMessage(downloadUrl, ref, pathToUpload)
                        })
                        .catch(err => {
                            console.error(err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: 'error',
                                uploadTask: null
                            })
                        }) 
                    }
                )
            }
        )
    };

    //send file message to firebase
    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl)) //set the message file
            .then(() =>{
                this.setState({uploadState:'done'}) //update state
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                })
            })
    }

    render() { 

        //destructure object
        const {errors, message, loading, modal, uploadState,percentUploaded} = this.state;

        return ( 
            <Segment className="message__form" >
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
                        disabled={uploadState === 'uploading'}
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>
                    <FileModal 
                        modal={modal}
                        closeModal={this.closeModal}
                        uploadFile={this.uploadFile}
                    
                    />
                    <ProgressBar 
                        uploadState={uploadState}
                        percentUploaded={percentUploaded}


                    />

            </Segment>


         );
    }
}
 
export default MessageForm;