import React, { useState, useEffect, useRef } from 'react'
import '../css/style.css'
import Fuse from 'fuse.js'
import Courses from '../types/json'
import Data from '../types/data'

/**
 * 
 * @param data - The object containing the course data, called from the internal API.
 */

function Search(data: Data) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchBar, setSearchBar] = useState(null);
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
    
    const handleSearch = () => {
      if (searchBar) {
        setSearchTerm(searchBar.value);
      }
      if (searchTerm) {
        // Removes whitespace from the search.
        const query = searchTerm.replace(/\s/g, '');
        const result: Courses = fuse.search(query);
        setFuseList(result);
      }
    }

    useEffect(() => {
      const search: HTMLElement = document.getElementById('search-bar');
      setCourses(data.data);

      if (courses) {
        fuse = new Fuse(courses, options);
      }

      if (search) {
        setSearchBar(search);
      }
    });

    return (
        <div>
            <input type='text' id='search-bar' placeholder='search' onChange={handleSearch} value={searchTerm}/>
            <div style={{color: 'white'}}>{stateRef.current}</div>
        </div>
    )
}

export default Search;