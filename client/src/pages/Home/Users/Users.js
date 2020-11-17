import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Col, Image } from "react-bootstrap";
import classNames from "classnames";

import { useMessageDispatch, useMessageState } from "../../../context/message";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      letestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

const Users = () => {
  const userImage = localStorage.getItem("user-image");
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const selectedUser = users?.find((u) => u.selected === true)?.username;
  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),
    onError: (err) => console.log(err),
  });

  let userMarkup;
  if (!users || loading) {
    userMarkup = <p>Loading...</p>;
  } else if (users.length === 0) {
    userMarkup = <p>No User have Joined yet</p>;
  } else if (users.length > 0) {
    userMarkup = users.map((user) => {
      const selected = selectedUser === user.username;
      return (
        <div
          role="button"
          className={classNames(
            "user-div d-flex justify-content-center justify-content-md-start p-3",
            {
              "bg-white": selected,
            }
          )}
          key={user.username}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.username })
          }
        >
          <Image
            src={
              user.imageUrl ===
              "https://secure.gravatar.com/avatar/aed14bfd0fa698f3ab4238f5c6feae88?s=60&d=mm&r=g"
                ? userImage
                : user.imageUrl
            }
            className="user-image"
          />
          <div className="d-none d-md-block ml-2">
            <p className="text-success">{user.username}</p>
            <p className="font-weight-light">
              {user.letestMessage
                ? user.letestMessage.content
                : "You are now connected!"}
            </p>
          </div>
        </div>
      );
    });
  }
  return (
    <Col xs={2} md={4} className="p-0 bg-secondary">
      {userMarkup}
    </Col>
  );
};

export default Users;
