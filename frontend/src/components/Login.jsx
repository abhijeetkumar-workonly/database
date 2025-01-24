import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = (props) => {
    const [isInvalid, setIsInvalid] = useState(false);
    const navigate = useNavigate();

    const wrongAlert = (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> User unauthorized. Invalid username or password.
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsInvalid(false)}></button>
        </div>
    );

    // Create refs for the username and password input fields
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        // Retrieve user data from sessionStorage
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
          try {
            // Check if savedUser is a string and not 'undefined'
            if (typeof savedUser === 'string' && savedUser !== 'undefined') {
              navigate("/")
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
      }, []);


    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        const username = usernameRef.current.value.trim();
        const password = passwordRef.current.value.trim();

        if (!username || !password) {
            setIsInvalid(true);
            return;
        }

        axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/authenticate`, { username, password })
            .then(response => {
                if (response.data.success) {
                    const userData = response.data.user;
                    sessionStorage.setItem('user', JSON.stringify(userData));
                    // sessionStorage.setItem('access', JSON.stringify("ADMIN"));
                    props.onLogin(userData); // Pass the user data to the parent
                    navigate("/"); // Redirect on successful login
                } else {
                    setIsInvalid(true); // Set invalid state if response indicates failure
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                setIsInvalid(true); // Set invalid state on request error
            });
    };

    return (
        <>
            {isInvalid && wrongAlert}

            <div className='text-center rounded-4 container bg-dark-subtle shadow-lg p-1 my-5'>
                <h2 className="p-1 text-light">Login</h2>
                <div className="container mx-auto">
                    <form onSubmit={handleSubmit} className="form">
                        <input
                            type="text"
                            className="mx-auto rounded-4 form-control w-50 my-2"
                            placeholder='USERNAME'
                            ref={usernameRef}
                        />
                        <input
                            type="password"
                            className="mx-auto rounded-4 form-control w-50 my-2"
                            placeholder='PASSWORD'
                            ref={passwordRef}
                        />
                        <button type='submit' className='btn btn-outline-success my-4'>Login</button>
                    </form>
                </div>
            </div>

            <div className="container text-center fixed-bottom">
                <h2 className='p-2'>
                    New User? <Link className='btn btn-outline-info' to="/register"> Register Here</Link>
                </h2>
            </div>

        </>
    );
};

export default Login;
