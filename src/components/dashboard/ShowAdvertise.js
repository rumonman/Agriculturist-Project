import React, { useEffect, Fragment } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Topbar from '../dashboard/Topbar';
import Footer from '../dashboard/Footer';
import Spinner from '../layout/Spinner';
import { Container } from 'reactstrap';
import Advertisement from './Advertisement';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getAdvertise, deleteAdvertise } from '../../actions/file';
import Alert from '../layout/Alert';
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;


const ShowAdvertise = ({props,getAdvertise,deleteAdvertise, file:{advertise, loading}}) => {
  //const [filesList, setFilesList] = useState([]);
  //const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    getAdvertise();
  }, [getAdvertise]);
//   if(!auth.loading){
//     getFile(auth.user._id.$oid);
//   }
  

  return (
    <Fragment>
        <div id="wrapper">
            <Sidebar />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <Topbar props={props}/>
                    <Alert />
                    <Container>
                        <div className="row">
                            <div className="col-sm-12 col-md-6 col-lg-9">
                                <div className="files-container">
                                    <h2>Advertisement List</h2>
                                    {loading ? <Spinner /> : (
                                    <table className="files-table">
                                        <thead>
                                            <tr>
                                            <th>Adv. View</th>
                                            <th>Adv. Name</th>
                                            <th>Adv. Type</th>
                                            <th>Delete Adv.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {advertise.length > 0 ? (
                                                advertise.map(
                                                ({ _id,filename, advertisement_type }, index) => (
                                                <tr key={index}>
                                                    <td className="file-title">
                                                        <img src={IMAGEURL+filename} alt={filename} style={{height:"50px",width:"70px", marginLeft:"20px"}}/>
                                                    </td>
                                                    <td className="file-description">{filename}</td>
                                                    <td>{advertisement_type}</td>
                                                    <td>
                                                        <Link to="/showadvertise" onClick={() =>deleteAdvertise(_id.$oid)
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
                                                No Advertise found. Please add some.
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
                </div>
                <Footer />
            </div>
        </div>
      </Fragment>
    
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  file: state.file
});
export default connect(mapStateToProps, {getAdvertise, deleteAdvertise})(ShowAdvertise);