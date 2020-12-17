import React from 'react';

function NodeInformation(props: any) {
    return(
        <div>
            <div id='Description' className='NodeInformation'> {props.data} </div>
        </div>
    )
}

export default NodeInformation;

