import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    // Create refs for each input field
    const fullNameRef = useRef(null);
    const userNameRef = useRef(null);
    const idCardNumberRef = useRef(null);
    const mobileNumberRef = useRef(null);

    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Access input values using refs
        const fullName = fullNameRef.current.value;
        const userName = userNameRef.current.value;
        const idCardNumber = idCardNumberRef.current.value;
        const mobileNumber = mobileNumberRef.current.value;

        if(fullName===""||userName===""||idCardNumber===""||mobileNumber===""){
            alert("Please fill all the required fields")
            return;
        }

        // sending for approval to database
        axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/pendingUsers`, { fullName, userName, idCardNumber, mobileNumber })
            .then(response => {
                if (response.statusText==="OK"){
                    navigate("/")
                    alert("Registration Successfull! You can login after Admin approval.")
                }
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    };

    return (
        <>
            <div className='container bg-dark-subtle rounded-3 shadow-lg justify-content-center text-center'>
                <h2 className="p-1 text-primary text-opacity-25">
                    Register
                </h2>
                <form className='form' onSubmit={handleSubmit}>
                    <input
                        className='form-control my-4'
                        type="text"
                        placeholder='Full Name'
                        ref={fullNameRef} // Attach ref
                    />
                    <input
                        className='form-control my-4'
                        type="text"
                        placeholder='User Name'
                        ref={userNameRef} // Attach ref
                    />
                    <input
                        className='form-control my-4'
                        type="password"
                        placeholder='ID Card Number'
                        ref={idCardNumberRef} // Attach ref
                    />
                    <input
                        className='form-control my-4'
                        type="text"
                        placeholder='Mobile Number'
                        ref={mobileNumberRef} // Attach ref
                    />
                    <p className="p-1 text-danger">Your ID Card number will be used as your password</p>
                    <button type="submit" className='btn btn-outline-success my-3 p-2'>Register</button>
                </form>
            </div>

            <div className="container text-center fixed-bottom">
                <h2 className='p-2'>
                    Already Have an account? <Link className='btn btn-outline-info' to="/login"> Login Here</Link>
                </h2>
            </div>
        </>
    );
}

export default Register;
