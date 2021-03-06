import React, { Component } from 'react';
import {Grid, Header, Dropdown, Image} from 'semantic-ui-react';
import firebase from './../../firebase/init';


class UserPanel extends Component {
    state = { 
        user: this.props.currentUser
     }
    

    dropdownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>{this.state.user.displayName} </strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span>Change avatar</span>
        },
        {
            key: "signout",
            text:<span onClick={this.handleSignout}>Sign Out</span>
        }
    ];

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log("signed out")) ;
    }

    render() { 

        const {user} = this.state;
        return ( 
            <Grid >
                <Grid.Column>
                    <Grid.Row style={{padding: '1.2em', margin:0}}>
                        <Header inverted floated="left" as="h2">
                            <Header.Content><Image src='./logo.png' avatar />Discord</Header.Content>
                        </Header>
                        <Header style={{padding: '0.25em'}} as="h4" inverted>
                            <Dropdown 
                                trigger={<span>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {user.displayName}
                                    </span>} 
                                options={this.dropdownOptions()}/>
                        </Header>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
         );
    }
}

const mapStateToProps = state =>({
    currentUser: state.user.currentUser
})
 
export default UserPanel;