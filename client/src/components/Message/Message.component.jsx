import React, { useState } from "react";
import classNames from "classnames";
import { useAuthState } from "../../context/auth";
import { Button, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import moment from "moment";
import { gql, useMutation } from "@apollo/client";

const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content: String!) {
    reactToMessage(uuid: $uuid, content: $content) {
      uuid
    }
  }
`;

const Message = ({ message }) => {
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const recived = !sent;
  const [showPopOver, setShowPopOver] = useState(false);
  const reactionIcons = [...new Set(message.reactions.map((r) => r.content))];

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowPopOver(false),
  });

  const react = (reaction) => {
    console.log(reaction);
    reactToMessage({ variables: { uuid: message.uuid, content: reaction } });
  };

  const reactButton = (
    <OverlayTrigger
      trigger="click"
      placement="top"
      show={showPopOver}
      onToggle={setShowPopOver}
      transition={false}
      rootClose
      overlay={
        <Popover className="rounded-pill">
          <Popover.Content className="d-flex px-0 py-1 align-items-center react-icon-popover">
            {reactions.map((reaction) => (
              <Button
                variant="link"
                className="react-icon-button"
                key={reaction}
                onClick={() => react(reaction)}
              >
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }
    >
      <Button variant="link" className="px-2">
        <i className="far fa-smile"></i>
      </Button>
    </OverlayTrigger>
  );
  return (
    <div
      className={classNames("d-flex my-3", {
        "ml-auto": sent,
        "mr-auto": recived,
      })}
    >
      {sent && reactButton}
      <OverlayTrigger
        placement={sent ? "left" : "right"}
        transition={false}
        overlay={
          <Tooltip>
            {moment(message.createdAt).format("MMMM DD, YYYY @ h:mm a")}
          </Tooltip>
        }
      >
        <div
          className={classNames("py-2 px-3 rounded-pill position-relative", {
            "bg-primary": sent,
            "bg-secondary": recived,
          })}
        >
          {message.reactions.length > 0 && (
            <div className="react-div bg-secondary p-1 rounded-pill">
              {reactionIcons} {message.reactions.length}
            </div>
          )}
          <p className={classNames({ "text-white": sent })}>
            {message.content}
          </p>
        </div>
      </OverlayTrigger>
      {recived && reactButton}
    </div>
  );
};

export default Message;
