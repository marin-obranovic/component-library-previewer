import { LiveProvider, LivePreview as ReactLivePreview } from "react-live";
import { mdx } from "@mdx-js/react";
import * as missguidedComponents from "missguided-components";
import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";

export const LivePreview = ({ layout, data, separateMode = false }) => {
  const [content, setContent] = useState({ layout: "", data: {} });

  useEffect(() => {
    if (separateMode) {
      window.addEventListener(
        "message",
        (event) => {
          console.log("message event:", event);
          if (
            event.data.hasOwnProperty("layout") &&
            event.data.hasOwnProperty("data")
          ) {
            setContent(event.data);
          }
        },
        false
      );
    }
  }, []);

  useEffect(() => {
    setContent({ layout, data });
  }, [layout, data]);

  return (
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
      <ReactLivePreview className="live-preview" />
    </LiveProvider>
  );
};
