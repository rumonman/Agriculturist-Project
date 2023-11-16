// import React, { useState } from 'react';
// import { Modal, Button } from 'react-bootstrap';

// const ShareModal = () => {
//     const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);
//     return (
//         <div>
//             <Button variant="primary" onClick={handleShow}>
//         Launch Bootstrap Modal
//       </Button>

//       <Modal show={show} onHide={handleClose}>

//         <Modal.Header closeButton>
//           <Modal.Title>Heading Text</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>Modal content will sit here</Modal.Body>

//         <Modal.Footer>

//           <Button variant="secondary" onClick={handleClose}>Close</Button>
//           <Button variant="primary" onClick={handleClose}>Submit</Button>

//         </Modal.Footer>

//       </Modal>
//         </div>
//     )
// }

// export default ShareModal

// src/components/bootstrap-carousel.component.js
import React, { Component } from "react";

import { Modal, Button } from 'react-bootstrap';
import { FacebookShareButton, LinkedinShareButton } from "react-share";
import { FacebookIcon, LinkedinIcon} from "react-share";

const ShareModal = (props) => {
    //console.log(props.data);
    const {id, title, body} = props.data;
    const url = "https://agriculturist.org/sharepost/"+`${id}`;
        return (
            <div>
                <Modal show={props.show} onHide={() => props.onHide()}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            Share Post
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Select where to share the post.</p>

                        <FacebookShareButton
                            url={url}
                           
                            style={{marginRight: 10}}
                        >
                            <FacebookIcon size={32} round /> Facebook
                        </FacebookShareButton>
                        <LinkedinShareButton 
                            url={url}
                            title={title} 
                            summary={body}
                            >
                            <LinkedinIcon  size={32} round={true}/> LinkedIn
                        </LinkedinShareButton>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => props.onClick()} >Close</Button>
                        {/* <Button variant="primary" onClick={() => props.onClick()}  >Submit</Button> */}
                    </Modal.Footer>

                </Modal>
            </div>
        )
}

export default ShareModal;

