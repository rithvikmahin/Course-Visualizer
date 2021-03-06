import React, { useState, useEffect, useRef } from 'react'
import '../css/style.css'
import Fuse from 'fuse.js'
import Courses from '../types/json'

/**
 * 
 * @param data - The object containing the course data, called from the internal API.
 */
function Search(props: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const [courses, setCourses] = useState(null);
    const [fuseList, setFuseList] = useState(null);
    const stateRef = useRef();
    
    // Sets the state reference to display the list of search results.
    stateRef.current = fuseList && fuseList.length > 0 && 
                       searchTerm ? fuseList[0]['item']['subject'] + fuseList[0]['item']['number'] : '';

    let fuse: {[key: string]: any};

    // The fuse.js options.
    const options = {
      keys: ['subject', 'number']
    }
    
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      setSearchTerm(value);

      if (value) {
        // Removes whitespace from the search.
        const query = value.replace(/\s/g, '');
        const result: Courses = fuse.search(query);
        setFuseList(result);
      }
    }

    useEffect(() => {
      const search: HTMLElement = document.getElementById('search-bar');
      setCourses(props.data);

      if (courses) {
        fuse = new Fuse(courses, options);
      }

    });

    return (
        <div>
            <input type='text' id='search-bar' className='search-bar' placeholder='Enter a course number' onChange={handleSearch} value={searchTerm}/>
            {/**
             * 
             //@ts-ignore */}
            <div id='search-result' className='search-result' onClick={() => props.action(stateRef.current)}>{stateRef.current}</div>
        </div>
    )
}

export default Search;