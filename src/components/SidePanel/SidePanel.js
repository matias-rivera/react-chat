import React, { Component } from 'react';
import {Menu} from 'semantic-ui-react';
import UserPanel from './UserPanel';
import Channels from './Channels';

class SidePanel extends Component {
    state = {  }
  
    render() { 

        const {currentUser} = this.props;

        return ( 
            <Menu
                size="large"
                inverted
                fixed="left"
                vertical
                style={{background: "#23272A", fontsize: "1.2rem"}}
            >
                <UserPanel currentUser={currentUser}/>
                <Channels currentUser={currentUser}/>
            </Menu>
         );
    }
}
 
export default SidePanel;