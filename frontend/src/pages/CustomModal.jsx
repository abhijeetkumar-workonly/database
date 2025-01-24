import axios from 'axios';
import React, { useRef, useState } from 'react';
import Resizer from 'react-image-file-resizer';

const CustomModal = (props) => {

    const lruNameRef = useRef(null);

    const [img, setImg] = useState(null);
    const [lruCat, setLruCat] = useState("Airborne");

    const handleSubmit = (e) => {
        e.preventDefault();
        const lruCateg = lruCat;
        const lruName = lruNameRef.current.value.trim();
        const lruImage = img;
        props.handleModalData(false, lruCateg, lruName, lruImage);
    };

    // Function to resize image
    const resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,           // File object
                150,            // Desired width
                150,            // Desired height
                'JPEG',         // Format
                100,             // Quality (0-100)
                0,              // Rotation
                (uri) => {      // Callback after resize
                    resolve(uri);
                },
                'blob'          // Output type: 'base64' or 'blob'
            );
        });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const resizedFile = await resizeFile(file);
            setImg(resizedFile);
        }
    };

    const handleCategChange = (e) => {
        setLruCat(e.target.value);
    };

    return (
        <div className='container'>
            <div className="position-absolute top-50 start-50 bg-dark-subtle shadow-lg z-2 rounded-4 p-5 translate-middle">
                <h1 className="p-1 text-secondary">
                    Add New LRU
                </h1>
                <form onSubmit={handleSubmit} className="my-2 mx-auto">
                    <div className="form-check">
                        <input
                            onChange={handleCategChange}
                            className="form-check-input"
                            type="radio"
                            name="lruCategory"
                            value="Airborne"
                            id="flexRadioDefault1"
                            checked={lruCat === 'Airborne'}
                        />
                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                            Airborne
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            onChange={handleCategChange}
                            className="form-check-input"
                            type="radio"
                            name="lruCategory"
                            value="Ground"
                            id="flexRadioDefault2"
                            checked={lruCat === 'Ground'}
                        />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            Ground
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            onChange={handleCategChange}
                            className="form-check-input"
                            type="radio"
                            name="lruCategory"
                            value="Other"
                            id="flexRadioDefault3"
                            checked={lruCat === 'Other'}
                        />
                        <label className="form-check-label" htmlFor="flexRadioDefault3">
                            Other
                        </label>
                    </div>
                    <input
                        type="text"
                        ref={lruNameRef}
                        className='form-control my-3'
                        placeholder='LRU Name'
                    />
                    <div className="input-group mb-3">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="form-control"
                            id="imageInput"
                        />
                        <label htmlFor="imageInput" className='input-group-text'>LRU Image</label>
                    </div>
                    <button
                        className='btn btn-outline-success btn-lg my-3'
                        type='submit'
                    >
                        Add LRU
                    </button>
                </form>
                <button
                    onClick={() => { props.handleModalData(false, null, null) }}
                    className='btn btn-outline-danger btn-lg'
                    type='button'
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CustomModal;
