import React from "react";
import { Container, baseStyles } from "unified-ui";
import { CodeBlock } from "./CodeBlock";
import "./Layout.css"

const Style = ({ children }) => (
  <style
    dangerouslySetInnerHTML={{
      __html: children,
    }}
  />
);

const Layout = (props) => (
  <div className="layout-container">
    <Style>{baseStyles}</Style>
    <Container {...props} m="unset" maxWidth="100%" px={0}>
      <CodeBlock live="true" className="" children="" />
    </Container>
  </div>
);

export { Layout };
