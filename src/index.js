import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter,Switch,Route,withRouter } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Spinner from './Spinner';

import 'semantic-ui-css/semantic.min.css';
import firebase from './firebase/init';

import {createStore} from 'redux';
import {Provider,connect} from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './reducers';
import {setUser,clearUser} from './actions';

const store = createStore(rootReducer,composeWithDevTools());

class Root extends Component {
  
  componentDidMount(){
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.props.setUser(user);
        this.props.history.push('/');
      }else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    });
  };

  render() { 
    return this.props.isLoading ? <Spinner /> :(
      
        <Switch>
          
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/" exact component={App} />
        </Switch>
  
      );
  }
}
 
//export default Root;

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
});


const RootWithAuth = withRouter(
  connect(
    mapStateFromProps,
    {setUser,clearUser}
    )(Root)
  );


ReactDOM.render(
  
    <Provider store={store}>

      <BrowserRouter>
        <RootWithAuth/>
      
      </BrowserRouter>
    
    </Provider>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
