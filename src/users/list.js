import React, { Component } from 'react';
import UserModel from './model';
import {NavLink} from 'react-router-dom';
import {Pagination} from '../libs/libs';
import queryString from 'query-string';
import {FlashData, LoadingIndicator} from '../libs/libs';

class DeleteButton extends Component {

    setUser = (e) => {
        e.preventDefault();
        this.props.setUser(this.props.user);
    }

    render() {

        return (
            <NavLink  
                onClick = {this.setUser}
                to = {`/users/${this.props.user.id}`} 
                className = "btn btn-danger mx-1"
                data-toggle="modal" data-target="#exampleModal"
                >
                <i className="fa fa-times text-light"></i>
            </NavLink>
        )
        
    }
}

class UserList extends Component {
    currentPage = 1;
    timeoutID = 0;
    firstInit = 1;
    ownUser = null;
    jQuery = window.jQuery;
    constructor(props) {
        super(props);

        const message = FlashData.get('message');
        this.state = {
            message: message,
            error: null,
            loading: true,
            users: null,
            search: queryString.parse(props.location.search).search || ''
        }

        this.currentPage = queryString.parse(props.location.search).page || 1;

    }

    componentDidMount(){
        this.getUsers();
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.location.search !== nextProps.location.search) {
            this.currentPage = queryString.parse(nextProps.location.search).page || 1;
            this.getUsers(nextProps);
            this.setState({
                message: null,
                error: null
            })
        }
    }


    handleChange = (e) => {
        clearTimeout(this.timeoutID);
        this.setState({
            search: e.target.value
        });

        this.currentPage = 1;

        this.timeoutID = setTimeout(() => {
            this.getUsers(this.props, 1);
        }, 300);


    }

    deleteUser = () => {
        if(this.ownUser){
            UserModel.deleteUser(this.ownUser.id).then(res => {
                if(res.data.message) {
                    this.state.users.data.splice(this.state.users.data.indexOf(this.ownUser), 1);
                    this.setState({
                        message: res.data.message || null,
                        error: null
                    });
                }
                if(res.data.error) {
                    this.setState({
                        message: null,
                        error: res.data.error || null
                    });
                }
                
            });
        }

        this.jQuery('.modal').modal('hide');
    }

    getUsers = (props = this.props, forcePage = null) => {
        if(!this.state.loading){
            this.setState({
                loading: true
            });
        }
        let page = 1;
        let search = this.state.search || '';
        let uri = props.location.search ? queryString.parse(props.location.search) : '';
        if(uri) {
            page = uri.page || 1;
            if(this.currentPage !== page){
                page = this.currentPage;
            }
        }

        //Uu tien trang duoc tai
        if(forcePage) {
            page = forcePage;
        }

       if(uri !== ''){
        search = uri.search || '';
       }

        if(this.firstInit !== 1 && this.state.search !== search){
            search = this.state.search;
        }
        
        //trang da load lai
        this.firstInit = 0;

        //console.log(search);

        UserModel.getUsers(page, search).then(res => {
            this.setState({
                users: res.data,
                search: search,
                loading: false
            })
        })
    }

    showListUser = (users) => {
        let result = null;
        if(this.state.users !== null && users.data.length > 0 ) {
            result = users.data.map((user,index) => {
                return (
                    <tr key = {index}>
                        <td>{index + 1 + (this.state.users.current_page - 1) * this.state.users.per_page}</td>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                            <NavLink to = {`/users/${user.id}`} className="btn btn-info mx-1">
                                <i className="fa fa-eye text-light"></i>
                            </NavLink>
                            <DeleteButton 
                                user = {user}
                                setUser = {this.setUser}
                            />
                        </td>
                    </tr>
                    
                );
            });
        }else{
            return <tr>
                        <td colSpan = {5}>Không có dử liệu</td>
                    </tr>
        }

        return result;
    }

    refreshList = () => {
        this.setState({
            message: null,
            error: null
        })
        this.getUsers();
    }

    setUser = (user) => {
        this.ownUser = user
    }

    render() {
        let {users} = this.state;
        return (
            <div>
                <h4 className= "page-header">Danh sách người dùng</h4>
                <div className="mb-3">
                    <NavLink to = "/users/create" className = "btn btn-primary">
                       <i className= "fa fa-plus"></i> Tạo người dùng
                    </NavLink> &nbsp;
                    <button className= "btn btn-outline-dark" onClick = {this.refreshList}> <i className= "fa fa-sync-alt"></i> Tải lại trang</button>
                        &nbsp;  
                    <form className = "form-inline" style={
                        {
                            display: 'inline-block'
                        }
                    }>
                        <input 
                        type="text" 
                        className = "form-control" 
                        name="Search" 
                        placeholder="Tìm kiếm"
                        value = {this.state.search}
                        onChange = {this.handleChange}
                        />
                    </form>   
                    <LoadingIndicator
                        show = {this.state.loading}
                        width = {32}
                        height = {32}
                    /> 
                </div>

                {
                    this.state.error &&
                    <div className="alert alert-danger">{this.state.error}</div>
                }

                {
                    this.state.message &&
                    <div className="alert alert-success">{this.state.message}</div>
                }

                <table className="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Ten</th>
                        <th>Email</th>
                        <th>Chuc Nang</th>
                    </tr>
                </thead>
                <tbody>
                    {this.showListUser(users)}
                </tbody>
            </table>
            
            <nav className="d-flex justify-content-center">
                <Pagination 
                    data = {this.state.users}
                    range = {2}
                    to = "users"
                    search = {this.state.search}
                />
            </nav>

            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  Ban chac chan muon xoa user nay?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" data-dismiss="modal">Cancel</button>
                  <button onClick = {this.deleteUser}type="button" className="btn btn-info">Confirm</button>
                </div>
              </div>
            </div>
            </div>
            </div>
        );
    }
}

export default UserList;