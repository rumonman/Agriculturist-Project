import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

const UnfriendModal = (props) => {
   
  return (
    <div>
     
                        
                          {/* <div className='modal-body'>
                            Select "Remove" below if you want to remove{' '}
                            {userFr !== null ? (
                              <span
                                style={{
                                  fontSize: 20,
                                  fontWeight: 'bold',
                                  fontFamily: 'cursive',
                                }}
                              >
                                {userFr.name}
                              </span>
                            ) : null}{' '}
                            from your friend list.
                          </div>
                          <div className='modal-footer'>
                            <button
                              className='btn btn-secondary'
                              type='button'
                              data-dismiss='modal'
                            >
                              Cancel
                            </button>
                            <Link
                              to='/friendlist'
                              className='btn btn-primary'
                              onClick={() => unFriend(userFr._id.$oid)}
                            >
                              Remove
                            </Link>
                          </div>
                        </div>
                      </div> */}
      <Modal show={props.show} onHide={() => props.onHide()}>
        <Modal.Header closeButton>
          <Modal.Title>Unfriend user</Modal.Title>
        </Modal.Header>

        <Modal.Body>Select "Remove" below if you want to remove the user
                            from your friend list.</Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={() => props.onClick()}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              props.onClick();
              props.unFriend(props.deleteId)
            }}
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UnfriendModal;
