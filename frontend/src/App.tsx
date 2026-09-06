import axios from "axios";
import "./index.css";
import { useRef, useState } from "react";

const BACKEND_URL = "http://localhost:3000";
export function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [language, setLanguage] = useState("c++");
  const [status, setStatus] = useState<string>();
  const [output, setOutput] = useState<string>();
  const [error, setError] = useState<string>();


  const pollBackend = async (submisionId: string) => {
    const response = await axios.get(`${BACKEND_URL}/submission/${submisionId}`);
    setStatus(response.data.submission.status);
    if (response.data.submission.status === "Suceess") {
      setOutput(response.data.submission.output);
    } else if (response.data.submission.status === "Failure") {
      console.log("failed")
      setOutput("Code Failure");
      setError(response.data.submission?.stdErr || "no error output");
    } else {
      await new Promise(r => setTimeout(r, 3000));
      pollBackend(submisionId);
    }
  }

  const sendRequest = async () => {
    setStatus("");
    setOutput("");
    setError("");
    const response = await axios.post(`${BACKEND_URL}/submission`, {
      "language": language,
      "code": textAreaRef.current?.value
    });
    pollBackend(response.data.id)
  }
  return (
    <div className="w-screen h-screen flex">
      <div className="flex-1 h-screen">
        <div className="flex justify-around">
          <button className="p-1 bg-gray-200 border-1" onClick={sendRequest}>Submit</button>
          <button className="p-1 bg-gray-200 border-1" onClick={() => setLanguage("c++")} >C++</button>
          <button className="p-1 bg-gray-200 border-1" onClick={() => setLanguage("js")} >Javascript</button>
          <button className="p-1 bg-gray-200 border-1" onClick={() => setLanguage("py")} >python</button>
        </div>
        <textarea ref={textAreaRef} className="h-screen w-full m-4 p-4 border-2" name="code-editor" id="editor"></textarea>
      </div>
      <div className="flex-1 h-screen bg-green-300">
        <div>
          Language = {language}
        </div>
        <div>
          Status = {status}
        </div>
        {!error && (
          <div>
            Output = {output}
          </div>
        )}

        {error && (
          <div>
            Error = {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
