import React, { useEffect, useState } from "react";
import { LiveProvider, LiveEditor, LiveError } from "react-live";
import { LivePreview } from "./LivePreview";
import { mdx } from "@mdx-js/react";
import * as missguidedComponents from "missguided-components";
import {
  Container,
  Row,
  Col,
  ToggleButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import { init } from "dc-extensions-sdk";
import ComponentLibraryDescription from "missguided-components/dist/form/information.json";
import ComponentLibraryEnums from "missguided-components/dist/enum/enum.json";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import "./CodeBlock.css";
import { ComponentForm } from "./ComponentForm";
import Editor from "./Editor";
import { InputModal } from "./inputModal";
import classnames from "classnames";

const contentChangeDebounce = new Subject();
const valueUpdate = new Subject();

contentChangeDebounce.pipe(debounceTime(1000)).subscribe((props) => {
  updateContentLayout(props);
});

const updateContentLayout = ({ changedLayout, contentData, callback }) => {
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
              switch (ComponentLibraryDescription[componentKey][propertyKey]) {
                case "string":
                  contentData[componentKey + index][propertyKey] = "";
                  break;
                case "boolean":
                  contentData[componentKey + index][propertyKey] = false;
                  break;
                default:
                  const currentEnum =
                    ComponentLibraryEnums[
                      ComponentLibraryDescription[componentKey][propertyKey]
                    ];
                  if (currentEnum && Object.keys(currentEnum).length > 0) {
                    const firstValue = currentEnum[Object.keys(currentEnum)[0]];
                    contentData[componentKey + index][propertyKey] = firstValue;
                  }
                  break;
              }

              // update values accordingly
              // enums, booleans and stuff
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
};

valueUpdate
  .pipe(debounceTime(500))
  .subscribe(
    ({ content, setContent, componentName, descriptionKey, value }) => {
      console.log(content);
      content.data[componentName][descriptionKey] = value;
      setContent({ ...content });
    }
  );

const CodeBlock = () => {
  const [isSDK, setIsSDK] = useState(false);
  const [sdk, setSDK] = useState(undefined);
  const [content, setContent] = useState({ data: {}, layout: "" });
  const [advancedMode, setAdvancedMode] = useState(false);
  const [propertyNameToUpdate, setPropertyNameToUpdate] = useState("");
  const [newWindowMode, setNewWindowMode] = useState(false);
  const [openedWindow, setOpenedWindow] = useState(window);

  useEffect(() => {
    init()
      .then((sdk) => {
        // output available locales
        setIsSDK(true);
        sdk.frame.setHeight(1200);
        setSDK(sdk);
        sdk.field.getValue().then((data) => {
          updateContentLayout({
            changedLayout: content.layout,
            contentData: content,
            callback: (layout, json) => {
              setContent({ ...content, data: { ...json }, layout });
            },
          });
        });
      })
      .catch((err) => {
        console.log("error sdk", err);
      });
  }, []);

  useEffect(() => {
    if (newWindowMode && openedWindow) {
      openedWindow.postMessage(content);
    }
  }, [content]);

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

  const openInNewWindow = () => {
    if (!newWindowMode) {
      const newWindow = window.open(
        "http://localhost:3000/live-preview",
        "_blank",
        {
          status: 0,
          menubar: 0,
        }
      );
      setOpenedWindow(newWindow);
    }
    setNewWindowMode(true);
  };

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
        <div
          className={classnames({ wrapper: true, fullscreen: newWindowMode })}
        >
          <section className="sidebar">
            {isSDK && (
              <button onClick={saveToAmplience}>
                save Changes to Amplience
              </button>
            )}
            {!newWindowMode && (
              <button onClick={openInNewWindow}>Open in new window</button>
            )}
            <ToggleButtonGroup
              type="radio"
              value={advancedMode}
              name="advancedMode"
              onChange={handleAdvancedModeChange}
            >
              <ToggleButton name="form" value={true}>
                Form
              </ToggleButton>
              <ToggleButton name="json" value={false}>
                Json
              </ToggleButton>
            </ToggleButtonGroup>

            {!advancedMode && (
              <>
                <Editor
                  code={JSON.stringify(content.data)}
                  handleChange={(value) => {
                    content.data = value;
                    setContent({ ...content });
                  }}
                  className="json-editor"
                />

                <LiveEditor className="live-editor" onChange={onLayoutChange} />
                <LiveError className="live-error" />
              </>
            )}
            {advancedMode && (
              <div>
                <ComponentForm
                  valueUpdate={valueUpdate}
                  content={content}
                  setContent={setContent}
                  setPropertyNameToUpdate={setPropertyNameToUpdate}
                />
              </div>
            )}
          </section>
          {!newWindowMode && <LivePreview {...content} />}
        </div>
      </LiveProvider>

      <InputModal
        show={propertyNameToUpdate !== ""}
        onHide={() => setPropertyNameToUpdate("")}
        heading="Change name"
        currentValue={propertyNameToUpdate}
        onValueChange={(value) => {
          content.data[value] = content.data[propertyNameToUpdate];
          delete content.data[propertyNameToUpdate];
          content.layout = content.layout.replace(propertyNameToUpdate, value);
          setContent(content);
        }}
      />
    </div>
  );
};

export { CodeBlock };
