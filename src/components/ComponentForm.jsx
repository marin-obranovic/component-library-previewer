import { Form, Card } from "react-bootstrap";
import ComponentLibraryDescription from "missguided-components/dist/form/information.json";
import ComponentLibraryEnums from "missguided-components/dist/enum/enum.json";
import Accordion from "react-bootstrap/Accordion";

export const ComponentForm = ({ valueUpdate, content, setContent }) => {
  return (
    <Accordion>
      {Object.keys(content.data).map((componentName, index) => {
        const componentDescription =
          ComponentLibraryDescription[
            content.data[componentName].componentType
          ];

        if (!componentDescription) {
          return null;
        }

        return (
          <Card key={`card=${index}`} eventKey={index + 1}>
            <Card.Header>
              <Accordion.Toggle
                as={Card.Header}
                variant="link"
                eventKey={index + 1}
              >
                {componentName}
              </Accordion.Toggle>
            </Card.Header>

            <Accordion.Collapse eventKey={index + 1}>
              <Card.Body>
                <Form>
                  {Object.keys(componentDescription).map(
                    (descriptionKey, formElementIndex) => {
                      switch (componentDescription[descriptionKey]) {
                        case "string":
                          return (
                            <StringInput
                              componentName={componentName}
                              descriptionKey={descriptionKey}
                              formElementIndex={formElementIndex}
                              content={content}
                              setContent={setContent}
                              valueUpdate={valueUpdate}
                            />
                          );
                        case "boolean":
                          return (
                            <BooleanInput
                              formElementIndex={formElementIndex}
                              componentName={componentName}
                              descriptionKey={descriptionKey}
                              content={content}
                              setContent={setContent}
                              componentDescription={componentDescription}
                            />
                          );
                        default:
                          if (
                            ComponentLibraryEnums[
                              componentDescription[descriptionKey]
                            ]
                          ) {
                            return (
                              <EnumInput
                                formElementIndex={formElementIndex}
                                componentName={componentName}
                                descriptionKey={descriptionKey}
                                content={content}
                                setContent={setContent}
                                componentDescription={componentDescription}
                              />
                            );
                          }
                          break;
                      }
                    }
                  )}
                </Form>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        );
      })}
    </Accordion>
  );
};

const StringInput = ({
  componentName,
  descriptionKey,
  formElementIndex,
  content,
  setContent,
  valueUpdate,
}) => {
  return (
    <Form.Group
      className="mb-3"
      key={`element-text-${formElementIndex}`}
      controlId={`${componentName}-${descriptionKey}-form`}
    >
      <Form.Label>{descriptionKey}</Form.Label>
      {descriptionKey.indexOf("Color") > -1 ||
      descriptionKey.indexOf("Colour") > -1 ? (
        <Form.Control
          type="color"
          defaultValue="#000000"
          value={content.data[componentName][descriptionKey]}
          onChange={(event) => {
            valueUpdate.next({
              content,
              setContent,
              value: event.nativeEvent.target.value,
              descriptionKey,
              componentName,
            });
          }}
          title="Choose your color"
        />
      ) : (
        <Form.Control
          type="text"
          value={content.data[componentName][descriptionKey]}
          onChange={(event) => {
            content.data[componentName][descriptionKey] =
              event.nativeEvent.target.value;
            setContent({ ...content });
          }}
        />
      )}
    </Form.Group>
  );
};

const EnumInput = ({
  formElementIndex,
  componentName,
  descriptionKey,
  content,
  setContent,
  componentDescription,
}) => {
  return (
    <Form.Group
      className="mb-3"
      key={`element-text-${formElementIndex}`}
      controlId={`${componentName}-${descriptionKey}-form`}
    >
      <Form.Label
        className="me-sm-2"
        htmlFor="inlineFormCustomSelect"
        visuallyHidden
      >
        {descriptionKey}
      </Form.Label>
      <Form.Control
        as="select"
        className="me-sm-2"
        id="inlineFormCustomSelect"
        onChange={(event) => {
          const selectedValue =
            event.nativeEvent.target.options[
              event.nativeEvent.target.options.selectedIndex
            ].value;
          content.data[componentName][descriptionKey] = selectedValue;
          setContent({ ...content });
        }}
      >
        {Object.keys(
          ComponentLibraryEnums[componentDescription[descriptionKey]]
        ).map((item) => {
          return (
            <option
              value={
                ComponentLibraryEnums[componentDescription[descriptionKey]][
                  item
                ]
              }
            >
              {item}
            </option>
          );
        })}
      </Form.Control>
    </Form.Group>
  );
};

const BooleanInput = ({
  componentName,
  formElementIndex,
  descriptionKey,
  content,
  setContent,
}) => {
  return (
    <Form.Group
      key={`element-text-${formElementIndex}`}
      id={`${componentName}-${descriptionKey}-form`}
    >
      <Form.Check
        type="checkbox"
        label={descriptionKey}
        checked={content.data[componentName][descriptionKey]}
        onChange={(event) => {
          content.data[componentName][descriptionKey] =
            event.nativeEvent.target.checked;
          setContent({ ...content });
        }}
      />
    </Form.Group>
  );
};
