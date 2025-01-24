import React from 'react'

const Confirmation = (props) => {
  return (
    <div className='position-relative'>
        <div className="position-absolute top-50 start-50 bg-dark-subtle shadow-lg z-3 rounded-4 p-5 translate-middle">
                <h2 className="p-1 text-warning">
                    Are You Sure?
                </h2>
                <button className='btn btn-outline-success btn-lg my-3'>Cancel</button>
                <button className='btn btn-outline-danger btn-lg' >Confirm</button>
        </div>
    </div>
  )
}

export default Confirmation
