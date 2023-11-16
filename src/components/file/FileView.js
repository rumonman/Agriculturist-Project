import React, { useState, Fragment, useEffect } from 'react';
import axios from 'axios';
//import Sidebar from '../dashboard/Sidebar';
//import Topbar from '../dashboard/Topbar';
//import Footer from '../dashboard/Footer';
import { Container } from 'reactstrap';
import FileHeader from './FileHeader';
import { Document, Page, pdfjs } from 'react-pdf';
//import imageFile from '../../AlauddinNewImage.jpg';

const API = process.env.REACT_APP_API;

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



const FileView = ({match}) => {
    useEffect(() => {
        viewFile(match.params.filename);
    }, [match.params.filename])
    
    //console.log("Match Params = ", match.params);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');
    const [fileURL, setFileURL] = useState(null);
    const [fileExtension, setFileExtension] = useState(null);
    //const [fileRet, setFileRet] = useState([]);
  //const imageURL = require('../../AlauddinNewImage.jpg');
    const viewFile = async (filename) => {
        try {
          const result = await axios.get(`${API}/file/${filename}`, {
            responseType: 'blob'
          });
          
          let fileExt = filename.split('.').pop();
          
          console.log("Result data = ", result.data);
          setFileExtension(fileExt);
          setFileURL(URL.createObjectURL(result.data));
          //const fileURL = URL.createObjectURL(result.data)
          
          // const fileReader = new FileReader();
          
          // fileReader.onloadend = () => {
          //   console.log("Response data = ", fileReader.result);
          //   setFileURL(fileReader.result);
          // };
          // fileReader.readAsDataURL(result.data);
          
          setErrorMsg('');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            setErrorMsg('Error while Viewing file. Try again later');
          }
        }
    };
    //viewFile(match.params.filename);
    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }
    function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
      }
    
      function previousPage() {
        changePage(-1);
      }
    
      function nextPage() {
        changePage(1);
      }
    return (
        <Fragment>
              <Container>
                  <FileHeader />
                    <div className="files-container">
                      
                          {errorMsg && <p className="errorMsg">{errorMsg}</p>}
                          {
                            (fileExtension === 'pdf') ? (
                              <Fragment> 
                              <Document
                                file={fileURL}
                                onLoadSuccess={onDocumentLoadSuccess}
                              >
                                <Page pageNumber={pageNumber} />
                              </Document>
                              <div>
                                <p>
                                Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
                                </p>
                                <button 
                                  type="button" 
                                  disabled={pageNumber <= 1} 
                                  onClick={previousPage}>
                                  Previous
                                </button>
                                <button
                                  type="button"
                                  disabled={pageNumber >= numPages}
                                  onClick={nextPage}
                                >
                                  Next
                                </button>
                              </div>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <img src={fileURL} alt={match.params.filename} className="view-file"/>
                                
                                
                              </Fragment>
                            )
                          }
                          
                      </div>       
              </Container>
                
      </Fragment>
    )
}

export default FileView
