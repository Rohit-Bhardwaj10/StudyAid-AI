import React, { useState, useEffect, useRef  } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useLocation } from "react-router-dom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import resultStyle from "../styles/result.module.css";
import axios from "axios";
import { MdSend, MdStop } from 'react-icons/md';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';



const API_URL = "http://localhost:5000";

const Result = () => {
  const location = useLocation();
  const { state } = location;
  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState(""); // To hold the summarized text
  const [displayText, setDisplayText] = useState(""); // For typewriter effect
  const [isLoading, setIsLoading] = useState(false); // To handle loading state
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  // Load file from state if available
  useEffect(() => {
    if (state?.fileUrl && state?.fileType === "pdf") {
      setPdfFile(state.fileUrl);
      setPageNumber(state?.pageNumber ?? 1); // Fallback to 1 if not provided
    }
  }, [state]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(URL.createObjectURL(file));
    }
  };

  const handleSummarise = async () => {
    try {
      setIsLoading(true); // Set loading state
      setIsSending(true)
      const response = await axios.post(`${API_URL}/summarise`, {
        dir: state.fileUrl, // Send in the request body
        pageRange: value,
      });
      const text = response.data.text; // Extract the summarized text
      setSummary(text); // Store full text
      setDisplayText(""); // Reset display text for typewriter effect
      typeWriterEffect(text); // Start the typewriter effect
    } catch (error) {
      console.error("Error during summarise:", error);
      setSummary("Failed to fetch summary. Please try again."); // Error message
    }
  };
  const typewriterActive = useRef(true);
  const summaryContainerRef = useRef(null); // Ref for the summary container

  const typeWriterEffect = async (text) => {
    let index = 0;
    const speed = 10; // Faster typing speed (ms per character)
    typewriterActive.current = true; // Enable typewriter effect
  
    const type = () => {
      return new Promise((resolve) => {
        const typeNext = () => {
          if (index < text.length && typewriterActive.current) {
            setDisplayText((prev) => prev + text[index]);
            // Scroll the container to the bottom
            if (summaryContainerRef.current) {
              summaryContainerRef.current.scrollTop =
                summaryContainerRef.current.scrollHeight;
            }

            index++;
            setTimeout(typeNext, speed);
          } else {
            resolve(); // Resolve the promise when typing is complete
          }
        };
        typeNext();
      });
    };
  
    await type();
    setIsLoading(false); // Set these only after typing is complete
    setIsSending(false);
  };
  

  const handleStop = () => {
    typewriterActive.current = false; // Disable typewriter effect
    setIsLoading(false)
    setIsSending(false)
  };


  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true); 

    try {
      const response = await axios.post(`${API_URL}/prompt`, {
        prompt:`${prompt} ${summary}`
      });
      const text = response.data.text; // Extract the summarized text
      setSummary(text); // Store full text
      setDisplayText(""); // Reset display text for typewriter effect
      typeWriterEffect(text); // Start the typewriter effect
    } catch (error) {
      // Handle errors (e.g., display error message)
      console.error('Error submitting prompt:', error);
    } 
    setPrompt(''); 
  };

  const [value, setValue] = React.useState([1,numPages]);

  const handleRangeChange = (event, newValue) => {
    setValue(newValue);
  };
  function valuetext(value) {
    return `${value}`;
  }
  useEffect(() => {
    if (numPages > 0) {
      setValue([1, numPages]); // Set the range to cover all pages
    }
  }, [numPages]);
  return (
    <div className={resultStyle.body_result}>
      <div className={resultStyle["app-container"]}>
        {/* PDF Viewer Section */}
        <div className={resultStyle["pdf-viewer-section"]}>
          {pdfFile ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfFile}
                plugins={[defaultLayoutPluginInstance]}
                initialPage={(pageNumber - 1) || 0}
                onDocumentLoad={(e)=>{
                  setNumPages(e.doc.numPages);
                }}
              />
            </Worker>
          ) : (
            <div className={resultStyle["placeholder"]}>
              <p>Choose a PDF file to view its content.</p>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className={resultStyle["sidebar-section"]}>
          <h3>AI Assistant 🤖</h3>
          <p>Use AI to analyze or summarize your document.</p>
          <div className={resultStyle.optionContainer}>
            <button
              className={resultStyle["action-button"]}
              onClick={handleSummarise}
              disabled={isLoading} // Disable button while loading
              style={isLoading?{background:"grey"}:null}
            >
              {isLoading? "Summarizing..." : "Summarize Page Range"}
            </button>
            <Box sx={{ width:200,
            display: 'flex', 
            flexDirection: 'column-reverse',
            
            }}>
              <Slider
                getAriaLabel={() => 'page range'}
                value={value}
                onChange={handleRangeChange}
                valueLabelDisplay="on"
                getAriaValueText={valuetext}
                min={1}
                max={numPages}
              />
            </Box>
          </div>
          
          <div className={resultStyle["insights"]}>
            <h4>Discover More</h4>
            <div className={resultStyle["summary-container"]} ref={summaryContainerRef}>
              <p className={resultStyle["summary-text"]}>
                {displayText || "Insights and analysis will appear here."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={resultStyle["prompt-bar"]}>
        <input 
          type="text" 
          placeholder="Enter your prompt here..." 
          value={prompt} 
          onChange={handleChange} 
          className={resultStyle["prompt-input"]}
          disabled={isSending} 
        />
        {isSending ? (
          <button type="button" className={resultStyle["submit-button"]} onClick={handleStop} disabled={!isLoading && !isSending}>
          <MdStop />
        </button>
        ) : (
          <button type="submit" className={resultStyle["submit-button"]}>
            <MdSend />
          </button>
        )}
      </form>

        </div>
      </div>
    </div>
  );
};

export default Result;
