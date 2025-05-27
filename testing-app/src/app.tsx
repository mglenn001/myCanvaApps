import { Button, Rows, Text } from "@canva/app-ui-kit";
import { requestOpenExternalUrl } from "@canva/platform";
import { FormattedMessage, useIntl } from "react-intl";
import * as styles from "styles/components.css";
import { useAddElement } from "utils/use_add_element";
import { upload } from "@canva/asset";
import { addElementAtPoint } from "@canva/design";
import { AppElementOptions, initAppElement } from "@canva/design";
import { requestExport } from "@canva/design";
import { useFeatureSupport } from "utils/use_feature_support";
import { editContent } from "@canva/design";
import { FileInput, FileInputItem } from "@canva/app-ui-kit";
import React from "react";

export const DOCS_URL = "https://www.canva.dev/docs/apps/";

type AppElementData = {
  color1: string;
  color2: string;
};

type AppElementChangeEvent = {
  data: AppElementData;
  update?: (opts: AppElementOptions<AppElementData>) => Promise<void>;
};

const appElementClient = initAppElement<AppElementData>({
  render: (data) => {
    const dataUrl = createGradient(data.color1, data.color2);
    return [
      {
        type: "image",
        dataUrl,
        width: 640,
        height: 360,
        top: 0,
        left: 0,
        altText: {
          text: "A gradient background",
          decorative: false,
        },
      },
    ];
  },
});

export const App = () => {
  const addElement = useAddElement();

  const isSupported = useFeatureSupport();

  const onClick = () => {
    addElement({
      type: "text",
      children: ["Hello world!"],
    });
  };

  const openExternalUrl = async (url: string) => {
    const response = await requestOpenExternalUrl({
      url,
    });

    if (response.status === "aborted") {
      // user decided not to navigate to the link
    }
  };

  const intl = useIntl();

  async function handleImageUpload() {
    // Upload an image
    const result = await upload({
      type: "image",
      mimeType: "image/jpeg",
      url: "https://www.canva.dev/example-assets/image-import/image.jpg",
      thumbnailUrl:
        "https://www.canva.dev/example-assets/image-import/thumbnail.jpg",
      aiDisclosure: "none",
    });

    // Add the image to the design
    await addElementAtPoint({
      type: "image",
      ref: result.ref,
      altText: {
        text: "Example image",
        decorative: false
      },
    });
  }

  async function handleVideoUpload() {
    // Upload a video file
    const result = await upload({
      type: "video",
      mimeType: "video/mp4",
      url: "https://www.canva.dev/example-assets/video-import/video.mp4",
      thumbnailImageUrl:
        "https://www.canva.dev/example-assets/video-import/thumbnail-image.jpg",
      thumbnailVideoUrl:
        "https://www.canva.dev/example-assets/video-import/thumbnail-video.mp4",
      aiDisclosure: "none",
    });

    // Add the video to the design
    await addElementAtPoint({
      type: "video",
      ref: result.ref,
      altText: {
        text: "Video description for accessibility",
        decorative: false
      },
    });
  }

  async function handleEmbedVideo() {
    await addElementAtPoint({
      type: "embed",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  }

  async function handleExport() {
    const result = await requestExport({
      acceptedFileTypes: ["jpg", "png"],
    });
    if (isSupported(requestExport)) {
      console.log(result);
    }
  }

  async function handleQuerying() {
    // Read and edit richtext content on current page
    await editContent(
      {
        contentType: "richtext",
        target: "current_page",
      },
      async (session) => {
        // Loop through each content item
        for (const content of session.contents) {
          // Get the richtext content as plaintext
          const plaintext = content.readPlaintext();

          // Format the richtext
          content.formatParagraph(
            { index: 0, length: plaintext.length },
            { fontWeight: "bold"}
          );
        }

        // Sync the content so that it's reflected in the design
        await session.sync();
      }
    );
  }

  const [state, setState] = React.useState<AppElementChangeEvent>({
    data: {
      color1: "",
      color2: "",
    },
  });

  React.useEffect(() => {
    appElementClient.registerOnElementChange((element) => {
      if (element) {
        setState({
          data: {
            color1: element.data.color1,
            color2: element.data.color2,
          },
          update: element.update,
        });
      } else {
        setState({
          data: {
            color1: "",
            color2: "",
          },
        });
      }
    });
  }, []);

  function handleGradientSubmit() {
    if (state.update) {
      state.update({
        data: state.data,
      });
    } else {
      appElementClient.addElement({
        data: state.data,
      });
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setState((prevState) => {
      return {
        ...prevState,
        data: {
          ...prevState.data,
          [event.target.name]: event.target.value,
        },
      };
    });
  }

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
        <Button variant="secondary" onClick={() => openExternalUrl(DOCS_URL)}>
          {intl.formatMessage({
            defaultMessage: "Open Canva Apps SDK docs",
            description:
              "Button text to open Canva Apps SDK docs. Opens an external URL when pressed.",
          })}
        </Button>
        <Button variant="secondary" onClick={handleImageUpload} stretch>
          {intl.formatMessage({
            defaultMessage: "Add image to design",
            description:
              "Button text to add image from external UR. Opens an external URL when pressed.",
          })}
        </Button>
        <Button variant="secondary" onClick={handleVideoUpload} stretch>
          {intl.formatMessage({
            defaultMessage: "Add video to design",
            description:
              "Button text to add video from external URL. Uploads and adds a video when pressed.",
          })}
        </Button>
        <Button variant="secondary" onClick={handleEmbedVideo} stretch>
          {intl.formatMessage({
            defaultMessage: "Add embed video to design",
            description:
              "Button text to add embed video from external URL. Uploads and adds an embed video when pressed.",
          })}
        </Button>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={!isSupported(requestExport)}
          >
            Export design
        </Button>
        <Button variant="primary" onClick={handleQuerying}>
          Update richtext content
        </Button>
        <div>
          <input
            type="text"
            name="color1"
            value={state.data.color1}
            placeholder="Color #1"
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="color2"
            value={state.data.color2}
            placeholder="Color #2"
            onChange={handleChange}
          />
        </div>
        <Button variant="secondary" onClick={handleGradientSubmit} stretch>
          { state.update ? 
            intl.formatMessage({
              defaultMessage: "Update gradient",
              description: "Button text to update existing gradient element."
            }) :
            intl.formatMessage({
              defaultMessage: "Add gradient",
              description: "Button text to add new gradient element."
            })
          }
        </Button>
        <FileInput
          multiple
          onDropAcceptedFiles={() => {}}
          stretchButton
        />
        <FileInputItem
          label="exampleFile1.txt"
          onDeleteClick={() => {}}
        />
        <FileInputItem
          label="exampleFile2.txt"
          onDeleteClick={() => {}}
        />
      </Rows>
    </div>
  );
};

function createGradient(color1: string, color2: string): string {
  const canvas = document.createElement("canvas");

  canvas.width = 640;
  canvas.height = 360;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Can't get CanvasRenderingContext2D");
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}