import React, { useState, useEffect, useRef } from 'react'
import '../css/style.css'
import Fuse from 'fuse.js'

function Search(data: any) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchBar, setSearchBar] = useState(null);
    const [courses, setCourses] = useState(null);
    const [fuseList, setFuseList] = useState(null);
    const stateRef = useRef();

    //@ts-ignore
    stateRef.current = fuseList ? fuseList[0]['item']['subject'] + fuseList[0]['item']['number'] : '';

    let fuse: string;
    const options = {
      keys: ['subject', 'number']
    }
    
    const handleSearch = () => {

      if (searchBar) {
        //@ts-ignore
        setSearchTerm(searchBar.value);
      }
      if (searchTerm) {
        const result: any = fuse.search(searchTerm);
        //@ts-ignore
        setFuseList(result);
      }
    }

    useEffect(() => {
      const search: any = document.getElementById('search-bar');
      setCourses(data.data);

      if (courses) {
        // @ts-ignore
        fuse = new Fuse(courses, options);
      }

      if (search) {
        setSearchBar(search);
      }
    });

    return (
        <div>
            <input type='text' id='search-bar' placeholder='search' onChange={handleSearch} value={searchTerm}/>
            {/**
             //@ts-ignore */}
            <div style={{color: 'white'}}>{stateRef.current}</div>
        </div>
    )
}

export default Search;