import React, { createContext, useReducer, useContext } from "react";

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const messageReducer = (state, action) => {
  let userCopy, userIndex;
  const { username, messages, message, reaction } = action.payload;
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
    case "SET_USER_MESSAGES":
      userCopy = [...state.users];
      userIndex = userCopy.findIndex((u) => u.username === username);

      userCopy[userIndex] = { ...userCopy[userIndex], messages };

      return {
        ...state,
        users: userCopy,
      };
    case "SET_SELECTED_USER":
      userCopy = state.users.map((user) => ({
        ...user,
        selected: user.username === action.payload,
      }));

      return {
        ...state,
        users: userCopy,
      };
    case "ADD_MESSAGE":
      userCopy = [...state.users];
      userIndex = userCopy.findIndex((u) => u.username === username);

      message.reactions = [];

      let newUser = {
        ...userCopy[userIndex],
        messages: userCopy[userIndex].messages
          ? [message, ...userCopy[userIndex].messages]
          : null,
        letestMessage: message,
      };

      userCopy[userIndex] = newUser;

      return {
        ...state,
        users: userCopy,
      };

    case "ADD_REACTION":
      userCopy = [...state.users];
      userIndex = userCopy.findIndex((u) => u.username === username);

      let usersCopy = { ...userCopy[userIndex] };

      const messageIndex = usersCopy.messages?.findIndex(
        (m) => m.uuid === reaction.message.uuid
      );

      if (messageIndex > -1) {
        let messagesCopy = [...usersCopy.messages];

        let reactionsCopy = [...messagesCopy[messageIndex].reactions];

        const reactionIndex = reactionsCopy.findIndex(
          (r) => r.uuid === reaction.uuid
        );

        if (reactionIndex > -1) {
          reactionsCopy[reactionIndex] = reaction;
        } else {
          reactionsCopy = [...reactionsCopy, reaction];
        }

        messagesCopy[messageIndex] = {
          ...messagesCopy[messageIndex],
          reactions: reactionsCopy,
        };

        usersCopy = { ...usersCopy, messages: messagesCopy };
        userCopy[userIndex] = usersCopy;
      }

      return {
        ...state,
        users: userCopy,
      };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, { users: null });
  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  );
};

export const useMessageState = () => useContext(MessageStateContext);
export const useMessageDispatch = () => useContext(MessageDispatchContext);
