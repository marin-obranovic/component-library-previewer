import React, { useEffect, useState } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { mdx } from "@mdx-js/react";
import * as missguidedComponents from "missguided-components";
import {
  Container,
  Row,
  Col,
  ToggleButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { init } from "dc-extensions-sdk";
import ComponentLibraryDescription from "missguided-components/dist/form/information.json";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import "./CodeBlock.css";
import { ComponentForm } from "./ComponentForm";

const contentChangeDebounce = new Subject();
const valueUpdate = new Subject();

contentChangeDebounce
  .pipe(debounceTime(1000))
  .subscribe(({ changedLayout, contentData, callback }) => {
    Object.keys(ComponentLibraryDescription).forEach((componentKey) => {
      let modifier = 0;
      const pattern = `<${componentKey} (.*?)\/>`;
      Array.from(changedLayout.matchAll(new RegExp(pattern, "gi"))).forEach(
        (item, index) => {
          if (item[1].indexOf("{ ...content.") === -1) {
            const inserString = ` { ...content.${componentKey + index}} `;

            changedLayout = `${changedLayout.substring(
              0,
              item.index + modifier
            )} <${componentKey}${inserString}${changedLayout.substring(
              item.index + modifier + componentKey.length + 2
            )}`;

            modifier = modifier + inserString.length;
            contentData[componentKey + index] = { componentType: componentKey };
            Object.keys(ComponentLibraryDescription[componentKey]).forEach(
              (propertyKey) => {
                contentData[componentKey + index][propertyKey] = "";
              }
            );
          }
        }
      );
    });

    Object.keys(contentData).forEach((contentKey) => {
      if (changedLayout.indexOf(contentKey) === -1) {
        delete contentData[contentKey];
      }
    });

    callback(changedLayout, contentData);
  });

valueUpdate
  .pipe(debounceTime(500))
  .subscribe(
    ({ content, setContent, componentName, descriptionKey, value }) => {
      console.log(content);
      content.data[componentName][descriptionKey] = value;
      setContent({ ...content });
    }
  );

const CodeBlock = ({ live }) => {
  const [isSDK, setIsSDK] = useState(false);
  const [sdk, setSDK] = useState(undefined);
  const [content, setContent] = useState({ data: {}, layout: "" });
  const [advancedMode, setAdvancedMode] = useState(false);

  useEffect(() => {
    init()
      .then((sdk) => {
        // output available locales
        setIsSDK(true);
        sdk.frame.setHeight(1200);
        setSDK(sdk);
        sdk.field.getValue().then((data) => {
          setContent(JSON.parse(data));
        });
      })
      .catch((err) => {
        console.log("error sdk", err);
      });
  }, []);

  const onJsonEdit = (event) => {
    if (event.error) {
      return;
    }
    setContent({ data: event.jsObject, layout: content.layout });
    if (isSDK) {
      sdk.field.setValue(JSON.stringify(content));
    }
  };

  const onLayoutChange = (event) => {
    contentChangeDebounce.next({
      changedLayout: event,
      contentData: content.data,
      callback: (layout, json) => {
        setContent({ ...content, data: { ...json }, layout });
      },
    });
  };

  const saveToAmplience = () => {
    if (isSDK) {
      sdk.field.setValue(JSON.stringify(content));
    }
  };

  const handleAdvancedModeChange = (value) => {
    setAdvancedMode(value);
  };

  if (live) {
    return (
      <div className="code-block-container">
        <LiveProvider
          code={content.layout}
          transformCode={(code) => "/** @jsx mdx */" + code}
          scope={{
            mdx,
            ...missguidedComponents,
            Container,
            Col,
            Row,
            content: content.data,
          }}
        >
          <Container fluid className="height-100">
            <Row className="height-100">
              <Col>
                <div className="live-preview-container">
                  <LivePreview />
                </div>
              </Col>
              <Col lg={4} className="code-edit height-100">
                {isSDK && (
                  <Row className="button-container">
                    <Col>
                      <button onClick={saveToAmplience}>
                        save Changes to Amplience
                      </button>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col>
                    <ToggleButtonGroup
                      type="radio"
                      value={advancedMode}
                      name="advancedMode"
                      onChange={handleAdvancedModeChange}
                      className="mb-4"
                    >
                      <ToggleButton name="form" value={true}>
                        Form
                      </ToggleButton>
                      <ToggleButton name="json" value={false}>
                        Json
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <div className="react-json-container">
                      {!advancedMode && (
                        <JSONInput
                          id="a_unique_id"
                          placeholder={content.data}
                          theme="dark_vscode_tribute"
                          locale={locale}
                          height="550px"
                          width="100%"
                          onChange={onJsonEdit}
                        />
                      )}
                      {advancedMode && (
                        <div>
                          <ComponentForm
                            valueUpdate={valueUpdate}
                            content={content}
                            setContent={setContent}
                          />
                        </div>
                      )}

                      {/* <ReactJson
                        collapsed={false}
                        src={content}
                        theme="paraiso"
                        onAdd={onAddJson}
                        onEdit={onEditJson}
                        onDelete={onDeleteJson}
                      /> */}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="live-editor-container">
                      <LiveEditor onChange={onLayoutChange} />
                    </div>
                    <div className="live-error-container">
                      <LiveError />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </LiveProvider>
      </div>
    );
  }

  return (
    <Highlight {...defaultProps} code={content.layout}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: "20px" }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export { CodeBlock };
