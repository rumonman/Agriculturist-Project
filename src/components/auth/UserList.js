import React, { useEffect, Fragment } from 'react';


import Spinner from '../layout/Spinner';
import { Container } from 'reactstrap';
import Advertisement from '../dashboard/Advertisement';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getAllUsers, deleteUser } from '../../actions/auth';

const IMAGEURL = process.env.REACT_APP_CLOUDINARY;

const UserList = ({getAllUsers,deleteUser, auth:{allUsers, loading}}) => {
  //const [filesList, setFilesList] = useState([]);
  //const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);
//   if(!auth.loading){
//     getFile(auth.user._id.$oid);
//   }
  //console.log('All users = ', allUsers);

  return (
    <Fragment>
       
        
        <Container>
            <div className="row">
                <div className="col-sm-12 col-md-6 col-lg-9">
                    <div className="files-container">
                        <h2>Users List</h2>
                        {loading ? <Spinner /> : (
                        <table className="files-table">
                            <thead>
                                <tr>
                                <th>User Image</th>
                                <th>User Name</th>
                                <th>User Email</th>
                                <th>User Category</th>
                                <th>Delete User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.length > 0 ? (
                                    allUsers.map(
                                    ({ _id, name, email, image, user_category }, index) => (
                                    <tr key={index}>
                                        <td style={{width:"10%"}}>
                                            <img src={IMAGEURL+image} alt={name} style={{height:"50px",width:"50px"}}/>
                                        </td>
                                        <td style={{width:"15%"}}>{name}</td>
                                        <td style={{width:"20%"}}>{email}</td>
                                        <td style={{width:"45%"}}>{user_category}</td>
                                        <td style={{width:"10%"}}>
                                            <Link to="/userlist" onClick={() =>deleteUser(_id.$oid)
                                            }>
                                            Delete
                                        </Link>
                                        </td>
                                    </tr>
                                    )
                                )
                                ) : (
                                <tr>
                                    <td colSpan={3} style={{ fontWeight: '300' }}>
                                    No User found. Please add some.
                                    </td>
                                </tr>
                                )}
                            </tbody>
                        </table>
                        )}
                    </div>       
                </div>
                <Advertisement />
            </div>     
        </Container>
                
      </Fragment>
    
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, {getAllUsers, deleteUser})(UserList);