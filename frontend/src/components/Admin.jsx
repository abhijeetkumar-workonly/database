import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = (props) => {

  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingToggle, setPendingToggle] = useState(false)
  const [activeToggle, setActiveToggle] = useState(false)

  const[modalBody, setModalBody] = useState('')
  const[modalId, setModalId]= useState('')
  const[modalTableId, setModalTableId] = useState('')

  // onClick={() => { handleRegisteredDelete(user.ID) }} 

  const handleDeleteRequest=(id, modalID)=>{
    setModalTableId(modalID)
    setModalBody("Delete This User?")
    setModalId(id)
  }

  const handleModalRequests=()=>{
    if(modalTableId=="ACTIVE"){
      handleRegisteredDelete(modalId)
    }else if(modalTableId=="PENDING"){
      handleDelete(modalId)
    }
    else{
      return
    }
  }

  const handleRegisteredDelete = (id) => {
    axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/deleteregistereduser/${id}`)
      .then(response => {
        if (response.data.success) {
          // Update the state to remove the deleted user
          setActiveUsers(prevUsers => prevUsers.filter(user => user.ID !== id));
        } else {
          alert('Failed to delete user');
        }
      })
      .catch(error => {
        console.log(error)
        alert('There was an error deleting the user:', error);
      });
  }


  const handleApproval = (id) => {

    axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/approvependinguser/${id}`)
      .then(response => {
        if (response.data.success) {
          // Remove the approved user from the pendingUsers list in the UI
          setPendingUsers(prev => prev.filter(user => user.ID !== id));
        } else {
          alert('Failed to approve user');
        }
      })
      .catch(error => {
        console.error('There was an error approving the user:', error);
      });
  }

  const handleDelete = (id) => {
    axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/deletependinguser/${id}`)
      .then(response => {
        if (response.data.success) {
          // Update the state to remove the deleted user
          setPendingUsers(prevUsers => prevUsers.filter(user => user.ID !== id));
        } else {
          alert('Failed to delete user');
        }
      })
      .catch(error => {
        console.log(error)
        alert('There was an error deleting the user:', error);
      });
  }

  const activeUserTable = <div className="container text-center"> <h1 className="p-1 text-info text-opacity-25">Registered Users List</h1> {activeUsers.length === 0 ? <h2 className=" text-center text-info text-opacity-25 p-1">No Registered Users</h2> : <table className="table table-striped table-secondary my-4">
    <thead className='thead-dark'>
      <tr>
        <th>Full Name</th>
        <th>User Name</th>
        <th>Access</th>
        <th>Mobile</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {activeUsers.map(user => (
        <tr key={user.ID}>
          <td>{user.fullName}</td>
          <td>{user.userName}</td>
          <td>{user.accessLevel}</td>
          <td>{user.mobile}</td>
          <td>
            {user.accessLevel === "ADMIN" ? null : (
              <button onClick={()=>{handleDeleteRequest(user.ID, "ACTIVE")}} className="btn btn-danger mx-1 " data-bs-toggle="modal" data-bs-target="#exampleModal">Delete</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>}</div>


  const pendingUserTable = <div className="container text-center"> <h1 className="p-1 text-info text-opacity-25">Pending Users List</h1> {pendingUsers.length === 0 ? <h2 className=" text-center text-info text-opacity-25 p-1">No Pending Users</h2> : <table className="table table-striped table-secondary my-4">
    <thead className='thead-dark'>
      <tr>
        <th>Full Name</th>
        <th>User Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {pendingUsers.map(user => (
        <tr key={user.ID}>
          <td>{user.fullName}</td>
          <td>{user.userName}</td>
          <td>
            <button onClick={() => {handleApproval(user.ID) }} className="btn btn-success mx-1">Approve</button>
            <button onClick={()=>{handleDeleteRequest(user.ID, "PENDING")}} className="btn btn-danger mx-1 " data-bs-toggle="modal" data-bs-target="#exampleModal">Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>}</div>

  useEffect(() => {
    // Fetch Active users data
    axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/users`)
      .then(response => {
        setActiveUsers(response.data.data);
      })
      .catch(error => {
        console.error('There was an error fetching the Active users!', error);
      });
  }, []);

  useEffect(() => {
    // Fetch pending users data
    axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/pendingusers`)
      .then(response => {
        setPendingUsers(response.data.data);
      })
      .catch(error => {
        console.error('There was an error fetching the pending users!', error);
      });
  }, []);

  return (
    <>{props.isAdmin ? <><div className="container bg-dark-subtle p-3 rounded-4 shadow-lg">
      <button type="button" onClick={() => { setPendingToggle(!pendingToggle) }} className="btn btn-warning mx-2">
        Users Approval Pending <span className="badge bg-danger badge-light">{pendingUsers.length}</span>
      </button>
      <button type="button" onClick={() => { setActiveToggle(!activeToggle) }} className="btn btn-info mx-2">
        Registered Users <span className="badge bg-warning badge-light">{activeUsers.length}</span>
      </button>
    </div>
      {activeToggle && activeUserTable}
      {pendingToggle && pendingUserTable}</> : <div className='container bg-dark-subtle shadow-lg p-4 my-4 text-center rounded-pill'>
      <h1 className="p-1 text-info text-opacity-35">
        Please Login as ADMIN to access Admin Panel
      </h1>
    </div>}
    
    <div className="container text-center">

      {/* <!-- Modal --> */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Confirm</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <h1 className="p-1">
                {modalBody}
              </h1>
            </div>
            <div className="modal-footer">
              <button  type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button onClick={()=>{handleModalRequests()}} type="button" className="btn btn-primary" data-bs-dismiss="modal">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>


  );
};

export default Admin;
