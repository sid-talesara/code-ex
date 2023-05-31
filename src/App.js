//------------------- imports -------------------
import "./App.css";
import { useState, useEffect } from "react";
import { storage } from "./firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import { BsFillCloudArrowUpFill, BsFillCloudCheckFill } from "react-icons/bs";

//------------------- App Component -------------------
function App() {
  // ======= UseStates Declarations ======
  const [fileUpload, setFileUpload] = useState(null);
  const [file, setFile] = useState({ fileName: "", fileContent: "" });
  const [apiData, setAPIData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // ======= Language Selection Function ======
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  // ======= File Upload Function ======
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileUpload(file);
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      setFile({
        fileName: file.name,
        fileContent: reader.result,
      });
    };
    reader.onerror = () => {
      console.log("file error", reader.error);
    };
  };

  // ======= FileCheck Function ======
  const uploadCodeFile = () => {
    if (fileUpload === null) return; //if file is not uploaded it comes out of function
    // if file is uploaded the function continues ↓
    if (selectedLanguage.length > 0) {
      const fileRef = ref(storage, `code-files/${fileUpload.name + uuidv4()}`);
      uploadBytes(fileRef, fileUpload).then(() => {
        console.log("Document Uploaded to Firebase");
      });
      // ======= Piston Post API Call ======
      // Piston API: https://piston.readthedocs.io/en/latest/api-v2/
      fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage, //selectedLanguage is from dropdown
          version: "*",
          files: [
            {
              content: file.fileContent, // file content is the code from the file
            },
          ],
          args: [],
          stdin: "", //input for the code if any
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          // Process the response data as needed
          setAPIData(data); //saving the response data into apiData hook
        })
        .catch((error) => {
          // Handle the error
          console.error("Error:", error);
        });
    } else {
      alert("select a language");
    }
  };

  // ======= PDF Report Function ======
  const pdfGenerate = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    const lineHeight = 10;
    // Set the initial position for the text
    let textPositionY = 10;
    // Add the date
    doc.text(`Date: ${currentDate}`, 10, textPositionY);
    textPositionY += lineHeight;
    // Add Sample code
    const codeUploaded = doc.splitTextToSize(file.fileContent, 180);
    doc.text(` CODE UPLOADED: ${codeUploaded}`, 10, textPositionY);
    textPositionY += codeUploaded.length * lineHeight;
    // Add the output
    const codeLanguage = doc.splitTextToSize(apiData.language, 180);
    doc.text(` Code Language : ${codeLanguage}`, 10, textPositionY);
    textPositionY += codeLanguage.length * lineHeight;
    const codeError = doc.splitTextToSize(apiData.run.stderr, 180);
    doc.text(` CODE Errors: ${codeError}`, 10, textPositionY);
    textPositionY += codeError.length * lineHeight;
    const codeOutput = doc.splitTextToSize(apiData.run.output, 180);
    doc.text(` CODE Output: ${codeOutput}`, 10, textPositionY);
    textPositionY += codeOutput.length * lineHeight;
    const thankYouMessage = `<Thank you for using Cod-Ex!>`;
    doc.text(thankYouMessage, 10, textPositionY);
    // ======= saving the pdf report ======
    doc.save(`${selectedLanguage}-code-report-codex-${currentDate}.pdf`);
  };

  // ======= Functional Component Return Statement======
  return (
    <div className="app">
      {/*  ======= NavBar ====== */}
      <header className="navbar">
        <div className="navbar-logo">
          <img
            src="/assets/16353_3867287_580791_image-removebg-preview.svg"
            alt="codex-logo"
            className="codex-logo"
          />
        </div>
      </header>
      {/*  ======= Hero Section====== */}
      <section className="hero">
        <h1 className="hero-title">Codex</h1>
        <p className="hero-subtitle">Run Code in the browser</p>
        {/* <p className="hero-subtitle">Supported File Formats: .txt</p> */}
      </section>
      <section className="main">
        {/*  ======= File Input Area ====== */}
        {!apiData && (
          <div className="file-input-container">
            <div
              className="file-upload-container"
              onClick={() => {
                document.querySelector("#file-input").click();
              }}
            >
              {file && file.fileName ? (
                <BsFillCloudCheckFill className="cloud-icon" />
              ) : (
                <BsFillCloudArrowUpFill className="cloud-icon" />
              )}

              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
                required
                hidden
              />
              {file && file.fileName && (
                <p className="main-fileUpload-text inputtext">
                  {file.fileName}
                </p>
              )}
              {!file.fileName && (
                <>
                  <p className="main-fileUpload-text inputtext">
                    Support files
                  </p>
                  <p className="info-fileUpload-text inputtext">.txt </p>
                </>
              )}
            </div>
            <div className="dropdown-language">
              <select
                className="selected-language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="">Select a language</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="c#">C#</option>
                <option value="typeScript">TypeScript</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
              </select>
              {selectedLanguage && <p>Selected language: {selectedLanguage}</p>}
            </div>
            <button className="upload-button" onClick={uploadCodeFile}>
              Check Code
            </button>
          </div>
        )}
        {/*  ======= Generated Report Table ====== */}
        {apiData && (
          <table className="result-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Language</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr key={file.fileName}>
                <td>{file.fileName}</td>
                <td>{apiData.language}</td>

                <td>
                  <button className="download-button" onClick={pdfGenerate}>
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
      {/*  ======= Footer ====== */}
      <footer className="footer">
        Codex &#169; 2023, Developed with ❤️ by Sid Talesara
      </footer>
    </div>
  );
}

export default App;
