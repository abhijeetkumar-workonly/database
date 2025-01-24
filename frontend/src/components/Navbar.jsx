import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = (props) => {

    const navigate = useNavigate();
    const handleLogout = () => {
        props.onLogout();  // This will set isAuth to false
        navigate('/');
    }

    const [currUser, setCurrUser] = useState("")

    useEffect(() => {
        // Retrieve user data from sessionStorage
        const savedUser = sessionStorage.getItem('user');

        if (savedUser) {
            try {
                // Check if savedUser is a string and not 'undefined'
                if (typeof savedUser === 'string' && savedUser !== 'undefined') {
                    const user = JSON.parse(savedUser);
                    setCurrUser(user.fullName)
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
    }, [props.isAuth]);

    return (
        <div className='bg-dark-subtle my-3 sticky-top container shadow-lg rounded-pill mx-auto w-75'>
            <nav className="navbar navbar-expand-lg navbar-light">
                <Link className="navbar-brand nav-link btn btn-outline-warning p-1" to="/">DLS-Database</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        {props.isAuth ? (
                            <>
                                {props.isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin">Admin Dashboard</Link>
                                    </li>
                                )}

                                <li className="nav-item ">
                                    <button className="nav-link btn btn-outline-danger" onClick={handleLogout}>{currUser} (Log out)</button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Log in</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
