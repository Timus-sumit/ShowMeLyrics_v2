/*global chrome*/
import React, { useState, useEffect } from "react"
const axios = require('axios')

const bgGradients = [
  "bg-gradient-to-br from-purple-400 to-yellow-400",
  "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
  "bg-gradient-to-br from-green-300 via-blue-500 to-purple-600",
  "bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400",
  "bg-gradient-to-br from-indigo-200 via-red-200 to-yellow-100",
  "bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-500",
  "bg-gradient-to-br from-yellow-200 via-green-200 to-green-500",
  "bg-gradient-to-br from-red-200 via-red-300 to-yellow-200",
  "bg-gradient-to-br from-green-200 via-green-300 to-blue-500",
  "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700",
  "bg-gradient-to-br from-green-200 via-green-400 to-purple-700",
  "bg-gradient-to-br from-red-200 to-red-600",
  "bg-gradient-to-br from-green-300 via-yellow-300 to-pink-300",
  "bg-gradient-to-br from-indigo-300 to-purple-400",
  "bg-gradient-to-br from-green-200 to-green-500"
]
const randomNumber = Math.floor(Math.random()*bgGradients.length)

function Lyrics() {
    const [songName , setSongName] = useState("")
    const [error, setError] = useState("")
    const [lyrics, setLyrics] = useState([])
    const [coverArt, setCoverArt] = useState("")
    const [showName, setShowName] = useState("")
    const [artist, setArtist] = useState("")
    const [load, setLoad] = useState(false)
   const [url, setUrl] = useState("")

    useEffect(() => {
      const queryInfo = {active: true, lastFocusedWindow: true}

      chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
          const url = tabs[0].url
          setUrl(url)
          console.log(url)
      })
  }, [])

    const onSongNameChange = (e) => {
        const val = e.target.value;
        setSongName(val)
    }

    const onSubmit = (e) => {
        e.preventDefault()
        // console.log(songName)
        if(songName === ""){
          const err = "Please enter a song name."
          setError(err);
        } else {
          setError("")
          setLyrics([])
          setCoverArt("")
          setShowName("")
          setArtist("")
          setLoad(true)
          const options = {
            method: 'GET',
            url: 'https://shazam.p.rapidapi.com/search',
            params: {
              term: songName,
              locale: 'en-US',
              offset: '0',
              limit: '5'
            },
            headers: {
              'x-rapidapi-host': 'shazam.p.rapidapi.com',
              'x-rapidapi-key': 'a97a4e950bmsh6672a5ffdf5b02ep1f8e0ajsnb55dc0a39798'
            }
          };
          
          axios.request(options).then(function (response) {
            const data = response.data
              if(!(Object.keys(data).length === 0 && data.constructor === Object)){

                const key = data.tracks.hits[0].track.key
                const options = {
                  method: 'GET',
                  url: 'https://shazam.p.rapidapi.com/songs/get-details',
                  params: {key , locale: 'en-US'},
                  headers: {
                    'x-rapidapi-host': 'shazam.p.rapidapi.com',
                    'x-rapidapi-key': 'a97a4e950bmsh6672a5ffdf5b02ep1f8e0ajsnb55dc0a39798'
                  }
                };
                
                axios.request(options).then(function (response) {
                  const songData = response.data
                  console.log(songData)
                  if(songData.sections[1].type === 'LYRICS'){
                    const songLyrics = songData.sections[1].text
                    setLyrics(songLyrics)
                    if(songData.images.coverart){
                      setCoverArt(songData.images.coverart)
                    }
                    if(songData.subtitle) {
                      setArtist(songData.subtitle)
                    }
                    if(songData.title) {
                      setShowName(songData.title)
                    }
                    setLoad(false)
                  } else {
                    const err = "Could not find this song in the database! Maybe try removing characters like '-' from song name."
                    setError(err)
                    setLoad(false)
                  }
                }).catch(function (error) {
                  console.error(error);
                });
              } else {
                const err = "Could not find this song in the database! Maybe try removing characters like '-','()' from song name."
                setError(err)
                setLoad(false)
              }
          }).catch(function (error) {
              console.error(error)
          })
        }
    }
    const clr = bgGradients[randomNumber]
  return (
    <div className= {`flex flex-col w-ext text-center items-center justify-center py-8 px-2 border-2 rounded-md ${clr}`}>
        <h1 className="text-3xl font-bold">ShowMeLyrics</h1>
        {url !== "" && <p>{url}</p>}
        <div className="my-10">
            <form onSubmit={onSubmit} className="text-center">
                <p className="mb-2 text-lg">Enter the artist and song name!</p>
                <input type="text" id="songName" name="songName" className="h-10 px-2 border rounded-md w-80" value={songName} onChange={onSongNameChange}/>
                <br/>
                <button className="px-2 py-1 mt-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Search</button>
                <br/>
            </form>
        </div>
        {(load === true) && <p>loading...</p>}
        {error !== "" && <p className="text-red-500">{error}</p>}
        {coverArt !== "" && <img src={coverArt} alt="" className="rounded-sm w-60"/>}
        {showName !== "" && <p className="mt-2 text-xl font-semibold">{showName}</p>}
        {artist !== "" && <p className="mb-2 text-lg">{artist}</p>}
        <br/>
        {lyrics.length !== 0 && lyrics.map((line) => (<p className="mt-1 text-base">{line}</p>))}
    </div>
  );
}

export default Lyrics;
