import React, { Component } from 'react';
import {isAuthenticated} from '../auth';
import {Redirect, Link} from "react-router-dom"; 
import {read} from './apiUser';
import DefaultProfile from '../images/avatar.jpg'
import DeleteUser from './DeleteUser';
import FollowProfileButton from './FollowProfileButton'
import ProfileTabs from './ProfileTabs';

class Profile extends Component {
    constructor(){
        super()
        this.state={
            user: {following: [], followers: []},
            redirectToSignin: false,
            following: false,
            error: ''
        }
    }


//check follow
checkFollow = user =>{
    const jwt = isAuthenticated()
    const match = user.followers.find(follower=>{

        //one id -> to many ids
        return follower._id === jwt.user._id
    })
    return match;
}



clickFollowButton = (callApi)=>{

    const userId = isAuthenticated().user._id;
    const token = isAuthenticated().token;

    callApi(userId, token, this.state.user._id)
    .then(data=>{
    if(data.error){
        this.setState({error: data.error})
        } else {
        this.setState({user: data, following: !this.state.following})
        }
    })
}

init = userId=>{
    const token = isAuthenticated().token;
   read(userId, token)
    .then(data=>{
        if(data.error){
            console.log("error")
            this.setState({redirectToSignin: true})
        } else {
            let following = this.checkFollow(data)//true or false, hide or show button
           this.setState({user: data, following });
        }
    });
};


//to someone's profile
componentDidMount(){
    const userId = this.props.match.params.userId;
    this.init(userId);

};

//to see own profile from menu
componentWillReceiveProps(props){
    const userId = props.match.params.userId;
    this.init(userId);
};

    render() {
        const {redirectToSignin, user} = this.state;
        if(redirectToSignin) return <Redirect to="/signin"/>;

            

        return (
        <div className="container">
        <h2 className="mt-5 mb-5">Profile</h2>
        <div className="row">
            <div className="col-md-6">
            <img 
                    style={{ height: "200px", width: "auto" }}
                    className="img-thumbnail"
                    src={`${process.env.REACT_APP_API_URL}/user/photo/${user._id}`}
                    onError={i=>(i.target.src=`${DefaultProfile}`)}
                    alt={user.name} 
                /> 
            </div>

            <div className="col-md-6">
                <div className="lead mt-2">
                    <p> {user.name}</p>
                    <p>email {user.email}</p>
                    <p>{`Joined ${new Date(user.created).toDateString()}`}</p>
                </div>


                {isAuthenticated().user&&isAuthenticated().user._id===user._id?(
                    <div className="d-inline-block">
                        <Link className="btn btn-raised btn-success mr-5"
                              to={`/user/edit/${user._id}`}>
                              Edit profile
                        </Link>
                       <DeleteUser userId = {user._id}></DeleteUser>
                    </div>
                ):(
                    //false or true,  hide or show button
                    <FollowProfileButton 
                        following={this.state.following}
                        onButtonClick = {this.clickFollowButton}
                        />
                
                )}

                <hr/>
                <ProfileTabs 
                    followers={user.followers}
                    following = {user.following}    
                />
            </div>
        </div>
        <div className="row">
            <div className="col md-12 mt-5 mb-5">
            <hr/>
                <p className="lead">
                    {user.about}
                </p>
                <hr/>
            </div>
        </div>
        </div>
        );
    }
}

export default Profile;