import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import trash from "../res/bootstrap-icons-1.11.3/trash.svg";
import Modal from './Modal';

const Home = (props) => {
    const [projects, setProjects] = useState([]);
    const [modalOn, setModalOn] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lruRecords, setLruRecords] = useState([])
    const navigate = useNavigate();

    const handleProjClick = (e) => {
        navigate("/projectwisedb");
        props.handleSelectedProj(e.target.name);
    };

    const handleDrag = (e, item) => {
        e.dataTransfer.setData('buttonIndex', item);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('buttonIndex');
        axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/deleteprojectname/${id}`)
            .then(response => {
                if (response.data.success) {
                    setProjects(preProjects => preProjects.filter(proj => proj.ID !== id));
                    setIsUpdated(true); // Trigger refresh
                } else {
                    alert('Failed to delete project');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error deleting the project');
            });
    };

    const handleAddNewProject = (close, projName) => {
        setModalOn(close);
        if (!projName) return;
        projName = projName.toUpperCase()
        axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/newproject`, { projName })
            .then(response => {
                if (response.data.success) {
                    alert("Success! Project added successfully");
                    setIsUpdated(true); // Trigger refresh
                } else {
                    alert(response.data.message);
                }
            })
            .catch(error => {
                alert(error.response.data.message);
            });
    };

    const fetchProjects = () => {
        // Fetch Active Projects data
        axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/projectnames`)
            .then(response => {
                setProjects(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            })
            .finally(() => {
                setLoading(false); // Stop loading once the request is completed
            });
    };

      // Fetch LRU records
  const fetchLruRecord = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/lrutable`)
      .then((response) => {
        setLruRecords(response.data.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the LRUs!', error);
      });
    setIsUpdated(false);
  };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (isUpdated) {
            fetchProjects();
            setIsUpdated(false); // Reset update state after fetching
        }
    }, [isUpdated]);

    return (
        <>
            {props.isAuth ? (
                <>
                    <div className="container shadow-lg p-3 bg-secondary-subtle rounded text-center my-5">
                        <h1 className="p-2 text-dark text-opacity-25">Welcome to DLS-Database Management Service</h1>
                        <div className="container d-flex gap-2 justify-content-center">
                            <Link to='/completedb' className='btn btn-sm btn-outline-secondary btn-lg'>Open Complete Database</Link>
                            <Link to="/viewdocs" className='btn btn-sm btn-outline-secondary btn-lg'>Open Documents Database</Link>
                            <Link to="/viewclearance" className='btn btn-sm btn-outline-secondary btn-lg'>Open Clearance Database</Link>
                            <Link to="/viewreports" className='btn btn-sm btn-outline-secondary btn-lg'>Open Reports Database</Link>
                            <Link to="/viewgatepass" className='btn btn-sm btn-outline-secondary btn-lg'>Open GatePass Database</Link>
                            <Link to='/viewrcma' className='btn btn-sm btn-outline-secondary btn-lg'>Open RCMA Database</Link>
                            <Link to='/viewhistorycard' className='btn btn-sm btn-outline-secondary btn-lg'>Open Hisory Card</Link>
                            <Link to='/viewlrus' className='btn btn-sm btn-outline-secondary btn-lg'>Open LRUs Database</Link>
                        </div>
                    </div>
                    <div className="container bg-secondary-subtle shadow rounded-4 p-3 my-3 text-center text-secondary text-opacity-35">
                        <div className="row">
                            <div className="col-sm-11">
                                <h1 className="p-2 text-dark text-opacity-25">Projects</h1>
                                {loading ? (
                                    <p>Loading projects...</p>
                                ) : (
                                    <div className='container d-flex flex-wrap justify-content-center gap-2'>
                                        {projects.map(proj => (
                                            <button
                                                name={proj.projectName}
                                                draggable={true}
                                                onClick={handleProjClick}
                                                onDragStart={(e) => handleDrag(e, proj.ID)}
                                                className='btn btn-lg btn-outline-dark'
                                                key={proj.ID}>
                                                {proj.projectName}  
                                            </button>
                                        ))}
                                        <button name='Other' onClick={handleProjClick} className="btn btn-lg btn-outline-dark">Other</button>
                                    </div>
                                )}
                                <button onClick={() => setModalOn(!modalOn)} className='btn btn-outline-primary btn-lg my-4'>
                                    Add New Project
                                </button>
                            </div>
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="text-center col-sm-1 border border-danger container-fluid bg-danger p-3 rounded">
                                <div>
                                    <img src={trash} alt="delete Logo" />
                                    <p className="text-dark">Drag n Drop projects here to delete</p>
                                </div>
                            </div>
                        </div>
                        {modalOn && <Modal getData={handleAddNewProject} />}
                    </div>
                    <div className="container bg-secondary-subtle shadow rounded-4 p-3 my-4 text-center text-secondary text-opacity-35">
                        <h1 className="p-1">Update Database</h1>
                        <div className="container d-flex gap-2 justify-content-center">
                            <Link to="/addlru" className='btn btn-outline-secondary btn-lg'>Add LRU</Link>
                            <Link to="/addgatepass" className='btn btn-outline-secondary btn-lg'>Add Gate Pass</Link>
                            <Link to="/addclearance" className='btn btn-outline-secondary btn-lg'>Add Clearance Letters</Link>
                            <Link to="/adddocs" className='btn btn-outline-secondary btn-lg'>Add Documents</Link>
                            <Link to="/addrcma" className='btn btn-outline-secondary btn-lg'>Add RCMA</Link>
                            <Link to="/addreport" className='btn btn-outline-secondary btn-lg'>Add Reports</Link>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='my-5 container p-3 text-center shadow-lg bg-dark-subtle rounded-5'>
                        <h1 className="p-1">Please log in to access the database</h1>
                        <Link to="/login" className='btn btn-lg btn-light p-2 my-5'>
                            Login Here
                        </Link>
                    </div>
                    <div className="container text-center fixed-bottom">
                        <h2 className='p-2'>
                            New User? <Link className='btn btn-outline-info' to="/register"> Register Here</Link>
                        </h2>
                    </div>
                </>
            )}
        </>
    );
};

export default Home;
