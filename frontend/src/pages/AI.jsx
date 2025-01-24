import React, { useState, useRef } from "react";
import axios from "axios";


export default function AI(){
    const [response, setResponse] = useState('');
    const promptRef = useRef(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChat = async () => {
        const promptEntered = promptRef.current.value;
        if (promptEntered === '') {
            return;
        }
        setLoading(true);
        setError('');

        const requestBody = {
            model: "dolphin-llama3:latest",
            prompt: promptEntered,
            stream: false,
        };
        try {
            const res = await axios.post('http://192.168.137.2:11434/api/generate', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setResponse(res.data.response); // Assuming the response has a field 'response'
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to fetch response');
        } finally {
            setLoading(false);
            promptRef.current.value = null;
        }
    };

    return (
        <div className="container-fluid text-center p-3 rounded-4 bg-dark-subtle vh-100">
            <div className="container fixed-bottom p-4">
                <form action="submit ">
                    <input ref={promptRef} type="text" className="form-control mx-3 my-3" placeholder="Message" />
                    <button className="btn btn-primary mx-3 my-3" onClick={handleChat} disabled={loading}>
                        {loading ? 'Loading...' : 'Send'}
                    </button>
                </form>
            </div>

            {error && <>
                <div className="container bg-danger-subtle">
                    <h3 style={{ color: 'red' }}>{error}</h3>
                </div>
            </>}
            {response &&
                <>
                    <div className="container bg-primary-subtle rounded-5 p-5">
                        <h3 className="text-secondary"> <span className="text-success text-opacity-50">Response:</span>  {response}</h3>
                    </div>
                </>}
        </div>
    );
}