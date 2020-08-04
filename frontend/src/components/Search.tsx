import React, { useState, useEffect, useRef } from 'react'
import '../css/style.css'
import Fuse from 'fuse.js'
import Courses from '../types/json'
import Data from '../types/data'

function Search(data: Data) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchBar, setSearchBar] = useState(null);
    const [courses, setCourses] = useState(null);
    const [fuseList, setFuseList] = useState(null);
    const stateRef = useRef();

    stateRef.current = fuseList ? fuseList[0]['item']['subject'] + fuseList[0]['item']['number'] : '';

    let fuse: {[key: string]: any};
    const options = {
      keys: ['subject', 'number']
    }
    
    const handleSearch = () => {

      if (searchBar) {
        setSearchTerm(searchBar.value);
      }
      if (searchTerm) {
        const result: Courses = fuse.search(searchTerm);
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