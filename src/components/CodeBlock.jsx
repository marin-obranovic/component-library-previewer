/* eslint react/jsx-key: 0 */

import React, { useEffect, useState } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { mdx } from "@mdx-js/react";
import * as missguidedComponents from "missguided-components";
import { Container, Row, Col } from "react-bootstrap";
// import ReactJson from "react-json-view";
import { inlineContent } from "cms-javascript-sdk";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { init } from "dc-extensions-sdk";

import "./CodeBlock.css";

const CodeBlock = ({ live }) => {
  const [isSDK, setIsSDK] = useState(false);
  const [sdk, setSDK] = useState(undefined);
  const [content, setContent] = useState({ data: {}, layout: "" });
  const [amplienceId, setAmplienceId] = useState("");

  const onAmplienceIdChange = (event) => {
    setAmplienceId(event.target.value);
    console.log("event:", event.target);
  };

  const getAmplienceData = () => {
    if (!amplienceId) {
      console.log("missing amplience id");
    }

    fetch(
      `https://cdn.c1.amplience.net/cms/content/query?query=%7B%22sys.iri%22%3A%22http%3A%2F%2Fcontent.cms.amplience.com%2F${amplienceId}%22%7D&scope=tree&store=missguided`
      // `https://services-cms1.mgnonprod.co.uk/content/slot/${amplienceId}/content?format=json`
      // `https://services.missguided.com/content/slot/${amplienceId}/content?format=json`
    )
      .then((data) => data.json())
      .then((data) => {
        console.log("amplience data:", inlineContent(data));
        const inlinedContent = inlineContent(data);
        setContent(JSON.parse(inlinedContent[0]));
      });
  };

  useEffect(() => {
    init()
      .then((sdk) => {
        // output available locales
        setIsSDK(true);
        console.log("sdk thingy", sdk);
        sdk.frame.setHeight(1200);
        setSDK(sdk);
        sdk.field.getValue().then((data) => {
          console.log("field data:", data, typeof data);
          setContent(JSON.parse(data));
        });
      })
      .catch((err) => {
        console.log("error sdk", err);
      });
  }, []);

  {
    /* <Container fluid>
      <Row>
        <PageTitle text={"Discount codes"} alignment={"center"} />
      </Row>
      <Row>
        <Col md={6}>
            <DiscountBoxes {...content} />
        </Col>
        <Col md={6}>
          <TextBlock
            bold={true}
            alignment={"left"}
            text="Simply copy the code you want to apply and enter it at checkout..."
          />
          <TextBlock text="When you’re skint, you’ve gotta get the most out of your money, right? We know that even we can be a bit out of budget on the wrong side of the month but Missguided’s discount codes mean you can stock up on all your favourite pieces without breaking the bank." />
          <TextBlock text="Wanna know our latest delivery offers and promo codes?  Well, you’ve come to the right place and with brand new pieces hitting the site every single day, you can add swag to bag for a bit less cash money." />
          <TextBlock text="Keep checkin’ back and we will keep you up-to-date with the newest voucher codes so you can get the clothes you need even when you’re broke AF." />
        </Col>
      </Row>
    </Container> */
  }

  // const onEditJson = (event) => {
  //   console.log("on edit:", event);
  //   // setContent(event.new_value);
  // };

  // const onAddJson = (event) => {
  //   console.log("on add:", event);
  //   // setContent(event.new_value);
  // };

  // const onDeleteJson = (event) => {
  //   console.log("on delete:", event);
  //   // if (event.new_value === undefined) {
  //   //   setContent({});
  //   // } else {
  //   //   setContent(event.new_value);
  //   // }
  // };

  const onJsonEdit = (event) => {
    console.log(event);

    if (event.error) {
      return;
    }

    // setContent(event.jsObject);
    setContent({ data: event.jsObject, layout: content.layout });
    if (isSDK) {
      sdk.field.setValue(JSON.stringify(content));
    }
  };

  const onLayoutChange = (event) => {
    console.log("on layout change:", event);
    setContent({ ...content, layout: event });
  };

  const saveToAmplience = () => {
    if (isSDK) {
      sdk.field.setValue(JSON.stringify(content));
    }
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
                {!isSDK && (
                  <Row className="button-container">
                    <Col>
                      <input
                        type="text"
                        placeholder="Amplience content ID"
                        value={amplienceId}
                        onChange={onAmplienceIdChange}
                      />
                      <button onClick={getAmplienceData}>
                        Get amplience data
                      </button>
                    </Col>
                  </Row>
                )}
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
                    <div className="react-json-container">
                      <JSONInput
                        id="a_unique_id"
                        placeholder={content.data}
                        theme="dark_vscode_tribute"
                        locale={locale}
                        height="550px"
                        width="100%"
                        onChange={onJsonEdit}
                      />

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
