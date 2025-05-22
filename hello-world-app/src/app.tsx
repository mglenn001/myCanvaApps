import { Button, Rows, Text, PaintRollerIcon } from "@canva/app-ui-kit";
import { requestOpenExternalUrl } from "@canva/platform";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { useAddElement } from "utils/use_add_element";
import { editContent } from "@canva/design";

export const DOCS_URL = "https://www.canva.dev/docs/apps/";

export const App = () => {
  const addElement = useAddElement();

  const onClick = () => {
    addElement({
      type: "text",
      children: ["Hello world!"],
    });
  };

  async function editOnClick() {
    await editContent(
      {
        contentType: "richtext",
        target: "current_page"
      },
      async (session) => {
        for (const content of session.contents) {
          const plaintext = content.readPlaintext();

          content.formatParagraph(
            { index: 0,
              length: plaintext.length
            },
            { fontWeight: "bold",
              fontSize: 30,
              color: "#008008"
             }
          );
        }
        await session.sync();
      }
    );
  }

  const openExternalUrl = async (url: string) => {
    const response = await requestOpenExternalUrl({
      url,
    });

    if (response.status === "aborted") {
      // user decided not to navigate to the link
    }
  };

  const intl = useIntl();

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          <FormattedMessage
            defaultMessage="
              To make changes to this app, edit the <code>src/app.tsx</code> file,
              then close and reopen the app in the editor to preview the changes.
            "
            description="Instructions for how to make changes to the app. Do not translate <code>src/app.tsx</code>."
            values={{
              code: (chunks) => <code>{chunks}</code>,
            }}
          />
        </Text>
        <Button variant="primary" onClick={onClick} stretch>
          {intl.formatMessage({
            defaultMessage: "Do something cool",
            description:
              "Button text to do something cool. Creates a new text element when pressed.",
          })}
        </Button>
        <Button variant="secondary" onClick={editOnClick} icon={(() => <PaintRollerIcon />)} stretch>
          {intl.formatMessage({
            defaultMessage: "Change the content",
            description: "Change the color and size of text content in the design when pressed.",
          })}
        </Button>
        <Button variant="secondary" onClick={() => openExternalUrl(DOCS_URL)}>
          {intl.formatMessage({
            defaultMessage: "Open Canva Apps SDK docs",
            description:
              "Button text to open Canva Apps SDK docs. Opens an external URL when pressed.",
          })}
        </Button>
      </Rows>
    </div>
  );
};
