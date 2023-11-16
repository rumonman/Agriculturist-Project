import React, { Component } from "react";

import { Modal, Button } from 'react-bootstrap';


const PostDeleteModal = (props) => {
    //console.log(props.deleteId);
        return (
            <div>
                <Modal show={props.show} onHide={() => props.onHide()}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            Delete Post
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                    Do you really want to delete the Post?
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => props.onClick()} >Close</Button>
                        <Button variant="primary" onClick={() => {
                                                        props.onClick();
                                                        props.deletePost(props.deleteId);
                                                    }}  
                        >Delete</Button>
                    </Modal.Footer>

                </Modal>
            </div>
        )
}

export default PostDeleteModal;


