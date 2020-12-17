import React from 'react';

function Legend(props: any) {
    return(
        <div>
            <div id='Legend' className='Legend'> Instructions - For a given course, it must have at least one of each course with a different colored arrow as a pre-requisite. Within each color group, any one of those courses will suffice for that color as a pre-requisite.  </div>
        </div>
    )
}

export default Legend;

