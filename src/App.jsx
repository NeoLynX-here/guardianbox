// App.jsx
import React from "react";
import UploadPage from "./UploadPage";
import DownloadPage from "./DownloadPage";

function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function App() {
  const id = getParam("id");
  
  React.useEffect(() => {
    console.log("Current ID:", id);
    console.log("Full URL:", window.location.href);
  }, [id]);

  if (id) {
    return <DownloadPage fileId={id} />;
  }
  return <UploadPage />;
}