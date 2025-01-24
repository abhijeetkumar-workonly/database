import React, { useRef } from 'react'

const Modal = (props) => {

    const projName = useRef(null)

    const handleSubmit=(e)=>{
        e.preventDefault();
        const projectNameEntry = projName.current.value.trim();
        props.getData(false, projectNameEntry)
    }

  return (
    <div className='position-relative'>
        <div className="position-absolute top-50 start-50 bg-dark-subtle shadow-lg z-3 rounded-4 p-5 translate-middle">
            <form action="submit my-2" onSubmit={handleSubmit}>
                <input type="text" className='form-control my-3' ref={projName} placeholder='Project Name'/>
                <button className='btn btn-outline-success btn-lg my-3' type='submit'>Add Project</button>
            </form>
            <button className='btn btn-outline-danger btn-lg' onClick={()=>{props.getData(false, null)}}>Close</button>
        </div>
    </div>
  )
}

export default Modal
