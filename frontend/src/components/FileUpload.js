import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

const url = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = url;
const ENDPOINT = 'http://192.168.0.223:5000';

const FileUpload = () => {
  const [pdfFileData, setPdfFileData] = useState();

  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isEnabled, setIsEnabled] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [printStatus, setPrintStatus] = useState('Print Now');

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const onDrop = (acceptedFiles) => {
    // Set the first accepted file as the selected file
    setFile(acceptedFiles[0]);
  };

  const clearAll = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('');
    setPrintStatus('Print Now');
    setIsEnabled(true);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const printFile = async () => {
    await axios
      .post(`${ENDPOINT}/print`, {
        fileName: file.name,
      })
      .then((res) => {
        console.log(res.data);
        if (res.data === 'Printed successfully') {
          console.log('Printed successfully console');
          setPrintStatus('Print Sent');
          setIsEnabled(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const uploadFile = async () => {
    if (!file) return;
    setIsEnabled(true);
    console.log(file.name);
    // Create a new Socket.io client and connect to the server
    const socket = socketIOClient(ENDPOINT);

    // Create a new FormData object and append the selected file
    const formData = new FormData();
    formData.append('file', file);

    // Create a config object for the axios request

    // Make an axios request to the server to upload the file
    await axios
      .post(`${ENDPOINT}/upload`, formData)
      .then((res) => {
        console.log(res.data);
        if (res.data === 'File uploaded successfully') {
          console.log('File uploaded successfully consle');
          setUploadStatus('File uploaded successfully');
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // Set the upload progress to 100%

    // Close the Socket.io connection
    socket.disconnect();
  };

  return (
    <div className='min-w-fit bg-gray-900 text-white p-12 rounded-lg'>
      <h1 className='text-2xl font-bold mb-4'>File Uploader</h1>
      <div className='flex text-xl flex-row mb-4'>
        <div className='' {...getRootProps()}>
          <input {...getInputProps()} />
          {file ? (
            <button className='py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg'>
              {file.name}
            </button>
          ) : (
            <button className='py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg'>
              Drag and drop a file, or click to select a file
            </button>
          )}
        </div>
        <button
          onClick={uploadFile}
          className='ml-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg'
        >
          Upload
        </button>
        {uploadStatus === 'File uploaded successfully' ? (
          <div>
            <button
              disabled={!isEnabled}
              onClick={printFile}
              className={`ml-2 py-2 px-4 rounded-lg ${
                isEnabled
                  ? 'bg-green-600 hover:bg-green-500'
                  : 'bg-gray-700 text-green-500 font-bold'
              }`}
            >
              {printStatus}
            </button>
          </div>
        ) : (
          <div></div>
        )}
        <button
          onClick={clearAll}
          className='ml-2 px-4 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-lg'
        >
          Clear
        </button>
      </div>

      <div></div>
      {file && (
        <div>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
          <div>
            <p className='mt-2'>
              Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
            </p>
            <div className='mt-2 flex flex-row mt-2 font-medium'>
              <button
                type='button'
                disabled={pageNumber <= 1}
                onClick={previousPage}
                className={`mr-2 inline-flex items-center px-3 py-2 border-2 border border-white rounded-md text-white bg-transparent ${
                  pageNumber <= 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 hover:text-black'
                }`}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M15 18l-6-6 6-6' />
                </svg>
                <span className='ml-2'>Previous</span>
              </button>

              <button
                type='button'
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                className={`inline-flex items-center px-3 py-2 border-2 border border-white rounded-md text-white bg-transparent ${
                  pageNumber >= numPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span className='mr-2'>Next</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M9 18l6-6-6-6' />
                </svg>
              </button>
              {/* <input></input> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
