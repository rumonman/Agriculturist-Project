import React, { Component } from 'react'
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
class Name extends Component {
    render() {
        return (
            <div>
                <Modal isOpen={this.props.modal}>
                    <ModalHeader >Users List</ModalHeader>
                    <ModalBody>
                        {this.props.name}
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}

export default Name