import { useState } from "react";
import CodeEditor from "react-simple-code-editor";
import Highlight, { Prism } from "prism-react-renderer";
import theme from "./theme";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

const editorUpdate = new Subject();

editorUpdate.pipe(debounceTime(500)).subscribe(({ value, callback }) => {
  try {
    callback(JSON.parse(value));
  } catch (e) {
    console.log("editor:", e);
  }
});

const Editor = ({ handleChange, code, language = "yaml", className }) => {
  const [something, setSomething] = useState(code);

  let highlightCode = (code) => (
    <Highlight Prism={Prism} code={code} theme={theme} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            // eslint-disable-next-line react/jsx-key
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                // eslint-disable-next-line react/jsx-key
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );

  return (
    <CodeEditor
      className={className}
      value={something}
      padding={10}
      highlight={highlightCode}
      style={{ overflow: "auto" }}
      onValueChange={(value) => {
        setSomething(value);
        editorUpdate.next({
          value,
          callback: handleChange,
        });
      }}
    />
  );
};

export default Editor;
